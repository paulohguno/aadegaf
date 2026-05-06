const { Venda, Produto, Estoque } = require("../models");

exports.listar = async (_req, res) => {
  try {
    const rows = await Venda.findAll({ order: [["id", "ASC"]] });
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar vendas" });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const row = await Venda.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }
    return res.json(row);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar venda" });
  }
};

exports.criar = async (req, res) => {
  try {
    const dados = req.body;
    if (!dados || Object.keys(dados).length === 0) {
      return res.status(400).json({ error: "Dados obrigatórios" });
    }
    const row = await Venda.create(dados);
    return res.status(201).json(row);
  } catch (error) {
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: error.errors?.map((e) => e.message).join(", ") });
    }
    return res.status(500).json({ error: "Erro ao criar venda" });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    if (!dados || Object.keys(dados).length === 0) {
      return res.status(400).json({ error: "Dados obrigatórios" });
    }

    const row = await Venda.findByPk(id);
    if (!row) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    await row.update(dados);
    return res.json(row);
  } catch (error) {
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: error.errors?.map((e) => e.message).join(", ") });
    }
    return res.status(500).json({ error: "Erro ao atualizar venda" });
  }
};

exports.remover = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar venda
    const venda = await Venda.findByPk(id);
    if (!venda) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }
    
    // Buscar produto para devolver itens
    const produto = await Produto.findOne({ where: { nome: venda.produto } });
    if (produto && produto.composicao && Array.isArray(produto.composicao)) {
      // Devolver cada item para o estoque
      for (const comp of produto.composicao) {
        const estoqueItem = await Estoque.findByPk(comp.id);
        if (estoqueItem) {
          estoqueItem.quantidade += comp.qtdConsumo;
          await estoqueItem.save();
        }
      }
    }
    
    // Deletar venda
    const deleted = await Venda.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }
    return res.status(200).json({ id: Number(id), removido: true });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover venda" });
  }
};