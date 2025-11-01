const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getDb } = require('./database/database.js');

const ipRoutes = require("./routes/ipsRoutes");
const tableRoutes = require("./routes/tableRoutes");
const pingRoutes = require("./routes/pingRoutes");
const traceRoutes = require("./routes/traceRoutes");
const resolveRoutes = require("./routes/resolveRoutes");

async function startServer() {
    await getDb(); 
    console.log("เชื่อมต่อฐานข้อมูลสำเร็จ!");

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    app.use("/api/networks", tableRoutes);
    app.use("/api/ips", ipRoutes);   
    app.use("/api/ping", pingRoutes); 
    app.use("/api/trace", traceRoutes); 
    app.use("/api/resolve", resolveRoutes); 

    app.listen(3000, () => console.log("Server running on port 3000"));

}

startServer();