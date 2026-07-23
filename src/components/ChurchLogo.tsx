import React from 'react';
import churchLogoImg from '../assets/images/church_logo_1784731400543.jpg';

interface ChurchLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  className = '',
  size = 'md',
  showBackground = true,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-white p-1 border border-slate-200/80 shadow-sm shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <img
        src={churchLogoImg}
        alt="Logo IGREJA ADBRAS SEDE"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
