const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getDb } = require('./database.js');

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

    app.use("/networks", tableRoutes);
    app.use("/ips", ipRoutes);   
    app.use("/ping", pingRoutes); 
    app.use("/trace", traceRoutes); 
    app.use("/resolve", resolveRoutes); 

    const PORT = 3000;
    const HOST = '0.0.0.0';

    app.listen(PORT, HOST, () => {
        console.log(`Server running om http://${HOST}:${PORT}`);
    });

}

startServer();