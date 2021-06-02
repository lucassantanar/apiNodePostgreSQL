const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  let data;  
  const { Pool } = require("pg");
  const pool = new Pool({
    user: "postgres",
    host: "192.168.0.153",
    database: "boechat",
    password: "juizladrao",
    port: 5432,
  });

  pool.query(
    "select * from arq_agendal WHERE cod_paciente is not null limit 100",
    (err, { rows }) => {
      data = JSON.stringify(rows);
      res.send(data);
      pool.end();
    }
  ); 
});

app.listen(1483, () => console.log("Sevidor executando em: http://localhost:9000"));

