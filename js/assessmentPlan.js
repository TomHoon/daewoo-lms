const STORAGE_KEY = "assessment_plan_v1";
let rowSeq = 0;
const defaultRows = [
  ["이론이해", "객체지향 프로그래밍 기본 개념 이해", "필기평가", 25, ""],
  ["문법활용", "클래스, 상속, 인터페이스 활용", "필기평가", 25, ""],
  ["코드작성", "요구사항에 맞는 자바 코드 작성", "실기평가", 30, ""],
  ["문제해결", "오류 분석 및 수정 능력", "실기평가", 20, ""],
];
function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function createRow(data = ["", "", "필기평가", 0, ""]) {
  rowSeq++;
  const tr = document.createElement("tr");
  tr.innerHTML = `<td><input class="center" data-field="no" value="${rowSeq}" readonly></td>
 <td><input data-field="area" value="${esc(data[0])}" placeholder="평가영역"></td>
 <td><textarea data-field="content" placeholder="평가내용">${esc(data[1])}</textarea></td>
 <td><select data-field="method"><option ${data[2] === "필기평가" ? "selected" : ""}>필기평가</option><option ${data[2] === "실기평가" ? "selected" : ""}>실기평가</option><option ${data[2] === "과제평가" ? "selected" : ""}>과제평가</option><option ${data[2] === "구두평가" ? "selected" : ""}>구두평가</option></select></td>
 <td><input class="center" data-field="score" type="number" min="0" value="${Number(data[3]) || 0}"></td>
 <td><input data-field="remark" value="${esc(data[4])}" placeholder="비고"></td>
 <td><div class="row-actions"><button class="row-btn" onclick="duplicateRow(this)">복사</button><button class="row-btn" onclick="removeRow(this)">삭제</button></div></td>`;
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
  document.getElementById("evaluationBody").appendChild(tr);
}
function renumber() {
  [...document.querySelectorAll("#evaluationBody tr")].forEach(
    (tr, i) => (tr.querySelector('[data-field="no"]').value = i + 1),
  );
  rowSeq = document.querySelectorAll("#evaluationBody tr").length;
}
function addRow() {
  createRow();
  renumber();
  calculateSummary();
  markDirty();
}
function duplicateRow(btn) {
  const tr = btn.closest("tr");
  createRow([
    tr.querySelector('[data-field="area"]').value,
    tr.querySelector('[data-field="content"]').value,
    tr.querySelector('[data-field="method"]').value,
    tr.querySelector('[data-field="score"]').value,
    tr.querySelector('[data-field="remark"]').value,
  ]);
  renumber();
  calculateSummary();
  markDirty();
}
function copyLastRow() {
  const rows = [...document.querySelectorAll("#evaluationBody tr")];
  if (!rows.length) {
    addRow();
    return;
  }
  duplicateRow(rows[rows.length - 1].querySelector(".row-btn"));
}
function removeRow(btn) {
  if (document.querySelectorAll("#evaluationBody tr").length <= 1) {
    alert("최소 1개의 평가 항목은 유지해야 합니다.");
    return;
  }
  btn.closest("tr").remove();
  renumber();
  calculateSummary();
  markDirty();
}
function calculateSummary() {
  const rows = [...document.querySelectorAll("#evaluationBody tr")];
  const total = rows.reduce(
    (s, tr) => s + Number(tr.querySelector('[data-field="score"]').value || 0),
    0,
  );
  const pass = Number(document.getElementById("passScore").value || 0);
  document.getElementById("totalScore").value = total;
  document.getElementById("summaryPassScore").value = pass;
  document.getElementById("itemCount").value = rows.length;
  const st = document.getElementById("scoreStatus");
  st.textContent = total === 100 ? "정상" : "배점 확인";
  st.style.color = total === 100 ? "#1a8a55" : "#c94a4a";
}
function approve(btn, role) {
  btn.closest("td").innerHTML = `<div class="stamp">승인<br>${role}</div>`;
  markDirty();
}
function saveDraft() {
  const p = {
    fields: [...document.querySelectorAll("[data-save]")].map((e) => e.value),
    rows: [...document.querySelectorAll("#evaluationBody tr")].map((tr) => ({
      area: tr.querySelector('[data-field="area"]').value,
      content: tr.querySelector('[data-field="content"]').value,
      method: tr.querySelector('[data-field="method"]').value,
      score: tr.querySelector('[data-field="score"]').value,
      remark: tr.querySelector('[data-field="remark"]').value,
    })),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
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
  document.getElementById("evaluationBody").innerHTML = "";
  rowSeq = 0;
  (p.rows || []).forEach((r) =>
    createRow([r.area, r.content, r.method, r.score, r.remark]),
  );
  if (!(p.rows || []).length) createRow();
  renumber();
  calculateSummary();
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
function setSaved(v) {
  const d = document.getElementById("saveDot"),
    t = document.getElementById("saveText");
  if (v) {
    d.classList.add("saved");
    t.textContent = "임시저장 완료";
  } else {
    d.classList.remove("saved");
    t.textContent = "저장되지 않은 변경사항이 있습니다.";
  }
}
defaultRows.forEach(createRow);
document.querySelectorAll("[data-save]").forEach((el) =>
  el.addEventListener("input", () => {
    if (el.id === "passScore") calculateSummary();
    markDirty();
  }),
);
calculateSummary();
