import useDraft from '../hooks/useDraft.js';
import SheetPage from '../components/SheetPage.jsx';
import MetaGrid from '../components/MetaGrid.jsx';
import FormRow from '../components/FormRow.jsx';
import './AssessmentPlan.css';

const METHODS = ['필기평가', '실기평가', '과제평가', '구두평가'];
const row = (area, content, method, score, remark) => ({ area, content, method, score, remark });
const EMPTY_ROW = row('', '', '필기평가', 0, '');

const INITIAL = {
  org: '대우능력개발원',
  course: 'AI 에이전트 클라우드·보안코딩 개발자 양성',
  period: '2026-08-12 ~ 2027-05-14',
  writeDate: '2026-10-29',
  evalName: '자바프로그래밍 능력단위 평가',
  evalDate: '2026-11-02',
  evalTime: '14:00 ~ 15:00',
  place: '제1강의실',
  method: '필기평가',
  target: '재적 훈련생 전체',
  teacher: '이정은',
  passScore: '60',
  criteria:
    '각 평가영역별 배점에 따라 채점하며, 총점 60점 이상을 이수 기준으로 적용한다. 실기평가는 결과물 완성도와 요구사항 충족 여부를 함께 평가한다.',
  notes:
    '평가 시작 전 응시자 본인 확인을 실시하며, 부정행위 적발 시 해당 평가를 무효 처리할 수 있다. 미응시자는 사유 확인 후 별도 재평가 일정을 지정한다.',
  rows: [
    row('이론이해', '객체지향 프로그래밍 기본 개념 이해', '필기평가', 25, ''),
    row('문법활용', '클래스, 상속, 인터페이스 활용', '필기평가', 25, ''),
    row('코드작성', '요구사항에 맞는 자바 코드 작성', '실기평가', 30, ''),
    row('문제해결', '오류 분석 및 수정 능력', '실기평가', 20, ''),
  ],
};

export default function AssessmentPlan() {
  const draft = useDraft('assessment_plan_v1', INITIAL);
  const { data, field } = draft;
  const rows = draft.rows('rows', EMPTY_ROW, '최소 1개의 평가 항목은 유지해야 합니다.');

  const total = data.rows.reduce((s, r) => s + Number(r.score || 0), 0);
  const ok = total === 100;

  const rowField = (i, name) => ({
    value: data.rows[i][name],
    onChange: (e) => rows.update(i, { [name]: e.target.value }),
  });

  return (
    <SheetPage
      pg="pg-assessment-plan"
      title="평 가 계 획 서"
      sub="ASSESSMENT PLAN"
      footer="평가계획서"
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
        <div className="section-title" style={{ marginBottom: 14 }}>평가 기본정보</div>
        <div className="form-grid">
          <div className="form-card">
            <FormRow label="평가명"><input {...field('evalName')} /></FormRow>
            <FormRow label="평가일"><input type="date" {...field('evalDate')} /></FormRow>
            <FormRow label="평가시간"><input {...field('evalTime')} /></FormRow>
            <FormRow label="평가장소"><input {...field('place')} /></FormRow>
          </div>
          <div className="form-card">
            <FormRow label="평가방법">
              <select {...field('method')}>
                {[...METHODS, '혼합평가'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </FormRow>
            <FormRow label="평가대상"><input {...field('target')} /></FormRow>
            <FormRow label="담당교사"><input {...field('teacher')} /></FormRow>
            <FormRow label="합격기준"><input type="number" {...field('passScore')} /> 점 이상</FormRow>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">평가 항목 및 배점</div>
          <div className="section-actions">
            <button className="btn btn-small" onClick={rows.copyLast}>이전 행 복사</button>
            <button className="btn btn-small btn-primary" onClick={rows.add}>항목 추가</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>순번</th>
                <th style={{ width: 180 }}>평가영역</th>
                <th>평가내용</th>
                <th style={{ width: 150 }}>평가방법</th>
                <th style={{ width: 110 }}>배점</th>
                <th style={{ width: 140 }}>비고</th>
                <th style={{ width: 95 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((_, i) => (
                <tr key={i}>
                  <td><input className="center" value={i + 1} readOnly /></td>
                  <td><input {...rowField(i, 'area')} placeholder="평가영역" /></td>
                  <td><textarea {...rowField(i, 'content')} placeholder="평가내용" /></td>
                  <td>
                    <select {...rowField(i, 'method')}>
                      {METHODS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </td>
                  <td><input className="center" type="number" min="0" {...rowField(i, 'score')} /></td>
                  <td><input {...rowField(i, 'remark')} placeholder="비고" /></td>
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
        <div className="helper">※ 배점 합계는 자동 계산되며, 총점 100점을 기준으로 작성하는 것을 권장합니다.</div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>평가 기준 요약</div>
        <div className="summary-grid">
          <div className="summary-item"><div className="summary-label">총 배점</div><div className="summary-value"><input type="number" value={total} readOnly />점</div></div>
          <div className="summary-item"><div className="summary-label">합격 기준</div><div className="summary-value"><input type="number" value={Number(data.passScore || 0)} readOnly />점</div></div>
          <div className="summary-item"><div className="summary-label">평가 항목 수</div><div className="summary-value"><input type="number" value={data.rows.length} readOnly />개</div></div>
          <div className="summary-item">
            <div className="summary-label">배점 상태</div>
            <div className="summary-value"><span style={{ color: ok ? '#1a8a55' : '#c94a4a' }}>{ok ? '정상' : '배점 확인'}</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>세부 평가기준</div>
        <div className="notice-box">
          <div className="notice-label">평 가 기 준</div>
          <div className="notice-body"><textarea {...field('criteria')} /></div>
        </div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>평가 운영 및 유의사항</div>
        <div className="notice-box">
          <div className="notice-label">유 의 사 항</div>
          <div className="notice-body"><textarea {...field('notes')} /></div>
        </div>
      </section>
    </SheetPage>
  );
}
