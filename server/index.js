require('dotenv').config(); // Load env variables at the very top

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mongoose schema
const recordSchema = new mongoose.Schema({
  kv: String,
  type: String,
  material: String,
  quantity: Number,
  timestamp: { type: Date, default: Date.now },
});

const Record = mongoose.model("Record", recordSchema);

// Root health check
app.get("/", (req, res) => {
  res.send("Backend API is running");
});

// Get all records
app.get("/records", async (req, res) => {
  try {
    const records = await Record.find().sort({ timestamp: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching records" });
  }
});

// Post a new record
app.post("/records", async (req, res) => {
  const { kv, type, material, quantity } = req.body;
  try {
    const newRecord = new Record({
      kv,
      type,
      material,
      quantity,
      timestamp: new Date(), // Local time
    });
    await newRecord.save();
    res.json({ message: "Record added" });
  } catch (err) {
    res.status(500).json({ error: "Server error saving record" });
  }
});

// Get total summary (all records)
app.get("/summary", async (req, res) => {
  try {
    const summary = await Record.aggregate([
      {
        $group: {
          _id: { kv: "$kv", type: "$type", material: "$material" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $project: {
          kv: "$_id.kv",
          type: "$_id.type",
          material: "$_id.material",
          totalQuantity: 1,
          _id: 0,
        },
      },
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching summary" });
  }
});

// ✅ Get sales records and summary for a specific date (in local time)
app.get("/sales-by-date", async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date query parameter is required (YYYY-MM-DD)" });
  }

  const userDate = new Date(`${date}T00:00:00+05:30`);
  const nextDate = new Date(userDate);
  nextDate.setDate(userDate.getDate() + 1);

  try {
    const salesRecords = await Record.find({
      timestamp: { $gte: userDate, $lt: nextDate },
      quantity: { $lt: 0 },
    }).sort({ timestamp: -1 });

    const summary = await Record.aggregate([
      {
        $match: {
          timestamp: { $gte: userDate, $lt: nextDate },
          quantity: { $lt: 0 },
        },
      },
      {
        $group: {
          _id: { kv: "$kv", type: "$type", material: "$material" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $project: {
          kv: "$_id.kv",
          type: "$_id.type",
          material: "$_id.material",
          totalQuantity: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ records: salesRecords, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching sales by date" });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
