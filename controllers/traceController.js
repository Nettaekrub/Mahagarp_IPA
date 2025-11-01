const { spawn } = require("child_process");

async function tracerouteNetworks(req, res) {
    const { ip } = req.body;
    if (!Array.isArray(ip) || ip.length === 0) {
        return res.status(400).json({ error: "Please provide an array of ip" });
    }

    // Validate IPs
    const validIPs = ip.filter(ip => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip));

    const tracerouteOne = (ip) => {
        return new Promise((resolve) => {
            const cmd = process.platform === "win32" ? "tracert" : "traceroute";
            const tracerouteProcess = spawn(cmd, [ip]);
            let stdout = "";
            let stderr = "";

            tracerouteProcess.stdout.on("data", (data) => (stdout += data.toString()));
            tracerouteProcess.stderr.on("data", (data) => (stderr += data.toString()));

            tracerouteProcess.on("close", (code) => {
                if (code !== 0) {
                    resolve({ ip, success: false, result: stderr || stdout });
                } else {
                    resolve({ ip, success: true, result: stdout });
                }
            });

            tracerouteProcess.on("error", (error) => {
                resolve({ ip, success: false, result: `Traceroute process error: ${error.message}` });
            });
        });
    };

    const results = await Promise.all(validIPs.map(tracerouteOne));
    res.json({ results });
}

module.exports = { tracerouteNetworks };
