// Datos iniciales
const defaultUser = {
    pin: '1234',
    balance: 50000,
    transactions: []
};

// Obtener usuario de localStorage o crear uno nuevo
let currentUser = JSON.parse(localStorage.getItem('atmUser')) || defaultUser;

// Variables de estado
let attempts = 0;
let isBlocked = false;
let blockTimeout;
let countdownInterval;

// Elementos del DOM
const screens = document.querySelectorAll('.screen');
const pinScreen = document.getElementById('pin-screen');
const pinInput = document.getElementById('pin-input');
const pinError = document.getElementById('pin-error');
const keypadButtons = document.querySelectorAll('.key');
const clearButton = document.getElementById('clear-btn');
const enterButton = document.getElementById('enter-btn');

const menuScreen = document.getElementById('menu-screen');
const balanceScreen = document.getElementById('balance-screen');
const balanceAmount = document.getElementById('balance-amount');
const balanceBackButton = document.getElementById('balance-back-btn');

const withdrawScreen = document.getElementById('withdraw-screen');
const withdrawAmount = document.getElementById('withdraw-amount');
const withdrawError = document.getElementById('withdraw-error');
const quickAmounts = document.querySelectorAll('.quick-amount');
const withdrawConfirmButton = document.getElementById('withdraw-confirm-btn');
const withdrawBackButton = document.getElementById('withdraw-back-btn');

const depositScreen = document.getElementById('deposit-screen');
const depositAmount = document.getElementById('deposit-amount');
const depositError = document.getElementById('deposit-error');
const depositConfirmButton = document.getElementById('deposit-confirm-btn');
const depositBackButton = document.getElementById('deposit-back-btn');

const changePinScreen = document.getElementById('change-pin-screen');
const newPinInput = document.getElementById('new-pin');
const confirmNewPinInput = document.getElementById('confirm-new-pin');
const changePinError = document.getElementById('change-pin-error');
const changePinConfirmButton = document.getElementById('change-pin-confirm-btn');
const changePinBackButton = document.getElementById('change-pin-back-btn');

const historyScreen = document.getElementById('history-screen');
const historyList = document.getElementById('history-list');
const historyBackButton = document.getElementById('history-back-btn');

const blockedScreen = document.getElementById('blocked-screen');
const countdownDisplay = document.getElementById('countdown');

// Menú principal buttons
const balanceButton = document.getElementById('balance-btn');
const withdrawButton = document.getElementById('withdraw-btn');
const depositButton = document.getElementById('deposit-btn');
const changePinButton = document.getElementById('change-pin-btn');
const historyButton = document.getElementById('history-btn');
const logoutButton = document.getElementById('logout-btn');

// Funciones de ayuda
function showScreen(screen) {
    screens.forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function formatCurrency(amount) {
    return '$' + amount.toLocaleString('es-ES');
}

function updateBalanceDisplay() {
    balanceAmount.textContent = formatCurrency(currentUser.balance);
}

function addTransaction(type, amount) {
    const transaction = {
        type,
        amount,
        date: new Date().toLocaleString()
    };
    currentUser.transactions.unshift(transaction);
    localStorage.setItem('atmUser', JSON.stringify(currentUser));
}

function displayTransactions() {
    historyList.innerHTML = '';
    if (currentUser.transactions.length === 0) {
        historyList.innerHTML = '<p>No hay movimientos registrados</p>';
        return;
    }

    currentUser.transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = `transaction ${transaction.type}`;
        
        const typeText = transaction.type === 'deposit' ? 'Depósito' : 'Retiro';
        const amountClass = transaction.type === 'deposit' ? 'credit' : 'debit';
        const amountSign = transaction.type === 'deposit' ? '+' : '-';
        
        transactionElement.innerHTML = `
            <p><strong>${typeText}</strong> - ${transaction.date}</p>
            <p class="${amountClass}">${amountSign}$${transaction.amount.toLocaleString()}</p>
        `;
        historyList.appendChild(transactionElement);
    });
}

function blockAccount() {
    isBlocked = true;
    showScreen(blockedScreen);
    
    let seconds = 30;
    countdownDisplay.textContent = `Intente nuevamente en ${seconds} segundos.`;
    
    countdownInterval = setInterval(() => {
        seconds--;
        countdownDisplay.textContent = `Intente nuevamente en ${seconds} segundos.`;
        
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            isBlocked = false;
            attempts = 0;
            showScreen(pinScreen);
            pinInput.value = '';
            pinError.textContent = '';
        }
    }, 1000);
}

// Event Listeners
// Teclado numérico
keypadButtons.forEach(button => {
    if (button.dataset.number) {
        button.addEventListener('click', () => {
            if (pinInput.value.length < 4) {
                pinInput.value += button.dataset.number;
            }
        });
    }
});

// Botón borrar
clearButton.addEventListener('click', () => {
    pinInput.value = '';
});

// Botón entrar
enterButton.addEventListener('click', () => {
    if (isBlocked) return;
    
    if (pinInput.value.length !== 4) {
        pinError.textContent = 'El PIN debe tener 4 dígitos';
        return;
    }
    
    if (pinInput.value === currentUser.pin) {
        attempts = 0;
        showScreen(menuScreen);
        updateBalanceDisplay();
        pinInput.value = '';
        pinError.textContent = '';
    } else {
        attempts++;
        pinError.textContent = `PIN incorrecto. Intentos restantes: ${3 - attempts}`;
        pinInput.value = '';
        
        if (attempts >= 3) {
            blockAccount();
        }
    }
});

// Menú principal
balanceButton.addEventListener('click', () => {
    showScreen(balanceScreen);
    updateBalanceDisplay();
});

withdrawButton.addEventListener('click', () => {
    showScreen(withdrawScreen);
    withdrawAmount.value = '';
    withdrawError.textContent = '';
});

depositButton.addEventListener('click', () => {
    showScreen(depositScreen);
    depositAmount.value = '';
    depositError.textContent = '';
});

changePinButton.addEventListener('click', () => {
    showScreen(changePinScreen);
    newPinInput.value = '';
    confirmNewPinInput.value = '';
    changePinError.textContent = '';
});

historyButton.addEventListener('click', () => {
    showScreen(historyScreen);
    displayTransactions();
});

logoutButton.addEventListener('click', () => {
    showScreen(pinScreen);
    pinInput.value = '';
});

// Botones de volver
balanceBackButton.addEventListener('click', () => {
    showScreen(menuScreen);
});

withdrawBackButton.addEventListener('click', () => {
    showScreen(menuScreen);
});

depositBackButton.addEventListener('click', () => {
    showScreen(menuScreen);
});

changePinBackButton.addEventListener('click', () => {
    showScreen(menuScreen);
});

historyBackButton.addEventListener('click', () => {
    showScreen(menuScreen);
});

// Montos rápidos
quickAmounts.forEach(button => {
    button.addEventListener('click', () => {
        const amount = button.dataset.amount;
        if (withdrawAmount) {
            withdrawAmount.value = amount;
        }
        if (depositAmount) {
            depositAmount.value = amount;
        }
    });
});

// Retirar dinero
withdrawConfirmButton.addEventListener('click', () => {
    const amount = parseFloat(withdrawAmount.value);
    
    if (isNaN(amount)) {
        withdrawError.textContent = 'Ingrese un monto válido';
        return;
    }

    if (amount <= 0) {
        withdrawError.textContent = 'El monto debe ser positivo';
        return;
    }
    
    if (amount > currentUser.balance) {
        withdrawError.textContent = 'Saldo insuficiente';
        return;
    }
    
    currentUser.balance -= amount;
    addTransaction('withdrawal', amount);
    localStorage.setItem('atmUser', JSON.stringify(currentUser));
    
    showScreen(menuScreen);
    updateBalanceDisplay();
});

// Depositar dinero
depositConfirmButton.addEventListener('click', () => {
    const amount = parseFloat(depositAmount.value);
    
    if (isNaN(amount)) {
        depositError.textContent = 'Ingrese un monto válido';
        return;
    }
    
    if (amount <= 0) {
        depositError.textContent = 'El monto debe ser positivo';
        return;
    }
    
    currentUser.balance += amount;
    addTransaction('deposit', amount);
    localStorage.setItem('atmUser', JSON.stringify(currentUser));
    
    showScreen(menuScreen);
    updateBalanceDisplay();
});

// Cambiar PIN
changePinConfirmButton.addEventListener('click', () => {
    const newPin = newPinInput.value;
    const confirmPin = confirmNewPinInput.value;
    
    if (newPin.length !== 4 || confirmPin.length !== 4) {
        changePinError.textContent = 'El PIN debe tener 4 dígitos';
        return;
    }
    
    if (newPin !== confirmPin) {
        changePinError.textContent = 'Los PINs no coinciden';
        return;
    }
    
    if (!/^\d+$/.test(newPin)) {
        changePinError.textContent = 'El PIN solo puede contener números';
        return;
    }
    
    currentUser.pin = newPin;
    localStorage.setItem('atmUser', JSON.stringify(currentUser));
    
    changePinError.textContent = '';
    changePinError.style.color = '#2ecc71';
    changePinError.textContent = 'PIN cambiado exitosamente';
    
    setTimeout(() => {
        showScreen(menuScreen);
    }, 1500);
});

// Inicialización
updateBalanceDisplay();
showScreen(pinScreen);