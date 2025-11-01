const { spawn } = require("child_process");

function getPingArgs(ip) {
    if (process.platform === "win32") {
        return ["-n", "4", ip];
    } else {
        return ["-c", "4", ip];
    }
}

async function pingNetworks(req, res) {
    const { ip } = req.body;
    if (!Array.isArray(ip) || ip.length === 0) {
    return res.status(400).json({ error: "Please provide an array of ip" });
    }

    const validIPs = ip.filter(ip => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip));

    const pingOne = (ip) => {
    return new Promise((resolve) => {
        const args = getPingArgs(ip);
        const pingProcess = spawn("ping", args);
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
}

module.exports = { pingNetworks };
