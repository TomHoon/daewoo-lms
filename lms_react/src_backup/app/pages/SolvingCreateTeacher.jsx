import { useState } from 'react';
import './SolvingCreateTeacher.css';

const DEFAULT_CRITERIA = [
  ['요구사항에 따라 테스트 시나리오를 정확히 수행하였는가', 25, '주요 테스트 케이스 수행 여부 확인'],
  ['테스트 결과와 오류 발생 내용을 적절히 기록하였는가', 25, '오류 내용과 원인 기록 여부 확인'],
  ['수정 후 재테스트를 수행하고 결과를 검증하였는가', 25, '재테스트 및 검증 결과 확인'],
  ['제출 결과물이 평가 요구사항에 맞게 정리되어 있는가', 25, '최종 산출물 구성과 완성도 확인'],
].map(([name, score, guide]) => ({ name, score, guide }));

const REQUIREMENTS = [
  ['작업결과 파일 제출', '학생이 작업한 파일을 업로드합니다.', true],
  ['여러 파일 허용', 'ZIP, PDF, 이미지 등 복수 파일 제출 허용', true],
  ['제출 의견 필수', '학생의 작업 설명을 필수로 입력받습니다.', false],
  ['제출 후 수정 불가', '최종 제출 이후 변경을 제한합니다.', true],
  ['임시저장 허용', '학생이 제출 전 파일을 임시저장할 수 있습니다.', true],
  ['지각 제출 허용', '마감시간 이후에도 제출을 허용합니다.', false],
];

export default function SolvingCreateTeacher() {
  const [mode, setMode] = useState('text');
  const [passScore, setPassScore] = useState('60');
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [problemFile, setProblemFile] = useState(null);

  const total = criteria.reduce((s, c) => s + Number(c.score || 0), 0);
  const pass = Number(passScore || 0);

  const patch = (i, p) => setCriteria((l) => l.map((c, k) => (k === i ? { ...c, ...p } : c)));
  const preview = () => alert('학생용 문제해결시나리오 제출 화면 미리보기로 연결될 영역입니다.');
  const saveExam = () => {
    if (!criteria.length) return alert('채점기준을 1개 이상 등록해주세요.');
    if (total <= 0) return alert('총 배점을 확인해주세요.');
    alert(`문제해결시나리오 평가도구가 저장되었습니다.\n채점기준: ${criteria.length}개\n총 배점: ${total}점`);
  };

  return (
    <div className="pg-solving-create-teacher">
      <div className="page">
        <div className="header">
          <div>
            <h1>문제해결시나리오 평가도구 생성</h1>
            <p>NCS 문제해결시나리오 평가를 생성하고, 학생 제출요건과 채점기준을 설정합니다.</p>
          </div>
          <div className="actions">
            <button className="btn" onClick={preview}>미리보기</button>
            <button className="btn" onClick={() => alert('임시저장되었습니다.')}>임시저장</button>
            <button className="btn primary" onClick={saveExam}>평가도구 저장</button>
          </div>
        </div>

        <section className="card">
          <div className="card-head"><h2>평가 기본정보</h2><span className="badge">교사용</span></div>
          <div className="card-body">
            <div className="grid">
              <div className="field"><label className="required">훈련과정</label><select><option>대우 직업훈련 과정</option></select></div>
              <div className="field"><label className="required">훈련기수</label><select><option>2026년 1기</option></select></div>
              <div className="field"><label className="required">교과목 / 능력단위</label><select><option>애플리케이션 테스트 수행</option></select></div>
              <div className="field"><label className="required">평가방법</label><input value="문제해결시나리오" readOnly /></div>
              <div className="field span-2"><label className="required">평가명</label><input defaultValue="애플리케이션 테스트 수행 평가" /></div>
              <div className="field"><label className="required">평가일</label><input type="date" defaultValue="2026-10-07" /></div>
              <div className="field"><label className="required">제출 마감</label><input type="datetime-local" defaultValue="2026-10-07T18:00" /></div>
              <div className="field"><label>통과점수</label><input type="number" min="0" max="100" value={passScore} onChange={(e) => setPassScore(e.target.value)} /></div>
              <div className="field"><label>재평가 허용</label><select><option>허용</option><option>허용 안 함</option></select></div>
              <div className="field"><label>개별 링크 발급</label><select disabled><option>학생별 자동 발급</option></select></div>
              <div className="field">
                <label>채점 공개</label>
                <select><option>채점 완료 후 공개</option><option>교사 공개 시 공개</option><option>비공개</option></select>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>평가 문제 등록</h2></div>
          <div className="card-body">
            <div className="problem-mode">
              <div className={'mode-card' + (mode === 'text' ? ' active' : '')} onClick={() => setMode('text')}>
                <strong>직접 작성</strong><span>LMS에서 평가문제를 직접 작성합니다.</span>
              </div>
              <div className={'mode-card' + (mode === 'file' ? ' active' : '')} onClick={() => setMode('file')}>
                <strong>문제지 파일 업로드</strong><span>기존 HWP/PDF/DOCX 문제지를 업로드합니다.</span>
              </div>
            </div>

            <div className={mode === 'text' ? '' : 'hidden'}>
              <div className="field">
                <label className="required">평가문제 제목</label>
                <input defaultValue="[ 애플리케이션 테스트 수행 ] 평가 문제" />
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label className="required">평가내용 / 수행지시사항</label>
                <textarea
                  style={{ minHeight: 230 }}
                  defaultValue={`1. 아래 제시사항에 따라 애플리케이션 테스트를 수행하시오.
2. 테스트 수행 결과를 정리하고 요구된 결과물을 파일로 제출하시오.
3. 제출 파일에는 작업 과정과 최종 결과가 확인될 수 있도록 포함하시오.
4. 필요한 경우 화면 캡처, 테스트 결과, 코드 또는 문서를 함께 제출할 수 있습니다.`}
                />
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>교사용 참고사항</label>
                <textarea placeholder="학생에게는 공개되지 않는 교사용 참고사항을 입력하세요." />
              </div>
            </div>

            <div className={mode === 'file' ? '' : 'hidden'}>
              <div className="upload-box">
                <strong>문제지 파일을 업로드하세요.</strong>
                <p>PDF, HWP, DOCX 등의 문제지 파일을 등록할 수 있습니다.</p>
                <input type="file" onChange={(e) => setProblemFile(e.target.files[0] || null)} />
              </div>
              {problemFile && (
                <div className="file-item">
                  <div>
                    <strong>{problemFile.name}</strong>
                    <div className="help">{(problemFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <button className="btn danger" onClick={() => setProblemFile(null)}>제거</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>학생 제출 설정</h2></div>
          <div className="card-body">
            <div className="req-list">
              {REQUIREMENTS.map(([label, help, on]) => (
                <div className="req-item" key={label}>
                  <label><input type="checkbox" defaultChecked={on} /> {label}</label>
                  <div className="help">{help}</div>
                </div>
              ))}
            </div>
            <div className="grid" style={{ marginTop: 16 }}>
              <div className="field"><label>최대 파일 개수</label><input type="number" defaultValue={5} /></div>
              <div className="field"><label>파일당 최대 용량(MB)</label><input type="number" defaultValue={100} /></div>
              <div className="field span-2"><label>허용 확장자</label><input defaultValue="zip,pdf,docx,xlsx,pptx,png,jpg" /></div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>채점기준 설정</h2>
            <button className="btn primary" onClick={() => setCriteria((l) => [...l, { name: '', score: 0, guide: '' }])}>+ 채점기준 추가</button>
          </div>
          <div className="card-body">
            <table className="score-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>순번</th><th>채점기준</th><th style={{ width: 130 }}>배점</th>
                  <th>교사용 채점 가이드</th><th style={{ width: 80 }}>삭제</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c, i) => (
                  <tr key={i}>
                    <td className="criterion-no">{i + 1}</td>
                    <td><input value={c.name} placeholder="예: 요구사항에 따라 테스트 시나리오를 정확히 수행하였는가" onChange={(e) => patch(i, { name: e.target.value })} /></td>
                    <td><input className="criterion-score" type="number" min="0" value={c.score} onChange={(e) => patch(i, { score: e.target.value })} /></td>
                    <td><input value={c.guide} placeholder="채점 시 참고할 가이드를 입력하세요." onChange={(e) => patch(i, { guide: e.target.value })} /></td>
                    <td><button className="btn danger" onClick={() => setCriteria((l) => l.filter((_, k) => k !== i))}>삭제</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="total-box">
              <div>총 배점 <strong>{total}</strong>점</div>
              <div>통과점수 <strong>{pass}</strong>점</div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>피드백 / 재평가 설정</h2></div>
          <div className="card-body">
            <div className="grid">
              <div className="field span-2">
                <label>학생 피드백 방식</label>
                <select><option>종합 피드백 + 채점기준별 메모</option><option>종합 피드백만</option><option>채점기준별 메모만</option></select>
              </div>
              <div className="field"><label>재평가 시 기존 점수 표시</label><select><option>표시</option><option>숨김</option></select></div>
              <div className="field"><label>재평가 결과 반영</label><select><option>최종 점수로 대체</option><option>최고 점수 반영</option><option>교사 선택</option></select></div>
              <div className="field span-4">
                <label>기본 피드백 안내문</label>
                <textarea defaultValue="채점 완료 후 평가결과와 피드백을 확인할 수 있습니다. 보완이 필요한 경우 재평가 안내를 확인해주세요." />
              </div>
            </div>
          </div>
        </section>

        <div className="footer">
          <div className="summary">
            <div>채점기준 수<strong>{criteria.length}개</strong></div>
            <div>총 배점<strong>{total}점</strong></div>
            <div>통과점수<strong>{pass}점</strong></div>
          </div>
          <div className="actions">
            <button className="btn" onClick={preview}>학생 화면 미리보기</button>
            <button className="btn primary" onClick={saveExam}>평가도구 저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}
