const express = require('express')
const router = express.Router()
const ventaControlador = require('../controladores/ventaControlador.js')

router.get('/historial',          ventaControlador.listarVentas)
router.get('/historial/:idsuc',   ventaControlador.listarVentasPorSucursal)
router.post('/procesar',          ventaControlador.registrarVenta)
router.put('/editar/:id_v',       ventaControlador.editarVenta)
router.delete('/eliminar/:id_v',  ventaControlador.eliminarVenta)

module.exports = router