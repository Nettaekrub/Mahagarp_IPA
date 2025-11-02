const { getDb } = require("../database/database");

async function getNetworks(req, res) {
  try {
    const db = await getDb();
    const rows = await db.all(`
        SELECT n.network_id, n.network_name, e.ip_address
        FROM networks n
        LEFT JOIN ip_entries e ON e.network_id = n.network_id
    `);

    const networks = Object.values(
      rows.reduce((acc, row) => {
        if (!acc[row.network_id]) {
          acc[row.network_id] = {
            network_id: row.network_id,
            network_name: row.network_name,
            ip_list: []
          };
        }
        if (row.ip_address) acc[row.network_id].ip_list.push(row.ip_address);
        return acc;
      }, {})
    );

    res.json(networks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
    
async function addNetwork(req, res) {
    const { network_name } = req.body;
    try {
        const db = await getDb();
        await db.run("INSERT INTO networks (network_name) VALUES (?)", [network_name]);
        res.status(200).json({ message: "OK" });
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
    const { id } = req.params;
    const db = await getDb();
    await db.run("DELETE FROM networks WHERE network_id = ?", [id]);
    res.sendStatus(200);
}

module.exports = { getNetworks, addNetwork, editNetwork, deleteNetwork };
