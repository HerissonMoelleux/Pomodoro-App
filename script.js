const POMODORO_CONFIG = {
  WORK_TIME: {
    FAST_WORK_MINUTES: 25,
    MEDIUM_WORK_MINUTES: 45
  },

  BREAK_TIME: {
    // Перерыв после окончания рабочего цикла
    FAST_BREAK_MINUTES: 5,
    MEDIUM_BREAK_MINUTES: 15,
    // Перерыв после окончания полного цикла(4 рабочих циклов)
    FAST_LONG_BREAK_MINUTES: 15,
    MEDIUM_LONG_BREAK_MINUTES: 60
  },

  MODE_TYPES: {
    WORK: 'work',
    SHORT_BREAK: 'short_break',
    LONG_BREAK: 'long_break'
  },

  TOTAL_CYCLES: 4,
  UPDATE_INTERVAL_MS: 1000
}

const TIMER_SECONDS = {
  FAST_WORK: POMODORO_CONFIG.WORK_TIME.FAST_WORK_MINUTES * 60,
  MEDIUM_WORK: POMODORO_CONFIG.WORK_TIME.MEDIUM_WORK_MINUTES * 60,

  FAST_BREAK: POMODORO_CONFIG.BREAK_TIME.FAST_BREAK_MINUTES * 60,
  MEDIUM_BREAK: POMODORO_CONFIG.BREAK_TIME.MEDIUM_BREAK_MINUTES * 60,

  FAST_LONG_BREAK: POMODORO_CONFIG.BREAK_TIME.FAST_LONG_BREAK_MINUTES * 60,
  MEDIUM_LONG_BREAK: POMODORO_CONFIG.BREAK_TIME.MEDIUM_LONG_BREAK_MINUTES * 60
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
let currentMode = POMODORO_CONFIG.MODE_TYPES.WORK; // текущий режим (работа, короткий перерыв, длинный перерыв)
let previousMode = POMODORO_CONFIG.MODE_TYPES.WORK;

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

// Обновляем текст
function updateCycleText() {
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
  originalSeconds = selectedCycle === mediumCycle
    ? TIMER_SECONDS.MEDIUM_WORK
    : TIMER_SECONDS.FAST_WORK;
  totalSeconds = originalSeconds;
  timer.textContent = formatTime(totalSeconds);


  // Сбрасываем циклы и режим работы на начальный
  currentCycle = 1;
  currentMode = POMODORO_CONFIG.MODE_TYPES.WORK;

  updateProgressBar();
  updateButtonStates();
  updateModeUI()
}

// Функция завершения цикла
function completeCycle() {
  console.log(`🍅 Завершен ${currentMode} цикл ${currentCycle}`);

  switchMode(); // Переключаем режим
  updateProgressBar(); // Обновляем прогресс-бар
  updateModeUI(); // Обновляем UI режима

  // Уведомления
  if (currentMode === POMODORO_CONFIG.MODE_TYPES.SHORT_BREAK) {
    document.title = "Время для короткого перерыва!";
  } else if (currentMode === POMODORO_CONFIG.MODE_TYPES.LONG_BREAK) {
    document.title = "Время для длинного перерыва!";
  } else {
    document.title = "Время работать!";
  }
}

// События переключения
mediumCycle.addEventListener("click", () => switchCycle(mediumCycle));
fastCycle.addEventListener("click", () => switchCycle(fastCycle));

// Запуск/возобновление таймера
start.addEventListener('click', function() {
  if (intervalId) return;

  isRunning = true;
  updateButtonStates();

  intervalId = setInterval(function() {
    totalSeconds -= 1;
    timer.textContent = formatTime(totalSeconds);

    if (totalSeconds <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      isRunning = false;

      // Завершаем цикл
      completeCycle();
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
  currentMode = POMODORO_CONFIG.MODE_TYPES.WORK; // Сброс режима!
  currentCycle = 1;

  // Устанавливаем начальное время в зависимости от выбранного режима
  const isMediumMode = mediumCycle.classList.contains('active');
  totalSeconds = isMediumMode ? TIMER_SECONDS.MEDIUM_WORK : TIMER_SECONDS.FAST_WORK;
  originalSeconds = totalSeconds;

  timer.textContent = formatTime(totalSeconds);
  document.title = "Pomodoro Tracker"; // Сброс заголовка

  updateProgressBar();
  updateModeUI();
  updateButtonStates();
});

// Меняет режим работы. Работа -> Отдых / Отдых -> Работа
function switchMode() {
  if (isRunning) return;

  const isMediumMode = mediumCycle.classList.contains('active');
  previousMode = currentMode; // Запоминаем предыдущий режим

  if (currentMode === POMODORO_CONFIG.MODE_TYPES.WORK) {
    // Завершили работу, идем на перерыв
    if (currentCycle === POMODORO_CONFIG.TOTAL_CYCLES) {
      // Последний цикл - длинный перерыв
      currentMode = POMODORO_CONFIG.MODE_TYPES.LONG_BREAK;
      totalSeconds = isMediumMode ? TIMER_SECONDS.MEDIUM_LONG_BREAK : TIMER_SECONDS.FAST_LONG_BREAK;
    } else {
      // Обычный цикл - короткий перерыв
      currentMode = POMODORO_CONFIG.MODE_TYPES.SHORT_BREAK;
      totalSeconds = isMediumMode ? TIMER_SECONDS.MEDIUM_BREAK : TIMER_SECONDS.FAST_BREAK;
    }

  } else {
    // Завершили перерыв, возвращаемся к работе
    currentMode = POMODORO_CONFIG.MODE_TYPES.WORK;

    // Управляем счетчиком циклов
    if (previousMode === POMODORO_CONFIG.MODE_TYPES.LONG_BREAK) {
      // После длинного перерыва - новая сессия
      currentCycle = 1;
    } else {
      // После короткого перерыва - следующий цикл
      currentCycle += 1;
    }

    // Время работы зависит от выбранного режима
    totalSeconds = isMediumMode ? TIMER_SECONDS.MEDIUM_WORK : TIMER_SECONDS.FAST_WORK;
  }

  originalSeconds = totalSeconds;
  timer.textContent = formatTime(totalSeconds);
}

// Отдельная функция для обновления UI режима
function updateModeUI() {
  const modeTitle = document.querySelector('.progress-bar__container h2');

  switch(currentMode) {
    case POMODORO_CONFIG.MODE_TYPES.WORK:
      modeTitle.textContent = 'Work Session';
      break;
    case POMODORO_CONFIG.MODE_TYPES.SHORT_BREAK:
      const shortBreakTime = mediumCycle.classList.contains('active') ? '15' : '5';
      modeTitle.textContent = `Short Break (${shortBreakTime} min)`;
      break;
    case POMODORO_CONFIG.MODE_TYPES.LONG_BREAK:
      const longBreakTime = mediumCycle.classList.contains('active') ? '60' : '15';
      modeTitle.textContent = `Long Break (${longBreakTime} min)`;
      break;
  }
}