function prepararIngrediente(ingrediente) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`${ingrediente} listo`);
            resolve(ingrediente);
        }, 1000);
    });
}

function cocinarPlato(plato) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`${plato} cocinado`);
            resolve(plato);
        }, 1000);
    });
}

function servirComida(plato) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`${plato} servido`);
            resolve();
        }, 1000);
    });
}
prepararIngrediente("Verduras")
    .then(ingrediente => cocinarPlato(ingrediente))
    .then(plato => servirComida(plato))
    .then(() => console.log("Comida lista"))
    .catch(error => console.log("Error:", error));