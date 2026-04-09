export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-lg font-bold text-navy">{value}</p>
          {change && (
            <span className={`text-xs font-bold ${changeType === 'positive' ? 'text-success' : 'text-danger'}`}>
              {change}
            </span>
          )}
        </div>
      </div>
      <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}
