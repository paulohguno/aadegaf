require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./models");

const app = express();
const basePort = Number(process.env.PORT || 7777);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

app.use("/api/clientes", require("./routes/clientes.routes"));
app.use("/api/estoque", require("./routes/estoque.routes"));
app.use("/api/produtos", require("./routes/produtos.routes"));
app.use("/api/vendas", require("./routes/vendas.routes"));
app.use("/api/local", require("./routes/local.routes"));

app.use(express.static(path.resolve(__dirname)));

app.get("*", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

async function start() {
  try {
    await db.sequelize.authenticate();
    //await db.sequelize.sync({ force: true });
    const server = app.listen(basePort, () => {
      console.log(`Servidor iniciado em http://localhost:${basePort}`);
    });

    server.on("error", (error) => {
      if (error && error.code === "EADDRINUSE") {
        console.error(`Porta ${basePort} em uso. Pare o processo que usa essa porta ou altere PORT.`);
      } else {
        console.error("Erro ao iniciar servidor:", error.message || error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Falha ao conectar no banco:", error.message || error);
    if (error && error.original) {
      console.error("Detalhe:", error.original.message || error.original);
    }
    process.exit(1);
  }
}

start();
