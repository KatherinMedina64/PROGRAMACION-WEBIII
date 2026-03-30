//CALLBACK
function hervirAgua(callback) {
    setTimeout(() => {
        console.log("Ejemplo con Callback");
        console.log("Hervir agua");
        callback();
    }, 1000);
}

function agregarCafe(callback) {
    setTimeout(() => {
        console.log("Agregar café");
        callback();
    }, 1000);
}

function servirTaza(callback) {
    setTimeout(() => {
        console.log("Servir en taza");
        callback();
    }, 1000);
}



hervirAgua(() => {
    agregarCafe(() => {
        servirTaza(() => {
            console.log("Café listo");
        });
    });
});

//PROMESA
console.log("Ejemplo con Promesa");
function verificarEdad(edad) {
    return new Promise((resolve, reject) => {
        if (edad >= 18) {
            resolve("Eres mayor de edad");
        } else {
            reject("Eres menor de edad");
        }
    });
}

verificarEdad(20)
    .then(mensaje => console.log(mensaje))
    .catch(error => console.log(error));