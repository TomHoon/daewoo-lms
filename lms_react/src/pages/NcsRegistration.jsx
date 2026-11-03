import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import SubNav from '../components/SubNav.jsx';
import './NcsRegistration.css';

export default function NcsRegistration() {
  const navigate = useNavigate();
  const {search, state} = useLocation();
  const course = state?.course;
  const courseTitle = course ? [
    course.trainingJobCategoryName && `[${course.trainingJobCategoryName}]`,
    course.educationCategoryName && `[${course.educationCategoryName}]`,
    course.campus && `[${course.campus}]`,
    course.name,
  ].filter(Boolean).join(' ') : '선택된 과정이 없습니다.';
  const openList = () => navigate(`/ncs-list${search}`, {state});
  const [subject, setSubject] = useState('');
  const [units, setUnits] = useState([]);

  const patchUnit = (i, p) => setUnits((l) => l.map((u, k) => (k === i ? { ...u, ...p } : u)));
  const setElement = (i, j, v) => patchUnit(i, { elements: units[i].elements.map((e, k) => (k === j ? v : e)) });

  const addUnit = () =>
    setUnits((l) => [...l, { name: '', code: '', hours: 0, nonNcs: false, pretest: false, elements: [''] }]);
  const removeUnit = (i) => {
    if (confirm('이 능력단위를 삭제하시겠습니까?')) setUnits((l) => l.filter((_, k) => k !== i));
  };
  const addElement = (i) => patchUnit(i, { elements: [...units[i].elements, ''] });
  const removeElement = (i, j) => {
    if (units[i].elements.length <= 1) return alert('최소 1개의 요소는 유지해야 합니다.');
    patchUnit(i, { elements: units[i].elements.filter((_, k) => k !== j) });
  };

  const saveAll = () => {
    if (!subject.trim()) return alert('교과목명을 입력하세요.');
    if (!units.length) return alert('능력단위를 1개 이상 등록하세요.');
    if (units.some((u) => !u.name.trim())) return alert('능력단위명을 모두 입력하세요.');
    if (units.some((u) => u.elements.some((e) => !e.trim()))) return alert('능력단위 요소명을 모두 입력하세요.');
    alert(`저장 완료\n교과목: ${subject}\n능력단위: ${units.length}개`);
  };

  return (
    <div className="pg-ncs-registration">
      <div className="page">
        <PageHeader title="NCS 평가항목 등록" desc="교과목별 능력단위와 능력단위 요소를 등록합니다.">
          <button className="btn" onClick={openList}>NCS 평가목록</button>
        </PageHeader>

        <section className="card">
          <div className="card-body">
            <div className="course-banner">
              <div>
                <div className="course-name" style={course?.color ? {color: course.color} : undefined}>{courseTitle}</div>
                {course && <div className="course-meta">교육기간 {course.start || '-'} ~ {course.end || '-'}{course.status ? ` · ${course.status}` : ''}</div>}
              </div>
              <button className="btn btn-small" onClick={() => alert('CSV 등록 기능 영역입니다.')}>CSV 파일로 항목 등록</button>
            </div>

            <SubNav active={1} />

            <div className="notice">교과목 아래에 능력단위를 등록하고, 각 능력단위별 요소를 추가할 수 있습니다.</div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><div className="section-title">NCS 평가항목</div></div>
          <div className="card-body">
            <div className="form-row">
              <div className="label">교과목명</div>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} />
              <button className="btn btn-primary btn-small" onClick={addUnit}>+ 능력단위 추가</button>
            </div>

            <div className="unit-list">
              {units.length === 0 && <div className="empty">등록된 능력단위가 없습니다.</div>}
              {units.map((u, i) => (
                <div className="unit-card" key={i}>
                  <div className="unit-head">
                    <div className="field">
                      <label>능력단위명</label>
                      <input value={u.name} onChange={(e) => patchUnit(i, { name: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>분류번호</label>
                      <input value={u.code} onChange={(e) => patchUnit(i, { code: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>훈련시간</label>
                      <input type="number" value={u.hours} onChange={(e) => patchUnit(i, { hours: Number(e.target.value) })} />
                    </div>
                    <div className="field">
                      <label>비NCS</label>
                      <div className="checkbox-field"><input type="checkbox" checked={u.nonNcs} onChange={(e) => patchUnit(i, { nonNcs: e.target.checked })} /></div>
                    </div>
                    <div className="field">
                      <label>사전평가</label>
                      <div className="checkbox-field"><input type="checkbox" checked={u.pretest} onChange={(e) => patchUnit(i, { pretest: e.target.checked })} /></div>
                    </div>
                    <div className="field">
                      <label>관리</label>
                      <button className="btn btn-danger btn-small" onClick={() => removeUnit(i)}>삭제</button>
                    </div>
                  </div>
                  <div className="element-section">
                    <div className="element-head">
                      <div className="element-title">능력단위 요소</div>
                      <button className="btn btn-small" onClick={() => addElement(i)}>+ 요소 추가</button>
                    </div>
                    <div>
                      {u.elements.map((el, j) => (
                        <div className="element-row" key={j}>
                          <input value={el} onChange={(e) => setElement(i, j, e.target.value)} />
                          <button className="btn btn-danger btn-small" onClick={() => removeElement(i, j)}>삭제</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="footer-actions">
          <button className="btn" onClick={openList}>목록</button>
          <button className="btn btn-primary" onClick={saveAll}>저장</button>
        </div>
      </div>
    </div>
  );
}
