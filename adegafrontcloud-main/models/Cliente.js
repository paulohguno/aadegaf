const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Cliente",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      telefone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
    },
    {
      tableName: "clientes",
      underscored: true,
      timestamps: true,
    }
  );
};
