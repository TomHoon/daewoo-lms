import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import './CourseList.css';

const PAGE_SIZE = 6;
const STATUS_OPTIONS = ['임시등록', '모집중', '모집진행', '진행중', '종료', '관리종료', '폐강'];
const IMG = {
  cook: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=200&q=60',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=200&q=60',
  code: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=60',
  design: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=200&q=60',
};

const INITIAL_COURSES = [
  { id: 1, status: '진행중', ledger: '숨김', campus: '', code: '', image: IMG.cook, jobCategory: '내일배움카드(실업자)', courseCategory: '한식 조리사', name: '한식 조리사 자격증 대비반11111111 복사본', color: 'green', periodType: '기간확정', start: '2019.04.29', end: '2019.06.28', students: 0, clicks: 39 },
  { id: 2, status: '임시등록', ledger: '숨김', campus: '', code: '', image: IMG.cook, jobCategory: '내일배움카드(실업자)', courseCategory: '한식 조리사', name: '한식 조리사 자격증 대비반 복사본', color: 'green', periodType: '기간확정', start: '2019.04.29', end: '2019.06.28', students: 0, clicks: 0 },
  { id: 3, status: '진행중', ledger: '숨김', campus: '', code: '', image: IMG.cook, jobCategory: '내일배움카드(실업자)', courseCategory: '한식 조리사', name: '한식 조리사 자격증 대비반', color: 'green', periodType: '기간확정', start: '2019.04.29', end: '2019.06.28', students: 5, clicks: 48 },
  { id: 4, status: '진행중', ledger: '숨김', campus: '', code: '', image: IMG.coffee, jobCategory: '일반과정', courseCategory: '바리스타', name: '커피 바리스타 과정 2회차 2019.03.05~04.15', color: 'orange', periodType: '기간확정', start: '2019.03.05', end: '2019.04.12', students: 4, clicks: 44 },
  { id: 5, status: '진행중', ledger: '출력', campus: '', code: '', image: IMG.coffee, jobCategory: '내일배움카드(실업자)', courseCategory: '바리스타', name: '커피 바리스타 과정 1회차', color: 'red', periodType: '기간확정', start: '2019.01.02', end: '2019.02.15', students: 10, clicks: 188 },
  { id: 6, status: '임시등록', ledger: '숨김', campus: '대구', code: '', image: IMG.coffee, jobCategory: '내일배움카드(실업자)', courseCategory: '바리스타', name: '커피 바리스타 과정 기본 2019.01.02~02.15', color: 'black', periodType: '기간확정', start: '2019.01.02', end: '2019.02.15', students: 0, clicks: 0 },
  { id: 7, status: '모집진행', ledger: '숨김', campus: '대구', code: 'P-1004', image: IMG.code, jobCategory: '내일배움카드(재직자)', courseCategory: '프로그래밍', name: '재직자를 위한 고급 JAVA 개발', color: 'black', periodType: '기간확정', start: '2019.01.21', end: '2019.05.31', students: 0, clicks: 208 },
  { id: 8, status: '종료', ledger: '출력', campus: '본원', code: 'UI-2301', image: IMG.design, jobCategory: '국가기간전략산업', courseCategory: 'UI/UX디자인', name: '실무형 UI/UX 디자이너 양성과정', color: 'blue', periodType: '기간확정', start: '2019.03.04', end: '2019.08.30', students: 9, clicks: 49 },
];

const TABS = [
  ['전체', '전체보기'], ['임시등록', '임시등록'], ['모집중', '모집중'], ['모집진행', '모집/진행'],
  ['진행중', '진행중'], ['종료', '종료'], ['관리종료', '관리종료'], ['폐강', '폐강'],
];

const EMPTY_FILTERS = {
  searchType: 'name', keyword: '', startDate: '', endDate: '',
  status: '전체', job: '전체', course: '전체', campus: '전체', ledger: '전체',
};

const parseDate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('.').map(Number);
  return new Date(y, m - 1, d);
};

export default function CourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [form, setForm] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [tab, setTab] = useState('전체');
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState(() => new Set());

  const tabMatch = (status) =>
    tab === '전체' ? true : tab === '모집진행' ? status === '모집중' || status === '모집진행' : status === tab;

  const filtered = courses.filter((c) => {
    if (!tabMatch(c.status)) return false;
    if (filters.status !== '전체' && c.status !== filters.status) return false;
    if (filters.job !== '전체' && c.jobCategory !== filters.job) return false;
    if (filters.course !== '전체' && c.courseCategory !== filters.course) return false;
    if (filters.campus !== '전체' && c.campus !== filters.campus) return false;
    if (filters.ledger !== '전체' && c.ledger !== filters.ledger) return false;
    const kw = filters.keyword.trim().toLowerCase();
    if (kw) {
      const target = filters.searchType === 'name' ? c.name : filters.searchType === 'code' ? c.code : c.campus;
      if (!(target || '').toLowerCase().includes(kw)) return false;
    }
    if (filters.startDate && parseDate(c.end) < new Date(filters.startDate)) return false;
    if (filters.endDate && parseDate(c.start) > new Date(filters.endDate)) return false;
    return true;
  });

  const total = filtered.length;
  const totalPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const curPage = Math.min(page, totalPage);
  const items = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);
  const allChecked = items.length > 0 && items.every((c) => checked.has(c.id));

  const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const patch = (id, p) => setCourses((list) => list.map((c) => (c.id === id ? { ...c, ...p } : c)));
  const toggle = (id) =>
    setChecked((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = (on) =>
    setChecked((s) => {
      const n = new Set(s);
      items.forEach((c) => (on ? n.add(c.id) : n.delete(c.id)));
      return n;
    });

  const applyFilters = () => {
    setFilters(form);
    setPage(1);
  };
  const resetFilters = () => {
    setForm(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setTab('전체');
    setPage(1);
  };
  const remove = (c) => {
    if (confirm(`"${c.name}" 과정을 삭제하시겠습니까?`)) setCourses((list) => list.filter((x) => x.id !== c.id));
  };

  return (
    <div className="pg-course-list">
      <div className="page">
        <PageHeader
          title="과정목록"
          desc="등록된 과정을 조회하고, 교육상태 / 노출여부 / 기본정보를 관리할 수 있습니다."
          actionClass="header-actions"
        >
          <button className="btn" onClick={resetFilters}>필터 초기화</button>
          <button className="btn btn-primary" onClick={() => navigate('/course-registration')}>+ 과정 등록</button>
        </PageHeader>

        <section className="card">
          <div className="card-head">
            <div className="section-title">검색조건</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>분류, 캠퍼스, 상태, 기간으로 조회</div>
          </div>
          <div className="card-body">
            <div className="summary-line">
              <div className="summary-text">
                Total : <strong>{total}</strong>, Page : <strong>{curPage}/{totalPage}</strong>
              </div>
            </div>
            <div className="filter-grid">
              <div className="field">
                <div className="label">검색조건</div>
                <div className="control inline">
                  <select style={{ maxWidth: 120 }} value={form.searchType} onChange={upd('searchType')}>
                    <option value="name">과정명</option>
                    <option value="code">훈련코드</option>
                    <option value="campus">캠퍼스</option>
                  </select>
                  <input type="text" placeholder="검색어를 입력하세요." value={form.keyword} onChange={upd('keyword')} />
                </div>
              </div>
              <div className="field">
                <div className="label">교육기간</div>
                <div className="control inline">
                  <input type="date" value={form.startDate} onChange={upd('startDate')} />
                  <span>~</span>
                  <input type="date" value={form.endDate} onChange={upd('endDate')} />
                </div>
              </div>
              <div className="field">
                <div className="label">교육상태</div>
                <div className="control">
                  <select value={form.status} onChange={upd('status')}>
                    <option value="전체">전체보기</option>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <div className="label">분류선택</div>
                <div className="control inline">
                  <select value={form.job} onChange={upd('job')}>
                    <option value="전체">훈련직종선택</option>
                    {['국가기간전략산업', '내일배움카드(실업자)', '내일배움카드(재직자)', '일반과정'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <select value={form.course} onChange={upd('course')}>
                    <option value="전체">교육과정선택</option>
                    {['컴퓨터활용', 'UI/UX디자인', '프로그래밍', '바리스타', '한식 조리사'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <div className="label">캠퍼스별</div>
                <div className="control">
                  <select value={form.campus} onChange={upd('campus')}>
                    <option value="전체">전체 캠퍼스</option>
                    {['본원', '대구', '강남'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <div className="label">운영대장 출력여부</div>
                <div className="control">
                  <select value={form.ledger} onChange={upd('ledger')}>
                    <option value="전체">전체보기</option>
                    <option value="출력">출력</option>
                    <option value="숨김">숨김</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="filter-actions">
              <button className="btn btn-primary" onClick={applyFilters}>검색</button>
              <button className="btn" onClick={resetFilters}>엑셀/초기화</button>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">과정목록</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>상태 탭을 눌러 빠르게 필터링할 수 있습니다.</div>
          </div>
          <div className="card-body">
            <div className="tabs">
              {TABS.map(([key, label]) => (
                <button
                  key={key}
                  className={'tab' + (tab === key ? ' active' : '')}
                  onClick={() => { setTab(key); setPage(1); }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 42 }}>
                      <input type="checkbox" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} />
                    </th>
                    <th style={{ width: 105 }}>교육상태</th>
                    <th style={{ width: 125 }}>운영대장<br />출력여부</th>
                    <th style={{ width: 90 }}>캠퍼스</th>
                    <th style={{ width: 110 }}>훈련코드</th>
                    <th style={{ width: 90 }}>이미지</th>
                    <th>분류 및 과정명</th>
                    <th style={{ width: 90 }}>기간타입</th>
                    <th style={{ width: 120 }}>과정기간</th>
                    <th style={{ width: 80 }}>등록학생</th>
                    <th style={{ width: 80 }}>클릭수</th>
                    <th style={{ width: 80 }}>입학</th>
                    <th style={{ width: 80 }}>교육</th>
                    <th style={{ width: 180 }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id}>
                      <td className="center">
                        <input type="checkbox" checked={checked.has(c.id)} onChange={() => toggle(c.id)} />
                      </td>
                      <td>
                        <select className="small-select" value={c.status} onChange={(e) => patch(c.id, { status: e.target.value })}>
                          {STATUS_OPTIONS.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="small-select" value={c.ledger} onChange={(e) => patch(c.id, { ledger: e.target.value })}>
                          {['숨김', '출력'].map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="center">{c.campus || '-'}</td>
                      <td className="center">{c.code || '-'}</td>
                      <td className="center"><div className="thumb"><img src={c.image} alt="썸네일" /></div></td>
                      <td>
                        <div className="course-cell">
                          <div className="course-info">
                            <div className="course-meta">{c.jobCategory} &gt; {c.courseCategory}</div>
                            <div className={'course-name ' + (['green', 'orange', 'red', 'blue'].includes(c.color) ? c.color : '')}>{c.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="center"><span className="badge badge-fixed">{c.periodType}</span></td>
                      <td className="center">
                        <div className="date-range">
                          <div className="start">{c.start}</div>
                          <div className="end">{c.end}</div>
                        </div>
                      </td>
                      <td className="center">{c.students}</td>
                      <td className="center">{c.clicks}</td>
                      <td className="center"><button className="mini-btn admission" onClick={() => navigate('/admission-application-list')}>입학</button></td>
                      <td className="center"><button className="mini-btn edu" onClick={() => navigate('/course-detail')}>교육</button></td>
                      <td className="center">
                        <div className="row-actions">
                          <button className="mini-btn" onClick={() => alert(`"${c.name}" 과정 수정 화면으로 이동합니다.`)}>수정</button>
                          <button className="mini-btn delete" onClick={() => remove(c)}>삭제</button>
                          <button className="mini-btn dark" onClick={() => alert(`"${c.name}" 과정의 과정 모든 자료 삭제 기능으로 이동합니다.`)}>과정모든자료삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div className="page-info">총 {total}건 · 현재 {curPage}페이지</div>
              <div className="pager">
                <button className="page-btn" onClick={() => setPage(Math.max(1, curPage - 1))}>‹</button>
                {Array.from({ length: totalPage }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={'page-btn' + (n === curPage ? ' active' : '')} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="page-btn" onClick={() => setPage(Math.min(totalPage, curPage + 1))}>›</button>
              </div>
            </div>
          </div>
        </section>

        <div className="footer-note">LMS 관리자 · 과정목록 관리</div>
      </div>
    </div>
  );
}
