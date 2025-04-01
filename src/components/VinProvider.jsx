import React, { useState, useEffect, useCallback } from "react";
import { VinContext } from "../utils/VinContext";

const VinProvider = ({ children }) => {
  const [vinList, setVinList] = useState([]);

  // Load VIN list from localStorage on mount.
  useEffect(() => {
    const stored = localStorage.getItem("vinList");
    if (stored) {
      setVinList(JSON.parse(stored));
    }
  }, []);

  const updateStorage = (list) => {
    localStorage.setItem("vinList", JSON.stringify(list));
  };

  const addVin = (vin) => {
    const newList = [...vinList, { vin, status: "Pending" }];
    setVinList(newList);
    updateStorage(newList);
  };

  const removeVin = (index) => {
    const newList = vinList.filter((_, i) => i !== index);
    setVinList(newList);
    updateStorage(newList);
  };

  const clearAll = () => {
    setVinList([]);
    localStorage.removeItem("vinList");
    localStorage.removeItem("currentVinIndex");
  };

  const startProcessing = () => {
    const idxStr = localStorage.getItem("currentVinIndex");
    const currentIndex = idxStr ? parseInt(idxStr, 10) : 0;
    if (currentIndex < vinList.length) {
      const vinToSubmit = vinList[currentIndex].vin;

      // Update the field on the webpage (only works if it's the right page)
      const vinInput = document.getElementById("VIN");
      if (vinInput) {
        vinInput.value = vinToSubmit;
        vinInput.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        console.warn("VIN input field not found on this page");
      }

      const newList = vinList.map((item, index) =>
        index === currentIndex
          ? { ...item, status: "Awaiting submission" }
          : item
      );
      setVinList(newList);
      updateStorage(newList);
    }
  };

  // Stop processing: mark the current VIN as paused.
  const stopProcessing = () => {
    const idxStr = localStorage.getItem("currentVinIndex");
    const currentIndex = idxStr ? parseInt(idxStr, 10) : 0;
    if (currentIndex < vinList.length) {
      const newList = vinList.map((item, index) =>
        index === currentIndex ? { ...item, status: "Paused" } : item
      );
      setVinList(newList);
      updateStorage(newList);
      localStorage.setItem("processingPaused", "true");
    }
  };

  // Restart processing: remove the paused flag and resume processing.
  const restartProcessing = () => {
    localStorage.removeItem("processingPaused");
    const idxStr = localStorage.getItem("currentVinIndex");
    const currentIndex = idxStr ? parseInt(idxStr, 10) : 0;
    if (currentIndex < vinList.length) {
      const newList = vinList.map((item, index) =>
        // Only resume if the current item is paused.
        index === currentIndex && item.status === "Paused"
          ? { ...item, status: "Awaiting submission" }
          : item
      );
      setVinList(newList);
      updateStorage(newList);
    }
  };

  // Import CSV: parse CSV string and update the VIN list.
  const importCsv = (csvContent) => {
    // Split the CSV content into lines and remove any empty lines.
    let lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== "");
    // Check if the first line is a header and remove it.
    if (lines.length && lines[0].toLowerCase().includes("vin")) {
      lines.shift();
    }
    // Parse each line. Expecting the order: vin,year,make,model,status,recallCount.
    const importedList = lines.map((line) => {
      const fields = line.split(",");
      const [vin, year, make, model, status, recallCount] = fields;
      return { vin, year, make, model, status, recallCount };
    });
    setVinList(importedList);
    updateStorage(importedList);
  };

  const downloadCsv = () => {
    let csv = "vin,year,make,model,status,recallCount\n";
    vinList.forEach((item) => {
      const {
        vin,
        year = "",
        make = "",
        model = "",
        status = "",
        recallCount = "",
      } = item;
      csv += `${vin},${year},${make},${model},${status},${recallCount}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vin_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Update a specific VIN (for auto-parsing).
  const updateVin = useCallback(
    (index, updatedVin) => {
      const newList = vinList.map((item, i) =>
        i === index ? updatedVin : item
      );
      setVinList(newList);
      updateStorage(newList);
    },
    [vinList]
  );

  return (
    <VinContext.Provider
      value={{
        vinList,
        addVin,
        removeVin,
        clearAll,
        startProcessing,
        downloadCsv,
        updateVin,
        setVinList,
        importCsv,
        restartProcessing,
        stopProcessing,
      }}
    >
      {children}
    </VinContext.Provider>
  );
};

export default VinProvider;
