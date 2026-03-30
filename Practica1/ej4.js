function miFuncion(num) {
    let may = num[0];
    let min = num[0];
    for (let i = 1; i < num.length; i++) {
        if (num[i] > may) {
            may = num[i];
        }
        if (num[i] < min) {
            min = num[i];
        }
    }
    return {
        may: may,
        min: min
    };
}
let numeros = miFuncion([3, 1, 5, 4, 2]);
console.log(numeros);