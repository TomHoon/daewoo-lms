import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import api from '../api/axios';
import './AdmissionApplicationList.css';

const STATUSES = ['가접수', '접수', '면접', '합격', '불합격', '취소', '후보', '대기'];
const APPROVALS = ['미승인', '검토중', '승인', '반려'];

export default function AdmissionApplicationList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || undefined;
  const batchId = searchParams.get('batchId') || undefined;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusInput, setStatusInput] = useState(searchParams.get('status') || '');
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') || '');
  const [applied, setApplied] = useState({ status: searchParams.get('status') || '', keyword: searchParams.get('keyword') || '' });
  const limit = 50;
  const [offset, setOffset] = useState(0);
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    const controller = new AbortController();
    const loadAdmissions = async () => {
      setLoading(true);
      setLoadError('');
      setStudents([]);
      setChecked(new Set());
      try {
        const {data} = await api.get('/v1/admissions', {
          params: {courseId, batchId, keyword: applied.keyword.trim() || undefined, status: applied.status || undefined, limit, offset},
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error('입학접수 응답이 배열이 아닙니다.');
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        setStudents(data.map((row, index) => {
          const date = (row.createdAt ?? row.date ?? '').slice(0, 10);
          return {
            ...row,
            id: row.admissionId ?? `row-${index}`,
            name: row.applicantName ?? row.name ?? '',
            birth: row.birthDate ?? row.birth ?? '-',
            gender: {M: '남', F: '여'}[row.gender] ?? row.gender ?? '-',
            phone: row.phone ?? '-',
            region: row.region ?? '-',
            status: row.status === 'RECEIVED' ? '접수' : row.status ?? '',
            approval: row.approval ?? '',
            history: row.history ?? '-',
            date: date || '-',
            today: date === today,
          };
        }));
        setChecked(new Set());
      } catch {
        if (!controller.signal.aborted) setLoadError('입학접수목록을 불러오지 못했습니다. 새로고침해 주세요.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadAdmissions();
    return () => controller.abort();
  }, [courseId, batchId, applied, offset]);

  const filtered = students;

  const selectedNames = filtered.filter((s) => checked.has(s.id)).map((s) => s.id);
  const allChecked = filtered.length > 0 && selectedNames.length === filtered.length;

  const patch = (id, p) => setStudents((list) => list.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const removeNames = (names) => {
    setStudents((list) => list.filter((s) => !names.includes(s.id)));
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
      filtered.forEach((s) => (on ? n.add(s.id) : n.delete(s.id)));
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
    ['현재 조회 접수자', students.length],
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
                <div className="course-main">{courseId ? `과정 ID: ${courseId}${batchId ? ` · 기수 ID: ${batchId}` : ''}` : '전체 과정 입학접수목록'}</div>
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
                  <select defaultValue="">
                    <option value="">과정상태 선택</option>
                    {['모집/진행', '모집중', '진행중', '종료'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <div className="label">생기부오픈여부</div>
                <div className="control">
                  <select defaultValue="">
                    <option value="">오픈여부 선택</option>
                    <option>차단</option>
                    <option>허용</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <div className="label">접수상태</div>
                <div className="control">
                  <select value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                    <option value="">전체</option>
                    <option value="RECEIVED">접수</option>
                    {statusInput && statusInput !== 'RECEIVED' && <option value={statusInput}>{statusInput}</option>}
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
              <button className="btn btn-primary" onClick={() => { setOffset(0); setApplied({ status: statusInput, keyword: keywordInput }); }}>검색</button>
              <button
                className="btn"
                onClick={() => {
                  setStatusInput('');
                  setKeywordInput('');
                  setOffset(0);
                  setApplied({ status: '', keyword: '' });
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
                  {(loading || loadError || filtered.length === 0) && (
                    <tr>
                      <td colSpan={12} className="center" role={loadError ? 'alert' : undefined}>{loading ? '불러오는 중...' : loadError || '접수 내역이 없습니다.'}</td>
                    </tr>
                  )}
                  {filtered.map((s) => (
                    <tr key={s.id}>
                      <td className="center">
                        <input type="checkbox" checked={checked.has(s.id)} onChange={() => toggle(s.id)} />
                      </td>
                      <td className="center">
                        <select className="small-select" value={s.status} onChange={(e) => patch(s.id, { status: e.target.value })}>
                          {!STATUSES.includes(s.status) && <option value={s.status}>{s.status || '-'}</option>}
                          {STATUSES.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="center">
                        <select className="small-select" value={s.approval} onChange={(e) => patch(s.id, { approval: e.target.value })}>
                          {!APPROVALS.includes(s.approval) && <option value={s.approval}>{s.approval || '-'}</option>}
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
                        {s.pretest == null ? '-' : s.pretest ? <span className="test-ok">응시</span> : <span className="test-no">미응시</span>}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="mini-btn primary" onClick={() => alert(`"${s.name}" 신청자의 상세정보 화면으로 이동합니다.`)}>상세</button>
                          <button className="mini-btn" onClick={() => alert(`"${s.name}" 학생에게 문자 발송 화면을 엽니다.`)}>문자</button>
                          <button
                            className="mini-btn danger"
                            onClick={() => confirm(`"${s.name}" 학생의 접수정보를 삭제하시겠습니까?`) && removeNames([s.id])}
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
                <button className="btn btn-small" disabled={loading || offset === 0} onClick={() => setOffset((value) => Math.max(0, value - limit))}>이전</button>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{Math.floor(offset / limit) + 1}페이지 · 조회 {filtered.length}명</span>
                <button className="btn btn-small" disabled={loading || Boolean(loadError) || students.length < limit} onClick={() => setOffset((value) => value + limit)}>다음</button>
              </div>
            </div>
          </div>
        </section>

        <div className="footer-note">LMS 관리자 · 입학접수목록</div>
      </div>
    </div>
  );
}
