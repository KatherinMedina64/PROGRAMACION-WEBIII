
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Registrar sesión
await db.execute(
    'INSERT INTO SESION (id_usu) VALUES (?)',
    [user.idu]
)// Leer el token que viene en las cabeceras de la petición
 

////////////