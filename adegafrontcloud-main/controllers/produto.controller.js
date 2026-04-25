const { Produto } = require("../models");

exports.listar = async (_req, res) => {
  const rows = await Produto.findAll({ order: [["id", "ASC"]] });
  res.json(rows);
};

exports.buscarPorId = async (req, res) => {
  const row = await Produto.findByPk(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Produto nao encontrado" });
  }
  return res.json(row);
};
