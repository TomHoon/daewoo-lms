import { useState } from 'react';
import './ExamTeacher.css';

let seq = 0;
const newQuestion = (text = '') => ({
  id: ++seq,
  text,
  condition: '',
  model: '',
  criteria: [
    { text: '핵심 내용이 정확하게 포함되어 있는가?', score: 5 },
    { text: '내용을 논리적으로 설명하였는가?', score: 5 },
  ],
  score: 10,
  level: '중',
  mode: '문항별 점수 직접 입력',
  partial: '허용',
  attach: '허용 안 함',
});

const initialQuestions = () => [
  newQuestion('객체지향 프로그래밍의 특징 중 캡슐화와 상속의 개념을 설명하고 각각의 장점을 작성하시오.'),
  newQuestion('Java Collection Framework에서 List와 Set의 차이를 설명하고 각각의 사용 예시를 작성하시오.'),
];

const sumCriteria = (criteria) => criteria.reduce((s, c) => s + Number(c.score || 0), 0);

export default function ExamTeacher() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [passScore, setPassScore] = useState('60');

  const patch = (id, p) => setQuestions((l) => l.map((q) => (q.id === id ? { ...q, ...p } : q)));
  const patchCriteria = (q, criteria) => patch(q.id, { criteria, score: sumCriteria(criteria) });

  const move = (i, d) =>
    setQuestions((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const n = [...l];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const remove = (id) => {
    if (confirm('이 문항을 삭제하시겠습니까?')) setQuestions((l) => l.filter((q) => q.id !== id));
  };

  const total = questions.reduce((s, q) => s + Number(q.score || 0), 0);

  const saveExam = () => {
    if (!questions.length) return alert('최소 1개 이상의 문항을 등록해주세요.');
    alert(`시험지가 저장되었습니다.\n총 배점: ${total}점\n학생별 개별 링크는 시험 배포 단계에서 생성됩니다.`);
  };
  const previewExam = () => alert('학생용 시험지 미리보기 화면으로 연결될 영역입니다.');

  return (
    <div className="pg-exam-teacher">
      <div className="page">
        <div className="topbar">
          <div>
            <h1>서술형 시험지 생성</h1>
            <p className="subtitle">NCS 평가용 서술형 시험지를 구성하고 문항별 배점 및 채점기준을 설정합니다.</p>
          </div>
          <div className="actions">
            <button className="btn" onClick={previewExam}>미리보기</button>
            <button className="btn" onClick={() => alert('임시저장되었습니다.')}>임시저장</button>
            <button className="btn primary" onClick={saveExam}>시험지 저장</button>
          </div>
        </div>

        <section className="card">
          <div className="card-head"><h2>시험 기본정보</h2><span className="badge">교사용</span></div>
          <div className="card-body">
            <div className="grid">
              <div className="field"><label className="required">훈련과정</label><select><option>대우 직업훈련 과정</option></select></div>
              <div className="field"><label className="required">훈련기수</label><select><option>2026년 1기</option></select></div>
              <div className="field"><label className="required">교과목 / 능력단위</label><select><option>자바 프로그래밍</option></select></div>
              <div className="field"><label className="required">평가방법</label><select disabled><option>서술형시험</option></select></div>

              <div className="field span-2"><label className="required">시험지명</label><input defaultValue="자바 프로그래밍 능력단위 평가" /></div>
              <div className="field"><label className="required">평가일</label><input type="date" defaultValue="2026-11-06" /></div>
              <div className="field"><label>시험시간(분)</label><input type="number" defaultValue={60} /></div>

              <div className="field"><label>통과점수</label><input type="number" value={passScore} onChange={(e) => setPassScore(e.target.value)} /></div>
              <div className="field"><label>재평가 허용</label><select><option>허용</option><option>허용 안 함</option></select></div>
              <div className="field"><label>학생 문제순서</label><select><option>동일 순서</option><option>학생별 랜덤</option></select></div>
              <div className="field"><label>개별 링크 발급</label><select disabled><option>학생별 자동 발급</option></select></div>

              <div className="field span-4">
                <label>시험 안내문</label>
                <textarea defaultValue="각 문항의 내용을 확인한 후 답안을 작성해주세요. 답안 제출 후에는 수정이 제한될 수 있습니다." />
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>문항 구성</h2>
            <button className="btn primary" onClick={() => setQuestions((l) => [...l, newQuestion()])}>+ 문항 추가</button>
          </div>
          <div className="card-body">
            <div className="question-list">
              {questions.map((q, i) => (
                <article className="question" key={q.id}>
                  <div className="question-head">
                    <div className="q-title"><div className="q-no">{i + 1}</div><strong>서술형 문항</strong></div>
                    <div className="q-actions">
                      <button className="btn" onClick={() => move(i, -1)}>↑</button>
                      <button className="btn" onClick={() => move(i, 1)}>↓</button>
                      <button className="btn danger" onClick={() => remove(q.id)}>삭제</button>
                    </div>
                  </div>
                  <div className="question-body">
                    <div className="left-col">
                      <div className="field">
                        <label className="required">문제</label>
                        <textarea placeholder="학생에게 출제할 문제를 입력하세요." value={q.text} onChange={(e) => patch(q.id, { text: e.target.value })} />
                      </div>
                      <div className="field">
                        <label>문제 안내 / 조건</label>
                        <textarea placeholder="답안 작성 시 참고할 조건이나 요구사항을 입력하세요." value={q.condition} onChange={(e) => patch(q.id, { condition: e.target.value })} />
                      </div>
                      <div className="field">
                        <label className="required">모범답안 / 정답기준</label>
                        <textarea placeholder="교사용 모범답안 또는 핵심 정답 내용을 입력하세요." value={q.model} onChange={(e) => patch(q.id, { model: e.target.value })} />
                      </div>
                      <div className="field">
                        <label>채점기준</label>
                        <div className="criteria-box">
                          <div className="criteria-head"><div>순번</div><div>평가기준</div><div>배점</div><div></div></div>
                          <div className="criteria-body">
                            {q.criteria.map((c, k) => (
                              <div className="criteria-row" key={k}>
                                <div className="criteria-no">{k + 1}</div>
                                <div>
                                  <input
                                    value={c.text}
                                    placeholder="평가기준 입력"
                                    onChange={(e) => patchCriteria(q, q.criteria.map((x, n) => (n === k ? { ...x, text: e.target.value } : x)))}
                                  />
                                </div>
                                <div>
                                  <input
                                    type="number"
                                    min="0"
                                    value={c.score}
                                    onChange={(e) => patchCriteria(q, q.criteria.map((x, n) => (n === k ? { ...x, score: e.target.value } : x)))}
                                  />
                                </div>
                                <div>
                                  <button className="remove-criteria" onClick={() => patchCriteria(q, q.criteria.filter((_, n) => n !== k))}>×</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button className="add-criteria" onClick={() => patchCriteria(q, [...q.criteria, { text: '', score: 0 }])}>+ 채점기준 추가</button>
                        <div className="help">예: 핵심 개념 설명 3점 / 적용 사례 제시 4점 / 결론 도출 3점</div>
                      </div>
                    </div>

                    <div className="right-col">
                      <div className="inline-grid">
                        <div className="field">
                          <label className="required">문항 배점</label>
                          <input type="number" min="0" value={q.score} onChange={(e) => patch(q.id, { score: e.target.value })} />
                        </div>
                        <div className="field">
                          <label>난이도</label>
                          <select value={q.level} onChange={(e) => patch(q.id, { level: e.target.value })}>
                            <option>하</option><option>중</option><option>상</option>
                          </select>
                        </div>
                      </div>
                      <div className="field">
                        <label>채점 방식</label>
                        <select value={q.mode} onChange={(e) => patch(q.id, { mode: e.target.value })}>
                          <option>문항별 점수 직접 입력</option><option>채점기준 합산</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>부분점수 허용</label>
                        <select value={q.partial} onChange={(e) => patch(q.id, { partial: e.target.value })}>
                          <option>허용</option><option>허용 안 함</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>학생 첨부파일</label>
                        <select value={q.attach} onChange={(e) => patch(q.id, { attach: e.target.value })}>
                          <option>허용 안 함</option><option>허용</option>
                        </select>
                      </div>
                      <div className="score-box">
                        <span>현재 문항 배점</span>
                        <div className="big"><span className="score-display">{Number(q.score || 0)}</span>점</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="footer-summary">
          <div className="summary-left">
            <div className="summary-item">총 문항<strong>{questions.length}개</strong></div>
            <div className="summary-item">총 배점<strong>{total}점</strong></div>
            <div className="summary-item">통과점수<strong>{passScore || 0}점</strong></div>
          </div>
          <div className="actions">
            <button className="btn" onClick={previewExam}>학생 화면 미리보기</button>
            <button className="btn primary" onClick={saveExam}>시험지 저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}
