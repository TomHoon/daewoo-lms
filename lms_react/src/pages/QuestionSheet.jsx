import { useState } from 'react';
import useDraft from '../hooks/useDraft.js';
import SheetPage from '../components/SheetPage.jsx';
import MetaGrid from '../components/MetaGrid.jsx';
import './QuestionSheet.css';

const TYPES = ['객관식', '주관식', '서술형'];
const EMPTY_Q = { type: '객관식', category: '', score: 0, title: '', options: ['', '', '', ''], answer: '' };

const INITIAL = {
  org: '대우능력개발원',
  course: 'AI 에이전트 클라우드·보안코딩 개발자 양성',
  evalName: '자바프로그래밍 능력단위 평가',
  evalDate: '2026-11-02',
  evalTime: '14:00 ~ 15:00',
  teacher: '이정은',
  questions: [
    {
      type: '객관식', category: '', score: 20,
      title: '다음 중 자바의 특징으로 옳지 않은 것은?',
      options: ['객체지향 언어이다.', '플랫폼 독립적이다.', '다중 상속을 클래스 수준에서 직접 지원한다.', '가비지 컬렉션을 지원한다.'],
      answer: '3',
    },
    {
      type: '객관식', category: '', score: 20,
      title: '다음 중 인터페이스를 구현할 때 사용하는 키워드는 무엇인가?',
      options: ['extends', 'implements', 'instanceof', 'import'],
      answer: '2',
    },
    {
      type: '주관식', category: '', score: 30,
      title: '오버로딩과 오버라이딩의 차이를 간단히 설명하시오.',
      options: ['', '', '', ''],
      answer: '오버로딩은 같은 이름의 메서드를 매개변수 형태를 달리해 정의하는 것이고, 오버라이딩은 상위 클래스 메서드를 하위 클래스에서 재정의하는 것이다.',
    },
    {
      type: '서술형', category: '', score: 30,
      title: '예외처리가 필요한 이유와 try-catch-finally의 역할을 설명하시오.',
      options: ['', '', '', ''],
      answer: '프로그램 실행 중 발생할 수 있는 오류 상황을 안전하게 처리하기 위해 필요하며, try는 예외 가능 코드, catch는 처리, finally는 예외 발생 여부와 관계없이 수행할 코드를 작성한다.',
    },
  ],
};

export default function QuestionSheet() {
  const draft = useDraft('question_sheet_v1', INITIAL);
  const { data } = draft;
  const qs = draft.rows('questions', EMPTY_Q, '최소 1개의 문항은 유지해야 합니다.');
  const [answersVisible, setAnswersVisible] = useState(true);

  const total = data.questions.reduce((s, q) => s + Number(q.score || 0), 0);
  const multiple = data.questions.filter((q) => q.type === '객관식').length;

  const qField = (i, name) => ({
    value: data.questions[i][name],
    onChange: (e) => qs.update(i, { [name]: e.target.value }),
  });
  const setOption = (i, n, value) =>
    qs.update(i, { options: data.questions[i].options.map((o, k) => (k === n ? value : o)) });

  return (
    <SheetPage
      pg="pg-question-sheet"
      title="문 제 지"
      sub="ASSESSMENT QUESTION SHEET"
      footer="문제지"
      draft={draft}
      toolbarLeft={
        <button className="btn" onClick={() => setAnswersVisible((v) => !v)}>정답 표시/숨김</button>
      }
      meta={
        <MetaGrid
          draft={draft}
          items={[
            ['훈련기관명', 'org'],
            ['교육과정명', 'course'],
            ['평가명', 'evalName'],
            ['평가일', 'evalDate', 'date'],
            ['평가시간', 'evalTime'],
            ['담당교사', 'teacher'],
          ]}
        />
      }
    >
      <section className="section">
        <div className="section-title" style={{ marginBottom: 14 }}>문제지 요약</div>
        <div className="summary-grid">
          <div className="summary-item"><div className="summary-label">총 문항 수</div><div className="summary-value"><input readOnly value={data.questions.length} />문항</div></div>
          <div className="summary-item"><div className="summary-label">총 배점</div><div className="summary-value"><input readOnly value={total} />점</div></div>
          <div className="summary-item"><div className="summary-label">객관식</div><div className="summary-value"><input readOnly value={multiple} />문항</div></div>
          <div className="summary-item"><div className="summary-label">주관/서술형</div><div className="summary-value"><input readOnly value={data.questions.length - multiple} />문항</div></div>
        </div>
        <div className="helper">※ 배점 합계와 문항 유형별 개수는 자동 계산됩니다.</div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">평가 문항</div>
          <div className="section-actions">
            <button className="btn btn-small" onClick={qs.copyLast}>이전 문항 복사</button>
            <button className="btn btn-small btn-primary" onClick={qs.add}>문항 추가</button>
          </div>
        </div>
        <div className="question-list">
          {data.questions.map((q, i) => (
            <div className="question-card" key={i}>
              <div className="question-head">
                <div className="qcell qno">Q{i + 1}</div>
                <div className="qcell">
                  <select {...qField(i, 'type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                </div>
                <div className="qcell"><input placeholder="평가영역 / 분류" {...qField(i, 'category')} /></div>
                <div className="qcell"><input type="number" min="0" placeholder="배점" {...qField(i, 'score')} /></div>
                <div className="qcell manage-head" style={{ textAlign: 'center', fontWeight: 700 }}>문항 관리</div>
              </div>
              <div className="question-body">
                <textarea placeholder="문제 내용을 입력하세요." {...qField(i, 'title')} />
                <div className="options-grid" style={{ display: q.type === '객관식' ? 'grid' : 'none' }}>
                  {[0, 1, 2, 3].map((n) => (
                    <div className="option-item" key={n}>
                      <div className="option-no">{n + 1}</div>
                      <input
                        value={q.options[n] || ''}
                        placeholder={`${n + 1}번 보기`}
                        onChange={(e) => setOption(i, n, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div className="answer-area" style={{ display: answersVisible ? 'grid' : 'none' }}>
                  <div className="answer-label">정답 / 모범답안</div>
                  <input placeholder="정답 또는 모범답안을 입력하세요." {...qField(i, 'answer')} />
                </div>
                <div className="question-actions">
                  <button className="row-btn" onClick={() => qs.duplicate(i)}>복사</button>
                  <button className="row-btn" onClick={() => qs.remove(i)}>삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SheetPage>
  );
}
