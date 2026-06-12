// fuente/controladores/ventaControlador.js
const db = require('../config/baseDatos');

exports.registrarVenta = async (req, res) => {
    console.log("BODY:", req.body);
    const { id_suc, productos } = req.body;
    if (!id_suc || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Faltan datos obligatorios o el carrito está vacío.' });
    }

    const conexion = await db.getConnection();
    try {
        await conexion.beginTransaction();

        let totalVenta = 0;
        const productosProcesados = [];

        for (const item of productos) {
            const { id_prod, cantidad } = item;

            const [prodRows] = await conexion.execute(
                'SELECT precio FROM PRODUCTOS WHERE idprod = ?',
                [id_prod]
            );
            if (prodRows.length === 0) {
                throw new Error(`El producto con código ${id_prod} no existe.`);
            }

            const precio = parseFloat(prodRows[0].precio);
            const subtotal = precio * cantidad;
            totalVenta += subtotal;

            const [stockRows] = await conexion.execute(
                'SELECT cantidad FROM STOCK WHERE id_prod = ? AND id_suc = ?',
                [id_prod, id_suc]
            );
            if (stockRows.length === 0) {
                throw new Error(`El producto ${id_prod} no tiene stock en la sucursal ${id_suc}.`);
            }

            const stockDisponible = stockRows[0].cantidad;
            if (stockDisponible < cantidad) {
                throw new Error(`Stock insuficiente para producto ${id_prod}. Disponible: ${stockDisponible}, Solicitado: ${cantidad}`);
            }

            productosProcesados.push({ id_prod, cantidad, subtotal });
        }

        const fechaActual = new Date().toISOString().slice(0, 10);
        const [resVenta] = await conexion.execute(
            'INSERT INTO VENTA (fecha, total, id_suc) VALUES (?, ?, ?)',
            [fechaActual, totalVenta, id_suc]
        );
        const nuevoIdV = resVenta.insertId;

        for (const prod of productosProcesados) {
            await conexion.execute(
                'INSERT INTO DETALLE_VENTA (id_v, id_prod, cantidad) VALUES (?, ?, ?)',
                [nuevoIdV, prod.id_prod, prod.cantidad]
            );
            await conexion.execute(
                'UPDATE STOCK SET cantidad = cantidad - ? WHERE id_prod = ? AND id_suc = ?',
                [prod.cantidad, prod.id_prod, id_suc]
            );
        }

        await conexion.commit();
        return res.status(201).json({
            mensaje: '¡Venta procesada con éxito!',
            id_v: nuevoIdV,
            total: totalVenta
        });

    } catch (error) {
        await conexion.rollback();
        console.error(error);
        return res.status(400).json({ error: error.message || 'Error al procesar la venta.' });
    } finally {
        conexion.release();
    }
};

exports.listarVentas = async (req, res) => {
    try {
        const [ventas] = await db.execute(`
            SELECT 
                v.id_v,
                v.fecha,
                v.total,
                v.id_suc as idsuc,
                s.nom_desc AS sucursal,
                p.idprod,
                p.descripcion AS producto,
                dv.cantidad
            FROM VENTA v
            INNER JOIN SUCURSAL s      ON v.id_suc = s.idsuc
            INNER JOIN DETALLE_VENTA dv ON v.id_v  = dv.id_v
            INNER JOIN PRODUCTOS p      ON dv.id_prod = p.idprod
            ORDER BY v.id_v DESC
        `)
        return res.json(ventas)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Error al obtener el historial de ventas.' })
    }
}

exports.listarVentasPorSucursal = async (req, res) => {
    try {
        const [ventas] = await db.execute(`
            SELECT 
                v.id_v,
                v.fecha,
                v.total,
                v.id_suc as idsuc,
                s.nom_desc AS sucursal,
                p.idprod,
                p.descripcion AS producto,
                dv.cantidad
            FROM VENTA v
            INNER JOIN SUCURSAL s      ON v.id_suc = s.idsuc
            INNER JOIN DETALLE_VENTA dv ON v.id_v  = dv.id_v
            INNER JOIN PRODUCTOS p      ON dv.id_prod = p.idprod
            WHERE v.id_suc = ?
            ORDER BY v.fecha DESC
        `, [req.params.idsuc])
        return res.json(ventas)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: error.message })
    }
}

exports.editarVenta = async (req, res) => {
    const { id_v } = req.params;
    const { fecha, total, id_prod, cantidad, id_suc } = req.body;

    if (!id_v || !fecha || !id_prod || !cantidad || !id_suc) {
        return res.status(400).json({ error: 'Faltan campos requeridos (fecha, id_prod, cantidad, id_suc).' });
    }

    const conexion = await db.getConnection();
    try {
        await conexion.beginTransaction();

        // 1. Obtener producto y cantidad anteriores de DETALLE_VENTA antes de sobreescribir
        const [detalleAntiguo] = await conexion.execute(
            'SELECT id_prod, cantidad FROM DETALLE_VENTA WHERE id_v = ?',
            [id_v]
        );

        if (detalleAntiguo.length > 0) {
            const prodAntiguo = detalleAntiguo[0].id_prod;
            const cantAntigua = detalleAntiguo[0].cantidad;

            // Devolver temporalmente el stock antiguo a la sucursal
            await conexion.execute(
                'UPDATE STOCK SET cantidad = cantidad + ? WHERE id_prod = ? AND id_suc = ?',
                [cantAntigua, prodAntiguo, Number(id_suc)]
            );
        }

        // 2. Actualizar tabla principal VENTA
        const [resVenta] = await conexion.execute(
            'UPDATE VENTA SET fecha = ?, total = ? WHERE id_v = ?',
            [fecha, total, id_v]
        );

        if (resVenta.affectedRows === 0) {
            await conexion.rollback();
            return res.status(404).json({ error: 'Venta no encontrada.' });
        }

        // 3. Verificar si hay stock suficiente considerando la nueva cantidad solicitada
        const [stockRows] = await conexion.execute(
            'SELECT cantidad FROM STOCK WHERE id_prod = ? AND id_suc = ?',
            [id_prod, Number(id_suc)]
        );
        
        if (stockRows.length === 0) {
            throw new Error(`El producto seleccionado no tiene inventario en esta sucursal.`);
        }

        const stockDisponible = stockRows[0].cantidad;
        if (stockDisponible < cantidad) {
            throw new Error(`Stock insuficiente. Disponible en sucursal: ${stockDisponible} unidades.`);
        }

        // 4. Actualizar el detalle definitivo de la venta
        await conexion.execute(
            'UPDATE DETALLE_VENTA SET id_prod = ?, cantidad = ? WHERE id_v = ?',
            [id_prod, cantidad, id_v]
        );

        // 5. Restar el nuevo stock definitivo del almacén
        await conexion.execute(
            'UPDATE STOCK SET cantidad = cantidad - ? WHERE id_prod = ? AND id_suc = ?',
            [cantidad, id_prod, Number(id_suc)]
        );

        await conexion.commit();
        return res.json({ mensaje: '¡Venta y stock actualizados correctamente!' });

    } catch (error) {
        await conexion.rollback();
        console.error(error);
        return res.status(400).json({ error: error.message || 'Error al editar venta.' });
    } finally {
        conexion.release();
    }
};

exports.eliminarVenta = async (req, res) => {
    const { id_v } = req.params
    const conexion = await db.getConnection()
    try {
        await conexion.beginTransaction()

        await conexion.execute(
            'DELETE FROM DETALLE_VENTA WHERE id_v=?',
            [id_v]
        )

        const [resultado] = await conexion.execute(
            'DELETE FROM VENTA WHERE id_v=?',
            [id_v]
        )

        if (resultado.affectedRows === 0) {
            await conexion.rollback()
            return res.status(404).json({ error: 'Venta no encontrada.' })
        }

        await conexion.commit()
        return res.json({ mensaje: 'Venta eliminada correctamente.' })
    } catch (error) {
        await conexion.rollback()
        console.error(error)
        return res.status(500).json({ error: 'Error al eliminar venta.' })
    } finally {
        conexion.release()
    }
}