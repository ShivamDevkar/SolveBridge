import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.send({ success: true, data: { status: "ok" } });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});