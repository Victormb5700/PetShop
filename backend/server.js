// =============================================
// PetAgenda Backend - Node.js + Express + MySQL
// CRUD completo de agendamentos para Pet Shop
// =============================================

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "petshop",
    waitForConnections: true,
    connectionLimit: 10,
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// GET /api/agendamentos - lista com busca e filtros
app.get("/api/agendamentos", async (req, res) => {
    try {
        const { search, especie, data } = req.query;
        let sql = "SELECT * FROM agendamentos";
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push("(nome_pet LIKE ? OR nome_tutor LIKE ? OR servico LIKE ? OR observacao LIKE ?)");
            const termo = `%${search}%`;
            params.push(termo, termo, termo, termo);
        }

        if (especie) {
            conditions.push("especie = ?");
            params.push(especie);
        }

        if (data) {
            conditions.push("DATE(data_hora) = ?");
            params.push(data);
        }

        if (conditions.length) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " ORDER BY data_hora ASC";
        const [rows] = await pool.execute(sql, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar agendamentos." });
    }
});

// GET /api/agendamentos/:id - busca um registro para edição
app.get("/api/agendamentos/:id", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM agendamentos WHERE id = ?",
            [req.params.id],
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Agendamento não encontrado." });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar agendamento." });
    }
});

// POST /api/agendamentos - cria agendamento
app.post("/api/agendamentos", async (req, res) => {
    try {
        const { nome_pet, nome_tutor, especie, servico, data_hora, observacao } = req.body;

        if (!nome_pet || !nome_tutor || !especie || !servico || !data_hora) {
            return res.status(400).json({
                error: "Preencha nome do pet, tutor, espécie, serviço, data e hora.",
            });
        }

        if (!["Cachorro", "Gato"].includes(especie)) {
            return res.status(400).json({ error: "Espécie inválida." });
        }

        const sql = `
            INSERT INTO agendamentos
            (nome_pet, nome_tutor, especie, servico, data_hora, observacao)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            nome_pet.trim(),
            nome_tutor.trim(),
            especie,
            servico.trim(),
            data_hora,
            observacao?.trim() || null,
        ]);

        res.status(201).json({
            message: "Agendamento criado com sucesso!",
            id: result.insertId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar agendamento." });
    }
});

// PUT /api/agendamentos/:id - atualiza agendamento
app.put("/api/agendamentos/:id", async (req, res) => {
    try {
        const { nome_pet, nome_tutor, especie, servico, data_hora, observacao } = req.body;

        if (!nome_pet || !nome_tutor || !especie || !servico || !data_hora) {
            return res.status(400).json({
                error: "Preencha todos os campos obrigatórios.",
            });
        }

        const [result] = await pool.execute(
            `UPDATE agendamentos
             SET nome_pet = ?, nome_tutor = ?, especie = ?, servico = ?, data_hora = ?, observacao = ?
             WHERE id = ?`,
            [
                nome_pet.trim(),
                nome_tutor.trim(),
                especie,
                servico.trim(),
                data_hora,
                observacao?.trim() || null,
                req.params.id,
            ],
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: "Agendamento não encontrado." });
        }

        res.json({ message: "Agendamento atualizado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar agendamento." });
    }
});

// DELETE /api/agendamentos/:id - exclui agendamento
app.delete("/api/agendamentos/:id", async (req, res) => {
    try {
        const [result] = await pool.execute(
            "DELETE FROM agendamentos WHERE id = ?",
            [req.params.id],
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: "Agendamento não encontrado." });
        }

        res.json({ message: "Agendamento excluído com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir agendamento." });
    }
});

app.listen(PORT, () => {
    console.log(`🐾 PetAgenda rodando em http://localhost:${PORT}`);
    console.log(`📅 API: http://localhost:${PORT}/api/agendamentos`);
});
