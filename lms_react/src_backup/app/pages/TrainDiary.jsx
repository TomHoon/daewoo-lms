import useDraft from '../hooks/useDraft.js';
import SheetPage from '../components/SheetPage.jsx';
import MetaGrid from '../components/MetaGrid.jsx';
import './TrainDiary.css';

const row = (subject, teacher, content, remark) => ({ subject, teacher, content, remark });
const EMPTY_ROW = row('', '', '', '');

const INITIAL = {
  org: '대우능력개발원',
  course: 'AI 에이전트 클라우드·보안코딩 개발자 양성',
  period: '2026-08-12 ~ 2027-05-14',
  date: '2026-10-19',
  totalDays: '131',
  progressDays: '44',
  totalStudent: '15',
  present: '13',
  absent: '2',
  vacation: '0',
  late: '1',
  etc: '0',
  notice: '',
  sp1: '이호준(1913, 시험공부)',
  sp2: '김지원(개인사유), 김유찬(개인사유)',
  sp3: '',
  sp4: '',
  sp5: '',
  sp6: '',
  rows: [
    row('자바프로그래밍', '이정은', '자바프로그래밍', '김지원, 김유찬, 이호준'),
    row('자바프로그래밍', '이정은', '자바프로그래밍', '김지원, 김유찬, 이호준'),
    row('자바프로그래밍', '이정은', '자바프로그래밍', '김지원, 김유찬'),
    row('자바프로그래밍', '이정은', '자바프로그래밍', '김지원, 김유찬'),
    row('자바프로그래밍', '이정은', '자바프로그래밍', '김지원, 김유찬'),
    EMPTY_ROW,
    EMPTY_ROW,
    EMPTY_ROW,
  ],
};

const SPECIALS = [
  ['지각자', 'sp1', '예: 홍길동(사유)'],
  ['결석자', 'sp2', '예: 홍길동(사유)'],
  ['조퇴자', 'sp3', '없음'],
  ['휴가자', 'sp4', '없음'],
  ['외출자', 'sp5', '없음'],
  ['기타사항', 'sp6', '기타 기록사항'],
];

const calcPresent = (d) =>
  String(Math.max(0, Number(d.totalStudent || 0) - Number(d.absent || 0) - Number(d.vacation || 0)));

export default function TrainDiary() {
  const draft = useDraft('daewoo_training_diary_v1', INITIAL);
  const { data, set, field, markDirty } = draft;
  const rows = draft.rows('rows', EMPTY_ROW, '최소 1개 교시는 유지해야 합니다.');

  const total = Number(data.totalDays || 0);
  const progress = Number(data.progressDays || 0);
  const remaining = Math.max(0, total - progress);
  const rate = total > 0 ? ((progress / total) * 100).toFixed(1) : '0.0';

  // 재적/결석/휴가가 바뀌면 출석 인원을 자동 계산
  const attField = (name) => ({
    value: data[name],
    onChange: (e) => {
      const v = e.target.value;
      set((d) => ({ [name]: v, present: calcPresent({ ...d, [name]: v }) }));
    },
  });

  const rowField = (i, name) => ({
    value: data.rows[i][name],
    onChange: (e) => rows.update(i, { [name]: e.target.value }),
  });

  return (
    <SheetPage
      pg="pg-train-diary"
      title="훈 련 일 지"
      sub="대우능력개발원 LMS"
      footer="훈련일지"
      draft={draft}
      meta={
        <MetaGrid
          draft={draft}
          items={[
            ['훈련기관명', 'org'],
            ['교육과정명', 'course'],
            ['훈련기간', 'period'],
            ['훈련일자', 'date', 'date'],
          ]}
        />
      }
    >
      <section className="section">
        <div className="section-head">
          <div className="section-title">훈련 진행 현황</div>
          <div className="section-actions">
            <button className="btn btn-small" onClick={markDirty}>자동계산</button>
          </div>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">총 훈련일수</div>
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
            <div className="summary-label">진행률</div>
            <div className="summary-value"><span>{rate}%</span></div>
          </div>
        </div>
        <div className="helper">※ 운영 시 휴일·휴강일을 제외한 실제 훈련일 기준으로 서버에서 계산하도록 확장할 수 있습니다.</div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">출결 현황</div>
          <div className="section-actions">
            <button
              className="btn btn-small"
              onClick={() => set((d) => ({ present: calcPresent(d) }))}
            >
              출석 자동계산
            </button>
          </div>
        </div>
        <div className="attendance-grid">
          <div className="att-item"><div className="att-label">재적</div><div className="att-value"><input type="number" {...attField('totalStudent')} />명</div></div>
          <div className="att-item"><div className="att-label">출석</div><div className="att-value"><input type="number" {...field('present')} />명</div></div>
          <div className="att-item"><div className="att-label">결석</div><div className="att-value"><input type="number" {...attField('absent')} />명</div></div>
          <div className="att-item"><div className="att-label">휴가</div><div className="att-value"><input type="number" {...attField('vacation')} />명</div></div>
          <div className="att-item"><div className="att-label">지각</div><div className="att-value"><input type="number" {...field('late')} />명</div></div>
          <div className="att-item"><div className="att-label">조퇴/외출</div><div className="att-value"><input type="number" {...field('etc')} />명</div></div>
        </div>
        <div className="helper">※ 출석 = 재적 - 결석 - 휴가. 지각·조퇴·외출자는 출석 인원에 포함합니다.</div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">훈련 사항</div>
          <div className="section-actions">
            <button className="btn btn-small" onClick={rows.copyLast}>이전 교시 복사</button>
            <button className="btn btn-small btn-primary" onClick={rows.add}>교시 추가</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>교시</th>
                <th style={{ width: 220 }}>훈련과목</th>
                <th style={{ width: 120 }}>담당교사</th>
                <th>훈련내용</th>
                <th style={{ width: 250 }}>비고 (불참자 등)</th>
                <th style={{ width: 95 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((_, i) => (
                <tr key={i}>
                  <td><input className="period" value={i + 1} readOnly /></td>
                  <td><input {...rowField(i, 'subject')} placeholder="훈련과목" /></td>
                  <td><input {...rowField(i, 'teacher')} placeholder="담당교사" /></td>
                  <td><input {...rowField(i, 'content')} placeholder="훈련내용" /></td>
                  <td><input {...rowField(i, 'remark')} placeholder="불참자 / 비고" /></td>
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
        <div className="section-title" style={{ marginBottom: 14 }}>지시 전달 사항</div>
        <div className="notice-box">
          <div className="notice-label">지 시 전 달 사 항</div>
          <div className="notice-body">
            <textarea
              maxLength={1000}
              placeholder="훈련생 전달사항, 공지, 과제, 준비사항 등을 입력하세요."
              {...field('notice')}
            />
            <div className="char-count"><span>{data.notice.length}</span>/1000</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>특기 사항</div>
        <table className="special-table">
          <tbody>
            {SPECIALS.map(([label, name, ph]) => (
              <tr key={name}>
                <th>{label}</th>
                <td><input placeholder={ph} {...field(name)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </SheetPage>
  );
}
