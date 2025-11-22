'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';  // Make sure Leaflet's CSS is imported
import parkJson from "../../parkingLocations.json"

type ParkingSpot = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  openCloseTimes: string;
  prices: string;
};

const Map = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize the map
    const map = L.map('map', {
      center: [52.6100, -1.1140],  // University of Leicester coordinates
      zoom: 15,  // Zoom level
    });

    // Set up OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    
    // Define your custom icon
    const parkingIcon = L.icon({
      iconUrl: 'icons/64px-Map_marke.png',   // Path to your icon image
      iconSize: [32, 49],              // size of the icon [width, height]
      iconAnchor: [16, 49],            // point of the icon which will correspond to marker's location
      popupAnchor: [0, -49],           // point from which the popup should open relative to the iconAnchor
    });

    // Type cast JSON
    const parkingSpots: ParkingSpot[] = parkJson as ParkingSpot[];
    
    for (const spot of parkingSpots) {
      //console.log(`Name: ${spot.name}, Lat: ${spot.latitude}, Lng: ${spot.longitude}`);

      // Add a marker at University of Leicester
      L.marker([spot.latitude, spot.longitude], {icon: parkingIcon}).addTo(map)
        .bindPopup("<b>"+spot.name+"</b><br>"+spot.prices+"<br><br>"+spot.description+"<br><br>"+spot.openCloseTimes)
        .openPopup();
    }

    // Add a marker at University of Leicester
    //L.marker([52.6100, -1.1140]).addTo(map)
    //  .bindPopup('University of Leicester')
    //  .openPopup();

    // Cleanup on component unmount
    return () => map.remove();
  }, []);

  return (
    <div id="map" style={{ height: '100vh', width: '100%' }}></div>  // Ensure full screen height
  );
};

export default Map;
