import useDraft from '../hooks/useDraft.js';
import SheetPage from '../components/SheetPage.jsx';
import MetaGrid from '../components/MetaGrid.jsx';
import './ScoringRubric.css';

const TYPES = ['객관식', '주관식', '서술형'];
const EMPTY_ROW = { type: '객관식', answer: '', score: 0, criteria: '', partial: '', deduction: '' };

const INITIAL = {
  org: '대우능력개발원',
  course: 'AI 에이전트 클라우드·보안코딩 개발자 양성',
  evalName: '자바프로그래밍 능력단위 평가',
  evalDate: '2026-11-02',
  method: '필기 + 실기평가',
  teacher: '이정은',
  passScore: '60',
  principle:
    '정답의 취지와 핵심 내용을 충족한 경우 정답으로 인정한다. 서술형 문항은 핵심 개념의 포함 여부, 논리성, 기술 정확도를 종합적으로 판단하여 부분점수를 부여할 수 있다.',
  appeal:
    '합격기준 미달자는 내부 운영 기준에 따라 재평가할 수 있으며, 채점결과에 대한 이의가 있는 경우 담당교사 확인 후 필요한 경우 재검토한다.',
  rows: [
    { type: '객관식', answer: '3', score: 20, criteria: '정답 3번 선택 시 20점, 오답은 0점', partial: '부분점수 없음', deduction: '해당 없음' },
    { type: '객관식', answer: '2', score: 20, criteria: '정답 2번 선택 시 20점, 오답은 0점', partial: '부분점수 없음', deduction: '해당 없음' },
    { type: '주관식', answer: '오버로딩 / 오버라이딩 차이', score: 30, criteria: '두 개념의 정의와 차이를 모두 정확히 설명한 경우 만점', partial: '개념 1개만 정확: 15점 / 차이까지 설명: 30점', deduction: '용어 혼동 또는 핵심 개념 누락 시 감점' },
    { type: '서술형', answer: '예외처리 필요성 및 try-catch-finally 역할', score: 30, criteria: '예외처리 필요성과 각 블록의 역할을 정확히 설명', partial: '필요성 10점 / try-catch 10점 / finally 10점', deduction: '역할 설명 오류 항목당 최대 10점 감점' },
  ],
};

export default function ScoringRubric() {
  const draft = useDraft('scoring_rubric_v1', INITIAL);
  const { data, field } = draft;
  const rows = draft.rows('rows', EMPTY_ROW, '최소 1개의 채점기준은 유지해야 합니다.');

  const total = data.rows.reduce((s, r) => s + Number(r.score || 0), 0);
  const ok = total === 100;

  const rowField = (i, name) => ({
    value: data.rows[i][name],
    onChange: (e) => rows.update(i, { [name]: e.target.value }),
  });

  return (
    <SheetPage
      pg="pg-scoring-rubric"
      title="채 점 기 준 표"
      sub="SCORING RUBRIC"
      footer="채점기준표"
      draft={draft}
      meta={
        <MetaGrid
          draft={draft}
          items={[
            ['훈련기관명', 'org'],
            ['교육과정명', 'course'],
            ['평가명', 'evalName'],
            ['평가일', 'evalDate', 'date'],
            ['평가방법', 'method'],
            ['담당교사', 'teacher'],
          ]}
        />
      }
    >
      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>채점 기준 요약</div>
        <div className="summary-grid">
          <div className="summary-item"><div className="summary-label">총 문항 수</div><div className="summary-value"><input readOnly value={data.rows.length} />문항</div></div>
          <div className="summary-item"><div className="summary-label">총 배점</div><div className="summary-value"><input readOnly value={total} />점</div></div>
          <div className="summary-item"><div className="summary-label">합격 기준</div><div className="summary-value"><input type="number" {...field('passScore')} />점</div></div>
          <div className="summary-item">
            <div className="summary-label">배점 상태</div>
            <div className="summary-value"><span style={{ color: ok ? '#1a8a55' : '#c94a4a' }}>{ok ? '정상' : '배점 확인'}</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">문항별 채점기준</div>
          <div className="section-actions">
            <button className="btn btn-small" onClick={rows.copyLast}>이전 행 복사</button>
            <button className="btn btn-small btn-primary" onClick={rows.add}>문항 추가</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>문항</th>
                <th style={{ width: 120 }}>문항유형</th>
                <th style={{ width: 160 }}>정답</th>
                <th style={{ width: 90 }}>배점</th>
                <th>채점기준</th>
                <th style={{ width: 220 }}>부분점수 기준</th>
                <th style={{ width: 200 }}>감점 기준</th>
                <th style={{ width: 95 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((_, i) => (
                <tr key={i}>
                  <td><input className="center" value={i + 1} readOnly /></td>
                  <td><select {...rowField(i, 'type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></td>
                  <td><input {...rowField(i, 'answer')} placeholder="정답 / 핵심답안" /></td>
                  <td><input className="center" type="number" min="0" {...rowField(i, 'score')} /></td>
                  <td><textarea {...rowField(i, 'criteria')} placeholder="채점기준" /></td>
                  <td><textarea {...rowField(i, 'partial')} placeholder="부분점수 기준" /></td>
                  <td><textarea {...rowField(i, 'deduction')} placeholder="감점 기준" /></td>
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
        <div className="helper">
          ※ 객관식은 정답 일치 여부 중심, 주관식·서술형은 핵심 키워드 및 설명 수준에 따라 부분점수 기준을 작성할 수 있습니다.
        </div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>공통 채점 유의사항</div>
        <div className="notice-box">
          <div className="notice-label">채 점 원 칙</div>
          <div className="notice-body"><textarea {...field('principle')} /></div>
        </div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>재평가 및 이의신청 기준</div>
        <div className="notice-box">
          <div className="notice-label">처 리 기 준</div>
          <div className="notice-body"><textarea {...field('appeal')} /></div>
        </div>
      </section>
    </SheetPage>
  );
}
