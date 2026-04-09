import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-semibold text-navy-light uppercase tracking-wide">{label}</label>}
    <input
      ref={ref}
      className={`
        w-full px-4 py-2.5 rounded-xl border text-sm
        bg-white text-navy placeholder:text-gray-400
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
        ${error ? 'border-danger' : 'border-gray-200'}
        ${className}
      `}
      {...props}
    />
    {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
