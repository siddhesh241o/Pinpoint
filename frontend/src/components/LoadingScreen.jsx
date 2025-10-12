import React from 'react';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl font-semibold text-gray-800">Getting your location...</div>
          <div className="text-sm text-gray-500">Please allow location access</div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
