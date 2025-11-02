const { spawn } = require("child_process");

function buildArgsForPlatform(target, options = {}, rawArgs = null) {
  if (Array.isArray(rawArgs) && rawArgs.length > 0) {
    return [...rawArgs, target];
  }

  const isWin = process.platform === "win32";
  const args = [];

  if (options.count != null) args.push(isWin ? "-n" : "-c", String(options.count));
  if (options.size != null) args.push(isWin ? "-l" : "-s", String(options.size));
  if (options.ttl != null) args.push(isWin ? "-i" : "-t", String(options.ttl));
  if (options.timeout_ms != null) {
    if (isWin) {
      args.push("-w", String(options.timeout_ms));
    } else {
      const sec = Math.ceil(Number(options.timeout_ms) / 1000);
      args.push("-W", String(sec));
    }
  }

  args.push(target);
  return args;
}

async function pingNetworks(req, res) {
  const { targets, options, rawArgs } = req.body;

  if (!targets || !Array.isArray(targets) || targets.length === 0) {
    return res.status(400).json({ error: "Please provide an array of targets (IP or domain)." });
  }

  const pingOne = (target) =>
    new Promise((resolve) => {
      if (!target || typeof target !== "string") {
        return resolve({ target, success: false, result: "Invalid entry" });
      }

      const args = buildArgsForPlatform(target, options || {}, Array.isArray(rawArgs) ? rawArgs : null);

      const pingProcess = spawn("ping", args);
      let stdout = "";
      let stderr = "";

      pingProcess.stdout.on("data", (data) => (stdout += data.toString()));
      pingProcess.stderr.on("data", (data) => (stderr += data.toString()));

      const childTimeoutMs = (options && options._childTimeoutMs) || 30000;
      const childTimeout = setTimeout(() => {
        try { pingProcess.kill(); } catch (e) {}
      }, childTimeoutMs);

      pingProcess.on("close", (code) => {
        clearTimeout(childTimeout);
        const success =
          code === 0 ||
          stdout.includes("bytes from") ||
          stdout.match(/ttl=/i) ||
          stdout.includes("TTL=");

        resolve({
          target,
          usedArgs: args,
          success,
          result: stderr || stdout,
          exitCode: code,
        });
      });

      pingProcess.on("error", (error) => {
        clearTimeout(childTimeout);
        resolve({
          target,
          usedArgs: args,
          success: false,
          result: `Ping process error: ${error.message}`,
        });
      });
    });

  const results = await Promise.all(targets.map(pingOne));

  res.json({
    total: results.length,
    results,
  });
}

module.exports = { pingNetworks };
