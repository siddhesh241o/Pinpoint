import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import PinPopupContent from './PinPopupContent'; 

function MapController({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
}
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}


function Map({ userLocation, pins, newPinLocation, onMapClick, mapCenter, searchedLocation, currentUser }) {
  return (
    <MapContainer 
      center={userLocation} 
      zoom={16} 
      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
      zoomControl={true}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={mapCenter} />
      <MapClickHandler onMapClick={onMapClick} />

      {/* User location marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={L.divIcon({
            className: 'current-location-icon',
            html: `<div class="relative"><div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-ping absolute top-0 left-0"></div><div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Popup>Your Location</Popup>
        </Marker>
      )}
      
      {/* Searched location marker */}
      {searchedLocation && (
        <Marker
          position={searchedLocation}
          icon={L.divIcon({
            className: 'searched-location-icon',
            html: `<div class="relative flex items-center justify-center"><div class="w-5 h-5 bg-purple-500 rounded-full border-2 border-white animate-pulse"></div></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        >
            <Popup>Searched Location</Popup>
        </Marker>
      )}

      {/* Render all pins */}
      {pins.map((pin) => {
        const truncatedTitle = pin.title.length > 25 ? pin.title.slice(0, 25) + '…' : pin.title;
        return (
          <Marker 
            key={pin.pin_id} 
            position={[pin.latitude, pin.longitude]} 
            icon={L.divIcon({
              className: 'custom-pin-with-label',
              html: `
                <div class="flex flex-col items-center">
                  <div class="bg-gray-800 text-white px-3 py-1.5 rounded-lg shadow-lg mb-1 whitespace-nowrap text-xs font-semibold border-2 border-white">
                    ${truncatedTitle}
                  </div>
                  <div class="text-3xl" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>
                </div>
              `,
              iconSize: [150, 50],
              iconAnchor: [75, 50],
              popupAnchor: [0, -50],
            })}
          >
            {/* The Popup now renders our new, dedicated component */}
            <Popup>
              <PinPopupContent pin={pin} currentUser={currentUser} />
            </Popup>
          </Marker>
        );
      })}
      
      {/* Temporary new pin marker */}
      {newPinLocation && (
        <Marker
          position={newPinLocation}
          icon={new L.Icon.Default({ className: 'leaflet-marker-draggable' })}
        />
      )}
    </MapContainer>
  );
}

export default Map;

