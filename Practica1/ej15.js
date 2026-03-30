function leerMensajeCallback(callback) {
    setTimeout(() => {
        const mensaje = "Mensaje recibido";
        callback(null, mensaje);
    }, 1500);
}

function leerMensajePromesa() {
    return new Promise((resolve, reject) => {
        leerMensajeCallback((error, resultado) => {
            if (error) {
                reject(error);
            } else {
                resolve(resultado);
            }
        });
    });
}
leerMensajePromesa()
    .then(res => console.log(res))        
    .catch(err => console.log("Error:", err)); 