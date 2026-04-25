const express = require("express");
const controller = require("../controllers/local.controller");

const router = express.Router();

router.post("/salvar", controller.salvar);
router.post("/salvar-lote", controller.salvarLote);

module.exports = router;
