import useDraft from '../hooks/useDraft.js';
import SheetPage from '../components/SheetPage.jsx';
import MetaGrid from '../components/MetaGrid.jsx';
import './EduDiary.css';

const row = (subject, teacher, content, start, end) => ({ subject, teacher, content, start, end });
const EMPTY_ROW = row('', '', '', '', '');

const INITIAL = {
  org: '대우능력개발원',
  course: 'AI 에이전트 클라우드·보안코딩 개발자 양성',
  period: '2026-08-12 ~ 2027-05-14',
  date: '2026-10-19',
  totalDays: '131',
  progressDays: '44',
  totalHours: '352',
  notice: '',
  special1: '',
  special2: '',
  rows: [
    row('자바프로그래밍', '이정은', '객체지향 프로그래밍 및 클래스 기본', '09:00', '10:00'),
    row('자바프로그래밍', '이정은', '상속과 인터페이스 실습', '10:00', '11:00'),
    row('자바프로그래밍', '이정은', '컬렉션 프레임워크', '11:00', '12:00'),
    row('자바프로그래밍', '이정은', '예외처리 및 실습', '13:00', '15:00'),
    row('자바프로그래밍', '이정은', '미니 프로젝트 실습', '15:00', '18:00'),
  ],
};

function timeDiff(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return +(mins / 60).toFixed(2);
}

export default function EduDiary() {
  const draft = useDraft('education_training_diary_v1', INITIAL);
  const { data, field, markDirty } = draft;
  const rows = draft.rows('rows', EMPTY_ROW, '최소 1개의 교육 행은 유지해야 합니다.');

  const remaining = Math.max(0, Number(data.totalDays || 0) - Number(data.progressDays || 0));
  const daily = +data.rows.reduce((s, r) => s + timeDiff(r.start, r.end), 0).toFixed(2);
  const grand = +(Number(data.totalHours || 0) + daily).toFixed(2);

  const rowField = (i, name) => ({
    value: data.rows[i][name],
    onChange: (e) => rows.update(i, { [name]: e.target.value }),
  });

  return (
    <SheetPage
      pg="pg-edu-diary"
      title="교 육 훈 련 일 지"
      sub="EDUCATION & TRAINING DAILY REPORT"
      footer="교육훈련일지"
      draft={draft}
      meta={
        <MetaGrid
          draft={draft}
          items={[
            ['훈련기관명', 'org'],
            ['교육과정명', 'course'],
            ['훈련기간', 'period'],
            ['교육일자', 'date', 'date'],
          ]}
        />
      }
    >
      <section className="section">
        <div className="section-head">
          <div className="section-title">교육 진행 현황</div>
          <div className="section-actions">
            <button className="btn btn-small" onClick={markDirty}>진행일수 계산</button>
            <button className="btn btn-small" onClick={markDirty}>교육시간 계산</button>
          </div>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">총 교육일수</div>
            <div className="summary-value"><input type="number" {...field('totalDays')} />일</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">진행일수</div>
            <div className="summary-value"><input type="number" {...field('progressDays')} />일</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">잔여일수</div>
            <div className="summary-value"><input type="number" value={remaining} readOnly />일</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">교육시간 일계</div>
            <div className="summary-value"><input type="number" value={daily} readOnly />시간</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">교육시간 누계</div>
            <div className="summary-value"><input type="number" {...field('totalHours')} />시간</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">누계 + 금일</div>
            <div className="summary-value"><span>{grand}시간</span></div>
          </div>
        </div>
        <div className="calc-note">
          ※ 일계는 아래 교육시간의 합계로 계산합니다. 누계는 이전일까지의 누적 교육시간을 입력하고, “누계 + 금일”은 자동 계산됩니다.
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">교육훈련 내용</div>
          <div className="section-actions">
            <button className="btn btn-small" onClick={rows.copyLast}>이전 행 복사</button>
            <button className="btn btn-small btn-primary" onClick={rows.add}>행 추가</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>순번</th>
                <th style={{ width: 190 }}>교육과목</th>
                <th style={{ width: 130 }}>강사</th>
                <th>교육내용</th>
                <th style={{ width: 120 }}>시작시간</th>
                <th style={{ width: 120 }}>종료시간</th>
                <th style={{ width: 90 }}>교육시간</th>
                <th style={{ width: 95 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i}>
                  <td><input className="center" value={i + 1} readOnly /></td>
                  <td><input {...rowField(i, 'subject')} placeholder="교육과목" /></td>
                  <td><input {...rowField(i, 'teacher')} placeholder="강사" /></td>
                  <td><textarea {...rowField(i, 'content')} placeholder="교육내용" /></td>
                  <td><input type="time" {...rowField(i, 'start')} /></td>
                  <td><input type="time" {...rowField(i, 'end')} /></td>
                  <td><input className="center" type="number" step="0.25" value={timeDiff(r.start, r.end)} readOnly /></td>
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
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>지시 및 전달사항</div>
        <div className="notice-box">
          <div className="notice-label">지 시 사 항</div>
          <div className="notice-body">
            <textarea
              maxLength={1000}
              placeholder="교육생 공지, 준비사항, 과제 및 전달사항을 입력하세요."
              {...field('notice')}
            />
            <div className="char-count"><span>{data.notice.length}</span>/1000</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>교육 운영 기록</div>
        <div className="special-grid">
          <div className="special-card">
            <div className="head">교육 진행 특이사항</div>
            <textarea placeholder="진도, 교육생 반응, 수업 진행상 특이사항 등을 입력하세요." {...field('special1')} />
          </div>
          <div className="special-card">
            <div className="head">조치사항 / 향후계획</div>
            <textarea placeholder="보강, 추가지도, 일정변경, 차기 교육계획 등을 입력하세요." {...field('special2')} />
          </div>
        </div>
      </section>
    </SheetPage>
  );
}
