// src/components/Controls.jsx
import React, { useState } from "react";
import { useVinContext } from "../utils/useVinContext";
import { MdAddCircleOutline } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

function Controls() {
  const { addVin, startProcessing, stopProcessing, restartProcessing } =
    useVinContext();
  const [vinInput, setVinInput] = useState("");
  // processingState can be: "idle", "processing", "paused", or "completed"
  const [processingState, setProcessingState] = useState("idle");

  const handleAddVin = () => {
    if (vinInput.trim()) {
      addVin(vinInput.trim());
      setVinInput("");
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddVin();
    }
  };

  const handleProcessingClick = () => {
    if (processingState === "idle") {
      startProcessing();
      setProcessingState("processing");
    } else if (processingState === "processing") {
      // For example, suppose we determine processing is done:
      const allProcessed = false;
      if (allProcessed) {
        completeProcessing();
      } else {
        stopProcessing();
        setProcessingState("paused");
      }
    } else if (processingState === "paused") {
      restartProcessing();
      setProcessingState("processing");
    }
  };

  const completeProcessing = () => {
    setProcessingState("completed");
  };

  // Determine button background classes based on processing state.
  const processingButtonClasses = `px-4 py-2 rounded cursor-pointer transition-all flex items-center justify-center ${
    processingState === "idle"
      ? "bg-green-600 hover:bg-green-700"
      : processingState === "processing"
      ? "bg-red-600 hover:bg-red-700"
      : processingState === "paused"
      ? "bg-orange-600 hover:bg-orange-700"
      : "bg-gray-600" // "completed" state
  }`;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          className="w-full px-2 py-1 text-black bg-white rounded outline-none"
          placeholder="Enter VIN"
          value={vinInput}
          onChange={(e) => setVinInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
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
          onClick={handleProcessingClick}
          className={processingButtonClasses}
        >
          {processingState === "idle" && "Start Processing"}
          {processingState === "processing" && (
            <>
              <FaSpinner className="mr-2 animate-spin" />
              Stop Processing
            </>
          )}
          {processingState === "paused" && "Restart Processing"}
          {processingState === "completed" && "Completed"}
        </button>
      </div>
    </div>
  );
}

export default Controls;
