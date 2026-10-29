const STORAGE_KEY = "assessment_result_summary_v1";
let rowSeq = 0;

const defaultRows = [
  {
    name: "김지원",
    attend: "응시",
    written: 80,
    practical: 85,
    assignment: 75,
    remark: "",
  },
  {
    name: "김유찬",
    attend: "응시",
    written: 70,
    practical: 78,
    assignment: 80,
    remark: "",
  },
  {
    name: "이호준",
    attend: "응시",
    written: 55,
    practical: 58,
    assignment: 60,
    remark: "재평가 대상",
  },
  {
    name: "박서준",
    attend: "응시",
    written: 90,
    practical: 92,
    assignment: 88,
    remark: "우수",
  },
  {
    name: "최민수",
    attend: "응시",
    written: 76,
    practical: 80,
    assignment: 73,
    remark: "",
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
    name: "",
    attend: "응시",
    written: 0,
    practical: 0,
    assignment: 0,
    remark: "",
  },
) {
  rowSeq++;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input class="center" data-field="no" value="${rowSeq}" readonly></td>
    <td><input data-field="name" value="${esc(data.name)}" placeholder="훈련생명"></td>
    <td>
      <select data-field="attend">
        <option ${data.attend === "응시" ? "selected" : ""}>응시</option>
        <option ${data.attend === "미응시" ? "selected" : ""}>미응시</option>
      </select>
    </td>
    <td><input class="center" data-field="written" type="number" min="0" max="100" value="${Number(data.written) || 0}"></td>
    <td><input class="center" data-field="practical" type="number" min="0" max="100" value="${Number(data.practical) || 0}"></td>
    <td><input class="center" data-field="assignment" type="number" min="0" max="100" value="${Number(data.assignment) || 0}"></td>
    <td><input class="center" data-field="total" type="number" readonly></td>
    <td><input class="center" data-field="average" type="number" readonly></td>
    <td><div class="center" data-field="result"></div></td>
    <td><input data-field="remark" value="${esc(data.remark)}" placeholder="비고"></td>
    <td>
      <div class="row-actions">
        <button class="row-btn" onclick="duplicateRow(this)">복사</button>
        <button class="row-btn" onclick="removeRow(this)">삭제</button>
      </div>
    </td>
  `;

  tr.querySelectorAll("input,select").forEach((el) => {
    el.addEventListener("input", () => {
      calculateRow(tr);
      calculateSummary();
      markDirty();
    });
    el.addEventListener("change", () => {
      calculateRow(tr);
      calculateSummary();
      markDirty();
    });
  });

  document.getElementById("resultBody").appendChild(tr);
  calculateRow(tr);
}

function calculateRow(tr) {
  const attend = tr.querySelector('[data-field="attend"]').value;
  const resultEl = tr.querySelector('[data-field="result"]');
  const totalEl = tr.querySelector('[data-field="total"]');
  const avgEl = tr.querySelector('[data-field="average"]');

  if (attend === "미응시") {
    totalEl.value = "";
    avgEl.value = "";
    resultEl.textContent = "미응시";
    resultEl.className = "center absent";
    return;
  }

  const scores = ["written", "practical", "assignment"].map((f) =>
    Number(tr.querySelector(`[data-field="${f}"]`).value || 0),
  );
  const total = scores.reduce((a, b) => a + b, 0);
  const average = +(total / scores.length).toFixed(1);
  const passScore = Number(document.getElementById("passScore").value || 0);

  totalEl.value = total;
  avgEl.value = average;

  if (average >= passScore) {
    resultEl.textContent = "합격";
    resultEl.className = "center pass";
  } else {
    resultEl.textContent = "불합격";
    resultEl.className = "center fail";
  }
}

function renumberRows() {
  const rows = [...document.querySelectorAll("#resultBody tr")];
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
    name: tr.querySelector('[data-field="name"]').value,
    attend: tr.querySelector('[data-field="attend"]').value,
    written: tr.querySelector('[data-field="written"]').value,
    practical: tr.querySelector('[data-field="practical"]').value,
    assignment: tr.querySelector('[data-field="assignment"]').value,
    remark: tr.querySelector('[data-field="remark"]').value,
  });
  renumberRows();
  calculateSummary();
  markDirty();
}

function copyLastRow() {
  const rows = [...document.querySelectorAll("#resultBody tr")];
  if (!rows.length) {
    addRow();
    return;
  }
  duplicateRow(rows[rows.length - 1].querySelector(".row-btn"));
}

function removeRow(btn) {
  const rows = document.querySelectorAll("#resultBody tr");
  if (rows.length <= 1) {
    alert("최소 1명의 훈련생은 유지해야 합니다.");
    return;
  }
  btn.closest("tr").remove();
  renumberRows();
  calculateSummary();
  markDirty();
}

function calculateSummary() {
  const rows = [...document.querySelectorAll("#resultBody tr")];

  let attendee = 0,
    pass = 0,
    fail = 0,
    absent = 0,
    sumAverage = 0;

  rows.forEach((tr) => {
    calculateRow(tr);

    const attend = tr.querySelector('[data-field="attend"]').value;
    const result = tr.querySelector('[data-field="result"]').textContent;

    if (attend === "미응시") {
      absent++;
      return;
    }

    attendee++;
    const avg = Number(tr.querySelector('[data-field="average"]').value || 0);
    sumAverage += avg;

    if (result === "합격") pass++;
    if (result === "불합격") fail++;
  });

  const avgScore = attendee > 0 ? (sumAverage / attendee).toFixed(1) : "0.0";

  document.getElementById("targetCount").value = rows.length;
  document.getElementById("attendeeCount").value = attendee;
  document.getElementById("passCount").value = pass;
  document.getElementById("failCount").value = fail;
  document.getElementById("absentCount").value = absent;
  document.getElementById("averageScore").value = avgScore;
}

function approve(btn, role) {
  btn.closest("td").innerHTML = `<div class="stamp">승인<br>${role}</div>`;
  markDirty();
}

function saveDraft() {
  const payload = {
    fields: [...document.querySelectorAll("[data-save]")].map((el) => el.value),
    rows: [...document.querySelectorAll("#resultBody tr")].map((tr) => ({
      name: tr.querySelector('[data-field="name"]').value,
      attend: tr.querySelector('[data-field="attend"]').value,
      written: tr.querySelector('[data-field="written"]').value,
      practical: tr.querySelector('[data-field="practical"]').value,
      assignment: tr.querySelector('[data-field="assignment"]').value,
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

  document.getElementById("resultBody").innerHTML = "";
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
  el.addEventListener("input", () => {
    if (el.id === "passScore") calculateSummary();
    markDirty();
  });
  el.addEventListener("change", () => {
    if (el.id === "passScore") calculateSummary();
    markDirty();
  });
});

calculateSummary();
