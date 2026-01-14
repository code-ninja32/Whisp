# Supabase Setup Guide for Whisp

## Step 1: Get Your Supabase API Keys

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (a long string)

## Step 2: Configure Environment Variables

1. Open the file `.env.local` in the root of your project
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://goiumozxkjhasdjevdba.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

Replace:
- `https://goiumozxkjhasdjevdba.supabase.co` with your actual Project URL
- `your-actual-anon-key-here` with your actual anon public key

## Step 3: Create Auto-Initialization Function (ONE TIME SETUP)

**You only need to do this ONCE**. After this, tables will be created automatically when the app starts.

1. Go to your Supabase dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-init-function.sql` file
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)

This creates a database function called `initialize_whisp_schema()` that will automatically:
- Create `users` table - stores user accounts
- Create `thoughts` table - stores anonymous messages
- Create proper indexes for performance
- Set up Row Level Security policies for data access

**Note**: After this one-time setup, the app will automatically create/update tables on every restart!

## Step 4: Test Your App (Tables Created Automatically!)

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open your browser to the URL shown (usually `http://localhost:5173`)

3. Test the flow:
   - Create an account → should save to Supabase
   - Copy your share link
   - Open the share link in a new browser/incognito window
   - Send an anonymous message
   - Go back to your inbox → **you should see the message!**

## Troubleshooting

### Error: "Failed to create account"
- Check that your `.env.local` file has the correct credentials
- Verify the SQL schema was run successfully
- Check browser console for error messages

### Error: "Failed to send message"
- Verify the `thoughts` table exists in Supabase
- Check that RLS policies are enabled
- Look at the browser console for specific errors

### Messages not appearing
- Refresh the inbox page
- Check the **Table Editor** in Supabase to see if data is being saved
- Verify the user_id in the share link matches the user_id in the database

## Important Notes

- **User sessions**: User info is still stored in localStorage for session management
- **Messages**: All messages are now stored in Supabase and shared across devices
- **Security**: Row Level Security (RLS) is enabled with public read/write policies
- **Privacy**: Messages are truly anonymous - no sender information is stored

## What's Different Now?

### Before (localStorage):
- User A sends message → saved in User B's browser localStorage
- User A never sees the message ❌

### After (Supabase):
- User A sends message → saved in Supabase database
- User B sees message on ANY device ✅
- Messages are truly delivered!
