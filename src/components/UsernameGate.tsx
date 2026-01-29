import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandwrittenText } from './HandwrittenText';
import { validateUsername, joinCanvas } from '../services/canvasService';
import type { CanvasMode } from '../types/canvas';

interface UsernameGateProps {
  canvasId: string;
  mode: CanvasMode;
  onSuccess: (username: string) => void;
}

export function UsernameGate({ canvasId, mode, onSuccess }: UsernameGateProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = mode === 'roast';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate username
    const validation = await validateUsername(canvasId, username);

    if (!validation.valid) {
      setError(validation.error || 'Invalid username');
      setLoading(false);
      return;
    }

    // Join canvas
    const participant = await joinCanvas(canvasId, username);

    if (!participant) {
      setError('Failed to join canvas. Please try again.');
      setLoading(false);
      return;
    }

    // Success!
    onSuccess(username.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${isDark
          ? 'bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900'
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50'
        }
      `}
    >
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Card */}
        <div
          className={`
            rounded-3xl p-8 shadow-2xl backdrop-blur-xl
            ${isDark
              ? 'bg-gray-800/90 border border-red-500/30'
              : 'bg-white/90 border border-purple-200/50'
            }
          `}
        >
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: -5 }}
              animate={{ rotate: 5 }}
              transition={{
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 2,
                ease: 'easeInOut'
              }}
              className="inline-block mb-4"
            >
              <span className="text-6xl">👻</span>
            </motion.div>

            <HandwrittenText
              size="xl"
              className={`block mb-2 ${isDark ? 'text-red-400' : 'text-purple-600'}`}
            >
              {isDark ? 'Enter if you dare' : 'Welcome to the Canvas'}
            </HandwrittenText>

            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isDark
                ? 'Choose a name. Brace yourself for brutal honesty.'
                : 'Choose a username to enter this anonymous space'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                disabled={loading}
                className={`
                  w-full px-4 py-3 rounded-xl
                  font-["Karla"] text-lg
                  transition-all duration-300
                  ${isDark
                    ? 'bg-gray-700 text-white placeholder-gray-500 border-gray-600 focus:border-red-500'
                    : 'bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-purple-500'
                  }
                  border-2 outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                autoFocus
                minLength={3}
                maxLength={20}
                required
              />

              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                3-20 characters • Unique per canvas
              </p>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`
                    p-3 rounded-lg text-sm
                    ${isDark
                      ? 'bg-red-900/50 text-red-200 border border-red-700'
                      : 'bg-red-50 text-red-700 border border-red-200'
                    }
                  `}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading || !username.trim()}
              whileTap={{ scale: 0.95 }}
              className={`
                w-full py-3 rounded-xl
                font-semibold text-lg
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isDark
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Joining...
                </span>
              ) : (
                <HandwrittenText size="md">
                  {isDark ? 'Enter the Roast' : 'Enter Canvas'} →
                </HandwrittenText>
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <div className={`mt-6 text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <p>Anonymous • Temporary • Honest</p>
            <p className="mt-1">Your username is only for this canvas</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
