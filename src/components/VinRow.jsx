// src/components/VinRow.jsx
import React from "react";
import { useVinContext } from "../utils/useVinContext";

function VinRow({ item, index }) {
  const { removeVin } = useVinContext();

  const handleRemove = () => {
    removeVin(index);
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
