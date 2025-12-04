"use client";  
import React, { useState, useEffect, useCallback } from "react";  
import HorseCard from "./HorseCard";  
import AddHorseForm from "./AddHorseForm";  
import DetailedHorseView from "./DetailedHorseView";  
import MapWithNoSSR from "./MapWithNoSSR";  

// Geolocation hook (continuous tracking with watchPosition)
function useGeolocationContinuous() {
  const [coords, setCoords] = useState(null);
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

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });
        setError(null);
        setLoading(false);
      },
      (err) => {
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
        maximumAge: 5000,
        timeout: 30000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, []);

  const refresh = useCallback(() => {}, []);

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
  const [fetchTime, setFetchTime] = useState(null);

  const { coords: userLocation, loading: geoLoading, error: geoError, supported: geoSupported } = useGeolocationContinuous();

  const API_BASE_URL = "https://ebackend-production-fac4.up.railway.app/api";

  // Fetch with timeout
  const fetchWithTimeout = async (url, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout/1000}s`);
      }
      throw err;
    }
  };

  const fetchData = useCallback(async () => {
    const startTime = Date.now();
    try {
      setIsLoading(true);
      setError(null);

      console.log("Starting API fetch...");
      
      const [horsesRes, unassignedRes] = await Promise.all([
        fetchWithTimeout(`${API_BASE_URL}/horses`, 15000)
          .then((r) => {
            console.log("Horses response received");
            return r.json();
          })
          .catch((err) => {
            console.error("Horses fetch error:", err);
            return [];
          }),
        fetchWithTimeout(`${API_BASE_URL}/unassigned-devices`, 15000)
          .then((r) => {
            console.log("Unassigned devices response received");
            return r.json();
          })
          .catch((err) => {
            console.error("Unassigned devices fetch error:", err);
            return [];
          }),
      ]);

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      setHorses(horsesRes || []);
      setUnassignedDevices(unassignedRes || []);
      setLastUpdated(new Date().toISOString());
      setFetchTime(duration);
      setIsLoading(false);
      
      console.log(`Data fetched in ${duration}s`);
    } catch (e) {
      console.error("Fetch error:", e);
      setError(e);
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchData();
    // Only run once on mount
  }, []);

  return (
    <div className="p-6">
      {/* Geolocation status */}
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

      {/* API Status */}
      {isLoading && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300">
            ⏳ Loading horse data from API... This may take a moment.
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            If this takes too long, the API server might be slow or sleeping (common with free hosting)
          </p>
        </div>
      )}

      {fetchTime && (
        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-400">
          Last fetch: {fetchTime}s | Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          <button 
            onClick={fetchData} 
            className="ml-4 text-blue-600 dark:text-blue-400 hover:underline"
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
        </div>
      )}

      {/* Map with user location */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Live Location Map</h2>
        <MapWithNoSSR 
          horses={horses} 
          selectedHorse={selectedHorse}
          userLocation={userLocation}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">❌ Error: {String(error.message || error)}</p>
          <button 
            onClick={fetchData} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Horse cards grid */}
      {!isLoading && horses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            Horses ({horses.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {horses.map((horse) => (
              <HorseCard 
                key={horse.horseId} 
                horse={horse} 
                onViewDetails={() => setSelectedHorse(horse)}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && horses.length === 0 && !error && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">No horses found</p>
          <button 
            onClick={() => setIsAddingHorse(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add First Horse
          </button>
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
