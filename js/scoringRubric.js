const STORAGE_KEY = "scoring_rubric_v1";
let rowSeq = 0;

const defaultRows = [
  {
    type: "객관식",
    answer: "3",
    score: 20,
    criteria: "정답 3번 선택 시 20점, 오답은 0점",
    partial: "부분점수 없음",
    deduction: "해당 없음",
  },
  {
    type: "객관식",
    answer: "2",
    score: 20,
    criteria: "정답 2번 선택 시 20점, 오답은 0점",
    partial: "부분점수 없음",
    deduction: "해당 없음",
  },
  {
    type: "주관식",
    answer: "오버로딩 / 오버라이딩 차이",
    score: 30,
    criteria: "두 개념의 정의와 차이를 모두 정확히 설명한 경우 만점",
    partial: "개념 1개만 정확: 15점 / 차이까지 설명: 30점",
    deduction: "용어 혼동 또는 핵심 개념 누락 시 감점",
  },
  {
    type: "서술형",
    answer: "예외처리 필요성 및 try-catch-finally 역할",
    score: 30,
    criteria: "예외처리 필요성과 각 블록의 역할을 정확히 설명",
    partial: "필요성 10점 / try-catch 10점 / finally 10점",
    deduction: "역할 설명 오류 항목당 최대 10점 감점",
  },
];

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createRow(
  data = {
    type: "객관식",
    answer: "",
    score: 0,
    criteria: "",
    partial: "",
    deduction: "",
  },
) {
  rowSeq++;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input class="center" data-field="no" value="${rowSeq}" readonly></td>
    <td>
      <select data-field="type">
        <option ${data.type === "객관식" ? "selected" : ""}>객관식</option>
        <option ${data.type === "주관식" ? "selected" : ""}>주관식</option>
        <option ${data.type === "서술형" ? "selected" : ""}>서술형</option>
      </select>
    </td>
    <td><input data-field="answer" value="${esc(data.answer)}" placeholder="정답 / 핵심답안"></td>
    <td><input class="center" data-field="score" type="number" min="0" value="${Number(data.score) || 0}"></td>
    <td><textarea data-field="criteria" placeholder="채점기준">${esc(data.criteria)}</textarea></td>
    <td><textarea data-field="partial" placeholder="부분점수 기준">${esc(data.partial)}</textarea></td>
    <td><textarea data-field="deduction" placeholder="감점 기준">${esc(data.deduction)}</textarea></td>
    <td>
      <div class="row-actions">
        <button class="row-btn" onclick="duplicateRow(this)">복사</button>
        <button class="row-btn" onclick="removeRow(this)">삭제</button>
      </div>
    </td>
  `;

  tr.querySelectorAll("input,textarea,select").forEach((el) => {
    el.addEventListener("input", () => {
      calculateSummary();
      markDirty();
    });
    el.addEventListener("change", () => {
      calculateSummary();
      markDirty();
    });
  });

  document.getElementById("rubricBody").appendChild(tr);
}

function renumberRows() {
  const rows = [...document.querySelectorAll("#rubricBody tr")];
  rows.forEach(
    (tr, i) => (tr.querySelector('[data-field="no"]').value = i + 1),
  );
  rowSeq = rows.length;
}

function addRow() {
  createRow();
  renumberRows();
  calculateSummary();
  markDirty();
}

function duplicateRow(btn) {
  const tr = btn.closest("tr");
  createRow({
    type: tr.querySelector('[data-field="type"]').value,
    answer: tr.querySelector('[data-field="answer"]').value,
    score: tr.querySelector('[data-field="score"]').value,
    criteria: tr.querySelector('[data-field="criteria"]').value,
    partial: tr.querySelector('[data-field="partial"]').value,
    deduction: tr.querySelector('[data-field="deduction"]').value,
  });
  renumberRows();
  calculateSummary();
  markDirty();
}

function copyLastRow() {
  const rows = [...document.querySelectorAll("#rubricBody tr")];
  if (!rows.length) {
    addRow();
    return;
  }
  duplicateRow(rows[rows.length - 1].querySelector(".row-btn"));
}

function removeRow(btn) {
  const rows = document.querySelectorAll("#rubricBody tr");
  if (rows.length <= 1) {
    alert("최소 1개의 채점기준은 유지해야 합니다.");
    return;
  }
  btn.closest("tr").remove();
  renumberRows();
  calculateSummary();
  markDirty();
}

function calculateSummary() {
  const rows = [...document.querySelectorAll("#rubricBody tr")];
  const total = rows.reduce(
    (sum, tr) =>
      sum + Number(tr.querySelector('[data-field="score"]').value || 0),
    0,
  );

  document.getElementById("itemCount").value = rows.length;
  document.getElementById("totalScore").value = total;

  const status = document.getElementById("scoreStatus");
  if (total === 100) {
    status.textContent = "정상";
    status.style.color = "#1a8a55";
  } else {
    status.textContent = "배점 확인";
    status.style.color = "#c94a4a";
  }
}

function approve(btn, role) {
  btn.closest("td").innerHTML = `<div class="stamp">승인<br>${role}</div>`;
  markDirty();
}

function saveDraft() {
  const payload = {
    fields: [...document.querySelectorAll("[data-save]")].map((el) => el.value),
    rows: [...document.querySelectorAll("#rubricBody tr")].map((tr) => ({
      type: tr.querySelector('[data-field="type"]').value,
      answer: tr.querySelector('[data-field="answer"]').value,
      score: tr.querySelector('[data-field="score"]').value,
      criteria: tr.querySelector('[data-field="criteria"]').value,
      partial: tr.querySelector('[data-field="partial"]').value,
      deduction: tr.querySelector('[data-field="deduction"]').value,
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

  document.getElementById("rubricBody").innerHTML = "";
  rowSeq = 0;

  (p.rows || []).forEach(createRow);
  if (!(p.rows || []).length) createRow();

  renumberRows();
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

defaultRows.forEach(createRow);

document.querySelectorAll("[data-save]").forEach((el) => {
  el.addEventListener("input", markDirty);
  el.addEventListener("change", markDirty);
});

calculateSummary();
