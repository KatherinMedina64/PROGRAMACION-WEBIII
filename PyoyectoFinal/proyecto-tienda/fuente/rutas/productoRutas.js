const express = require('express');
const router = express.Router();
const productoControlador = require('../controladores/productoControlador.js');
const { body } = require('express-validator');


router.put('/zapato/:idprod',    productoControlador.editarZapato)
router.put('/bolso/:idprod',     productoControlador.editarBolso)
router.put('/accesorio/:idprod', productoControlador.editarAccesorio)
// ==========================================
// 1. SECCIÓN ZAPATOS
// ==========================================
router.get('/zapatos', productoControlador.listarZapatos);

router.post('/zapato', [
    body('precio').isNumeric().withMessage('El precio debe ser un número decimal válido'),
    body('idmarc').isInt().withMessage('Clave de marca debe ser un entero'),
    body('nro').notEmpty().withMessage('El número de talla es obligatorio'),
    body('modelo').notEmpty().withMessage('El modelo del calzado es obligatorio'),
    body('idsuc').isInt().withMessage('Debe asociar una sucursal inicial')
], productoControlador.crearZapato);

// ==========================================
// 2. SECCIÓN ACCESORIOS
// ==========================================
router.get('/accesorios', productoControlador.listarAccesorios);

router.post('/accesorio', [
    body('precio').isNumeric().withMessage('El precio debe ser un número decimal válido'),
    body('idmarc').isInt().optional(),
    body('Nom_ac').notEmpty().withMessage('El nombre del accesorio es obligatorio'),
    body('idsuc').isInt().withMessage('Debe asociar una sucursal inicial')
], productoControlador.crearAccesorio);

// ==========================================
// 3. SECCIÓN BOLSOS
// ==========================================
router.get('/bolsos', productoControlador.listarBolsos);

router.post('/bolso', [
    body('precio').isNumeric().withMessage('El precio debe ser un número decimal válido'),
    body('idmarc').isInt().optional(),
    body('tamano').notEmpty().withMessage('El tamaño del bolso es obligatorio'),
    body('idsuc').isInt().withMessage('Debe asociar una sucursal inicial')
], productoControlador.crearBolso);

// ==========================================
// 4. ELIMINACIÓN LÓGICA (GENERAL)
// ==========================================
router.delete('/borrar/:idprod', productoControlador.eliminarLogico);

module.exports = router;