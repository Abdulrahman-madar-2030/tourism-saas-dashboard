"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix leaflet marker icon issue
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LocationMarker({ position, setPosition, readOnly }: any) {
  useMapEvents({
    click(e) {
      if (!readOnly && setPosition) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

export default function MapPicker({
  lat,
  lng,
  onChange,
  error,
  readOnly = false,
  title,
}: {
  lat: string | number;
  lng: string | number;
  onChange?: (lat: string, lng: string) => void;
  error?: string;
  readOnly?: boolean;
  title?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-muted animate-pulse rounded-lg flex items-center justify-center text-xs text-muted-foreground">
        جاري تحميل الخريطة...
      </div>
    );
  }

  const defaultPosition: [number, number] = [24.7136, 46.6753]; // Riyadh
  const position: [number, number] | null =
    lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))
      ? [Number(lat), Number(lng)]
      : null;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {title !== undefined ? (
        title ? (
          <span className="block text-sm font-medium text-foreground">
            {title}
          </span>
        ) : null
      ) : (
        <span className="block text-sm font-medium text-foreground">
          اختر الموقع على الخريطة <span className="text-destructive mr-1">*</span>
        </span>
      )}
      <div
        className={`w-full h-64 rounded-lg overflow-hidden border ${
          error ? "border-destructive" : "border-border"
        } relative z-0`}
      >
        <MapContainer
          center={position || defaultPosition}
          zoom={position ? 13 : 5}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            readOnly={readOnly}
            setPosition={(pos: [number, number]) => {
              if (!readOnly && onChange) {
                onChange(pos[0].toFixed(6), pos[1].toFixed(6));
              }
            }}
          />
        </MapContainer>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
