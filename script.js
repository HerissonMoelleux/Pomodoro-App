/*
1. Для консистентности лучше использовать единый подход получения DOM-элементов - querySelector везде
2. Использовать объекты конфигурации
3. Разделять функции, одна функция - одна задача
*/

const POMODORO_CONFIG = {
  WORK_TIME: {
    FAST_WORK_MINUTES: 25,
    MEDIUM_WORK_MINUTES: 45
  },

  BREAK_TIME: {
    FAST_BREAK_MINUTES: 5,
    MEDIUM_BREAK_MINUTES: 15
  },

  TOTAL_CYCLES: 4,
  UPDATE_INTERVAL_MS: 1
}

const TIMER_SECONDS = {
  FAST_WORK: POMODORO_CONFIG.WORK_TIME.FAST_WORK_MINUTES * 60,
  MEDIUM_WORK: POMODORO_CONFIG.WORK_TIME.MEDIUM_WORK_MINUTES * 60,

  FAST_BREAK: POMODORO_CONFIG.BREAK_TIME.FAST_BREAK_MINUTES * 60,
  MEDIUM_BREAK: POMODORO_CONFIG.BREAK_TIME.MEDIUM_BREAK_MINUTES * 60,
}

const timer = document.querySelector('#timer');
const cycleContainer = document.querySelector('.progress-bar__container p');
const progressBars = document.querySelectorAll('.progress-bar__fill');

const fastCycle = document.querySelector('#fastCycle');
const mediumCycle = document.querySelector('#mediumCycle');

const start = document.querySelector('#start');
const pause = document.querySelector('#pause');
const reset = document.querySelector('#reset');

let totalSeconds = TIMER_SECONDS.FAST_WORK; // текущее время таймера
let originalSeconds = TIMER_SECONDS.FAST_WORK; // исходное время для сброса
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
  clearProgressBars()
  highlightCompletedCycles()
  updateCycleText();
}

function clearProgressBars() {
  // Очищаем все активные состояния
  Array.from(progressBars).forEach(item => item.classList.remove('active'));
}

function highlightCompletedCycles() {
  // Подсвечиваем завершенные циклы
  for (let i = 0; i < currentCycle; i++) {
    progressBars[i].classList.add('active');
  }
}

function updateCycleText() {
  // Обновляем текст
  cycleContainer.textContent = `Cycle ${currentCycle} of ${POMODORO_CONFIG.TOTAL_CYCLES}`;
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
  originalSeconds = selectedCycle === mediumCycle ? TIMER_SECONDS.MEDIUM_WORK : TIMER_SECONDS.FAST_WORK;
  totalSeconds = originalSeconds;
  timer.textContent = formatTime(totalSeconds);


  // Сбрасываем циклы на начало
  currentCycle = 1;

  updateProgressBar();
  updateButtonStates();
}

// Функция завершения цикла
function completeCycle() {
  console.log(`🍅 Завершен цикл ${currentCycle}`);

  // Переходим к следующему циклу
  currentCycle += 1;

  // Проверяем, не закончились ли все циклы
  if (currentCycle > POMODORO_CONFIG.TOTAL_CYCLES) {
    // Сброс на первый цикл
    currentCycle = 1;
    alert(`🎉 Поздравляем! Вы завершили полную сессию из ${POMODORO_CONFIG.TOTAL_CYCLES} циклов!`);
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
  }, POMODORO_CONFIG.UPDATE_INTERVAL_MS);
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
});
