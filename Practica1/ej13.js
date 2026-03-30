function prepararMasa() {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("Masa preparada");
            resolve("Masa lista");
        }, 1000);
    });
}
function agregarIngredientes(masa) {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("Ingredientes agregados a la " + masa);
            resolve("Pizza lista para hornear");
        }, 1000);
    });
}
function hornearPizza(pizza) {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("Pizza horneada: " + pizza);
            resolve();
        }, 1000);
    });
}
async function ejecutarPedido() {
    try {
        let masa = await prepararMasa();
        let pizza = await agregarIngredientes(masa);
        await hornearPizza(pizza);
        console.log("Pedido completado 🍕");
    } catch (error) {
        console.log("Error en el pedido:", error);
    }
}
ejecutarPedido();