const { Cliente } = require("../models");

exports.listar = async (_req, res) => {
  const rows = await Cliente.findAll({ order: [["id", "ASC"]] });
  res.json(rows);
};

exports.buscarPorId = async (req, res) => {
  const row = await Cliente.findByPk(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Cliente nao encontrado" });
  }
  return res.json(row);
};
