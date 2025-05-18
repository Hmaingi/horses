"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
            key={horse.id}
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