const express = require("express");
const cors = require("cors");
const db = require("./db");
const alarmRouter = require("./routes/alarm");
const authRouter = require("./routes/auth");
const verifyToken = require("./middlewares/auth");

db.connect();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);
app.use("/alarm", verifyToken, alarmRouter);

app.listen(5000, () => {
  console.log(`Server running on port ${5000}`);
});
