function descargarArchivo() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const exito = true; 
            if (exito) resolve("Archivo descargado");
            else reject("Error al descargar el archivo");
        }, 2000);
    });
}
function descargarArchivoCallback(callback) {
    descargarArchivo()
        .then(resultado => callback(null, resultado)) 
        .catch(error => callback(error, null));     
}
descargarArchivoCallback((error, resultado) => {
    if (error) {
        console.log("Error:", error);
    } else {
        console.log(resultado);
    }
});