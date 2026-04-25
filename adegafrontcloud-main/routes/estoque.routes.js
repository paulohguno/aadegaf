const express = require("express");
const controller = require("../controllers/estoque.controller");

const router = express.Router();

router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);

module.exports = router;
