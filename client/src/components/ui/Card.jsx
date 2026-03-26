export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-[1.6rem] border border-[#d8cbb8] bg-[#fffdf9] shadow-[0_1px_0_rgba(43,35,56,0.03)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={`border-b border-[#e8dccb] px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={`font-['Outfit'] font-semibold text-[1.05rem] text-[#1f172f] ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p
      className={`mt-1 text-sm text-[#6f677b] ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`border-t border-[#e8dccb] px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
