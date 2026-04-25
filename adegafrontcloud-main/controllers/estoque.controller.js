const { Estoque } = require("../models");

exports.listar = async (_req, res) => {
  const rows = await Estoque.findAll({ order: [["id", "ASC"]] });
  res.json(rows);
};

exports.buscarPorId = async (req, res) => {
  const row = await Estoque.findByPk(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Item de estoque nao encontrado" });
  }
  return res.json(row);
};
