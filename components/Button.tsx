import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseStyles = "font-bold uppercase tracking-wide transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center";
  
  const variants = {
    primary: "bg-duo-green text-white border-b-4 border-duo-greenDark hover:bg-duo-greenDark/90",
    secondary: "bg-duo-blue text-white border-b-4 border-duo-blueDark hover:bg-duo-blueDark/90",
    danger: "bg-duo-red text-white border-b-4 border-duo-redDark hover:bg-duo-redDark/90",
    outline: "bg-white text-duo-blue border-2 border-duo-gray hover:bg-gray-50 border-b-4",
    ghost: "bg-transparent text-duo-blue hover:bg-duo-blue/10",
  };

  const sizes = {
    sm: "py-2 px-4 text-sm rounded-xl",
    md: "py-3 px-6 text-base rounded-2xl",
    lg: "py-4 px-8 text-lg rounded-2xl",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};