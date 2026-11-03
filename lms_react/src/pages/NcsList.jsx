import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PageHeader from '../components/PageHeader.jsx';
import SubNav from '../components/SubNav.jsx';
import './NcsList.css';

const STATE_LABEL = {
  none: ['미등록', 'none'],
  ready: ['평가등록', 'ready'],
  active: ['평가진행중', 'active'],
  done: ['평가완료', 'done'],
};

export default function NcsList() {
  const navigate = useNavigate();
  const {state} = useLocation();
  const course = state?.course;
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || String(course?.courseId ?? course?.id ?? '');
  const batchId = searchParams.get('batchId') || String(course?.batchId ?? '');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const hasIds = Boolean(courseId && batchId);

  useEffect(() => {
    if (!courseId || !batchId) return;
    const controller = new AbortController();
    const loadUnits = async () => {
      setLoading(true);
      setLoadError('');
      setSubjects([]);
      try {
        const {data} = await api.get(`/v1/ncs/${encodeURIComponent(courseId)}/${encodeURIComponent(batchId)}/units`, {
          params: {includeInactive: false},
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error('능력단위 응답이 배열이 아닙니다.');
        const grouped = new Map();
        data.forEach((unit, index) => {
          const key = unit.subjectId ?? unit.subjectName ?? 'unclassified';
          if (!grouped.has(key)) grouped.set(key, {
            id: key, name: unit.subjectName ?? '교과목 정보 없음', units: [],
          });
          grouped.get(key).units.push({
            ...unit,
            id: unit.unitId ?? index,
            name: unit.unitName ?? unit.name ?? '',
            code: unit.unitCode ?? unit.code ?? '',
            hours: unit.trainingHours ?? unit.hours ?? '-',
            nonNcs: unit.nonNcsYn != null ? unit.nonNcsYn === 'Y' : Boolean(unit.nonNcs),
            pretest: unit.pretestYn != null ? unit.pretestYn === 'Y' : Boolean(unit.pretest),
            mixed: unit.mixedYn != null ? unit.mixedYn === 'Y' : Boolean(unit.mixed),
            elements: Array.isArray(unit.elements) ? unit.elements.map((element, elementIndex) => ({
              ...element,
              id: element.elementId ?? elementIndex,
              name: element.elementName ?? element.name ?? '',
            })) : [],
          });
        });
        setSubjects([...grouped.values()]);
      } catch {
        if (!controller.signal.aborted) setLoadError('평가항목 목록을 불러오지 못했습니다. 새로고침해 주세요.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadUnits();
    return () => controller.abort();
  }, [courseId, batchId]);
  const courseTitle = course ? [
    course.trainingJobCategoryName && `[${course.trainingJobCategoryName}]`,
    course.educationCategoryName && `[${course.educationCategoryName}]`,
    course.campus && `[${course.campus}]`,
    course.name,
  ].filter(Boolean).join(' ') : '선택된 과정이 없습니다.';

  const visibleSubjects = hasIds ? subjects : [];
  const unitCount = visibleSubjects.reduce((s, sub) => s + sub.units.length, 0);
  const elementCount = visibleSubjects.reduce((s, sub) => s + sub.units.reduce((a, u) => a + u.elements.length, 0), 0);

  const registerEval = (name) =>
    alert(`"${name}" 평가 등록 화면으로 이동합니다.\n\n선택한 평가항목 정보가 자동으로 전달됩니다.`);
  const openResult = (name) => alert(`"${name}" 평가 및 결과확인 화면으로 이동합니다.`);
  const registerRetest = (name, failed) =>
    alert(`"${name}" 재평가 등록 화면으로 이동합니다.\n불합격 대상자: ${failed}명`);

  const actionButtons = (el) => {
    if (!STATE_LABEL[el.state]) return '-';
    if (el.state === 'none') {
      return <button className="mini-btn primary" onClick={() => registerEval(el.name)}>평가등록</button>;
    }
    return (
      <>
        <button className="mini-btn result" onClick={() => openResult(el.name)}>평가 및 결과확인</button>
        {el.state === 'done' && el.failed > 0 && (
          <button className="mini-btn retest" onClick={() => registerRetest(el.name, el.failed)}>재평가 등록</button>
        )}
      </>
    );
  };

  return (
    <div className="pg-ncs-list">
      <div className="page">
        <PageHeader title="NCS 평가항목 목록" desc="등록된 교과목·능력단위·요소를 확인하고 실제 평가 등록 및 결과를 관리합니다.">
          <button className="btn" onClick={() => navigate('/course-list')}>과정 목록</button>
        </PageHeader>

        <section className="card">
          <div className="card-body">
            <div className="course-banner">
              <div>
                <div className="course-name" style={course?.color ? {color: course.color} : undefined}>{courseTitle}</div>
                {course && <div className="course-meta">교육기간 {course.start || '-'} ~ {course.end || '-'}{course.status ? ` · ${course.status}` : ''}</div>}
              </div>
              <div className="badges">
                {course?.status && <span className="badge success">{course.status}</span>}
                <span className="badge blue">NCS 평가관리</span>
                {course?.ledger && <span className="badge gray">운영대장 {course.ledger}</span>}
              </div>
            </div>

            <SubNav active={0} />

            <div className="utility-row">
              <button className="btn btn-small">항목 CSV 다운로드</button>
              <button className="btn btn-small">항목 정렬</button>
              <button className="btn btn-small btn-danger">모든 항목 삭제</button>
            </div>

            <div className="notice">
              평가가 아직 등록되지 않은 항목은 <b>평가등록</b>, 평가가 등록된 항목은 <b>평가 및 결과확인</b> 버튼이 표시됩니다.
              불합격자가 있는 완료 평가에는 <b>재평가 등록</b> 버튼이 추가됩니다.
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">교과목별 평가항목</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              교과목 {visibleSubjects.length}개 · 능력단위 {unitCount}개 · 요소 {elementCount}개
            </div>
          </div>
          <div className="card-body">
            {!hasIds ? <p>과정목록에서 기수 정보가 있는 과정을 선택해 주세요.</p> : loading ? <p>불러오는 중...</p> : loadError ? <p role="alert">{loadError}</p> : subjects.length === 0 && <p>등록된 평가항목이 없습니다.</p>}
            {visibleSubjects.map((subject) => (
              <div className="subject-card" key={subject.id}>
                <div className="subject-head">
                  <div className="subject-name">{subject.name}</div>
                  <div className="subject-actions">
                    <button className="btn btn-small" onClick={() => alert(`교과목 수정: ${subject.name}`)}>수정</button>
                    <button className="btn btn-small btn-danger" onClick={() => alert(`교과목 삭제: ${subject.name}`)}>삭제</button>
                  </div>
                </div>

                {subject.units.map((unit) => (
                  <div className="unit-block" key={unit.id}>
                    <div className="unit-grid">
                      <div><span className="unit-name">{unit.name}</span></div>
                      <div className="center">{unit.code || '-'}</div>
                      <div className="center">{unit.hours}시간</div>
                      <div className="center"><input className="checkbox-view" type="checkbox" checked={unit.nonNcs} disabled readOnly /></div>
                      <div className="center"><input className="checkbox-view" type="checkbox" checked={unit.pretest} disabled readOnly /></div>
                      <div className="center"><input className="checkbox-view" type="checkbox" checked={unit.mixed} disabled readOnly /></div>
                      <div className="action-cell">
                        <button className="mini-btn" onClick={() => alert(`수행정도 등록: ${unit.name}`)}>수행정도등록</button>
                        <button className="mini-btn" onClick={() => alert(`능력단위 수정: ${unit.name}`)}>수정</button>
                        <button className="mini-btn" onClick={() => alert(`능력단위 삭제: ${unit.name}`)}>삭제</button>
                      </div>
                    </div>

                    <div className="element-wrap">
                      <div className="element-head">
                        <div>요소명</div>
                        <div>평가상태</div>
                        <div>평가관리</div>
                      </div>
                      {unit.elements.map((el) => {
                        const [label, cls] = STATE_LABEL[el.state] ?? ['-', 'none'];
                        return (
                          <div className="element-row" key={el.id}>
                            <div>{el.name}</div>
                            <div className="center"><span className={'eval-state ' + cls}>{label}</span></div>
                            <div className="action-cell">{actionButtons(el)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div style={{ padding: '12px 14px', background: '#fbfcfe' }}>
                  <button className="btn btn-small" onClick={() => alert(`${subject.name} 능력단위 추가`)}>+ 능력단위 추가</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="footer-note">LMS 관리자 · NCS 평가항목 목록</div>
      </div>
    </div>
  );
}
