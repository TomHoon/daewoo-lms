import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import './SurveyRegistration.css';

const QUESTIONS = [
  '평가결과를 알려주고 부족한 부분을 보완하였는가',
  '수준을 고려한 맞춤식 수업이 진행되었다고 생각하는가',
  '훈련과정에 대한 전반적인 만족도는 어떠한가',
  '선호하는 취업(창업) 희망직종은 무엇인가',
  '강사의 수업 준비와 설명은 충분했는가',
  '실습환경 및 시설에 만족하는가',
  '교재 및 학습자료의 품질에 만족하는가',
  '과정 난이도는 적절했는가',
  '취업지원 서비스가 도움이 되었는가',
  '본 과정을 다른 사람에게 추천할 의향이 있는가',
];
const MAX = 30;

export default function SurveyRegistration() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('훈련생 수요 및 만족도 조사');
  const [selected, setSelected] = useState([0, 1, 2, 3]);

  const toggle = (idx, checked) => {
    if (checked) {
      if (selected.length >= MAX) return alert(`최대 ${MAX}개 문항까지 선택할 수 있습니다.`);
      if (!selected.includes(idx)) setSelected([...selected, idx]);
    } else {
      setSelected(selected.filter((x) => x !== idx));
    }
  };

  const move = (pos, dir) => {
    const to = pos + dir;
    if (to < 0 || to >= selected.length) return;
    const next = [...selected];
    [next[pos], next[to]] = [next[to], next[pos]];
    setSelected(next);
  };

  const save = () => {
    if (!title.trim()) return alert('설문제목을 입력하세요.');
    if (!selected.length) return alert('설문 문항을 1개 이상 선택하세요.');
    alert(`설문조사 저장 완료\n제목: ${title.trim()}\n선택 문항: ${selected.length}개`);
  };

  return (
    <div className="pg-survey-registration">
      <div className="page">
        <PageHeader title="설문조사 등록" desc="과정별 설문조사를 생성하고 문항을 선택하여 회차별로 운영합니다.">
          <button className="btn" onClick={() => navigate(-1)}>목록</button>
        </PageHeader>

        <section className="card">
          <div className="card-body">
            <div className="notice">
              <strong>안내</strong><br />
              · 교육생 설문은 현재 진행중인 과정에 대해 등록하는 것을 권장합니다.<br />
              · 구분은 운영대장 출력 및 통계 분류에 사용됩니다.<br />
              · 설문타입이 교육생설문인 경우 과정선택 후 설문제목을 작성합니다.<br />
              · 설문타입이 공개설문인 경우 과정선택 없이 설문제목만 작성할 수 있습니다.
            </div>

            <div className="form-grid">
              <div className="field">
                <div className="label">설문타입</div>
                <div className="control">
                  <select><option>교육생설문</option><option>공개설문</option></select>
                </div>
              </div>
              <div className="field">
                <div className="label">구분</div>
                <div className="control">
                  <select>
                    {['[과정] 훈련생수요 및 요구', '[과정] 만족도조사', '[취업] 취업희망조사', '[사전] 사전평가', '기타'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="field full">
                <div className="label">과정선택</div>
                <div className="control">
                  <select>
                    {['모바일 디바이스를 위한 UI 디자인 (2026.03.04~2026.12.27)', 'AI 에이전트 클라우드·보안코딩 개발자 양성', '[대구] 재직자를 위한 고급 JAVA 개발'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="field full">
                <div className="label">설문제목</div>
                <div className="control inline">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} />
                  <button className="btn btn-small" onClick={() => alert('현재 설문을 복제하여 새 설문으로 생성하는 기능입니다.')}>설문복제</button>
                </div>
              </div>
              <div className="field">
                <div className="label">비밀번호</div>
                <div className="control"><input defaultValue="1234" /></div>
              </div>
              <div className="field">
                <div className="label">회차</div>
                <div className="control inline">
                  <input type="number" min="1" defaultValue={1} style={{ maxWidth: 100 }} />
                  <span>회차</span>
                </div>
              </div>
              <div className="field">
                <div className="label">상태</div>
                <div className="control">
                  <select><option>대기</option><option>설문중</option><option>종료</option></select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">설문 문항 선택</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>최대 {MAX}개 문항까지 선택 가능</div>
          </div>
          <div className="card-body">
            <div className="question-layout">
              <div className="question-list">
                <div className="panel-head">문항 목록</div>
                <div>
                  {QUESTIONS.map((q, i) => (
                    <label className="question-item" key={i}>
                      <input type="checkbox" checked={selected.includes(i)} onChange={(e) => toggle(i, e.target.checked)} />
                      <div className="question-text">{q}</div>
                      <span className="badge">{i < 4 ? '기본' : '추가'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="selected-list">
                <div className="panel-head">선택된 문항</div>
                <div>
                  {selected.length === 0 ? (
                    <div style={{ padding: 20, color: '#768297', fontSize: 12, textAlign: 'center' }}>선택된 문항이 없습니다.</div>
                  ) : (
                    selected.map((idx, pos) => (
                      <div className="selected-row" key={idx}>
                        <div className="selected-index">{pos + 1}</div>
                        <div className="selected-text">{QUESTIONS[idx]}</div>
                        <div className="order-btns">
                          <button className="icon-btn" onClick={() => move(pos, -1)}>▲</button>
                          <button className="icon-btn" onClick={() => move(pos, 1)}>▼</button>
                          <button className="icon-btn" style={{ color: '#d9534f' }} onClick={() => setSelected(selected.filter((_, k) => k !== pos))}>×</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="summary">
              <div>선택된 문항 수 : <strong style={{ color: 'var(--primary)' }}>{selected.length}</strong>/{MAX}</div>
              <div>문항 순서는 우측 ▲ ▼ 버튼으로 변경할 수 있습니다.</div>
            </div>
          </div>
        </section>

        <div className="footer-actions">
          <button className="btn" onClick={() => navigate(-1)}>목록</button>
          <button className="btn btn-primary" onClick={save}>저장</button>
        </div>
      </div>
    </div>
  );
}
