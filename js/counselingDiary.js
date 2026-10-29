const STORAGE_KEY = "counseling_diary_v1";
let rowSeq = 0;
const defaultRows = [
  {
    category: "학습지원",
    content: "자바 상속/인터페이스 추가 학습자료 제공",
    manager: "이정은",
    date: "2026-11-05",
    status: "진행중",
  },
  {
    category: "상담확인",
    content: "학습 진행상황 재확인 및 추가 상담 여부 판단",
    manager: "이정은",
    date: "2026-11-06",
    status: "예정",
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
    category: "학습지원",
    content: "",
    manager: "",
    date: "",
    status: "예정",
  },
) {
  rowSeq++;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input class="center" data-field="no" value="${rowSeq}" readonly></td>
    <td><select data-field="category"><option ${data.category === "학습지원" ? "selected" : ""}>학습지원</option><option ${data.category === "출결관리" ? "selected" : ""}>출결관리</option><option ${data.category === "취업지원" ? "selected" : ""}>취업지원</option><option ${data.category === "생활지원" ? "selected" : ""}>생활지원</option><option ${data.category === "상담확인" ? "selected" : ""}>상담확인</option><option ${data.category === "기타" ? "selected" : ""}>기타</option></select></td>
    <td><textarea data-field="content">${esc(data.content)}</textarea></td>
    <td><input data-field="manager" value="${esc(data.manager)}"></td>
    <td><input data-field="date" type="date" value="${esc(data.date)}"></td>
    <td><select data-field="status"><option ${data.status === "예정" ? "selected" : ""}>예정</option><option ${data.status === "진행중" ? "selected" : ""}>진행중</option><option ${data.status === "완료" ? "selected" : ""}>완료</option><option ${data.status === "보류" ? "selected" : ""}>보류</option></select></td>
    <td><div class="row-actions"><button class="row-btn" onclick="duplicateRow(this)">복사</button><button class="row-btn" onclick="removeRow(this)">삭제</button></div></td>`;
  tr.querySelectorAll("input,textarea,select").forEach((el) => {
    el.addEventListener("input", () => {
      updateSummary();
      markDirty();
    });
    el.addEventListener("change", () => {
      updateSummary();
      markDirty();
    });
  });
  document.getElementById("followupBody").appendChild(tr);
}

function renumberRows() {
  const rows = [...document.querySelectorAll("#followupBody tr")];
  rows.forEach(
    (tr, i) => (tr.querySelector('[data-field="no"]').value = i + 1),
  );
  rowSeq = rows.length;
}
function addRow() {
  createRow();
  renumberRows();
  updateSummary();
  markDirty();
}
function duplicateRow(btn) {
  const tr = btn.closest("tr");
  createRow({
    category: tr.querySelector('[data-field="category"]').value,
    content: tr.querySelector('[data-field="content"]').value,
    manager: tr.querySelector('[data-field="manager"]').value,
    date: tr.querySelector('[data-field="date"]').value,
    status: tr.querySelector('[data-field="status"]').value,
  });
  renumberRows();
  updateSummary();
  markDirty();
}
function copyLastRow() {
  const rows = [...document.querySelectorAll("#followupBody tr")];
  if (!rows.length) {
    addRow();
    return;
  }
  duplicateRow(rows[rows.length - 1].querySelector(".row-btn"));
}
function removeRow(btn) {
  if (document.querySelectorAll("#followupBody tr").length <= 1) {
    alert("최소 1개의 후속조치 항목은 유지해야 합니다.");
    return;
  }
  btn.closest("tr").remove();
  renumberRows();
  updateSummary();
  markDirty();
}

function updateCounters() {
  [
    ["counselingContent", "contentCount"],
    ["actionContent", "actionCount"],
    ["futurePlan", "futureCount"],
  ].forEach(
    ([a, b]) =>
      (document.getElementById(b).textContent =
        document.getElementById(a).value.length),
  );
}

function updateSummary() {
  document.getElementById("roundSummary").textContent =
    (document.getElementById("counselingRound").value || "1") + "회";
  document.getElementById("typeSummary").textContent =
    document.getElementById("counselingType").value;
  const rows = [...document.querySelectorAll("#followupBody tr")];
  const unfinished = rows.some(
    (tr) => tr.querySelector('[data-field="status"]').value !== "완료",
  );
  document.getElementById("followupStatus").textContent = unfinished
    ? "필요"
    : "완료";
  document.getElementById("followupStatus").style.color = unfinished
    ? "#c47a10"
    : "#1a8a55";
  const hasContent =
    document.getElementById("counselingContent").value.trim().length > 0;
  document.getElementById("counselingStatus").textContent = hasContent
    ? "작성중"
    : "미작성";
}

function approve(btn, role) {
  btn.closest("td").innerHTML = `<div class="stamp">승인<br>${role}</div>`;
  markDirty();
}

function saveDraft() {
  const payload = {
    fields: [...document.querySelectorAll("[data-save]")].map((el) => el.value),
    rows: [...document.querySelectorAll("#followupBody tr")].map((tr) => ({
      category: tr.querySelector('[data-field="category"]').value,
      content: tr.querySelector('[data-field="content"]').value,
      manager: tr.querySelector('[data-field="manager"]').value,
      date: tr.querySelector('[data-field="date"]').value,
      status: tr.querySelector('[data-field="status"]').value,
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
  const p = JSON.parse(raw),
    fields = [...document.querySelectorAll("[data-save]")];
  (p.fields || []).forEach((v, i) => {
    if (fields[i]) fields[i].value = v;
  });
  document.getElementById("followupBody").innerHTML = "";
  rowSeq = 0;
  (p.rows || []).forEach(createRow);
  if (!(p.rows || []).length) createRow();
  renumberRows();
  updateCounters();
  updateSummary();
  setSaved(true);
}

function resetForm() {
  if (confirm("입력한 내용을 초기화하시겠습니까?")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}
function markDirty() {
  setSaved(false);
}
function setSaved(saved) {
  const d = document.getElementById("saveDot"),
    t = document.getElementById("saveText");
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
  el.addEventListener("input", () => {
    updateCounters();
    updateSummary();
    markDirty();
  });
  el.addEventListener("change", () => {
    updateCounters();
    updateSummary();
    markDirty();
  });
});
updateCounters();
updateSummary();
