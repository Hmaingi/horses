"use client";  
import React, { useState, useEffect, useCallback } from "react";  
import HorseCard from "./HorseCard";  
import AddHorseForm from "./AddHorseForm";  
import DetailedHorseView from "./DetailedHorseView";  
import MapWithNoSSR from "./MapWithNoSSR";  

// Geolocation hook (continuous tracking with watchPosition)
function useGeolocationContinuous() {
  const [coords, setCoords] = useState(null); // { latitude, longitude, accuracy }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setSupported(false);
      setError(new Error("Geolocation is not supported by this browser."));
      setLoading(false);
      return;
    }

    setLoading(true);

    // Use watchPosition for continuous updates
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });
        setError(null);
        setLoading(false);
      },
      (err) => {
        // Surface error (do not silently fallback)
        let message = "Geolocation error.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Location permission denied.";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case err.TIMEOUT:
            message = "Location request timed out.";
            break;
          default:
            message = "Unknown geolocation error.";
        }
        setError(new Error(message));
        setCoords(null);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,  // allow up to 5 seconds old data (faster lock)
        timeout: 30000      // longer timeout for initial lock
      }
    );

    // Cleanup on unmount
    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, []); // run once on mount

  // Optional manual refresh (not strictly needed with watch)
  const refresh = useCallback(() => {
    // Could implement a one-shot fetch here if desired.
  }, []);

  return { coords, loading, error, supported, refresh };
}

const HorseMetrics = () => {
  const [horses, setHorses] = useState([]);
  const [unassignedDevices, setUnassignedDevices] = useState([]);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingHorse, setIsAddingHorse] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Live user location (continuous)
  const { coords: userLocation, loading: geoLoading, error: geoError, supported: geoSupported } = useGeolocationContinuous();

  const API_BASE_URL = "https://ebackend-production-fac4.up.railway.app/api";

  // --- Fetch horses and unassigned devices ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [horsesRes, unassignedRes] = await Promise.all(
        [
          fetch(`${API_BASE_URL}/horses`).then((r) => r.json()),
          fetch(`${API_BASE_URL}/unassigned-devices`).then((r) => r.json()),
        ]
      );

      setHorses(horsesRes || []);
      setUnassignedDevices(unassignedRes || []);
      setLastUpdated(new Date().toISOString());
      setIsLoading(false);
    } catch (e) {
      setError(e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      {/* Geolocation status for debugging */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        {geoSupported ? (
          geoLoading ? (
            <p className="text-blue-700 dark:text-blue-300">🔍 Locating your position...</p>
          ) : userLocation ? (
            <p className="text-green-700 dark:text-green-300">
              ✅ Your location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)} (±{Math.round(userLocation.accuracy)}m)
            </p>
          ) : (
            <p className="text-yellow-700 dark:text-yellow-300">⚠️ Location not available.</p>
          )
        ) : (
          <p className="text-red-700 dark:text-red-300">❌ Geolocation not supported by this browser.</p>
        )}
        {geoError && <p className="text-red-600 dark:text-red-400 mt-2">Error: {geoError.message}</p>}
      </div>

      {/* Map with user location */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Live Location Map</h2>
        <MapWithNoSSR 
          horses={horses} 
          selectedHorse={selectedHorse}
          userLocation={userLocation}
        />
      </div>

      {/* Loading and error states */}
      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading horse data...</p>}
      {error && <p className="text-red-600 dark:text-red-400">Error: {String(error)}</p>}

      {/* Horse cards grid */}
      {!isLoading && horses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {horses.map((horse) => (
            <HorseCard 
              key={horse.horseId} 
              horse={horse} 
              onViewDetails={() => setSelectedHorse(horse)}
            />
          ))}
        </div>
      )}

      {/* Add horse form */}
      {isAddingHorse && (
        <AddHorseForm 
          onClose={() => setIsAddingHorse(false)}
          onSuccess={fetchData}
          unassignedDevices={unassignedDevices}
        />
      )}

      {/* Detailed horse view */}
      {selectedHorse && (
        <DetailedHorseView 
          horse={selectedHorse}
          onClose={() => setSelectedHorse(null)}
        />
      )}
    </div>
  );
};

export default HorseMetrics;
