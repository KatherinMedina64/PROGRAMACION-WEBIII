import { useState, useEffect } from "react"
import {
  getZapatos, getBolsos, getAccesorios, getMarcas,
  crearZapato, crearBolso, crearAccesorio,
  editarZapato, editarBolso, editarAccesorio,
  eliminarProducto, subirImagen
} from "../api/api"
import SucursalSelector from "../components/SucursalSelector"
import { useSucursal } from "../context/SucursalContext"

const COLORES = ["Negro", "Blanco", "Rosa", "Rojo", "Café", "Beige", "Dorado", "Plateado", "Azul"]
const TAMANOS = ["Pequeño", "Mediano", "Grande"]

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
        width: "100%", maxWidth: "500px", maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 8px 32px rgba(233,30,140,0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#E91E8C", fontSize: "18px" }}>{titulo}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#aaa" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function InputImagen({ valor, onChange }) {
  const [preview, setPreview] = useState(
    valor ? (valor.startsWith("http") ? valor : `http://localhost:3001/${valor}`) : ""
  )
  const [subiendo, setSubiendo] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  const handleArchivo = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    setSubiendo(true)
    try {
      const { url } = await subirImagen(archivo)
      setPreview(`http://localhost:3001/${url}`)
      onChange(url)
    } catch (err) {
      console.error(err)
    } finally {
      setSubiendo(false)
    }
  }

  const handleUrl = (e) => {
    setUrlInput(e.target.value)
    setPreview(e.target.value)
    onChange(e.target.value)
  }

  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={labelStyle}>Imagen</label>
      {preview && (
        <div style={{ marginBottom: "8px", position: "relative" }}>
          <img src={preview} alt="preview"
            style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px" }}
            onError={e => { e.target.style.display = "none" }}
          />
          <button onClick={() => { setPreview(""); setUrlInput(""); onChange("") }}
            style={{
              position: "absolute", top: "6px", right: "6px",
              background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
              borderRadius: "50%", width: "24px", height: "24px",
              cursor: "pointer", fontSize: "12px"
            }}>✕</button>
        </div>
      )}
      <label style={{
        display: "block", background: "#fff5f9", border: "1px solid #f4c0d1",
        borderRadius: "8px", padding: "8px 12px", cursor: "pointer",
        fontSize: "13px", color: "#E91E8C", fontWeight: "600",
        textAlign: "center", marginBottom: "8px"
      }}>
        {subiendo ? "Subiendo..." : "📁 Subir desde dispositivo"}
        <input type="file" accept="image/*" onChange={handleArchivo}
          style={{ display: "none" }} disabled={subiendo} />
      </label>
      <input style={inputStyle} placeholder="O pega una URL de imagen"
        value={urlInput} onChange={handleUrl} />
    </div>
  )
}

function ProductoCard({ producto, tipo, onEditar, onEliminar }) {
  if (!producto) return null;

  const subtitulo =
    tipo === "zapatos"
      ? `Modelo: ${producto.modelo || ""} | Talla: ${producto.nro || ""}`
      : tipo === "bolsos"
      ? `Tamaño: ${producto.tamano || ""}`
      : `Nombre: ${producto.Nom_ac || ""}`;

  return (
    <div style={{
      background: "#fff", border: "2px solid #FDE8F4", borderRadius: "16px",
      overflow: "hidden", boxShadow: "0 4px 16px rgba(233,30,140,0.08)",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #FDE8F4, #fce4f0)",
        height: "140px", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "48px", position: "relative"
      }}>
        {producto.img
          ? <img
              src={producto.img.startsWith("http") ? producto.img : `http://localhost:3001/${producto.img}`}
              alt={producto.descripcion}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          : tipo === "zapatos" ? "👠" : tipo === "bolsos" ? "👜" : "💍"
        }
        <span style={{
          position: "absolute", bottom: "10px", right: "12px",
          background: "#E91E8C", color: "#fff", borderRadius: "12px",
          padding: "3px 10px", fontSize: "13px", fontWeight: "700"
        }}>{producto.precio} Bs</span>
      </div>
      <div style={{ padding: "16px", flex: 1 }}>
        <h3 style={{ color: "#1A1A2E", fontSize: "15px", marginBottom: "4px" }}>{producto.descripcion}</h3>
        <p style={{ color: "#aaa", fontSize: "12px", marginBottom: "4px" }}>Marca: {producto.marca || "—"}</p>
        <p style={{ color: "#F472B6", fontSize: "12px", fontWeight: "600" }}>{subtitulo}</p>
        <p style={{ color: "#bbb", fontSize: "12px" }}>Stock: {producto.cantidad ?? 0}</p>
      </div>
      <div style={{ padding: "12px 16px", borderTop: "1px solid #FDE8F4", display: "flex", gap: "8px" }}>
        <button onClick={() => onEditar(producto)} style={{
          flex: 1, background: "#1A1A2E", color: "#fff", border: "none",
          borderRadius: "8px", padding: "8px", cursor: "pointer",
          fontWeight: "600", fontSize: "13px"
        }}>Editar</button>
        <button onClick={() => onEliminar(producto.idprod)} style={{
          flex: 1, background: "#E91E8C", color: "#fff", border: "none",
          borderRadius: "8px", padding: "8px", cursor: "pointer",
          fontWeight: "600", fontSize: "13px"
        }}>Eliminar</button>
      </div>
    </div>
  )
}

function FormZapato({ datos, setDatos, sucursales, marcas }) {
  return (
    <>
      <InputImagen valor={datos.img} onChange={url => setDatos({ ...datos, img: url })} />
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Descripción</label>
        <input style={inputStyle} value={datos.descripcion}
          onChange={e => setDatos({ ...datos, descripcion: e.target.value })} />
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Modelo</label>
          <input style={inputStyle} value={datos.modelo}
            onChange={e => setDatos({ ...datos, modelo: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Talla (nro)</label>
          <input style={inputStyle} value={datos.nro}
            onChange={e => setDatos({ ...datos, nro: e.target.value })} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Precio (Bs)</label>
          <input type="number" style={inputStyle} value={datos.precio}
            onChange={e => setDatos({ ...datos, precio: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Color</label>
          <select style={inputStyle} value={datos.color}
            onChange={e => setDatos({ ...datos, color: e.target.value })}>
            {COLORES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Stock inicial</label>
          <input type="number" min="0" style={inputStyle} value={datos.cantidad_inicial}
            onChange={e => setDatos({ ...datos, cantidad_inicial: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Marca</label>
          <select style={inputStyle} value={datos.idmarc}
            onChange={e => setDatos({ ...datos, idmarc: e.target.value })}>
            <option value="">— Selecciona —</option>
            {marcas.map(m => (
              <option key={m.idmarc} value={m.idmarc}>{m.nombre}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Sucursal</label>
        <select style={inputStyle} value={datos.idsuc}
          onChange={e => setDatos({ ...datos, idsuc: e.target.value })}>
          <option value="">— Selecciona —</option>
          {sucursales.map(s => (
            <option key={s.idsuc} value={s.idsuc}>{s.nom_desc}</option>
          ))}
        </select>
      </div>
    </>
  )
}

function FormBolso({ datos, setDatos, sucursales, marcas }) {
  return (
    <>
      <InputImagen valor={datos.img} onChange={url => setDatos({ ...datos, img: url })} />
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Descripción</label>
        <input style={inputStyle} value={datos.descripcion}
          onChange={e => setDatos({ ...datos, descripcion: e.target.value })} />
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Tamaño</label>
          <select style={inputStyle} value={datos.tamano}
            onChange={e => setDatos({ ...datos, tamano: e.target.value })}>
            {TAMANOS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Color</label>
          <select style={inputStyle} value={datos.color}
            onChange={e => setDatos({ ...datos, color: e.target.value })}>
            {COLORES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Precio (Bs)</label>
          <input type="number" style={inputStyle} value={datos.precio}
            onChange={e => setDatos({ ...datos, precio: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Stock inicial</label>
          <input type="number" min="0" style={inputStyle} value={datos.cantidad_inicial}
            onChange={e => setDatos({ ...datos, cantidad_inicial: e.target.value })} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Marca (opcional)</label>
          <select style={inputStyle} value={datos.idmarc}
            onChange={e => setDatos({ ...datos, idmarc: e.target.value })}>
            <option value="">— Sin marca —</option>
            {marcas.map(m => (
              <option key={m.idmarc} value={m.idmarc}>{m.nombre}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Sucursal</label>
        <select style={inputStyle} value={datos.idsuc}
          onChange={e => setDatos({ ...datos, idsuc: e.target.value })}>
          <option value="">— Selecciona —</option>
          {sucursales.map(s => (
            <option key={s.idsuc} value={s.idsuc}>{s.nom_desc}</option>
          ))}
        </select>
      </div>
    </>
  )
}

function FormAccesorio({ datos, setDatos, sucursales }) {
  return (
    <>
      <InputImagen valor={datos.img} onChange={url => setDatos({ ...datos, img: url })} />
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Descripción</label>
        <input style={inputStyle} value={datos.descripcion}
          onChange={e => setDatos({ ...datos, descripcion: e.target.value })} />
      </div>
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Nombre accesorio</label>
        <input style={inputStyle} value={datos.Nom_ac}
          onChange={e => setDatos({ ...datos, Nom_ac: e.target.value })} />
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Precio (Bs)</label>
          <input type="number" style={inputStyle} value={datos.precio}
            onChange={e => setDatos({ ...datos, precio: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Color</label>
          <select style={inputStyle} value={datos.color}
            onChange={e => setDatos({ ...datos, color: e.target.value })}>
            {COLORES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Stock inicial</label>
          <input type="number" min="0" style={inputStyle} value={datos.cantidad_inicial}
            onChange={e => setDatos({ ...datos, cantidad_inicial: e.target.value })} />
        </div>
      </div>
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Sucursal</label>
        <select style={inputStyle} value={datos.idsuc}
          onChange={e => setDatos({ ...datos, idsuc: e.target.value })}>
          <option value="">— Selecciona —</option>
          {sucursales.map(s => (
            <option key={s.idsuc} value={s.idsuc}>{s.nom_desc}</option>
          ))}
        </select>
      </div>
    </>
  )
}

const vacioZapato    = { descripcion: "", color: "Negro", precio: "", idmarc: "", nro: "", modelo: "", idsuc: "", cantidad_inicial: 0, img: "" }
const vacioBolso     = { descripcion: "", color: "Negro", precio: "", idmarc: "", tamano: "Mediano", idsuc: "", cantidad_inicial: 0, img: "" }
const vacioAccesorio = { descripcion: "", color: "Negro", precio: "", Nom_ac: "", idsuc: "", cantidad_inicial: 0, img: "" }

function Productos() {
  const { sucursalActiva, sucursales } = useSucursal()

  const [zapatos,    setZapatos]    = useState([])
  const [bolsos,     setBolsos]     = useState([])
  const [accesorios, setAccesorios] = useState([])
  const [marcas,     setMarcas]     = useState([])
  const [cargando,   setCargando]   = useState(true)
  const [errorMsg,   setErrorMsg]   = useState("")
  const [erroresForm, setErroresForm] = useState([])
  const [modal,      setModal]      = useState(null) // "agregar" | { modo: "editar", tipo, producto }
  const [tipoForm,   setTipoForm]   = useState("zapatos")
  const [formData,   setFormData]   = useState({ ...vacioZapato })
  const [guardando,  setGuardando]  = useState(false)

  const cargarTodo = async () => {
    setCargando(true)
    try {
      const [z, b, a, m] = await Promise.all([
        getZapatos(), getBolsos(), getAccesorios(), getMarcas()
      ])
      setZapatos(z)
      setBolsos(b)
      setAccesorios(a)
      setMarcas(m)
    } catch (e) {
      setErrorMsg("Error al cargar: " + e.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargarTodo() }, [])

  const filtrar = (lista) =>
    sucursalActiva ? lista.filter(p => p.id_suc === sucursalActiva.idsuc) : lista

  const abrirAgregar = () => {
    setTipoForm("zapatos")
    setFormData({ ...vacioZapato, idsuc: sucursalActiva?.idsuc || "" })
    setModal("agregar")
  }

  const abrirEditar = (tipo, producto) => {
    setTipoForm(tipo)
    setFormData({
      descripcion:     producto.descripcion || "",
      color:           producto.color || "Negro",
      precio:          producto.precio || "",
      idmarc:          producto.idmarc || "",
      nro:             producto.nro || "",
      modelo:          producto.modelo || "",
      tamano:          producto.tamano || "Mediano",
      Nom_ac:          producto.Nom_ac || "",
      idsuc:           producto.id_suc || "",
      cantidad_inicial: 0,
      img:             producto.img || "",
      idprod:          producto.idprod
    })
    setModal({ modo: "editar", tipo, producto })
  }

const guardar = async () => {

  if (guardando) return;   

  setGuardando(true);
  setErrorMsg("");
  setErroresForm([]);

  try {

    console.log("GUARDANDO");

    if (modal === "agregar") {

      if (tipoForm === "zapatos")
        await crearZapato(formData);

      else if (tipoForm === "bolsos")
        await crearBolso(formData);

      else if (tipoForm === "accesorios")
        await crearAccesorio(formData);

    } else {

      const id = formData.idprod;

      if (tipoForm === "zapatos")
        await editarZapato(id, formData);

      else if (tipoForm === "bolsos")
        await editarBolso(id, formData);

      else if (tipoForm === "accesorios")
        await editarAccesorio(id, formData);

    }

    await cargarTodo();
    setModal(null);

  } catch (e) {

    console.log(e);

    if (e.response?.data?.errores) {
      setErroresForm(
        e.response.data.errores.map(err => err.msg)
      );
    } else {
      setErrorMsg(e.message);
    }

  } finally {

    setGuardando(false);

  }
}


  const eliminar = async (idprod) => {
    if (!window.confirm("¿Eliminar este producto?")) return
    try {
      await eliminarProducto(idprod)
      await cargarTodo()
    } catch (e) {
      setErrorMsg(e.message)
    }
  }

  const modoModal = modal === "agregar" ? "agregar" : modal?.modo
  const tituloModal = modoModal === "agregar" ? "Agregar producto" : "Editar producto"

  const seccion = (lista, tipo, titulo) => (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{ color: "#E91E8C", fontSize: "20px", marginBottom: "16px" }}>{titulo}</h2>
      {lista.length === 0
        ? <p style={{ color: "#ccc", fontSize: "14px" }}>Sin productos en esta sucursal.</p>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
            {lista.map((p,i)=>{
    console.log(i,p);
    return (
        <ProductoCard
            key={i}
            producto={p}
            tipo={tipo}
            onEditar={p => abrirEditar(tipo, p)}
            onEliminar={eliminar}
        />
    )
})}
          </div>
      }
    </div>
  )

  return (
    <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <h1 style={{ color: "#E91E8C", fontSize: "28px", margin: 0 }}>Productos</h1>
          <p style={{ color: "#aaa", fontSize: "14px", margin: "4px 0 0" }}>{sucursalActiva?.nom_desc}</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <SucursalSelector />
          <button onClick={abrirAgregar} style={{
            background: "#22C55E", color: "#fff", border: "none", borderRadius: "20px",
            padding: "10px 22px", fontWeight: "700", cursor: "pointer", fontSize: "14px"
          }}>+ Agregar producto</button>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #FDE8F4", margin: "20px 0 32px" }} />

      {erroresForm.length > 0 && (
  <div
    style={{
      background: "#fff0f5",
      border: "1px solid #E91E8C",
      borderRadius: "8px",
      padding: "10px",
      marginBottom: "12px"
    }}
  >
    {erroresForm.map((error, index) => (
      <div
        key={index}
        style={{
          color: "#E91E8C",
          fontSize: "13px",
          marginBottom: "4px"
        }}
      >
        ⚠️ {error}
      </div>
    ))}
  </div>
)}

      {cargando
        ? <p style={{ color: "#ccc", textAlign: "center", padding: "40px" }}>Cargando productos...</p>
        : <>
            {seccion(filtrar(zapatos),    "zapatos",    "👠 Zapatos")}
            {seccion(filtrar(bolsos),     "bolsos",     "👜 Bolsos")}
            {seccion(filtrar(accesorios), "accesorios", "💍 Accesorios")}
          </>
      }

      {modal && (
        <Modal titulo={tituloModal} onClose={() => setModal(null)}>

          {modoModal === "agregar" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Tipo de producto</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { id: "zapatos", icon: "👠" },
                  { id: "bolsos",  icon: "👜" },
                  { id: "accesorios", icon: "💍" }
                ].map(t => (
                  <button key={t.id} onClick={() => {
                    setTipoForm(t.id)
                    const vacio = t.id === "zapatos" ? vacioZapato : t.id === "bolsos" ? vacioBolso : vacioAccesorio
                    setFormData({ ...vacio, idsuc: sucursalActiva?.idsuc || "" })
                  }} style={{
                    flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer",
                    border: "2px solid #E91E8C", fontWeight: "600", fontSize: "13px",
                    background: tipoForm === t.id ? "#E91E8C" : "#fff",
                    color: tipoForm === t.id ? "#fff" : "#E91E8C",
                  }}>
                    {t.icon} {t.id.charAt(0).toUpperCase() + t.id.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tipoForm === "zapatos"    && <FormZapato    datos={formData} setDatos={setFormData} sucursales={sucursales} marcas={marcas} />}
          {tipoForm === "bolsos"     && <FormBolso     datos={formData} setDatos={setFormData} sucursales={sucursales} marcas={marcas} />}
          {tipoForm === "accesorios" && <FormAccesorio datos={formData} setDatos={setFormData} sucursales={sucursales} />}

          {errorMsg && <p style={{ color: "#E91E8C", fontSize: "13px", marginBottom: "8px" }}>⚠️ {errorMsg}</p>}

          <button
    type="button"
    onClick={guardar}
    disabled={guardando} style={{
            width: "100%", background: "linear-gradient(90deg, #E91E8C, #F472B6)",
            color: "#fff", border: "none", borderRadius: "10px",
            padding: "12px", fontWeight: "700", fontSize: "15px",
            cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.7 : 1
          }}>
            {guardando ? "Guardando..." : modoModal === "agregar" ? "Agregar producto" : "Guardar cambios"}
          </button>
        </Modal>
      )}
    </div>
  )
}

export default Productos