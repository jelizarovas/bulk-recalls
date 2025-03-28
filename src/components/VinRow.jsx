// components/VinRow.jsx
import React from "react";
import { removeVin } from "../utils/storage";

function VinRow({ item, index }) {
  const handleRemove = () => {
    removeVin(index);
    // Optionally, trigger a re-render in parent (or use context / state management)
    window.location.reload(); // Quick hack; better to use state lifting in a full app
  };

  return (
    <tr>
      <td className="py-1 border-b border-gray-700">
        <strong>{item.vin}</strong>
        {(item.year || item.make || item.model) && (
          <div>{`${item.year || ""} ${item.make || ""} ${
            item.model || ""
          }`}</div>
        )}
      </td>
      <td className="py-1 border-b border-gray-700">
        {item.status}
        {item.status === "Processed" && (
          <div>Recalls: {item.recallCount || 0}</div>
        )}
        <button className="mt-1 text-red-400" onClick={handleRemove}>
          Remove
        </button>
      </td>
    </tr>
  );
}

export default VinRow;
