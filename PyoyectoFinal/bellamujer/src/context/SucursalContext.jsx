import { createContext, useContext, useState, useEffect } from "react"
import { getSucursales } from "../api/api"

const SucursalContext = createContext()

export function SucursalProvider({ children }) {
  const [sucursales,     setSucursales]     = useState([])
  const [sucursalActiva, setSucursalActiva] = useState(null)
  const [cargando,       setCargando]       = useState(true)

  useEffect(() => {
    getSucursales()
      .then(data => {
        setSucursales(data)
        setSucursalActiva(data[0])
      })
      .catch(() => {
        const fallback = [
          { idsuc: 1, nom_desc: "Sucursal Central" },
          { idsuc: 2, nom_desc: "Sucursal Norte" },
        ]
        setSucursales(fallback)
        setSucursalActiva(fallback[0])
      })
      .finally(() => setCargando(false))
  }, [])

  return (
    <SucursalContext.Provider value={{ sucursales, sucursalActiva, setSucursalActiva, cargando }}>
      {children}
    </SucursalContext.Provider>
  )
}

export function useSucursal() {
  return useContext(SucursalContext)
}