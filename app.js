// Datos iniciales
const usuarioPorDefecto = {
    pin: '1234',
    saldo: 0,
    transacciones: []
};

// Obtener usuario de localStorage o crear uno nuevo
let usuarioActual = JSON.parse(localStorage.getItem('atmUsuario')) || usuarioPorDefecto;

// Variables de estado
let intentos = 0;
let estaBloqueado = false;
let tiempoBloqueo;
let intervaloCuentaAtras;

// Elementos del DOM
const pantallas = document.querySelectorAll('.pantalla');
const pantallaInsertarTarjeta = document.getElementById('pantalla-insertar-tarjeta');
const pantallaPin = document.getElementById('pantalla-pin');
const entradaPin = document.getElementById('entrada-pin');
const errorPin = document.getElementById('error-pin');
const botonesTeclado = document.querySelectorAll('.tecla');
const botonBorrar = document.getElementById('btn-borrar');
const botonEntrar = document.getElementById('btn-entrar');

const pantallaMenu = document.getElementById('pantalla-menu');
const pantallaSaldo = document.getElementById('pantalla-saldo');
const cantidadSaldo = document.getElementById('cantidad-saldo');
const botonVolverSaldo = document.getElementById('btn-volver-saldo');

const pantallaRetirar = document.getElementById('pantalla-retirar');
const cantidadRetirar = document.getElementById('cantidad-retirar');
const errorRetirar = document.getElementById('error-retirar');
const cantidadesRapidas = document.querySelectorAll('.cantidad-rapida');
const botonConfirmarRetiro = document.getElementById('btn-confirmar-retiro');
const botonCancelarRetiro = document.getElementById('btn-cancelar-retiro');

const pantallaDepositar = document.getElementById('pantalla-depositar');
const cantidadDepositar = document.getElementById('cantidad-depositar');
const errorDepositar = document.getElementById('error-depositar');
const botonConfirmarDeposito = document.getElementById('btn-confirmar-deposito');
const botonCancelarDeposito = document.getElementById('btn-cancelar-deposito');

const pantallaCambiarPin = document.getElementById('pantalla-cambiar-pin');
const nuevoPinEntrada = document.getElementById('nuevo-pin');
const confirmarNuevoPinEntrada = document.getElementById('confirmar-nuevo-pin');
const errorCambiarPin = document.getElementById('error-cambiar-pin');
const botonConfirmarCambioPin = document.getElementById('btn-confirmar-cambio-pin');
const botonCancelarCambioPin = document.getElementById('btn-cancelar-cambio-pin');

const pantallaHistorial = document.getElementById('pantalla-historial');
const listaHistorial = document.getElementById('lista-historial');
const botonVolverHistorial = document.getElementById('btn-volver-historial');

const pantallaBloqueada = document.getElementById('pantalla-bloqueada');
const displayCuentaAtras = document.getElementById('cuenta-atras');

// Botones del menú principal
const botonSaldo = document.getElementById('btn-saldo');
const botonRetirar = document.getElementById('btn-retirar');
const botonDepositar = document.getElementById('btn-depositar');
const botonCambiarPin = document.getElementById('btn-cambiar-pin');
const botonHistorial = document.getElementById('btn-historial');
const botonCerrarSesion = document.getElementById('btn-cerrar-sesion');

// Funciones de ayuda
function mostrarPantalla(pantalla) {
    pantallas.forEach(s => s.classList.remove('activa'));
    pantalla.classList.add('activa');
}

function formatearMoneda(cantidad) {
    return '$' + cantidad.toLocaleString('es-ES');
}

function actualizarDisplaySaldo() {
    cantidadSaldo.textContent = formatearMoneda(usuarioActual.saldo);
}

function agregarTransaccion(tipo, cantidad) {
    const transaccion = {
        tipo,
        cantidad,
        fecha: new Date().toLocaleString()
    };
    usuarioActual.transacciones.unshift(transaccion);
    localStorage.setItem('atmUsuario', JSON.stringify(usuarioActual));
}

function mostrarTransacciones() {
    listaHistorial.innerHTML = '';
    if (usuarioActual.transacciones.length === 0) {
        listaHistorial.innerHTML = '<p>No hay movimientos registrados</p>';
        return;
    }

    usuarioActual.transacciones.forEach(transaccion => {
        const elementoTransaccion = document.createElement('div');
        elementoTransaccion.className = `transaccion ${transaccion.tipo === 'deposit' ? 'credito' : 'debito'}`;
        
        const textoTipo = transaccion.tipo === 'deposit' ? 'Depósito' : 'Retiro';
        const signoCantidad = transaccion.tipo === 'deposit' ? '+' : '-';
        
        elementoTransaccion.innerHTML = `
            <p><strong>${textoTipo}</strong> - ${transaccion.fecha}</p>
            <p class="${transaccion.tipo === 'deposit' ? 'credito' : 'debito'}">${signoCantidad}$${transaccion.cantidad.toLocaleString()}</p>
        `;
        listaHistorial.appendChild(elementoTransaccion);
    });
}

function bloquearCuenta() {
    estaBloqueado = true;
    mostrarPantalla(pantallaBloqueada);
    
    let segundos = 30;
    displayCuentaAtras.textContent = `Intente nuevamente en ${segundos} segundos.`;
    
    intervaloCuentaAtras = setInterval(() => {
        segundos--;
        displayCuentaAtras.textContent = `Intente nuevamente en ${segundos} segundos.`;
        
        if (segundos <= 0) {
            clearInterval(intervaloCuentaAtras);
            estaBloqueado = false;
            intentos = 0;
            mostrarPantalla(pantallaPin);
            entradaPin.value = '';
            errorPin.textContent = '';
        }
    }, 1000);
}

// Event Listeners
// Teclado numérico
botonesTeclado.forEach(boton => {
    if (boton.dataset.numero) {
        boton.addEventListener('click', () => {
            if (entradaPin.value.length < 4) {
                entradaPin.value += boton.dataset.numero;
            }
        });
    }
});

// Botón borrar
botonBorrar.addEventListener('click', () => {
    entradaPin.value = '';
});

// Botón entrar
botonEntrar.addEventListener('click', () => {
    if (estaBloqueado) return;
    
    if (entradaPin.value.length !== 4) {
        errorPin.textContent = 'El PIN debe tener 4 dígitos';
        return;
    }
    
    if (entradaPin.value === usuarioActual.pin) {
        intentos = 0;
        mostrarPantalla(pantallaMenu);
        actualizarDisplaySaldo();
        entradaPin.value = '';
        errorPin.textContent = '';
    } else {
        intentos++;
        errorPin.textContent = `PIN incorrecto. Intentos restantes: ${3 - intentos}`;
        entradaPin.value = '';
        
        if (intentos >= 3) {
            bloquearCuenta();
        }
    }
});

// Menú principal
botonSaldo.addEventListener('click', () => {
    mostrarPantalla(pantallaSaldo);
    actualizarDisplaySaldo();
});

botonRetirar.addEventListener('click', () => {
    mostrarPantalla(pantallaRetirar);
    cantidadRetirar.value = '';
    errorRetirar.textContent = '';
});

botonDepositar.addEventListener('click', () => {
    mostrarPantalla(pantallaDepositar);
    cantidadDepositar.value = '';
    errorDepositar.textContent = '';
});

botonCambiarPin.addEventListener('click', () => {
    mostrarPantalla(pantallaCambiarPin);
    nuevoPinEntrada.value = '';
    confirmarNuevoPinEntrada.value = '';
    errorCambiarPin.textContent = '';
});

botonHistorial.addEventListener('click', () => {
    mostrarPantalla(pantallaHistorial);
    mostrarTransacciones();
});

botonCerrarSesion.addEventListener('click', () => {
    mostrarPantalla(pantallaPin);
    entradaPin.value = '';
});

// Botones de volver
botonVolverSaldo.addEventListener('click', () => {
    mostrarPantalla(pantallaMenu);
});

botonCancelarRetiro.addEventListener('click', () => {
    mostrarPantalla(pantallaMenu);
});

botonCancelarDeposito.addEventListener('click', () => {
    mostrarPantalla(pantallaMenu);
});

botonCancelarCambioPin.addEventListener('click', () => {
    mostrarPantalla(pantallaMenu);
});

botonVolverHistorial.addEventListener('click', () => {
    mostrarPantalla(pantallaMenu);
});

// Montos rápidos
cantidadesRapidas.forEach(boton => {
    boton.addEventListener('click', () => {
        const cantidad = boton.dataset.cantidad;
        if (cantidadRetirar) {
            cantidadRetirar.value = cantidad;
        }
        if (cantidadDepositar) {
            cantidadDepositar.value = cantidad;
        }
    });
});

// Retirar dinero
botonConfirmarRetiro.addEventListener('click', () => {
    const cantidad = parseFloat(cantidadRetirar.value);
    
    if (isNaN(cantidad)) {
        errorRetirar.textContent = 'Ingrese un monto válido';
        return;
    }

    if (cantidad <= 0) {
        errorRetirar.textContent = 'El monto debe ser positivo';
        return;
    }
    
    if (cantidad > usuarioActual.saldo) {
        errorRetirar.textContent = 'Saldo insuficiente';
        return;
    }
    
    usuarioActual.saldo -= cantidad;
    agregarTransaccion('withdrawal', cantidad);
    localStorage.setItem('atmUsuario', JSON.stringify(usuarioActual));
    
    mostrarPantalla(pantallaMenu);
    actualizarDisplaySaldo();
});

// Depositar dinero
botonConfirmarDeposito.addEventListener('click', () => {
    const cantidad = parseFloat(cantidadDepositar.value);
    
    if (isNaN(cantidad)) {
        errorDepositar.textContent = 'Ingrese un monto válido';
        return;
    }
    
    if (cantidad <= 0) {
        errorDepositar.textContent = 'El monto debe ser positivo';
        return;
    }
    
    usuarioActual.saldo += cantidad;
    agregarTransaccion('deposit', cantidad);
    localStorage.setItem('atmUsuario', JSON.stringify(usuarioActual));
    
    mostrarPantalla(pantallaMenu);
    actualizarDisplaySaldo();
});

// Cambiar PIN
botonConfirmarCambioPin.addEventListener('click', () => {
    const nuevoPin = nuevoPinEntrada.value;
    const confirmarPin = confirmarNuevoPinEntrada.value;
    
    if (nuevoPin.length !== 4 || confirmarPin.length !== 4) {
        errorCambiarPin.textContent = 'El PIN debe tener 4 dígitos';
        return;
    }
    
    if (nuevoPin !== confirmarPin) {
        errorCambiarPin.textContent = 'Los PINs no coinciden';
        return;
    }
    
    if (!/^\d+$/.test(nuevoPin)) {
        errorCambiarPin.textContent = 'El PIN solo puede contener números';
        return;
    }
    
    usuarioActual.pin = nuevoPin;
    localStorage.setItem('atmUsuario', JSON.stringify(usuarioActual));
    
    errorCambiarPin.textContent = '';
    errorCambiarPin.style.color = '#2ecc71';
    errorCambiarPin.textContent = 'PIN cambiado exitosamente';
    
    setTimeout(() => {
        mostrarPantalla(pantallaMenu);
    }, 1500);
});

// Inicialización de la simulación de tarjeta
function inicializarCajero() {
    mostrarPantalla(pantallaInsertarTarjeta); // Mostrar la pantalla de insertar tarjeta primero
    setTimeout(() => {
        mostrarPantalla(pantallaPin); // Después de 2.5 segundos, mostrar la pantalla del PIN
        actualizarDisplaySaldo(); // Asegúrate de que el balance se actualice al inicio si es necesario
    }, 2500); // 2500 milisegundos = 2.5 segundos
}

// Llama a la función de inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', inicializarCajero);