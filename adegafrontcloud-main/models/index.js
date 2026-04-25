const { Sequelize } = require("sequelize");
const config = require("../config/database");

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging,
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Cliente = require("./Cliente")(sequelize);
db.Estoque = require("./Estoque")(sequelize);
db.Produto = require("./Produto")(sequelize);
db.Venda = require("./Venda")(sequelize);

module.exports = db;
