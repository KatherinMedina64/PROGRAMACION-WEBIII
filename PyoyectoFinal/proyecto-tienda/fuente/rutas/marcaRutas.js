const express = require('express')
const router  = express.Router()
const db      = require('../config/baseDatos')

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT idmarc, nombre FROM MARCA')
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router