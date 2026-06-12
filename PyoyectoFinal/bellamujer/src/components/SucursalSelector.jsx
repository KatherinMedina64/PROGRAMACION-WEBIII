import { useState } from "react"
import { useSucursal } from "../context/SucursalContext"

function SucursalSelector() {
  const { sucursales, sucursalActiva, setSucursalActiva } = useSucursal()
  const [abierto, setAbierto] = useState(false)

  if (!sucursalActiva) return null

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setAbierto(!abierto)}
        style={{
          background: "#fff", border: "2px solid #E91E8C",
          borderRadius: "20px", padding: "8px 18px",
          fontWeight: "700", color: "#E91E8C", cursor: "pointer",
          fontSize: "14px", display: "flex", alignItems: "center",
          gap: "8px", boxShadow: "0 2px 8px rgba(233,30,140,0.1)"
        }}
      >
        🏪 {sucursalActiva.nom_desc}
        <span style={{ fontSize: "10px" }}>{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div style={{
          position: "absolute", top: "110%", left: 0,
          background: "#fff", border: "1px solid #FDE8F4",
          borderRadius: "12px", boxShadow: "0 8px 24px rgba(233,30,140,0.15)",
          zIndex: 200, minWidth: "200px", overflow: "hidden"
        }}>
          {sucursales.map(s => (
            <button
              key={s.idsuc}
              onClick={() => { setSucursalActiva(s); setAbierto(false) }}
              style={{
                width: "100%", padding: "12px 18px",
                background: sucursalActiva.idsuc === s.idsuc ? "#FDE8F4" : "#fff",
                color: sucursalActiva.idsuc === s.idsuc ? "#E91E8C" : "#333",
                border: "none", textAlign: "left", cursor: "pointer",
                fontWeight: sucursalActiva.idsuc === s.idsuc ? "700" : "500",
                fontSize: "14px", borderBottom: "1px solid #FDE8F4"
              }}
            >
              {sucursalActiva.idsuc === s.idsuc ? "✓ " : "　"}{s.nom_desc}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SucursalSelector