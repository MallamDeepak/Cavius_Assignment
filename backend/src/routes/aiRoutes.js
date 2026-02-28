const express = require("express");
const { generateTaskSuggestion } = require("../controllers/aiController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);
router.post("/task-suggestions", generateTaskSuggestion);

module.exports = router;
