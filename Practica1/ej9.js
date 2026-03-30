function promesa() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Exito");
        }, 3000); 
    });
}
promesa()
    .then(mensaje => {
        console.log(mensaje);
    })
