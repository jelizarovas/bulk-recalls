// Controls.jsx
import React, { useState } from "react";
import {
  addVin,
  startProcessing,
  clearAll,
  downloadCsv,
} from "../utils/storage";
import { MdAddCircleOutline } from "react-icons/md";

function Controls({ refreshList }) {
  const [vinInput, setVinInput] = useState("");

  const handleAddVin = () => {
    if (vinInput.trim()) {
      addVin(vinInput.trim());
      setVinInput("");
      // Refresh the parent's VIN list state immediately
      refreshList();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          className="w-full px-2 py-1 text-black bg-white rounded outline-none"
          placeholder="Enter VIN"
          value={vinInput}
          onChange={(e) => setVinInput(e.target.value)}
        />
        <button
          onClick={handleAddVin}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-800 rounded cursor-pointer"
        >
          <MdAddCircleOutline />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={startProcessing}
          className="px-4 py-2 bg-green-600 rounded"
        >
          Start Processing
        </button>
        <button onClick={clearAll} className="px-4 py-2 bg-red-600 rounded">
          Clear All
        </button>
        <button
          onClick={downloadCsv}
          className="px-4 py-2 bg-indigo-600 rounded"
        >
          Download CSV
        </button>
      </div>
    </div>
  );
}

export default Controls;
