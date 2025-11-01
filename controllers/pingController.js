const { spawn } = require("child_process");
const ipLib = require("ip");

function buildArgsForPlatform(baseIP, options = {}, rawArgs = null) {
  if (Array.isArray(rawArgs) && rawArgs.length > 0) {
    return [...rawArgs, baseIP];
  }

  const hasOptions =
    options &&
    Object.keys(options).length > 0 &&
    Object.values(options).some((v) => v !== undefined && v !== null);

  if (!hasOptions) {
    return [baseIP]; 
  }

  const isWin = process.platform === "win32";
  const args = [];

  if (options.count != null) {
    args.push(isWin ? "-n" : "-c", String(options.count));
  }

  if (options.size != null) {
    args.push(isWin ? "-l" : "-s", String(options.size));
  }

  if (options.ttl != null) {
    args.push(isWin ? "-i" : "-t", String(options.ttl));
  }

  if (options.timeout_ms != null) {
    if (isWin) {
      args.push("-w", String(options.timeout_ms));
    } else {
      const sec = Math.ceil(Number(options.timeout_ms) / 1000);
      args.push("-W", String(sec));
    }
  }

  args.push(baseIP);
  return args;
}

async function pingNetworks(req, res) {
  const { ip, options, rawArgs } = req.body;

  if (!ip || !Array.isArray(ip) || ip.length === 0) {
    return res
      .status(400)
      .json({ error: "Please provide an array of IP addresses (can be 'x.x.x.x' or 'x.x.x.x/24')." });
  }

  const pingOne = (ipWithMask) =>
    new Promise((resolve) => {
      if (!ipWithMask || typeof ipWithMask !== "string") {
        return resolve({
          input: ipWithMask,
          success: false,
          error: "Invalid entry",
        });
      }

      const [baseIP, mask] = ipWithMask.includes("/") ? ipWithMask.split("/") : [ipWithMask, null];

      if (!ipLib.isV4Format(baseIP)) {
        return resolve({
          input: ipWithMask,
          success: false,
          error: "Invalid IPv4 address.",
        });
      }

      const args = buildArgsForPlatform(baseIP, options || {}, Array.isArray(rawArgs) ? rawArgs : null);

      const pingProcess = spawn("ping", args);
      let stdout = "";
      let stderr = "";

      pingProcess.stdout.on("data", (data) => (stdout += data.toString()));
      pingProcess.stderr.on("data", (data) => (stderr += data.toString()));

      const childTimeoutMs = (options && options._childTimeoutMs) || 30000;
      const childTimeout = setTimeout(() => {
        try {
          pingProcess.kill();
        } catch (e) {}
      }, childTimeoutMs);

      pingProcess.on("close", (code) => {
        clearTimeout(childTimeout);
        const success =
          code === 0 ||
          stdout.includes("bytes from") ||
          stdout.match(/ttl=/i) ||
          stdout.includes("TTL=");

        resolve({
          input: ipWithMask,
          target: baseIP,
          mask: mask || null,
          usedArgs: args,
          success,
          result: stderr || stdout,
          exitCode: code,
        });
      });

      pingProcess.on("error", (error) => {
        clearTimeout(childTimeout);
        resolve({
          input: ipWithMask,
          target: baseIP,
          mask: mask || null,
          usedArgs: args,
          success: false,
          result: `Ping process error: ${error.message}`,
        });
      });
    });

  const results = await Promise.all(ip.map(pingOne));

  res.json({
    total: results.length,
    results,
  });
}

module.exports = { pingNetworks };
