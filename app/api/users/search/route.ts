import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';

export async function GET(request: NextRequest) {
  const authResult = verifyAuthToken(request.headers.get('Authorization'));
  if (!authResult) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const currentUserId = authResult.userId;

  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('query');

  if (!searchQuery || searchQuery.trim().length < 1) { // Require at least 1 char for search
    return NextResponse.json({ success: true, users: [] }); // Return empty if query is too short or empty
  }

  try {
    // Search by first_name, last_name.
    // Concatenate first_name and last_name to search full name.
    // Exclude the current user from search results.
    const sqlQuery = `
      SELECT id, first_name, last_name, avatar_url
      FROM profiles
      WHERE
        (
          LOWER(first_name) LIKE LOWER($1) OR
          LOWER(last_name) LIKE LOWER($1) OR
          LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER($1)
        )
        AND id != $2
      LIMIT 10; -- Limit results for performance
    `;
    // Using $1 for the search query parameter, $2 for currentUserId
    const result = await query(sqlQuery, [`%${searchQuery}%`, currentUserId]);

    const users = result.rows.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim()
    }));

    return NextResponse.json({ success: true, users: users });

  } catch (error: any) {
    console.error('Error searching users:', error);
    return NextResponse.json({ success: false, message: 'Failed to search users', error: error.message }, { status: 500 });
  }
}
