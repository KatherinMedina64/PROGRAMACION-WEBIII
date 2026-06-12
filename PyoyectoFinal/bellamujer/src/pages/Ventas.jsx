import { useState, useEffect } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useSucursal } from "../context/SucursalContext"
import SucursalSelector from "../components/SucursalSelector"
import {
  getVentasPorSucursal, crearVenta, eliminarVenta, editarVenta,
  getZapatos, getBolsos, getAccesorios
} from "../api/api"

const TIPO_LABEL = { zapatos: "Zapatos", bolsos: "Bolsos", accesorios: "Accesorios" }

const inputStyle = {
  width: "100%", padding: "8px 12px", borderRadius: "8px",
  border: "1px solid #f4c0d1", fontSize: "14px", outline: "none",
  background: "#fff5f9", color: "#333"
}
const labelStyle = {
  fontSize: "13px", color: "#E91E8C", fontWeight: "600",
  marginBottom: "4px", display: "block"
}

function Modal({ titulo, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "32px",
        width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 8px 32px rgba(233,30,140,0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ color: "#E91E8C", fontSize: "18px", margin: 0 }}>{titulo}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#aaa" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Ventas() {
  const { sucursalActiva, sucursales } = useSucursal()

  const [ventas,         setVentas]         = useState([])
  const [productos,      setProductos]      = useState([])
  const [cargando,       setCargando]       = useState(true)
  const [modal,          setModal]          = useState(null)
  const [filtroSuc,      setFiltroSuc]      = useState("todas")
  const [guardando,      setGuardando]      = useState(false)
  const [errorMsg,       setErrorMsg]       = useState("")
  const [mostrarMenuPDF, setMostrarMenuPDF] = useState(false)
  const [tipoProducto,   setTipoProducto]   = useState("zapatos")
  const [ventaEditando,  setVentaEditando]  = useState(null)

  const [form, setForm] = useState({
    idsuc: "", idprod: "", cantidad: 1,
    fecha: new Date().toISOString().split("T")[0]
  })

  const cargarVentas = async () => {
    setCargando(true)
    try {
      const [v1, v2] = await Promise.all([
        getVentasPorSucursal(1),
        getVentasPorSucursal(2)
      ])
      setVentas([
        ...v1.map(v => ({ ...v, idsuc: 1 })),
        ...v2.map(v => ({ ...v, idsuc: 2 }))
      ])
    } catch (e) {
      setErrorMsg("Error al cargar ventas: " + e.message)
    } finally {
      setCargando(false)
    }
  }

  const cargarProductos = async () => {
    try {
      const [z, b, a] = await Promise.all([getZapatos(), getBolsos(), getAccesorios()])
      const unicos = arr => Object.values(arr.reduce((acc, p) => { acc[p.idprod] = p; return acc }, {}))
      setProductos([
        ...unicos(z).map(p => ({ ...p, tipo: "zapatos" })),
        ...unicos(b).map(p => ({ ...p, tipo: "bolsos" })),
        ...unicos(a).map(p => ({ ...p, tipo: "accesorios" }))
      ])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { cargarVentas(); cargarProductos() }, [])

  const ventasFiltradas = filtroSuc === "todas"
    ? ventas
    : ventas.filter(v => v.idsuc === Number(filtroSuc))

  const totalGeneral = ventasFiltradas.reduce((s, v) => s + Number(v.total), 0)
  const productoSeleccionado = productos.find(p => p.idprod === Number(form.idprod))
  const totalCalculado = productoSeleccionado
    ? Number(productoSeleccionado.precio) * Number(form.cantidad)
    : 0

  const productosFiltrados = productos.filter(p => p.tipo === tipoProducto)

  const cerrarModal = () => {
    setModal(null)
    setVentaEditando(null)
    setErrorMsg("")
  }

  const guardar = async () => {
    if (!form.idprod || !form.cantidad || !form.idsuc) {
      setErrorMsg("Completa todos los campos")
      return
    }
    setGuardando(true)
    setErrorMsg("")
    try {
      if (ventaEditando) {
        const prodSel = productos.find(p => p.idprod === Number(form.idprod));
        const totalVenta = prodSel ? Number(prodSel.precio) * Number(form.cantidad) : 0;

        await editarVenta(ventaEditando.id_v, {
          fecha:    form.fecha,
          total:    Number(totalVenta),
          id_prod:  Number(form.idprod),
          cantidad: Number(form.cantidad),
          id_suc:   Number(form.idsuc)
        });
      } else {
        await crearVenta({
          id_suc:    Number(form.idsuc),
          productos: [{ id_prod: Number(form.idprod), cantidad: Number(form.cantidad) }]
        })
      }
      await cargarVentas()
      cerrarModal()
    } catch (e) {
      setErrorMsg(e.error || e.message)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (v) => {
    if (!window.confirm(`¿Eliminar venta del ${String(v.fecha).split("T")[0]}?`)) return
    setErrorMsg("")
    try {
      await eliminarVenta(v.id_v)
      await cargarVentas()
    } catch (e) {
      setErrorMsg(e.message)
    }
  }

  const nombreSuc = (idsuc) => {
    const s = sucursales?.find(s => s.idsuc === idsuc)
    return s ? s.nom_desc : `Sucursal ${idsuc}`
  }

  const generarPDF = () => {
  const doc = new jsPDF()
  const fechaGeneracion = new Date().toLocaleDateString("es-BO", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  })

  const dibujarSeccion = (ventasSuc, tituloSec, startY) => {
    doc.setFillColor(233, 30, 140)
    doc.rect(14, startY, 182, 12, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text(tituloSec, 105, startY + 8, { align: "center" })

    autoTable(doc, {
      startY: startY + 14,
      head: [["Fecha", "Producto", "Cantidad", "Total (Bs)"]],
      body: ventasSuc.length > 0
        ? ventasSuc.map(v => [
            v.fecha ? String(v.fecha).split("T")[0] : "—",
            v.descripcion || v.producto || "—",
            String(v.cantidad || "—"),
            `${Number(v.total).toFixed(2)} Bs`,
          ])
        : [["—", "Sin ventas registradas", "—", "—"]],
      headStyles: { fillColor: [233, 30, 140], textColor: 255, fontStyle: "bold", fontSize: 10 },
      alternateRowStyles: { fillColor: [253, 232, 244] },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      columnStyles: { 3: { fontStyle: "bold", textColor: [233, 30, 140] } },
      margin: { left: 14, right: 14 },
    })

    const total = ventasSuc.reduce((s, v) => s + Number(v.total), 0)
    const finalY = doc.lastAutoTable.finalY + 6
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(233, 30, 140)
    doc.text(`Total ${tituloSec}: ${total.toFixed(2)} Bs`, 196, finalY, { align: "right" })
    return finalY + 12
  }

  doc.setFillColor(233, 30, 140)
  doc.rect(0, 0, 210, 40, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)

  if (filtroSuc === "todas") {
    doc.text("Ventas — Todas las Sucursales", 105, 22, { align: "center" })
    doc.setFontSize(10); doc.setFont("helvetica", "normal")
    doc.text(`Generado: ${fechaGeneracion}`, 105, 32, { align: "center" })
    let cursorY = 48
    sucursales.forEach((suc, i) => {
      if (i > 0 && cursorY > 200) { doc.addPage(); cursorY = 20 }
      cursorY = dibujarSeccion(ventas.filter(v => v.idsuc === suc.idsuc), suc.nom_desc, cursorY)
    })
    doc.setDrawColor(233, 30, 140); doc.setLineWidth(0.5)
    doc.line(14, cursorY, 196, cursorY)
    cursorY += 8
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(233, 30, 140)
    doc.text(`TOTAL GENERAL: ${ventas.reduce((s, v) => s + Number(v.total), 0).toFixed(2)} Bs`, 196, cursorY, { align: "right" })
  } else {
    const nombre = nombreSuc(Number(filtroSuc))
    doc.text(`Ventas — ${nombre}`, 105, 22, { align: "center" })
    doc.setFontSize(10); doc.setFont("helvetica", "normal")
    doc.text(`Generado: ${fechaGeneracion}`, 105, 32, { align: "center" })
    dibujarSeccion(ventasFiltradas, nombre, 48)
  }

  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(180, 180, 180)
  doc.text("Bella Mujer — Calzados de Calidad", 105, 287, { align: "center" })

  const nombreArchivo = filtroSuc === "todas" ? "todas_sucursales" : nombreSuc(Number(filtroSuc)).replace(" ", "_")
  doc.save(`ventas_${nombreArchivo}_${Date.now()}.pdf`)
}

  return (
    <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ color: "#E91E8C", fontSize: "28px", margin: 0 }}>Registro de Ventas</h1>
          <p style={{ color: "#aaa", fontSize: "14px", margin: "4px 0 0" }}>{sucursalActiva?.nom_desc}</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <SucursalSelector />

          <div style={{ position: "relative" }}>
            <button onClick={() => setMostrarMenuPDF(p => !p)} style={{
              background: "#1A1A2E", color: "#fff", border: "none", borderRadius: "20px",
              padding: "10px 20px", fontWeight: "700", cursor: "pointer", fontSize: "14px",
              display: "flex", alignItems: "center", gap: "6px"
            }}>
              📄 PDF <span style={{ fontSize: "10px" }}>▼</span>
            </button>
            {mostrarMenuPDF && (
              <div style={{
                position: "absolute", top: "110%", right: 0, background: "#fff",
                border: "1px solid #FDE8F4", borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(233,30,140,0.15)", zIndex: 200, minWidth: "210px", overflow: "hidden"
              }}>
                <button onClick={generarPDF} style={{
  background: "#1A1A2E", color: "#fff", border: "none", borderRadius: "20px",
  padding: "10px 20px", fontWeight: "700", cursor: "pointer", fontSize: "14px",
  display: "flex", alignItems: "center", gap: "6px"
}}>
  📄 PDF — {filtroSuc === "todas" ? "Todas" : nombreSuc(Number(filtroSuc))}
</button>
              </div>
            )}
          </div>

          <button onClick={() => {
            setVentaEditando(null)
            setForm({ idsuc: sucursalActiva?.idsuc || "", idprod: "", cantidad: 1, fecha: new Date().toISOString().split("T")[0] })
            setModal("agregar")
          }} style={{
            background: "#22C55E", color: "#fff", border: "none", borderRadius: "20px",
            padding: "10px 22px", fontWeight: "700", cursor: "pointer", fontSize: "14px"
          }}>
            + Agregar venta
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", margin: "24px 0", flexWrap: "wrap" }}>
        {[
          { val: "todas", label: "Todas" },
          { val: "1",     label: "Central" },
          { val: "2",     label: "Interna" },
        ].map(f => (
          <button key={f.val} onClick={() => setFiltroSuc(f.val)} style={{
            background: filtroSuc === f.val ? "#E91E8C" : "#fff",
            color:      filtroSuc === f.val ? "#fff"    : "#E91E8C",
            border: "2px solid #E91E8C", borderRadius: "20px",
            padding: "6px 18px", fontWeight: "600", cursor: "pointer", fontSize: "13px"
          }}>{f.label}</button>
        ))}
      </div>

      <div style={{
        background: "linear-gradient(90deg, #E91E8C, #F472B6)", borderRadius: "12px",
        padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", color: "#fff"
      }}>
        <span style={{ fontWeight: "600", fontSize: "15px" }}>{ventasFiltradas.length} ventas registradas</span>
        <span style={{ fontWeight: "800", fontSize: "20px" }}>Total: {totalGeneral.toFixed(2)} Bs</span>
      </div>

      {errorMsg && (
        <div style={{ background: "#fff0f5", border: "1px solid #E91E8C", borderRadius: "10px", padding: "12px 16px", color: "#E91E8C", marginBottom: "20px", fontSize: "14px" }}>
          ⚠️ {errorMsg}
          <button onClick={() => setErrorMsg("")} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#E91E8C", fontWeight: "700" }}>✕</button>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 16px rgba(233,30,140,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#E91E8C" }}>
              {["Fecha", "Sucursal", "Producto", "Cantidad", "Total (Bs)", "Acciones"].map(h => (
                <th key={h} style={{ color: "#fff", padding: "14px 16px", textAlign: "left", fontSize: "13px", fontWeight: "700" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#ccc" }}>Cargando ventas...</td></tr>
            ) : ventasFiltradas.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#ccc" }}>Sin ventas registradas.</td></tr>
            ) : (
              ventasFiltradas.map((v, i) => (
                <tr key={`${v.idsuc}-${v.id_v}-${i}`} style={{ background: i % 2 === 0 ? "#fff" : "#fff5f9" }}>
                  <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>
                    {String(v.fecha).split("T")[0]}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: "#FDE8F4", color: "#E91E8C", borderRadius: "12px", padding: "4px 12px", fontSize: "12px", fontWeight: "600" }}>
                      {nombreSuc(v.idsuc)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px", color: "#333", fontWeight: "600" }}>
                    {v.descripcion || v.producto || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555", textAlign: "center" }}>
                    {v.cantidad || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "700", color: "#E91E8C" }}>
                    {Number(v.total).toFixed(2)} Bs
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => {  
                        setVentaEditando(v);
                        
                        // Sincronizar el tipo de producto dinámicamente buscando en la lista cargada
                        const prodCoincidente = productos.find(p => p.descripcion === v.producto || p.idprod === v.idprod);
                        const tipoDeducido = prodCoincidente ? prodCoincidente.tipo : "zapatos";
                        
                        setTipoProducto(tipoDeducido);
                        setForm({
                          idsuc:    v.idsuc,
                          idprod:   prodCoincidente ? prodCoincidente.idprod : (v.idprod || ""),
                          cantidad: v.cantidad || 1,
                          fecha:    String(v.fecha).split("T")[0]
                        })
                        setModal("agregar")
                      }} style={{
                        background: "#1A1A2E", color: "#fff", border: "none",
                        borderRadius: "8px", padding: "6px 14px",
                        cursor: "pointer", fontSize: "12px", fontWeight: "600"
                      }}>Editar</button>
                      <button onClick={() => eliminar(v)} style={{
                        background: "#E91E8C", color: "#fff", border: "none",
                        borderRadius: "8px", padding: "6px 14px",
                        cursor: "pointer", fontSize: "12px", fontWeight: "600"
                      }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal === "agregar" && (
        <Modal titulo={ventaEditando ? "Editar venta" : "Registrar venta"} onClose={cerrarModal}>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Fecha</label>
            <input type="date" style={inputStyle} value={form.fecha}
              onChange={e => setForm({ ...form, fecha: e.target.value })} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Sucursal</label>
            {ventaEditando ? (
              <div style={{ ...inputStyle, background: "#f5f5f5", color: "#888", display: "flex", alignItems: "center" }}>
                {nombreSuc(form.idsuc)}
              </div>
            ) : (
              <select style={inputStyle} value={form.idsuc}
                onChange={e => setForm({ ...form, idsuc: e.target.value })}>
                <option value="">— Selecciona —</option>
                {(sucursales || []).map(s => (
                  <option key={s.idsuc} value={s.idsuc}>{s.nom_desc}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Tipo de producto</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {["zapatos", "bolsos", "accesorios"].map(t => (
                <button key={t} onClick={() => { setTipoProducto(t); setForm({ ...form, idprod: "" }) }} style={{
                  flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer",
                  border: "2px solid #E91E8C", fontWeight: "600", fontSize: "12px",
                  background: tipoProducto === t ? "#E91E8C" : "#fff",
                  color:      tipoProducto === t ? "#fff"    : "#E91E8C",
                }}>       {t === "zapatos" ? "👠" : t === "bolsos" ? "👜" : "💍"} {TIPO_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Producto</label>
            <select style={inputStyle} value={form.idprod}
              onChange={e => setForm({ ...form, idprod: e.target.value })}>
              <option value="">— Selecciona —</option>
              {productosFiltrados.map((p, i) => (
                <option key={`${p.tipo}-${p.idprod}-${i}`} value={p.idprod}>
                  {p.descripcion} — {Number(p.precio).toFixed(2)} Bs
                </option>
              ))}
            </select>
          </div>

          {form.idprod && (
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Cantidad</label>
              <input type="number" min="1" style={inputStyle} value={form.cantidad}
                onChange={e => setForm({ ...form, cantidad: e.target.value })} />
            </div>
          )}

          {totalCalculado > 0 && (
            <div style={{
              background: "linear-gradient(90deg, #FDE8F4, #fff0f8)",
              border: "1px solid #f4c0d1", borderRadius: "10px",
              padding: "14px 18px", marginBottom: "16px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ color: "#E91E8C", fontSize: "14px", fontWeight: "600" }}>Total a registrar</span>
              <span style={{ color: "#E91E8C", fontSize: "24px", fontWeight: "800" }}>{totalCalculado.toFixed(2)} Bs</span>
            </div>
          )}

          {errorMsg && (
            <p style={{ color: "#E91E8C", fontSize: "13px", marginBottom: "8px", background: "#fff0f5", padding: "8px 12px", borderRadius: "8px" }}>
              ⚠️ {errorMsg}
            </p>
          )}

          <button onClick={guardar} disabled={guardando} style={{
            width: "100%", background: "linear-gradient(90deg, #E91E8C, #F472B6)",
            color: "#fff", border: "none", borderRadius: "10px",
            padding: "14px", fontWeight: "700", fontSize: "15px",
            cursor: guardando ? "not-allowed" : "pointer",
            opacity: guardando ? 0.7 : 1, marginTop: "4px"
          }}>
            {guardando ? "Guardando..." : ventaEditando ? "Guardar cambios" : "Registrar venta"}
          </button>
        </Modal>
      )}
    </div>
  )
}

export default Ventas