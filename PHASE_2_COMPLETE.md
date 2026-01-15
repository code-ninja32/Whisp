# 🎨 Phase 2 Complete: Canvas Room Architecture

## ✅ What's Been Built

### 1. **Complete Database Schema** (`supabase-canvas-schema.sql`)

New Tables:
- `canvases` - Canvas rooms with starter prompts and modes
- `canvas_participants` - Users per canvas with unique usernames
- `canvas_messages` - Public anonymous messages
- `votes` - Upvotes/downvotes with auto-computed totals
- `whispers` - Private messages (ready for Phase 3)

Features:
- Row Level Security (RLS) policies
- Automatic vote counting triggers
- Popular users view (aggregated stats)
- 7-day canvas expiration

### 2. **TypeScript Type System** (`src/types/canvas.ts`)
Complete type definitions for:
- Canvas, CanvasParticipant, CanvasMessage
- Vote, Whisper, PopularUser
- Session management types

### 3. **Canvas Service Layer** (`src/services/canvasService.ts`)
Comprehensive API for:
- Canvas CRUD operations
- Username validation & participant management
- Message posting & retrieval
- Voting system with optimistic updates
- Whisper sending/receiving (ready)
- Popular users queries
- Realtime subscriptions

### 4. **UI Components**

#### `UsernameGate` (`src/components/UsernameGate.tsx`)
- Fullscreen gate before entering canvas
- Username validation (3-20 chars, unique per canvas)
- Mode-aware styling (Normal vs Roast)
- Session persistence in localStorage

#### `CanvasRoom` (`src/pages/CanvasRoom.tsx`)
- Main canvas experience
- Displays starter prompt
- Real-time message feed with floating cards
- Voting system with optimistic UI
- Post new messages
- Organic, artistic layout

#### `CreateCanvas` (`src/pages/CreateCanvas.tsx`)
- Canvas creation flow
- Mode selector (Normal/Roast)
- Random starter prompts
- User-friendly form

### 5. **Routing**
- `/` - Create new canvas (main entry point)
- `/canvas/:canvasId` - Canvas room with username gate
- `/demo` - UI showcase
- Old routes preserved for backward compatibility

---

## 🚀 How to Set Up & Test

### Step 1: Run the Database Migration

1. Go to Supabase Dashboard: https://app.supabase.com
2. Open **SQL Editor**
3. Copy all contents from `supabase-canvas-schema.sql`
4. Paste and click **Run**
5. Wait for "Success" message

This creates all tables, indexes, RLS policies, and triggers.

### Step 2: Start the Dev Server

```bash
npm run dev
```

### Step 3: Test the Flow

1. **Create a Canvas**
   - Visit `http://localhost:5173/`
   - Choose your username
   - Select Normal or Roast mode
   - Add a starter prompt (or use random)
   - Click "Create Canvas"

2. **Join as Different Users**
   - Copy the canvas URL
   - Open in incognito/different browser
   - Enter a different username
   - Post messages and vote!

3. **Test Realtime**
   - Open canvas in multiple tabs
   - Post a message in one tab
   - See it appear instantly in other tabs

---

## 🎯 What Works Now

✅ Canvas creation with starter prompts
✅ Username gate per canvas
✅ Username uniqueness validation
✅ Session persistence (localStorage)
✅ Public message posting
✅ Realtime message updates
✅ Voting system (upvote/downvote)
✅ Vote counting with auto-update
✅ Mode-aware UI (Normal vs Roast)
✅ Organic floating card layout
✅ Handwritten typography
✅ Paper textures and animations

---

## 🎭 Architectural Decisions

### 1. **Canvas-Centric, Not User-Centric**
- No global user accounts
- Each canvas is an isolated room
- Usernames are unique per canvas only
- Session stored in localStorage per canvas

### 2. **Username-Based Identity**
- Simple username validation (3-20 chars)
- Case-insensitive uniqueness
- Stored in `canvas_participants` table
- Cannot change once set for that canvas

### 3. **Immutable Messages**
- Messages cannot be edited
- Only deletion allowed
- Enforces authenticity

### 4. **Automatic Vote Aggregation**
- `vote_count` field on messages
- Updated via database triggers
- No need to count votes in queries

### 5. **Realtime First**
- Supabase subscriptions for messages
- Optimistic UI updates
- Instant feedback

---

## 📁 New File Structure

```
src/
├── types/
│   └── canvas.ts                 ✅ Type definitions
├── services/
│   └── canvasService.ts          ✅ Canvas API layer
├── components/
│   ├── UsernameGate.tsx          ✅ Username entry gate
│   ├── FloatingCard.tsx          ✅ Message cards
│   ├── HandwrittenText.tsx       ✅ Artistic typography
│   ├── CanvasBackground.tsx      ✅ Mode-aware backgrounds
│   └── index.ts                  ✅ Exports
├── pages/
│   ├── CreateCanvas.tsx          ✅ Canvas creation
│   ├── CanvasRoom.tsx            ✅ Main canvas view
│   └── UIDemo.tsx                ✅ UI showcase
└── App.tsx                       ✅ Updated routing
```

---

## 🔥 Key Features Explained

### Username Gate Flow
1. User visits `/canvas/:id`
2. Check localStorage for session
3. If no session → show fullscreen gate
4. Validate username against Supabase
5. Join canvas & save session
6. Enter canvas room

### Voting System
1. User clicks upvote/downvote
2. Optimistic UI update (instant feedback)
3. Send vote to Supabase
4. Database trigger updates message.vote_count
5. Other users see updated count via realtime

### Realtime Updates
- Subscribe to canvas_messages INSERT events
- New messages appear for all users instantly
- No polling, no refresh needed

---

## 🚀 Next: Phase 3 - Advanced Features

Ready to implement:

1. **Whisper System** (database ready!)
   - Private anonymous messages
   - Whisper overlay UI
   - Notification badges
   - Realtime delivery

2. **Popular Users**
   - Sidebar with rankings
   - Based on votes + whispers
   - Searchable
   - Click to whisper

3. **Image Export**
   - Canvas creator only
   - Export messages as shareable images
   - html2canvas or Canvas API
   - High-res output

4. **User Search**
   - Search participants by username
   - Partial match
   - Open whisper interface

---

## 💡 Design Philosophy

This is **not** a traditional social app. It's:

✨ **Anonymous but social** - Username only, no profiles
⏳ **Temporary but intense** - 7-day canvas lifespan
🎨 **Expressive, not polished** - Handwritten fonts, organic layouts
🔗 **Designed for sharing** - Each canvas has a unique link
🗣️ **Underground creative space** - Say what you'd never say out loud

---

## 🎉 Test Scenarios

### Scenario 1: Normal Mode Canvas
```
Prompt: "What's something you've never told anyone?"
Mode: Normal
Users: @alice, @bob, @charlie
- Soft colors, reflective atmosphere
- Vulnerable, honest messages
- Supportive voting
```

### Scenario 2: Roast Mode Canvas
```
Prompt: "Roast me with your most brutal truth"
Mode: Roast
Users: @savage, @honest, @brutal
- Dark colors, aggressive atmosphere
- Brutally honest feedback
- High-energy voting
```

### Scenario 3: Multiple Canvases
```
Canvas A: @user1 asks "What makes you happy?"
Canvas B: @user1 asks "What do you hate about me?"
- Same username, different contexts
- Separate participant lists
- Different modes
```

---

**Phase 2 is complete and fully functional!**

Run `npm run dev` and start creating canvases! 🚀
