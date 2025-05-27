import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://shop-app-v7dc.onrender.com";

const kvOptions = [
  "10kv",
  "8kv",
  "5kv",
  "3kv",
  "1KvA",
  "500 Watt",
  "300 Watt",
  "1 Kva Charger",
  "500 Watt Charger",
  "Inverter"
];

const materialOptions = ["Aluminium", "Copper"];
const actionOptions = ["Pieces Made", "Pieces Sold"];

const allTypeOptions = {
  default: ["Manual", "Automatic"],
  "3kv": ["Full Automatic", "Digital", "Local"],
  "5kv": ["Full Automatic", "Digital", "Local"],
  "8kv": ["Full Automatic", "Digital", "Local"],
  "10kv": ["Manual", "Automatic"],
  Inverter: ["Automatic"],
};

export default function ItemRecordApp() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState({
    kv: "5kv",
    type: "Full Automatic",
    material: "Aluminium",
    quantity: 1,
    action: "Pieces Made",
  });

  const getTypeOptions = (kv) => allTypeOptions[kv] || allTypeOptions.default;

  useEffect(() => {
    const availableTypes = getTypeOptions(form.kv);
    if (!availableTypes.includes(form.type)) {
      setForm((prev) => ({ ...prev, type: availableTypes[0] }));
    }
  }, [form.kv]);

  const fetchRecords = async () => {
    const res = await axios.get(`${API_URL}/records`);
    setRecords(res.data);
  };

  const fetchSummary = async () => {
    const res = await axios.get(`${API_URL}/summary`);
    setSummary(res.data);
  };

  const addRecord = async () => {
    const adjustedQuantity =
      form.action === "Pieces Sold"
        ? -Math.abs(form.quantity)
        : Math.abs(form.quantity);

    const payload = {
      kv: form.kv,
      material: form.material,
      type: form.type,
      quantity: adjustedQuantity,
    };

    await axios.post(`${API_URL}/records`, payload);
    fetchRecords();
    fetchSummary();
    setForm({
      kv: "5kv",
      type: "Full Automatic",
      material: "Aluminium",
      quantity: 1,
      action: "Pieces Made",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  useEffect(() => {
    fetchRecords();
    fetchSummary();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 font-inter">
      <h1 className="text-4xl font-bold mb-6 text-center text-caribbeangreen-800">
        Item Record Manager
      </h1>

      {/* Record Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <select
          name="kv"
          value={form.kv}
          onChange={handleChange}
          className="p-3 border rounded text-base border-pure-greys-300"
        >
          {kvOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="p-3 border rounded text-base border-pure-greys-300"
        >
          {getTypeOptions(form.kv).map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>

        <select
          name="material"
          value={form.material}
          onChange={handleChange}
          className="p-3 border rounded text-base border-pure-greys-300"
        >
          {materialOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>

        <select
          name="action"
          value={form.action}
          onChange={handleChange}
          className="p-3 border rounded text-base border-pure-greys-300"
        >
          {actionOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>

        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          className="p-3 border rounded text-base border-pure-greys-300"
          min={1}
        />

        <button
          onClick={addRecord}
          className="bg-caribbeangreen-600 text-white font-bold px-6 py-2 rounded hover:bg-caribbeangreen-700 transition duration-200"
        >
          Add Record
        </button>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto mb-10">
        <h2 className="text-2xl font-semibold mb-2 text-pure-greys-800">Records</h2>
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
                <td className="border px-4 py-2">{rec.quantity}</td>
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
        <h2 className="text-2xl font-semibold mb-2 text-pure-greys-800">Summary</h2>
        <table className="w-full table-auto border-collapse border border-pure-greys-200">
          <thead className="bg-pure-greys-100">
            <tr>
              <th className="border px-4 py-2">KV</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Material</th>
              <th className="border px-4 py-2">Total Quantity</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, i) => (
              <tr key={i} className="text-center">
                <td className="border px-4 py-2">{item.kv}</td>
                <td className="border px-4 py-2">{item.type}</td>
                <td className="border px-4 py-2">{item.material}</td>
                <td className="border px-4 py-2">{item.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}