// Функция для отправки запроса на вход пользователя
async function loginUser (login, password) {
    const userDto = { login, password };
    showLoadingIndicator();
    const errors = validateFields(login, password);
    if (errors.length > 0) {
        hideLoadingIndicator();
        errors.forEach(error => displayFieldError(error.field, error.message));
        return;
    }
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userDto)
        });

        const responseBody = await response.json();
        hideLoadingIndicator();
        if (!response.ok) {
            if (responseBody.exceptions) {
                displayErrors(responseBody);
            } else {
                handleGenericError(response, responseBody);
            }
        } else {
            // В теле ответа находятся токены, их нужно сохранить безопасно
            const { accessToken, refreshToken } = responseBody;

            // Сохранение токенов в localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Отображение успешного входа
            displaySuccess(responseBody);
        }
    } catch (error) {
        hideLoadingIndicator();
        console.error('Ошибка сети или сервера:', error);
        alert('Произошла ошибка при соединении с сервером.');
    }
}

function displayErrors(errorResponse) {
    // Очистить старые сообщения об ошибках
    clearErrors();

    let errorMessage = 'Произошли ошибки:\n';
    if (errorResponse.exceptions) {
        errorResponse.exceptions.forEach(error => {
            if (error.exception === 'BindingValidationException' && error.field) {
                displayFieldError(error.field, error.descr);
            } else {
            console.error('Ошибка сети или сервера:', error);
                errorMessage += `\nОшибка: ${error.exception}\nПоле: ${error.field}\nОписание: ${error.descr}`;
            }
        });
    }

    // Отображаем общее сообщение об ошибке, если оно есть
    if (errorMessage !== 'Произошли ошибки:\n') {
        alert(errorMessage);
    }
}

// Функция для отображения успешного входа
function displaySuccess(user) {
    const message = `Добро пожаловать!`;
    alert(message);
    clearErrors();
}

// Функция для очистки всех сообщений об ошибках
function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(element => {
        element.innerHTML = ''; // Очищаем содержимое элемента
        element.style.display = 'none';
    });
}

// Обработчик для формы входа
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const login = document.getElementById('login').value;
            const password = document.getElementById('password').value;

            await loginUser (login, password);
        });
    }
});

// Функции для управления индикатором загрузки
function showLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'flex';
}

function hideLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

// Функция для валидации полей
function validateFields(login, password) {
    const errors = [];
    const loginRegex = /^[a-zA-Z0-9_@.-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

    // Очистить старые сообщения об ошибках
    clearErrors();

    // Валидация логина
    if (login.length < 4 || login.length > 255) {
        errors.push({ field: 'login', message: 'Логин должен содержать от 4 до 255 символов' });
    }
    if (!loginRegex.test(login)) {
        errors.push({ field: 'login', message: 'Логин может содержать только латинские буквы, цифры и символы (_@.-)' });
    }
    if (!emailRegex.test(login)) {
        errors.push({ field: 'login', message: 'Введите корректный email-адрес' });
    }

    // Валидация пароля
    if (password.length < 8 || password.length > 255) {
        errors.push({ field: 'password', message: 'Пароль должен содержать от 8 до 255 символов' });
    }
    if (!passwordRegex.test(password)) {
        errors.push({ field: 'password', message: 'Пароль должен содержать заглавные и строчные латинские буквы, цифры и специальные символы (@, $, !, %, *, ?, &)' });
    }

    return errors;
}

// Функция для отображения ошибки под соответствующим полем
function displayFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    if (errorElement) {
        // Добавляем новое сообщение об ошибке в существующий список
        const errorItem = document.createElement('div');
        errorItem.textContent = message;
        errorElement.appendChild(errorItem);
        errorElement.style.display = 'block';
    }
}