import { useState, useEffect } from "react"
import { getStockSucursal, getVentasGrafico } from "../api/api"  // ← agrega getVentasGrafico
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts"
import SucursalSelector from "../components/SucursalSelector"
import { useSucursal } from "../context/SucursalContext"

function StatCard({ titulo, cantidad, color }) {
  return (
    <div style={{
      background: "#fff",
      border: `2px solid ${color}`,
      borderRadius: "16px",
      padding: "24px",
      flex: 1,
      minWidth: "180px",
      textAlign: "center",
      boxShadow: `0 4px 16px ${color}22`
    }}>
      <p style={{ color, fontWeight: "700", fontSize: "16px", margin: "0 0 16px" }}>
        {titulo}
      </p>
      <span style={{ color, fontWeight: "800", fontSize: "48px" }}>
        {cantidad ?? "..."}
      </span>
    </div>
  )
}

function Dashboard() {
  const { sucursalActiva } = useSucursal()
  const [inventario, setInventario] = useState({ zapatos: 0, bolsos: 0, accesorios: 0 })
  const [ventasData, setVentasData] = useState([])  // ← agrega estado

  useEffect(() => {
    if (!sucursalActiva) return
    getStockSucursal(sucursalActiva.idsuc)
      .then(setInventario)
      .catch(console.error)
    getVentasGrafico(sucursalActiva.idsuc)
      .then(setVentasData)
      .catch(console.error)
  }, [sucursalActiva?.idsuc])

  if (!sucursalActiva) return null

  return (
    <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ color: "#E91E8C", fontFamily: "sans-serif", margin: 0 }}>
            Inventario
          </h1>
          <p style={{ color: "#aaa", fontSize: "14px", margin: "4px 0 0" }}>
            Stock total en {sucursalActiva.nom_desc}
          </p>
        </div>
        <SucursalSelector />
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "48px", flexWrap: "wrap" }}>
        <StatCard titulo="Zapatos"    cantidad={inventario.zapatos}    color="#E91E8C" />
        <StatCard titulo="Bolsos"     cantidad={inventario.bolsos}     color="#F472B6" />
        <StatCard titulo="Accesorios" cantidad={inventario.accesorios} color="#a855f7" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#E91E8C", fontFamily: "sans-serif", margin: 0 }}>
          Estadística de ventas
        </h2>
      </div>

      <div style={{
        background: "#fff", borderRadius: "16px",
        padding: "24px", boxShadow: "0 4px 16px rgba(233,30,140,0.08)"
      }}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={ventasData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e0ea" />
            <XAxis dataKey="mes" tick={{ fill: "#aaa", fontSize: 12 }} />
            <YAxis tick={{ fill: "#aaa", fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #F472B6" }} />
            <Legend />
            <Line type="monotone" dataKey="zapatos"    stroke="#E91E8C" strokeWidth={2.5} dot={{ r: 4 }} name="Zapatos" />
            <Line type="monotone" dataKey="bolsos"     stroke="#F472B6" strokeWidth={2.5} dot={{ r: 4 }} name="Bolsos" />
            <Line type="monotone" dataKey="accesorios" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 4 }} name="Accesorios" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

export default Dashboard