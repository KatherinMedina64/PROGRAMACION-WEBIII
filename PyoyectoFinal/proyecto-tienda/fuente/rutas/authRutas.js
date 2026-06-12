const express = require('express')
const router  = express.Router()
const authControlador = require('../controladores/authControlador')

router.post('/login',    authControlador.login)
router.post('/register', authControlador.register)

module.exports = router