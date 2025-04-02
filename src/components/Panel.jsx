/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import VinProvider from "../components/VinProvider";
import { useVinContext } from "../utils/useVinContext";
import { loadCurrentIndex, saveCurrentIndex } from "../utils/storage";
import { autoParseResults } from "../utils/parse";
import VinTable from "./VinTable";
import Controls from "./Controls";

/**
 * The main content of the panel. It's wrapped by VinProvider in the Panel component below.
 */
function PanelContent() {
  // Panel visibility (true = shown).
  const [visible, setVisible] = useState(true);
  // Grab VIN list and updateVin from the context.
  const { vinList, updateVin, clearAll, downloadCsv } = useVinContext();

  // The current VIN index (stored in localStorage).
  const [currentIndex, setCurrentIndex] = useState(0);
  // Panel width (resizable).
  const [width, setWidth] = useState(350);
  // Whether user is dragging the resize handle.
  const [dragging, setDragging] = useState(false);
  // Ensure auto-parse runs only once per page load.
  const hasParsed = useRef(false);

  // On mount, load the currentIndex from localStorage.
  useEffect(() => {
    const idx = loadCurrentIndex();
    setCurrentIndex(idx);
  }, []);

  // Save currentIndex to localStorage whenever it changes.
  useEffect(() => {
    saveCurrentIndex(currentIndex);
  }, [currentIndex]);

  // Auto-parse if on a vinLookup page and we haven't parsed yet.
  // Then advance to the next VIN if available.
  useEffect(() => {
    if (
      window.location.pathname.includes("vinLookup") &&
      vinList.length > 0 &&
      !hasParsed.current
    ) {
      // Parse the page for vehicle data.
      const parsedData = autoParseResults(); // {year, make, model, recallCount} or null

      // If we got data, mark the current VIN as processed.
      if (parsedData) {
        updateVin(currentIndex, {
          ...vinList[currentIndex],
          ...parsedData,
          status: "Processed",
        });
      }

      // Mark that we've parsed so we don't do it again on the same load.
      hasParsed.current = true;

      // Move on to the next VIN if we have one left.
      if (currentIndex + 1 < vinList.length) {
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        saveCurrentIndex(newIndex);

        // If we find a VIN field on the page, auto-fill the next VIN.
        const nextVinInput = document.getElementById("VIN");
        if (nextVinInput) {
          nextVinInput.value = vinList[newIndex].vin;
          nextVinInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      } else {
        console.log("All VINs processed!");
      }
    }
  }, [vinList, currentIndex, updateVin]);

  // Listen for messages from the background script to toggle the panel.
  useEffect(() => {
    if (chrome?.runtime?.onMessage) {
      const handleMessage = (msg) => {
        if (msg.togglePanel) {
          setVisible((prev) => !prev);
        }
      };
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }
  }, []);

  // When visible, set document.body margin-right to panel width. Otherwise, reset margin.
  useEffect(() => {
    if (visible) {
      document.body.style.marginRight = `${width}px`;
    } else {
      document.body.style.marginRight = "";
    }
    return () => {
      // Cleanup if the panel unmounts
      document.body.style.marginRight = "";
    };
  }, [visible, width]);

  // Handle dragging for the resize handle
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        let newWidth = window.innerWidth - e.clientX;
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

  // Panel toggle from inside the panel.
  const togglePanel = () => setVisible((prev) => !prev);

  return (
    <div
      style={{
        width: visible ? `${width}px` : "0px",
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}
      className="fixed top-0 right-0 h-screen bg-gray-900 text-white p-4 z-50"
    >
      {/* Draggable resize handle */}
      <div
        className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
      ></div>

      {/* Panel Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recalls</h2>
        <PanelButton onClick={togglePanel} label="Toggle" />
        <PanelButton onClick={clearAll} label="Clear All" />
        <PanelButton onClick={downloadCsv} label="Download" />
      </div>

      {/* The rest of the panel UI */}
      <Controls />
      <VinTable />
      <div className="mt-2 text-sm">
        <p>
          Current Index: <span className="font-bold">{currentIndex}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Wrap the panel content in the VinProvider so that
 * the entire panel has access to VIN context/state.
 */
function Panel() {
  return (
    <VinProvider>
      <PanelContent />
    </VinProvider>
  );
}

export default Panel;

/**
 * Reusable small button
 */
function PanelButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600 cursor-pointer"
    >
      {label}
    </button>
  );
}
