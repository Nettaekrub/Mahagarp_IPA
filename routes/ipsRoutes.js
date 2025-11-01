const express = require("express");
const router = express.Router();
const {
    getIPs,
    addIP,
    editIP,
    deleteIP,
} = require("../controllers/ipsController");

router.get("/:network_id/ips", getIPs);
router.post("/", addIP);
router.put("/", editIP);
router.delete("/:id", deleteIP);

module.exports = router;
