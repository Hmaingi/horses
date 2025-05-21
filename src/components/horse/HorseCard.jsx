import React from "react";
import Badge from "../ui/badge/Badge";
import MetricCard from "./MetricCard";
import { HeartIcon, LocationIcon, SpeedIcon, TemperatureIcon } from "@/icons";

const HorseCard = ({ horse, onViewDetails }) => {
  return (
    <div
      className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onViewDetails}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{horse.name}</h3>
        </div>
        <Badge
          color={horse.status === "normal" ? "success" : horse.status === "attention" ? "warning" : "error"}
        >
          {horse.status}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          icon={<HeartIcon className="size-5 text-pink-500" />}
          label="Heart Rate"
          value={`${horse.heartRate} BPM`}
        />
        <MetricCard
          icon={<TemperatureIcon className="size-5 text-red-400" />}
          label="Temperature"
          value={`${horse.temperature}°C`}
        />
        <MetricCard
          icon={<LocationIcon className="size-5 text-green-500" />}
          label="Location"
          value={horse.location || "Unknown"}
        />
        <MetricCard
          icon={<SpeedIcon className="size-5 text-blue-500" />}
          label="Speed"
          value={`${horse.speed} km/h`}
        />
      </div>
      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">Last updated: {horse.lastUpdated}</span>
        <button
          className="text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default HorseCard;