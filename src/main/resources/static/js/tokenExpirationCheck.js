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
            window.location.href = '/login'; // Перенаправление на страницу входа
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