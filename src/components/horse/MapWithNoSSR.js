// components/HorseMetrics/MapWithNoSSR.jsx
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const MapWithNoSSR = ({ horses = [], selectedHorse = null }) => {
  // Set up Leaflet icons only on the client side
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
    // Only override once
    if (!L.Marker.prototype.options.icon || L.Marker.prototype.options.icon === undefined) {
      L.Marker.prototype.options.icon = DefaultIcon;
    } else {
      L.Marker.prototype.options.icon = DefaultIcon;
    }
  }

  // Determine map center
  const hasValidHorseCoords = (h) =>
    h &&
    h.coordinates &&
    typeof h.coordinates.lat === "number" &&
    typeof h.coordinates.lng === "number";

  const defaultPosition =
    horses && horses.length > 0 && hasValidHorseCoords(horses[0])
      ? [horses[0].coordinates.lat, horses[0].coordinates.lng]
      : [-1.286389, 36.817223]; // fallback: Nairobi CBD

  const position = selectedHorse && hasValidHorseCoords(selectedHorse)
    ? [selectedHorse.coordinates.lat, selectedHorse.coordinates.lng]
    : defaultPosition;

  // Define zoom (previously missing)
  const zoom = selectedHorse ? 16 : 14;

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {selectedHorse && hasValidHorseCoords(selectedHorse) ? (
        <Marker key={selectedHorse.horseId || "selected"} position={position}>
          <Popup>
            <strong>{selectedHorse.name || "Unnamed"}</strong>
            <br />
            Location: {selectedHorse.location || "Unknown"}
            <br />
            Last updated: {selectedHorse.lastUpdated || "Unknown"}
          </Popup>
        </Marker>
      ) : (
        (horses || []).map((horse) => {
          if (!hasValidHorseCoords(horse)) return null;
          return (
            <Marker
              key={horse.horseId || `${horse.name}-${horse.coordinates.lat}-${horse.coordinates.lng}`}
              position={[horse.coordinates.lat, horse.coordinates.lng]}
            >
              <Popup>
                <strong>{horse.name || "Unnamed"}</strong>
                <br />
                Location: {horse.location || "Unknown"}
                <br />
                Last updated: {horse.lastUpdated || "Unknown"}
              </Popup>
            </Marker>
          );
        })
      )}
    </MapContainer>
  );
};

export default MapWithNoSSR;

