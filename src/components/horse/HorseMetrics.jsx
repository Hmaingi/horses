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
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Railway backend URL
  const API_BASE_URL = "https://ebackend-production-fac4.up.railway.app/api";

  // Get browser location and send to backend
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);

          // Send location to backend so horses are centered around it
          fetch(`${API_BASE_URL}/location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loc),
          }).catch((err) =>
            console.error("Failed to send location to backend:", err)
          );
        },
        (error) => {
          console.error("Geolocation error:", error);
          setUserLocation({ lat: -0.4235, lng: 36.9485 }); // fallback
        }
      );
    } else {
      console.error("Geolocation not supported");
      setUserLocation({ lat: -0.4235, lng: 36.9485 });
    }
  }, []);

  // Combined data fetch function
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [horsesResponse, unassignedResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/horses`),
        fetch(`${API_BASE_URL}/unassigned`),
      ]);

      if (!horsesResponse.ok) throw new Error("Failed to fetch horses");
      if (!unassignedResponse.ok)
        throw new Error("Failed to fetch unassigned devices");

      const horsesData = await horsesResponse.json();
      const unassignedData = await unassignedResponse.json();

      // Adjust horse coordinates relative to user location if not already done by backend
      const adjustedHorses =
        userLocation && horsesData.horses
          ? horsesData.horses.map((h) => ({
              ...h,
              coordinates: {
                lat: h.coordinates.lat,
                lng: h.coordinates.lng,
              },
            }))
          : horsesData.horses;

      setHorses(adjustedHorses);
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
    if (userLocation) fetchData();
    const interval = setInterval(() => {
      if (userLocation) fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, [userLocation]);

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
            onClick={fetchData}
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

      {/* Show error or last update info */}
      {error && (
        <div className="text-red-500 bg-red-100 border border-red-300 p-3 rounded-md">
          {error}
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


