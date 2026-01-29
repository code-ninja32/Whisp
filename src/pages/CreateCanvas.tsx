import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CanvasBackground, HandwrittenText, FloatingCard } from '../components';
import { createCanvas } from '../services/canvasService';
import type { CanvasMode } from '../types/canvas';

const STARTER_PROMPTS = [
  "What's something you've never told anyone?",
  "What do you really think about me?",
  "If you could change one thing about yourself, what would it be?",
  "What's your biggest regret?",
  "What's a secret you'll take to your grave?",
  "What makes you feel truly alive?",
  "What are you most afraid of?",
  "What would you do if no one was watching?",
  // Roast mode prompts
  "Roast me with your most brutal truth",
  "Tell me what I need to hear, not what I want to hear",
  "What's my most annoying habit?",
  "Be brutally honest: what do people really think about me?",
];

export function CreateCanvas() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<CanvasMode>('normal');
  const [prompt, setPrompt] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  function getRandomPrompt() {
    const filtered = STARTER_PROMPTS.filter(p =>
      mode === 'roast'
        ? p.toLowerCase().includes('roast') || p.toLowerCase().includes('brutal')
        : !p.toLowerCase().includes('roast') && !p.toLowerCase().includes('brutal')
    );
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  function handleRandomPrompt() {
    setPrompt(getRandomPrompt());
  }

  async function handleCreate() {
    if (!prompt.trim() || !username.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    const canvas = await createCanvas({
      starter_prompt: prompt.trim(),
      mode,
      created_by: username.trim()
    });

    setLoading(false);

    if (canvas) {
      // Redirect to new canvas
      navigate(`/canvas/${canvas.id}`);
    } else {
      alert('Failed to create canvas. Please try again.');
    }
  }

  return (
    <CanvasBackground mode={mode}>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ rotate: -5 }}
            animate={{ rotate: 5 }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 2
            }}
            className="inline-block mb-4"
          >
            <span className="text-8xl">👻</span>
          </motion.div>

          <HandwrittenText size="xl" className={`block mb-4 ${mode === 'roast' ? 'text-red-400' : 'text-purple-600'}`}>
            Create Your Canvas
          </HandwrittenText>

          <p className={`${mode === 'roast' ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Create an anonymous canvas where people can share honest thoughts.
            Each canvas is temporary and unique.
          </p>
        </motion.div>

        {/* Mode selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <FloatingCard rotation={0}>
            <div className="text-center mb-4">
              <HandwrittenText size="md" className="text-gray-700 block mb-2">
                Choose Your Vibe
              </HandwrittenText>
              <p className="text-sm text-gray-500">This sets the atmosphere of your canvas</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('normal')}
                className={`
                  p-6 rounded-xl border-2 transition-all duration-300
                  ${mode === 'normal'
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300'
                  }
                `}
              >
                <span className="text-4xl mb-2 block">💜</span>
                <HandwrittenText size="md" className="text-purple-600 block">
                  Normal
                </HandwrittenText>
                <p className="text-xs text-gray-600 mt-2">
                  Soft, reflective, emotional
                </p>
              </button>

              <button
                onClick={() => setMode('roast')}
                className={`
                  p-6 rounded-xl border-2 transition-all duration-300
                  ${mode === 'roast'
                    ? 'border-red-500 bg-red-50 shadow-lg'
                    : 'border-gray-200 hover:border-red-300'
                  }
                `}
              >
                <span className="text-4xl mb-2 block">🔥</span>
                <HandwrittenText size="md" className="text-red-600 block">
                  Roast
                </HandwrittenText>
                <p className="text-xs text-gray-600 mt-2">
                  Dark, brutal, aggressive
                </p>
              </button>
            </div>
          </FloatingCard>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Your username */}
          <FloatingCard rotation={0}>
            <label className="block mb-2">
              <HandwrittenText size="md" className="text-gray-700">
                Your Username
              </HandwrittenText>
              <p className="text-xs text-gray-500 mt-1">You'll be the creator of this canvas</p>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 outline-none"
            />
          </FloatingCard>

          {/* Starter prompt */}
          <FloatingCard rotation={0}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <HandwrittenText size="md" className="text-gray-700">
                  Starter Prompt
                </HandwrittenText>
                <p className="text-xs text-gray-500 mt-1">The question that will set the tone</p>
              </div>
              <button
                onClick={handleRandomPrompt}
                className="text-sm px-3 py-1 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
              >
                🎲 Random
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What question do you want people to answer?"
              maxLength={200}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 outline-none resize-none"
            />

            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{prompt.length}/200</span>
            </div>
          </FloatingCard>

          {/* Create button */}
          <motion.button
            onClick={handleCreate}
            disabled={loading || !prompt.trim() || !username.trim()}
            whileTap={{ scale: 0.95 }}
            className={`
              w-full py-4 rounded-xl font-semibold text-lg
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              ${mode === 'roast'
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Creating Canvas...
              </span>
            ) : (
              <HandwrittenText size="md">
                Create Canvas & Get Link 🚀
              </HandwrittenText>
            )}
          </motion.button>

          {/* Info */}
          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>✨ Your canvas will be live for 7 days</p>
            <p>🔗 Share the link with anyone</p>
            <p>👻 All responses are anonymous</p>
          </div>
        </motion.div>
      </div>
    </CanvasBackground>
  );
}
