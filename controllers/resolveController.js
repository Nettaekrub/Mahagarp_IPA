const dns = require("dns").promises;

const allowedTypes = new Set(["A","AAAA","MX","NS","CNAME","PTR","ANY","TXT"]);

function cleanHost(host) {
    let domain = host;
    domain = domain.replace(/^(https?:\/\/)/, "");
    domain = domain.split('/')[0];
    return domain;
}

async function resolveDNS(req, res) {
    const { hostnames, type } = req.body;

    if (!Array.isArray(hostnames) || hostnames.length === 0) {
        return res.status(400).json({ error: "Please provide an array of hostnames" });
    }

    const recordType = (typeof type === "string" && allowedTypes.has(type.toUpperCase()))
                       ? type.toUpperCase() 
                       : "A";

    const results = await Promise.all(hostnames.map(async (host) => {
        
        const target = cleanHost(host);

        try {
            if (recordType === "PTR") {
                const addresses = await dns.reverse(target);
                return { host, target, success: true, type: "PTR", addresses };

            } else {
                const addresses = await dns.resolve(target, recordType);
                return { host, target, success: true, type: recordType, addresses };
            }

        } catch (error) {
            return { host, target, success: false, type: recordType, error: error.message };
        }
    }));

    res.json({ results });
}

module.exports = { resolveDNS };