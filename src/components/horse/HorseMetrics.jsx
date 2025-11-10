"use client";
import React, { useState, useEffect } from "react";
import HorseCard from "./HorseCard";
import AddHorseForm from "./AddHorseForm";
import DetailedHorseView from "./DetailedHorseView";

export const HorseMetrics = () => {
  const [horses, setHorses] = useState([]);
  const [unassignedDevices, setUnassignedDevices] = useState([]);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingHorse, setIsAddingHorse] = useState(false);
  const [error, setError] = useState(null); // new error state
  const [lastUpdated, setLastUpdated] = useState(null); //for showing last refresh time

  //Combined data fetch function
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [horsesResponse, unassignedResponse] = await Promise.all([
        fetch("https://horsetrackerbackend.onrender.com/api/horses"),
        fetch("https://horsetrackerbackend.onrender.com/api/unassigned"),
      ]);

      if (!horsesResponse.ok) throw new Error("Failed to fetch horses");
      if (!unassignedResponse.ok) throw new Error("Failed to fetch unassigned devices");

      const horsesData = await horsesResponse.json();
      const unassignedData = await unassignedResponse.json();

      setHorses(horsesData.horses);
      setUnassignedDevices(unassignedData.unassignedDevices);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount + every 60s refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Refresh after adding a horse
  const handleHorseAdded = async () => {
    await fetchData();
    setIsAddingHorse(false);
  };

  return (
    <div className="space-y-6">
      {/* Horse Details View */}
      {selectedHorse && (
        <DetailedHorseView
          horse={horses.find((h) => h.horseId === selectedHorse)}
          onClose={() => setSelectedHorse(null)}
        />
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Horse Management
        </h2>
        <div className="flex gap-3">
          <button
            onClick={fetchData} // manual refresh button
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <span>↻</span>
            <span>Refresh</span>
          </button>
          {!isAddingHorse && (
            <button
              onClick={() => setIsAddingHorse(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <span className="font-bold text-lg">+</span>
              <span>Add Horse</span>
            </button>
          )}
        </div>
      </div>

      {/* 🆕 Show error or last update info */}
      {error && (
        <div className="text-red-500 bg-red-100 border border-red-300 p-3 rounded-md">
          ⚠️ {error}
        </div>
      )}
      {lastUpdated && !error && (
        <p className="text-sm text-gray-500">
          Last updated: {lastUpdated}
        </p>
      )}

      {/* Loading / Grid Section */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isAddingHorse && (
            <AddHorseForm
              onCancel={() => setIsAddingHorse(false)}
              onHorseAdded={handleHorseAdded}
              unassignedDevices={unassignedDevices}
            />
          )}
          {horses.map((horse) => (
            <HorseCard
              key={horse.horseId}
              horse={horse}
              onViewDetails={() => setSelectedHorse(horse.horseId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HorseMetrics;
