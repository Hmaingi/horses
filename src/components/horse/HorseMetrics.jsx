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
  const [userCoords, setUserCoords] = useState({ lat: 0, lng: 0 }); // current location

  // Get real geolocation from browser
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => console.error("Geolocation error:", err)
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }, []);

  // Combined data fetch function
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [horsesResponse, unassignedResponse] = await Promise.all([
        fetch("http://localhost:3000/api/horses"),
        fetch("http://localhost:3000/api/unassigned"),
      ]);

      if (!horsesResponse.ok) throw new Error("Failed to fetch horses");
      if (!unassignedResponse.ok)
        throw new Error("Failed to fetch unassigned devices");

      const horsesData = await horsesResponse.json();
      const unassignedData = await unassignedResponse.json();

      // Inject current location for live demo
      const updatedHorses = horsesData.horses.map((horse) => ({
        ...horse,
        coordinates: { ...userCoords },
        location: "Current Location", // optional label
      }));

      setHorses(updatedHorses);
      setUnassignedDevices(unassignedData.unassignedDevices);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount + every 50s refresh
  useEffect(() => {
    if (userCoords.lat && userCoords.lng) {
      fetchData(); // fetch only after coordinates are available
      const interval = setInterval(fetchData, 50000);
      return () => clearInterval(interval);
    }
  }, [userCoords]);

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

      {/* Error / Last Update */}
      {error && (
        <div className="text-red-500 bg-red-100 border border-red-300 p-3 rounded-md">
          ⚠️ {error}
        </div>
      )}
      {lastUpdated && !error && (
        <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
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

