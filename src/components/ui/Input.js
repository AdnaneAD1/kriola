export function Input({ className = '', ...props }) {
  return (
    <input
      className={`
        block w-full rounded-lg border border-gray-300 bg-white px-3 py-2
        text-sm text-gray-900 placeholder-gray-500
        focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
        disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
        ${className}
      `}
      {...props}
    />
  );
}
