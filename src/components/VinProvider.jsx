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
      const newList = vinList.map((item, index) =>
        index === currentIndex
          ? { ...item, status: "Awaiting submission" }
          : item
      );
      setVinList(newList);
      updateStorage(newList);
    }
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
        setVinList, // Exposed in case you need it.
      }}
    >
      {children}
    </VinContext.Provider>
  );
};

export default VinProvider;
