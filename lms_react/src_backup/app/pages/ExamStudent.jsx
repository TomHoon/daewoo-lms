import { useEffect, useState } from 'react';
import './ExamStudent.css';

const QUESTIONS = [
  { no: 1, text: '객체지향 프로그래밍의 특징 중 캡슐화와 상속의 개념을 설명하고 각각의 장점을 작성하시오.', guide: '답안에는 개념 설명과 각 특징의 장점을 포함하여 작성하세요.', score: 10 },
  { no: 2, text: 'Java Collection Framework에서 List와 Set의 차이를 설명하고 각각의 사용 예시를 작성하시오.', guide: '중복 허용 여부와 저장 순서의 특징을 포함하여 작성하세요.', score: 10 },
];
const key = (no) => 'student_exam_q' + no;

function loadInitial() {
  const answers = {};
  const status = {};
  QUESTIONS.forEach(({ no }) => {
    const saved = localStorage.getItem(key(no));
    answers[no] = saved || '';
    status[no] = saved ? '저장된 답안 불러옴' : '미작성';
  });
  return { answers, status };
}

export default function ExamStudent() {
  const [init] = useState(loadInitial);
  const [answers, setAnswers] = useState(init.answers);
  const [status, setStatus] = useState(init.status);
  const [seconds, setSeconds] = useState(60 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [globalStatus, setGlobalStatus] = useState('답안은 입력 즉시 임시 저장됩니다.');

  const total = QUESTIONS.length;
  const written = QUESTIONS.filter((q) => answers[q.no].trim()).length;

  const onAnswer = (no, value) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [no]: value }));
    setStatus((s) => ({ ...s, [no]: value.trim() ? '자동 저장됨' : '미작성' }));
    localStorage.setItem(key(no), value);
  };

  const saveAll = () => {
    QUESTIONS.forEach(({ no }) => localStorage.setItem(key(no), answers[no]));
    setStatus(Object.fromEntries(QUESTIONS.map(({ no }) => [no, answers[no].trim() ? '저장 완료' : '미작성'])));
    setGlobalStatus('현재 답안이 저장되었습니다.');
  };

  const submitExam = () => {
    setSubmitted(true);
    setOverlay(false);
    setGlobalStatus('제출 완료 · 교사 채점 및 피드백 대기');
    alert('시험이 최종 제출되었습니다.');
  };

  // 1초마다 남은 시간 감소, 0이 되면 자동 제출
  useEffect(() => {
    if (submitted) return undefined;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [submitted]);

  useEffect(() => {
    if (seconds === 0 && !submitted) submitExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, submitted]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const empty = total - written;

  return (
    <div className="pg-exam-student">
      <div className="page">
        <div className="topbar">
          <div>
            <h1>서술형 평가</h1>
            <p className="sub">학생 개별 응시 화면 · 답안은 자동 저장됩니다.</p>
          </div>
          <span className="badge">개별 시험지</span>
        </div>

        <section className="card">
          <div className="card-head">
            <h2>응시 정보</h2>
            <span className="timer">남은시간 {mm}:{ss}</span>
          </div>
          <div className="card-body">
            <div className="info-grid">
              {[
                ['훈련과정', '대우 직업훈련 과정'], ['교과목 / 능력단위', '자바 프로그래밍'],
                ['평가명', '자바 프로그래밍 능력단위 평가'], ['평가일', '2026-11-06'],
                ['훈련생', '홍길동'], ['훈련생 번호', '2026-0017'],
                ['총 문항', `${total}문항`], ['총 배점', '20점'],
              ].map(([l, v]) => (
                <div className="info-item" key={l}><span>{l}</span><strong>{v}</strong></div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-body">
            <div className="notice">
              각 문항의 내용을 확인한 후 답안을 작성해주세요. 시험 종료 전 반드시 제출 버튼을 눌러야 하며,
              제출 완료 후에는 답안을 수정할 수 없습니다.
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-body">
            <div className="progress-wrap">
              <div className="progress"><div className="progress-bar" style={{ width: `${(written / total) * 100}%` }}></div></div>
              <div className="progress-text">{written} / {total} 작성</div>
            </div>
          </div>
        </section>

        {QUESTIONS.map((q) => (
          <section className="question" key={q.no}>
            <div className="q-head">
              <div className="q-no"><div className="q-num">{q.no}</div><strong>서술형</strong></div>
              <div className="q-score">배점 {q.score}점</div>
            </div>
            <div className="q-body">
              <div className="q-text">{q.text}</div>
              <div className="q-guide">{q.guide}</div>
              <textarea
                className="answer"
                maxLength={3000}
                placeholder="답안을 입력하세요."
                value={answers[q.no]}
                disabled={submitted}
                onChange={(e) => onAnswer(q.no, e.target.value)}
              />
              <div className="meta">
                <span className="save-status">{status[q.no]}</span>
                <span><span className="count">{answers[q.no].length}</span> / 3000자</span>
              </div>
            </div>
          </section>
        ))}

        <div className="footer">
          <div className="status">{globalStatus}</div>
          <div className="actions">
            <button className="btn" disabled={submitted} onClick={saveAll}>임시저장</button>
            <button className="btn primary" disabled={submitted} onClick={() => setOverlay(true)}>최종 제출</button>
          </div>
        </div>
      </div>

      {overlay && (
        <div className="overlay" style={{ display: 'flex' }}>
          <div className="modal">
            <h3>시험을 제출하시겠습니까?</h3>
            <p>{empty > 0 ? `미작성 문항이 ${empty}개 있습니다. 그래도 제출하시겠습니까?` : '제출 완료 후에는 답안을 수정할 수 없습니다.'}</p>
            <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn" onClick={() => setOverlay(false)}>취소</button>
              <button className="btn primary" onClick={submitExam}>제출하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
