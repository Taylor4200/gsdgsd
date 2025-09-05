# Real-Time Chat System

This document explains how to set up and use the real-time chat system for Edge Casino.

## Features

- ✅ **Real-time messaging** - Messages appear instantly using Supabase real-time
- ✅ **User presence** - Shows online user count and tracks user activity
- ✅ **Message moderation** - Built-in ban system and message validation
- ✅ **User levels** - Visual indicators for user levels, VIP status, and moderators
- ✅ **Message history** - Loads recent messages when joining
- ✅ **Character limits** - 500 character limit per message
- ✅ **Responsive design** - Works on desktop and mobile

## Setup Instructions

### 1. Database Setup

Run the database schema to create the necessary tables:

```bash
# If you have the setup script
chmod +x setup-chat.sh
./setup-chat.sh

# Or manually apply the schema
supabase db reset --linked
```

### 2. Environment Variables

Make sure your `.env.local` has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the Application

```bash
npm run dev
```

## How It Works

### Database Schema

The chat system uses three main tables:

- **`chat_messages`** - Stores all chat messages
- **`chat_presence`** - Tracks user online status
- **`chat_bans`** - Manages banned users

### Real-Time Updates

The system uses Supabase's real-time subscriptions to:
- Listen for new messages
- Track user presence changes
- Update online user count

### API Endpoints

- `GET /api/chat` - Get recent messages
- `POST /api/chat` - Send a message
- `GET /api/chat/presence` - Get online count
- `POST /api/chat/presence` - Update user presence

## Usage

### Basic Chat

```typescript
import { getChatService } from '@/lib/chatService'

const chatService = getChatService({
  userId: user.id,
  username: user.username,
  level: user.level,
  isVip: user.isVip,
  isMod: user.isMod
})

// Connect to chat
await chatService.connect()

// Send a message
await chatService.sendMessage("Hello everyone!")

// Listen for new messages
chatService.onMessage((message) => {
  console.log('New message:', message)
})
```

### Chat Component

The `ChatSidebar` component automatically handles:
- Connection to chat service
- Message display
- User input
- Online count
- Error handling

## Customization

### Message Validation

Edit `src/app/api/chat/route.ts` to add custom validation:

```typescript
// Add custom filters
if (message.includes('spam')) {
  return NextResponse.json({ error: 'Message contains spam' }, { status: 400 })
}
```

### User Permissions

Modify the database policies in `supabase-chat-schema.sql`:

```sql
-- Example: Only allow VIP users to send messages
CREATE POLICY "VIP users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM chat_messages 
      WHERE user_id = auth.uid() 
      AND is_vip = true
    )
  );
```

### Message Types

Add new message types in the database schema:

```sql
-- Add new message type
ALTER TABLE chat_messages 
ADD CONSTRAINT message_type_check 
CHECK (message_type IN ('message', 'system', 'announcement', 'rain', 'bonus'));
```

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only send messages if not banned
- Anyone can read messages
- Only mods can manage bans

### Input Validation

- Message length limit (500 characters)
- SQL injection protection
- XSS prevention through proper escaping

### Rate Limiting

Consider adding rate limiting to prevent spam:

```typescript
// Example rate limiting
const rateLimit = new Map()

if (rateLimit.get(userId) > 10) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

## Troubleshooting

### Common Issues

1. **Messages not appearing**
   - Check Supabase real-time is enabled
   - Verify RLS policies allow reading messages
   - Check browser console for errors

2. **Can't send messages**
   - Verify user is authenticated
   - Check if user is banned
   - Ensure message validation passes

3. **Online count not updating**
   - Check presence subscription is working
   - Verify `update_user_presence` function exists

### Debug Mode

Enable debug logging in `src/lib/chatService.ts`:

```typescript
// Add this to see connection status
console.log('Chat service connected:', chatService.connected)
```

## Production Considerations

### Performance

- Add database indexes for large message volumes
- Implement message pagination
- Consider message archiving for old messages

### Moderation

- Add automated spam detection
- Implement message reporting system
- Add admin dashboard for moderation

### Scaling

- Consider Redis for presence tracking at scale
- Implement message queuing for high volume
- Add CDN for static assets

## Support

For issues or questions about the chat system:
1. Check the browser console for errors
2. Verify Supabase dashboard for database issues
3. Test API endpoints directly with curl/Postman
4. Check network tab for failed requests

