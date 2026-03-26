import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#1f172f] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6f677b]">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-[1.1rem] border bg-[#fffdf9] px-4 py-3
            text-[#1f172f] placeholder:text-[#6f677b]/60
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#d9c9b1]/55 focus:border-[#c98a57]
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : 'border-[#d9ccb8]'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

export const Textarea = forwardRef(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#1f172f] mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full rounded-[1.1rem] border bg-[#fffdf9] px-4 py-3.5
          text-[#1f172f] placeholder:text-[#6f677b]/60
          transition-all duration-200 resize-none
          focus:outline-none focus:ring-2 focus:ring-[#d9c9b1]/55 focus:border-[#c98a57]
          ${error ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : 'border-[#d9ccb8]'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export const Select = forwardRef(({
  label,
  error,
  options = [],
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#1f172f] mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full rounded-[1.1rem] border bg-[#fffdf9] px-4 py-3
          text-[#1f172f] appearance-none cursor-pointer
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#d9c9b1]/55 focus:border-[#c98a57]
          ${error ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : 'border-[#d9ccb8]'}
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236f677b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem',
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
