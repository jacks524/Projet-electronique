import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  type = 'button',
  className = '',
  disabled = false,
  ...props 
}) => {
  const getButtonClasses = () => {
    switch (variant) {
      case 'primary':
        return 'inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-[#7c3aed] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3aed] text-white disabled:opacity-50';
      case 'secondary':
        return 'inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#312e81] text-gray-700 disabled:opacity-50';
      case 'danger':
        return 'inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-red-700 disabled:opacity-50';
      case 'link':
        return 'inline-flex items-center px-3 py-2 text-sm font-medium text-[#7c3aed] hover:text-opacity-90';
      default:
        return 'inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-[#7c3aed] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3aed] text-white disabled:opacity-50';
    }
  };

  return (
    <button
      type={type}
      className={`${getButtonClasses()} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;