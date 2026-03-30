function Resto(cad) {
    let [a, b, ...res] = cad;
    return res;
}
let sol = Resto([50, 71, 52, 63, 45]);
console.log(sol);