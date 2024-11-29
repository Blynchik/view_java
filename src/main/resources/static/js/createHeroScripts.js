// Обработчик для формы создания
document.addEventListener('DOMContentLoaded', function () {
    const heroForm = document.getElementById('heroForm');
    const pointsDisplay = document.getElementById('points');
    const strInput = document.getElementById('str');
    const dexInput = document.getElementById('dex');
    const conInput = document.getElementById('con');
    const intlInput = document.getElementById('intl');
    const wisInput = document.getElementById('wis');
    const chaInput = document.getElementById('cha');

    if (heroForm) {
        heroForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const lastname = document.getElementById('lastname').value;
            const str = strInput.value;
            const dex = dexInput.value;
            const con = conInput.value;
            const intl = intlInput.value;
            const wis = wisInput.value;
            const cha = chaInput.value;

            await createHero(name, lastname, str, dex, con, intl, wis, cha);
        });

        function updatePointsDisplay() {
            const totalSpentPoints =
                (parseInt(strInput.value) || 0) +
                (parseInt(dexInput.value) || 0) +
                (parseInt(conInput.value) || 0) +
                (parseInt(intlInput.value) || 0) +
                (parseInt(wisInput.value) || 0) +
                (parseInt(chaInput.value) || 0);

            const initialPoints = 600; // Начальное количество очков
            const remainingPoints = initialPoints - totalSpentPoints;

            // Обновляем отображение очков
            pointsDisplay.textContent = remainingPoints;
            console.log(`Total Spent Points: ${totalSpentPoints}, Remaining Points: ${remainingPoints}`); // Отладочная информация
        }

        // Обработчики изменения значений характеристик
        const inputs = [strInput, dexInput, conInput, intlInput, wisInput, chaInput];
        inputs.forEach(input => {
            input.addEventListener('input', function () {
                const currentValue = parseInt(this.dataset.previousValue) || 0; // Получаем предыдущее значение
                const newValue = parseInt(this.value) || 0;

                // Обновляем значение характеристик
                if (newValue >= 0) {
                    this.value = newValue;
                } else {
                    this.value = 0; // Устанавливаем 0, если значение отрицательное
                }

                // Обновляем отображение очков
                updatePointsDisplay();

                // Сохраняем новое значение как предыдущее для следующего изменения
                this.dataset.previousValue = this.value;
            });
        });

        // Инициализируем предыдущее значение для каждой характеристики
        inputs.forEach(input => {
            input.dataset.previousValue = input.value;
        });

        // Инициализируем отображение очков при загрузке страницы
        updatePointsDisplay();
    }
});

async function createHero(name, lastname, str, dex, con, intl, wis, cha) {
    const heroRequest = { name, lastname, str, dex, con, intl, wis, cha };
    const accessToken = await checkAndRefreshAccessToken();
    showLoadingIndicator();
    const errors = validateFields(heroRequest);
    if (errors.length > 0) {
        hideLoadingIndicator();
        errors.forEach(error => displayFieldError(error.field, error.message));
        return;
    }
    try {
        const response = await fetch('/api/hero', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(heroRequest)
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
            displaySuccess(responseBody);
            window.location.href = 'hero.html';
        }
    } catch (error) {
        hideLoadingIndicator();
        console.error('Ошибка сети или сервера:', error);
        alert('Произошла ошибка при соединении с сервером.');
    }
}

function showLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'flex';
}

function hideLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

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

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(element => {
        element.innerHTML = ''; // Очищаем содержимое элемента
        element.style.display = 'none';
    });
}

function displaySuccess(heroResponse) {
    const message = `Герой создан! + heroResponse`;
    alert(message);
    clearErrors();
}

// Функция для валидации полей HeroRequest
function validateFields(heroRequest) {
    const errors = [];

    // Очистить старые сообщения об ошибках
    clearErrors();

    // Валидация имени
    if (!heroRequest.name || heroRequest.name.length < 1 || heroRequest.name.length > 100) {
        errors.push({ field: 'name', message: "Имя героя должно состоять как минимум из одного символа и содержать не более 100 символов" });
    } else if (!/^[a-zA-Zа-яА-Я]+$/.test(heroRequest.name)) {
        errors.push({ field: 'name', message: "Имя героя может состоять только из букв русского или латинского алфавита" });
    }

    // Валидация фамилии
    if (!heroRequest.lastname || heroRequest.lastname.length < 1 || heroRequest.lastname.length > 100) {
        errors.push({ field: 'lastname', message: "Фамилия героя должна состоять как минимум из одного символа и не превышать 100 знаков" });
    } else if (!/^[a-zA-Zа-яА-Я]+$/.test(heroRequest.lastname)) {
        errors.push({ field: 'lastname', message: "Фамилия героя может состоять только из букв русского или латинского алфавита" });
    }

    // Валидация силы
    validateStat('str', heroRequest.str, 70, 180, errors);

    // Валидация ловкости
    validateStat('dex', heroRequest.dex, 70, 180, errors);

    // Валидация телосложения
    validateStat('con', heroRequest.con, 70, 180, errors);

    // Валидация интеллекта
    validateStat('intl', heroRequest.intl, 70, 180, errors);

    // Валидация мудрости
    validateStat('wis', heroRequest.wis, 70, 180, errors);

    // Валидация харизмы
    validateStat('cha', heroRequest.cha, 70, 180, errors);

    return errors;
}

// Вспомогательная функция для валидации числовых характеристик
function validateStat(field, value, min, max, errors) {
    if (value == null) {
        errors.push({ field: field, message: `Должно быть указано и не может пустым` });
    } else if (value < min || value > max) {
        errors.push({ field: field, message: `Должно быть между ${min} и ${max}` });
    }
}

// Вспомогательная функция для капитализации первой буквы поля
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Функция для проверки срока действия токена
async function checkAndRefreshAccessToken() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // Проверяем, существует ли accessToken и его срок действия
    if (!accessToken || !refreshToken || isTokenExpired(accessToken)) {
        if (!isTokenExpired(refreshToken)) {
            // Если access токен истек, отправляем запрос на обновление
            try {
                const response = await fetch('/api/auth/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                });

                if (!response.ok) {
                    // Если refresh токен тоже истек, перенаправляем на страницу входа
                    alert('Сессия истекла. Пожалуйста, войдите снова.');
                    window.location.href = 'login.html';
                    return null;
                }

                const responseBody = await response.json();
                const newAccessToken = responseBody.accessToken;

                // Сохраняем новый access токен
                localStorage.setItem('accessToken', newAccessToken);
                return newAccessToken;
            } catch (error) {
                console.error('Ошибка при обновлении токена:', error);
                alert('Произошла ошибка при обновлении токена.');
                return null;
            }
        } else {
            // Если refresh токен тоже истек, перенаправляем на страницу входа
            alert('Сессия истекла. Пожалуйста, войдите снова.');
            window.location.href = 'login.html'; // Перенаправление на страницу входа
            return null;
        }
    }

    return accessToken; // Возвращаем текущий access токен, если он действителен
}

// Функция для проверки срока действия токена (пример)
function isTokenExpired(token) {
    if (!token) return true;
    try {
        // Раскодируем payload токена (обычно это вторая часть JWT)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const { exp } = JSON.parse(jsonPayload); // exp — время истечения токена в формате UNIX
        const currentTime = Math.floor(Date.now() / 1000); // Текущее время в формате UNIX

        return currentTime >= exp; // Если текущая дата больше или равна exp, токен истек
    } catch (error) {
        console.error('Ошибка при проверке истечения токена:', error);
        return true; // Если произошла ошибка, считаем, что токен истек
    }
}

// Пример функции для отправки защищенного запроса
async function sendProtectedRequest(url, options) {
    // Проверяем и обновляем access токен, если это необходимо
    const accessToken = await checkAndRefreshAccessToken();

    if (!accessToken) {
        // Если не удалось получить access токен, завершить выполнение
        return;
    }

    // Добавляем access токен в заголовки запроса
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
    };

    // Отправляем защищенный запрос
    const response = await fetch(url, options);
    return response.json(); // Возвращаем ответ
}