import { ReactNode } from 'react';

interface CanvasBackgroundProps {
  children: ReactNode;
  mode?: 'normal' | 'roast';
}

export function CanvasBackground({ children, mode = 'normal' }: CanvasBackgroundProps) {
  const modeStyles = {
    normal: {
      background: 'linear-gradient(135deg, #faf8f4 0%, #f5f3ef 50%, #faf8f4 100%)',
      overlay: 'rgba(109, 40, 217, 0.03)'
    },
    roast: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a1f 50%, #1a1a1a 100%)',
      overlay: 'rgba(239, 68, 68, 0.05)'
    }
  };

  const currentMode = modeStyles[mode];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      data-mode={mode}
      style={{ background: currentMode.background }}
    >
      {/* Grain texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply'
        }}
      />

      {/* Color overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${currentMode.overlay}, transparent 70%)`
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Floating ambient particles (decorative) */}
      {mode === 'normal' && (
        <>
          <div className="fixed top-10 left-10 w-2 h-2 rounded-full bg-purple-300 opacity-20 animate-pulse" />
          <div className="fixed top-32 right-20 w-3 h-3 rounded-full bg-purple-400 opacity-15 animate-pulse delay-1000" />
          <div className="fixed bottom-20 left-1/3 w-2 h-2 rounded-full bg-purple-300 opacity-25 animate-pulse delay-2000" />
        </>
      )}

      {mode === 'roast' && (
        <>
          <div className="fixed top-10 right-10 w-2 h-2 rounded-full bg-red-500 opacity-30 animate-pulse" />
          <div className="fixed bottom-32 left-20 w-3 h-3 rounded-full bg-red-600 opacity-20 animate-pulse delay-1000" />
        </>
      )}
    </div>
  );
}
