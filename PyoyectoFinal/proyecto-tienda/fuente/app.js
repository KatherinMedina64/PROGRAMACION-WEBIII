const express = require('express')
const cors    = require('cors')
const path    = require('path')
require('dotenv').config()

const authRutas     = require('./rutas/authRutas')
const productoRutas = require('./rutas/productoRutas')
const ventaRutas    = require('./rutas/ventaRutas')
const sucursalRutas = require('./rutas/sucursalRutas')
const uploadRutas   = require('./rutas/uploadRutas')
const marcaRutas    = require('./rutas/marcaRutas')

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth',       authRutas)
app.use('/api/productos',  productoRutas)
app.use('/api/ventas',     ventaRutas)
app.use('/api/sucursales', sucursalRutas)
app.use('/api/upload',     uploadRutas)
app.use('/api/marcas',     marcaRutas)

module.exports = app