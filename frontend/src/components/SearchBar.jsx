import React, { useState } from 'react';

function SearchBar({ onSearch, onGoToMyLocation, isSearching }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleMyLocationClick = () => {
    setQuery(''); // Clear search query when going to my location
    onGoToMyLocation();
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-lg">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search location (e.g., Akurdi, Pune)"
            className="w-full px-5 py-3.5 rounded-xl shadow-lg border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
            disabled={isSearching}
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold transition-all transform hover:scale-105 disabled:hover:scale-100 text-lg"
        >
          {isSearching ? '⏳' : '🔍'}
        </button>
        <button
          type="button"
          onClick={handleMyLocationClick}
          className="px-5 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 font-semibold transition-all transform hover:scale-105 text-lg"
          title="Go to my location"
        >
          📍
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
