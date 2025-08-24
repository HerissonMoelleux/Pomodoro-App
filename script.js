const timer = document.getElementById('timer');
const cycleText = document.querySelector('.progress-bar__container p');
const progressBars = document.getElementsByClassName('progress-bar__fill');

const fastCycle = document.getElementById('fastCycle');
const mediumCycle = document.getElementById("mediumCycle");

const start = document.getElementById('start');
const pause = document.getElementById('pause');
const reset = document.getElementById('reset');

let totalSeconds = 25 * 60; // текущее время таймера
let originalSeconds = 25 * 60; // исходное время для сброса
let intervalId = null;
let isRunning = false; // состояние таймера
let currentCycle = 1; // текущий цикл (1-4)

// Функция форматирования времени
const formatTime = (totalSecs) => {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Обновление прогресс-бара и текста циклов
function updateProgressBar() {
  // Очищаем все активные состояния
  for (let i = 0; i < progressBars.length; i++) {
    progressBars[i].classList.remove('active');
  }

  // Подсвечиваем завершенные циклы
  for (let i = 0; i < currentCycle - 1; i++) {
    progressBars[i].classList.add('active');
  }

  // Обновляем текст
  cycleText.textContent = `Cycle ${currentCycle} of 4`;
}

// Обновление состояния кнопок
function updateButtonStates() {
  if (isRunning) {
    start.textContent = 'Start';
    start.disabled = true;
    pause.disabled = false;
    reset.disabled = true;

    // Блокируем переключение режимов во время работы
    fastCycle.disabled = true;
    mediumCycle.disabled = true;
  } else {
    start.textContent = totalSeconds === originalSeconds ? 'Start' : 'Resume';
    start.disabled = false;
    pause.disabled = true;
    reset.disabled = false;

    // Разблокируем переключение режимов
    fastCycle.disabled = false;
    mediumCycle.disabled = false;
  }
}

// Функция переключения циклов
function switchCycle(selectedCycle) {
  // Не переключаем во время работы таймера
  if (isRunning) return;

  // Останавливаем таймер при переключении
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
  }

  // Убираем active со всех
  fastCycle.classList.remove("active");
  mediumCycle.classList.remove("active");

  // Добавляем к выбранной
  selectedCycle.classList.add("active");

  // Устанавливаем время
  originalSeconds = selectedCycle === mediumCycle ? 45 * 60 : 25 * 60;
  totalSeconds = originalSeconds;
  timer.textContent = formatTime(totalSeconds);

  updateButtonStates();
}

// Функция завершения цикла
function completeCycle() {
  console.log(`🍅 Завершен цикл ${currentCycle}`);

  // Переходим к следующему циклу
  currentCycle += 1;

  // Проверяем, не закончились ли все циклы
  if (currentCycle > 4) {
    // Сброс на первый цикл
    currentCycle = 1;
    alert('🎉 Поздравляем! Вы завершили полную сессию из 4 циклов!');
  } else {
    alert(`🍅 Цикл завершен! Переходим к циклу ${currentCycle}`);
  }

  updateProgressBar();
}

// События переключения
mediumCycle.addEventListener("click", () => switchCycle(mediumCycle));
fastCycle.addEventListener("click", () => switchCycle(fastCycle));

// Запуск/возобновление таймера
start.addEventListener('click', function() {
  if (intervalId) return; // Предотвращаем множественный запуск

  isRunning = true;
  updateButtonStates();

  intervalId = setInterval(function() {
    totalSeconds -= 1;
    timer.textContent = formatTime(totalSeconds);

    if (totalSeconds <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      isRunning = false;

      // Завершаем текущий цикл
      completeCycle();

      // Сбрасываем на исходное время для следующего цикла
      totalSeconds = originalSeconds;
      timer.textContent = formatTime(totalSeconds);

      updateButtonStates();
    }
  }, 1);
});

// Пауза
pause.addEventListener('click', function() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    updateButtonStates();
  }
});

// Полный сброс (время + циклы)
reset.addEventListener('click', function() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  isRunning = false;
  totalSeconds = originalSeconds;
  timer.textContent = formatTime(totalSeconds);

  // Сбрасываем циклы на начало
  currentCycle = 1;
  updateProgressBar();

  updateButtonStates();

  console.log('🔄 Полный сброс: время и циклы сброшены');
});

// Инициализация
updateButtonStates();
updateProgressBar();