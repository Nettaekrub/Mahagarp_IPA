const express = require("express");
const router = express.Router();
const {
    getNetworks,
    addNetwork,
    editNetwork,
    deleteNetwork,
} = require("../controllers/tableController");

router.get("/", getNetworks);
router.post("/", addNetwork);
router.put("/", editNetwork);
router.delete("/:id", deleteNetwork);

module.exports = router;
