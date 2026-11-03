import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import SubNav from '../components/SubNav.jsx';
import './NcsExamSheetRegistration.css';

const Q_TYPES = ['객관식', '주관식', '서술형', '체크리스트'];

const INITIAL_QUESTIONS = [
  { type: '객관식', count: 4, text: '커피 원두 선택 기준으로 가장 적절한 것은?', answer: '2', score: 5 },
  { type: '객관식', count: 4, text: '원두 보관 시 가장 적절한 방법은?', answer: '3', score: 5 },
  { type: '서술형', count: 0, text: '원두 품질을 판단할 때 확인해야 할 항목을 설명하시오.', answer: '모범답안', score: 10 },
];

const PERFORMANCE = [
  [90, '해당 지식과 기술을 확실하게 습득하여 직무수행에 필요한 기술적 사고력과 문제 해결력을 토대로 주도적으로 완벽한 작업을 수행할 수 있다.'],
  [80, '해당 지식과 기술을 습득하여 직무수행에 필요한 기술적 사고력과 문제 해결력을 토대로 작업을 수행할 수 있다.'],
  [70, '해당 지식과 기술을 대부분 습득하여 직무수행에 필요한 지식과 기술을 가지고 대부분의 작업을 수행할 수 있다.'],
  [60, '해당 지식과 기술을 부분적으로 습득하여 직무수행에 필요한 지식과 기술을 가지고 타인과 공동으로 작업할 수 있다.'],
];

const TOOLS = [
  ['bold', <b key="b">B</b>], ['italic', <i key="i">I</i>], ['underline', <u key="u">U</u>],
  ['insertUnorderedList', '• 목록'], ['justifyLeft', '좌'], ['justifyCenter', '중'],
];

export default function NcsExamSheetRegistration() {
  const navigate = useNavigate();
  const [examName, setExamName] = useState('커피 원두 선택 최종평가');
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);

  const patch = (i, p) => setQuestions((l) => l.map((q, k) => (k === i ? { ...q, ...p } : q)));
  const addQuestion = () => setQuestions((l) => [...l, { type: '서술형', count: 0, text: '', answer: '', score: 10 }]);
  const removeQuestion = (i) => {
    if (questions.length <= 1) return alert('최소 1개 문항은 유지해야 합니다.');
    setQuestions((l) => l.filter((_, k) => k !== i));
  };

  const totalScore = questions.reduce((s, q) => s + (Number(q.score) || 0), 0);
  const countOf = (...types) => questions.filter((q) => types.includes(q.type)).length;

  const saveDraft = () => {
    localStorage.setItem('ncs_exam_sheet_demo', JSON.stringify({ questions }));
    alert('평가지 내용을 임시저장했습니다.');
  };
  const saveSheet = () => {
    if (!examName.trim()) return alert('시험명을 입력하세요.');
    if (totalScore <= 0) return alert('배점을 입력하세요.');
    alert(`평가지 저장 완료\n문항수: ${questions.length}개\n총 배점: ${totalScore}점`);
  };

  return (
    <div className="pg-ncs-exam-sheet-registration">
      <div className="page">
        <PageHeader title="NCS 평가지 등록" desc="등록된 평가에 실제 문제지와 수행정도 기준을 작성합니다.">
          <button className="btn" onClick={() => navigate('/ncs-management')}>평가 목록</button>
        </PageHeader>

        <section className="card">
          <div className="card-body">
            <div className="course-banner">
              <div className="course-name">[내일배움카드(실업자)] 한식 조리사 자격증 대비반</div>
              <div className="course-meta">NCS 평가 · 커피 원두 선택 최종평가 · 서술형</div>
            </div>
            <SubNav active={3} />
          </div>
        </section>

        <section className="card">
          <div className="card-head"><div className="section-title">시험 기본정보</div></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field">
                <div className="label">출제자</div>
                <div className="control"><select><option>김교사</option><option>이교사</option></select></div>
              </div>
              <div className="field">
                <div className="label">평가일자</div>
                <div className="control"><input type="date" defaultValue="2026-11-11" /></div>
              </div>
              <div className="field">
                <div className="label">상태</div>
                <div className="control"><select><option>시험중</option><option>대기</option><option>종료</option></select></div>
              </div>
              <div className="field full">
                <div className="label">시험명</div>
                <div className="control"><input value={examName} onChange={(e) => setExamName(e.target.value)} /></div>
              </div>
              <div className="field">
                <div className="label">총 문항수</div>
                <div className="control inline"><input type="number" defaultValue={10} style={{ maxWidth: 100 }} /><span>문항</span></div>
              </div>
              <div className="field">
                <div className="label">패스점수</div>
                <div className="control inline"><input type="number" defaultValue={60} style={{ maxWidth: 100 }} /><span>점</span></div>
              </div>
              <div className="field">
                <div className="label">재시험여부</div>
                <div className="control inline">
                  <select><option>첫시험</option><option>재시험</option></select>
                  <input type="number" defaultValue={0} style={{ maxWidth: 70 }} />
                  <span className="help">ex) 10%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><div className="section-title">설명</div></div>
          <div className="card-body">
            <div className="editor-wrap">
              <div className="editor-toolbar">
                {TOOLS.map(([cmd, label]) => (
                  <button key={cmd} className="tool" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand(cmd, false, null)}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="editor" contentEditable suppressContentEditableWarning>
                평가 진행 전 안내사항과 응시 유의사항을 입력하세요.
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><div className="section-title">수행정도 기준</div></div>
          <div className="card-body">
            <table className="performance-table">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>최소 수행점수</th>
                  <th>수행정도 설명</th>
                </tr>
              </thead>
              <tbody>
                {PERFORMANCE.map(([score, desc]) => (
                  <tr key={score}>
                    <td><input type="number" defaultValue={score} /></td>
                    <td><input defaultValue={desc} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="notice" style={{ marginTop: 12 }}>
              요소별 평가결과 하단의 수행평가기준과 연결되며, 최소 수행점수 이상일 경우 해당 수행정도가 적용됩니다.
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">문제출제</div>
            <button className="btn btn-small btn-primary" onClick={addQuestion}>+ 문항 추가</button>
          </div>
          <div className="card-body">
            <div className="question-layout">
              <div className="question-list">
                {questions.map((q, i) => (
                  <div className="question-card" key={i}>
                    <div className="question-head">
                      <div className="qfield"><label>번호</label><input value={i + 1} readOnly /></div>
                      <div className="qfield">
                        <label>타입</label>
                        <select value={q.type} onChange={(e) => patch(i, { type: e.target.value })}>
                          {Q_TYPES.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <div className="qfield"><label>항목수</label><input type="number" value={q.count} onChange={(e) => patch(i, { count: Number(e.target.value) })} /></div>
                      <div className="qfield"><label>정답/모범답안</label><input value={q.answer} onChange={(e) => patch(i, { answer: e.target.value })} /></div>
                      <div className="qfield"><label>배점</label><input type="number" value={q.score} onChange={(e) => patch(i, { score: Number(e.target.value) })} /></div>
                      <div className="qfield"><label>관리</label><button className="btn btn-danger btn-small" onClick={() => removeQuestion(i)}>삭제</button></div>
                    </div>
                    <div className="question-body">
                      <textarea value={q.text} onChange={(e) => patch(i, { text: e.target.value })} />
                      {q.type === '객관식' && (
                        <div className="options">
                          {[1, 2, 3, 4].map((n) => (
                            <div className="option-row" key={n}>
                              <span>{n}</span>
                              <input type="text" placeholder={`${n}번 보기 입력`} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-panel">
                <div className="panel-head">문제유형 설정 요약</div>
                <div className="panel-body">
                  <div className="summary-row"><span>총 문항수</span><span className="summary-value">{questions.length}</span></div>
                  <div className="summary-row"><span>총 배점</span><span className="summary-value">{totalScore}점</span></div>
                  <div className="summary-row"><span>객관식</span><span className="summary-value">{countOf('객관식')}</span></div>
                  <div className="summary-row"><span>주관/서술형</span><span className="summary-value">{countOf('주관식', '서술형')}</span></div>
                  <div className="summary-row"><span>체크리스트형</span><span className="summary-value">{countOf('체크리스트')}</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="footer-actions">
          <button className="btn" onClick={() => navigate('/ncs-management')}>목록</button>
          <button className="btn btn-success" onClick={saveDraft}>임시저장</button>
          <button className="btn btn-primary" onClick={saveSheet}>평가지 저장</button>
        </div>
      </div>
    </div>
  );
}
