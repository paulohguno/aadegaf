const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Venda",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      produto: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      custoProducao: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: "custo_producao",
      },
      cliente: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      clienteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "cliente_id",
      },
      data: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: "vendas",
      underscored: true,
      timestamps: false,
    }
  );
};
