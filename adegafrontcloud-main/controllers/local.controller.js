const { sequelize, Cliente, Estoque, Produto, Venda } = require("../models");

const MODELOS = {
  clientes: Cliente,
  estoque: Estoque,
  produtos: Produto,
  vendas: Venda,
};

function getModel(entidade) {
  const model = MODELOS[entidade];
  if (!model) {
    const error = new Error(`entidade invalida: ${entidade}`);
    error.status = 400;
    throw error;
  }
  return model;
}

async function executarOperacao({ entidade, acao = "criar", id, dados = {} }, transaction) {
  const Model = getModel(entidade);

  if (acao === "criar") {
    return Model.create(dados, { transaction });
  }

  if (acao === "atualizar") {
    if (!id && id !== 0) {
      const error = new Error("id obrigatorio para atualizar");
      error.status = 400;
      throw error;
    }

    const row = await Model.findByPk(id, { transaction });
    if (!row) {
      const error = new Error(`${entidade} id ${id} nao encontrado`);
      error.status = 404;
      throw error;
    }

    await row.update(dados, { transaction });
    return row;
  }

  if (acao === "remover") {
    if (!id && id !== 0) {
      const error = new Error("id obrigatorio para remover");
      error.status = 400;
      throw error;
    }

    const deleted = await Model.destroy({ where: { id }, transaction });
    if (!deleted) {
      const error = new Error(`${entidade} id ${id} nao encontrado`);
      error.status = 404;
      throw error;
    }

    return { id, removido: true };
  }

  const error = new Error(`acao invalida: ${acao}`);
  error.status = 400;
  throw error;
}

exports.salvar = async (req, res) => {
  try {
    const resultado = await sequelize.transaction(async (transaction) => {
      return executarOperacao(req.body || {}, transaction);
    });

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "erro ao salvar" });
  }
};

exports.salvarLote = async (req, res) => {
  try {
    const operacoes = Array.isArray(req.body?.operacoes) ? req.body.operacoes : [];
    if (operacoes.length === 0) {
      return res.status(400).json({ error: "operacoes obrigatorias" });
    }

    const resultados = await sequelize.transaction(async (transaction) => {
      const out = [];
      for (const op of operacoes) {
        out.push(await executarOperacao(op, transaction));
      }
      return out;
    });

    return res.status(200).json({ ok: true, total: resultados.length, resultados });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "erro ao salvar lote" });
  }
};
