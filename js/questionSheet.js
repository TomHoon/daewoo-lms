const STORAGE_KEY = "question_sheet_v1";
let qSeq = 0;
let answersVisible = true;

const defaultQuestions = [
  {
    type: "객관식",
    score: 20,
    title: "다음 중 자바의 특징으로 옳지 않은 것은?",
    options: [
      "객체지향 언어이다.",
      "플랫폼 독립적이다.",
      "다중 상속을 클래스 수준에서 직접 지원한다.",
      "가비지 컬렉션을 지원한다.",
    ],
    answer: "3",
  },
  {
    type: "객관식",
    score: 20,
    title: "다음 중 인터페이스를 구현할 때 사용하는 키워드는 무엇인가?",
    options: ["extends", "implements", "instanceof", "import"],
    answer: "2",
  },
  {
    type: "주관식",
    score: 30,
    title: "오버로딩과 오버라이딩의 차이를 간단히 설명하시오.",
    options: ["", "", "", ""],
    answer:
      "오버로딩은 같은 이름의 메서드를 매개변수 형태를 달리해 정의하는 것이고, 오버라이딩은 상위 클래스 메서드를 하위 클래스에서 재정의하는 것이다.",
  },
  {
    type: "서술형",
    score: 30,
    title: "예외처리가 필요한 이유와 try-catch-finally의 역할을 설명하시오.",
    options: ["", "", "", ""],
    answer:
      "프로그램 실행 중 발생할 수 있는 오류 상황을 안전하게 처리하기 위해 필요하며, try는 예외 가능 코드, catch는 처리, finally는 예외 발생 여부와 관계없이 수행할 코드를 작성한다.",
  },
];

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createQuestion(
  q = {
    type: "객관식",
    score: 0,
    title: "",
    options: ["", "", "", ""],
    answer: "",
  },
) {
  qSeq++;
  const card = document.createElement("div");
  card.className = "question-card";
  card.innerHTML = `
    <div class="question-head">
      <div class="qcell qno">Q${qSeq}</div>
      <div class="qcell">
        <select data-field="type">
          <option ${q.type === "객관식" ? "selected" : ""}>객관식</option>
          <option ${q.type === "주관식" ? "selected" : ""}>주관식</option>
          <option ${q.type === "서술형" ? "selected" : ""}>서술형</option>
        </select>
      </div>
      <div class="qcell"><input data-field="category" placeholder="평가영역 / 분류"></div>
      <div class="qcell"><input data-field="score" type="number" min="0" value="${Number(q.score) || 0}" placeholder="배점"></div>
      <div class="qcell manage-head" style="text-align:center;font-weight:700">문항 관리</div>
    </div>

    <div class="question-body">
      <textarea data-field="title" placeholder="문제 내용을 입력하세요.">${esc(q.title)}</textarea>

      <div class="options-grid" data-role="options">
        ${[0, 1, 2, 3]
          .map(
            (i) => `
          <div class="option-item">
            <div class="option-no">${i + 1}</div>
            <input data-field="option${i + 1}" value="${esc(q.options?.[i] || "")}" placeholder="${i + 1}번 보기">
          </div>
        `,
          )
          .join("")}
      </div>

      <div class="answer-area" data-role="answerArea">
        <div class="answer-label">정답 / 모범답안</div>
        <input data-field="answer" value="${esc(q.answer)}" placeholder="정답 또는 모범답안을 입력하세요.">
      </div>

      <div class="question-actions">
        <button class="row-btn" onclick="duplicateQuestion(this)">복사</button>
        <button class="row-btn" onclick="removeQuestion(this)">삭제</button>
      </div>
    </div>
  `;

  const typeSelect = card.querySelector('[data-field="type"]');
  typeSelect.addEventListener("change", () => {
    syncQuestionType(card);
    calculateSummary();
    markDirty();
  });

  card.querySelectorAll("input,textarea").forEach((el) => {
    el.addEventListener("input", () => {
      calculateSummary();
      markDirty();
    });
  });

  document.getElementById("questionList").appendChild(card);
  syncQuestionType(card);
}

function syncQuestionType(card) {
  const type = card.querySelector('[data-field="type"]').value;
  const options = card.querySelector('[data-role="options"]');
  options.style.display = type === "객관식" ? "grid" : "none";
}

function renumberQuestions() {
  const cards = [...document.querySelectorAll(".question-card")];
  cards.forEach((card, i) => {
    card.querySelector(".qno").textContent = "Q" + (i + 1);
  });
  qSeq = cards.length;
}

function addQuestion() {
  createQuestion();
  renumberQuestions();
  calculateSummary();
  markDirty();
}

function duplicateQuestion(btn) {
  const card = btn.closest(".question-card");
  const q = {
    type: card.querySelector('[data-field="type"]').value,
    score: card.querySelector('[data-field="score"]').value,
    title: card.querySelector('[data-field="title"]').value,
    options: [1, 2, 3, 4].map(
      (i) => card.querySelector(`[data-field="option${i}"]`).value,
    ),
    answer: card.querySelector('[data-field="answer"]').value,
  };
  createQuestion(q);
  renumberQuestions();
  calculateSummary();
  markDirty();
}

function copyLastQuestion() {
  const cards = [...document.querySelectorAll(".question-card")];
  if (!cards.length) {
    addQuestion();
    return;
  }
  duplicateQuestion(cards[cards.length - 1].querySelector(".row-btn"));
}

function removeQuestion(btn) {
  const cards = document.querySelectorAll(".question-card");
  if (cards.length <= 1) {
    alert("최소 1개의 문항은 유지해야 합니다.");
    return;
  }
  btn.closest(".question-card").remove();
  renumberQuestions();
  calculateSummary();
  markDirty();
}

function calculateSummary() {
  const cards = [...document.querySelectorAll(".question-card")];
  let total = 0,
    multiple = 0,
    subjective = 0;
  cards.forEach((card) => {
    total += Number(card.querySelector('[data-field="score"]').value || 0);
    const type = card.querySelector('[data-field="type"]').value;
    if (type === "객관식") multiple++;
    else subjective++;
  });

  document.getElementById("questionCount").value = cards.length;
  document.getElementById("totalScore").value = total;
  document.getElementById("multipleCount").value = multiple;
  document.getElementById("subjectiveCount").value = subjective;
}

function toggleAnswers() {
  answersVisible = !answersVisible;
  document.querySelectorAll('[data-role="answerArea"]').forEach((el) => {
    el.style.display = answersVisible ? "grid" : "none";
  });
}

function approve(btn, role) {
  btn.closest("td").innerHTML = `<div class="stamp">승인<br>${role}</div>`;
  markDirty();
}

function saveDraft() {
  const payload = {
    fields: [...document.querySelectorAll("[data-save]")].map((el) => el.value),
    questions: [...document.querySelectorAll(".question-card")].map((card) => ({
      type: card.querySelector('[data-field="type"]').value,
      category: card.querySelector('[data-field="category"]').value,
      score: card.querySelector('[data-field="score"]').value,
      title: card.querySelector('[data-field="title"]').value,
      options: [1, 2, 3, 4].map(
        (i) => card.querySelector(`[data-field="option${i}"]`).value,
      ),
      answer: card.querySelector('[data-field="answer"]').value,
    })),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  setSaved(true);
}

function loadDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    alert("저장된 임시저장이 없습니다.");
    return;
  }
  const p = JSON.parse(raw);

  const fields = [...document.querySelectorAll("[data-save]")];
  (p.fields || []).forEach((v, i) => {
    if (fields[i]) fields[i].value = v;
  });

  document.getElementById("questionList").innerHTML = "";
  qSeq = 0;
  (p.questions || []).forEach((q) => {
    createQuestion(q);
    const card = document.querySelector(".question-card:last-child");
    card.querySelector('[data-field="category"]').value = q.category || "";
  });
  if (!(p.questions || []).length) createQuestion();

  renumberQuestions();
  calculateSummary();
  setSaved(true);
}

function resetForm() {
  if (!confirm("입력한 내용을 초기화하시겠습니까?")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function markDirty() {
  setSaved(false);
}
function setSaved(saved) {
  const d = document.getElementById("saveDot");
  const t = document.getElementById("saveText");
  if (saved) {
    d.classList.add("saved");
    t.textContent = "임시저장 완료";
  } else {
    d.classList.remove("saved");
    t.textContent = "저장되지 않은 변경사항이 있습니다.";
  }
}

defaultQuestions.forEach(createQuestion);

document.querySelectorAll("[data-save]").forEach((el) => {
  el.addEventListener("input", markDirty);
  el.addEventListener("change", markDirty);
});

calculateSummary();
