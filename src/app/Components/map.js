"use client";
import React, {
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef,
} from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import locationList from "@/data/locationList.json";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DriftMarker from "leaflet-drift-marker";



const locationMarker = new L.Icon({
  iconUrl: "/maps-and-flags.png",
  iconSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = locationMarker;

const buildingIcon = new L.Icon({
  iconUrl: "/a-tall-building-background.png",
  iconSize: [100, 100],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});


const carIcon = new L.Icon({
  iconUrl: "/car.png",
  iconSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function FlyToLocation({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location.coordinates, 15, {
        duration: 1,
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

function AnimatedDriftMarker({
  position,
  duration = 1000,
  icon,
  onMoved,
}) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!markerRef.current) {
      const marker = new DriftMarker(position, {
        icon: icon || new L.Icon.Default(),
      });
      marker.addTo(map);
      markerRef.current = marker;
    } else {
      markerRef.current.slideTo(position, {
        duration,
        keepAtCenter: false,
      });
    }

    if (onMoved) {
      onMoved(position);
    }
  }, [position, duration, icon, map, onMoved]);

  return null;
}

function HKMap({ selectedLocation }) {
  const [carPosition, setCarPosition] = useState([22.2758, 114.1455]);
  const [traveledPath, setTraveledPath] = useState([[22.2758, 114.1455]]);

  console.log("Selected Location:", selectedLocation);
  const [rawGeoData, setRawGeoData] = useState(null);
  const [activePopup, setActivePopup] = useState(false);

  useEffect(() => {
    fetch("../../../merged.json")
      .then((response) => response.json())
      .then((data) => setRawGeoData(data))
      .catch((error) => console.error("Error fetching GeoJSON:", error));
  });

  useEffect(() => {
    const path = [
      [22.2758, 114.1455],
      [22.2823, 114.1585],
      [22.2975, 114.1722],
      [22.3193, 114.1694],
    ];

    let i = 1;
    const interval = setInterval(() => {
      if (i < path.length) {
        setCarPosition(path[i]);
        setTraveledPath((prev) => [...prev, path[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Style for GeoJSON features
  const geoJsonStyle = useMemo(
    () => ({
      color: "#3388ff",
      weight: 2,
      fillOpacity: 0.2,
    }),
    []
  );

  //custom icon

  //This code is for tune the performance
  const optimizedGeoJSON = useMemo(() => {
    if (!rawGeoData) return null;

    return {
      ...rawGeoData,
      features: rawGeoData.features
        .filter((feature) => feature.properties.CLASS === "BDRY")
        .map((feature) => ({
          ...feature,
          geometry: simplifyGeometry(feature.geometry),
        })),
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* Floating button container */}
      <div className="absolute top-4 left-4 z-[1000] ml-8 space-x-2">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
          onClick={() => {
            setActivePopup(!activePopup);
          }}
        >
          Button 1
        </button>
      </div>

      <MapContainer
        center={[22.40048, 114.20955]} // Hong Kong
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-screen"
      >
        <TileLayer
          attribution="Test"
          url="https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/wgs84/{z}/{x}/{y}.png"
        />

        <CustomAttribution />



        <AnimatedDriftMarker
          position={carPosition}
          duration={2000}
          icon={
            carIcon
          }
        />

        {selectedLocation && ( // animation for the selected location
          <FlyToLocation location={selectedLocation} />
        )}

        <Marker position={[22.3193, 114.1694]} icon={buildingIcon}>
          <Popup>3d building</Popup>
        </Marker>

        {locationList.map((location) => (
          <Marker key={location.id} position={location.coordinates}>
            <Popup>
              <div className="popup-content">
                <h3>HI {location.name}</h3>
              </div>
            </Popup>
          </Marker>
        ))}

        {optimizedGeoJSON && (
          <GeoJSON
            key="hk-boundaries" // Helps React identify stable components
            data={optimizedGeoJSON}
            style={geoJsonStyle}
          />
        )}
      </MapContainer>

      {activePopup && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
          <div className="bg-black p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-200">
            <h2 className="text-xl font-bold mb-3">Confirmation</h2>
            <p className="mb-4">
              Click anywhere on the map to close this popup.
            </p>
            <div className="flex space-x-3">
              {/* <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={() => alert('Action triggered!')}
              >
                Action
              </button> */}
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded"
                onClick={() => setActivePopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HKMap;
