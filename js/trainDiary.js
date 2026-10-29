const STORAGE_KEY = "daewoo_training_diary_v1";
let rowSeq = 0;

const defaultRows = [
  ["자바프로그래밍", "이정은", "자바프로그래밍", "김지원, 김유찬, 이호준"],
  ["자바프로그래밍", "이정은", "자바프로그래밍", "김지원, 김유찬, 이호준"],
  ["자바프로그래밍", "이정은", "자바프로그래밍", "김지원, 김유찬"],
  ["자바프로그래밍", "이정은", "자바프로그래밍", "김지원, 김유찬"],
  ["자바프로그래밍", "이정은", "자바프로그래밍", "김지원, 김유찬"],
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
];

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createRow(data = ["", "", "", ""]) {
  rowSeq++;
  const tr = document.createElement("tr");
  tr.innerHTML = `
  <td><input class="period" data-field="period" value="${rowSeq}" readonly></td>
  <td><input data-field="subject" value="${esc(data[0])}" placeholder="훈련과목"></td>
  <td><input data-field="teacher" value="${esc(data[1])}" placeholder="담당교사"></td>
  <td><input data-field="content" value="${esc(data[2])}" placeholder="훈련내용"></td>
  <td><input data-field="remark" value="${esc(data[3])}" placeholder="불참자 / 비고"></td>
  <td><div class="row-actions"><button class="row-btn" onclick="duplicateRow(this)">복사</button><button class="row-btn" onclick="removeRow(this)">삭제</button></div></td>`;
  tr.querySelectorAll("input").forEach((el) =>
    el.addEventListener("input", markDirty),
  );
  document.getElementById("trainingBody").appendChild(tr);
}

function renumberRows() {
  const rows = [...document.querySelectorAll("#trainingBody tr")];
  rows.forEach(
    (tr, i) => (tr.querySelector('[data-field="period"]').value = i + 1),
  );
  rowSeq = rows.length;
}

function addRow() {
  createRow();
  renumberRows();
  markDirty();
}

function duplicateRow(btn) {
  const r = btn.closest("tr");
  createRow([
    r.querySelector('[data-field="subject"]').value,
    r.querySelector('[data-field="teacher"]').value,
    r.querySelector('[data-field="content"]').value,
    r.querySelector('[data-field="remark"]').value,
  ]);
  renumberRows();
  markDirty();
}

function copyLastRow() {
  const rows = [...document.querySelectorAll("#trainingBody tr")];
  if (!rows.length) {
    addRow();
    return;
  }
  const r = rows[rows.length - 1];
  createRow([
    r.querySelector('[data-field="subject"]').value,
    r.querySelector('[data-field="teacher"]').value,
    r.querySelector('[data-field="content"]').value,
    r.querySelector('[data-field="remark"]').value,
  ]);
  renumberRows();
  markDirty();
}

function removeRow(btn) {
  const rows = document.querySelectorAll("#trainingBody tr");
  if (rows.length <= 1) {
    alert("최소 1개 교시는 유지해야 합니다.");
    return;
  }
  btn.closest("tr").remove();
  renumberRows();
  markDirty();
}

function calculateProgress() {
  const total = Number(document.getElementById("totalDays").value || 0);
  const progress = Number(document.getElementById("progressDays").value || 0);
  document.getElementById("remainingDays").value = Math.max(
    0,
    total - progress,
  );
  document.getElementById("progressRate").textContent =
    (total > 0 ? ((progress / total) * 100).toFixed(1) : "0.0") + "%";
  markDirty();
}

function calculateAttendance() {
  const total = Number(document.getElementById("totalStudent").value || 0);
  const absent = Number(document.getElementById("absentStudent").value || 0);
  const vacation = Number(
    document.getElementById("vacationStudent").value || 0,
  );
  document.getElementById("presentStudent").value = Math.max(
    0,
    total - absent - vacation,
  );
  markDirty();
}

function approve(btn, role) {
  btn.closest("td").innerHTML = `<div class="stamp">승인<br>${role}</div>`;
  markDirty();
}

function updateNoticeCount() {
  const n = document.getElementById("notice");
  document.getElementById("noticeCount").textContent = n.value.length;
}

function saveDraft() {
  const payload = {
    fields: [...document.querySelectorAll("[data-save]")].map((el) => el.value),
    rows: [...document.querySelectorAll("#trainingBody tr")].map((tr) => ({
      subject: tr.querySelector('[data-field="subject"]').value,
      teacher: tr.querySelector('[data-field="teacher"]').value,
      content: tr.querySelector('[data-field="content"]').value,
      remark: tr.querySelector('[data-field="remark"]').value,
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
  document.getElementById("trainingBody").innerHTML = "";
  rowSeq = 0;
  (p.rows || []).forEach((r) =>
    createRow([r.subject, r.teacher, r.content, r.remark]),
  );
  if (!(p.rows || []).length) createRow();
  renumberRows();
  calculateProgress();
  calculateAttendance();
  updateNoticeCount();
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
    if (["totalDays", "progressDays"].includes(el.id)) calculateProgress();
    else if (
      ["totalStudent", "absentStudent", "vacationStudent"].includes(el.id)
    )
      calculateAttendance();
    else markDirty();
  });
});
document.getElementById("notice").addEventListener("input", updateNoticeCount);

calculateProgress();
calculateAttendance();
updateNoticeCount();
