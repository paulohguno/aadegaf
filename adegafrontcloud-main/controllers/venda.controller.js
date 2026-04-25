const { Venda } = require("../models");

exports.listar = async (_req, res) => {
  const rows = await Venda.findAll({ order: [["id", "ASC"]] });
  res.json(rows);
};

exports.buscarPorId = async (req, res) => {
  const row = await Venda.findByPk(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Venda nao encontrada" });
  }
  return res.json(row);
};
