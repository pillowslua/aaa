import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    slate: 'bg-slate-800/50 border-slate-700',
    green: 'bg-green-500/10 border-green-500/30',
    red: 'bg-red-500/10 border-red-500/30',
    blue: 'bg-blue-500/10 border-blue-500/30'
  };

  const textColorClasses = {
    slate: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400'
  };

  const iconColorClasses = {
    slate: 'text-slate-600',
    green: 'text-green-500/50',
    red: 'text-red-500/50',
    blue: 'text-blue-500/50'
  };

  return (
    <div className={`${colorClasses[color]} backdrop-blur-sm border rounded-xl p-6 hover:border-opacity-50 transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColorClasses[color]} text-sm mb-1`}>{title}</p>
          <p className={`text-3xl font-bold ${textColorClasses[color]}`}>{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${iconColorClasses[color]}`} />
      </div>
    </div>
  );
};

export default StatsCard;
