function miFuncion(texto) {
    let resultado = {
        a: 0,
        e: 0,
        i: 0,
        o: 0,
        u: 0
    }; 
    texto = texto.toLowerCase();
    for (let i = 0; i < texto.length; i++) {
        if (texto[i] === "a" || texto[i] === "e" || texto[i] === "i" || texto[i] === "o" || texto[i] === "u") {
            resultado[texto[i]]++;
        }
    }

    return resultado;
}

let obj = miFuncion("euforia");
console.log(obj);