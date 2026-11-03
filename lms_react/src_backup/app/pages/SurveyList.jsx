import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import './SurveyList.css';

const PAGE_SIZE = 6;
const TYPES = ['과정', '취업', '사전', '기타'];
const STATUSES = ['대기', '설문중', '종료'];

const INITIAL_SURVEYS = [
  { id: 1, course: '모바일 디바이스를 위한 UI 디자인 (2026.03.04~2026.12.27)', survey: '사전평가', type: '사전', round: '1회차', respondents: 18, status: '대기' },
  { id: 2, course: '[공개] 취업 희망 희망직종', survey: '취업희망직종 조사', type: '취업', round: '1회차', respondents: 23, status: '설문중' },
  { id: 3, course: 'AI 에이전트 클라우드·보안코딩 개발자 양성', survey: '교육과정 만족도 조사', type: '과정', round: '2회차', respondents: 21, status: '설문중' },
  { id: 4, course: '재직자를 위한 고급 JAVA 개발', survey: '사전설문', type: '사전', round: '1회차', respondents: 16, status: '종료' },
  { id: 5, course: 'UI/UX 실무 디자이너 양성과정', survey: '중간 만족도 조사', type: '과정', round: '1회차', respondents: 19, status: '설문중' },
  { id: 6, course: '커피 바리스타 자격증 대비반', survey: '교육 만족도 조사', type: '과정', round: '1회차', respondents: 14, status: '종료' },
  { id: 7, course: '한식 조리사 자격증 대비반', survey: '수료 후 진로 조사', type: '기타', round: '1회차', respondents: 12, status: '대기' },
];

const EMPTY = { searchType: 'all', keyword: '', status: '전체', type: '전체' };

export default function SurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState(INITIAL_SURVEYS);
  const [form, setForm] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const [page, setPage] = useState(1);

  const filtered = surveys.filter((s) => {
    if (filters.type !== '전체' && s.type !== filters.type) return false;
    if (filters.status !== '전체' && s.status !== filters.status) return false;
    const kw = filters.keyword.trim().toLowerCase();
    if (kw) {
      const target =
        filters.searchType === 'course' ? s.course : filters.searchType === 'survey' ? s.survey : s.course + ' ' + s.survey;
      if (!target.toLowerCase().includes(kw)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const curPage = Math.min(page, totalPage);
  const items = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const patch = (id, p) => setSurveys((l) => l.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const addSurvey = () => navigate('/survey-registration');
  const remove = (s) => {
    if (confirm(`"${s.survey}" 설문을 삭제하시겠습니까?`)) setSurveys((l) => l.filter((x) => x.id !== s.id));
  };

  return (
    <div className="pg-survey-list">
      <div className="page">
        <PageHeader title="설문조사" desc="과정별 설문조사를 등록하고 상태, 응답결과, 개별출력을 관리합니다.">
          <button className="btn btn-primary" onClick={addSurvey}>+ 설문 추가</button>
        </PageHeader>

        <section className="card">
          <div className="card-head">
            <div className="section-title">검색조건</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>과정명 또는 설문명으로 조회</div>
          </div>
          <div className="card-body">
            <div className="filter-grid">
              <div className="field">
                <div className="label">검색조건</div>
                <div className="control inline">
                  <select style={{ maxWidth: 130 }} value={form.searchType} onChange={upd('searchType')}>
                    <option value="all">과정명/설문명</option>
                    <option value="course">과정명</option>
                    <option value="survey">설문조사명</option>
                  </select>
                  <input type="text" placeholder="검색어를 입력하세요." value={form.keyword} onChange={upd('keyword')} />
                </div>
              </div>
              <div className="field">
                <div className="label">설문상태</div>
                <div className="control">
                  <select value={form.status} onChange={upd('status')}>
                    {['전체', ...STATUSES].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <div className="label">운영대장용</div>
                <div className="control">
                  <select value={form.type} onChange={upd('type')}>
                    {['전체', ...TYPES].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="filter-actions">
              <button className="btn btn-primary" onClick={() => { setFilters(form); setPage(1); }}>검색</button>
              <button className="btn" onClick={() => { setForm(EMPTY); setFilters(EMPTY); setPage(1); }}>초기화</button>
              <button className="btn" onClick={() => alert('설문 질문 관리 화면으로 이동합니다.')}>질문관리</button>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">설문조사 목록</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>미리보기 / 결과보기 / 개별출력 / 수정 / 삭제</div>
          </div>
          <div className="card-body">
            <div className="summary-line">
              <div className="summary-text">
                Total : <strong>{total}</strong>, Page : <strong>{curPage}/{totalPage}</strong>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>과정명 / 설문조사명</th>
                    <th style={{ width: 160 }}>구분(운영대장용)</th>
                    <th style={{ width: 85 }}>회차</th>
                    <th style={{ width: 90 }}>답변자</th>
                    <th style={{ width: 120 }}>설문상태</th>
                    <th style={{ width: 110 }}>미리보기</th>
                    <th style={{ width: 180 }}>결과보기</th>
                    <th style={{ width: 150 }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="survey-title">{s.course}</div>
                        <div className="survey-meta">설문명 · {s.survey}</div>
                      </td>
                      <td className="center">
                        <select className="status-select" value={s.type} onChange={(e) => patch(s.id, { type: e.target.value })}>
                          {TYPES.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="center">{s.round}</td>
                      <td className="center"><strong>{s.respondents}명</strong></td>
                      <td className="center">
                        <select className="status-select" value={s.status} onChange={(e) => patch(s.id, { status: e.target.value })}>
                          {STATUSES.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="center">
                        <button className="mini-btn preview" onClick={() => navigate('/survey-response-popup')}>미리보기</button>
                      </td>
                      <td className="center">
                        <div className="action-stack">
                          <button className="mini-btn result" onClick={() => alert(`"${s.survey}" 설문 결과 화면으로 이동합니다.`)}>결과보기</button>
                          <button className="mini-btn print" onClick={() => alert(`"${s.survey}" 응답자별 개별출력 화면으로 이동합니다.`)}>개별출력</button>
                        </div>
                      </td>
                      <td className="center">
                        <div className="action-stack">
                          <button className="mini-btn" onClick={() => alert(`"${s.survey}" 설문 수정 화면으로 이동합니다.`)}>수정</button>
                          <button className="mini-btn delete" onClick={() => remove(s)}>삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bottom-bar">
              <button className="btn btn-primary" onClick={addSurvey}>+ 추가</button>
              <div className="pager">
                {Array.from({ length: totalPage }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={'page-btn' + (n === curPage ? ' active' : '')} onClick={() => setPage(n)}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="footer-note">LMS 관리자 · 설문조사 관리</div>
      </div>
    </div>
  );
}
