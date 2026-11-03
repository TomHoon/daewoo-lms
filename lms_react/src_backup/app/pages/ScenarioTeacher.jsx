import { useState } from 'react';
import './ScenarioTeacher.css';

const STUDENTS = [
  { name: '홍길동', no: '2026-0017', status: '제출완료' },
  { name: '김민수', no: '2026-0018', status: '제출완료' },
  { name: '이수진', no: '2026-0019', status: '미제출' },
  { name: '박지훈', no: '2026-0020', status: '채점완료' },
];

const CRITERIA = [
  ['요구사항에 따라 테스트 시나리오를 정확히 수행하였는가', 25, 23, '주요 테스트 케이스 정상 수행'],
  ['테스트 결과와 오류 발생 내용을 적절히 기록하였는가', 25, 22, '오류 원인 설명 보완 필요'],
  ['수정 후 재테스트를 수행하고 결과를 검증하였는가', 25, 24, '재테스트 결과 명확함'],
  ['제출 결과물이 평가 요구사항에 맞게 정리되어 있는가', 25, 21, '문서 정리 상태 양호'],
];

export default function ScenarioTeacher() {
  const [selected, setSelected] = useState(STUDENTS[0]);
  const [scores, setScores] = useState(CRITERIA.map((c) => c[2]));

  const total = scores.reduce((s, v) => s + Number(v || 0), 0);

  return (
    <div className="pg-scenario-teacher">
      <div className="page">
        <div className="header">
          <div>
            <h1>문제해결시나리오 채점</h1>
            <p>학생별 제출자료를 확인하고 채점기준에 따라 점수와 피드백을 입력합니다.</p>
          </div>
          <span className="badge">교사용</span>
        </div>

        <div className="teacher-layout">
          <aside className="card">
            <div className="card-head"><h2>훈련생 제출현황</h2></div>
            <div className="card-body">
              <div className="student-list">
                {STUDENTS.map((s) => (
                  <div
                    key={s.no}
                    className={'student-item' + (selected.no === s.no ? ' active' : '')}
                    onClick={() => setSelected(s)}
                  >
                    <strong>{s.name}</strong>
                    <span>{s.no} · {s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main>
            <section className="card">
              <div className="card-head">
                <h2>{selected.name} 제출자료</h2>
                <span className={'status-chip ' + (selected.status === '미제출' ? 'wait' : 'done')}>{selected.status}</span>
              </div>
              <div className="card-body">
                <div className="file-list">
                  {[
                    ['application_test_result.zip', '12.4 MB · 2026-10-07 16:42 제출'],
                    ['test_result_report.pdf', '1.8 MB · 2026-10-07 16:42 제출'],
                  ].map(([name, meta]) => (
                    <div className="file-item" key={name}>
                      <div><div className="file-name">{name}</div><div className="file-meta">{meta}</div></div>
                      <button className="btn">다운로드</button>
                    </div>
                  ))}
                </div>
                <div className="field" style={{ marginTop: 14 }}>
                  <label>학생 제출 의견</label>
                  <textarea readOnly defaultValue="테스트 케이스 수행 결과와 오류 수정 내역을 함께 첨부했습니다." />
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-head"><h2>채점기준별 평가</h2></div>
              <div className="card-body">
                <table className="score-table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>순번</th><th>채점기준</th><th style={{ width: 110 }}>배점</th>
                      <th style={{ width: 130 }}>취득점수</th><th>채점 메모</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CRITERIA.map(([text, max, , memo], i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{text}</td>
                        <td>{max}점</td>
                        <td>
                          <input
                            className="score-input score"
                            type="number"
                            min="0"
                            max={max}
                            value={scores[i]}
                            onChange={(e) => setScores((s) => s.map((v, k) => (k === i ? e.target.value : v)))}
                          />
                        </td>
                        <td><input defaultValue={memo} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="total-box">
                  <div>총점 <strong>{total}</strong> / 100</div>
                  <div>판정 <strong>{total >= 60 ? 'PASS' : 'FAIL'}</strong></div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-head"><h2>교사 피드백</h2></div>
              <div className="card-body">
                <div className="feedback-grid">
                  <div className="field">
                    <label>종합 피드백</label>
                    <textarea defaultValue="테스트 시나리오 수행과 결과 정리는 전반적으로 잘 되어 있습니다. 오류 원인 분석을 조금 더 구체적으로 작성하면 좋겠습니다." />
                  </div>
                  <div className="field">
                    <label>보완사항 / 재평가 안내</label>
                    <textarea placeholder="보완이 필요한 내용이나 재평가 안내사항을 입력하세요." />
                  </div>
                </div>
                <div className="grid" style={{ marginTop: 14 }}>
                  <div className="field"><label>최종 판정</label><select><option>PASS</option><option>FAIL</option><option>재평가</option></select></div>
                  <div className="field"><label>피드백 공개</label><select><option>학생에게 공개</option><option>비공개</option></select></div>
                  <div className="field"><label>재평가 필요</label><select><option>아니오</option><option>예</option></select></div>
                  <div className="field"><label>채점자</label><input value="이정훈" readOnly /></div>
                </div>
                <div className="submit-area">
                  <button className="btn" onClick={() => alert('채점 내용이 임시저장되었습니다.')}>임시저장</button>
                  <button className="btn success" onClick={() => alert('채점 및 피드백이 확정되었습니다.')}>채점 완료</button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
