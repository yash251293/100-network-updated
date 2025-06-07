import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';

const routeParamsSchema = z.object({
  conversationId: z.string().uuid({ message: "Invalid conversation ID format" }),
});

const createMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty."),
  // contentType: z.enum(['text', 'image', 'file']).default('text'), // Future: for different message types
});

// Helper to check if user is a participant
async function isUserParticipant(userId: string, conversationId: string): Promise<boolean> {
  const result = await query(
    "SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
    [conversationId, userId]
  );
  return result.rows.length > 0;
}

// POST Handler: Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const authResult = verifyAuthToken(request.headers.get('Authorization'));
  if (!authResult) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const currentUserId = authResult.userId;

  // Await params for Next.js 15+ compatibility
  const awaitedParams = await params;
  const paramsValidation = routeParamsSchema.safeParse(awaitedParams);
  if (!paramsValidation.success) {
    return NextResponse.json({ success: false, message: 'Invalid conversation ID format', errors: paramsValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const { conversationId } = paramsValidation.data;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const messageValidation = createMessageSchema.safeParse(body);
  if (!messageValidation.success) {
    return NextResponse.json({ success: false, message: 'Invalid message data', errors: messageValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const { content } = messageValidation.data;

  try {
    if (!(await isUserParticipant(currentUserId, conversationId))) {
      return NextResponse.json({ success: false, message: 'Forbidden: You are not a participant in this conversation.' }, { status: 403 });
    }

    await query('BEGIN');

    const messageRes = await query(
      "INSERT INTO messages (conversation_id, sender_id, content_type, content) VALUES ($1, $2, $3, $4) RETURNING id, conversation_id, sender_id, content_type, content, created_at, status",
      [conversationId, currentUserId, 'text', content]
    );
    const newMessage = messageRes.rows[0];

    await query(
      "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [conversationId]
    );

    await query('COMMIT');

    // Fetch sender details to include in the response for immediate UI update
    const senderProfileRes = await query("SELECT id, first_name, last_name, avatar_url FROM profiles WHERE id = $1", [currentUserId]);
    const senderProfile = senderProfileRes.rows[0] || { first_name: 'Unknown', last_name: 'User', avatar_url: null };

    const fullMessage = {
        ...newMessage,
        sender: {
            id: senderProfile.id,
            firstName: senderProfile.first_name,
            lastName: senderProfile.last_name,
            avatarUrl: senderProfile.avatar_url,
        }
    };

    // TODO: In real-time phase, broadcast this message via WebSockets to other participants
    return NextResponse.json({ success: true, message: 'Message sent.', data: fullMessage }, { status: 201 });

  } catch (error: any) {
    await query('ROLLBACK');
    console.error(`Error sending message to conversation ${conversationId}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to send message.', error: error.message }, { status: 500 });
  }
}

// GET Handler: Fetch messages for a conversation (paginated)
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const authResult = verifyAuthToken(request.headers.get('Authorization'));
  if (!authResult) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const currentUserId = authResult.userId;

  // Await params for Next.js 15+ compatibility
  const awaitedParams = await params;
  const paramsValidation = routeParamsSchema.safeParse(awaitedParams);
  if (!paramsValidation.success) {
    return NextResponse.json({ success: false, message: 'Invalid conversation ID format', errors: paramsValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const { conversationId } = paramsValidation.data;

  // Pagination parameters
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json({ success: false, message: 'Invalid pagination parameters.' }, { status: 400 });
  }

  try {
    if (!(await isUserParticipant(currentUserId, conversationId))) {
      return NextResponse.json({ success: false, message: 'Forbidden: You are not a participant in this conversation.' }, { status: 403 });
    }

    const messagesQuery = `
      SELECT
          m.id,
          m.conversation_id,
          m.sender_id,
          m.content_type,
          m.content,
          m.created_at,
          m.status,
          p.first_name AS sender_first_name,
          p.last_name AS sender_last_name,
          p.avatar_url AS sender_avatar_url
      FROM messages m
      LEFT JOIN profiles p ON m.sender_id = p.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at DESC -- Fetch newest first for typical infinite scroll, then reverse on client if needed, or fetch ASC
      LIMIT $2
      OFFSET $3;
    `;
    // Note: For chat UIs that load older messages as you scroll up, fetching DESC and then reversing on client,
    // or using cursor-based pagination with created_at < cursor_timestamp ORDER BY created_at DESC is common.
    // Here, simple limit/offset with DESC is used. Client might need to reverse for display.

    const messagesResult = await query(messagesQuery, [conversationId, limit, offset]);

    const messages = messagesResult.rows.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      sender: {
        id: msg.sender_id,
        firstName: msg.sender_first_name,
        lastName: msg.sender_last_name,
        avatarUrl: msg.sender_avatar_url,
      },
      contentType: msg.content_type,
      content: msg.content,
      createdAt: msg.created_at,
      status: msg.status,
    }));

    // For typical chat display (oldest at top, newest at bottom), reverse the array if fetched DESC.
    // Or, fetch ASC initially if that's preferred.
    // For this implementation, we'll return them as fetched (newest first due to DESC).
    // Client can .reverse() if needed.

    // Get total message count for pagination metadata
    const totalMessagesResult = await query("SELECT COUNT(*) FROM messages WHERE conversation_id = $1", [conversationId]);
    const totalMessages = parseInt(totalMessagesResult.rows[0].count, 10);

    // Update last_read_at for the current user in this conversation (fire and forget, not critical for response)
    query(
        "UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND user_id = $2",
        [conversationId, currentUserId]
    ).catch(err => console.error("Failed to update last_read_at:", err));


    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        limit,
        offset,
        total: totalMessages,
        hasMore: (offset + messages.length) < totalMessages
      }
    });

  } catch (error: any) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to fetch messages.', error: error.message }, { status: 500 });
  }
}
