import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import './AdmissionApplicationList.css';

const STATUSES = ['가접수', '접수', '면접', '합격', '불합격', '취소', '후보', '대기'];
const APPROVALS = ['미승인', '검토중', '승인', '반려'];

const INITIAL_STUDENTS = [
  { status: '접수', approval: '대기', name: '김민준', birth: '1998-03-14', gender: '남', phone: '010-4821-7732', region: '서울 강서구', date: '2026-10-28', history: '2026-10-28 온라인 접수 / 2026-10-29 상담완료', pretest: true, today: false },
  { status: '면접', approval: '검토중', name: '이서연', birth: '2000-07-22', gender: '여', phone: '010-7754-2190', region: '경기 부천시', date: '2026-10-29', history: '온라인 접수 → 서류확인 → 11/03 면접예정', pretest: true, today: false },
  { status: '합격', approval: '승인', name: '박지훈', birth: '1996-11-05', gender: '남', phone: '010-2388-5514', region: '서울 양천구', date: '2026-10-26', history: '전화문의 → 방문상담 → 면접완료 → 최종합격', pretest: true, today: false },
  { status: '합격', approval: '승인', name: '최유진', birth: '1999-01-19', gender: '여', phone: '010-6613-9820', region: '인천 부평구', date: '2026-10-27', history: '고용24 접수 → 상담완료 → 사전시험 → 합격', pretest: true, today: false },
  { status: '가접수', approval: '미승인', name: '정우성', birth: '1997-05-08', gender: '남', phone: '010-3145-7798', region: '서울 마포구', date: '2026-11-02', history: '과정문의 후 가접수 등록', pretest: false, today: true },
  { status: '대기', approval: '검토중', name: '한지민', birth: '2001-09-11', gender: '여', phone: '010-8234-1612', region: '경기 고양시', date: '2026-11-02', history: '온라인 접수 → 서류보완 요청', pretest: false, today: true },
  { status: '후보', approval: '검토중', name: '윤도현', birth: '1995-12-30', gender: '남', phone: '010-5018-2267', region: '서울 영등포구', date: '2026-10-25', history: '면접완료 / 정원초과로 후보 등록', pretest: true, today: false },
  { status: '불합격', approval: '반려', name: '오세진', birth: '1998-06-17', gender: '남', phone: '010-4430-9001', region: '경기 광명시', date: '2026-10-24', history: '서류검토 → 면접완료 → 최종 불합격', pretest: true, today: false },
];

export default function AdmissionApplicationList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [statusInput, setStatusInput] = useState('전체');
  const [keywordInput, setKeywordInput] = useState('');
  const [applied, setApplied] = useState({ status: '전체', keyword: '' });
  const [checked, setChecked] = useState(() => new Set());

  const filtered = students.filter((s) => {
    if (applied.status !== '전체' && s.status !== applied.status) return false;
    const kw = applied.keyword.trim().toLowerCase();
    if (kw && ![s.name, s.phone, s.region].join(' ').toLowerCase().includes(kw)) return false;
    return true;
  });

  const selectedNames = filtered.filter((s) => checked.has(s.name)).map((s) => s.name);
  const allChecked = filtered.length > 0 && selectedNames.length === filtered.length;

  const patch = (name, p) => setStudents((list) => list.map((s) => (s.name === name ? { ...s, ...p } : s)));
  const removeNames = (names) => {
    setStudents((list) => list.filter((s) => !names.includes(s.name)));
    setChecked((c) => new Set([...c].filter((n) => !names.includes(n))));
  };
  const toggle = (name) =>
    setChecked((c) => {
      const n = new Set(c);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  const toggleAll = (on) =>
    setChecked((c) => {
      const n = new Set(c);
      filtered.forEach((s) => (on ? n.add(s.name) : n.delete(s.name)));
      return n;
    });

  const requireSelection = (msg) => {
    if (!selectedNames.length) {
      alert(msg);
      return false;
    }
    return true;
  };

  const SUMMARY = [
    ['총 접수자', students.length],
    ['합격', students.filter((s) => s.status === '합격').length],
    ['면접', students.filter((s) => s.status === '면접').length],
    ['대기/후보', students.filter((s) => s.status === '대기' || s.status === '후보').length],
    ['오늘 접수', students.filter((s) => s.today).length],
  ];

  return (
    <div className="pg-admission-application-list">
      <div className="page">
        <PageHeader title="입학접수목록" desc="선택한 과정에 접수한 학생들의 신청 및 승인상태를 관리합니다.">
          <button className="btn" onClick={() => navigate(-1)}>과정보기</button>
        </PageHeader>

        <section className="card">
          <div className="card-body">
            <div className="course-banner">
              <div>
                <div className="course-main">[내일배움카드(재직자)] [대구] 재직자를 위한 고급 JAVA 개발</div>
                <div className="course-sub">교육기간 2026.11.21 ~ 2027.03.31 · 모집/진행 · 승인인원 17명</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-small" onClick={() => navigate('/entry-popup')}>간편입력</button>
                <button className="btn btn-small" onClick={() => alert('사전시험 관리 영역입니다.')}>사전시험</button>
                <button className="btn btn-small" onClick={() => alert('엑셀 다운로드 영역입니다.')}>엑셀</button>
              </div>
            </div>

            <div className="controls">
              <div className="field">
                <div className="label">과정상태</div>
                <div className="control">
                  <select defaultValue="모집/진행">
                    {['모집/진행', '모집중', '진행중', '종료'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <div className="label">생기부오픈여부</div>
                <div className="control">
                  <select defaultValue="차단">
                    <option>차단</option>
                    <option>허용</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <div className="label">접수상태</div>
                <div className="control">
                  <select value={statusInput} onChange={(e) => { setStatusInput(e.target.value); setApplied((a) => ({ ...a, status: e.target.value })); }}>
                    <option value="전체">전체</option>
                    {['가접수', '접수', '면접', '합격', '불합격', '후보', '대기', '취소'].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <div className="label">검색</div>
                <div className="control">
                  <input
                    type="text"
                    placeholder="이름 / 연락처 / 지역"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              <button className="btn btn-primary" onClick={() => setApplied({ status: statusInput, keyword: keywordInput })}>검색</button>
              <button
                className="btn"
                onClick={() => {
                  setStatusInput('전체');
                  setKeywordInput('');
                  setApplied({ status: '전체', keyword: '' });
                }}
              >
                초기화
              </button>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">접수 학생 현황</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>이름을 클릭하면 신청자 상세정보를 확인합니다.</div>
          </div>
          <div className="card-body">
            <div className="summary-grid">
              {SUMMARY.map(([label, value]) => (
                <div className="summary-card" key={label}>
                  <div className="summary-label">{label}</div>
                  <div className="summary-value">{value}</div>
                </div>
              ))}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 42 }}>
                      <input type="checkbox" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} />
                    </th>
                    <th style={{ width: 105 }}>접수상태</th>
                    <th style={{ width: 100 }}>승인상태</th>
                    <th style={{ width: 95 }}>이름</th>
                    <th style={{ width: 110 }}>생년월일</th>
                    <th style={{ width: 42 }}>성별</th>
                    <th style={{ width: 140 }}>대표연락처</th>
                    <th style={{ width: 110 }}>지역</th>
                    <th style={{ width: 110 }}>접수일</th>
                    <th>신청이력</th>
                    <th style={{ width: 90 }}>사전시험</th>
                    <th style={{ width: 180 }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.name}>
                      <td className="center">
                        <input type="checkbox" checked={checked.has(s.name)} onChange={() => toggle(s.name)} />
                      </td>
                      <td className="center">
                        <select className="small-select" value={s.status} onChange={(e) => patch(s.name, { status: e.target.value })}>
                          {STATUSES.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="center">
                        <select className="small-select" value={s.approval} onChange={(e) => patch(s.name, { approval: e.target.value })}>
                          {APPROVALS.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="center">
                        <button className="name-btn" onClick={() => alert(`"${s.name}" 신청자의 상세정보 화면으로 이동합니다.`)}>{s.name}</button>
                      </td>
                      <td className="center">{s.birth}</td>
                      <td className="center">{s.gender}</td>
                      <td className="center">{s.phone}</td>
                      <td className="center">{s.region}</td>
                      <td className="center">{s.date}</td>
                      <td><div className="history"><strong>{s.status}</strong> · {s.history}</div></td>
                      <td className="center">
                        {s.pretest ? <span className="test-ok">응시</span> : <span className="test-no">미응시</span>}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="mini-btn primary" onClick={() => alert(`"${s.name}" 신청자의 상세정보 화면으로 이동합니다.`)}>상세</button>
                          <button className="mini-btn" onClick={() => alert(`"${s.name}" 학생에게 문자 발송 화면을 엽니다.`)}>문자</button>
                          <button
                            className="mini-btn danger"
                            onClick={() => confirm(`"${s.name}" 학생의 접수정보를 삭제하시겠습니까?`) && removeNames([s.name])}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bottom-actions">
              <div className="left-actions">
                <button
                  className="btn btn-small"
                  onClick={() => requireSelection('대상 학생을 선택하세요.') && alert(`${selectedNames.length}명의 접수상태를 일괄 변경하는 기능 영역입니다.`)}
                >
                  상태변경
                </button>
                <button
                  className="btn btn-small"
                  onClick={() => requireSelection('문자를 보낼 학생을 선택하세요.') && alert(`${selectedNames.length}명에게 문자 발송 화면을 엽니다.`)}
                >
                  문자전송
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() =>
                    requireSelection('삭제할 학생을 선택하세요.') &&
                    confirm(`${selectedNames.length}명의 접수정보를 삭제하시겠습니까?`) &&
                    removeNames(selectedNames)
                  }
                >
                  삭제
                </button>
              </div>
              <div className="right-actions">
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>검색결과 {filtered.length}명</span>
              </div>
            </div>
          </div>
        </section>

        <div className="footer-note">LMS 관리자 · 입학접수목록</div>
      </div>
    </div>
  );
}
