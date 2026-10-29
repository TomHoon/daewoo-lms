const STORAGE_KEY = "education_training_diary_v1";
let rowSeq = 0;

const defaultRows = [
  [
    "자바프로그래밍",
    "이정은",
    "객체지향 프로그래밍 및 클래스 기본",
    "09:00",
    "10:00",
  ],
  ["자바프로그래밍", "이정은", "상속과 인터페이스 실습", "10:00", "11:00"],
  ["자바프로그래밍", "이정은", "컬렉션 프레임워크", "11:00", "12:00"],
  ["자바프로그래밍", "이정은", "예외처리 및 실습", "13:00", "15:00"],
  ["자바프로그래밍", "이정은", "미니 프로젝트 실습", "15:00", "18:00"],
];

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function timeDiff(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return +(mins / 60).toFixed(2);
}

function createRow(data = ["", "", "", "", ""]) {
  rowSeq++;
  const hours = timeDiff(data[3], data[4]);

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input class="center" data-field="no" value="${rowSeq}" readonly></td>
    <td><input data-field="subject" value="${esc(data[0])}" placeholder="교육과목"></td>
    <td><input data-field="teacher" value="${esc(data[1])}" placeholder="강사"></td>
    <td><textarea data-field="content" placeholder="교육내용">${esc(data[2])}</textarea></td>
    <td><input data-field="start" type="time" value="${esc(data[3])}"></td>
    <td><input data-field="end" type="time" value="${esc(data[4])}"></td>
    <td><input class="center" data-field="hours" type="number" step="0.25" value="${hours}" readonly></td>
    <td>
      <div class="row-actions">
        <button class="row-btn" onclick="duplicateRow(this)">복사</button>
        <button class="row-btn" onclick="removeRow(this)">삭제</button>
      </div>
    </td>
  `;

  tr.querySelectorAll("input,textarea").forEach((el) => {
    el.addEventListener("input", () => {
      if (el.dataset.field === "start" || el.dataset.field === "end") {
        recalcRow(tr);
        calculateHours();
      }
      markDirty();
    });
  });

  document.getElementById("trainingBody").appendChild(tr);
}

function recalcRow(tr) {
  const start = tr.querySelector('[data-field="start"]').value;
  const end = tr.querySelector('[data-field="end"]').value;
  tr.querySelector('[data-field="hours"]').value = timeDiff(start, end);
}

function renumberRows() {
  const rows = [...document.querySelectorAll("#trainingBody tr")];
  rows.forEach(
    (tr, i) => (tr.querySelector('[data-field="no"]').value = i + 1),
  );
  rowSeq = rows.length;
}

function addRow() {
  createRow();
  renumberRows();
  calculateHours();
  markDirty();
}

function duplicateRow(btn) {
  const tr = btn.closest("tr");
  createRow([
    tr.querySelector('[data-field="subject"]').value,
    tr.querySelector('[data-field="teacher"]').value,
    tr.querySelector('[data-field="content"]').value,
    tr.querySelector('[data-field="start"]').value,
    tr.querySelector('[data-field="end"]').value,
  ]);
  renumberRows();
  calculateHours();
  markDirty();
}

function copyLastRow() {
  const rows = [...document.querySelectorAll("#trainingBody tr")];
  if (!rows.length) {
    addRow();
    return;
  }
  duplicateRow(rows[rows.length - 1].querySelector(".row-btn"));
}

function removeRow(btn) {
  const rows = document.querySelectorAll("#trainingBody tr");
  if (rows.length <= 1) {
    alert("최소 1개의 교육 행은 유지해야 합니다.");
    return;
  }
  btn.closest("tr").remove();
  renumberRows();
  calculateHours();
  markDirty();
}

function calculateProgress() {
  const total = Number(document.getElementById("totalDays").value || 0);
  const progress = Number(document.getElementById("progressDays").value || 0);
  document.getElementById("remainingDays").value = Math.max(
    0,
    total - progress,
  );
  markDirty();
}

function calculateHours() {
  let daily = 0;
  document.querySelectorAll("#trainingBody tr").forEach((tr) => {
    recalcRow(tr);
    daily += Number(tr.querySelector('[data-field="hours"]').value || 0);
  });
  daily = +daily.toFixed(2);

  const previous = Number(document.getElementById("totalHours").value || 0);
  const grand = +(previous + daily).toFixed(2);

  document.getElementById("dailyHours").value = daily;
  document.getElementById("grandHours").textContent = grand + "시간";
}

function approve(btn, role) {
  btn.closest("td").innerHTML = `<div class="stamp">승인<br>${role}</div>`;
  markDirty();
}

function updateNoticeCount() {
  const notice = document.getElementById("notice");
  document.getElementById("noticeCount").textContent = notice.value.length;
}

function saveDraft() {
  const payload = {
    fields: [...document.querySelectorAll("[data-save]")].map((el) => el.value),
    rows: [...document.querySelectorAll("#trainingBody tr")].map((tr) => ({
      subject: tr.querySelector('[data-field="subject"]').value,
      teacher: tr.querySelector('[data-field="teacher"]').value,
      content: tr.querySelector('[data-field="content"]').value,
      start: tr.querySelector('[data-field="start"]').value,
      end: tr.querySelector('[data-field="end"]').value,
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
    createRow([r.subject, r.teacher, r.content, r.start, r.end]),
  );
  if (!(p.rows || []).length) createRow();

  renumberRows();
  calculateProgress();
  calculateHours();
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
  el.addEventListener("input", () => {
    if (["totalDays", "progressDays"].includes(el.id)) calculateProgress();
    if (el.id === "totalHours") calculateHours();
    markDirty();
  });
});

document.getElementById("notice").addEventListener("input", updateNoticeCount);

calculateProgress();
calculateHours();
updateNoticeCount();
