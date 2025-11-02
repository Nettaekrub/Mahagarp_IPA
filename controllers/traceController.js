const { spawn } = require("child_process");

function buildArgsFromOptions(options) {
  const allowedFlags = new Set(["-d", "-R", "-4", "-6", "-h"]);

  if (!Array.isArray(options) || options.length === 0) return [];

  const args = [];
  for (let i = 0; i < options.length; i++) {
    let opt = String(options[i]).trim();
    if (!opt) continue;

    if (opt.startsWith("-h")) {
      if (opt === "-h") {
        const next = options[i + 1];
        if (next !== undefined && String(next).trim().match(/^\d+$/)) {
          args.push("-h", String(next).trim());
          i++;
        } else {
          continue;
        }
      } else {
        const m = opt.match(/^-h(?:=?)(\d+)$/);
        if (m) {
          args.push("-h", m[1]);
        } else {
          continue;
        }
      }
      continue;
    }

    if (allowedFlags.has(opt)) {
      args.push(opt);
    } else {
      continue;
    }
  }

  return args;
}

async function tracerouteNetworks(req, res) {
  const { ip, options } = req.body;

  if (!Array.isArray(ip) || ip.length === 0) {
    return res.status(400).json({ error: "Please provide an array of targets (IP or hostname)" });
  }

  const argsFromOptions = buildArgsFromOptions(options);

  const tracerouteOne = (target) => {
    return new Promise((resolve) => {
      const cmd = process.platform === "win32" ? "tracert" : "traceroute";
      const spawnArgs = argsFromOptions.length ? [...argsFromOptions, target] : [target];

      const tracerouteProcess = spawn(cmd, spawnArgs);
      let stdout = "";
      let stderr = "";

      tracerouteProcess.stdout.on("data", (data) => (stdout += data.toString()));
      tracerouteProcess.stderr.on("data", (data) => (stderr += data.toString()));

      tracerouteProcess.on("close", (code) => {
        resolve({
          target,
          success: code === 0,
          result: stderr || stdout,
          exitCode: code,
        });
      });

      tracerouteProcess.on("error", (error) => {
        resolve({
          target,
          success: false,
          result: `Traceroute process error: ${error.message}`,
        });
      });
    });
  };

  // รันพร้อมกันทุก target
  const results = await Promise.all(ip.map(tracerouteOne));
  res.json({ total: results.length, results });
}

module.exports = { tracerouteNetworks };
