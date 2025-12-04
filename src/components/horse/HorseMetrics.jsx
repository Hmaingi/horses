"use client";
import React, { useState, useEffect } from "react";
import HorseCard from "./HorseCard";
import AddHorseForm from "./AddHorseForm";
import DetailedHorseView from "./DetailedHorseView";
import MapWithNoSSR from "./MapWithNoSSR";

export const HorseMetrics = () => {
  const [horses, setHorses] = useState([]);
  const [unassignedDevices, setUnassignedDevices] = useState([]);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingHorse, setIsAddingHorse] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const API_BASE_URL = "https://ebackend-production-fac4.up.railway.app/api";

  // Get browser geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: -1.286389, lng: 36.817223 }); // Nairobi fallback
        }
      );
    } else {
      setUserLocation({ lat: -1.286389, lng: 36.817223 });
    }
  }, []);

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [horsesRes, unassignedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/horses`),
        fetch(`${API_BASE_URL}/unassigned`),
      ]);

      if (!horsesRes.ok) throw new Error("Failed to fetch horses");
      if (!unassignedRes.ok) throw new Error("Failed to fetch unassigned devices");

      const horsesData = await horsesRes.json();
      const unassignedData = await unassignedRes.json();

      // If backend returns coordinates, use them; otherwise, fake them around user
      const adjustedHorses =
        userLocation && horsesData.horses
          ? horsesData.horses.map((h, i) => ({
              ...h,
              coordinates: h.coordinates || {
                lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
                lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
              },
              speed: Number(h.speed) || Math.random() * 6,
              temperature: Number(h.temperature) || 37 + Math.random() * 2,
              heartRate: Number(h.heartRate) || 60 + Math.floor(Math.random() * 25),
            }))
          : horsesData.horses;

      setHorses(adjustedHorses);
      setUnassignedDevices(unassignedData.unassignedDevices);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) fetchData();
    const interval = setInterval(() => {
      if (userLocation) fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, [userLocation]);

  const handleHorseAdded = async () => {
    await fetchData();
    setIsAddingHorse(false);
  };

  return (
    <div className="space-y-6">
      {/* Map */}
      {userLocation && <MapWithNoSSR horses={horses} selectedHorse={horses.find(h => h.horseId === selectedHorse)} />}

      {/* Horse Details View */}
      {selectedHorse && (
        <DetailedHorseView
          horse={horses.find((h) => h.horseId === selectedHorse)}
          onClose={() => setSelectedHorse(null)}
        />
      )}

      {/* Header */}
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

      {/* Error / Last updated */}
      {error && <div className="text-red-500 bg-red-100 border border-red-300 p-3 rounded-md">{error}</div>}
      {lastUpdated && !error && <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>}

      {/* Horse cards */}
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
