function miFuncion(cad) {
    cad = cad.toLowerCase();
    let invertir = "";
    for (let i = cad.length - 1; i >= 0; i--) {
        invertir += cad[i];
    }
    return cad === invertir;
}
let a = miFuncion("oruro");
console.log(a); 
a = miFuncion("hola");
console.log(a); 