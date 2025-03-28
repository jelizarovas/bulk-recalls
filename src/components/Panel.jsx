// src/components/Panel.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  loadVinList,
  loadCurrentIndex,
  saveCurrentIndex,
} from "../utils/storage";
import { autoParseResults } from "../utils/parse";
import { togglePanelMargin } from "../utils/toggle";
import VinTable from "./VinTable";
import Controls from "./Controls";

function Panel() {
  const [visible, setVisible] = useState(true);
  const [vinList, setVinList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasParsed = useRef(false);

  // Refresh the local state from localStorage.
  const refreshList = () => {
    const list = loadVinList();
    const idx = loadCurrentIndex();
    setVinList(list);
    setCurrentIndex(idx);
  };

  // On mount, load VIN list and current index.
  useEffect(() => {
    refreshList();
  }, []);

  // Save currentIndex to localStorage whenever it changes.
  useEffect(() => {
    saveCurrentIndex(currentIndex);
  }, [currentIndex]);

  // If we're on a vinLookup results page and haven't parsed yet, auto-parse.
  useEffect(() => {
    if (
      window.location.pathname.includes("vinLookup") &&
      vinList.length > 0 &&
      !hasParsed.current
    ) {
      const parsedData = autoParseResults(); // Returns { year, make, model, recallCount } or null.
      if (parsedData) {
        const updatedList = [...vinList];
        updatedList[currentIndex] = {
          ...updatedList[currentIndex],
          ...parsedData,
          status: "Processed",
        };
        // Save updated list to localStorage and update state.
        localStorage.setItem("vinList", JSON.stringify(updatedList));
        setVinList(updatedList);
      }
      hasParsed.current = true;
    }
  }, [vinList, currentIndex]);

  // Toggle panel visibility and adjust body margin.
  const togglePanel = () => {
    const newVisible = !visible;
    setVisible(newVisible);
    togglePanelMargin(newVisible); // Utility to add/remove body margin.
  };

  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      className="fixed top-0 right-0 w-[350px] h-screen bg-gray-900 text-white p-4 z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bulk Recalls</h2>
        <button
          onClick={togglePanel}
          className="px-2 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600"
        >
          Toggle
        </button>
      </div>
      {/* Controls component gets refreshList so it can trigger a refresh when a VIN is added */}
      <Controls refreshList={refreshList} />
      {/* VinTable displays the VIN list */}
      <VinTable vinList={vinList} />
      <div className="mt-2 text-sm">
        <p>
          Current Index: <span className="font-bold">{currentIndex}</span>
        </p>
      </div>
    </div>
  );
}

export default Panel;
