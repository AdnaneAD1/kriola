'use client'

import { Loader2 } from 'lucide-react';

export function LoadingButton({ children, isLoading, className = '', ...props }) {
  const baseClasses = 'btn-primary flex items-center justify-center gap-2';
  const finalClasses = `${baseClasses} ${className}`;

  return (
    <button 
      className={finalClasses} 
      disabled={isLoading} 
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Chargement...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
