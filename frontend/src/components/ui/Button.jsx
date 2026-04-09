const variants = {
  primary: 'bg-primary hover:bg-primary-dark text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-navy',
  danger: 'bg-danger hover:bg-red-600 text-white',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-gray-500 hover:bg-gray-100',
  link: 'text-primary hover:text-primary-dark underline-offset-2 hover:underline p-0',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  loading,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${variant !== 'link' ? sizes[size] : ''} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
