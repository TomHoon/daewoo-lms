import {useEffect, useState} from "react";
import api from "../api/axios";
import "./CourseManagement.css";

export default function CourseManagement() {
  const [jobs, setJobs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadErrors, setLoadErrors] = useState({});
  const [saving, setSaving] = useState({jobs: false, courses: false});
  const [jobChecked, setJobChecked] = useState(() => new Set());
  const [courseChecked, setCourseChecked] = useState(() => new Set());
  const [jobForm, setJobForm] = useState({sortOrder: "0", categoryName: "", incumbentYn: "N", hiddenYn: "N"});
  const [courseForm, setCourseForm] = useState({categoryName: "", hiddenYn: "N"});

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async (path, setter, key, label) => {
      try {
        const {data} = await api.get(path, {signal: controller.signal});
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) {
          throw new Error("분류 목록 응답이 배열이 아닙니다.");
        }
        setter(data);
      } catch {
        if (controller.signal.aborted) return;
        setLoadErrors((errors) => ({...errors, [key]: `${label} 목록을 불러오지 못했습니다.`}));
      }
    };

    // 공통 baseURL의 /api에 이어지는 경로입니다.
    void loadCategories('/v1/educationCategories', setCourses, 'courses', '교육과정분류');
    void loadCategories('/v1/trainingJobCategories', setJobs, 'jobs', '훈련직종분류');

    return () => controller.abort();
  }, []);

  const patch = (setter) => (i, p) =>
    setter((list) => list.map((r, j) => (j === i ? {...r, ...p} : r)));
  const patchJob = patch(setJobs);
  const patchCourse = patch(setCourses);

  const toggle = (setter) => (i) =>
    setter((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  const toggleAll = (setter, length) => (on) =>
    setter(on ? new Set(Array.from({length}, (_, i) => i)) : new Set());

  const createCategory = async (path, payload, key, label, setter, setChecked, resetForm) => {
    setSaving((state) => ({...state, [key]: true}));
    try {
      try {
        await api.post(path, payload);
      } catch {
        alert(`${label} 추가에 실패했습니다. 다시 시도해 주세요.`);
        return;
      }

      resetForm();
      try {
        const {data} = await api.get(path);
        if (!Array.isArray(data)) throw new Error("분류 목록 응답이 배열이 아닙니다.");
        setter(data);
        setChecked(new Set());
        setLoadErrors((errors) => ({...errors, [key]: ""}));
      } catch {
        setLoadErrors((errors) => ({
          ...errors,
          [key]: `${label} 추가는 완료됐지만 목록을 갱신하지 못했습니다. 새로고침해 주세요.`,
        }));
      }
    } finally {
      setSaving((state) => ({...state, [key]: false}));
    }
  };

  const addJob = async () => {
    if (saving.jobs) return;
    const name = jobForm.categoryName.trim();
    if (!name) return alert("훈련직종분류명을 입력하세요.");
    await createCategory(
      '/v1/trainingJobCategories',
      {
        sortOrder: Number(jobForm.sortOrder || 0),
        categoryName: name,
        incumbentYn: jobForm.incumbentYn,
        hiddenYn: jobForm.hiddenYn,
        useYn: "Y",
      },
      'jobs', '훈련직종분류', setJobs, setJobChecked,
      () => setJobForm((f) => ({...f, categoryName: ""})),
    );
  };
  const addCourse = async () => {
    if (saving.courses) return;
    const name = courseForm.categoryName.trim();
    if (!name) return alert("교육과정분류명을 입력하세요.");
    const maxOrder = courses.length ? Math.max(...courses.map((x) => x.sortOrder ?? 0)) : 0;
    await createCategory('/v1/educationCategories', {
      categoryName: name,
      sortOrder: maxOrder + 1,
      hiddenYn: courseForm.hiddenYn,
      useYn: "Y",
      trainingJobCategoryId: null,
      incumbentYn: null,
    }, 'courses', '교육과정분류', setCourses, setCourseChecked,
    () => setCourseForm((f) => ({...f, categoryName: ""})));
  };

  const updateChecked = async (path, key, idKey, list, checked, setChecked, setList) => {
    if (saving[key]) return;
    if (!checked.size) return alert("수정할 항목을 선택하세요.");
    const selected = list.filter((_, i) => checked.has(i));
    if (selected.length !== checked.size || selected.some((row) => row[idKey] == null)) {
      return alert("수정할 항목을 다시 선택해 주세요.");
    }
    if (selected.some((row) => !row.categoryName?.trim())) {
      return alert("분류명을 입력하세요.");
    }
    const payload = selected.map((row) => ({
      [idKey]: row[idKey],
      categoryName: row.categoryName.trim(),
      sortOrder: row.sortOrder ?? 0,
      incumbentYn: row.incumbentYn ?? (key === 'jobs' ? 'N' : null),
      hiddenYn: row.hiddenYn ?? 'N',
      useYn: row.useYn ?? 'Y',
      ...(key === 'courses' ? {trainingJobCategoryId: row.trainingJobCategoryId ?? null} : {}),
    }));

    setSaving((state) => ({...state, [key]: true}));
    try {
      await api.put(path, payload);
      setChecked(new Set());
      try {
        const {data} = await api.get(path);
        if (!Array.isArray(data)) throw new Error("분류 목록 응답이 배열이 아닙니다.");
        setList(data);
        setChecked(new Set());
        setLoadErrors((errors) => ({...errors, [key]: ""}));
      } catch {
        setLoadErrors((errors) => ({
          ...errors,
          [key]: "수정은 완료됐지만 목록을 갱신하지 못했습니다. 새로고침해 주세요.",
        }));
      }
    } catch {
      alert("분류 수정에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSaving((state) => ({...state, [key]: false}));
    }
  };

  const deleteChecked = async (path, key, idKey, list, checked, setChecked, setList) => {
    if (saving[key]) return;
    if (!checked.size) return alert("삭제할 항목을 선택하세요.");
    const ids = list.filter((_, i) => checked.has(i)).map((row) => row[idKey]);
    if (ids.length !== checked.size || ids.some((id) => id == null)) {
      return alert("삭제할 항목을 다시 선택해 주세요.");
    }
    if (!confirm("선택한 분류를 삭제하시겠습니까?")) return;
    setSaving((state) => ({...state, [key]: true}));
    try {
      for (const id of ids) {
        await api.delete(`${path}/${encodeURIComponent(id)}`);
        setList((rows) => rows.filter((row) => row[idKey] !== id));
        // 삭제 후 행 인덱스가 바뀌므로 이전 선택을 해제합니다.
        setChecked(new Set());
      }
      try {
        const {data} = await api.get(path);
        if (!Array.isArray(data)) throw new Error("분류 목록 응답이 배열이 아닙니다.");
        setList(data);
        setChecked(new Set());
        setLoadErrors((errors) => ({...errors, [key]: ""}));
      } catch {
        setLoadErrors((errors) => ({
          ...errors,
          [key]: "삭제는 완료됐지만 목록을 갱신하지 못했습니다. 새로고침해 주세요.",
        }));
      }
    } catch {
      alert("분류 삭제에 실패했습니다. 남은 항목을 확인하고 다시 시도해 주세요.");
    } finally {
      setSaving((state) => ({...state, [key]: false}));
    }
  };

  const openCourses = (row) =>
    alert(`"${row.categoryName}" 분류의 등록과정 목록으로 이동합니다.\n현재 등록과정: ${row.count == null ? '정보 없음' : `${row.count}개`}`);

  const CountBadge = ({row}) => (
    <span
      className={"course-count" + (row.count === 0 ? " zero" : "")}
      onClick={() => openCourses(row)}
    >
      {row.count ?? '-'}
    </span>
  );

  return (
    <div className="pg-course-management">
      <div className="page">
        <header className="page-header">
          <div className="page-title">
            <h1>과정분류 관리</h1>
            <p>훈련직종분류와 교육과정분류를 등록하고 각 분류에 연결된 과정을 관리합니다.</p>
          </div>
          <div className="badge">Course Classification</div>
        </header>

        <div className="layout">
          <section className="panel">
            <div className="panel-head">
              <div className="panel-title">훈련직종분류</div>
              <div className="panel-desc">직종별 상위 분류 관리</div>
            </div>
            <div className="panel-body">
              {loadErrors.jobs && <p role="alert">{loadErrors.jobs}</p>}
              <div className="create-box">
                <div className="create-grid">
                  <div className="field">
                    <label>출력순서</label>
                    <input
                      type="number"
                      value={jobForm.sortOrder}
                      onChange={(e) => setJobForm({...jobForm, sortOrder: e.target.value})}
                    />
                  </div>
                  <div className="field">
                    <label>훈련직종분류명</label>
                    <input
                      type="text"
                      placeholder="훈련직종분류명 입력"
                      value={jobForm.categoryName}
                      onChange={(e) => setJobForm({...jobForm, categoryName: e.target.value})}
                    />
                  </div>
                  <div className="field">
                    <label>재직자</label>
                    <div className="check-field">
                      <input
                        type="checkbox"
                        checked={jobForm.incumbentYn === "Y"}
                        onChange={(e) => setJobForm({...jobForm, incumbentYn: e.target.checked ? "Y" : "N"})}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>숨김</label>
                    <div className="check-field">
                      <input
                        type="checkbox"
                        checked={jobForm.hiddenYn === "Y"}
                        onChange={(e) => setJobForm({...jobForm, hiddenYn: e.target.checked ? "Y" : "N"})}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={addJob} disabled={saving.jobs}>
                    {saving.jobs ? '저장 중...' : '+ 추가'}
                  </button>
                </div>
              </div>

              <div className="notice">
                등록과정 수를 클릭하면 해당 분류에 속한 과정 목록 화면으로 이동합니다.
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{width: 50}}>
                        <input
                          type="checkbox"
                          checked={jobs.length > 0 && jobChecked.size === jobs.length}
                          onChange={(e) => toggleAll(setJobChecked, jobs.length)(e.target.checked)}
                        />
                      </th>
                      <th style={{width: 100}}>출력순서</th>
                      <th>훈련직종분류명</th>
                      <th style={{width: 90}}>재직자</th>
                      <th style={{width: 80}}>숨김</th>
                      <th style={{width: 100}}>등록과정수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((row, i) => (
                      <tr key={row.trainingJobCategoryId ?? `new-${i}`}>
                        <td className="center">
                          <input
                            type="checkbox"
                            checked={jobChecked.has(i)}
                            onChange={() => toggle(setJobChecked)(i)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.sortOrder ?? 0}
                            onChange={(e) => patchJob(i, {sortOrder: Number(e.target.value)})}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.categoryName ?? ""}
                            onChange={(e) => patchJob(i, {categoryName: e.target.value})}
                          />
                        </td>
                        <td className="center">
                          <input
                            type="checkbox"
                            checked={row.incumbentYn === "Y"}
                            onChange={(e) => patchJob(i, {incumbentYn: e.target.checked ? "Y" : "N"})}
                          />
                        </td>
                        <td className="center">
                          <input
                            type="checkbox"
                            checked={row.hiddenYn === "Y"}
                            onChange={(e) => patchJob(i, {hiddenYn: e.target.checked ? "Y" : "N"})}
                          />
                        </td>
                        <td className="center">
                          <CountBadge row={row} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="actions">
                <button
                  className="btn btn-small"
                  disabled={saving.jobs}
                  onClick={() => updateChecked('/v1/trainingJobCategories', 'jobs', 'trainingJobCategoryId', jobs, jobChecked, setJobChecked, setJobs)}
                >
                  수정
                </button>
                <button
                  className="btn btn-small btn-danger"
                  disabled={saving.jobs}
                  onClick={() => deleteChecked('/v1/trainingJobCategories', 'jobs', 'trainingJobCategoryId', jobs, jobChecked, setJobChecked, setJobs)}
                >
                  삭제
                </button>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div className="panel-title">교육과정분류</div>
              <div className="panel-desc">과정 성격별 세부 분류 관리</div>
            </div>
            <div className="panel-body">
              {loadErrors.courses && <p role="alert">{loadErrors.courses}</p>}
              <div className="create-box">
                <div className="create-grid" style={{gridTemplateColumns: "1fr 100px 90px"}}>
                  <div className="field">
                    <label>교육과정분류명</label>
                    <input
                      type="text"
                      placeholder="교육과정분류명 입력"
                      value={courseForm.categoryName}
                      onChange={(e) => setCourseForm({...courseForm, categoryName: e.target.value})}
                    />
                  </div>
                  <div className="field">
                    <label>숨김</label>
                    <div className="check-field">
                      <input
                        type="checkbox"
                        checked={courseForm.hiddenYn === "Y"}
                        onChange={(e) => setCourseForm({...courseForm, hiddenYn: e.target.checked ? "Y" : "N"})}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={addCourse} disabled={saving.courses}>
                    {saving.courses ? '저장 중...' : '+ 추가'}
                  </button>
                </div>
              </div>

              <div className="notice">
                등록과정 수를 클릭하면 해당 분류에 속한 과정 목록 화면으로 이동합니다.
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{width: 50}}>
                        <input
                          type="checkbox"
                          checked={courses.length > 0 && courseChecked.size === courses.length}
                          onChange={(e) =>
                            toggleAll(setCourseChecked, courses.length)(e.target.checked)
                          }
                        />
                      </th>
                      <th>교육과정분류명</th>
                      <th style={{width: 90}}>순서</th>
                      <th style={{width: 80}}>숨김</th>
                      <th style={{width: 100}}>등록과정수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((row, i) => (
                      <tr key={row.educationCategoryId ?? `new-${i}`}>
                        <td className="center">
                          <input
                            type="checkbox"
                            checked={courseChecked.has(i)}
                            onChange={() => toggle(setCourseChecked)(i)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.categoryName ?? ""}
                            onChange={(e) => patchCourse(i, {categoryName: e.target.value})}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.sortOrder ?? 0}
                            onChange={(e) => patchCourse(i, {sortOrder: Number(e.target.value)})}
                          />
                        </td>
                        <td className="center">
                          <input
                            type="checkbox"
                            checked={row.hiddenYn === "Y"}
                            onChange={(e) => patchCourse(i, {hiddenYn: e.target.checked ? "Y" : "N"})}
                          />
                        </td>
                        <td className="center">
                          <CountBadge row={row} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="actions">
                <button
                  className="btn btn-small"
                  disabled={saving.courses}
                  onClick={() => updateChecked('/v1/educationCategories', 'courses', 'educationCategoryId', courses, courseChecked, setCourseChecked, setCourses)}
                >
                  수정
                </button>
                <button
                  className="btn btn-small btn-danger"
                  disabled={saving.courses}
                  onClick={() => deleteChecked('/v1/educationCategories', 'courses', 'educationCategoryId', courses, courseChecked, setCourseChecked, setCourses)}
                >
                  삭제
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="footer-note">LMS 관리자 · 과정분류 관리</div>
      </div>
    </div>
  );
}
