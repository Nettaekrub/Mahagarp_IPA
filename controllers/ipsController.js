const { getDb } = require("../database/database");

async function getIPs(req, res) {
    const { network_id } = req.params; 
    const db = await getDb();
    const ips = await db.all("SELECT * FROM ip_entries WHERE network_id = ?", [network_id]);
    res.json(ips);
}

async function addIP(req, res) {
    const { network_id, ip_address } = req.body;
    const db = await getDb();
    await db.run("INSERT INTO ip_entries (ip_address, network_id) VALUES (?, ?)", ip_address, network_id);
    res.sendStatus(200);
}

async function editIP(req, res) {
    const { entry_id, ip_address } = req.body;
    const db = await getDb();
    await db.run("UPDATE ip_entries SET ip_address = ? WHERE entry_id = ?", [ip_address, entry_id]);
    res.sendStatus(200);
}

async function deleteIP(req, res) {
    const { id } = req.params;
    const db = await getDb();
    await db.run("DELETE FROM ip_entries WHERE entry_id = ?", [id]);
    res.sendStatus(200);
}

module.exports = { getIPs, addIP, editIP, deleteIP };