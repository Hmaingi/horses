import React, { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { HeartIcon, LocationIcon, SpeedIcon, TemperatureIcon } from "@/icons";
import MapWithNoSSR from "./MapWithNoSSR";

const DetailedHorseView = ({ horse, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [insights, setInsights] = useState(horse.behavioralInsights || "");

  //Load locally saved insights for persistence
  useEffect(() => {
    if (horse?.horseId) {
      const saved = localStorage.getItem(`insights_${horse.horseId}`);
      if (saved) {
        setInsights(saved);
        horse.behavioralInsights = saved;
      }
    }
  }, [horse?.horseId]);

  if (!horse) return null;

  const handleSave = () => {
    horse.behavioralInsights = insights;
    localStorage.setItem(`insights_${horse.horseId}`, insights); //Save locally
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 z-150 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{horse.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {horse.horseId}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              color={
                horse.status === "normal"
                  ? "success"
                  : horse.status === "attention"
                  ? "warning"
                  : "error"
              }
            >
              {horse.status}
            </Badge>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Location</h3>
              <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
                <MapWithNoSSR horses={[horse]} selectedHorse={horse} />
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Current location: <span className="font-medium">{horse.location || "Unknown"}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Vital Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <HeartIcon className="size-5 text-pink-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Heart Rate</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {horse.heartRate} <span className="text-base font-normal">BPM</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">Normal range: 36-48 BPM</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TemperatureIcon className="size-5 text-red-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Temperature</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {horse.temperature} <span className="text-base font-normal">°C</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">Normal range: 37.2-38.3°C</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <SpeedIcon className="size-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Speed</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {horse.speed} <span className="text-base font-normal">km/h</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Current activity: {horse.speed > 0 ? "Moving" : "Stationary"}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="text-green-500">O²</div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Oxygen Saturation</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {horse.oxygenSaturation} <span className="text-base font-normal">%</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">Normal range: 95-100%</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {/* 🧠 Editable Behavioral Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Behavioral Insights</h3>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={insights}
                    onChange={(e) => setInsights(e.target.value)}
                    className="w-full h-32 p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {insights || "No insights yet."}
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Activity Log</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div>
                    <p className="font-medium">Temperature check</p>
                    <p className="text-sm text-gray-500">{horse.lastUpdated}</p>
                  </div>
                  <span className="text-green-600 dark:text-green-400">Normal</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div>
                    <p className="font-medium">Location update</p>
                    <p className="text-sm text-gray-500">{horse.lastUpdated}</p>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">{horse.location || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Health check</p>
                    <p className="text-sm text-gray-500">1h ago</p>
                  </div>
                  <span className="text-green-600 dark:text-green-400">Completed</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Care History</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last vet check:</span>
                  <span className="font-medium">3 days ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last feeding:</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last exercise:</span>
                  <span className="font-medium">Yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedHorseView;
