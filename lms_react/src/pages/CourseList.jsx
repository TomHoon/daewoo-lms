import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import api from '../api/axios';
import './CourseList.css';

const PAGE_SIZE = 6;
const STATUS_OPTIONS = ['임시등록', '모집중', '모집진행', '진행중', '종료', '관리종료', '폐강'];

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
  const [y, m, d] = s.slice(0, 10).split(/[.-]/).map(Number);
  return new Date(y, m - 1, d);
};

export default function CourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [form, setForm] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [tab, setTab] = useState('전체');
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    const controller = new AbortController();
    const loadCategories = async () => {
      try {
        const [jobResponse, categoryResponse] = await Promise.all([
          api.get('/v1/trainingJobCategories', {signal: controller.signal}),
          api.get('/v1/educationCategories', {signal: controller.signal}),
        ]);
        if (controller.signal.aborted) return;
        if (!Array.isArray(jobResponse.data) || !Array.isArray(categoryResponse.data)) throw new Error('분류 응답 오류');
        setJobs(jobResponse.data);
        setCategories(categoryResponse.data);
      } catch {
        if (!controller.signal.aborted) setCategoryError('분류 목록을 불러오지 못했습니다.');
      }
    };
    void loadCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadCourses = async () => {
      setLoading(true);
      setLoadError('');
      setCourses([]);
      setChecked(new Set());
      try {
        const {data} = await api.get('/v1/courses', {
          params: {
            trainingJobCategoryId: filters.job === '전체' ? undefined : filters.job,
            educationCategoryId: filters.course === '전체' ? undefined : filters.course,
          },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error('과정 응답이 배열이 아닙니다.');
        setCourses(data.map((row) => ({
          ...row,
          id: row.courseId,
          name: row.courseName ?? '',
          status: row.status === 'RECRUITING' ? '모집중' : row.status ?? '',
          ledger: row.ledger ?? '',
          campus: row.campusName ?? '',
          code: row.trainingCode ?? '',
          image: row.representativeFileUrl ?? '',
          color: row.courseColor ?? '',
          periodType: row.recruitType === 'FIXED' ? '기간확정' : row.recruitType ?? '-',
          start: row.startDate ?? '',
          end: row.endDate ?? '',
          students: row.studentCount ?? '-',
          clicks: row.clickCount ?? '-',
        })));
      } catch {
        if (!controller.signal.aborted) setLoadError('과정 목록을 불러오지 못했습니다. 다시 검색해 주세요.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadCourses();
    return () => controller.abort();
  }, [filters]);

  const tabMatch = (status) =>
    tab === '전체' ? true : tab === '모집진행' ? status === '모집중' || status === '모집진행' : status === tab;

  const filtered = courses.filter((c) => {
    if (!tabMatch(c.status)) return false;
    if (filters.status !== '전체' && c.status !== filters.status) return false;
    if (filters.campus !== '전체' && c.campus !== filters.campus) return false;
    if (filters.ledger !== '전체' && c.ledger !== filters.ledger) return false;
    const kw = filters.keyword.trim().toLowerCase();
    if (kw) {
      const target = filters.searchType === 'name' ? c.name : filters.searchType === 'code' ? c.code : c.campus;
      if (!(target || '').toLowerCase().includes(kw)) return false;
    }
    if (filters.startDate && (!c.end || parseDate(c.end) < new Date(filters.startDate))) return false;
    if (filters.endDate && (!c.start || parseDate(c.start) > new Date(filters.endDate))) return false;
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
    setFilters({...form});
    setPage(1);
  };
  const resetFilters = () => {
    setForm(EMPTY_FILTERS);
    setFilters({...EMPTY_FILTERS});
    setTab('전체');
    setPage(1);
  };
  const remove = (c) => {
    if (confirm(`"${c.name}" 과정을 삭제하시겠습니까?`)) setCourses((list) => list.filter((x) => x.id !== c.id));
  };

  const openNcsList = (course) => {
    if (course.id == null || course.batchId == null) {
      alert('과정 또는 기수 ID가 없습니다. 과정 목록 응답을 확인해 주세요.');
      return;
    }
    const params = new URLSearchParams({courseId: String(course.id), batchId: String(course.batchId)});
    navigate(`/ncs-list?${params}`, {
      state: {
        course: {
          ...course,
          trainingJobCategoryName: jobs.find((row) => row.trainingJobCategoryId === course.trainingJobCategoryId)?.categoryName ?? '',
          educationCategoryName: categories.find((row) => row.educationCategoryId === course.educationCategoryId)?.categoryName ?? '',
        },
      },
    });
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
                    {jobs.map((row) => <option key={row.trainingJobCategoryId} value={row.trainingJobCategoryId}>{row.categoryName}</option>)}
                  </select>
                  <select value={form.course} onChange={upd('course')}>
                    <option value="전체">교육과정선택</option>
                    {categories.map((row) => <option key={row.educationCategoryId} value={row.educationCategoryId}>{row.categoryName}</option>)}
                  </select>
                  {categoryError && <span role="alert">{categoryError}</span>}
                </div>
              </div>
              <div className="field">
                <div className="label">캠퍼스별</div>
                <div className="control">
                  <select value={form.campus} onChange={upd('campus')}>
                    <option value="전체">전체 캠퍼스</option>
                    {[...new Set(courses.map((course) => course.campus).filter(Boolean))].map((name) => <option key={name}>{name}</option>)}
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
                  {(loading || loadError || items.length === 0) && (
                    <tr><td colSpan={14} className="center" role={loadError ? 'alert' : undefined}>{loading ? '불러오는 중...' : loadError || '조회된 과정이 없습니다.'}</td></tr>
                  )}
                  {items.map((c) => (
                    <tr key={c.id}>
                      <td className="center">
                        <input type="checkbox" checked={checked.has(c.id)} onChange={() => toggle(c.id)} />
                      </td>
                      <td>
                        <select className="small-select" value={c.status} onChange={(e) => patch(c.id, { status: e.target.value })}>
                          {!STATUS_OPTIONS.includes(c.status) && <option value={c.status}>{c.status || '-'}</option>}
                          {STATUS_OPTIONS.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="small-select" value={c.ledger} onChange={(e) => patch(c.id, { ledger: e.target.value })}>
                          {!['숨김', '출력'].includes(c.ledger) && <option value={c.ledger}>{c.ledger || '-'}</option>}
                          {['숨김', '출력'].map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="center">{c.campus || '-'}</td>
                      <td className="center">{c.code || '-'}</td>
                      <td className="center">{c.image ? <div className="thumb"><img src={c.image} alt="썸네일" /></div> : '-'}</td>
                      <td>
                        <div className="course-cell">
                          <div className="course-info">
                            <div className="course-meta">{jobs.find((row) => row.trainingJobCategoryId === c.trainingJobCategoryId)?.categoryName ?? '-'} &gt; {categories.find((row) => row.educationCategoryId === c.educationCategoryId)?.categoryName ?? '-'}</div>
                            <button type="button" className="course-name course-link" style={c.color ? {color: c.color} : undefined} onClick={() => openNcsList(c)}>{c.name}</button>
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
                      <td className="center"><button className="mini-btn admission" onClick={() => navigate(`/admission-application-list?courseId=${encodeURIComponent(c.id)}${c.batchId == null ? '' : `&batchId=${encodeURIComponent(c.batchId)}`}`)}>입학</button></td>
                      <td className="center"><button className="mini-btn edu" onClick={() => openNcsList(c)}>교육</button></td>
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
