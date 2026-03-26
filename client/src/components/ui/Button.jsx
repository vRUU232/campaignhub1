import { forwardRef } from 'react';

const variants = {
  primary: 'bg-[#1f172f] text-white hover:bg-[#2c2340]',
  secondary: 'bg-[#fffdf9] text-[#1f172f] border border-[#d8cbb8] hover:bg-[#fbf6ef]',
  outline: 'bg-transparent text-[#1f172f] border border-[#d8cbb8] hover:bg-[#fbf6ef]',
  ghost: 'bg-transparent text-[#6f677b] hover:bg-[#1f172f]/5 hover:text-[#1f172f]',
  danger: 'bg-[#c85c4d] text-white hover:bg-[#b54d3f]',
  success: 'bg-[#6d9a8a] text-white hover:bg-[#5d8779]',
};

const sizes = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-4.5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-[1.15rem] font-semibold
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
