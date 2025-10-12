import React, { useState, useEffect, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import Map from './components/Map';
import SearchBar from './components/SearchBar';
import PinCreationForm from './components/PinCreationForm';
import LoadingScreen from './components/LoadingScreen';
import { getUserIdentity } from './utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [pins, setPins] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [newPinLocation, setNewPinLocation] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newTTL, setNewTTL] = useState('24');
  const [ttlError, setTTLError] = useState('');

  // Get user identity on initial load
  useEffect(() => {
    const identity = getUserIdentity();
    setCurrentUser(identity);
  }, []);

  const fetchPins = useCallback(async (lat, lon) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pins/nearby?lat=${lat}&lon=${lon}`);
      if (!response.ok) throw new Error('Failed to fetch pins');
      const data = await response.json();
      setPins(data || []);
    } catch (error) {
      console.error('Error fetching pins:', error);
    }
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = [latitude, longitude];
        setUserLocation(location);
        setMapCenter(location);
        fetchPins(latitude, longitude);
      },
      (error) => {
        console.error('Error getting user location:', error);
        const fallbackLocation = [18.651, 73.762];
        setUserLocation(fallbackLocation);
        setMapCenter(fallbackLocation);
        fetchPins(18.651, 73.762);
      }
    );
  }, [fetchPins]);

  const searchLocation = async (query) => {
    // ... search logic remains the same ...
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchedLocation(null);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        setSearchedLocation(newCenter);
        fetchPins(parseFloat(lat), parseFloat(lon));
      } else {
        alert('Location not found.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching for location.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGoToMyLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setSearchedLocation(null);
      fetchPins(userLocation[0], userLocation[1]);
    }
  };

  const handleMapClick = (latlng) => {
    setSearchedLocation(null);
    setNewPinLocation(latlng);
    setShowPopup(true);
  };

  const handleCancelPin = () => {
    setShowPopup(false);
    setNewPinLocation(null);
    setNewTitle('');
    setNewMessage('');
    setNewTTL('24');
    setTTLError('');
  };

  const handleTTLChange = (e) => {
    // ... TTL change logic remains the same ...
    const value = e.target.value;
    setNewTTL(value);
    const ttlNum = parseInt(value, 10);
    if (value === '' || isNaN(ttlNum) || !Number.isInteger(parseFloat(value)) || ttlNum < 1 || ttlNum > 72) {
      setTTLError('Must be a whole number between 1 and 72.');
    } else {
      setTTLError('');
    }
  };

  const handleSubmitPin = async () => {
    if (!newTitle.trim() || ttlError || !newPinLocation) return;
    
    const payload = {
      title: newTitle,
      message: newMessage,
      latitude: newPinLocation.lat,
      longitude: newPinLocation.lng,
      ttl_hours: parseInt(newTTL),
    };
    try {
      const response = await fetch(`${API_BASE_URL}/pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create pin');
      handleCancelPin();
      if (mapCenter) {
        fetchPins(mapCenter[0], mapCenter[1]);
      }
    } catch (error) {
      console.error('Error creating pin:', error);
      alert('Could not create pin.');
    }
  };

  if (!userLocation || !currentUser) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative h-screen w-screen bg-gray-50">
      <SearchBar 
        onSearch={searchLocation}
        onGoToMyLocation={handleGoToMyLocation}
        isSearching={isSearching}
      />
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700">
          👆 <span className="font-semibold text-blue-600">Tap map</span> to drop a pin
        </p>
      </div>

      <Map 
        userLocation={userLocation}
        pins={pins}
        newPinLocation={newPinLocation}
        onMapClick={handleMapClick}
        mapCenter={mapCenter}
        searchedLocation={searchedLocation}
        currentUser={currentUser}
      />

      {showPopup && (
        <PinCreationForm 
          title={newTitle}
          setTitle={setNewTitle}
          message={newMessage}
          setMessage={setNewMessage}
          ttl={newTTL}
          handleTtlChange={handleTTLChange}
          ttlError={ttlError}
          onSubmit={handleSubmitPin}
          onCancel={handleCancelPin}
        />
      )}
    </div>
  );
}

export default App;
