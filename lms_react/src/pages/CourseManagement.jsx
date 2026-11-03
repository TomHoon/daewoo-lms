import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import './CourseManagement.css';

const INITIAL_JOBS = [
  { order: 0, name: '국가기간전략산업', worker: false, hidden: false, count: 1 },
  { order: 0, name: '내일배움카드(실업자)', worker: false, hidden: false, count: 5 },
  { order: 0, name: '내일배움카드(재직자)', worker: true, hidden: false, count: 1 },
  { order: 0, name: '일반과정', worker: false, hidden: false, count: 1 },
];
const INITIAL_COURSES = [
  { name: '컴퓨터활용', order: 1, hidden: false, count: 0 },
  { name: 'UI/UX디자인', order: 2, hidden: false, count: 1 },
  { name: '프로그래밍', order: 3, hidden: false, count: 1 },
  { name: '바리스타', order: 4, hidden: false, count: 3 },
  { name: '한식 조리사', order: 5, hidden: false, count: 3 },
];

export default function CourseManagement() {
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [jobChecked, setJobChecked] = useState(() => new Set());
  const [courseChecked, setCourseChecked] = useState(() => new Set());
  const [jobForm, setJobForm] = useState({ order: '0', name: '', worker: false, hidden: false });
  const [courseForm, setCourseForm] = useState({ name: '', hidden: false });

  const patch = (setter) => (i, p) => setter((list) => list.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const patchJob = patch(setJobs);
  const patchCourse = patch(setCourses);

  const toggle = (setter) => (i) =>
    setter((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  const toggleAll = (setter, length) => (on) => setter(on ? new Set(Array.from({ length }, (_, i) => i)) : new Set());

  const addJob = () => {
    const name = jobForm.name.trim();
    if (!name) return alert('훈련직종분류명을 입력하세요.');
    setJobs((l) => [...l, { order: Number(jobForm.order || 0), name, worker: jobForm.worker, hidden: jobForm.hidden, count: 0 }]);
    setJobForm((f) => ({ ...f, name: '' }));
  };
  const addCourse = () => {
    const name = courseForm.name.trim();
    if (!name) return alert('교육과정분류명을 입력하세요.');
    const maxOrder = courses.length ? Math.max(...courses.map((x) => x.order)) : 0;
    setCourses((l) => [...l, { name, order: maxOrder + 1, hidden: courseForm.hidden, count: 0 }]);
    setCourseForm((f) => ({ ...f, name: '' }));
  };

  const deleteChecked = (checked, setChecked, setList) => {
    if (!checked.size) return alert('삭제할 항목을 선택하세요.');
    if (!confirm('선택한 분류를 삭제하시겠습니까?')) return;
    setList((l) => l.filter((_, i) => !checked.has(i)));
    setChecked(new Set());
  };

  const openCourses = (row) =>
    alert(`"${row.name}" 분류의 등록과정 목록으로 이동합니다.\n현재 등록과정: ${row.count}개`);

  const CountBadge = ({ row }) => (
    <span className={'course-count' + (row.count === 0 ? ' zero' : '')} onClick={() => openCourses(row)}>{row.count}</span>
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
              <div className="create-box">
                <div className="create-grid">
                  <div className="field">
                    <label>출력순서</label>
                    <input type="number" value={jobForm.order} onChange={(e) => setJobForm({ ...jobForm, order: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>훈련직종분류명</label>
                    <input type="text" placeholder="훈련직종분류명 입력" value={jobForm.name} onChange={(e) => setJobForm({ ...jobForm, name: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>재직자</label>
                    <div className="check-field"><input type="checkbox" checked={jobForm.worker} onChange={(e) => setJobForm({ ...jobForm, worker: e.target.checked })} /></div>
                  </div>
                  <div className="field">
                    <label>숨김</label>
                    <div className="check-field"><input type="checkbox" checked={jobForm.hidden} onChange={(e) => setJobForm({ ...jobForm, hidden: e.target.checked })} /></div>
                  </div>
                  <button className="btn btn-primary" onClick={addJob}>+ 추가</button>
                </div>
              </div>

              <div className="notice">등록과정 수를 클릭하면 해당 분류에 속한 과정 목록 화면으로 이동합니다.</div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>
                        <input type="checkbox" checked={jobs.length > 0 && jobChecked.size === jobs.length} onChange={(e) => toggleAll(setJobChecked, jobs.length)(e.target.checked)} />
                      </th>
                      <th style={{ width: 100 }}>출력순서</th>
                      <th>훈련직종분류명</th>
                      <th style={{ width: 90 }}>재직자</th>
                      <th style={{ width: 80 }}>숨김</th>
                      <th style={{ width: 100 }}>등록과정수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((row, i) => (
                      <tr key={i}>
                        <td className="center"><input type="checkbox" checked={jobChecked.has(i)} onChange={() => toggle(setJobChecked)(i)} /></td>
                        <td><input type="number" value={row.order} onChange={(e) => patchJob(i, { order: Number(e.target.value) })} /></td>
                        <td><input type="text" value={row.name} onChange={(e) => patchJob(i, { name: e.target.value })} /></td>
                        <td className="center"><input type="checkbox" checked={row.worker} onChange={(e) => patchJob(i, { worker: e.target.checked })} /></td>
                        <td className="center"><input type="checkbox" checked={row.hidden} onChange={(e) => patchJob(i, { hidden: e.target.checked })} /></td>
                        <td className="center"><CountBadge row={row} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="actions">
                <button className="btn btn-small" onClick={() => alert('훈련직종분류 수정사항을 저장했습니다.')}>수정</button>
                <button className="btn btn-small btn-danger" onClick={() => deleteChecked(jobChecked, setJobChecked, setJobs)}>삭제</button>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div className="panel-title">교육과정분류</div>
              <div className="panel-desc">과정 성격별 세부 분류 관리</div>
            </div>
            <div className="panel-body">
              <div className="create-box">
                <div className="create-grid" style={{ gridTemplateColumns: '1fr 100px 90px' }}>
                  <div className="field">
                    <label>교육과정분류명</label>
                    <input type="text" placeholder="교육과정분류명 입력" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>숨김</label>
                    <div className="check-field"><input type="checkbox" checked={courseForm.hidden} onChange={(e) => setCourseForm({ ...courseForm, hidden: e.target.checked })} /></div>
                  </div>
                  <button className="btn btn-primary" onClick={addCourse}>+ 추가</button>
                </div>
              </div>

              <div className="notice">등록과정 수를 클릭하면 해당 분류에 속한 과정 목록 화면으로 이동합니다.</div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>
                        <input type="checkbox" checked={courses.length > 0 && courseChecked.size === courses.length} onChange={(e) => toggleAll(setCourseChecked, courses.length)(e.target.checked)} />
                      </th>
                      <th>교육과정분류명</th>
                      <th style={{ width: 90 }}>순서</th>
                      <th style={{ width: 80 }}>숨김</th>
                      <th style={{ width: 100 }}>등록과정수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((row, i) => (
                      <tr key={i}>
                        <td className="center"><input type="checkbox" checked={courseChecked.has(i)} onChange={() => toggle(setCourseChecked)(i)} /></td>
                        <td><input type="text" value={row.name} onChange={(e) => patchCourse(i, { name: e.target.value })} /></td>
                        <td><input type="number" value={row.order} onChange={(e) => patchCourse(i, { order: Number(e.target.value) })} /></td>
                        <td className="center"><input type="checkbox" checked={row.hidden} onChange={(e) => patchCourse(i, { hidden: e.target.checked })} /></td>
                        <td className="center"><CountBadge row={row} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="actions">
                <button className="btn btn-small" onClick={() => alert('교육과정분류 수정사항을 저장했습니다.')}>수정</button>
                <button className="btn btn-small btn-danger" onClick={() => deleteChecked(courseChecked, setCourseChecked, setCourses)}>삭제</button>
              </div>
            </div>
          </section>
        </div>

        <div className="footer-note">LMS 관리자 · 과정분류 관리</div>
      </div>
    </div>
  );
}
