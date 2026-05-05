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
    const error = new Error(`Entidade inválida: ${entidade}. Valores aceitos: ${Object.keys(MODELOS).join(", ")}`);
    error.status = 400;
    throw error;
  }
  return model;
}

async function executarOperacao({ entidade, acao = "criar", id, dados = {} }, transaction) {
  if (!entidade) {
    const error = new Error("Campo 'entidade' é obrigatório");
    error.status = 400;
    throw error;
  }

  const Model = getModel(entidade);

  if (acao === "criar") {
    if (!dados || Object.keys(dados).length === 0) {
      const error = new Error("Campo 'dados' é obrigatório para criar");
      error.status = 400;
      throw error;
    }
    return Model.create(dados, { transaction });
  }

  if (acao === "atualizar") {
    if (id === undefined || id === null) {
      const error = new Error("Campo 'id' é obrigatório para atualizar");
      error.status = 400;
      throw error;
    }
    if (!dados || Object.keys(dados).length === 0) {
      const error = new Error("Campo 'dados' é obrigatório para atualizar");
      error.status = 400;
      throw error;
    }

    const row = await Model.findByPk(id, { transaction });
    if (!row) {
      const error = new Error(`${entidade} com id ${id} não encontrado`);
      error.status = 404;
      throw error;
    }

    await row.update(dados, { transaction });
    return row;
  }

  if (acao === "remover") {
    if (id === undefined || id === null) {
      const error = new Error("Campo 'id' é obrigatório para remover");
      error.status = 400;
      throw error;
    }

    const deleted = await Model.destroy({ where: { id }, transaction });
    if (!deleted) {
      const error = new Error(`${entidade} com id ${id} não encontrado`);
      error.status = 404;
      throw error;
    }

    return { id, removido: true };
  }

  const error = new Error(`Ação inválida: ${acao}. Valores aceitos: criar, atualizar, remover`);
  error.status = 400;
  throw error;
}

exports.salvar = async (req, res) => {
  try {
    const body = req.body;
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ error: "Body da requisição é obrigatório" });
    }

    const resultado = await sequelize.transaction(async (transaction) => {
      return executarOperacao(body, transaction);
    });

    return res.status(200).json(resultado);
  } catch (error) {
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: error.errors?.map((e) => e.message).join(", ") });
    }
    return res.status(error.status || 500).json({ error: error.message || "Erro ao salvar" });
  }
};

exports.salvarLote = async (req, res) => {
  try {
    const operacoes = Array.isArray(req.body?.operacoes) ? req.body.operacoes : [];
    if (operacoes.length === 0) {
      return res.status(400).json({ error: "Campo 'operacoes' é obrigatório e deve ser um array não vazio" });
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
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: error.errors?.map((e) => e.message).join(", ") });
    }
    return res.status(error.status || 500).json({ error: error.message || "Erro ao salvar lote" });
  }
};