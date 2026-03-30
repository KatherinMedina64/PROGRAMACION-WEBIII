function hervirAgua() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Agua hervida");
            resolve();
        }, 1000);
    });
}
function agregarCafe() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Café agregado");
            resolve();
        }, 1000);
    });
}
function servirTaza() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Taza servida");
            resolve();
        }, 1000);
    });
}

async function prepararCafe() {
    try {
        await hervirAgua();    
        await agregarCafe();    
        await servirTaza();     
        console.log("Café listo"); 
    } catch (error) {
        console.log("Ocurrió un error:", error);
    }
}
prepararCafe();