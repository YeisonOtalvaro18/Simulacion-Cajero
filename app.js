// Digamos que este es nuestro usuario "básico"
const miUsuario = {
    pin: '1234',
    saldo: 500000, // Un buen saldo para empezar
};

// Cositas para el estado del cajero
let intentosFallidos = 0;
let estaBloqueado = false;
let cuentaRegresiva;

// Vamos a buscar los elementos clave de la interfaz
const todasLasPantallas = document.querySelectorAll('.pantalla');
const pantallaPin = document.getElementById('pin-view');
const inputPin = document.getElementById('pin-input');
const errorPin = document.getElementById('pin-error');
const botonesTeclado = document.querySelectorAll('.boton-teclado');
const botonBorrar = document.getElementById('borrar-btn');
const botonEntrar = document.getElementById('entrar-btn');

const pantallaMenu = document.getElementById('menu-view');
const botonVerSaldo = document.getElementById('ver-saldo-btn');
const botonRetirar = document.getElementById('retirar-btn');
const botonSalir = document.getElementById('salir-btn');

const pantallaSaldo = document.getElementById('saldo-view');
const cantidadSaldoDisplay = document.getElementById('cantidad-saldo');
const botonSaldoVolver = document.getElementById('saldo-volver-btn');

const pantallaRetiro = document.getElementById('retiro-view');
const inputCantidadRetiro = document.getElementById('cantidad-retiro');
const errorRetiro = document.getElementById('retiro-error');
const botonesMontosRapidos = document.querySelectorAll('.monto-rapido');
const botonConfirmarRetiro = document.getElementById('confirmar-retiro-btn');
const botonCancelarRetiro = document.getElementById('cancelar-retiro-btn');

const pantallaBloqueo = document.getElementById('bloqueo-view');
const displayTiempoEspera = document.getElementById('tiempo-espera');


// --- Funciones que hacen que esto funcione ---

// Para cambiar de pantalla fácilmente
function mostrarPantalla(pantallaAMostrar) {
    todasLasPantallas.forEach(p => p.classList.remove('activa'));
    pantallaAMostrar.classList.add('activa');
}

// Para que el dinero se vea bonito
function formatoDinero(cantidad) {
    return '$' + cantidad.toLocaleString('es-ES');
}

// Actualizar el saldo en pantalla
function refrescarSaldo() {
    cantidadSaldoDisplay.textContent = formatoDinero(miUsuario.saldo);
}

// Bloquea la cuenta si fallan mucho el PIN
function bloquearCaja() {
    estaBloqueado = true;
    mostrarPantalla(pantallaBloqueo);

    let segundos = 30;
    displayTiempoEspera.textContent = `Intenta de nuevo en ${segundos} segundos.`;

    cuentaRegresiva = setInterval(() => {
        segundos--;
        displayTiempoEspera.textContent = `Intenta de nuevo en ${segundos} segundos.`;

        if (segundos <= 0) {
            clearInterval(cuentaRegresiva);
            estaBloqueado = false;
            intentosFallidos = 0;
            mostrarPantalla(pantallaPin);
            inputPin.value = '';
            errorPin.textContent = '';
        }
    }, 1000);
}


// --- Aquí conectamos los botones a las acciones ---

// El teclado numérico
botonesTeclado.forEach(boton => {
    if (boton.dataset.numero) {
        boton.addEventListener('click', () => {
            if (inputPin.value.length < 4) {
                inputPin.value += boton.dataset.numero;
            }
        });
    }
});

// Botón "Borrar" del PIN
botonBorrar.addEventListener('click', () => {
    inputPin.value = '';
});

// Botón "Entrar" para el PIN
botonEntrar.addEventListener('click', () => {
    if (estaBloqueado) return; // Si está bloqueado, no hacemos nada

    if (inputPin.value.length !== 4) {
        errorPin.textContent = 'El PIN debe tener 4 números, ¿vale?';
        return;
    }

    if (inputPin.value === miUsuario.pin) {
        intentosFallidos = 0;
        mostrarPantalla(pantallaMenu);
        refrescarSaldo(); // Asegurarse de que el saldo esté al día
        inputPin.value = ''; // Limpiamos por seguridad
        errorPin.textContent = '';
    } else {
        intentosFallidos++;
        errorPin.textContent = `PIN incorrecto. Te quedan ${3 - intentosFallidos} intentos.`;
        inputPin.value = '';

        if (intentosFallidos >= 3) {
            bloquearCaja();
        }
    }
});

//Acciones desde el menú principal

botonVerSaldo.addEventListener('click', () => {
    mostrarPantalla(pantallaSaldo);
    refrescarSaldo();
});

botonRetirar.addEventListener('click', () => {
    mostrarPantalla(pantallaRetiro);
    inputCantidadRetiro.value = ''; //Limpiamos el campo
    errorRetiro.textContent = '';
});

botonSalir.addEventListener('click', () => {
    mostrarPantalla(pantallaPin);
    inputPin.value = ''; //Y limpiamos el PIN
});


//Manejo de la pantalla de saldo

botonSaldoVolver.addEventListener('click', () => {
    mostrarPantalla(pantallaMenu);
});


//Manejo de la pantalla de retiro

//Botones de montos rápidos
botonesMontosRapidos.forEach(boton => {
    boton.addEventListener('click', () => {
        inputCantidadRetiro.value = boton.dataset.cantidad;
        errorRetiro.textContent = ''; //Limpiar errores previos
    });
});

//Confirmar retiro
botonConfirmarRetiro.addEventListener('click', () => {
    const cantidadARetirar = parseFloat(inputCantidadRetiro.value);

    if (isNaN(cantidadARetirar) || cantidadARetirar <= 0) {
        errorRetiro.textContent = 'Por favor, pon un monto válido y positivo.';
        return;
    }

    if (cantidadARetirar > miUsuario.saldo) {
        errorRetiro.textContent = '¡No tienes tanto dinero!';
        return;
    }

    //¡A retirar!
    miUsuario.saldo -= cantidadARetirar;
    //Aquí podríamos guardar esto en algún lado, pero por ahora lo dejamos simple.
    
    mostrarPantalla(pantallaMenu);
    refrescarSaldo(); //Para que el saldo se vea actualizado en el menú
});

// Cancelar retiro
botonCancelarRetiro.addEventListener('click', () => {
    mostrarPantalla(pantallaMenu);
});


//Lo que pasa cuando la página carga
document.addEventListener('DOMContentLoaded', () => {
    mostrarPantalla(pantallaPin); //Empezamos en la pantalla de PIN
    
});