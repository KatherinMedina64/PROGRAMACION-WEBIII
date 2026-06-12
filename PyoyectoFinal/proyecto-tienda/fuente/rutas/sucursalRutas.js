const express = require('express')
const router  = express.Router()
const db      = require('../config/baseDatos')

// GET /api/sucursales
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT idsuc, nom_desc FROM SUCURSAL')
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /api/sucursales/:idsuc/stock  ← nueva
router.get('/:idsuc/stock', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
                SUM(CASE WHEN z.idprod IS NOT NULL THEN s.cantidad ELSE 0 END) AS zapatos,
                SUM(CASE WHEN b.idprod IS NOT NULL THEN s.cantidad ELSE 0 END) AS bolsos,
                SUM(CASE WHEN a.idprod IS NOT NULL THEN s.cantidad ELSE 0 END) AS accesorios
            FROM STOCK s
            INNER JOIN PRODUCTOS p  ON s.id_prod = p.idprod
            LEFT  JOIN ZAPATO z     ON p.idprod  = z.idprod
            LEFT  JOIN BOLSOS b     ON p.idprod  = b.idprod
            LEFT  JOIN ACCESORIOS a ON p.idprod  = a.idprod
            WHERE s.id_suc = ?
        `, [req.params.idsuc])
        res.json(rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /api/sucursales/:idsuc/ventas-grafico
router.get('/:idsuc/ventas-grafico', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
                DATE_FORMAT(v.fecha, '%b') AS mes,
                MONTH(v.fecha)             AS num_mes,
                SUM(CASE WHEN z.idprod IS NOT NULL THEN dv.cantidad ELSE 0 END) AS zapatos,
                SUM(CASE WHEN b.idprod IS NOT NULL THEN dv.cantidad ELSE 0 END) AS bolsos,
                SUM(CASE WHEN a.idprod IS NOT NULL THEN dv.cantidad ELSE 0 END) AS accesorios
            FROM VENTA v
            INNER JOIN DETALLE_VENTA dv ON v.id_v     = dv.id_v
            INNER JOIN PRODUCTOS p      ON dv.id_prod  = p.idprod
            LEFT  JOIN ZAPATO z         ON p.idprod    = z.idprod
            LEFT  JOIN BOLSOS b         ON p.idprod    = b.idprod
            LEFT  JOIN ACCESORIOS a     ON p.idprod    = a.idprod
            WHERE v.id_suc = ?
            GROUP BY MONTH(v.fecha), DATE_FORMAT(v.fecha, '%b')
            ORDER BY num_mes ASC
        `, [req.params.idsuc])
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router