import React from 'react';

function PinCreationForm({
  title,
  setTitle,
  message,
  setMessage,
  ttl,
  handleTtlChange,
  ttlError,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-30 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-md flex flex-col gap-5 border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">📌 Create Pin</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Title</label>
          <input
            type="text"
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
            placeholder="A short, catchy title for the map"
            maxLength="50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Message (Optional)</label>
          <textarea
            className="w-full p-3 border-2 border-gray-200 rounded-xl h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
            placeholder="Add more details here..."
            maxLength="280"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ttl-input" className="text-sm font-semibold text-gray-700">
            ⏱️ Expires in (hours)
          </label>
          <input
            id="ttl-input"
            type="number"
            min="1"
            max="72"
            step="1"
            className={`p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
              ttlError 
                ? 'border-red-400 focus:ring-red-500' 
                : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'
            }`}
            placeholder="Enter hours (1-72)"
            value={ttl}
            onChange={handleTtlChange}
          />
          {ttlError && (
            <div className="flex items-center gap-1 text-red-600 text-xs">
              <span>⚠️</span>
              <span>{ttlError}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-all transform hover:scale-105"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all transform ${
              !title.trim() || ttlError
                ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
            onClick={onSubmit}
            disabled={!title.trim() || !!ttlError}
          >
            Create Pin
          </button>
        </div>
      </div>
    </div>
  );
}

export default PinCreationForm;

