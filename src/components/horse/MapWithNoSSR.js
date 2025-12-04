// components/HorseMetrics/MapWithNoSSR.jsx
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

const MapWithNoSSR = ({ horses, selectedHorse }) => {
  const [userLocation, setUserLocation] = useState(null);

  // ---- Get browser location ----
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: -1.286389, lng: 36.817223 }); // Nairobi fallback
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setUserLocation({ lat: -1.286389, lng: 36.817223 });
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // ---- Set Leaflet default marker icon (client only) ----
  if (typeof window !== "undefined") {
    const L = require("leaflet");
    const DefaultIcon = L.icon({
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }

  // ---- Map center logic ----
  const pos = (() => {
    if (selectedHorse) {
      return [
        selectedHorse.coordinates.lat,
        selectedHorse.coordinates.lng,
      ];
    }
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    if (horses && horses.length > 0) {
      return [horses[0].coordinates.lat, horses[0].coordinates.lng];
    }
    return [-1.286389, 36.817223]; // fallback Nairobi
  })();

  // ---- Zoom levels ----
  const zoom = selectedHorse ? 15 : 13;

  return (
    <MapContainer
      center={pos}
      zoom={zoom}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Horse selected → show single marker */}
      {selectedHorse ? (
        <Marker position={pos}>
          <Popup>
            <strong>{selectedHorse.name}</strong>
            <br />
            Location: {selectedHorse.location || "Unknown"}
            <br />
            Last updated: {selectedHorse.lastUpdated || "Unknown"}
          </Popup>
        </Marker>
      ) : (
        horses.map((horse) => (
          <Marker
            key={horse.horseId}
            position={[
              horse.coordinates.lat,
              horse.coordinates.lng,
            ]}
          >
            <Popup>
              <strong>{horse.name || "Unnamed"}</strong>
              <br />
              Location: {horse.location || "Unknown"}
              <br />
              Last updated: {horse.lastUpdated || "Unknown"}
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  );
};

export default MapWithNoSSR;
