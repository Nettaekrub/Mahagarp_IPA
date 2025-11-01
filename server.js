const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { spawn } = require("child_process");
const { getDb } = require('./database/database.js');

const ipRoutes = require("./routes/ipsRoutes");
const tableRoutes = require("./routes/tableRoutes");



async function startServer() {
    await getDb(); 
    console.log("เชื่อมต่อฐานข้อมูลสำเร็จ!");

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    
    app.use("/api/networks", tableRoutes);
    app.use("/api/ips", ipRoutes);

            
    app.post("/ping", async (req, res) => {
      const { ip } = req.body;

      if (!Array.isArray(ip) || ip.length === 0) {
        return res.status(400).json({ error: "Please provide an array of ip" });
      }

      const validIPs = ip.filter(ip => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip));

      const pingOne = (ip) => {
        return new Promise((resolve) => {
          const pingProcess = spawn("ping", ["-n", "4", ip]); // -n = Windows, ถ้า Linux เปลี่ยนเป็น -c
          let stdout = "";
          let stderr = "";

          pingProcess.stdout.on("data", (data) => (stdout += data.toString()));
          pingProcess.stderr.on("data", (data) => (stderr += data.toString()));

          pingProcess.on("close", (code) => {
            if (code !== 0) {
              resolve({ ip, success: false, result: stderr || stdout });
            } else {
              resolve({ ip, success: true, result: stdout });
            }
          });

          pingProcess.on("error", (error) => {
            resolve({ ip, success: false, result: `Ping process error: ${error.message}` });
          });
        });
      };
      const results = await Promise.all(validIPs.map(pingOne));

      res.json({ results });
    });

    app.listen(3000, () => console.log("Server running on port 3000"));

}

startServer();