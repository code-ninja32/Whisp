# Whisp 👻

An anonymous messaging web app where users can receive honest, anonymous thoughts from others.

## Overview

Whisp is a privacy-focused messaging platform that allows users to:
- Create an account with a nickname
- Generate a unique shareable link
- Receive anonymous messages from anyone with the link
- React to messages with hearts
- Share their link via WhatsApp and other platforms

All data is stored locally in the browser using localStorage.

## Features

- **Anonymous Messaging**: Send thoughts without revealing your identity
- **Personal Inbox**: View all received messages in one place
- **Reactions**: Show appreciation for messages with heart reactions
- **Easy Sharing**: Share your unique link via WhatsApp or copy directly
- **Beautiful UI**: Modern gradient design with smooth animations
- **Local Storage**: All data stays in your browser

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Whisp/Whisp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

## How It Works

1. **Create Account**: Choose a nickname to get started
2. **Get Your Link**: Copy your unique shareable link from the inbox
3. **Share**: Send your link to friends via WhatsApp or any platform
4. **Receive**: Anonymous messages appear in your inbox
5. **React**: Show appreciation by reacting to messages

## Deployment

The app includes GitHub Pages deployment configuration. To deploy:

```bash
npm run deploy
```

Make sure to configure the `base` path in `vite.config.ts` if deploying to a subdirectory.

## Project Structure

```
Whisp/
├── src/
│   ├── App.tsx          # Main application component with all routes
│   ├── main.tsx         # Application entry point
│   ├── App.css          # Component styles
│   ├── index.css        # Global styles
│   └── assets/          # Static assets
├── public/              # Public assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## Routes

- `/` - Create account page
- `/me` - User inbox with messages
- `/send/:userId` - Send anonymous message to a user

## Privacy Note

All data is stored locally in the browser's localStorage. No data is sent to any server. Messages are only accessible on the device where they were received.

## License

This project is open source and available under the MIT License.
