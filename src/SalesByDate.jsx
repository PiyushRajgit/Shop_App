import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://shop-app-v7dc.onrender.com";

function getTodayDateString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SalesByDate() {
  const [date, setDate] = useState(getTodayDateString()); // default to today
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);

  const fetchSales = async () => {
    if (!date) return;
    try {
      const res = await axios.get(`${API_URL}/sales-by-date`, {
        params: { date },
      });
      setRecords(res.data.records);
      setSummary(res.data.summary);
    } catch (error) {
      alert("Failed to fetch sales data");
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-inter">
      <h1 className="text-3xl font-bold mb-4 text-center text-caribbeangreen-800">
        Sales Records By Date
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-3 border rounded text-base border-pure-greys-300"
          max={getTodayDateString()} // prevent selecting future dates if you want
        />
        <button
          onClick={fetchSales}
          className="bg-caribbeangreen-600 text-white font-bold px-6 py-2 rounded hover:bg-caribbeangreen-700 transition duration-200"
        >
          Fetch Sales
        </button>
      </div>

      {records.length > 0 && (
        <>
          {/* Records Table */}
          <div className="overflow-x-auto mb-10">
            <h2 className="text-2xl font-semibold mb-2 text-pure-greys-800">
              Sales Records
            </h2>
            <table className="w-full table-auto border-collapse border border-pure-greys-200">
              <thead className="bg-pure-greys-100">
                <tr>
                  <th className="border px-4 py-2">KV</th>
                  <th className="border px-4 py-2">Type</th>
                  <th className="border px-4 py-2">Material</th>
                  <th className="border px-4 py-2">Quantity</th>
                  <th className="border px-4 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={i} className="text-center">
                    <td className="border px-4 py-2">{rec.kv}</td>
                    <td className="border px-4 py-2">{rec.type}</td>
                    <td className="border px-4 py-2">{rec.material}</td>
                    <td className="border px-4 py-2">{Math.abs(rec.quantity)}</td>
                    <td className="border px-4 py-2">
                      {new Date(rec.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Table */}
          <div className="overflow-x-auto">
            <h2 className="text-2xl font-semibold mb-2 text-pure-greys-800">
              Sales Summary
            </h2>
            <table className="w-full table-auto border-collapse border border-pure-greys-200">
              <thead className="bg-pure-greys-100">
                <tr>
                  <th className="border px-4 py-2">KV</th>
                  <th className="border px-4 py-2">Type</th>
                  <th className="border px-4 py-2">Material</th>
                  <th className="border px-4 py-2">Total Sold</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((item, i) => (
                  <tr key={i} className="text-center">
                    <td className="border px-4 py-2">{item.kv}</td>
                    <td className="border px-4 py-2">{item.type}</td>
                    <td className="border px-4 py-2">{item.material}</td>
                    <td className="border px-4 py-2">{Math.abs(item.totalQuantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {records.length === 0 && date && (
        <p className="text-center text-gray-600 mt-10">
          No sales records found for this date.
        </p>
      )}
    </div>
  );
}
