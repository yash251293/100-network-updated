import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';

// Zod Schema for POST request body
const createConversationSchema = z.object({
  type: z.enum(['one_on_one', 'group']),
  userIds: z.array(z.string().uuid()).min(1, "User IDs are required."),
  groupName: z.string().min(1).optional(),
}).refine(data => {
  if (data.type === 'group' && (!data.groupName || data.groupName.trim() === '')) {
    return false; // groupName is required and must be non-empty for group chats
  }
  if (data.type === 'one_on_one' && data.userIds.length !== 1) {
    return false; // For one_on_one, userIds should contain exactly one ID (the other participant)
  }
  return true;
}, {
  message: "Invalid input: For group chats, groupName is required. For one_on_one chats, userIds must contain exactly one ID.",
  path: ['groupName', 'userIds'],
});

interface UserDetails {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

async function fetchUserDetails(userIds: string[]): Promise<UserDetails[]> {
  if (!userIds || userIds.length === 0) return [];
  const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
  const userQuery = `
    SELECT id, first_name, last_name, avatar_url
    FROM profiles
    WHERE id IN (${placeholders})`;
  const result = await query(userQuery, userIds);
  return result.rows.map(r => ({
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    avatarUrl: r.avatar_url
  }));
}

export async function POST(request: NextRequest) {
  const authResult = verifyAuthToken(request.headers.get('Authorization'));
  if (!authResult) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const currentUserId = authResult.userId;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = createConversationSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, message: 'Invalid request data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { type, userIds, groupName } = validation.data;

  try {
    await query('BEGIN');

    if (type === 'one_on_one') {
      const otherUserId = userIds[0];
      if (otherUserId === currentUserId) {
        await query('ROLLBACK');
        return NextResponse.json({ success: false, message: 'Cannot start a conversation with yourself.' }, { status: 400 });
      }

      // Check if a 1-on-1 conversation already exists
      const existingConversationQuery = `
        SELECT cp1.conversation_id
        FROM conversation_participants cp1
        JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
        JOIN conversations c ON cp1.conversation_id = c.id
        WHERE cp1.user_id = $1 AND cp2.user_id = $2 AND c.type = 'one_on_one'
      `;
      const existingResult = await query(existingConversationQuery, [currentUserId, otherUserId]);

      if (existingResult.rows.length > 0) {
        const conversationId = existingResult.rows[0].conversation_id;
        const participantsDetails = await fetchUserDetails([currentUserId, otherUserId]);
        await query('ROLLBACK'); // No changes made, but good practice
        return NextResponse.json({
          success: true,
          message: 'Conversation already exists.',
          conversation: { id: conversationId, type: 'one_on_one', participants: participantsDetails, name: null, avatar_url: null }
        });
      }

      // Create new 1-on-1 conversation
      const conversationRes = await query(
        "INSERT INTO conversations (type, updated_at) VALUES ($1, CURRENT_TIMESTAMP) RETURNING id, type, created_at, updated_at",
        ['one_on_one']
      );
      const conversation = conversationRes.rows[0];

      await query(
        "INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)",
        [conversation.id, currentUserId, otherUserId]
      );

      const participantsDetails = await fetchUserDetails([currentUserId, otherUserId]);
      const finalConversation = { ...conversation, name: null, avatar_url: null, participants: participantsDetails };

      await query('COMMIT');
      return NextResponse.json({ success: true, message: 'Conversation created.', conversation: finalConversation }, { status: 201 });

    } else { // type === 'group'
      const groupCreatorId = currentUserId;
      const allParticipantIds = Array.from(new Set([...userIds, groupCreatorId])); // Ensure creator is included

      if (allParticipantIds.length < 2) { // Technically a group should have at least 2, but often means creator + 1 other
        await query('ROLLBACK');
        return NextResponse.json({ success: false, message: 'Group chats require at least two distinct participants including the creator.' }, { status: 400 });
      }

      const conversationRes = await query(
        "INSERT INTO conversations (type, name, created_by_user_id, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, type, name, avatar_url, created_by_user_id, created_at, updated_at",
        ['group', groupName, groupCreatorId]
      );
      const conversation = conversationRes.rows[0];

      const participantInsertPromises = allParticipantIds.map(uid => {
        const role = (uid === groupCreatorId) ? 'admin' : 'member';
        return query(
          "INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES ($1, $2, $3)",
          [conversation.id, uid, role]
        );
      });
      await Promise.all(participantInsertPromises);

      const participantsDetails = await fetchUserDetails(allParticipantIds);
      const finalConversation = { ...conversation, participants: participantsDetails };

      await query('COMMIT');
      return NextResponse.json({ success: true, message: 'Group conversation created.', conversation: finalConversation }, { status: 201 });
    }

  } catch (error: any) {
    await query('ROLLBACK');
    console.error('Error creating conversation:', error);
    return NextResponse.json({ success: false, message: 'Failed to create conversation', error: error.message }, { status: 500 });
  }
}

// GET handler
export async function GET(request: NextRequest) {
  const authResult = verifyAuthToken(request.headers.get('Authorization'));
  if (!authResult) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const currentUserId = authResult.userId;

  try {
    const conversationsQuery = `
      SELECT
          c.id,
          c.type,
          c.name AS group_name,
          c.avatar_url AS group_avatar_url,
          c.updated_at,
          (
            SELECT m.content
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) AS last_message_content,
          (
            SELECT m.sender_id
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) AS last_message_sender_id,
          (
            SELECT p_sender.first_name
            FROM messages m_sender
            JOIN profiles p_sender ON m_sender.sender_id = p_sender.id
            WHERE m_sender.conversation_id = c.id
            ORDER BY m_sender.created_at DESC
            LIMIT 1
          ) AS last_message_sender_first_name,
          (
            SELECT m.created_at
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) AS last_message_created_at
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = $1
      ORDER BY c.updated_at DESC;
    `;
    const conversationResult = await query(conversationsQuery, [currentUserId]);
    const conversationsData = conversationResult.rows;

    const enrichedConversations = await Promise.all(
      conversationsData.map(async (conv) => {
        const participantsResult = await query(
          `SELECT user_id FROM conversation_participants WHERE conversation_id = $1`,
          [conv.id]
        );
        const participantUserIds = participantsResult.rows.map(p => p.user_id);
        const participantsDetails = await fetchUserDetails(participantUserIds); // fetchUserDetails is already in the file

        let displayName = conv.group_name;
        let displayAvatar = conv.group_avatar_url;

        if (conv.type === 'one_on_one') {
          const otherParticipant = participantsDetails.find(p => p.id !== currentUserId);
          if (otherParticipant) {
            displayName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() || 'User';
            displayAvatar = otherParticipant.avatarUrl;
          } else {
            displayName = 'Unknown User'; // Should not happen if data is consistent
          }
        }

        // Basic last message object
        let lastMessage = null;
        if (conv.last_message_content) {
            lastMessage = {
                content: conv.last_message_content,
                senderId: conv.last_message_sender_id,
                senderFirstName: conv.last_message_sender_first_name || 'User', // Fallback if sender name not found
                createdAt: conv.last_message_created_at
            };
        }

        return {
          id: conv.id,
          type: conv.type,
          name: displayName, // This will be group name or partner's name
          avatarUrl: displayAvatar, // Group avatar or partner's avatar
          participants: participantsDetails,
          lastMessage: lastMessage,
          updatedAt: conv.updated_at,
        };
      })
    );

    return NextResponse.json({ success: true, conversations: enrichedConversations });

  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch conversations', error: error.message }, { status: 500 });
  }
}
