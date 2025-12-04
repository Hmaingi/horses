import dynamic from "next/dynamic";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false });
const useMap = dynamic(() => import("react-leaflet").then(m => m.useMap), { ssr: false });

// Helper component to update map center when userLocation changes
function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

const MapWithNoSSR = ({ horses, selectedHorse, userLocation }) => {
  if (typeof window !== "undefined") {
    const L = require("leaflet");
    
    // Default horse marker
    const DefaultIcon = L.icon({
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    
    // Blue marker for user location
    const UserIcon = L.icon({
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: 'user-location-marker'
    });
    
    L.Marker.prototype.options.icon = DefaultIcon;
  }

  // Determine map center - prioritize user location for demo
  const position = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : selectedHorse
    ? [selectedHorse.coordinates.lat, selectedHorse.coordinates.lng]
    : horses.length > 0
    ? [horses[0].coordinates.lat, horses[0].coordinates.lng]
    : [-1.286389, 36.817223]; // Default Nairobi

  const zoom = userLocation ? 15 : selectedHorse ? 15 : 12;

  return (
    <div style={{ position: 'relative' }}>
      <style jsx global>{`
        .user-location-marker {
          filter: hue-rotate(200deg);
        }
      `}</style>
      
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={userLocation ? [userLocation.latitude, userLocation.longitude] : null} />
        
        {/* User location marker with accuracy circle */}
        {userLocation && (
          <>
            <Marker position={[userLocation.latitude, userLocation.longitude]}>
              <Popup>
                <strong>📍 Your Location</strong>
                <br />
                Lat: {userLocation.latitude.toFixed(6)}
                <br />
                Lng: {userLocation.longitude.toFixed(6)}
                <br />
                Accuracy: ±{Math.round(userLocation.accuracy)}m
              </Popup>
            </Marker>
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={userLocation.accuracy}
              pathOptions={{
                color: '#3388ff',
                fillColor: '#3388ff',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          </>
        )}
        
        {/* Horse markers */}
        {selectedHorse ? (
          <Marker position={[selectedHorse.coordinates.lat, selectedHorse.coordinates.lng]}>
            <Popup>
              <strong> {selectedHorse.name}</strong>
              <br />
              Location: {selectedHorse.location || "Unknown"}
              <br />
              Last updated: {selectedHorse.lastUpdated || "Unknown"}
            </Popup>
          </Marker>
        ) : (
          horses.map((h) => (
            <Marker key={h.horseId} position={[h.coordinates.lat, h.coordinates.lng]}>
              <Popup>
                <strong> {h.name}</strong>
                <br />
                Location: {h.location || "Unknown"}
                <br />
                Last updated: {h.lastUpdated || "Unknown"}
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>
      
      {userLocation && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <strong>Your Location</strong>
          <div>±{Math.round(userLocation.accuracy)}m accuracy</div>
        </div>
      )}
    </div>
  );
};

export default MapWithNoSSR;
