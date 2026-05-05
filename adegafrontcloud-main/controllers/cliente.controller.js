const { Cliente } = require("../models");

exports.listar = async (_req, res) => {
  try {
    const rows = await Cliente.findAll({ order: [["id", "ASC"]] });
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar clientes" });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const row = await Cliente.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    return res.json(row);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar cliente" });
  }
};

exports.criar = async (req, res) => {
  try {
    const dados = req.body;
    if (!dados || Object.keys(dados).length === 0) {
      return res.status(400).json({ error: "Dados obrigatórios" });
    }
    const row = await Cliente.create(dados);
    return res.status(201).json(row);
  } catch (error) {
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: error.errors?.map((e) => e.message).join(", ") });
    }
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    if (!dados || Object.keys(dados).length === 0) {
      return res.status(400).json({ error: "Dados obrigatórios" });
    }

    const row = await Cliente.findByPk(id);
    if (!row) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    await row.update(dados);
    return res.json(row);
  } catch (error) {
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: error.errors?.map((e) => e.message).join(", ") });
    }
    return res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
};

exports.remover = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Cliente.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    return res.status(200).json({ id: Number(id), removido: true });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover cliente" });
  }
};