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
  const [watchId, setWatchId] = useState(null);  
  const [supported, setSupported] = useState(true);  

  // Start watching on mount  
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
        // Do not silently fallback; surface error  
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
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }  
    );  

    setWatchId(id);  

    // Cleanup on unmount  
    return () => {  
      if (watchId != null) navigator.geolocation.clearWatch(watchId);  
    };  
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, []); // run once  

  // Optional manual refresh (not strictly needed with watch)  
  const refresh = useCallback(() => {  
    // If you want to force a one-shot fetch in addition to watch, you could implement a one-shot here.  
    // For now, we'll just retry by forcing a re-subscribe logic (not strictly necessary).  
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

      const [horsesRes, unassignedRes] = await Promise.all
