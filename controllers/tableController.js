const { getDb } = require("../database/database");

async function getNetworks(req, res) {
    const db = await getDb();
    const networks = await db.all("SELECT * FROM networks");
    res.json(networks);
}
    
async function addNetwork(req, res) {
    const { network_name } = req.body;
    try {
        const db = await getDb();
        await db.run("INSERT INTO networks (network_name) VALUES (?)", [network_name]);
        res.sendStatus(200);
    } catch (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
            res.status(400).json({ error: "Network name already exists" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
}

async function editNetwork(req, res) {
    const { network_id, network_name } = req.body;
    const db = await getDb();
    await db.run("UPDATE networks SET network_name = ? WHERE network_id = ?", [network_name, network_id]);
    res.sendStatus(200);
}

async function deleteNetwork(req, res) {
    const { network_id } = req.body;
    const db = await getDb();
    await db.run("DELETE FROM networks WHERE network_id = ?", [network_id]);
    res.sendStatus(200);
}

module.exports = { getNetworks, addNetwork, editNetwork, deleteNetwork };
