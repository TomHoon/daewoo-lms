import { useState } from 'react';
import './ScenarioStudent.css';

export default function ScenarioStudent() {
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState('');

  const submitWork = () => {
    if (!files.length) return alert('제출할 작업물을 하나 이상 업로드해주세요.');
    alert('작업물이 최종 제출되었습니다.');
  };

  return (
    <div className="pg-scenario-student">
      <div className="page">
        <div className="header">
          <div>
            <h1>문제해결시나리오 평가</h1>
            <p>평가 문제를 확인하고 본인이 작업한 결과물을 업로드하여 제출합니다.</p>
          </div>
          <span className="badge">학생용</span>
        </div>

        <section className="card">
          <div className="card-head"><h2>평가 기본정보</h2><span className="status-chip">제출 전</span></div>
          <div className="card-body">
            <div className="grid">
              {[
                ['훈련과정', '대우 직업훈련 과정'], ['교과목 / 능력단위', '애플리케이션 테스트 수행'],
                ['평가방법', '문제해결시나리오'], ['평가일', '2026-10-07'],
                ['훈련생', '홍길동'], ['훈련생 번호', '2026-0017'],
                ['제출 마감', '2026-10-07 18:00'], ['상태', '미제출'],
              ].map(([l, v]) => (
                <div className="field" key={l}><label>{l}</label><input value={v} readOnly /></div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>평가 문제</h2></div>
          <div className="card-body">
            <div className="problem-sheet">
              <div className="sheet-title">[ 애플리케이션 테스트 수행 ] 평가 문제</div>
              <table className="meta-table">
                <tbody>
                  <tr><th>평가일시</th><td>2026.10.07</td><th>훈련생</th><td>홍길동</td></tr>
                  <tr><th>과정명</th><td colSpan={3}>대우 직업훈련 과정</td></tr>
                  <tr><th>교과목</th><td>애플리케이션 테스트 수행</td><th>평가방법</th><td>문제해결시나리오</td></tr>
                </tbody>
              </table>
              <div className="problem-content">
                <strong>평가내용</strong>
                <ol>
                  <li>아래 제시사항에 따라 애플리케이션 테스트를 수행하시오.</li>
                  <li>테스트 수행 결과를 정리하고, 요구된 결과물을 파일로 제출하시오.</li>
                  <li>제출 파일에는 작업 과정과 최종 결과가 확인될 수 있도록 포함하시오.</li>
                  <li>필요한 경우 화면 캡처, 테스트 결과, 코드 또는 문서를 함께 제출할 수 있습니다.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>작업물 제출</h2></div>
          <div className="card-body">
            <div className="upload-box">
              <strong>본인이 작업한 결과물을 업로드하세요.</strong>
              <p>ZIP, PDF, DOCX, XLSX, PPTX, PNG, JPG 파일 업로드 가능</p>
              <input type="file" multiple onChange={(e) => setFiles([...e.target.files])} />
            </div>
            <div className="file-list">
              {files.map((f, i) => (
                <div className="file-item" key={f.name + i}>
                  <div>
                    <div className="file-name">{f.name}</div>
                    <div className="file-meta">{(f.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <button className="btn" onClick={() => setFiles((l) => l.filter((_, k) => k !== i))}>제거</button>
                </div>
              ))}
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <label>학생 제출 의견</label>
              <textarea placeholder="작업 내용이나 교사에게 전달할 내용을 입력하세요." value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>

            <div className="submit-area">
              <button className="btn" onClick={() => alert('임시저장되었습니다.')}>임시저장</button>
              <button className="btn primary" onClick={submitWork}>최종 제출</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
