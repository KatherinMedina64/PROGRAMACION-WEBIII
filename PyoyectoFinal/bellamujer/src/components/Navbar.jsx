import logo from "../assets/logo.jpg"
import { useState, useEffect } from "react"

function Navbar({ page, setPage, onLogout }) {
  const links = [
    { id: "dashboard", label: "Inicio" },
    { id: "productos", label: "Productos" },
    { id: "ventas", label: "Registro de Ventas" },
  ]
  const [menuAbierto, setMenuAbierto] = useState(false)
 const [esMovil, setEsMovil] = useState(false)

useEffect(() => {
  const resize = () => {
    setEsMovil(window.innerWidth <= 768)
  }

  resize()

  window.addEventListener("resize", resize)

  return () => {
    window.removeEventListener("resize", resize)
  }
}, [])

  useEffect(() => {
    const resize = () => setEsMovil(window.innerWidth <= 768)
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {esMovil && (
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          style={{
            position: "fixed",
            top: "15px",
            left: "15px",
            zIndex: 1000,
            background: "#E91E8C",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            width: "45px",
            height: "45px",
            fontSize: "22px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}
        >
          ☰
        </button>
      )}

      {esMovil && menuAbierto && (
  <div
    onClick={() => setMenuAbierto(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      zIndex: 99
    }}
  />
)}


      {/* ── SIDEBAR ── */}
      <nav style={{
        width: esMovil ? "260px" : "220px",
        minWidth: esMovil ? "260px" : "220px",
        background: "linear-gradient(180deg, #E91E8C 0%, #F472B6 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 0",
        boxShadow: "2px 0 12px rgba(233,30,140,0.2)",
        minHeight: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
        transform: esMovil
  ? (menuAbierto ? "translateX(0)" : "translateX(-100%)")
  : "translateX(0)",

transition: "transform 0.3s ease",
      }}>

        {/* Logo */}
        <div style={{
          marginBottom: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "0 16px"
        }}>
          <img
            src={logo}
            alt="Bella Mujer"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "contain",
              borderRadius: "16px",
              background: "#fff",
              padding: "8px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
            }}
          />
        </div>

        {/* Divisor */}
        <div style={{
          width: "80%",
          height: "1px",
          background: "rgba(255,255,255,0.3)",
          marginBottom: "24px"
        }} />

        {/* Links */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "100%",
          padding: "0 16px",
          flex: 1
        }}>
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => {
  setPage(l.id)
  if (esMovil) setMenuAbierto(false)
}}
              style={{
                background: page === l.id ? "#fff" : "transparent",
                color: page === l.id ? "#E91E8C" : "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "12px 16px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
                textAlign: "left",
                transition: "all 0.2s",
                boxShadow: page === l.id ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
              }}
            >
              {l.id === "dashboard" && "🏠 "}
              {l.id === "productos" && "👠 "}
              {l.id === "ventas" && "📋 "}
              {l.label}
            </button>
          ))}
        </div>

        {/* Cerrar sesión al fondo */}
        <div style={{ width: "100%", padding: "0 16px" }}>
          <div style={{
            width: "100%",
            height: "1px",
            background: "rgba(255,255,255,0.3)",
            marginBottom: "16px"
          }} />
          <button
            onClick={() => {
  if (esMovil) setMenuAbierto(false)
  onLogout()
}}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: "12px",
              padding: "12px 16px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              textAlign: "left",
              transition: "all 0.2s"
            }}
          >
            🚪 Cerrar sesión
          </button>
        </div>

      </nav>

    </div>
  )
}

export default Navbar