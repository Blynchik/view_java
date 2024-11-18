// Функция для проверки срока действия токена
async function checkAndRefreshAccessToken() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // Проверяем, существует ли accessToken и его срок действия
    if (!accessToken || !refreshToken || isTokenExpired(accessToken)) {
        if(!isTokenExpired(refreshToken)) {
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
                window.location.href = '/login'; // Перенаправление на страницу входа
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
                                window.location.href = '/login'; // Перенаправление на страницу входа
                                return null;}
    }

    return accessToken; // Возвращаем текущий access токен, если он действителен
}

// Функция для проверки срока действия токена (пример)
function isTokenExpired(token) {
    // Декодируем токен и проверяем его срок действия
    const payload = JSON.parse(atob(token.split('.')[1])); // Декодирование JWT
    const exp = payload.exp; // Срок действия токена
    return Date.now() >= exp * 10000; // Проверка на истечение
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