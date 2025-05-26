import React, { useState, useEffect } from "react";

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
  "Inverter",
];

const materialOptions = ["Aluminium", "Copper"];

const allTypeOptions = {
  default: ["Manual", "Automatic"],
  "3kv": [
    "Full Automatic",
    "Digital",
    "Local",
    "4 Rellay Manual",
    "4 Rellay Automatic",
    "Micro Rellay",
  ],
  "5kv": [
    "Full Automatic",
    "Digital",
    "Local",
    "4 Rellay Manual",
    "4 Rellay Automatic",
    "Micro Rellay",
  ],
  "8kv": [
    "Full Automatic",
    "Digital",
    "Local",
    "4 Rellay Manual",
    "4 Rellay Automatic",
    "Micro Rellay",
  ],
  "10kv": ["Manual", "Automatic"],
  Inverter: ["Automatic"],
};

const actionOptions = ["Pieces Made", "Pieces Sold"];

const API_URL = "http://localhost:5000";

export default function App() {
  const [summary, setSummary] = useState([]);
  const [formData, setFormData] = useState({
    kv: kvOptions[0],
    material: materialOptions[0],
    type: allTypeOptions["5kv"][0],
    quantity: 1,
    action: actionOptions[0],
  });
  const [loading, setLoading] = useState(false);

  const getTypeOptions = (kv) => allTypeOptions[kv] || allTypeOptions.default;

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    const updatedTypes = getTypeOptions(formData.kv);
    if (!updatedTypes.includes(formData.type)) {
      setFormData((prev) => ({ ...prev, type: updatedTypes[0] }));
    }
  }, [formData.kv]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { kv, material, type, quantity, action } = formData;

    const matched = summary.find(
      (item) =>
        item.kv === kv && item.material === material && item.type === type
    );
    const currentStock = matched ? matched.totalQuantity : 0;

    if (action === "Pieces Sold" && quantity > currentStock) {
      alert(`Cannot sell ${quantity} items. Only ${currentStock} in stock.`);
      setLoading(false);
      return;
    }

    const adjustedQuantity = action === "Pieces Sold" ? -Math.abs(quantity) : quantity;

    // Send only required fields, no 'action'
    const payload = {
      kv,
      material,
      type,
      quantity: adjustedQuantity,
    };

    try {
      const res = await fetch(`${API_URL}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMsg = "Failed to update record";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch {}

        throw new Error(errorMsg);
      }

      await res.json();
      await fetchSummary();

      setFormData({
        kv: kvOptions[0],
        material: materialOptions[0],
        type: getTypeOptions(kvOptions[0])[0],
        quantity: 1,
        action: actionOptions[0],
      });
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(err.message || "Error updating record");
    } finally {
      setLoading(false);
    }
  };

  const currentStock =
    summary.find(
      (item) =>
        item.kv === formData.kv &&
        item.material === formData.material &&
        item.type === formData.type
    )?.totalQuantity || 0;

  const parseKV = (kv) => {
    const match = kv.toLowerCase().match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 font-inter">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-caribbeangreen-700">
        Item Summary Dashboard
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-wrap gap-4 items-center justify-center"
      >
        <select
          name="kv"
          value={formData.kv}
          onChange={handleChange}
          className="border rounded p-2 w-36 sm:w-28 border-pure-greys-300"
        >
          {kvOptions.map((kv) => (
            <option key={kv}>{kv}</option>
          ))}
        </select>

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="border rounded p-2 w-36 sm:w-32 border-pure-greys-300"
        >
          {getTypeOptions(formData.kv).map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <select
          name="material"
          value={formData.material}
          onChange={handleChange}
          className="border rounded p-2 w-36 sm:w-32 border-pure-greys-300"
        >
          {materialOptions.map((mat) => (
            <option key={mat}>{mat}</option>
          ))}
        </select>

        <select
          name="action"
          value={formData.action}
          onChange={handleChange}
          className="border rounded p-2 w-36 sm:w-32 border-pure-greys-300"
        >
          {actionOptions.map((action) => (
            <option key={action}>{action}</option>
          ))}
        </select>

        <input
          type="number"
          name="quantity"
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          className="border rounded p-2 w-24 text-center border-pure-greys-300"
        />

        <button
          type="submit"
          disabled={loading}
          className={`bg-caribbeangreen-400 text-white px-6 py-2 rounded font-bold transition duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-caribbeangreen-700"
          }`}
        >
          {loading ? "Updating..." : "Submit"}
        </button>
      </form>

      <div className="text-center mb-8">
        <div className="text-gray-600 uppercase tracking-wider font-semibold mb-1">
          Current Stock
        </div>
        <div className="text-caribbeangreen-700 font-extrabold text-5xl">{currentStock}</div>
      </div>

      <table className="w-full table-auto border-collapse border border-pure-greys-200">
        <thead className="bg-pure-greys-100">
          <tr>
            <th className="border px-4 py-2">KV</th>
            <th className="border px-4 py-2">Material</th>
            <th className="border px-4 py-2">Type</th>
            <th className="border px-4 py-2">Total Quantity</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const sorted = [...summary].sort((a, b) => {
              const kvA = parseKV(a.kv);
              const kvB = parseKV(b.kv);
              if (kvA !== kvB) return kvB - kvA;
              return a.totalQuantity - b.totalQuantity;
            });

            let currentKV = null;
            const rows = [];

            sorted.forEach((item, idx) => {
              if (item.kv !== currentKV) {
                currentKV = item.kv;
                rows.push(
                  <tr key={`group-${currentKV}`} className="bg-yellow-300 shadow-md border border-yellow-600">
                    <td
                      colSpan="4"
                      className="text-left px-6 py-3 font-extrabold text-xl text-gray-900 tracking-wide uppercase"
                    >
                      🔶 {currentKV} Stabilizers
                    </td>
                  </tr>
                );
              }

              rows.push(
                <tr key={idx} className="text-center">
                  <td className="border px-4 py-2 font-bold text-lg">{item.kv}</td>
                  <td className="border px-4 py-2">{item.material}</td>
                  <td className="border px-4 py-2">{item.type}</td>
                  <td className="border px-4 py-2 font-bold text-lg">{item.totalQuantity}</td>
                </tr>
              );
            });

            return rows;
          })()}
        </tbody>
      </table>
    </div>
  );
}
