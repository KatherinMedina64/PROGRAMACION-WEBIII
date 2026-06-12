const BASE_URL = "http://localhost:3001/api"

// ── AUTH ──────────────────────────────────────────────────
export const login = async (usuario, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuario, password })  
    })
    if (!res.ok) throw new Error("Credenciales incorrectas")
    return res.json()
}

export const registro = async (nombre, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password })
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al registrar")
    }
    return res.json()
  console.log(e.response?.data)
  setRegError(e.response?.data?.mensaje || "Error al registrar")
}

// ── SUCURSALES ────────────────────────────────────────────
export const getSucursales = async () => {
    const res = await fetch(`${BASE_URL}/sucursales`)
    if (!res.ok) throw new Error("Error al obtener sucursales")
    return res.json()
}

export const getStockSucursal = async (idsuc) => {
    const res = await fetch(`${BASE_URL}/sucursales/${idsuc}/stock`)
    if (!res.ok) throw new Error("Error al obtener stock")
    return res.json()
}

export const getVentasGrafico = async (idsuc) => {
    const res = await fetch(`${BASE_URL}/sucursales/${idsuc}/ventas-grafico`)
    if (!res.ok) throw new Error("Error al obtener ventas para gráfico")
    return res.json()
}

// ── ZAPATOS ───────────────────────────────────────────────
export const getZapatos = async () => {
    const res = await fetch(`${BASE_URL}/productos/zapatos`)
    if (!res.ok) throw new Error("Error al obtener zapatos")
    return res.json()
}

export const crearZapato = async (datos) => {
    const res = await fetch(`${BASE_URL}/productos/zapato`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    if (!res.ok) throw new Error("Error al crear zapato")
    return res.json()
}

// ── BOLSOS ────────────────────────────────────────────────
export const getBolsos = async () => {
    const res = await fetch(`${BASE_URL}/productos/bolsos`)
    if (!res.ok) throw new Error("Error al obtener bolsos")
    return res.json()
}

export const crearBolso = async (datos) => {
    const res = await fetch(`${BASE_URL}/productos/bolso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    if (!res.ok) throw new Error("Error al crear bolso")
    return res.json()
}

// ── ACCESORIOS ────────────────────────────────────────────
export const getAccesorios = async () => {
    const res = await fetch(`${BASE_URL}/productos/accesorios`)
    if (!res.ok) throw new Error("Error al obtener accesorios")
    return res.json()
}

export const crearAccesorio = async (datos) => {
    const res = await fetch(`${BASE_URL}/productos/accesorio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    if (!res.ok) throw new Error("Error al crear accesorio")
    return res.json()
}

// ── ELIMINAR PRODUCTO ─────────────────────────────────────
export const eliminarProducto = async (idprod) => {
    const res = await fetch(`${BASE_URL}/productos/borrar/${idprod}`, {
        method: "DELETE"
    })
    if (!res.ok) throw new Error("Error al eliminar producto")
    return res.json()
}

// ── SUBIR IMAGEN ──────────────────────────────────────────
export const subirImagen = async (archivo) => {
    const formData = new FormData()
    formData.append('imagen', archivo)
    const res = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData
    })
    if (!res.ok) throw new Error('Error al subir imagen')
    return res.json()
}

// ── VENTAS ────────────────────────────────────────────────
export const getVentas = async () => {
    const res = await fetch(`${BASE_URL}/ventas/historial`)
    if (!res.ok) throw new Error("Error al obtener ventas")
    return res.json()
}

export const getVentasPorSucursal = async (idsuc) => {
    const res = await fetch(`${BASE_URL}/ventas/historial/${idsuc}`)
    if (!res.ok) throw new Error("Error al obtener ventas")
    return res.json()
}

export const crearVenta = async (datos) => {
    const res = await fetch(`${BASE_URL}/ventas/procesar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al procesar venta")
    }
    return res.json()
}

export const getMarcas = async () => {
    const res = await fetch(`${BASE_URL}/marcas`)
    if (!res.ok) throw new Error("Error al obtener marcas")
    return res.json()
}

export const editarZapato = async (idprod, datos) => {
    const res = await fetch(`${BASE_URL}/productos/zapato/${idprod}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });

    const data = await res.json();

    if (!res.ok) {
        console.log(data);
        throw new Error(JSON.stringify(data));
    }

    return data;
}

export const editarBolso = async (idprod, datos) => {
    const res = await fetch(`${BASE_URL}/productos/bolso/${idprod}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    if (!res.ok) throw new Error("Error al editar bolso")
    return res.json()
}

export const editarAccesorio = async (idprod, datos) => {
    const res = await fetch(`${BASE_URL}/productos/accesorio/${idprod}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    if (!res.ok) throw new Error("Error al editar accesorio")
    return res.json()
}

export const editarVenta = async (id_v, datos) => {
    const res = await fetch(`${BASE_URL}/ventas/editar/${id_v}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al editar venta")
    }
    return res.json()
}

export const eliminarVenta = async (id) => {
    const res = await fetch(`${BASE_URL}/ventas/eliminar/${id}`, {
        method: "DELETE"
    })
    if (!res.ok) throw new Error("Error al eliminar venta")
    return res.json()
}