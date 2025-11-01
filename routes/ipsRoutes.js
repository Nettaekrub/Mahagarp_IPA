const express = require("express");
const router = express.Router();
const {
    getIPs,
    addIP,
    editIP,
    deleteIP,
} = require("../controllers/ipController");

router.get("/:network_id/ips", getIPs);
router.post("/", addIP);
router.put("/", editIP);
router.delete("/", deleteIP);

module.exports = router;
