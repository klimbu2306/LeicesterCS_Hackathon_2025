"use client";

// Imports
import { useEffect, useState, useRef } from "react";
import L, { map } from "leaflet";
import "leaflet/dist/leaflet.css";
import parkJson from "../../parkingLocations.json";
import { useSearchParams } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";

// ParkingSpot type: Stores parking data from JSON
type ParkingSpot = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  openCloseTimes: string;
  busyHours: string[];
  prices: string;
};

export default function MapClient() {
  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lon = searchParams.get("long");

  const latitude = lat ? parseFloat(lat) : 52.62198494719722; // default: UOL
  const longitude = lon ? parseFloat(lon) : -1.1246224316026914;

  // Radius state (0.5km to 5km)
  const [radiusMeters, setRadiusMeters] = useState(1000);
  const radFiltering = useState(true); // Enable radius filtering

  var [lookLocation, setLookLocation] = useState([latitude, longitude]);
  var [currentZoom, setCurrentZoom] = useState(15);

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const map = L.map("map", {
      center: [lookLocation[0], lookLocation[1]],
      zoom: currentZoom,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const currentMarkerIcon = L.icon({
      iconUrl: "/icons/CurrentMarker.png",
      iconSize: [32, 49],
      iconAnchor: [16, 49],
      popupAnchor: [0, -49],
    });

    const parkingIcon_open = L.icon({
      iconUrl: "/icons/mapPinIcon_open.png",
      iconSize: [32, 49],
      iconAnchor: [16, 49],
      popupAnchor: [0, -49],
    });

    const parkingIcon_busy = L.icon({
      iconUrl: "/icons/mapPinIcon_busy.png",
      iconSize: [32, 49],
      iconAnchor: [16, 49],
      popupAnchor: [0, -49],
    });

    const parkingIcon_closed = L.icon({
      iconUrl: "/icons/mapPinIcon_closed.png",
      iconSize: [32, 49],
      iconAnchor: [16, 49],
      popupAnchor: [0, -49],
    });

    // Current location marker
    const currentLocationMarker = L.marker([latitude, longitude], {
      icon: currentMarkerIcon,
    }).bindPopup("Current location<br>"+`
      <button id="move_btn" style="
          padding:6px 10px;
          background:#2563eb;
          color:white;
          border:none;
          border-radius:6px;
          margin-top:8px;
          cursor:pointer;">
        Move this marker
      </button>
    `).addTo(map);

    currentLocationMarker.on("popupopen", () => {
      const btn = document.getElementById(`move_btn`);
      if (!btn) return;

      btn.addEventListener("click", () => {
        currentLocationMarker.remove();

        const c = map.getCenter();
        setCurrentZoom(map.getZoom());

        const tmp = enablePlacementMode(currentLocationMarker, map);

        setLookLocation(tmp);
        //setRadiusMeters(100);                  // reset radius
      });
    });

    // Draw dynamic radius circle
    const circle = L.circle([latitude, longitude], {
      radius: radiusMeters,
      color: "#2563eb",
      weight: 2,
      fillColor: "#3b82f680",
      fillOpacity: 0.3,
    }).addTo(map);

    const spots = parkJson as ParkingSpot[];
    const nowTime = getLocalTime12h();
    const nowDay = (new Date().getDay() + 6) % 7;

    spots.forEach((spot) => {
      const gmapsLink = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}&travelmode=driving`;
      const todayOpenClose = getOpenTimes(spot.openCloseTimes, nowDay);
      const isOpen = isTimeBetween(
        nowTime,
        todayOpenClose.open,
        todayOpenClose.close
      );
      const issBusy = isBusy(spot.busyHours, nowTime);

      // Radius filter
      if (radFiltering&&!isWithinRadius(
          latitude,
          longitude,
          spot.latitude,
          spot.longitude,
          radiusMeters
      )) {
        return;
      }

      const txt =
        "<b>" + spot.name +
        "</b><br>" +
        getOpenBusyHTML(isOpen, issBusy) + " : " + spot.prices +
        "<br><br>" +
        spot.description +
        "<br><br>" +
        spot.openCloseTimes +
        "<br><br>" +
        `<a href="${gmapsLink}" target="_blank" rel="noopener noreferrer" 
          style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:#4f46e5;color:white;border-radius:6px;text-decoration:none;font-weight:bold;">
          Start Journey
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                stroke-width="2" stroke="currentColor" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>`;

      L.marker([spot.latitude, spot.longitude], {
        icon: !isOpen
          ? parkingIcon_closed
          : issBusy
            ? parkingIcon_busy
            : parkingIcon_open,
      })
        .addTo(map)
        .bindPopup(txt);
    });

    return () => {
      map.remove();
    };
  }, [radiusMeters, latitude, longitude]); // <-- rerun map when radius changes

  return (
    <>
      {/* Vertical radius control at right-center */}
      <div className="absolute right-4 top-1/2 z-10000 -translate-y-1/2 pointer-events-auto">
        <div className="bg-black text-white p-3 rounded-xl shadow-lg flex flex-col items-center gap-3 border border-gray-700">
          <span className="text-sm font-semibold">
            {(radiusMeters / 1000).toFixed(1)} km
          </span>

          {/* Rotated range input to appear vertical */}
          <div className="flex items-center justify-center h-48">
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={radiusMeters}
              onChange={(e) => {
                setRadiusMeters(Number(e.target.value));
                if (mapRef.current) {
                  const c = mapRef.current.getCenter();
                  setLookLocation([c.lat, c.lng]);
                  setCurrentZoom(mapRef.current.getZoom());
                }
              }}
              className="w-24 h-2 appearance-none bg-gray-700 rounded-full
                       accent-white transform -rotate-90"
              style={{ touchAction: "none" }}
            />
          </div>

          <div className="text-xs text-gray-300">0.5 km — 5 km</div>
        </div>
      </div>

      {/* Map container */}
      <div id="map" style={{ height: "90dvh", width: "100%" }} />
    </>
  );
}

function getOpenBusyHTML(open: boolean, busy: boolean) {
  if (!open)
    return '<span style="color: #ff0000; font-weight: bold;">Closed</span>';
  if (busy)
    return '<span style="color: #ec8906ff; font-weight: bold;">Open - Busy</span>';
  return '<span style="color: #1cb317ff; font-weight: bold;">Open</span>';
}

function getLocalTime12h() {
  let t = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (t.startsWith("12:") && t.includes("AM")) {
    t = t.replace(/^12:/, "00:");
  }

  return t;
}

function isTimeBetween(target: String, start: String, end: String) {
  const toMinutes = (t: any) => {
    const [time, modifier] = t.split(" ");
    let [h, m] = time.split(":").map(Number);

    if (modifier.toLowerCase() === "pm" && h !== 12) h += 12;
    if (modifier.toLowerCase() === "am" && h === 12) h = 0;

    return h * 60 + m;
  };

  const t = toMinutes(target);
  const s = toMinutes(start);
  const e = toMinutes(end);

  if (s < e) return s <= t && t <= e;
  return t <= s || t <= e;
}

function getOpenTimes(openCloseTimes: String, day: number) {
  const tmp = openCloseTimes.split("<br>")[day];
  const openClose = tmp.substring(tmp.indexOf(":") + 2).split("-");
  return { open: openClose[0].trim(), close: openClose[1].trim() };
}

function isBusy(busyHours: String[], time: String) {
  if (busyHours.length === 0) return false;
  time = time.slice(0, 3) + "00" + time.slice(5);
  return busyHours.includes(time.toLowerCase());
}

// Show markers within the radius
function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radius: number
) {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radius;
}

function enablePlacementMode(marker: L.Marker, map: any) {
  let handler: any;

  handler = (e: any) => {
    const { lat, lng } = e.latlng;

    // Update the URL
    const newUrl = `http://localhost:3000/map?lat=${lat}&long=${lng}`;
    //window.history.pushState({}, "", newUrl);
    window.location.href = newUrl;

    // Reposition the marker
    marker.setLatLng([lat, lng]).addTo(map);

    // Remove the temporary click listener
    map.off("click", handler);
    
    return [lat, lng];
  };

  return map.on("click", handler);
}