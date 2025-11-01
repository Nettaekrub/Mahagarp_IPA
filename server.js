const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getDb } = require('./database/database.js');

const ipRoutes = require("./routes/ipsRoutes");
const tableRoutes = require("./routes/tableRoutes");
const pingRoutes = require("./routes/pingRoutes");

async function startServer() {
    await getDb(); 
    console.log("เชื่อมต่อฐานข้อมูลสำเร็จ!");

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    app.use("/api/networks", tableRoutes);
    app.use("/api/ips", ipRoutes);   
    app.use("/api/ping", pingRoutes); 

    app.listen(3000, () => console.log("Server running on port 3000"));

}

startServer();