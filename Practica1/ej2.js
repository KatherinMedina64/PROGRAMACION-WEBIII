function Invertir(s) {
    console.log(s); 
    let resultado = "";
    for (let i = s.length - 1; i >= 0; i--) {
        resultado += s[i];
    }
    return resultado;
}
let texto = Invertir("abcd");
console.log(texto); 