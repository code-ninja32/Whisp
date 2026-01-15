import { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  rotation?: number;
  className?: string;
  onClick?: () => void;
}

export function FloatingCard({
  children,
  delay = 0,
  rotation,
  className = '',
  onClick
}: FloatingCardProps) {
  // Generate random rotation if not provided
  const finalRotation = rotation ?? (Math.random() * 6 - 3); // -3 to 3 degrees

  const style: CSSProperties = {
    '--rotation': `${finalRotation}deg`,
    '--delay': `${delay}s`,
  } as CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 0 }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: finalRotation
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{
        rotate: 0,
        y: -5,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      style={style}
      onClick={onClick}
      className={`
        relative
        bg-white
        rounded-xl
        p-6
        shadow-lg
        cursor-pointer
        hover:shadow-2xl
        transition-shadow
        duration-300
        ${className}
      `}
    >
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='paper' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='10' cy='10' r='0.5' fill='rgba(0,0,0,0.05)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23paper)' width='100' height='100'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Torn edge effect */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-10"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
        }}
      />
    </motion.div>
  );
}
