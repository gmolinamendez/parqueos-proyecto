import { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], placeholder, className = '', ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-semibold text-navy-light uppercase tracking-wide">{label}</label>}
    <select
      ref={ref}
      className={`
        w-full px-4 py-2.5 rounded-xl border text-sm
        bg-white text-navy appearance-none cursor-pointer
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
        ${error ? 'border-danger' : 'border-gray-200'}
        ${className}
      `}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
  </div>
));

Select.displayName = 'Select';
export default Select;
