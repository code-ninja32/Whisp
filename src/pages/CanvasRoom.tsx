import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CanvasBackground, FloatingCard, HandwrittenText } from '../components';
import { UsernameGate } from '../components/UsernameGate';
import {
  getCanvas,
  getCanvasSession,
  getMessages,
  postMessage,
  castVote,
  getUserVotes,
  subscribeToMessages
} from '../services/canvasService';
import type { Canvas, CanvasMessage } from '../types/canvas';

export function CanvasRoom() {
  const { canvasId } = useParams<{ canvasId: string }>();

  // State
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<CanvasMessage[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 1 | -1>>({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  // Load canvas and check session
  useEffect(() => {
    if (!canvasId) return;

    loadCanvas();
    checkSession();
  }, [canvasId]);

  // Load messages when username is set
  useEffect(() => {
    if (!canvasId || !username) return;

    loadMessages();
    loadUserVotes();

    // Subscribe to realtime messages
    const subscription = subscribeToMessages(canvasId, (newMsg) => {
      setMessages(prev => [newMsg, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [canvasId, username]);

  async function loadCanvas() {
    if (!canvasId) return;

    const data = await getCanvas(canvasId);
    if (data) {
      setCanvas(data);
    } else {
      setError('Canvas not found');
    }
    setLoading(false);
  }

  function checkSession() {
    if (!canvasId) return;

    const session = getCanvasSession(canvasId);
    if (session) {
      setUsername(session.username);
    }
  }

  async function loadMessages() {
    if (!canvasId) return;

    const data = await getMessages(canvasId);
    setMessages(data);
  }

  async function loadUserVotes() {
    if (!username) return;

    const votes = await getUserVotes(username);
    setUserVotes(votes);
  }

  function handleUsernameSuccess(newUsername: string) {
    setUsername(newUsername);
  }

  async function handlePostMessage() {
    if (!canvasId || !username || !newMessage.trim() || posting) return;

    setPosting(true);
    const message = await postMessage(canvasId, username, newMessage);

    if (message) {
      setNewMessage('');
      // Message will be added via realtime subscription
    } else {
      alert('Failed to post message');
    }

    setPosting(false);
  }

  async function handleVote(messageId: string, vote: 1 | -1) {
    if (!username) return;

    // Optimistic update
    setUserVotes(prev => ({ ...prev, [messageId]: vote }));
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, vote_count: msg.vote_count + vote }
          : msg
      )
    );

    const success = await castVote(messageId, username, vote);

    if (!success) {
      // Revert on failure
      loadMessages();
      loadUserVotes();
    }
  }

  // Loading state
  if (loading) {
    return (
      <CanvasBackground mode={canvas?.mode || 'normal'}>
        <div className="flex items-center justify-center min-h-screen">
          <HandwrittenText size="lg" className="text-gray-500 animate-pulse">
            Loading canvas...
          </HandwrittenText>
        </div>
      </CanvasBackground>
    );
  }

  // Error state
  if (error || !canvas) {
    return (
      <CanvasBackground mode="normal">
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <span className="text-6xl">😕</span>
          <HandwrittenText size="lg" className="text-gray-600">
            {error || 'Canvas not found'}
          </HandwrittenText>
        </div>
      </CanvasBackground>
    );
  }

  // Show username gate if not set
  if (!username) {
    return <UsernameGate canvasId={canvasId!} mode={canvas.mode} onSuccess={handleUsernameSuccess} />;
  }

  // Main canvas view
  return (
    <CanvasBackground mode={canvas.mode}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with starter prompt */}
        <div className="mb-12">
          <FloatingCard rotation={0} className="max-w-3xl mx-auto bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
            <div className="text-center">
              <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-2 block">
                Canvas Prompt
              </span>
              <HandwrittenText size="lg" className="text-gray-800 block mb-4">
                {canvas.starter_prompt}
              </HandwrittenText>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span>👤 {username}</span>
                <span>•</span>
                <span className={canvas.mode === 'roast' ? 'text-red-500' : 'text-purple-500'}>
                  {canvas.mode === 'roast' ? '🔥 Roast Mode' : '💜 Normal Mode'}
                </span>
              </div>
            </div>
          </FloatingCard>
        </div>

        {/* Post new message */}
        <div className="mb-12 max-w-2xl mx-auto">
          <FloatingCard rotation={0}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={canvas.mode === 'roast' ? 'Drop your most brutal truth...' : 'Share your honest thought...'}
              disabled={posting}
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 outline-none resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">{newMessage.length}/500</span>
              <button
                onClick={handlePostMessage}
                disabled={!newMessage.trim() || posting}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? 'Posting...' : 'Post Anonymously'}
              </button>
            </div>
          </FloatingCard>
        </div>

        {/* Messages grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {messages.map((message, index) => {
              const userVote = userVotes[message.id];

              return (
                <FloatingCard
                  key={message.id}
                  delay={index * 0.05}
                  className={canvas.mode === 'roast' ? 'bg-gray-800 text-white' : ''}
                >
                  <div>
                    {/* Message content */}
                    <p className={`${canvas.mode === 'roast' ? 'text-gray-200' : 'text-gray-700'} mb-4 leading-relaxed`}>
                      {message.content}
                    </p>

                    {/* Author */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200/30">
                      <HandwrittenText size="sm" className="text-gray-500">
                        @{message.author_username}
                      </HandwrittenText>
                      <span className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Vote buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVote(message.id, 1)}
                          className={`p-2 rounded-lg transition-all ${
                            userVote === 1
                              ? 'bg-green-100 scale-110'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-xl">{userVote === 1 ? '👍🏻' : '👍'}</span>
                        </button>
                        <button
                          onClick={() => handleVote(message.id, -1)}
                          className={`p-2 rounded-lg transition-all ${
                            userVote === -1
                              ? 'bg-red-100 scale-110'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-xl">{userVote === -1 ? '👎🏻' : '👎'}</span>
                        </button>
                      </div>

                      <HandwrittenText size="sm" className={message.vote_count > 0 ? 'text-green-600' : message.vote_count < 0 ? 'text-red-600' : 'text-gray-500'}>
                        {message.vote_count > 0 ? '+' : ''}{message.vote_count}
                      </HandwrittenText>
                    </div>
                  </div>
                </FloatingCard>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">📝</span>
            <HandwrittenText size="lg" className="text-gray-500 block mb-2">
              No messages yet
            </HandwrittenText>
            <p className="text-gray-400">Be the first to share a thought!</p>
          </div>
        )}
      </div>
    </CanvasBackground>
  );
}
