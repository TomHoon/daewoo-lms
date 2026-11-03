import useDraft from '../hooks/useDraft.js';
import SheetPage from '../components/SheetPage.jsx';
import MetaGrid from '../components/MetaGrid.jsx';
import './AssessmentResultSummary.css';

const row = (name, attend, written, practical, assignment, remark) => ({
  name, attend, written, practical, assignment, remark,
});
const EMPTY_ROW = row('', '응시', 0, 0, 0, '');

const INITIAL = {
  org: '대우능력개발원',
  course: 'AI 에이전트 클라우드·보안코딩 개발자 양성',
  evalName: '자바프로그래밍 능력단위 평가',
  evalDate: '2026-11-02',
  method: '필기 + 실기평가',
  passScore: '60',
  opinion:
    '전체적으로 학습목표 달성 수준은 양호하다. 일부 훈련생은 실기 수행에서 보완이 필요하며, 합격기준 미달자는 추가 학습 후 재평가를 진행할 예정이다.',
  action:
    '불합격자 및 미응시자는 사유 확인 후 보충학습과 재평가 일정을 별도로 지정하며, 재평가 결과는 기존 평가결과와 함께 관리한다.',
  rows: [
    row('김지원', '응시', 80, 85, 75, ''),
    row('김유찬', '응시', 70, 78, 80, ''),
    row('이호준', '응시', 55, 58, 60, '재평가 대상'),
    row('박서준', '응시', 90, 92, 88, '우수'),
    row('최민수', '응시', 76, 80, 73, ''),
  ],
};

/** 한 행의 총점/평균/합격여부 계산 */
function calc(r, passScore) {
  if (r.attend === '미응시') return { total: '', average: '', result: '미응시', cls: 'absent' };
  const total = Number(r.written || 0) + Number(r.practical || 0) + Number(r.assignment || 0);
  const average = +(total / 3).toFixed(1);
  const pass = average >= passScore;
  return { total, average, result: pass ? '합격' : '불합격', cls: pass ? 'pass' : 'fail' };
}

export default function AssessmentResultSummary() {
  const draft = useDraft('assessment_result_summary_v1', INITIAL);
  const { data, field } = draft;
  const rows = draft.rows('rows', EMPTY_ROW, '최소 1명의 훈련생은 유지해야 합니다.');

  const passScore = Number(data.passScore || 0);
  const results = data.rows.map((r) => calc(r, passScore));
  const attendees = results.filter((r) => r.result !== '미응시');
  const stats = {
    target: data.rows.length,
    attendee: attendees.length,
    pass: results.filter((r) => r.result === '합격').length,
    fail: results.filter((r) => r.result === '불합격').length,
    absent: results.length - attendees.length,
    avg: attendees.length
      ? (attendees.reduce((s, r) => s + Number(r.average || 0), 0) / attendees.length).toFixed(1)
      : '0.0',
  };

  const rowField = (i, name) => ({
    value: data.rows[i][name],
    onChange: (e) => rows.update(i, { [name]: e.target.value }),
  });

  const SUMMARY = [
    ['대상자', stats.target, '명'],
    ['응시자', stats.attendee, '명'],
    ['합격자', stats.pass, '명'],
    ['불합격자', stats.fail, '명'],
    ['미응시자', stats.absent, '명'],
    ['평균점수', stats.avg, '점'],
  ];

  return (
    <SheetPage
      pg="pg-assessment-result-summary"
      title="평 가 결 과 집 계 표"
      sub="ASSESSMENT RESULT SUMMARY"
      footer="평가결과 집계표"
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
            ['합격기준', 'passScore', 'number'],
          ]}
        />
      }
    >
      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>평가 결과 요약</div>
        <div className="summary-grid">
          {SUMMARY.map(([label, value, unit]) => (
            <div className="summary-item" key={label}>
              <div className="summary-label">{label}</div>
              <div className="summary-value"><input readOnly value={value} />{unit}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">훈련생별 평가결과</div>
          <div className="section-actions">
            <button className="btn btn-small" onClick={rows.copyLast}>이전 행 복사</button>
            <button className="btn btn-small btn-primary" onClick={rows.add}>훈련생 추가</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>순번</th>
                <th style={{ width: 130 }}>훈련생명</th>
                <th style={{ width: 130 }}>응시여부</th>
                <th style={{ width: 110 }}>필기점수</th>
                <th style={{ width: 110 }}>실기점수</th>
                <th style={{ width: 110 }}>과제점수</th>
                <th style={{ width: 110 }}>총점</th>
                <th style={{ width: 110 }}>평균</th>
                <th style={{ width: 120 }}>합격여부</th>
                <th>비고</th>
                <th style={{ width: 95 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((_, i) => {
                const c = results[i];
                return (
                  <tr key={i}>
                    <td><input className="center" value={i + 1} readOnly /></td>
                    <td><input {...rowField(i, 'name')} placeholder="훈련생명" /></td>
                    <td>
                      <select {...rowField(i, 'attend')}>
                        <option>응시</option>
                        <option>미응시</option>
                      </select>
                    </td>
                    {['written', 'practical', 'assignment'].map((f) => (
                      <td key={f}>
                        <input className="center" type="number" min="0" max="100" {...rowField(i, f)} />
                      </td>
                    ))}
                    <td><input className="center" type="number" value={c.total} readOnly /></td>
                    <td><input className="center" type="number" value={c.average} readOnly /></td>
                    <td><div className={'center ' + c.cls}>{c.result}</div></td>
                    <td><input {...rowField(i, 'remark')} placeholder="비고" /></td>
                    <td>
                      <div className="row-actions">
                        <button className="row-btn" onClick={() => rows.duplicate(i)}>복사</button>
                        <button className="row-btn" onClick={() => rows.remove(i)}>삭제</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="helper">
          ※ 총점과 평균은 자동 계산되며, 합격기준 이상일 경우 합격으로 처리합니다. 미응시자는 통계 평균에서 제외합니다.
        </div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>평가 결과 종합 의견</div>
        <div className="notice-box">
          <div className="notice-label">종 합 의 견</div>
          <div className="notice-body"><textarea {...field('opinion')} /></div>
        </div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>재평가 및 조치사항</div>
        <div className="notice-box">
          <div className="notice-label">조 치 사 항</div>
          <div className="notice-body"><textarea {...field('action')} /></div>
        </div>
      </section>
    </SheetPage>
  );
}
