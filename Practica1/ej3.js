function miFuncion(cad) {
    let res = {
        par: [],
        imp: []
    };
    for (let i = 0; i < cad.length; i++) {
        if (cad[i] % 2 === 0) {
            res.par.push(cad[i]);
        } else {
            res.imp.push(cad[i]);
        }
    }
    return res;
}
let obj = miFuncion([1, 2, 3, 4, 5]);
console.log(obj);