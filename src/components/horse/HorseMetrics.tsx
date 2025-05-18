
"use client";
import React, { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  HeartIcon,
  LocationIcon,
  SpeedIcon,
  TemperatureIcon,
} from "@/icons";

// Mock function to simulate Firebase interaction
// In a real application, replace with actual Firebase functions
const mockFirebase = {
  collection: (name) => ({
    get: async () => ({
      docs: mockHorses.map(horse => ({
        id: horse.id,
        data: () => horse
      }))
    }),
    add: async (data) => {
      const newId = Math.max(...mockHorses.map(h => h.id)) + 1;
      const newHorse = { id: newId, ...data };
      mockHorses.push(newHorse);
      return { id: newId };
    }
  })
};

// Initial mock data
let mockHorses = [
  {
    id: 1,
    name: "Thunder",
    heartRate: 42,
    location: "Pasture 3",
    temperature: 37.5,
    oxygenSaturation: 98,
    speed: 0,
    coordinates: { lat: 40.7128, lng: -74.006 },
    lastUpdated: "5m ago",
    status: "normal",
    behavioralInsights: "Normal gait pattern",
    image: "/api/placeholder/300/200"
  },
  {
    id: 2,
    name: "Storm",
    heartRate: 45,
    location: "Stable 2",
    temperature: 38.2,
    oxygenSaturation: 97,
    speed: 0,
    coordinates: { lat: 40.7228, lng: -73.996 },
    lastUpdated: "2m ago",
    status: "normal",
    behavioralInsights: "Slightly favoring left hind leg",
    image: "/api/placeholder/300/200"
  },
];

export const HorseMetrics = () => {
  const [horses, setHorses] = useState([]);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingHorse, setIsAddingHorse] = useState(false);
  const [newHorse, setNewHorse] = useState({
    name: "",
    location: "",
    status: "normal"
  });

  // Fetch horses from Firestore (mocked)
  useEffect(() => {
    const fetchHorses = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be your Firebase code:
        // const horsesRef = firebase.firestore().collection('horses');
        // const snapshot = await horsesRef.get();
        const snapshot = await mockFirebase.collection('horses').get();
        
        const horsesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setHorses(horsesData);
      } catch (error) {
        console.error("Error fetching horses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHorses();
  }, []);

  const handleAddHorse = async () => {
    if (!newHorse.name) return;
    
    try {
      setIsLoading(true);
      
      // In a real app, this would be your Firebase code:
      // const horsesRef = firebase.firestore().collection('horses');
      // const docRef = await horsesRef.add({
      const docRef = await mockFirebase.collection('horses').add({
        ...newHorse,
        heartRate: Math.floor(Math.random() * 10) + 38,
        temperature: (Math.random() * 1.5 + 37).toFixed(1),
        oxygenSaturation: Math.floor(Math.random() * 5) + 95,
        speed: 0,
        coordinates: { lat: 40.7128 + Math.random() * 0.05, lng: -74.006 + Math.random() * 0.05 },
        lastUpdated: "Just now",
        behavioralInsights: "Not enough data",
        image: "/api/placeholder/300/200"
      });
      
      // Refresh horses list
      const snapshot = await mockFirebase.collection('horses').get();
      const horsesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setHorses(horsesData);
      setIsAddingHorse(false);
      setNewHorse({ name: "", location: "", status: "normal" });
    } catch (error) {
      console.error("Error adding horse:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Find the selected horse data
  const selectedHorseData = horses.find(horse => horse.id === selectedHorse);

  // Render a simple map placeholder
  const renderMap = (horse) => {
    return (
      <div className="relative h-64 w-full bg-blue-50 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-blue-500 text-sm">Map showing location at coordinates: {horse.coordinates.lat.toFixed(4)}, {horse.coordinates.lng.toFixed(4)}</div>
        </div>
        <div className="absolute w-4 h-4 bg-red-500 rounded-full" 
             style={{ 
               left: `${((horse.coordinates.lng + 74.01) / 0.05) * 100}%`, 
               top: `${((40.73 - horse.coordinates.lat) / 0.05) * 100}%` 
             }}>
        </div>
      </div>
    );
  };

  // Handle selecting a horse to view details
  const viewHorseDetails = (horse) => {
    setSelectedHorse(horse.id === selectedHorse ? null : horse.id);
  };

  // Add horse form
  const renderAddHorseForm = () => {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add New Horse</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horse Name</label>
            <input 
              type="text" 
              value={newHorse.name} 
              onChange={(e) => setNewHorse({...newHorse, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              placeholder="Enter horse name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input 
              type="text" 
              value={newHorse.location} 
              onChange={(e) => setNewHorse({...newHorse, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              placeholder="Enter current location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={newHorse.status}
              onChange={(e) => setNewHorse({...newHorse, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="normal">Normal</option>
              <option value="attention">Needs Attention</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 mt-2">
            <button 
              onClick={() => setIsAddingHorse(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddHorse}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={!newHorse.name}
            >
              Add Horse
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Full screen detailed horse view
  const renderDetailedHorseView = () => {
    if (!selectedHorseData) return null;

    return (
      <div className=" bg-white dark:bg-gray-900 z-150 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {selectedHorseData.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedHorseData.id}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge size="lg" color={selectedHorseData.status === "normal" ? "success" : selectedHorseData.status === "attention" ? "warning" : "error"}>
                {selectedHorseData.status}
              </Badge>
              <button 
                onClick={() => setSelectedHorse(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Map and primary metrics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map with location */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Location</h3>
                {renderMap(selectedHorseData)}
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Current location: <span className="font-medium">{selectedHorseData.location}</span>
                </div>
              </div>

              {/* Vitals */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Vital Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <HeartIcon className="size-5 text-pink-500" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Heart Rate</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedHorseData.heartRate} <span className="text-base font-normal">BPM</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Normal range: 36-48 BPM
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TemperatureIcon className="size-5 text-red-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Temperature</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedHorseData.temperature} <span className="text-base font-normal">°C</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Normal range: 37.2-38.3°C
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <SpeedIcon className="size-5 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Speed</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedHorseData.speed} <span className="text-base font-normal">km/h</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Current activity: {selectedHorseData.speed > 0 ? "Moving" : "Stationary"}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="text-green-500">O²</div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Oxygen Saturation</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedHorseData.oxygenSaturation} <span className="text-base font-normal">%</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Normal range: 95-100%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Additional information */}
            <div className="space-y-6">
              {/* Behavioral insights */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Behavioral Insights</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedHorseData.behavioralInsights}
                </p>
              </div>

              {/* Activity log */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Activity Log</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                    <div>
                      <p className="font-medium">Temperature check</p>
                      <p className="text-sm text-gray-500">{selectedHorseData.lastUpdated}</p>
                    </div>
                    <span className="text-green-600 dark:text-green-400">Normal</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                    <div>
                      <p className="font-medium">Location update</p>
                      <p className="text-sm text-gray-500">{selectedHorseData.lastUpdated}</p>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">{selectedHorseData.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Health check</p>
                      <p className="text-sm text-gray-500">1h ago</p>
                    </div>
                    <span className="text-green-600 dark:text-green-400">Completed</span>
                  </div>
                </div>
              </div>

              {/* Additional metrics */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Care History</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last vet check:</span>
                    <span className="font-medium">3 days ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last feeding:</span>
                    <span className="font-medium">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last exercise:</span>
                    <span className="font-medium">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Display full screen detail view when a horse is selected */}
      {selectedHorse && renderDetailedHorseView()}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Horse Management</h2>
        {!isAddingHorse && (
          <button 
            onClick={() => setIsAddingHorse(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <span className="font-bold text-lg">+</span>
            <span>Add Horse</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add Horse Card */}
          {isAddingHorse && renderAddHorseForm()}

          {/* Horse Cards */}
          {horses.map((horse) => (
            <div
              key={horse.id}
              className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => viewHorseDetails(horse)}
            >
              {/* Standard card view */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {horse.name}
                  </h3>
                  {/* <p className="text-xs text-gray-500 dark:text-gray-400">ID: {horse.id}</p> */}
                </div>
                <Badge color={horse.status === "normal" ? "success" : horse.status === "attention" ? "warning" : "error"}>
                  {horse.status}
                </Badge>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Heart Rate */}
                <MetricCard
                  icon={<HeartIcon className="size-5 text-pink-500" />}
                  label="Heart Rate"
                  value={`${horse.heartRate} BPM`}
                />

                {/* Temperature */}
                <MetricCard
                  icon={<TemperatureIcon className="size-5 text-red-400" />}
                  label="Temperature"
                  value={`${horse.temperature}°C`}
                />

                {/* Location */}
                <MetricCard
                  icon={<LocationIcon className="size-5 text-green-500" />}
                  label="Location"
                  value={horse.location}
                />

                {/* Speed */}
                <MetricCard
                  icon={<SpeedIcon className="size-5 text-blue-500" />}
                  label="Speed"
                  value={`${horse.speed} km/h`}
                />
              </div>

              {/* Footer */}
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Last updated: {horse.lastUpdated}
                </span>
                <button 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    viewHorseDetails(horse);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Reusable Metric Card
const MetricCard = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
          {label}
        </span>
      </div>
      <div className="text-md font-semibold text-gray-800 dark:text-white">
        {value}
      </div>
    </div>
  );
};

export default HorseMetrics;