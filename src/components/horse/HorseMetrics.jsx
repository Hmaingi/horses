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

  // Fetch horses and unassigned devices from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch horses
        const horsesResponse = await fetch("https://horsetrackerbackend.onrender.com/api/horses");
        if (!horsesResponse.ok) throw new Error("Failed to fetch horses");
        const horsesData = await horsesResponse.json();
        setHorses(horsesData.horses);

        // Fetch unassigned devices
        const unassignedResponse = await fetch("https://horsetrackerbackend.onrender.com/api/unassigned");
        if (!unassignedResponse.ok) throw new Error("Failed to fetch unassigned devices");
        const unassignedData = await unassignedResponse.json();
        setUnassignedDevices(unassignedData.unassignedDevices);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHorseAdded = async () => {
    // Refresh horses after adding a new one
    try {
      setIsLoading(true);
      const response = await fetch("https://horsetrackerbackend.onrender.com/api/horses");
      if (!response.ok) throw new Error("Failed to fetch horses");
      const horsesData = await response.json();
      setHorses(horsesData.horses);
      setIsAddingHorse(false);
    } catch (error) {
      console.error("Error refreshing horses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {selectedHorse && (
        <DetailedHorseView
          horse={horses.find((h) => h.horseId === selectedHorse)}
          onClose={() => setSelectedHorse(null)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Horse Management</h2>
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