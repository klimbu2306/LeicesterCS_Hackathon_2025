'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import parkJson from "../../parkingLocations.json";
import { useSearchParams } from 'next/navigation';

type ParkingSpot = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  openCloseTimes: string;
  prices: string;
};

export default function MapClient() {
  const searchParams = useSearchParams();
  const lat = searchParams.get('lat');
  const lon = searchParams.get('long'); 

  const latitude = lat ? parseFloat(lat) : 52.6100; // default: Leicester
  const longitude = lon ? parseFloat(lon) : -1.1140;

  useEffect(() => {
    const map = L.map('map', {
      center: [latitude,longitude],
      zoom: 15,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const parkingIcon = L.icon({
      iconUrl: '/icons/mapPinIcon.png',
      iconSize: [32, 49],
      iconAnchor: [16, 49],
      popupAnchor: [0, -49],
    });

    const spots = parkJson as ParkingSpot[];

    spots.forEach((spot) => {
      L.marker([spot.latitude, spot.longitude], { icon: parkingIcon })
        .addTo(map)
        .bindPopup("<b>"+spot.name+"</b><br>"+spot.prices+"<br><br>"+spot.description+"<br><br>"+spot.openCloseTimes);
    });

    return () => map.remove();
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}