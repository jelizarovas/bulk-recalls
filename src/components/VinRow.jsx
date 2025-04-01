// src/components/VinRow.jsx
import React from "react";
import { useVinContext } from "../utils/useVinContext";
import { MdDeleteForever } from "react-icons/md";

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
      <td className=" items-center justify-center border-b border-gray-700">
        {item.status}
        {item.status === "Processed" && (
          <div>Recalls: {item.recallCount || 0}</div>
        )}
        <button
          className="text-xl cursor-pointer mx-2 text-red-400"
          onClick={handleRemove}
        >
          <MdDeleteForever />
        </button>
      </td>
    </tr>
  );
}

export default VinRow;
