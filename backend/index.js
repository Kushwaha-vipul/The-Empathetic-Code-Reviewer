const express = require("express");
require("dotenv").config();
const cors = require("cors");
const aiRoutes = require("./src/routes/ai.routes");

const app = express();
const PORT = 3002;
app.use(cors()); 

app.use(express.json());

app.use('/ai', aiRoutes); 

app.listen(PORT, () => {
  console.log("server started");
});