const express = require("express");
const router = express.Router();
const {
    resolveDNS,
} = require("../controllers/resolveController");

router.post("/", resolveDNS);

module.exports = router;
