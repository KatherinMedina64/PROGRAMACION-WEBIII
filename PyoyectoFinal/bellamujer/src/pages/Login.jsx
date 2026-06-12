import { useState } from "react"
import { login, registro } from "../api/api"
import logo from "../assets/logo.jpg"

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [signUpMode, setSignUpMode] = useState(false)

  // ── CAPTCHA ──────────────────────────────────────────────
  const [captchaNum1] = useState(() => Math.floor(Math.random() * 9) + 1)
  const [captchaNum2] = useState(() => Math.floor(Math.random() * 9) + 1)
  const [captchaInput, setCaptchaInput] = useState("")
  const [captchaError, setCaptchaError] = useState(false)

  // ── REGISTRO ─────────────────────────────────────────────
  const [regNombre, setRegNombre] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirm, setRegConfirm] = useState("")
  const [regError, setRegError] = useState("")
  const [regExito, setRegExito] = useState(false)

  // ── LOGIN ─────────────────────────────────────────────────
  const handleLogin = async () => {
    if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) {
      setCaptchaError(true)
      return
    }
    try {
      const data = await login(usuario, password)
      localStorage.setItem("token", data.token)
      onLogin()
    } catch (e) {
      setError("Usuario o contraseña incorrectos")
    }
  }

  // ── REGISTRO ─────────────────────────────────────────────
  const handleRegistro = async () => {
    if (!regNombre || !regEmail || !regPassword || !regConfirm) {
      setRegError("Todos los campos son obligatorios")
      return
    }
    if (!isNaN(regNombre) || /^\d+$/.test(regNombre.trim())) {
      setRegError("El nombre no puede ser un número")
      return
    }
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    if (!gmailRegex.test(regEmail)) {
      setRegError("El correo debe ser una dirección válida de @gmail.com")
      return
    }
    if (regPassword !== regConfirm) {
      setRegError("Las contraseñas no coinciden")
      return
    }
    if (regPassword.length < 6) {
      setRegError("contrasena debil")
      return
    }
    else if (regPassword.length > 6 && regPassword.length <10) {
      setRegError("contrasena media")
      return
    }

    try {
      await registro(regNombre, regEmail, regPassword)
      setRegExito(true)
      setRegError("") 
      setTimeout(() => { setSignUpMode(false); setRegExito(false) }, 2000)
    } catch (e) {
  setRegError(e.message)
  console.log(e.message)
}
  }
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800&display=swap");

        .lg-container {
          position: relative;
          width: 100%;
          background-color: #fff;
          min-height: 100vh;
          overflow: hidden;
          font-family: "Poppins", sans-serif;
        }
        .lg-forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .lg-signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }
        .lg-container.lg-sign-up-mode .lg-signin-signup {
          left: 25%;
        }
        .lg-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0rem 5rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }
        .lg-form-signup { opacity: 0; z-index: 1; }
        .lg-form-signin { z-index: 2; }
        .lg-container.lg-sign-up-mode .lg-form-signup { opacity: 1; z-index: 2; }
        .lg-container.lg-sign-up-mode .lg-form-signin { opacity: 0; z-index: 1; }
        .lg-title {
          font-size: 2.2rem;
          color: #444;
          margin-bottom: 10px;
          font-family: "Poppins", sans-serif;
        }
        .lg-input-field {
          max-width: 380px;
          width: 100%;
          background-color: #f0f0f0;
          margin: 10px 0;
          height: 55px;
          border-radius: 55px;
          display: grid;
          grid-template-columns: 15% 85%;
          padding: 0 0.4rem;
          position: relative;
        }
        .lg-input-field i {
          text-align: center;
          line-height: 55px;
          color: #acacac;
          transition: 0.5s;
          font-size: 1.1rem;
        }
        .lg-input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 600;
          font-size: 1.1rem;
          color: #333;
          font-family: "Poppins", sans-serif;
        }
        .lg-input-field input::placeholder { color: #aaa; font-weight: 500; }
        .lg-error {
          color: #E91E8C;
          font-size: 0.82rem;
          font-weight: 600;
          margin: 4px 0;
          font-family: "Poppins", sans-serif;
          text-align: center;
        }
        .lg-exito {
          color: #22C55E;
          font-size: 0.82rem;
          font-weight: 600;
          margin: 4px 0;
          font-family: "Poppins", sans-serif;
          text-align: center;
        }
        .lg-btn {
          width: 150px;
          background-color: #E91E8C;
          border: none;
          outline: none;
          height: 49px;
          border-radius: 49px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 600;
          margin: 10px 0;
          cursor: pointer;
          transition: 0.5s;
          font-family: "Poppins", sans-serif;
          font-size: 0.9rem;
        }
        .lg-btn:hover { background-color: #c2185b; }
        .lg-btn-transparent {
          margin: 0;
          background: none;
          border: 2px solid #fff;
          width: 130px;
          height: 41px;
          font-weight: 600;
          font-size: 0.8rem;
          border-radius: 49px;
          color: #fff;
          text-transform: uppercase;
          cursor: pointer;
          font-family: "Poppins", sans-serif;
          transition: 0.5s;
        }
        .lg-btn-transparent:hover { background: rgba(255,255,255,0.15); }
        .lg-captcha-box {
          background: #f0f0f0;
          border-radius: 12px;
          padding: 8px 20px;
          font-weight: 800;
          font-size: 1.2rem;
          color: #E91E8C;
          letter-spacing: 3px;
          user-select: none;
          font-family: monospace;
        }
        .lg-captcha-wrap { width: 100%; max-width: 380px; margin: 6px 0; }
        .lg-captcha-row { display: flex; align-items: center; gap: 10px; justify-content: center; }
        .lg-captcha-input { width: 90px; min-width: 90px; margin: 0 !important; }
        .lg-panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }
        .lg-container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background-image: linear-gradient(-45deg, #F472B6 0%, #E91E8C 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }
        .lg-container.lg-sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }
        .lg-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }
        .lg-left-panel { pointer-events: all; padding: 3rem 17% 2rem 12%; }
        .lg-right-panel { pointer-events: none; padding: 3rem 12% 2rem 17%; }
        .lg-container.lg-sign-up-mode .lg-left-panel { pointer-events: none; }
        .lg-container.lg-sign-up-mode .lg-right-panel { pointer-events: all; }
        .lg-panel-content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }
        .lg-panel-content h3 {
          font-weight: 600; line-height: 1;
          font-size: 1.5rem; font-family: "Poppins", sans-serif;
        }
        .lg-panel-content p {
          font-size: 0.95rem; padding: 0.7rem 0;
          font-family: "Poppins", sans-serif;
        }
        .lg-panel-img {
          width: 75%;
          max-width: 200px;
          object-fit: contain;
          transition: transform 1.1s ease-in-out;
          transition-delay: 0.4s;
          margin: 0 auto;
          display: block;
          align-self: center;
        }
        .lg-right-panel .lg-panel-img,
        .lg-right-panel .lg-panel-content { transform: translateX(800px); }
        .lg-container.lg-sign-up-mode .lg-left-panel .lg-panel-img,
        .lg-container.lg-sign-up-mode .lg-left-panel .lg-panel-content { transform: translateX(-800px); }
        .lg-container.lg-sign-up-mode .lg-right-panel .lg-panel-img,
        .lg-container.lg-sign-up-mode .lg-right-panel .lg-panel-content { transform: translateX(0%); }

        @media (max-width: 870px) {
          .lg-container { min-height: 800px; height: 100vh; }
          .lg-signin-signup {
            width: 100%; top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out; left: 50%;
          }
          .lg-container.lg-sign-up-mode .lg-signin-signup {
            top: 5%; transform: translate(-50%, 0); left: 50%;
          }
          .lg-panels-container { grid-template-columns: 1fr; grid-template-rows: 1fr 2fr 1fr; }
          .lg-panel { flex-direction: row; justify-content: space-around; align-items: center; padding: 2.5rem 8%; grid-column: 1 / 2; }
          .lg-right-panel { grid-row: 3 / 4; }
          .lg-left-panel  { grid-row: 1 / 2; }
          .lg-panel-img { width: 200px; }
          .lg-panel-content { padding-right: 15%; }
          .lg-panel-content h3 { font-size: 1.2rem; }
          .lg-panel-content p  { font-size: 0.7rem; padding: 0.5rem 0; }
          .lg-btn-transparent { width: 110px; height: 35px; font-size: 0.7rem; }
          .lg-container:before {
            width: 1500px; height: 1500px;
            transform: translateX(-50%);
            left: 30%; bottom: 68%; right: initial; top: initial;
            transition: 2s ease-in-out;
          }
          .lg-container.lg-sign-up-mode:before { transform: translate(-50%, 100%); bottom: 32%; right: initial; }
          .lg-container.lg-sign-up-mode .lg-left-panel .lg-panel-img,
          .lg-container.lg-sign-up-mode .lg-left-panel .lg-panel-content { transform: translateY(-300px); }
          .lg-container.lg-sign-up-mode .lg-right-panel .lg-panel-img,
          .lg-container.lg-sign-up-mode .lg-right-panel .lg-panel-content { transform: translateY(0px); }
          .lg-right-panel .lg-panel-img,
          .lg-right-panel .lg-panel-content { transform: translateY(300px); }
        }
        @media (max-width: 570px) {
          .lg-form { padding: 0 1.5rem; }
          .lg-panel-img { display: none; }
          .lg-panel-content { padding: 0.5rem 1rem; }
          .lg-container { padding: 1.5rem; }
          .lg-container:before { bottom: 72%; left: 50%; }
          .lg-container.lg-sign-up-mode:before { bottom: 28%; left: 50%; }
        }
      `}</style>

      <div className={`lg-container${signUpMode ? " lg-sign-up-mode" : ""}`}>

        <div className="lg-forms-container">
          <div className="lg-signin-signup">

            {/* ── LOGIN ─────────────────────────────────────── */}
            <div className="lg-form lg-form-signin">
              <h2 className="lg-title">Iniciar Sesión</h2>

              <div className="lg-input-field">
                <i className="fas fa-envelope"></i>
                <input
                  type="email" placeholder="Correo" value={usuario}
                  onChange={e => { setUsuario(e.target.value); setError("") }}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
              </div>

              <div className="lg-input-field">
                <i className="fas fa-lock"></i>
                <input
                  type="password" placeholder="Contraseña" value={password}
                  onChange={e => { setPassword(e.target.value); setError("") }}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
              </div>

              <div className="lg-captcha-wrap">
                <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#888", marginBottom: "8px", fontFamily: "Poppins, sans-serif" }}>
                  Verifica que eres humano
                </p>
                <div className="lg-captcha-row">
                  <div className="lg-captcha-box">{captchaNum1} + {captchaNum2} = ?</div>
                  <div className="lg-input-field lg-captcha-input">
                    <i className="fas fa-equals" style={{ fontSize: "0.9rem" }}></i>
                    <input
                      type="number" placeholder="..."
                      value={captchaInput}
                      onChange={e => { setCaptchaInput(e.target.value); setCaptchaError(false) }}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      style={{ fontSize: "1rem" }}
                    />
                  </div>
                </div>
                {captchaError && <p className="lg-error" style={{ marginTop: "6px" }}>⚠️ Respuesta incorrecta</p>}
              </div>

              {error && <p className="lg-error">⚠️ {error}</p>}

              <button className="lg-btn" onClick={handleLogin}>Ingresar</button>
            </div>

            {/* ── REGISTRO ──────────────────────────────────── */}
            <div className="lg-form lg-form-signup">
              <h2 className="lg-title">Crear Cuenta</h2>

              <div className="lg-input-field">
                <i className="fas fa-user"></i>
                <input
                  type="text" placeholder="Usuario" value={regNombre}
                  onChange={e => { setRegNombre(e.target.value); setRegError("") }}
                />
              </div>

              <div className="lg-input-field">
                <i className="fas fa-envelope"></i>
                <input
                  type="email" placeholder="Email" value={regEmail}
                  onChange={e => { setRegEmail(e.target.value); setRegError("") }}
                />
              </div>

              <div className="lg-input-field">
                <i className="fas fa-lock"></i>
                <input
                  type="password" placeholder="Contraseña" value={regPassword}
                  onChange={e => { setRegPassword(e.target.value); setRegError("") }}
                />
              </div>

              <div className="lg-input-field">
                <i className="fas fa-lock"></i>
                <input
                  type="password" placeholder="Confirmar contraseña" value={regConfirm}
                  onChange={e => { setRegConfirm(e.target.value); setRegError("") }}
                />
              </div>

              {regError && <p className="lg-error">{regError}</p>}
              {regExito && <p className="lg-exito">✔ Cuenta creada, redirigiendo...</p>}

              <button className="lg-btn" onClick={handleRegistro}>Registrarse</button>
            </div>

          </div>
        </div>

        {/* ── PANELES ───────────────────────────────────────── */}
        <div className="lg-panels-container">
          <div className="lg-panel lg-left-panel">
            <div className="lg-panel-content">
              <h3>¿Nuevo aquí?</h3>
              <p>¿Aún no tienes una cuenta? Únete y disfruta de los beneficios de ser parte.</p>
              <button className="lg-btn-transparent" onClick={() => setSignUpMode(true)}>Regístrate</button>
            </div>
            <img src={logo} className="lg-panel-img" alt="Bella Mujer" />
          </div>

          <div className="lg-panel lg-right-panel">
            <div className="lg-panel-content">
              <h3>¿Ya tienes cuenta?</h3>
              <p>Si ya tienes una cuenta, inicia sesión para continuar disfrutando de nuestros servicios.</p>
              <button className="lg-btn-transparent" onClick={() => setSignUpMode(false)}>Iniciar Sesión</button>
            </div>
            <img src={logo} className="lg-panel-img" alt="Bella Mujer" />
          </div>
        </div>

      </div>
    </>
  )
}

export default Login