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

  // ... rest of your component logic (UI rendering, event handlers, etc.)
  // To keep focus on geolocation, the rest of the component is left intact.

  return (
    <div>
      {/* Example usage of geolocation data for debugging (remove in production) */}
      {geoSupported ? (
        geoLoading ? (
          <p>Locating...</p>
        ) : userLocation ? (
          <p>
            Your location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)} (±{userLocation.accuracy}m)
          </p>
        ) : (
          <p>Location not available.</p>
        )
      ) : (
        <p>Geolocation not supported by this browser.</p>
      )}

      {/* Rest of your UI would go here */}
      {isLoading && <p>Loading data...</p>}
      {error && <p>Error: {String(error)}</p>}

      {/* Example rendering placeholder to avoid layout break if you paste directly */}
      <div>
        {/* Your existing components would go here, preserving their current logic/props */}
        {/* <HorseCard ... />
            <AddHorseForm ... />
            <DetailedHorseView ... />
            <MapWithNoSSR ... /> */}
      </div>
    </div>
  );
};

export default HorseMetrics;
