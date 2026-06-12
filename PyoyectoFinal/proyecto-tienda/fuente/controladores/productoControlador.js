const db = require('../config/baseDatos');
const { validationResult, body, param } = require('express-validator');

// =========================================================================
//                             SECCIÓN ZAPATOS
// =========================================================================

exports.crearZapato = [
    // Validaciones
    body('descripcion').isString().notEmpty().withMessage('La descripción es obligatoria y debe ser un texto.'),
    body('color').isString().notEmpty().withMessage('El color es obligatorio y debe ser un texto.'),
    body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo.'),
    body('img').isString().notEmpty().withMessage('La imagen es obligatoria y debe ser un texto.'),
    body('idmarc').isInt().withMessage('El ID de marca debe ser un número entero.'),
    body('nro').isInt().withMessage('La talla debe ser un número entero.'),
    body('modelo').isString().notEmpty().withMessage('El modelo es obligatorio y debe ser un texto.'),
    body('idsuc').isInt().withMessage('El ID de sucursal debe ser un número entero.'),
    body('cantidad_inicial').optional().isInt({ min: 0 }).withMessage('La cantidad inicial debe ser un entero mayor o igual a 0.'),
    // Controlador
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

        const { descripcion, color, precio, img, idmarc, nro, modelo, idsuc, cantidad_inicial } = req.body;

        const conexion = await db.getConnection();
        try {
            await conexion.beginTransaction();

            // 1. Insertar en PRODUCTOS
            const [resProd] = await conexion.execute(
                `INSERT INTO PRODUCTOS (descripcion, color, precio, img, id_marc) VALUES (?, ?, ?, ?, ?)`,
                [descripcion, color, precio, img, idmarc]
            );

            const nuevoidprod = resProd.insertId;

            // 2. Insertar en ZAPATO
            await conexion.execute(
                `INSERT INTO ZAPATO (idprod, nro, modelo) VALUES (?, ?, ?)`,
                [nuevoidprod, nro, modelo]
            );

            // 3. Insertar stock inicial
            await conexion.execute(
                `INSERT INTO STOCK (id_prod, id_suc, cantidad) VALUES (?, ?, ?)`,
                [nuevoidprod, idsuc, cantidad_inicial || 0]
            );

            await conexion.commit();
            return res.status(201).json({
                mensaje: '¡Zapato registrado correctamente!',
                idprod: nuevoidprod
            });
        } catch (error) {
            await conexion.rollback();
            console.error(error);
            return res.status(500).json({ error: 'Error al registrar el zapato.' });
        } finally {
            conexion.release();
        }
    },
];

exports.listarZapatos = async (req, res) => {
    try {
        const [zapatos] = await db.execute(`
            SELECT
                p.idprod, p.descripcion, p.color, p.precio, p.img, m.nombre AS marca, z.nro, z.modelo, s.cantidad, s.id_suc
            FROM PRODUCTOS p
            INNER JOIN ZAPATO z  ON p.idprod  = z.idprod
            INNER JOIN MARCA m   ON p.id_marc = m.idmarc
            LEFT  JOIN STOCK s   ON p.idprod  = s.id_prod
            WHERE p.activo = true
        `);
        return res.json(zapatos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener el catálogo de calzados.' });
    }
};

// =========================================================================
//                             SECCIÓN BOLSOS
// =========================================================================

exports.crearBolso = [
    // Validaciones
    body('descripcion').isString().notEmpty().withMessage('La descripción es obligatoria y debe ser un texto.'),
    body('color').isString().notEmpty().withMessage('El color es obligatorio y debe ser un texto.'),
    body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo.'),
    body('img').isString().notEmpty().withMessage('La imagen es obligatoria y debe ser un texto.'),
    body('idmarc').optional().isInt().withMessage('El ID de marca debe ser un número entero.'),
    body('tamano').isString().notEmpty().withMessage('El tamaño es obligatorio y debe ser un texto.'),
    body('idsuc').isInt().withMessage('El ID de sucursal debe ser un número entero.'),
    body('cantidad_inicial').optional().isInt({ min: 0 }).withMessage('La cantidad inicial debe ser un entero mayor o igual a 0.'),
    // Controlador
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

        const { descripcion, color, precio, img, idmarc, tamano, idsuc, cantidad_inicial } = req.body;

        const conexion = await db.getConnection();
        try {
            await conexion.beginTransaction();

            // 1. Insertar en PRODUCTOS (idmarc puede ser NULL en bolsos)
            const [resProd] = await conexion.execute(
                `INSERT INTO PRODUCTOS (descripcion, color, precio, img, id_marc) VALUES (?, ?, ?, ?, ?)`,
                [descripcion, color, precio, img, idmarc || null]
            );

            const nuevoidprod = resProd.insertId;

            // 2. Insertar en BOLSOS
            await conexion.execute(
                `INSERT INTO BOLSOS (idprod, tamano) VALUES (?, ?)`,
                [nuevoidprod, tamano]
            );

            // 3. Insertar stock inicial
            await conexion.execute(
                `INSERT INTO STOCK (id_prod, id_suc, cantidad) VALUES (?, ?, ?)`,
                [nuevoidprod, idsuc, cantidad_inicial || 0]
            );

            await conexion.commit();
            return res.status(201).json({
                mensaje: '¡Bolso registrado correctamente!',
                idprod: nuevoidprod
            });
        } catch (error) {
            await conexion.rollback();
            console.error(error);
            return res.status(500).json({ error: 'Error al registrar el bolso.' });
        } finally {
            conexion.release();
        }
    },
];

exports.listarBolsos = async (req, res) => {
    try {
        const [bolsos] = await db.execute(`
            SELECT
                p.idprod, p.descripcion, p.color, p.precio, p.img,
                m.nombre AS marca,
                b.tamano,
                s.cantidad, s.id_suc
            FROM PRODUCTOS p
            INNER JOIN BOLSOS b  ON p.idprod  = b.idprod
            LEFT  JOIN MARCA m   ON p.id_marc = m.idmarc
            LEFT  JOIN STOCK s   ON p.idprod  = s.id_prod
            WHERE p.activo = true
        `);
        return res.json(bolsos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener el catálogo de bolsos.' });
    }
};

// =========================================================================
//                           SECCIÓN ACCESORIOS
// =========================================================================

exports.crearAccesorio = [
    // Validaciones
    body('descripcion').isString().notEmpty().withMessage('La descripción es obligatoria y debe ser un texto.'),
    body('color').isString().notEmpty().withMessage('El color es obligatorio y debe ser un texto.'),
    body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo.'),
    body('img').isString().notEmpty().withMessage('La imagen es obligatoria y debe ser un texto.'),
    body('idmarc').optional().isInt().withMessage('El ID de marca debe ser un número entero.'),
    body('Nom_ac').isString().notEmpty().withMessage('El nombre del accesorio es obligatorio y debe ser un texto.'),
    body('idsuc').isInt().withMessage('El ID de sucursal debe ser un número entero.'),
    body('cantidad_inicial').optional().isInt({ gt: 0 }).withMessage('La cantidad inicial debe ser un número entero positivo.'),
    // Controlador
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

        const { descripcion, color, precio, img, idmarc, Nom_ac, idsuc, cantidad_inicial } = req.body;

        const conexion = await db.getConnection();
        try {
            await conexion.beginTransaction();

            // 1. Insertar en PRODUCTOS
            const [resProd] = await conexion.execute(
                `INSERT INTO PRODUCTOS (descripcion, color, precio, img, id_marc) VALUES (?, ?, ?, ?, ?)`,
                [descripcion, color, precio, img, idmarc || null]
            );

            const nuevoidprod = resProd.insertId;

            // 2. Insertar en ACCESORIOS
            await conexion.execute(
                `INSERT INTO ACCESORIOS (idprod, Nom_ac) VALUES (?, ?)`,
                [nuevoidprod, Nom_ac]
            );

            // 3. Insertar stock inicial
            await conexion.execute(
                `INSERT INTO STOCK (id_prod, id_suc, cantidad) VALUES (?, ?, ?)`,
                [nuevoidprod, idsuc, cantidad_inicial || 0]
            );

            await conexion.commit();
            return res.status(201).json({
                mensaje: '¡Accesorio registrado correctamente!',
                idprod: nuevoidprod
            });
        } catch (error) {
            await conexion.rollback();
            console.error(error);
            return res.status(500).json({ error: 'Error al registrar el accesorio.' });
        } finally {
            conexion.release();
        }
    },
];

exports.listarAccesorios = async (req, res) => {
    try {
        const [accesorios] = await db.execute(`
            SELECT
                p.idprod, p.descripcion, p.color, p.precio, p.img,
                m.nombre AS marca,
                a.Nom_ac,
                s.cantidad, s.id_suc
            FROM PRODUCTOS p
            INNER JOIN ACCESORIOS a ON p.idprod  = a.idprod
            LEFT  JOIN MARCA m      ON p.id_marc = m.idmarc
            LEFT  JOIN STOCK s      ON p.idprod  = s.id_prod
            WHERE p.activo = true
        `);
        return res.json(accesorios);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener el catálogo de accesorios.' });
    }
};

// =========================================================================
//                         ELIMINACIÓN LÓGICA
// =========================================================================

exports.eliminarLogico = async (req, res) => {
    const { idprod } = req.params;
    try {
        const [resultado] = await db.execute(
            `UPDATE PRODUCTOS SET activo = false WHERE idprod = ?`,
            [idprod]
        );
        if (resultado.affectedRows === 0)
            return res.status(404).json({ error: 'Producto no encontrado.' });

        return res.json({ mensaje: `Producto ${idprod} deshabilitado correctamente.` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al ejecutar borrado lógico.' });
    }
};

// =========================================================================
//                         EDITAR ZAPATOS
// =========================================================================

exports.editarZapato = [
    // Validaciones
    param('idprod').isInt().withMessage('El ID del producto debe ser un número entero.'),
    body('descripcion').isString().notEmpty().withMessage('La descripción es obligatoria y debe ser un texto.'),
    body('color').isString().notEmpty().withMessage('El color es obligatorio y debe ser un texto.'),
    body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo.'),
    body('idmarc').optional().isInt().withMessage('El ID de marca debe ser un número entero.'),
    body('nro').isInt().withMessage('La talla debe ser un número entero.'),
    body('modelo').isString().notEmpty().withMessage('El modelo es obligatorio y debe ser un texto.'),
    // Controlador
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            console.log(errores.array());
            return res.status(400).json({ errores: errores.array() });
        }

        const { idprod } = req.params;
        const { descripcion, color, precio, img, idmarc, nro, modelo } = req.body;

        const conexion = await db.getConnection();
        try {
            await conexion.beginTransaction();

            await conexion.execute(
                `UPDATE PRODUCTOS SET descripcion=?, color=?, precio=?, img=?, id_marc=? WHERE idprod=?`,
                [descripcion, color, precio, img, idmarc || null, idprod]
            );

            await conexion.execute(
                `UPDATE ZAPATO SET nro=?, modelo=? WHERE idprod=?`,
                [nro, modelo, idprod]
            );

            await conexion.commit();
            res.json({ mensaje: 'Zapato actualizado.' });
        } catch (error) {
            await conexion.rollback();
            res.status(500).json({ error: error.message });
        } finally {
            conexion.release();
        }
    },
];

// =========================================================================
//                         EDITAR BOLSOS
// =========================================================================

exports.editarBolso = [
    // Validaciones
    param('idprod').isInt().withMessage('El ID del producto debe ser un número entero.'),
    body('descripcion').isString().notEmpty().withMessage('La descripción es obligatoria y debe ser un texto.'),
    body('color').isString().notEmpty().withMessage('El color es obligatorio y debe ser un texto.'),
    body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo.'),
    body('idmarc').optional().isInt().withMessage('El ID de marca debe ser un número entero.'),
    body('tamano').isString().notEmpty().withMessage('El tamaño es obligatorio y debe ser un texto.'),
    // Controlador
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

        const { idprod } = req.params;
        const { descripcion, color, precio, img, idmarc, tamano } = req.body;

        const conexion = await db.getConnection();
        try {
            await conexion.beginTransaction();

            await conexion.execute(
                `UPDATE PRODUCTOS SET descripcion=?, color=?, precio=?, img=?, id_marc=? WHERE idprod=?`,
                [descripcion, color, precio, img, idmarc || null, idprod]
            );

            await conexion.execute(
                `UPDATE BOLSOS SET tamano=? WHERE idprod=?`,
                [tamano, idprod]
            );

            await conexion.commit();
            res.json({ mensaje: 'Bolso actualizado.' });
        } catch (error) {
            await conexion.rollback();
            res.status(500).json({ error: error.message });
        } finally {
            conexion.release();
        }
    },
];

// =========================================================================
//                         EDITAR ACCESORIOS
// =========================================================================

exports.editarAccesorio = [
    // Validaciones
    param('idprod').isInt().withMessage('El ID del producto debe ser un número entero.'),
    body('descripcion').isString().notEmpty().withMessage('La descripción es obligatoria y debe ser un texto.'),
    body('color').isString().notEmpty().withMessage('El color es obligatorio y debe ser un texto.'),
    body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo.'),
    body('Nom_ac').isString().notEmpty().withMessage('El nombre del accesorio es obligatorio y debe ser un texto.'),
    // Controlador
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

        const { idprod } = req.params;
        const { descripcion, color, precio, img, Nom_ac } = req.body;

        const conexion = await db.getConnection();
        try {
            await conexion.beginTransaction();

            await conexion.execute(
                `UPDATE PRODUCTOS SET descripcion=?, color=?, precio=?, img=? WHERE idprod=?`,
                [descripcion, color, precio, img, idprod]
            );

            await conexion.execute(
                `UPDATE ACCESORIOS SET Nom_ac=? WHERE idprod=?`,
                [Nom_ac, idprod]
            );

            await conexion.commit();
            res.json({ mensaje: 'Accesorio actualizado.' });
        } catch (error) {
            await conexion.rollback();
            res.status(500).json({ error: error.message });
        } finally {
            conexion.release();
        }
    },
];
