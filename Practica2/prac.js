import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json());

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "practica2",
});

app.get("/", async (req, res) => {
    const [resultado] = await pool.query("SELECT * FROM categorias");
    res.send(resultado);
});

//1.
app.post("/", async (req, res) => {
    try {
        const { nombre, descripcion, createdAt, updatedAt } = req.body;

        const [resultado] = await pool.query(
            "INSERT INTO categorias (nombre, descripcion, createdAt, updatedAt) VALUES (?, ?, ?, ?)",
            [nombre, descripcion, createdAt, updatedAt],
        );

        res.status(201).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al insertar el producto",
        });
    }
});

//2.
app.get("/categorias", async (req, res) => {
    try {
        const [categorias] = await pool.query('SELECT * FROM categorias');

        res.json(categorias);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: 'Error al obtener categorías',
        });
    }
});

//3.
app.get("/categorias/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [categoria] = await pool.query('SELECT * FROM categorias WHERE id=?', [
            id,
        ]);

        if (categoria.length === 0) {
            return res.status(404).json({
                mensaje: "Categoría no encontrada",
            });
        }

        const [productos] = await pool.query(
            "SELECT * FROM producto WHERE cid=?",
            [id],
        );

        res.json({
            categoria: categoria[0],
            productos,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: "Error al obtener categoría",
        });
    }
});

//4.
app.patch("/categorias/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, updatedAt } = req.body;

        const [resultado] = await pool.query(
            `UPDATE categoria
            SET nombre=?, descripcion=?, updatedAt=?
            WHERE id=?`,
            [nombre, descripcion, updatedAt, id],
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Categoría no encontrada",
            });
        }

        res.json({
            mensaje: "Categoría actualizada",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: "Error al actualizar categoría",
        });
    }
});

//5.
app.delete("/categorias/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query('DELETE FROM categorias WHERE id=?', [
            id,
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Categoría no encontrada",
            });
        }

        res.json({
            mensaje: "Categoría eliminada",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: "Error al eliminar categoría",
        });
    }
});

const PUERTO = 3005;
app.listen(PUERTO, () => {
    console.log(`Servidor backend en http://localhost:${PUERTO}`);
});
