// src/components/VinTable.jsx
import React from "react";
import VinRow from "./VinRow";
import { useVinContext } from "../utils/useVinContext";

function VinTable() {
  const { vinList } = useVinContext();

  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="border-b border-gray-600 text-left">VIN</th>
          <th className="border-b border-gray-600 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {vinList.map((item, index) => (
          <VinRow key={index} index={index} item={item} />
        ))}
      </tbody>
    </table>
  );
}

export default VinTable;
