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

  // ---- FIX 1: Browser Geolocation ----
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: -1.286389, lng: 36.817223 }); // Nairobi fallback
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      err => {
        console.error("Geo error:", err);
        setUserLocation({ lat: -1.286389, lng: 36.817223 });
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // ---- Helper: ensure numbers are real numbers ----
  const safeNum = v => (typeof v === "string" ? parseFloat(v) : v);

  // ---- Fetch horses + fix values ----
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const horsesRes = await fetch(`${API_BASE_URL}/horses`);
      const unassignedRes = await fetch(`${API_BASE_URL}/unassigned`);

      if (!horsesRes.ok) throw new Error("Failed to fetch horses");
      if (!unassignedRes.ok) throw new Error("Failed unassigned devices");

      const horsesData = await horsesRes.json();
      const unassignedData = await unassignedRes.json();

      // Fix numeric values
      const cleaned = horsesData.horses.map(h => ({
        ...h,
        heartRate: safeNum(h.heartRate),
        temperature: safeNum(h.temperature),
        speed: safeNum(h.speed),
        coordinates: {
          lat: safeNum(h.coordinates.lat),
          lng: safeNum(h.coordinates.lng)
        }
      }));

      setHorses(cleaned);
      setUnassignedDevices(unassignedData.unassignedDevices);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Fetch once location is known ----
  useEffect(() => {
    if (userLocation) fetchData();
  }, [userLocation]);

  // ---- Auto-refresh every 60 seconds ----
  useEffect(() => {
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
      {selectedHorse && (
        <DetailedHorseView
          horse={horses.find(h => h.horseId === selectedHorse)}
          onClose={() => setSelectedHorse(null)}
        />
      )}

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

      {error && (
        <div className="text-red-500 bg-red-100 border border-red-300 p-3 rounded-md">
          {error}
        </div>
      )}
      {lastUpdated && !error && (
        <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
      )}

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
          {horses.map(horse => (
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


