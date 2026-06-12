import { useState, useEffect } from "react"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Productos from "./pages/Productos"
import Ventas from "./pages/Ventas"
import Navbar from "./components/Navbar"
import { SucursalProvider } from "./context/SucursalContext"

function App() {
  const [logueado, setLogueado] = useState(false)
  const [page, setPage] = useState("dashboard")
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const resize = () => setEsMovil(window.innerWidth <= 768)

    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
    }
  }, [])

  if (!logueado) {
    return <Login onLogin={() => setLogueado(true)} />
  }

  return (
    <SucursalProvider>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#fff5f9"
        }}
      >
        <Navbar
          page={page}
          setPage={setPage}
          onLogout={() => setLogueado(false)}
        />

        <main
          style={{
            flex: 1,
            marginLeft: esMovil ? "0" : "220px",
            width: esMovil ? "100%" : "calc(100% - 220px)",
            transition: "all 0.3s ease"
          }}
        >
          {page === "dashboard" && <Dashboard />}
          {page === "productos" && <Productos />}
          {page === "ventas" && <Ventas />}
        </main>
      </div>
    </SucursalProvider>
  )
}

export default App