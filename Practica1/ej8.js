function Callback(callback) {
    setTimeout(function() {
        callback();
    }, 2000); 
}
function callback2() {
    console.log("Se ejecuto en 2 segundos");
}
Callback(callback2);