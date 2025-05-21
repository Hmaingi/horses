import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const MapWithNoSSR = ({ horses, selectedHorse }) => {
  const position = selectedHorse
    ? [selectedHorse.coordinates.lat, selectedHorse.coordinates.lng]
    : [40.7178, -74.001];
  const zoom = selectedHorse ? 15 : 12;

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
      {selectedHorse ? (
        <Marker position={position}>
          <Popup>
            <strong>{selectedHorse.name}</strong>
            <br />
            Location: {selectedHorse.location}
            <br />
            Last updated: {selectedHorse.lastUpdated}
          </Popup>
        </Marker>
      ) : (
        horses.map((horse) => (
          <Marker
            key={horse.horseId}
            position={[horse.coordinates.lat, horse.coordinates.lng]}
          >
            <Popup>
              <strong>{horse.name}</strong>
              <br />
              Location: {horse.location}
              <br />
              Last updated: {horse.lastUpdated}
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  );
};

export default MapWithNoSSR;