import { ReactNode } from 'react';

interface HandwrittenTextProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  brush?: boolean;
}

export function HandwrittenText({
  children,
  size = 'md',
  className = '',
  brush = false
}: HandwrittenTextProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  const fontClass = brush ? 'font-["Permanent_Marker"]' : 'font-["Caveat"]';

  return (
    <span className={`
      ${fontClass}
      ${sizeClasses[size]}
      ${brush ? 'uppercase tracking-wider' : 'tracking-wide'}
      ${className}
    `}>
      {children}
    </span>
  );
}
