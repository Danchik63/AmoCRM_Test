// Отслеживание времени на сайте
        let timeOnSite = 0;
        let isEngaged = false;
        const startTime = Date.now();

        // Обновление счетчика каждую секунду
        const timerInterval = setInterval(() => {
            timeOnSite = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById('timeCounter').textContent = timeOnSite;

            // Если пользователь провел больше 30 секунд
            if (timeOnSite > 30 && !isEngaged) {
                isEngaged = true;
                const badge = document.getElementById('timeBadge');
                badge.classList.add('engaged');
                badge.innerHTML = '✓ Время на сайте: <span id="timeCounter">' + timeOnSite + '</span> сек';
            }
        }, 1000);

        // Валидация формы
        const form = document.getElementById('leadForm');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const priceInput = document.getElementById('price');

        // Функция валидации email
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        // Функция валидации телефона (базовая)
        function validatePhone(phone) {
            // Удаляем все нецифровые символы для проверки
            const digitsOnly = phone.replace(/\D/g, '');
            return digitsOnly.length === 11; // Ожидаем 11 цифр (8XXXXXXXXXX)
        }

        // Функция форматирования телефона
        function formatPhone(value) {
            // Удаляем все нецифровые символы
            const digits = value.replace(/\D/g, '');
            
            // Ограничиваем длину до 11 цифр
            const limitedDigits = digits.slice(0, 11);
            
            // Применяем маску 8 (XXX) XXX-XX-XX
            let formatted = '';
            
            if (limitedDigits.length > 0) {
                formatted = limitedDigits[0]; // Первая цифра (8)
            }
            if (limitedDigits.length > 1) {
                formatted += ' (' + limitedDigits.slice(1, 4); // (XXX
            }
            if (limitedDigits.length >= 4) {
                formatted += ') ' + limitedDigits.slice(4, 7); // ) XXX
            }
            if (limitedDigits.length >= 7) {
                formatted += '-' + limitedDigits.slice(7, 9); // -XX
            }
            if (limitedDigits.length >= 9) {
                formatted += '-' + limitedDigits.slice(9, 11); // -XX
            }
            
            return formatted;
        }

        // Функция показа ошибки
        function showError(input, errorId) {
            input.classList.add('error');
            document.getElementById(errorId).classList.add('show');
        }

        // Функция скрытия ошибки
        function hideError(input, errorId) {
            input.classList.remove('error');
            document.getElementById(errorId).classList.remove('show');
        }

        // Валидация при вводе
        nameInput.addEventListener('input', () => {
            if (nameInput.value.trim()) {
                hideError(nameInput, 'nameError');
            }
        });

        emailInput.addEventListener('input', () => {
            if (validateEmail(emailInput.value)) {
                hideError(emailInput, 'emailError');
            }
        });

        phoneInput.addEventListener('input', (e) => {
            // Сохраняем позицию курсора
            const cursorPosition = e.target.selectionStart;
            const oldLength = e.target.value.length;
            
            // Форматируем значение
            const formatted = formatPhone(e.target.value);
            e.target.value = formatted;
            
            // Восстанавливаем позицию курсора с учетом добавленных символов
            const newLength = formatted.length;
            const lengthDiff = newLength - oldLength;
            const newCursorPosition = cursorPosition + lengthDiff;
            e.target.setSelectionRange(newCursorPosition, newCursorPosition);
            
            // Валидация
            if (validatePhone(formatted)) {
                hideError(phoneInput, 'phoneError');
            }
        });

        priceInput.addEventListener('input', () => {
            if (priceInput.value && parseFloat(priceInput.value) >= 0) {
                hideError(priceInput, 'priceError');
            }
        });

        // Обработка отправки формы
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isValid = true;

            // Валидация имени
            if (!nameInput.value.trim()) {
                showError(nameInput, 'nameError');
                isValid = false;
            }

            // Валидация email
            if (!validateEmail(emailInput.value)) {
                showError(emailInput, 'emailError');
                isValid = false;
            }

            // Валидация телефона
            if (!validatePhone(phoneInput.value)) {
                showError(phoneInput, 'phoneError');
                isValid = false;
            }

            // Валидация цены
            if (!priceInput.value || parseFloat(priceInput.value) < 0) {
                showError(priceInput, 'priceError');
                isValid = false;
            }

            if (!isValid) return;

            // Подготовка данных для отправки (формат, ожидаемый сервером)
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                number: phoneInput.value.replace(/\D/g, ''), // Отправляем только цифры
                price: parseFloat(priceInput.value),
                isBeingOnTheSite: isEngaged // true если >30 секунд
            };

            // Отключение кнопки на время отправки
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Создание...';

            try {
                // Отправка на сервер
                const response = await fetch('https://amocrm.kupcow.ru', { // Замените на ваш endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                console.log(result);

                // Обработка ответа согласно статус-кодам сервера
                switch (result.status) {
                    case 200:
                        // Успешное создание сделки
                        document.getElementById('successMessage').textContent = '✓ ' + result.message;
                        document.getElementById('successMessage').classList.add('show');
                        form.reset();
                        
                        // Скрываем сообщение через 5 секунд
                        setTimeout(() => {
                            document.getElementById('successMessage').classList.remove('show');
                        }, 5000);
                        break;

                    case 400:
                        // Ошибка при обработке
                        alert('Ошибка: ' + result.message);
                        break;

                    case 401:
                        // Не авторизован
                        alert('Ошибка авторизации: ' + result.message);
                        // Можно добавить редирект на страницу входа
                        // window.location.href = '/login';
                        break;

                    default:
                        alert('Произошла неизвестная ошибка');
                }

            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при отправке формы. Попробуйте еще раз.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Создать сделку';
            }
        });

        // Очистка таймера при закрытии страницы
        window.addEventListener('beforeunload', () => {
            clearInterval(timerInterval);
        });