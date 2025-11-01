const dns = require("dns").promises;

function extractDomain(url) {
    const match = url.match(/www\.(.+?)\.com/);
    return match ? match[0] : null; 
}
async function resolveDNS(req, res) {
    const { hostnames } = req.body;
    if (!Array.isArray(hostnames) || hostnames.length === 0) {
        return res.status(400).json({ error: "Please provide an array of hostnames" });
    }

    const results = await Promise.all(hostnames.map(async (host) => {
        const domain = extractDomain(host);
        if (!domain) {
            return { hostnames, success: false, error: "Cannot extract domain" };
        }

        try {
            const addresses = await dns.resolve(domain); 
            return { hostnames, domain, success: true, addresses };
        } catch (error) {
            return { hostnames, domain, success: false, error: error.message };
        }
    }));

    res.json({ results });
}

module.exports = { resolveDNS };
