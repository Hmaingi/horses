import React from "react";

const MetricCard = ({ icon, label, value }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{label}</span>
      </div>
      <div className="text-md font-semibold text-gray-800 dark:text-white">{value}</div>
    </div>
  );
};

export default MetricCard;