// src/app/Components/MapWithSidebar.js
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import locationList from "@/data/locationList.json";

const Map = dynamic(
  () => import('./map').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="flex-1 flex items-center justify-center">Loading map...</div> 
  }
);

export default function MapWithSidebar() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

 
  return (
    <div className="flex h-screen w-full">
    
      <div className={`bg-black shadow-lg transition-all duration-300 ${
        'w-64'
      }`}>
        <div className="p-4 h-full overflow-y-auto">

          <ul className="space-y-2">
            {locationList.map((location) => (
              <li 
                key={location.id}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 hover:text-black ${
                  selectedLocation?.id === location.id ? 'bg-gray-100 text-black' : ''
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                {location.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

   
      <div className="flex-1 relative">
        <Map selectedLocation={selectedLocation} />
      </div>
    </div>
  );
}