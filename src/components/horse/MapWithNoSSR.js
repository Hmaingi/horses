import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

const MapWithNoSSR = ({ horses, selectedHorse }) => {
  if (typeof window !== "undefined") {
    const L = require("leaflet");
    const DefaultIcon = L.icon({
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }

  const position = selectedHorse
    ? [selectedHorse.coordinates.lat, selectedHorse.coordinates.lng]
    : horses.length > 0
    ? [horses[0].coordinates.lat, horses[0].coordinates.lng]
    : [-1.286389, 36.817223];

  const zoom = selectedHorse ? 15 : 12;

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selectedHorse ? (
        <Marker position={position}>
          <Popup>
            <strong>{selectedHorse.name}</strong>
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
              <strong>{h.name}</strong>
              <br />
              Location: {h.location || "Unknown"}
              <br />
              Last updated: {h.lastUpdated || "Unknown"}
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  );
};

export default MapWithNoSSR;

