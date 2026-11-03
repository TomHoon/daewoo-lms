import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import SubNav from '../components/SubNav.jsx';
import './NcsManagement.css';

const MANAGE_MENU = [
  ['훈련일지', '/train-diary'], ['NCS 평가'], ['수료/이수증 발급'], ['월별출결상황표'],
  ['자리배치도'], ['점검 체크리스트'], ['능력단위 출석부'],
];
const TABS = ['전체보기', '사전평가', '중간평가', '최종평가'];
const AUTHORS = ['김교사', '이교사', '박교사'];

const INITIAL_EVALS = [
  { id: 1, status: '시험중', author: '김교사', category: '최종평가(능력단위)', tool: '서술형', studentCheck: '-', subject: '바리스타 > 커피 원두 선택', unit: '커피 원두 선택 평가', element: '원두 품질 확인', retest: '첫시험', signed: '12/12', password: '1111', date: '2026.12.05', pass: 60 },
  { id: 2, status: '대기', author: '김교사', category: '중간평가(요소별)', tool: '서술형', studentCheck: '-', subject: '바리스타 > 커피기계 운용', unit: '커피기계 운용 이론', element: '기계 구조 이해', retest: '첫시험', signed: '0/12', password: '1111', date: '2026.11.25', pass: 60 },
  { id: 3, status: '대기', author: '김교사', category: '최종평가(능력단위)', tool: '작업장평가', studentCheck: '-', subject: '바리스타 > 커피기계 운용', unit: '커피기계 운용 실습', element: '장비 운용', retest: '첫시험', signed: '0/12', password: '1111', date: '2026.12.18', pass: 60 },
  { id: 4, status: '종료', author: '이교사', category: '사전평가', tool: '체크리스트', studentCheck: '가능', subject: '바리스타 > 기본 위생관리', unit: '기초 역량 사전평가', element: '위생관리 기본', retest: '없음', signed: '12/12', password: '2222', date: '2026.11.03', pass: 60 },
];

export default function NcsManagement() {
  const navigate = useNavigate();
  const [evals, setEvals] = useState(INITIAL_EVALS);

  const patch = (id, p) => setEvals((l) => l.map((e) => (e.id === id ? { ...e, ...p } : e)));
  const remove = (id) => {
    if (confirm('이 평가를 삭제하시겠습니까?')) setEvals((l) => l.filter((e) => e.id !== id));
  };

  return (
    <div className="pg-ncs-management">
      <div className="page">
        <PageHeader title="NCS 평가 관리" desc="과정별 NCS 평가계획과 평가도구, 능력단위, 응시 및 결과를 관리합니다.">
          <button className="btn" onClick={() => navigate('/course-detail')}>과정 상세</button>
        </PageHeader>

        <section className="card">
          <div className="card-body">
            <div className="course-banner">
              <div>
                <div className="course-name">[내일배움카드(실업자)] 한식 조리사 자격증 대비반</div>
                <div className="course-meta">교육기간 2026.11.04 ~ 2027.01.16 · 본원 · 진행중</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge success">진행중</span>
                <span className="badge gray">생기부 오픈</span>
                <button className="btn btn-small">전체인쇄</button>
              </div>
            </div>

            <div className="management-grid">
              {MANAGE_MENU.map(([label, to]) => (
                <button
                  key={label}
                  className={'manage-btn' + (label === 'NCS 평가' ? ' active' : '')}
                  onClick={() => to && navigate(to)}
                >
                  {label}
                </button>
              ))}
            </div>

            <SubNav active={2} />
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">평가 검색</div>
            <label style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>
              <input type="checkbox" defaultChecked /> 평가관련 요약설명 숨기기
            </label>
          </div>
          <div className="card-body">
            <div className="filter-grid">
              <div className="field"><div className="label">대분류</div><div className="control"><select><option>전체</option><option>바리스타</option></select></div></div>
              <div className="field"><div className="label">교과목</div><div className="control"><select><option>전체</option><option>커피 원두 선택</option><option>커피기계 운용</option></select></div></div>
              <div className="field"><div className="label">능력단위</div><div className="control"><select><option>전체</option><option>커피 원두 선택</option><option>커피기계 운용</option></select></div></div>
              <div className="field"><div className="label">평가도구</div><div className="control"><select><option>전체</option><option>서술형</option><option>작업장평가</option><option>체크리스트</option></select></div></div>
            </div>
            <div className="filter-actions">
              <button className="btn btn-primary">검색</button>
              <button className="btn" onClick={() => alert('검색조건을 초기화했습니다.')}>초기화</button>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">NCS 평가 목록</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>서술형 평가는 점수를 직접 입력할 수 있습니다.</div>
          </div>
          <div className="card-body">
            <div className="tabs">
              {TABS.map((t, i) => <button key={t} className={'tab' + (i === 0 ? ' active' : '')}>{t}</button>)}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 42 }}><input type="checkbox" /></th>
                    <th style={{ width: 120 }}>상태<br />출제자</th>
                    <th style={{ width: 150 }}>구분</th>
                    <th style={{ width: 140 }}>평가도구명<br />평가도구</th>
                    <th style={{ width: 100 }}>학생별 항목<br />체크가능</th>
                    <th>교과목</th>
                    <th>능력단위<br />시험명</th>
                    <th style={{ width: 150 }}>요소</th>
                    <th style={{ width: 90 }}>재시험 여부</th>
                    <th style={{ width: 110 }}>응시/사인 인원</th>
                    <th style={{ width: 90 }}>비밀번호</th>
                    <th style={{ width: 110 }}>평가일자</th>
                    <th style={{ width: 90 }}>패스점수</th>
                    <th style={{ width: 150 }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {evals.map((e) => (
                    <tr key={e.id}>
                      <td className="center"><input type="checkbox" /></td>
                      <td className="center">
                        <select className="small-select" value={e.status} onChange={(ev) => patch(e.id, { status: ev.target.value })}>
                          {['대기', '시험중', '종료'].map((v) => <option key={v}>{v}</option>)}
                        </select>
                        <div style={{ marginTop: 6 }}>
                          <select className="small-select" value={e.author} onChange={(ev) => patch(e.id, { author: ev.target.value })}>
                            {AUTHORS.map((v) => <option key={v}>{v}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="center"><span className="type-badge">{e.category}</span></td>
                      <td className="center">
                        <div className="tool-name">{e.tool}</div>
                        <div className="pass" style={{ marginTop: 4 }}>[점수직접입력형]</div>
                      </td>
                      <td className="center">{e.studentCheck}</td>
                      <td>{e.subject}</td>
                      <td><strong>{e.unit}</strong></td>
                      <td>{e.element}</td>
                      <td className="center purple">{e.retest}</td>
                      <td className="center">{e.signed}</td>
                      <td className="center red">{e.password}</td>
                      <td className="center">{e.date}</td>
                      <td className="center red">{e.pass}점</td>
                      <td className="center">
                        <div className="row-actions">
                          <button className="mini-btn" onClick={() => alert('평가 수정')}>수정</button>
                          <button className="mini-btn delete" onClick={() => remove(e.id)}>삭제</button>
                          <button className="mini-btn" onClick={() => alert('평가 인쇄')}>인쇄</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="notice">※ 평가도구에 따라 학생별 점수입력 또는 체크리스트 채점 방식이 달라집니다.</div>
          </div>
        </section>

        <div className="footer-note">LMS 관리자 · 과정 상세 &gt; NCS 평가 관리</div>
      </div>
    </div>
  );
}
