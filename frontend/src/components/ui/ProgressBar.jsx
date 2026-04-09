export default function ProgressBar({ value, max = 100, color = 'bg-primary' }) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-navy min-w-[36px]">{percent}%</span>
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
