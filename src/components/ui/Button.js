export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500/50',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary/50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
