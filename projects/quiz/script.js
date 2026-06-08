const questionBank = [
  {
    mode: "web",
    question: "Tag HTML mana yang paling tepat untuk navigasi utama?",
    answers: ["<section>", "<nav>", "<aside>", "<main>"],
    correct: 1,
    note: "<nav> dipakai untuk kumpulan link navigasi utama atau penting."
  },
  {
    mode: "web",
    question: "Properti CSS untuk membuat layout dua kolom fleksibel adalah...",
    answers: ["display: grid", "font-style", "text-wrap", "object-fit"],
    correct: 0,
    note: "CSS Grid cocok untuk layout dua dimensi seperti baris dan kolom."
  },
  {
    mode: "web",
    question: "Method JavaScript untuk mengubah array menjadi satu nilai adalah...",
    answers: ["map()", "filter()", "reduce()", "slice()"],
    correct: 2,
    note: "reduce() mengakumulasi item array menjadi satu hasil akhir."
  },
  {
    mode: "web",
    question: "Atribut yang membantu pembaca layar memahami tombol ikon adalah...",
    answers: ["aria-label", "data-key", "target", "rel"],
    correct: 0,
    note: "aria-label memberi nama aksesibel ketika teks visual tidak tersedia."
  },
  {
    mode: "logic",
    question: "Jika 2, 6, 12, 20, maka angka berikutnya adalah...",
    answers: ["28", "30", "32", "36"],
    correct: 1,
    note: "Selisihnya +4, +6, +8, jadi berikutnya +10 menjadi 30."
  },
  {
    mode: "logic",
    question: "Semua K adalah L. Sebagian L adalah M. Kesimpulan yang pasti benar?",
    answers: ["Semua K adalah M", "Sebagian M adalah K", "Semua M adalah L", "Tidak ada yang pasti"],
    correct: 3,
    note: "Relasi sebagian L ke M tidak menjamin K ikut berada di M."
  },
  {
    mode: "logic",
    question: "Mana yang berbeda dari kelompok ini?",
    answers: ["Segitiga", "Persegi", "Lingkaran", "Kubus"],
    correct: 3,
    note: "Kubus adalah bangun ruang, sedangkan lainnya bangun datar."
  },
  {
    mode: "logic",
    question: "Jika A=1, C=3, F=6, J=10, maka huruf berikutnya adalah...",
    answers: ["M", "N", "O", "P"],
    correct: 2,
    note: "Posisi huruf bertambah +2, +3, +4, jadi berikutnya +5: O."
  },
  {
    mode: "general",
    question: "Planet terdekat dari Matahari adalah...",
    answers: ["Venus", "Mars", "Merkurius", "Bumi"],
    correct: 2,
    note: "Merkurius adalah planet terdekat dari Matahari."
  },
  {
    mode: "general",
    question: "Satuan dasar untuk kuat arus listrik adalah...",
    answers: ["Volt", "Ampere", "Ohm", "Watt"],
    correct: 1,
    note: "Ampere adalah satuan SI untuk kuat arus listrik."
  },
  {
    mode: "general",
    question: "Ibukota provinsi Jawa Barat adalah...",
    answers: ["Bandung", "Bogor", "Cirebon", "Tasikmalaya"],
    correct: 0,
    note: "Bandung adalah ibukota Provinsi Jawa Barat."
  },
  {
    mode: "general",
    question: "Kata baku dari 'resiko' adalah...",
    answers: ["Resiko", "Risiko", "Risikho", "Risyiko"],
    correct: 1,
    note: "Bentuk baku dalam KBBI adalah risiko."
  }
];

const state = {
  mode: "mix",
  questions: [],
  index: 0,
  score: 0,
  selected: null,
  history: [],
  timeLeft: 60,
  timerId: null
};

const els = {
  start: document.querySelector("#start-screen"),
  quiz: document.querySelector("#quiz-screen"),
  result: document.querySelector("#result-screen"),
  bestScore: document.querySelector("#best-score"),
  questionTotal: document.querySelector("#question-total"),
  modeCards: document.querySelectorAll(".mode-card"),
  startBtn: document.querySelector("#start-btn"),
  homeBtn: document.querySelector("#home-btn"),
  retryBtn: document.querySelector("#retry-btn"),
  currentMode: document.querySelector("#current-mode"),
  questionTitle: document.querySelector("#question-title"),
  timerText: document.querySelector("#timer-text"),
  timer: document.querySelector(".timer"),
  progressFill: document.querySelector("#progress-fill"),
  answerList: document.querySelector("#answer-list"),
  liveScore: document.querySelector("#live-score"),
  nextBtn: document.querySelector("#next-btn"),
  resultTitle: document.querySelector("#result-title"),
  finalScore: document.querySelector("#final-score"),
  resultMessage: document.querySelector("#result-message"),
  reviewList: document.querySelector("#review-list")
};

function getBestScore() {
  return Number(localStorage.getItem("quiz-lab-best") || 0);
}

function setBestScore(score) {
  if (score > getBestScore()) {
    localStorage.setItem("quiz-lab-best", String(score));
  }
  els.bestScore.textContent = `Best: ${getBestScore()}`;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getModeQuestions(mode) {
  if (mode === "mix") return shuffle(questionBank).slice(0, 10);
  return shuffle(questionBank.filter((item) => item.mode === mode)).slice(0, 4);
}

function showScreen(name) {
  [els.start, els.quiz, els.result].forEach((screen) => screen.classList.remove("screen-active"));
  els[name].classList.add("screen-active");
}

function updateHeaderCount() {
  const total = state.mode === "mix" ? 10 : 4;
  els.questionTotal.textContent = `${total} soal`;
}

function selectMode(mode) {
  state.mode = mode;
  els.modeCards.forEach((card) => {
    const active = card.dataset.mode === mode;
    card.classList.toggle("selected", active);
    card.setAttribute("aria-checked", String(active));
  });
  updateHeaderCount();
}

function startQuiz() {
  state.questions = getModeQuestions(state.mode);
  state.index = 0;
  state.score = 0;
  state.selected = null;
  state.history = [];
  state.timeLeft = state.mode === "mix" ? 90 : 45;
  els.currentMode.textContent = state.mode === "mix" ? "Campuran" : state.mode === "web" ? "Web Dasar" : "Logika";
  els.liveScore.textContent = "0";
  showScreen("quiz");
  renderQuestion();
  startTimer();
}

function startTimer() {
  window.clearInterval(state.timerId);
  renderTimer();
  state.timerId = window.setInterval(() => {
    state.timeLeft -= 1;
    renderTimer();
    if (state.timeLeft <= 0) finishQuiz();
  }, 1000);
}

function renderTimer() {
  els.timerText.textContent = String(Math.max(state.timeLeft, 0));
  els.timer.classList.toggle("low", state.timeLeft <= 12);
}

function renderQuestion() {
  const current = state.questions[state.index];
  state.selected = null;
  els.nextBtn.disabled = true;
  els.questionTitle.textContent = current.question;
  els.progressFill.style.width = `${(state.index / state.questions.length) * 100}%`;
  els.answerList.innerHTML = "";

  current.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.type = "button";
    const marker = document.createElement("span");
    marker.className = "answer-index";
    marker.textContent = String.fromCharCode(65 + index);
    const label = document.createElement("span");
    label.textContent = answer;
    button.append(marker, label);
    button.addEventListener("click", () => chooseAnswer(index));
    els.answerList.appendChild(button);
  });
}

function chooseAnswer(answerIndex) {
  if (state.selected !== null) return;

  const current = state.questions[state.index];
  const isCorrect = answerIndex === current.correct;
  state.selected = answerIndex;

  if (isCorrect) {
    state.score += 10;
    els.liveScore.textContent = String(state.score);
  }

  state.history.push({
    question: current.question,
    chosen: current.answers[answerIndex],
    correct: current.answers[current.correct],
    isCorrect,
    note: current.note
  });

  [...els.answerList.children].forEach((button, index) => {
    button.disabled = true;
    if (index === current.correct) button.classList.add("correct");
    if (index === answerIndex && !isCorrect) button.classList.add("wrong");
  });

  els.nextBtn.disabled = false;
}

function nextQuestion() {
  if (state.selected === null) return;
  state.index += 1;

  if (state.index >= state.questions.length) {
    finishQuiz();
    return;
  }

  renderQuestion();
}

function finishQuiz() {
  window.clearInterval(state.timerId);
  const maxScore = state.questions.length * 10;
  const percent = Math.round((state.score / maxScore) * 100);
  setBestScore(percent);
  els.finalScore.textContent = String(percent);
  els.resultTitle.textContent = percent >= 80 ? "Tajam." : percent >= 60 ? "Lumayan." : "Pemanasan dulu.";
  els.resultMessage.textContent = `${state.history.filter((item) => item.isCorrect).length} dari ${state.questions.length} jawaban benar.`;
  renderReview();
  showScreen("result");
}

function renderReview() {
  els.reviewList.innerHTML = "";
  state.history.forEach((item, index) => {
    const review = document.createElement("article");
    review.className = "review-item";
    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${item.question}`;
    const meta = document.createElement("div");
    meta.className = "review-meta";

    const status = document.createElement("span");
    status.className = item.isCorrect ? "ok" : "no";
    status.textContent = item.isCorrect ? "Benar" : "Belum tepat";

    const chosen = document.createElement("span");
    chosen.textContent = `Jawabanmu: ${item.chosen}`;

    const correct = document.createElement("span");
    correct.textContent = `Kunci: ${item.correct}`;

    const note = document.createElement("p");
    note.textContent = item.note;

    meta.append(status, chosen, correct);
    review.append(title, meta, note);
    els.reviewList.appendChild(review);
  });
}

els.modeCards.forEach((card) => {
  card.addEventListener("click", () => selectMode(card.dataset.mode));
});

els.startBtn.addEventListener("click", startQuiz);
els.nextBtn.addEventListener("click", nextQuestion);
els.retryBtn.addEventListener("click", startQuiz);
els.homeBtn.addEventListener("click", () => {
  window.clearInterval(state.timerId);
  showScreen("start");
});

document.addEventListener("keydown", (event) => {
  if (!els.quiz.classList.contains("screen-active")) return;
  const keyIndex = Number(event.key) - 1;
  if (keyIndex >= 0 && keyIndex < 4) chooseAnswer(keyIndex);
  if (event.key === "Enter" && !els.nextBtn.disabled) nextQuestion();
});

setBestScore(0);
updateHeaderCount();
