// src/components/Panel.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  loadVinList,
  loadCurrentIndex,
  saveCurrentIndex,
} from "../utils/storage";
import { autoParseResults } from "../utils/parse";
import VinTable from "./VinTable";
import Controls from "./Controls";

function Panel() {
  // Panel visibility state.
  const [visible, setVisible] = useState(true);
  // List of VINs and current index.
  const [vinList, setVinList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Panel width state (in pixels).
  const [width, setWidth] = useState(350);
  // Whether the user is dragging the handle.
  const [dragging, setDragging] = useState(false);
  // Ref to ensure auto-parsing happens only once per load.
  const hasParsed = useRef(false);
  const panelRef = useRef(null);

  // Refresh the local state from localStorage.
  const refreshList = () => {
    const list = loadVinList();
    const idx = loadCurrentIndex();
    setVinList(list);
    setCurrentIndex(idx);
  };

  // Load VIN list on mount.
  useEffect(() => {
    refreshList();
  }, []);

  // Persist currentIndex to localStorage whenever it changes.
  useEffect(() => {
    saveCurrentIndex(currentIndex);
  }, [currentIndex]);

  // Auto-parse VIN results on vinLookup page if available.
  useEffect(() => {
    if (
      window.location.pathname.includes("vinLookup") &&
      vinList.length > 0 &&
      !hasParsed.current
    ) {
      const parsedData = autoParseResults(); // Expects { year, make, model, recallCount } or null.
      if (parsedData) {
        const updatedList = [...vinList];
        updatedList[currentIndex] = {
          ...updatedList[currentIndex],
          ...parsedData,
          status: "Processed",
        };
        localStorage.setItem("vinList", JSON.stringify(updatedList));
        setVinList(updatedList);
      }
      hasParsed.current = true;
    }
  }, [vinList, currentIndex]);

  // When the panel is visible, update the page margin-right to "squeeze in" the content.
  useEffect(() => {
    if (visible) {
      document.body.style.marginRight = `${width}px`;
    } else {
      document.body.style.marginRight = "";
    }
    return () => {
      document.body.style.marginRight = "";
    };
  }, [visible, width]);

  // Dragging handlers for the resizable handle.
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        // Calculate new width based on distance from the right edge.
        let newWidth = window.innerWidth - e.clientX;
        // Enforce minimum and maximum widths.
        if (newWidth < 200) newWidth = 200;
        if (newWidth > 600) newWidth = 600;
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (dragging) setDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  // Toggle panel visibility.
  const togglePanel = () => {
    setVisible((prev) => !prev);
  };

  return (
    <div
      ref={panelRef}
      style={{ display: visible ? "block" : "none", width: `${width}px` }}
      className="fixed top-0 right-0 h-screen bg-gray-900 text-white p-4 z-50"
    >
      {/* Draggable handle on the left edge */}
      <div
        className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"
        onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true)}}
      ></div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bulk Recalls</h2>
        <button
          onClick={togglePanel}
          className="px-2 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600"
        >
          Toggle
        </button>
      </div>
      {/* Controls component handles adding VINs, starting processing, etc. */}
      <Controls refreshList={refreshList} />
      {/* VinTable displays the list of VINs */}
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
