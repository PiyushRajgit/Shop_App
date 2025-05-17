const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", () => console.log("MongoDB connected"));

// Schema & Model
const recordSchema = new mongoose.Schema({
  kv: String,
  material: String,
  type: String,
  quantity: Number,
});
const Record = mongoose.model("Record", recordSchema);

// Routes
app.get("/records", async (req, res) => {
  const records = await Record.find();
  res.json(records);
});

app.post("/records", async (req, res) => {
    try {
      console.log("Incoming data:", req.body); // Log the request body
      const newRecord = new Record(req.body);
      const saved = await newRecord.save();
      res.status(201).json(saved);
    } catch (error) {
      console.error("Error saving record:", error.message); // Log any errors
      res.status(500).json({ error: "Failed to save record" });
    }
  });app.post("/records", async (req, res) => {
  const { kv, material, type, quantity } = req.body;

  try {
    // Look for existing matching record
    const existing = await Record.findOne({ kv, material, type });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.status(200).json(existing);
    }

    // If not exists, create new
    const newRecord = new Record({ kv, material, type, quantity });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update record" });
  }
});

  

// Summary route
app.get("/summary", async (req, res) => {
  const summary = await Record.aggregate([
    {
      $group: {
        _id: { kv: "$kv", material: "$material", type: "$type" },
        totalQuantity: { $sum: "$quantity" },
      },
    },
    {
      $project: {
        _id: 0,
        kv: "$_id.kv",
        material: "$_id.material",
        type: "$_id.type",
        totalQuantity: 1,
      },
    },
    { $sort: { kv: -1, material: 1, type: 1 } },
  ]);

  res.json(summary);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
