import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import './AdmissionStatus.css';

const ROWS = [
  { category: '국가기간전략산업', course: 'AI 기반 클라우드 개발자 양성과정', clicks: 156, teacher: '김현수', start: '2026.11.10', end: '2027.05.30', approved: 24, applied: 19, pre: 2, receipt: 5, interview: 4, pass: 6, fail: 1, cancel: 0, candidate: 1, wait: 0, today: 2 },
  { category: '내일배움카드(실업자)', course: 'UI/UX 실무 디자이너 과정', clicks: 98, teacher: '이서연', start: '2026.11.17', end: '2027.03.28', approved: 20, applied: 12, pre: 1, receipt: 3, interview: 2, pass: 4, fail: 1, cancel: 0, candidate: 0, wait: 1, today: 1 },
  { category: '내일배움카드(재직자)', course: '[대구] 재직자를 위한 고급 JAVA 개발', clicks: 208, teacher: '박지훈', start: '2026.11.21', end: '2027.03.31', approved: 17, applied: 9, pre: 0, receipt: 2, interview: 1, pass: 5, fail: 0, cancel: 0, candidate: 0, wait: 1, today: 0 },
  { category: '일반과정', course: '커피 바리스타 자격증 대비반', clicks: 44, teacher: '최민아', start: '2026.12.01', end: '2027.01.20', approved: 16, applied: 10, pre: 1, receipt: 3, interview: 0, pass: 4, fail: 0, cancel: 1, candidate: 0, wait: 1, today: 1 },
];

const TABS = ['전체', '국가기간전략산업', '내일배움카드(실업자)', '내일배움카드(재직자)', '일반과정'];

const pct = (applied, approved) => (approved ? Math.round((applied / approved) * 100) + '%' : '0%');

export default function AdmissionStatus() {
  const [tab, setTab] = useState('전체');

  const filtered = tab === '전체' ? ROWS : ROWS.filter((r) => r.category === tab);
  const categories = [...new Set(filtered.map((r) => r.category))];
  const sum = (key) => filtered.reduce((s, r) => s + r[key], 0);

  const SUMMARY = [
    ['전체 과정', filtered.length],
    ['총 접수', sum('applied')],
    ['합격', sum('pass')],
    ['대기', sum('wait')],
    ['오늘 접수', sum('today')],
  ];

  return (
    <div className="pg-admission-status">
      <div className="page">
        <PageHeader title="입학접수현황" desc="훈련직종별 과정의 접수 및 입학 진행현황을 한눈에 확인합니다.">
          <button
            className="btn"
            onClick={() => alert('엑셀 다운로드 기능 영역입니다. 실제 LMS에서는 서버에서 엑셀 파일을 생성해 내려받습니다.')}
          >
            엑셀
          </button>
        </PageHeader>

        <section className="card">
          <div className="card-head">
            <div className="section-title">접수 현황 요약</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>실시간 집계 기준</div>
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

            <div className="tabs">
              {TABS.map((t) => (
                <button key={t} className={'tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>
                  {t === '전체' ? '전체보기' : t}
                </button>
              ))}
            </div>

            {categories.map((cat) => {
              const items = filtered.filter((r) => r.category === cat);
              return (
                <div className="group-block" key={cat}>
                  <div className="group-head">
                    <div className="group-title">
                      {cat} <strong>(Total : {items.length})</strong>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th rowSpan={2} style={{ width: 58 }}>번호</th>
                          <th rowSpan={2}>과정명</th>
                          <th rowSpan={2} style={{ width: 70 }}>클릭</th>
                          <th rowSpan={2} style={{ width: 90 }}>담임</th>
                          <th rowSpan={2} style={{ width: 120 }}>교육기간</th>
                          <th rowSpan={2} style={{ width: 70 }}>승인</th>
                          <th rowSpan={2} style={{ width: 70 }}>접수</th>
                          <th rowSpan={2} style={{ width: 80 }}>접수율</th>
                          <th colSpan={8}>입학상태</th>
                          <th rowSpan={2} style={{ width: 75, color: '#8a2be2' }}>오늘<br />접수</th>
                        </tr>
                        <tr>
                          <th>가접수</th>
                          <th>접수</th>
                          <th>면접</th>
                          <th style={{ color: '#198754' }}>합격</th>
                          <th style={{ color: '#d9534f' }}>불합격</th>
                          <th style={{ color: '#e83e8c' }}>취소</th>
                          <th>후보</th>
                          <th>대기</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 ? (
                          <tr><td className="empty" colSpan={17}>등록된 과정이 없습니다.</td></tr>
                        ) : (
                          items.map((r, i) => (
                            <tr key={r.course}>
                              <td className="center">{i + 1}</td>
                              <td><div className="course-name">{r.course}</div></td>
                              <td className="center">{r.clicks}</td>
                              <td className="center">{r.teacher}</td>
                              <td className="center">
                                <div className="date-range">
                                  <div className="start">{r.start}</div>
                                  <div className="end">{r.end}</div>
                                </div>
                              </td>
                              <td className="center">{r.approved}</td>
                              <td className="center stat">{r.applied}</td>
                              <td className="center stat">{pct(r.applied, r.approved)}</td>
                              <td className="center">{r.pre}</td>
                              <td className="center">{r.receipt}</td>
                              <td className="center">{r.interview}</td>
                              <td className="center stat pass">{r.pass}</td>
                              <td className="center stat fail">{r.fail}</td>
                              <td className="center stat cancel">{r.cancel}</td>
                              <td className="center">{r.candidate}</td>
                              <td className="center">{r.wait}</td>
                              <td className="center stat today">{r.today}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="footer-note">LMS 관리자 · 입학접수현황</div>
      </div>
    </div>
  );
}
