const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => res.json({ msg: "This is the users route" }));
/* The callback for every Express route requires a request and response as
arguments */

module.exports = router;