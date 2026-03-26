export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between ${className}`}>
      <div className="max-w-[44rem]">
        {eyebrow && (
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#8a6270]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-['Outfit'] text-[2.2rem] font-semibold tracking-[-0.05em] text-[#1f172f] sm:text-[2.75rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-base leading-7 text-[#6f677b]">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
