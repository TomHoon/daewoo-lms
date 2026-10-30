const STORAGE_KEY = "enrollment_channel_survey_v1";

function setActiveChannel(value) {
  document.querySelectorAll(".channel-card").forEach((card) => {
    card.classList.toggle(
      "active",
      card.querySelector("input").value === value,
    );
  });
  document.getElementById("awarenessSummary").textContent = value;
  markDirty();
}

document.querySelectorAll('input[name="awareness"]').forEach((radio) => {
  radio.addEventListener("change", () => setActiveChannel(radio.value));
});

function updateSummary() {
  const awareness =
    document.querySelector('input[name="awareness"]:checked')?.value || "-";
  const apply = document.getElementById("applyChannel").value;
  const factors = [...document.querySelectorAll("[data-factor]:checked")];

  document.getElementById("awarenessSummary").textContent = awareness;
  document.getElementById("applySummary").textContent = apply;
  document.getElementById("factorCount").textContent = factors.length + "개";
  document.getElementById("surveyStatus").textContent =
    awareness && apply ? "작성중" : "미작성";
}

document.getElementById("applyChannel").addEventListener("change", () => {
  updateSummary();
  markDirty();
});
document.querySelectorAll("[data-factor]").forEach((el) => {
  el.addEventListener("change", () => {
    updateSummary();
    markDirty();
  });
});

function approve(btn, role) {
  btn.closest("td").innerHTML = `<div class="stamp">승인<br>${role}</div>`;
  markDirty();
}

function saveDraft() {
  const payload = {
    awareness:
      document.querySelector('input[name="awareness"]:checked')?.value || "",
    factors: [...document.querySelectorAll("[data-factor]:checked")].map(
      (el) => el.value,
    ),
    fields: [...document.querySelectorAll("[data-save]")].map((el) => el.value),
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

  if (p.awareness) {
    const radio = document.querySelector(
      `input[name="awareness"][value="${p.awareness}"]`,
    );
    if (radio) {
      radio.checked = true;
      setActiveChannel(p.awareness);
    }
  }

  document.querySelectorAll("[data-factor]").forEach((el) => {
    el.checked = (p.factors || []).includes(el.value);
  });

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

document.querySelectorAll("[data-save]").forEach((el) => {
  el.addEventListener("input", markDirty);
  el.addEventListener("change", markDirty);
});

updateSummary();
