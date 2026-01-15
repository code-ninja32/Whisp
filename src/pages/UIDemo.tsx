import { useState } from 'react';
import { CanvasBackground, FloatingCard, HandwrittenText } from '../components';
import { motion } from 'framer-motion';

export function UIDemo() {
  const [mode, setMode] = useState<'normal' | 'roast'>('normal');

  const sampleMessages = [
    {
      id: 1,
      text: "Sometimes I wonder if anyone really sees me for who I am...",
      votes: 12,
      delay: 0
    },
    {
      id: 2,
      text: "Your smile makes the world a little less heavy 💜",
      votes: 24,
      delay: 0.1
    },
    {
      id: 3,
      text: "I'm scared of being forgotten",
      votes: 8,
      delay: 0.2
    },
    {
      id: 4,
      text: "You're braver than you think, stronger than you know",
      votes: 31,
      delay: 0.3
    },
    {
      id: 5,
      text: "What if this is all there is?",
      votes: 5,
      delay: 0.4
    }
  ];

  return (
    <CanvasBackground mode={mode}>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <HandwrittenText size="xl" className="block mb-4 text-purple-600">
            Whisp Canvas
          </HandwrittenText>

          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            A creative space for anonymous thoughts. Say what you would never say out loud.
          </p>

          {/* Mode Toggle */}
          <div className="inline-flex gap-4 bg-white/50 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <button
              onClick={() => setMode('normal')}
              className={`
                px-6 py-2 rounded-full transition-all duration-300
                ${mode === 'normal'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/50'}
              `}
            >
              <HandwrittenText size="sm">Normal</HandwrittenText>
            </button>
            <button
              onClick={() => setMode('roast')}
              className={`
                px-6 py-2 rounded-full transition-all duration-300
                ${mode === 'roast'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/50'}
              `}
            >
              <HandwrittenText size="sm">Roast</HandwrittenText>
            </button>
          </div>
        </motion.div>

        {/* Starter Prompt */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <FloatingCard rotation={0} className="max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
            <div className="text-center">
              <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-2 block">
                Today's Prompt
              </span>
              <HandwrittenText size="lg" className="text-gray-800 block">
                What's something you've never told anyone?
              </HandwrittenText>
            </div>
          </FloatingCard>
        </motion.div>

        {/* Message Grid (Organic Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {sampleMessages.map((message, index) => (
            <FloatingCard
              key={message.id}
              delay={message.delay}
              className={mode === 'roast' ? 'bg-gray-800 text-white' : ''}
            >
              <div>
                <p className={`${mode === 'roast' ? 'text-gray-200' : 'text-gray-700'} mb-4 leading-relaxed`}>
                  {message.text}
                </p>

                {/* Vote buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200/30">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
                      <span className="text-xl">👍</span>
                    </button>
                    <button className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
                      <span className="text-xl">👎</span>
                    </button>
                  </div>

                  <HandwrittenText size="sm" className="text-purple-600">
                    {message.votes} votes
                  </HandwrittenText>
                </div>
              </div>
            </FloatingCard>
          ))}
        </div>

        {/* Add Message Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <button className="
            bg-gradient-to-r from-purple-500 to-pink-500
            text-white
            px-8 py-4
            rounded-full
            shadow-2xl
            hover:shadow-purple-500/50
            hover:scale-105
            transition-all
            duration-300
          ">
            <HandwrittenText size="md">
              Add Your Thought ✨
            </HandwrittenText>
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16 text-sm text-gray-500"
        >
          <HandwrittenText size="sm">
            Everything is anonymous. Everything is temporary. Everything is real.
          </HandwrittenText>
        </motion.div>
      </div>
    </CanvasBackground>
  );
}
