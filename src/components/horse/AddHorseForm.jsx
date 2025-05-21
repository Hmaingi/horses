import React, { useState } from "react";

const AddHorseForm = ({ onCancel, onHorseAdded, unassignedDevices }) => {
  const [newHorse, setNewHorse] = useState({
    deviceId: "",
    name: "",
    location: "",
    status: "normal",
  });

  const handleSubmit = async () => {
    if (!newHorse.name || !newHorse.deviceId) return;

    try {
      const response = await fetch("https://horsetrackerbackend.onrender.com/api/assign-horse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: newHorse.deviceId,
          horseDetails: {
            name: newHorse.name,
            location: newHorse.location,
            status: newHorse.status,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to assign horse");
      await onHorseAdded();
    } catch (error) {
      console.error("Error adding horse:", error);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add New Horse</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device ID</label>
          <select
            value={newHorse.deviceId}
            onChange={(e) => setNewHorse({ ...newHorse, deviceId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="">Select a device</option>
            {unassignedDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.deviceId} (Horse ID: {device.assignedHorseId})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horse Name</label>
          <input
            type="text"
            value={newHorse.name}
            onChange={(e) => setNewHorse({ ...newHorse, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            placeholder="Enter horse name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
          <input
            type="text"
            value={newHorse.location}
            onChange={(e) => setNewHorse({ ...newHorse, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            placeholder="Enter current location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={newHorse.status}
            onChange={(e) => setNewHorse({ ...newHorse, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="normal">Normal</option>
            <option value="attention">Needs Attention</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={!newHorse.name || !newHorse.deviceId}
          >
            Add Horse
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHorseForm;