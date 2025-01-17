var reconnectDelay = 5000; // Интервал между попытками переподключения (мс)
        var isReconnecting = false;
        var stompClient = null;
        var decisionInterval = null;

// Вызов функции получения героя при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {

    showLoadingIndicator();
    getHeroOwn();
    hideLoadingIndicator();

    // Обработчик клика для получения случайного события
    document.getElementById('getEvent').addEventListener('click', async () => {
    if(stompClient === null){
            // Подключение по веб-сокету
            await connect();
            }
    });
});

// Закрытие WebSocket соединения при уходе со страницы
    window.addEventListener('beforeunload', async () => {
        try {
            await disconnect();
        } catch (error) {
            console.error('Error during WebSocket disconnect:', error);
        }
    });

async function disconnect() {
    if (stompClient !== null) {
    const allTextContainers = document.querySelectorAll('.text-container');
            allTextContainers.forEach(container => {
                // Выбираем все <p> внутри текущего контейнера
                const paragraphs = container.querySelectorAll('p');

                // Удаляем каждый <p> элемент
                paragraphs.forEach(paragraph => {
                    paragraph.remove();
                });
            });
    document.getElementById('textContainer').innerHTML += '<p>Disconnected</p>';
        stompClient.disconnect(() => {
                console.log("Disconnected");
                stompClient = null;
        });
    }
}

async function connect() {
    console.log('Attempting to connect to WebSocket...');
    var socket = new SockJS('http://localhost:8765/ws');
    stompClient = Stomp.over(socket);

    var token = await checkAndRefreshAccessToken();

    stompClient.connect({ "Authorization": "Bearer " + token }, function (frame) {
        console.log('Connected: ' + frame);
        const allTextContainers = document.querySelectorAll('.text-container');
        allTextContainers.forEach(container => {
            // Выбираем все <p> внутри текущего контейнера
            const paragraphs = container.querySelectorAll('p');

            // Удаляем каждый <p> элемент
            paragraphs.forEach(paragraph => {
                paragraph.remove();
            });
        });
        document.getElementById('textContainer').innerHTML += '<p>Connected: ' + frame + '</p>';

        // Сбрасываем флаг переподключения
        isReconnecting = false;

        if (stompClient && stompClient.connected) {
                        console.log('Sending random event request');
                        stompClient.send("/app/random-event", {});

                        // Показать контейнер с прогресс-баром
                        const progressBarContainer = document.getElementById('progressBarContainer');
                        progressBarContainer.style.display = 'block';

                        // Создать полоску прогресса
                        const progressBar = document.createElement('div');
                        progressBar.classList.add('progress-bar');
                        progressBarContainer.appendChild(progressBar);

                        // Сбросить полоску прогресса
                        progressBar.style.width = '0%';

                        // Анимация заполнения полоски
                        let startTime = Date.now();
                        const duration = 30000; // 30 секунд
                        const animateProgress = () => {
                            const elapsedTime = Date.now() - startTime;
                            const progress = Math.min((elapsedTime / duration) * 100, 100);
                            progressBar.style.width = `${progress}%`;

                            if (progress < 100) {
                                requestAnimationFrame(animateProgress);
                            }
                        };
                        animateProgress();
                    } else {
                        console.log('Not connected');
                        document.getElementById('textContainer').innerHTML += '<p><strong>Not connected, refresh page, please</strong></p>';
                    }

        // Подписываемся на сообщения
        stompClient.subscribe('/user/topic/event', function (message) {
            try {
                // Парсим сообщение
                const parsedMessage = JSON.parse(message.body);

                const eventTitle = parsedMessage.title || parsedMessage.eventTitle || "Неизвестное событие";
                const eventDescription = parsedMessage.description || parsedMessage.resultDescr || "Описание отсутствует";
                const decisions = parsedMessage.decisions || null;

                console.log("Event Title: " + eventTitle);
                console.log("Event Description: " + eventDescription);
                console.log("Event Decisions: " + decisions);

                const logContainer = document.getElementById('decisionLogContainer');
                const progressBarContainer = document.getElementById('progressBarContainer');
                const allButtons = document.querySelectorAll('.decision-button');

                const now = new Date();
                                const formattedTime = now.toLocaleString('ru-RU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                });

                if (parsedMessage.resultDescr) {
                    disconnect();
                    // Очищаем содержимое контейнера для лога
                    const decisionLogContainer = document.querySelector("#decisionLogContainer");
                    decisionLogContainer.innerHTML = '';
                    logContainer.style.display = 'none';

                    // Очищаем содержимое контейнера для полоски прогресса
                    const barContainer = document.querySelector("#progressBarContainer");
                    barContainer.innerHTML = '';
                    progressBarContainer.style.display = 'none';

                    // Удаляем все кнопки с классом .decision-button
                    allButtons.forEach(button => {
                        button.remove(); // Удаляем кнопку из DOM
                    });

                    const decisionDescription = parsedMessage.decisionDescr || "Описание отсутствует";
                    const descriptionContainer = document.createElement('div');
                    descriptionContainer.className = 'event-description-container';
                    descriptionContainer.innerHTML = `<p>${decisionDescription}</p>`;
                    const messageContainer = document.createElement('div');
                    messageContainer.className = 'message';
                    const messagesContainer = document.getElementById('messageContainer');
                    const timestampContainer = document.createElement('div');
                    timestampContainer.className = 'event-timestamp';
                    timestampContainer.innerHTML = `<p>Получено: ${formattedTime}</p>`;
                    const titleContainer = document.createElement('div');
                    titleContainer.className = 'event-title-container';
                    titleContainer.innerHTML = `<p><strong>${eventTitle}</strong></p>`;
                    const noteContainer = document.createElement('div');
                    // Создаем карту для замены
                    const decisionTypeMap = {
                        STR: "Силы",
                        DEX: "Ловкости",
                        CON: "Телосложения",
                        INT: "Интеллекта",
                        WIS: "Мудрости",
                        CHA: "Харизмы",
                        TEXT: "Без проверки"
                    };
                    const decisionType = decisionTypeMap[parsedMessage.decisionType] || parsedMessage.decisionType;
                    noteContainer.className = 'event-note';
                    noteContainer.innerHTML = `<p>Проверка ${decisionType} со сложностью ${parsedMessage.difficulty}</p>`;
                    messageContainer.appendChild(titleContainer);
                    messageContainer.appendChild(descriptionContainer);
                    messageContainer.appendChild(noteContainer);
                    messageContainer.appendChild(timestampContainer);
                    messagesContainer.prepend(messageContainer);
                }

                // Создаем элементы для нового сообщения
                const messageContainer = document.createElement('div');
                messageContainer.className = 'message';

                const titleContainer = document.createElement('div');
                titleContainer.className = 'event-title-container';
                titleContainer.innerHTML = `<p><strong>${eventTitle}</strong></p>`;

                const descriptionContainer = document.createElement('div');
                descriptionContainer.className = 'event-description-container';
                descriptionContainer.innerHTML = `<p>${eventDescription}</p>`;

                const timestampContainer = document.createElement('div');
                timestampContainer.className = 'event-timestamp';
                timestampContainer.innerHTML = `<p>Получено: ${formattedTime}</p>`;

                const secondNoteContainer = document.createElement('div');
                if (parsedMessage.resultDescr) {
                    const decisionResultMap = {
                                        true: "успех",
                                        false: "провал"
                                    };
                    const decisionResult = decisionResultMap[parsedMessage.result] || parsedMessage.result;
                    secondNoteContainer.className = 'event-note';
                    secondNoteContainer.innerHTML = `<p>Итог проверки ${parsedMessage.value}, ${decisionResult}</p>`;
                }

                // Добавляем элементы в контейнер сообщения
                messageContainer.appendChild(titleContainer);
                messageContainer.appendChild(descriptionContainer);
                if (parsedMessage.resultDescr) {
                    messageContainer.appendChild(secondNoteContainer);
                }
                messageContainer.appendChild(timestampContainer);

                // Добавляем новое сообщение в начало контейнера
                const messagesContainer = document.getElementById('messageContainer');
                messagesContainer.prepend(messageContainer);

                // Отображение кнопок решений, если они есть
                if (decisions && decisions.length > 0) {
                    shuffleArray(decisions);
                    decisions.forEach(response => {
                        const decisionDescription = response.description; // Получаем описание

                        // Создаем кнопку
                        const button = document.createElement('button');
                        button.className = 'decision-button'; // Присваиваем класс для стилизации
                        button.id = response.id;
                        button.innerHTML = decisionDescription; // Устанавливаем текст кнопки
                         console.log("Decision Log: ", response.decisionLog);

                        // Добавляем обработчик события для кнопки
                        button.addEventListener('click', () => {
                            handleDecisionClick(response.id, response.description, button, response.decisionLog);
                        });

                        // Добавляем кнопку в родительский элемент
                        messageContainer.appendChild(button);
                    });
                }

            } catch (error) {
                console.error("Failed to parse message body: ", error);
            }
        });

        stompClient.subscribe('/user/topic/error', function (message) {
           try {
                              // Парсим сообщение
                              const parsedMessage = JSON.parse(message.body);
                              displayErrors(parsedMessage);
                          } catch (error) {
                              console.error("Failed to parse message body: ", error);
                          }
        });

    }, function (error) {
        console.error('Connection error: ', error);
        document.getElementById('message').innerHTML += '<p>Connection error: ' + error + '</p>';
        scheduleReconnect();
    });
}

    function scheduleReconnect() {
        if (isReconnecting) return;

        isReconnecting = true;
        console.log(`Reconnecting in ${reconnectDelay / 1000} seconds...`);
        setTimeout(() => {
            connect();
        }, reconnectDelay);
    }

    // Функция для перемешивания массива
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]; // Меняем местами
            }
        }

        function handleDecisionClick(decisionId, description, clickedButton, decisionLog) {
            console.log('Decision clicked:', decisionId, description, decisionLog);

            if (stompClient && stompClient.connected) {
                console.log('Sending user decision: ' + decisionId + ', ' + description);
                stompClient.send("/app/choose-decision", {}, decisionId);
                clickedButton.disabled = true;

                // Скрыть все остальные кнопки с классом decision-button
                const allButtons = document.querySelectorAll('.decision-button');
                allButtons.forEach(button => {
                    if (button !== clickedButton) {
                        button.style.display = 'none';
                        button.disabled = true;
                    }
                });

                const parts = decisionLog.slice(1, -1).split(",").map(part => part.trim());

                // Если `decisionLog` не пустой, отображаем одно случайное сообщение
                if (Array.isArray(parts) && parts.length > 0) {
                        console.log("Decision Log: ", parts);

                        // Найти контейнер для сообщений
                        const logContainer = document.getElementById('decisionLogContainer');

                        if (!logContainer) {
                            console.error("Adventure container not found!");
                            return;
                        }

                        // Показываем контейнер
                        logContainer.style.display = 'block';

                        // Добавляем заголовок
                        const logTitle = document.createElement('p');
                        logContainer.appendChild(logTitle);

                        // Добавляем элемент для отображения сообщения
                        const logMessage = document.createElement('p');
                        logContainer.appendChild(logMessage);

                        // Функция для обновления сообщения
                        const updateMessage = () => {
                            // Проверка массива перед выбором
                            if (parts.length === 0) {
                                logMessage.textContent = "No entries available.";
                                return;
                            }

                            // Выбираем случайное сообщение
                            const randomIndex = Math.floor(Math.random() * parts.length);
                            const randomEntry = parts[randomIndex]; // Объявление randomEntry здесь

                            // Обновляем текст
                            logMessage.textContent = randomEntry;
                        };

                        // Обновляем сообщение каждые 5 секунд
                        updateMessage(); // Показываем первое сообщение сразу
                        setInterval(updateMessage, 5000);
                    } else {
                    console.error("decisionLog is not an array or is empty:", parts);
                }

            } else {
                console.log('Not connected');
            }
        }


async function getHeroOwn() {
    const accessToken = await checkAndRefreshAccessToken();
    showLoadingIndicator();
    try {
        const response = await fetch('/api/hero', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
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
        }
    } catch (error) {
        hideLoadingIndicator();
        console.error('Ошибка сети или сервера:', error);
        alert('Произошла ошибка при соединении с сервером.');
    }
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

function showLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'flex';
}

function hideLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'none';
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

// Функция для отображения успешного ответа
function displaySuccess(heroResponse) {
    document.getElementById('name').innerText = heroResponse.name;
    document.getElementById('lastname').innerText = heroResponse.lastname;
    document.getElementById('str').innerText = heroResponse.str;
    document.getElementById('dex').innerText = heroResponse.dex;
    document.getElementById('con').innerText = heroResponse.con;
    document.getElementById('intl').innerText = heroResponse.intl;
    document.getElementById('wis').innerText = heroResponse.wis;
    document.getElementById('cha').innerText = heroResponse.cha;
}