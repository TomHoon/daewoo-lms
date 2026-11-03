import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import './CourseDetail.css';

const INITIAL_STUDENTS = [
  { name: '김조리', birth: '2000-03-12', phone: '010-3000-1111', region: '서울 강서구', edu: '훈련중', employment: '', job: 0, cert: 0, counsel: 1, after: 0 },
  { name: '나조리', birth: '1999-10-12', phone: '010-3000-2222', region: '경기 부천시', edu: '훈련중', employment: '', job: 0, cert: 0, counsel: 0, after: 0 },
  { name: '박조리', birth: '1998-09-04', phone: '010-3000-3333', region: '인천 계양구', edu: '훈련중', employment: '', job: 0, cert: 0, counsel: 0, after: 0 },
  { name: '이조리', birth: '1998-12-09', phone: '010-3000-4444', region: '서울 양천구', edu: '훈련중', employment: 'ABC푸드', job: 1, cert: 1, counsel: 2, after: 0 },
  { name: '최조리', birth: '1989-09-11', phone: '010-3000-5555', region: '서울 영등포구', edu: '훈련중', employment: '', job: 0, cert: 0, counsel: 1, after: 0 },
];

const SUMMARY = [
  ['승인인원', 20], ['현재 훈련생', 5], ['출석률', '94%'], ['상담건수', 4], ['취업현황', 1], ['수료예정', 5],
];

const INFO = [
  ['훈련직종분류', '내일배움카드(실업자)'], ['교육과정분류', '한식 조리사'],
  ['캠퍼스', '본원'], ['교육장소', '조리실습실 A'],
  ['수업시간', '09:00 ~ 18:00'], ['하루수업시간', '8시간'],
  ['수업요일', '월 ~ 금'], ['훈련수당', '월 116,000원'],
];

// [라벨, 이동할 경로(없으면 동작 없음)]
const MANAGE = [
  ['훈련일지', '/train-diary'], ['NCS 평가', '/ncs-management'], ['수료/이수증 발급'], ['월별 출결상황표'], ['자리배치도'],
  ['훈련생 보고서'], ['회계보고서'], ['교육정보등록'], ['점검 체크리스트'], ['능력단위 출석부'],
];

export default function CourseDetail() {
  const navigate = useNavigate();
  const [students] = useState(INITIAL_STUDENTS);

  return (
    <div className="pg-course-detail">
      <div className="page">
        <PageHeader title="과정 상세" desc="선택한 과정의 운영정보와 훈련생 현황을 통합 관리합니다.">
          <button className="btn" onClick={() => navigate('/course-list')}>과정목록</button>
        </PageHeader>

        <section className="card">
          <div className="card-body">
            <div className="course-hero">
              <div>
                <div className="course-name">[내일배움카드(실업자)] 한식 조리사 자격증 대비반</div>
                <div className="course-meta">교육기간 2026.11.04 ~ 2027.01.16 · 본원 · 훈련코드 K-2026-041</div>
                <div className="badges">
                  <span className="badge success">진행중</span>
                  <span className="badge blue">기간확정</span>
                  <span className="badge gray">생기부 차단</span>
                  <span className="badge warning">담임 김민수</span>
                </div>
              </div>
              <div className="hero-actions">
                <button className="btn" onClick={() => alert('과정 수정 화면으로 이동합니다.')}>과정 수정</button>
                <button className="btn btn-primary" onClick={() => alert('전체 인쇄 영역입니다.')}>전체 인쇄</button>
              </div>
            </div>

            <div className="summary-grid">
              {SUMMARY.map(([label, value]) => (
                <div className="summary-card" key={label}>
                  <div className="summary-label">{label}</div>
                  <div className="summary-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><div className="section-title">과정 기본정보</div></div>
          <div className="card-body">
            <div className="info-grid">
              {INFO.map(([label, value]) => (
                <div className="info-row" key={label}>
                  <div className="info-label">{label}</div>
                  <div className="info-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><div className="section-title">과정 관리 메뉴</div></div>
          <div className="card-body">
            <div className="management-grid">
              {MANAGE.map(([label, to]) => (
                <button key={label} className="manage-btn" onClick={() => to && navigate(to)}>{label}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">훈련생 목록</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>이름을 클릭하면 훈련생 상세정보를 확인합니다.</div>
          </div>
          <div className="card-body">
            <div className="toolbar">
              <div className="toolbar-left">
                <label><input type="checkbox" /> 미취업자만 출력</label>
                <select>
                  <option>전체 교육상태</option>
                  <option>훈련중</option>
                  <option>수료</option>
                  <option>중도탈락</option>
                </select>
                <input type="text" placeholder="이름/연락처 검색" />
                <button className="btn btn-small">검색</button>
              </div>
              <div className="toolbar-right">
                <button className="btn btn-small">훈련생 리스트</button>
                <button className="btn btn-small">훈련과정 보고서</button>
                <button className="btn btn-small">훈련생 서명</button>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 42 }}><input type="checkbox" /></th>
                    <th style={{ width: 80 }}>생기부</th>
                    <th style={{ width: 100 }}>교육상태</th>
                    <th style={{ width: 90 }}>이름</th>
                    <th style={{ width: 100 }}>사진</th>
                    <th style={{ width: 110 }}>생년월일</th>
                    <th style={{ width: 130 }}>대표연락처</th>
                    <th style={{ width: 110 }}>지역</th>
                    <th style={{ width: 90 }}>교육상태</th>
                    <th>취업처</th>
                    <th style={{ width: 75 }}>취업알선</th>
                    <th style={{ width: 75 }}>자격증</th>
                    <th style={{ width: 75 }}>상담</th>
                    <th style={{ width: 85 }}>수료 후 상담</th>
                    <th style={{ width: 80 }}>인쇄</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.name}>
                      <td className="center"><input type="checkbox" /></td>
                      <td className="center">
                        <select className="small-select" defaultValue="오픈"><option>오픈</option><option>차단</option></select>
                      </td>
                      <td className="center">
                        <select className="small-select" defaultValue={s.edu}>
                          <option>{s.edu}</option><option>수료</option><option>중도탈락</option>
                        </select>
                      </td>
                      <td className="center">
                        <button className="mini-btn" onClick={() => alert(`${s.name} 상세정보`)}>
                          <span className="student-name">{s.name}</span>
                        </button>
                      </td>
                      <td className="center">
                        <div className="photo"><img src={`https://i.pravatar.cc/100?img=${i + 12}`} alt="" /></div>
                      </td>
                      <td className="center">{s.birth}</td>
                      <td className="center">{s.phone}</td>
                      <td className="center">{s.region}</td>
                      <td className="center" style={{ color: '#ff7a00', fontWeight: 800 }}>{s.edu}</td>
                      <td>{s.employment || '-'}</td>
                      <td className="center stat purple">{s.job}</td>
                      <td className="center stat red">{s.cert}</td>
                      <td className="center stat blue">{s.counsel}</td>
                      <td className="center stat red">{s.after}</td>
                      <td className="center"><button className="mini-btn" onClick={() => alert(`${s.name} 인쇄`)}>인쇄</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="footer-note">LMS 관리자 · 과정 상세</div>
      </div>
    </div>
  );
}
