"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // use client-side navigation

  const handleSearch = async () => {
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }
    setError("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
      );
      const data = await res.json();
      if (!data || data.length === 0) {
        setError("Location not found");
        return;
      }

      router.push(`/map?lat=${data[0].lat}&long=${data[0].lon}`);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch coordinates");
    }
  };

  const handleCurrentLocation = () => {
    //console.log("Fetching current location...");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    //console.log("Requesting geolocation...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        //console.log("Location recieved at : ", position.coords);
        router.push(`/map?lat=${latitude}&long=${longitude}`);
      },
      () => setError("Unable to retrieve your location")
    );
    
  };

  return (
    <div className="mt-8 flex flex-col items-center text-center px-4 sm:px-0">
      <p className="text-white text-lg sm:text-xl max-w-xl mb-4">
        Find parking near you quickly and easily. Enter a location or use your current location.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
        {/* Search Input with Icon */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
            🔍
          </span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter a city or address"
            className="w-full rounded-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleSearch}
          className="rounded-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-white font-semibold"
        >
          Search
        </button>

        <button
          onClick={handleCurrentLocation}
          className="rounded-full bg-gray-600 hover:bg-gray-700 px-4 py-2 text-white font-semibold"
        >
          Use Current Location
        </button>
      </div>

      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  );
}
