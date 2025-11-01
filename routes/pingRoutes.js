const express = require("express");
const router = express.Router();
const {
    pingNetworks,
} = require("../controllers/pingController");

router.post("/", pingNetworks);

module.exports = router;
