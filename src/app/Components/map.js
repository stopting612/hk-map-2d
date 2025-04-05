"use client";
import React, { useEffect, useMemo, useCallback, useState} from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup, } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import locationList from "@/data/locationList.json";

// Fix for missing Leaflet marker icons (required for React-Leaflet)
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});


function FlyToLocation({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location.coordinates, 15, {
        duration: 1
      });
    }
  }, [location, map]);

  return null;
}

function CustomAttribution() {
  const map = useMap();

  useEffect(() => {
    // Remove the footer , the footer will show the plugin  leaflet information 
    map.attributionControl.remove();
  }, [map]);

  return null;
}

function LocationFinder() {
  const map = useMap();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    // Get user location when component mounts
    map.locate({
      setView: true,    // Center map on location
      maxZoom: 16,      // Appropriate zoom level
      timeout: 10000    // 10 second timeout
    })
    .on('locationfound', (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 16); // Smooth zoom to location
    })
    .on('locationerror', (err) => {
      console.error("Location access denied:", err.message);
      // Default to Hong Kong coordinates if denied
      const hkCoords = L.latLng(22.3193, 114.1694);
      setPosition(hkCoords);
      map.flyTo(hkCoords, 13);
    });

  }, [map]);

  return position ? (
    <Marker position={position} icon={userIcon}>
      <Popup>You are here</Popup>
    </Marker>
  ) : null;
}



function HKMap({ selectedLocation }) {
  console.log("Selected Location:", selectedLocation);
  const [rawGeoData, setRawGeoData] = useState(null);
  const [activePopup, setActivePopup] = useState(null);


  useEffect(() => {
    fetch('../../../merged.json')
      .then(response => response.json())
      .then(data => setRawGeoData(data))
      .catch(error => console.error('Error fetching GeoJSON:', error));
  })

  // Style for GeoJSON features
  const geoJsonStyle = useMemo(() => ({
    color: '#3388ff',
    weight: 2,
    fillOpacity: 0.2
  }), []);


  
  //This code is for tune the performance 
  const optimizedGeoJSON = useMemo(() => {
    if (!rawGeoData) return null;
    
    return {
      ...rawGeoData,
      features: rawGeoData.features        
        .filter(feature => feature.properties.CLASS === 'BDRY')
        .map(feature => ({
          ...feature,
          geometry: simplifyGeometry(feature.geometry) 
        }))
    };
  }, []); 



  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[22.3193, 114.1694]} // Hong Kong coordinates
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        bounds={[[22.3193, 114.1694], [22.3964, 114.1095]]} // Bounds for Hong Kong
        maxBounds={[[22.15, 113.8], [22.6, 114.5]]} // Prevent panning outside of Hong Kong
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <CustomAttribution />

         {/* This will automatically locate user on mount */}
      <LocationFinder />
        
        {selectedLocation // animation for the selected location
         && <FlyToLocation location={selectedLocation} />}


      {
        locationList.map((location) => (
          <Marker key={location.id} position={location.coordinates}>
        
            <Popup>
            <div className="popup-content">
              <h3>HI {location.name}</h3>
    
            </div>
          </Popup>
        
          </Marker>
        ))
      }

        {optimizedGeoJSON && (
          <GeoJSON
            key="hk-boundaries" // Helps React identify stable components
            data={optimizedGeoJSON}
            style={geoJsonStyle}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default HKMap;
