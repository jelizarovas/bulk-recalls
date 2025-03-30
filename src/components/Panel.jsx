/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import VinProvider from "../components/VinProvider";
import { useVinContext } from "../utils/useVinContext";
import { loadCurrentIndex, saveCurrentIndex } from "../utils/storage";
import { autoParseResults } from "../utils/parse";
import VinTable from "./VinTable";
import Controls from "./Controls";

function PanelContent() {
  // Panel visibility state.
  const [visible, setVisible] = useState(true);
  // Get VIN list and update function from context.
  const { vinList, updateVin } = useVinContext();
  // Manage currentIndex locally.
  const [currentIndex, setCurrentIndex] = useState(0);
  // Panel width state (in pixels).
  const [width, setWidth] = useState(350);
  // Whether the user is dragging the handle.
  const [dragging, setDragging] = useState(false);
  // Ref to ensure auto-parsing happens only once per load.
  const hasParsed = useRef(false);
  const panelRef = useRef(null);

  // Debug: log the current visible state.
  useEffect(() => {
    console.log("Panel visible:", visible);
  }, [visible]);

  // Load currentIndex on mount.
  useEffect(() => {
    const idx = loadCurrentIndex();
    setCurrentIndex(idx);
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
        updateVin(currentIndex, {
          ...vinList[currentIndex],
          ...parsedData,
          status: "Processed",
        });
      }
      hasParsed.current = true;
    }
  }, [vinList, currentIndex, updateVin]);

  // Listen for messages from the background script to toggle panel visibility.
  useEffect(() => {
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.onMessage
    ) {
      const messageHandler = (msg) => {
        console.log("Received message:", msg);
        if (msg.togglePanel) {
          setVisible((prev) => !prev);
        }
      };

      chrome.runtime.onMessage.addListener(messageHandler);
      return () => {
        chrome.runtime.onMessage.removeListener(messageHandler);
      };
    }
    return undefined;
  }, []);

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

  // Toggle panel visibility from the in-panel toggle button.
  const togglePanel = () => {
    setVisible((prev) => !prev);
  };

  return (
    <div
      ref={panelRef}
      style={{
        width: visible ? `${width}px` : "0px",
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}
      className="fixed top-0 right-0 h-screen bg-gray-900 text-white p-4 z-50"
    >
      {/* Draggable handle on the left edge */}
      <div
        className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
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
      {/* Controls and VinTable now use the VIN context internally */}
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

function Panel() {
  return (
    <VinProvider>
      <PanelContent />
    </VinProvider>
  );
}

export default Panel;
