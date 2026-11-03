import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import SubNav from '../components/SubNav.jsx';
import './NcsExamRegistration.css';

const EVAL_TYPES = ['사전평가', '중간평가(요소별)', '최종평가(능력단위)'];
const TOOLS = [
  ['서술형', '서술형'],
  ['문제해결시나리오', '문제해결시나리오'],
  ['평가자체크리스트', '평가자 체크리스트'],
  ['포트폴리오', '포트폴리오'],
];
const TEMPLATES = [
  ['서술형', '주관식 / 단답형 / 서술형', '문제지', '문제출제형(서술형)', '문항, 배점, 정답/모범답안을 등록합니다.'],
  ['5개선택형', '5지선다형', '객관식 문제지', '5개 선택형', '객관식 문제를 선택형으로 구성합니다.'],
  ['학생교사체크형', '학생 / 교사', '체크리스트', '학생/교사 체크형', '학생 자가평가와 교사평가를 함께 운영합니다.'],
  ['문항별점수입력형', '문항별', '득점 입력', '문항별점수입력형', '문항별 점수를 직접 입력하는 평가입니다.'],
];

export default function NcsExamRegistration() {
  const navigate = useNavigate();
  const [evalType, setEvalType] = useState('최종평가(능력단위)');
  const [evalName, setEvalName] = useState('커피 원두 선택 최종평가');
  const [tool, setTool] = useState('서술형');
  const [template, setTemplate] = useState('서술형');
  // 평가지가 등록된 시점의 평가도구 (null이면 미등록)
  const [sheetTool, setSheetTool] = useState(null);

  const sheetCreated = sheetTool !== null;

  const previewSheet = () => {
    if (!sheetCreated) return alert('먼저 평가지 작성이 필요합니다.');
    alert('평가지 미리보기 화면으로 이동합니다.');
  };
  const saveEvaluation = () => {
    if (!evalName.trim()) return alert('평가명을 입력하세요.');
    if (!sheetCreated) return alert('평가지를 먼저 등록하세요.');
    alert(`평가 등록 완료\n\n평가명: ${evalName.trim()}\n평가도구: ${tool}\n평가지 유형: ${template}`);
  };

  return (
    <div className="pg-ncs-exam-registration">
      <div className="page">
        <PageHeader title="NCS 평가 등록" desc="등록된 평가항목에 실제 평가지를 연결하고 평가 운영정보를 설정합니다.">
          <button className="btn" onClick={() => navigate('/ncs-list')}>평가항목 목록</button>
        </PageHeader>

        <section className="card">
          <div className="card-body">
            <div className="course-banner">
              <div>
                <div className="course-name">[내일배움카드(실업자)] 한식 조리사 자격증 대비반</div>
                <div className="course-meta">교육기간 2026.11.04 ~ 2027.01.16 · 진행중</div>
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                <span className="badge success">진행중</span>
                <span className="badge blue">NCS 평가등록</span>
              </div>
            </div>
            <SubNav active={3} />
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">평가 대상 항목</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>평가항목 목록에서 선택한 정보</div>
          </div>
          <div className="card-body">
            <div className="item-path">
              {[['교과목', '바리스타'], ['능력단위', '커피 원두 선택'], ['요소', '커피 원두 선택 이론(최종)']].map(([l, v]) => (
                <div className="path-box" key={l}>
                  <div className="path-label">{l}</div>
                  <div className="path-value">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><div className="section-title">평가 기본정보</div></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field full">
                <div className="label">평가구분</div>
                <div className="control">
                  <div className="radio-grid">
                    {EVAL_TYPES.map((t) => (
                      <label key={t} className={'radio-card' + (evalType === t ? ' active' : '')}>
                        <input type="radio" name="evalType" value={t} checked={evalType === t} onChange={() => setEvalType(t)} /> {t}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="field">
                <div className="label">평가명</div>
                <div className="control"><input value={evalName} onChange={(e) => setEvalName(e.target.value)} /></div>
              </div>
              <div className="field">
                <div className="label">출제자</div>
                <div className="control">
                  <select><option>김교사</option><option>이교사</option><option>박교사</option></select>
                </div>
              </div>
              <div className="field">
                <div className="label">평가일자</div>
                <div className="control"><input type="date" defaultValue="2026-12-05" /></div>
              </div>
              <div className="field">
                <div className="label">패스점수</div>
                <div className="control inline"><input type="number" defaultValue={60} style={{ maxWidth: 120 }} /><span>점</span></div>
              </div>
              <div className="field">
                <div className="label">비밀번호</div>
                <div className="control"><input defaultValue="1234" /></div>
              </div>
              <div className="field">
                <div className="label">재시험 여부</div>
                <div className="control"><select><option>첫시험</option><option>재시험</option></select></div>
              </div>
              <div className="field">
                <div className="label">학생 자가진단</div>
                <div className="control inline"><label><input type="checkbox" /> 학생 자가진단 사용</label></div>
              </div>
              <div className="field">
                <div className="label">평가시간</div>
                <div className="control inline"><input type="number" defaultValue={60} style={{ maxWidth: 120 }} /><span>분</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">평가도구 / 평가지 유형</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>평가항목별로 사용할 평가지를 선택합니다.</div>
          </div>
          <div className="card-body">
            <div className="field full" style={{ marginBottom: 16 }}>
              <div className="label">평가도구</div>
              <div className="control inline">
                <select value={tool} onChange={(e) => setTool(e.target.value)}>
                  {TOOLS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <span style={{ fontSize: 12, color: 'var(--danger)' }}>평가도구에 따라 입력 방식과 채점 방식이 달라집니다.</span>
              </div>
            </div>
            <div className="template-grid">
              {TEMPLATES.map(([key, l1, l2, name, desc]) => (
                <div key={key} className={'template-card' + (template === key ? ' active' : '')} onClick={() => setTemplate(key)}>
                  <div className="template-thumb">{l1}<br />{l2}</div>
                  <div className="template-name">{name}</div>
                  <div className="template-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">평가지 등록</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-small" onClick={previewSheet}>미리보기</button>
              <button className="btn btn-small btn-primary" onClick={() => setSheetTool(tool)}>평가지 작성</button>
            </div>
          </div>
          <div className="card-body">
            <div className="sheet-box">
              <div className="sheet-head">
                <div className="sheet-title">{tool} 평가지</div>
                <span className={'badge ' + (sheetCreated ? 'success' : 'blue')}>{sheetCreated ? '작성완료' : '작성 필요'}</span>
              </div>
              <div className="sheet-body">
                <div className="sheet-placeholder">
                  {sheetCreated ? (
                    <>
                      <strong>{sheetTool} 평가지가 등록되었습니다.</strong>
                      <span>문항/채점기준 편집 화면으로 연결되는 영역입니다.</span>
                    </>
                  ) : (
                    <>
                      <strong>등록된 평가지가 없습니다.</strong>
                      <span>“평가지 작성” 버튼을 눌러 문제지 또는 체크리스트를 등록하세요.</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><div className="section-title">등록 요약</div></div>
          <div className="card-body">
            <div className="summary-bar">
              {[['평가구분', evalType], ['평가도구', tool], ['평가지 유형', template], ['평가지 상태', sheetCreated ? '등록됨' : '미등록']].map(([l, v]) => (
                <div className="summary-item" key={l}>
                  <div className="summary-label">{l}</div>
                  <div className="summary-value">{v}</div>
                </div>
              ))}
            </div>
            <div className="notice" style={{ marginTop: 14 }}>
              평가 등록 후에는 해당 평가항목 목록에서 <b>평가 및 결과확인</b> 버튼으로 응시현황·채점·결과를 확인하게 됩니다.
            </div>
          </div>
        </section>

        <div className="footer-actions">
          <button className="btn" onClick={() => navigate('/ncs-list')}>목록</button>
          <button className="btn btn-success" onClick={() => alert('평가 등록 내용을 임시저장했습니다.')}>임시저장</button>
          <button className="btn btn-primary" onClick={saveEvaluation}>평가 등록</button>
        </div>
      </div>
    </div>
  );
}
