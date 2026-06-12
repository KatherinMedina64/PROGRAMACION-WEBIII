const db = require('../config/baseDatos');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'bellamujer_secret';

exports.register = async (req, res) => {
    const { nombre, email, password } = req.body;

    // 1. Validar que los campos no estén vacíos
    if (!nombre || !email || !password)
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });

    // 2. Validar que el nombre no sea un número (int) o puro dígito
    if (!isNaN(nombre) || /^\d+$/.test(nombre.trim())) {
        return res.status(400).json({ error: 'El nombre no puede ser un número.' });
    }

    // 3. Validar que sea un correo de Gmail válido
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
        return res.status(400).json({ error: 'El correo debe ser una dirección de Gmail válida (@gmail.com).' });
    }

    // 4. Validar la fuerza de la contraseña
    const resultado = validarContrasena(password);

if (resultado === 'débil') {
    console.log('La contraseña es débil.');
} else if (resultado === 'media') {
    console.log('La contraseña es media.');
}
    // Si es 'fuerte', el código continúa sin detenerse aquí.

    try {
        const [existe] = await db.execute(
            'SELECT idu FROM USUARIO WHERE gmail = ?', [email]
        );
        if (existe.length > 0)
            return res.status(400).json({ error: 'El email ya está registrado.' });

        const hash = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO USUARIO (nombre, gmail, pasword) VALUES (?, ?, ?)',
            [nombre, email, hash]
        );
        return res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al registrar usuario.' });
    }
};

exports.login = async (req, res) => {
    const { usuario, email, password } = req.body;
    const buscar = usuario || email;
    if (!buscar || !password)
        return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });

    try {
        const [rows] = await db.execute(
            'SELECT * FROM USUARIO WHERE nombre = ? OR gmail = ?',
            [buscar, buscar]
        );
        if (rows.length === 0)
            return res.status(401).json({ error: 'Credenciales incorrectas.' });

        const user = rows[0];
        const coincide = await bcrypt.compare(password, user.pasword);
        if (!coincide)
            return res.status(401).json({ error: 'Credenciales incorrectas.' });

        const token = jwt.sign(
            { idu: user.idu, nombre: user.nombre },
            SECRET,
            { expiresIn: '8h' }
        );

        try {
            await db.execute(
                `INSERT INTO sesion (id_usu, ip, browser, evento) VALUES (?, ?, ?, ?)`,
                [
                    user.idu,
                    req.ip,
                    req.headers['user-agent'],
                    'INGRESO'
                ]
            );

            console.log("Sesión registrada correctamente");
        }
        catch (error) {
            console.log("ID:", user.idu);
            console.log("IP:", req.ip);
            console.log("Browser:", req.headers['user-agent']);
            console.error(error);
        }
        return res.json({
            token,
            usuario: { idu: user.idu, nombre: user.nombre, gmail: user.gmail }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
};

// Función para validar la fuerza de la contraseña
const validarContrasena = (contrasena) => {
    const longitudMinima = 8;
    const tieneMayusculas = /[A-Z]/.test(contrasena);
    const tieneMinusculas = /[a-z]/.test(contrasena);
    const tieneNumeros = /\d/.test(contrasena);
    const tieneSimbolos = /[!@#$%^&*]/.test(contrasena);

    if (contrasena.length < longitudMinima) {
        return 'débil';
    }
    const criteriosCumplidos = [tieneMayusculas, tieneMinusculas, tieneNumeros, tieneSimbolos].filter(Boolean).length;

    if (criteriosCumplidos < 2) {
        return 'débil';
    } else if (criteriosCumplidos === 2) {
        return 'media';
    } else {
        return 'fuerte';
    }
};