import useDraft from '../hooks/useDraft.js';
import SheetPage from '../components/SheetPage.jsx';
import MetaGrid from '../components/MetaGrid.jsx';
import FormRow from '../components/FormRow.jsx';
import './Survey.css';

const AWARENESS = [
  ['고용24', '고용24', '💻'],
  ['네이버검색', '네이버 검색', '🔎'],
  ['구글검색', '구글 검색', '🌐'],
  ['SNS', 'SNS', '📱'],
  ['유튜브', '유튜브', '▶️'],
  ['지인추천', '지인 추천', '👥'],
  ['학교추천', '학교 추천', '🎓'],
  ['취업지원기관', '취업지원기관', '🏢'],
  ['블로그카페', '블로그/카페', '📝'],
  ['기타', '기타', '📌'],
];
const FACTORS = ['교육과정 내용', '취업 연계', '훈련비 지원', '훈련기관 위치', '강사', '지인 추천', '과정 기간', '기관 인지도', '기타'];
const APPLY_CHANNELS = ['고용24', '기관 홈페이지', '전화 문의', '방문 상담', '담당자 안내', '지인 소개', '기타'];

const INITIAL = {
  org: '대우능력개발원',
  course: 'AI 에이전트 클라우드·보안코딩 개발자 양성',
  enterDate: '2026-08-12',
  surveyDate: '2026-10-30',
  name: '홍길동',
  birth: '2000-01-01',
  phone: '010-1234-5678',
  region: '서울',
  edu: '대졸',
  manager: '홍담당',
  applyChannel: '고용24',
  firstDate: '2026-07-20',
  firstMethod: '전화',
  counselDate: '2026-07-22',
  counselMethod: '전화',
  counselManager: '홍담당',
  memo: '',
  awareness: '고용24',
  factors: ['교육과정 내용', '취업 연계'],
};

const Select = ({ options, ...rest }) => (
  <select {...rest}>{options.map((o) => <option key={o}>{o}</option>)}</select>
);

export default function Survey() {
  const draft = useDraft('enrollment_channel_survey_v1', INITIAL);
  const { data, set, field } = draft;

  const toggleFactor = (f, checked) =>
    set((d) => ({ factors: checked ? [...d.factors, f] : d.factors.filter((x) => x !== f) }));

  return (
    <SheetPage
      pg="pg-survey"
      title="경 로 조 사"
      sub="TRAINING ENROLLMENT CHANNEL SURVEY"
      footer="경로조사"
      draft={draft}
      meta={
        <MetaGrid
          draft={draft}
          items={[
            ['훈련기관명', 'org'],
            ['교육과정명', 'course'],
            ['입과일', 'enterDate', 'date'],
            ['조사일자', 'surveyDate', 'date'],
          ]}
        />
      }
    >
      <section className="section">
        <div className="section-title">훈련생 기본정보</div>
        <div className="form-grid">
          <div className="form-card">
            <FormRow label="훈련생명"><input {...field('name')} /></FormRow>
            <FormRow label="생년월일"><input type="date" {...field('birth')} /></FormRow>
            <FormRow label="연락처"><input {...field('phone')} /></FormRow>
          </div>
          <div className="form-card">
            <FormRow label="거주지역"><input {...field('region')} /></FormRow>
            <FormRow label="최종학력">
              <Select options={['고졸', '전문대졸', '대졸', '대학원졸', '기타']} {...field('edu')} />
            </FormRow>
            <FormRow label="상담담당자"><input {...field('manager')} /></FormRow>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title">1. 이 훈련과정을 처음 알게 된 경로</div>
        <div className="channel-grid">
          {AWARENESS.map(([value, label, icon]) => (
            <label key={value} className={'channel-card' + (data.awareness === value ? ' active' : '')}>
              <input
                type="radio"
                name="awareness"
                value={value}
                checked={data.awareness === value}
                onChange={() => set({ awareness: value })}
              />
              <div className="channel-icon">{icon}</div>
              <div className="channel-name">{label}</div>
            </label>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-title">2. 실제 신청 경로</div>
        <div className="form-grid">
          <div className="form-card">
            <FormRow label="신청 경로"><Select options={APPLY_CHANNELS} {...field('applyChannel')} /></FormRow>
            <FormRow label="최초 문의일"><input type="date" {...field('firstDate')} /></FormRow>
            <FormRow label="최초 문의방법">
              <Select options={['전화', '문자', '온라인 문의', '방문', '기타']} {...field('firstMethod')} />
            </FormRow>
          </div>
          <div className="form-card">
            <FormRow label="상담일자"><input type="date" {...field('counselDate')} /></FormRow>
            <FormRow label="상담방법">
              <Select options={['전화', '대면', '온라인', '문자']} {...field('counselMethod')} />
            </FormRow>
            <FormRow label="상담담당자"><input {...field('counselManager')} /></FormRow>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title">3. 입과 결정에 영향을 준 요인</div>
        <div className="choice-grid">
          {FACTORS.map((f) => (
            <label className="choice-item" key={f}>
              <input
                type="checkbox"
                checked={data.factors.includes(f)}
                onChange={(e) => toggleFactor(f, e.target.checked)}
              />{' '}
              {f}
            </label>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-title">4. 경로조사 요약</div>
        <div className="summary-grid">
          <div className="summary-item"><div className="summary-label">최초 인지</div><div className="summary-value"><span>{data.awareness || '-'}</span></div></div>
          <div className="summary-item"><div className="summary-label">신청 경로</div><div className="summary-value"><span>{data.applyChannel}</span></div></div>
          <div className="summary-item"><div className="summary-label">영향요인 수</div><div className="summary-value"><span>{data.factors.length}개</span></div></div>
          <div className="summary-item"><div className="summary-label">조사상태</div><div className="summary-value"><span>{data.awareness && data.applyChannel ? '작성중' : '미작성'}</span></div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-title">5. 기타 유입정보 및 메모</div>
        <div className="notice-box">
          <div className="notice-label">기 타 사 항</div>
          <div className="notice-body">
            <textarea
              maxLength={1500}
              placeholder="광고명, 추천인, 검색 키워드, 설명회 참여 여부 등 추가 유입정보를 입력하세요."
              {...field('memo')}
            />
          </div>
        </div>
      </section>
    </SheetPage>
  );
}
