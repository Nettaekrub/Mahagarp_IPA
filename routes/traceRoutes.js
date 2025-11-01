const express = require("express");
const router = express.Router();
const {
    tracerouteNetworks,
} = require("../controllers/traceController");

router.post("/", tracerouteNetworks);

module.exports = router;
