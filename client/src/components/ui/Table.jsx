export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`min-w-full border-collapse ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`bg-[#fbf8f4] ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className = '', onClick, ...props }) {
  return (
    <tr
      className={`border-b border-[#ece3d9] last:border-0 ${
        onClick ? 'cursor-pointer transition-colors hover:bg-[#fbf8f4]' : ''
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', ...props }) {
  return (
    <th
      className={`px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#7b7284] ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-4 py-4 text-sm text-[#1f172f] align-middle ${className}`} {...props}>
      {children}
    </td>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#f3a76a]/10 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-[#f3a76a]" />
        </div>
      )}
      <h3 className="font-['Outfit'] font-semibold text-lg text-[#1f172f] mb-1">
        {title}
      </h3>
      <p className="text-[#6f677b] text-center max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
