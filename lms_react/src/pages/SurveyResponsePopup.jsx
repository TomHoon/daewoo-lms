import { useState } from 'react';
import './SurveyResponsePopup.css';

const TOTAL = 3;

export default function SurveyResponsePopup() {
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [done, setDone] = useState(false);

  const answered = Object.values(answers).filter((v) => v.trim()).length;
  const set = (key) => (e) => setAnswers((a) => ({ ...a, [key]: e.target.value }));

  const save = () => {
    if (answered < TOTAL) return alert('모든 설문 문항에 응답해 주세요.');
    localStorage.setItem(
      'survey_response_demo',
      JSON.stringify({ q1: answers.q1, q2: answers.q2.trim(), q3: answers.q3.trim() })
    );
    setDone(true);
  };

  return (
    <div className="pg-survey-response-popup">
      <div className="overlay">
        <div className="popup">
          <div className="popup-head">
            <div className="popup-title">모바일 디바이스를 위한 UI 디자인 (2026.03.04~2026.12.27) (2회차)</div>
            <div className="popup-sub">교육생 설문조사</div>
          </div>

          {!done ? (
            <div className="popup-body">
              <div className="progress-box">
                <div className="progress-text">응답 진행률 <strong>{answered} / {TOTAL}</strong></div>
                <div className="progress-track">
                  <div className="progress-bar" style={{ width: `${(answered / TOTAL) * 100}%` }}></div>
                </div>
              </div>

              <section className="question">
                <div className="question-title">
                  <span className="question-number">1.</span>
                  평가결과를 알려주고 부족한 부분을 보완하였는가
                </div>
                <div className="options">
                  {['우수', '보통', '미흡'].map((v) => (
                    <label className="option" key={v}>
                      <input type="radio" name="q1" value={v} checked={answers.q1 === v} onChange={set('q1')} />
                      {v}
                    </label>
                  ))}
                </div>
              </section>

              <section className="question">
                <div className="question-title">
                  <span className="question-number">2.</span>
                  수준을 고려한 맞춤식 수업이 진행되었다고 생각하는가
                </div>
                <input className="answer-input" type="text" placeholder="의견을 입력해 주세요." value={answers.q2} onChange={set('q2')} />
              </section>

              <div className="section-divider">훈련과정에 대한 질문</div>

              <section className="question">
                <div className="question-title">
                  <span className="question-number">3.</span>
                  선호하는 취업(창업) 희망직종
                </div>
                <input className="answer-input" type="text" placeholder="예: 웹 개발자, UI/UX 디자이너 등" value={answers.q3} onChange={set('q3')} />
              </section>

              <div className="footer">
                <div className="note">모든 문항에 응답한 후 저장해 주세요.</div>
                <button className="btn btn-primary" onClick={save}>저장</button>
              </div>
            </div>
          ) : (
            <div className="complete" style={{ display: 'block' }}>
              <div className="complete-icon">✓</div>
              <h2>설문 응답이 저장되었습니다.</h2>
              <p>설문에 참여해 주셔서 감사합니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
