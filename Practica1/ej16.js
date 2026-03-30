function cargarPerfil() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("Perfil del usuario cargado");
        }, 2000);
    });
}
cargarPerfil()
    .then(res => console.log(res))
    .catch(err => console.log("Error:", err));

async function ejecutarCarga() {
    try {
        let res = await cargarPerfil();
        console.log(res);
    } catch (err) {
        console.log("Error:", err);
    }
}
ejecutarCarga();