import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import SubNav from '../components/SubNav.jsx';
import './NcsList.css';

const SUBJECTS = [
  {
    name: '바리스타',
    units: [
      { name: '커피 원두 선택', code: '1301020302_13v1', hours: 5, nonNcs: false, pretest: false, mixed: false,
        elements: [{ name: '커피 원두 선택 이론(최종)', state: 'done', failed: 2 }, { name: '원두 품질 판별', state: 'ready', failed: 0 }] },
      { name: '커피기계 운용', code: '1301020303_16v2', hours: 5, nonNcs: false, pretest: false, mixed: false,
        elements: [{ name: '커피기계 운용 이론(중간)', state: 'active', failed: 0 }, { name: '커피기계 운용 실습(최종)', state: 'done', failed: 1 }] },
      { name: '사전평가', code: '', hours: 0, nonNcs: false, pretest: true, mixed: false,
        elements: [{ name: '바리스타 사전평가', state: 'done', failed: 0 }] },
    ],
  },
  {
    name: '위생관리',
    units: [
      { name: '식품위생관리', code: '1301010101_17v1', hours: 8, nonNcs: false, pretest: false, mixed: false,
        elements: [{ name: '개인위생 및 작업장 위생관리', state: 'none', failed: 0 }] },
      { name: '비NCS 기초소양', code: 'ETC-001', hours: 4, nonNcs: true, pretest: false, mixed: true,
        elements: [{ name: '직업윤리 및 서비스 기본', state: 'ready', failed: 0 }] },
    ],
  },
];

const STATE_LABEL = {
  none: ['미등록', 'none'],
  ready: ['평가등록', 'ready'],
  active: ['평가진행중', 'active'],
  done: ['평가완료', 'done'],
};

export default function NcsList() {
  const navigate = useNavigate();

  const unitCount = SUBJECTS.reduce((s, sub) => s + sub.units.length, 0);
  const elementCount = SUBJECTS.reduce((s, sub) => s + sub.units.reduce((a, u) => a + u.elements.length, 0), 0);

  const registerEval = (name) =>
    alert(`"${name}" 평가 등록 화면으로 이동합니다.\n\n선택한 평가항목 정보가 자동으로 전달됩니다.`);
  const openResult = (name) => alert(`"${name}" 평가 및 결과확인 화면으로 이동합니다.`);
  const registerRetest = (name, failed) =>
    alert(`"${name}" 재평가 등록 화면으로 이동합니다.\n불합격 대상자: ${failed}명`);

  const ActionButtons = ({ el }) => {
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
          <button className="btn" onClick={() => navigate('/course-detail')}>과정 상세</button>
        </PageHeader>

        <section className="card">
          <div className="card-body">
            <div className="course-banner">
              <div>
                <div className="course-name">[내일배움카드(실업자)] 한식 조리사 자격증 대비반</div>
                <div className="course-meta">교육기간 2026.11.04 ~ 2027.01.16 · 진행중</div>
              </div>
              <div className="badges">
                <span className="badge success">진행중</span>
                <span className="badge blue">NCS 평가관리</span>
                <span className="badge gray">생기부 오픈</span>
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
              교과목 {SUBJECTS.length}개 · 능력단위 {unitCount}개 · 요소 {elementCount}개
            </div>
          </div>
          <div className="card-body">
            {SUBJECTS.map((subject) => (
              <div className="subject-card" key={subject.name}>
                <div className="subject-head">
                  <div className="subject-name">{subject.name}</div>
                  <div className="subject-actions">
                    <button className="btn btn-small" onClick={() => alert(`교과목 수정: ${subject.name}`)}>수정</button>
                    <button className="btn btn-small btn-danger" onClick={() => alert(`교과목 삭제: ${subject.name}`)}>삭제</button>
                  </div>
                </div>

                {subject.units.map((unit) => (
                  <div className="unit-block" key={unit.name}>
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
                        const [label, cls] = STATE_LABEL[el.state];
                        return (
                          <div className="element-row" key={el.name}>
                            <div>{el.name}</div>
                            <div className="center"><span className={'eval-state ' + cls}>{label}</span></div>
                            <div className="action-cell"><ActionButtons el={el} /></div>
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
