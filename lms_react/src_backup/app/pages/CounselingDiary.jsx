import useDraft from '../hooks/useDraft.js';
import SheetPage from '../components/SheetPage.jsx';
import MetaGrid from '../components/MetaGrid.jsx';
import FormRow from '../components/FormRow.jsx';
import './CounselingDiary.css';

const CATEGORIES = ['학습지원', '출결관리', '취업지원', '생활지원', '상담확인', '기타'];
const STATUSES = ['예정', '진행중', '완료', '보류'];
const TYPES = ['정기상담', '수시상담', '출결상담', '학습상담', '취업상담', '생활상담', '중도탈락 예방상담'];
const EMPTY_ROW = { category: '학습지원', content: '', manager: '', date: '', status: '예정' };

const INITIAL = {
  org: '대우능력개발원',
  course: 'AI 에이전트 클라우드·보안코딩 개발자 양성',
  period: '2026-08-12 ~ 2027-05-14',
  writeDate: '2026-10-29',
  name: '홍길동',
  birth: '2000-01-01',
  phone: '010-1234-5678',
  round: '1',
  counselDate: '2026-10-29',
  counselTime: '14:00 ~ 14:30',
  type: '정기상담',
  method: '대면',
  content:
    '최근 수업 진도와 학습 난이도에 대한 부담을 느끼고 있어 상담을 진행하였다. 자바 객체지향 개념 중 상속과 인터페이스 부분의 이해가 부족하다고 하여 복습 방법과 추가 실습 방향을 안내하였다.',
  action:
    '기초 예제부터 다시 실습하도록 안내하고, 담당교사에게 취약 부분을 공유하여 추가 학습자료를 제공하기로 하였다.',
  future: '1주 후 학습 진행상황을 재확인하고 필요 시 보충학습 및 추가 상담을 진행한다.',
  opinion:
    '현재 학습 의지는 양호하나 일부 개념에 대한 이해 부족이 확인되어 단기간 추가지도가 필요하다. 출결 및 훈련 참여도에는 특별한 문제가 없다.',
  rows: [
    { category: '학습지원', content: '자바 상속/인터페이스 추가 학습자료 제공', manager: '이정은', date: '2026-11-05', status: '진행중' },
    { category: '상담확인', content: '학습 진행상황 재확인 및 추가 상담 여부 판단', manager: '이정은', date: '2026-11-06', status: '예정' },
  ],
};

export default function CounselingDiary() {
  const draft = useDraft('counseling_diary_v1', INITIAL);
  const { data, field } = draft;
  const rows = draft.rows('rows', EMPTY_ROW, '최소 1개의 후속조치 항목은 유지해야 합니다.');

  const unfinished = data.rows.some((r) => r.status !== '완료');
  const hasContent = data.content.trim().length > 0;

  const rowField = (i, name) => ({
    value: data.rows[i][name],
    onChange: (e) => rows.update(i, { [name]: e.target.value }),
  });

  const textBlock = (head, name, max) => (
    <div className="text-block">
      <div className="text-head">{head}</div>
      <div className="text-body">
        <textarea maxLength={max} {...field(name)} />
        <div className="counter"><span>{data[name].length}</span>/{max}</div>
      </div>
    </div>
  );

  return (
    <SheetPage
      pg="pg-counseling-diary"
      title="상 담 일 지"
      sub="TRAINEE COUNSELING REPORT"
      footer="상담일지"
      draft={draft}
      meta={
        <MetaGrid
          draft={draft}
          items={[
            ['훈련기관명', 'org'],
            ['교육과정명', 'course'],
            ['훈련기간', 'period'],
            ['작성일자', 'writeDate', 'date'],
          ]}
        />
      }
    >
      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>훈련생 기본정보</div>
        <div className="form-grid">
          <div className="form-card">
            <FormRow label="훈련생명"><input {...field('name')} /></FormRow>
            <FormRow label="생년월일"><input type="date" {...field('birth')} /></FormRow>
            <FormRow label="연락처"><input {...field('phone')} /></FormRow>
            <FormRow label="상담차수"><input type="number" min="1" {...field('round')} /> 회차</FormRow>
          </div>
          <div className="form-card">
            <FormRow label="상담일자"><input type="date" {...field('counselDate')} /></FormRow>
            <FormRow label="상담시간"><input {...field('counselTime')} /></FormRow>
            <FormRow label="상담구분">
              <select {...field('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </FormRow>
            <FormRow label="상담방법">
              <select {...field('method')}>
                {['대면', '전화', '온라인', '기타'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </FormRow>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>상담 현황 요약</div>
        <div className="summary-grid">
          <div className="summary-item"><div className="summary-label">상담차수</div><div className="summary-value"><span>{(data.round || '1') + '회'}</span></div></div>
          <div className="summary-item"><div className="summary-label">상담유형</div><div className="summary-value"><span>{data.type}</span></div></div>
          <div className="summary-item">
            <div className="summary-label">후속조치</div>
            <div className="summary-value">
              <span style={{ color: unfinished ? '#c47a10' : '#1a8a55' }}>{unfinished ? '필요' : '완료'}</span>
            </div>
          </div>
          <div className="summary-item"><div className="summary-label">상담상태</div><div className="summary-value"><span>{hasContent ? '작성중' : '미작성'}</span></div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>상담 내용</div>
        {textBlock('상담 사유 및 주요 상담내용', 'content', 3000)}
        {textBlock('상담 결과 및 조치사항', 'action', 2000)}
        {textBlock('향후 계획', 'future', 2000)}
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">후속조치 관리</div>
          <div className="section-actions">
            <button className="btn btn-small" onClick={rows.copyLast}>이전 항목 복사</button>
            <button className="btn btn-small btn-primary" onClick={rows.add}>조치 추가</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>순번</th>
                <th style={{ width: 160 }}>조치구분</th>
                <th>조치내용</th>
                <th style={{ width: 150 }}>담당자</th>
                <th style={{ width: 150 }}>확인예정일</th>
                <th style={{ width: 130 }}>상태</th>
                <th style={{ width: 95 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((_, i) => (
                <tr key={i}>
                  <td><input className="center" value={i + 1} readOnly /></td>
                  <td><select {...rowField(i, 'category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></td>
                  <td><textarea {...rowField(i, 'content')} /></td>
                  <td><input {...rowField(i, 'manager')} /></td>
                  <td><input type="date" {...rowField(i, 'date')} /></td>
                  <td><select {...rowField(i, 'status')}>{STATUSES.map((c) => <option key={c}>{c}</option>)}</select></td>
                  <td>
                    <div className="row-actions">
                      <button className="row-btn" onClick={() => rows.duplicate(i)}>복사</button>
                      <button className="row-btn" onClick={() => rows.remove(i)}>삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="helper">※ 실제 LMS에서는 훈련생별 상담이력을 누적 저장하고, 후속조치 예정일 기준 알림 기능과 연계할 수 있습니다.</div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>상담자 의견</div>
        <div className="text-block">
          <div className="text-head">종합 의견</div>
          <div className="text-body">
            <textarea maxLength={2000} {...field('opinion')} />
          </div>
        </div>
      </section>
    </SheetPage>
  );
}
