import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EntryPopup.css';

const TABS = [
  ['visitor', '방문지원자입력'],
  ['trainee', '훈련생(접수자)선택'],
  ['member', '회원선택'],
  ['csv', 'CSV등록'],
];

const TRAINEES = [
  { name: '김향단', birth: '1975-08-28', phone: '070-7538-3008', region: '달서구', history: '[합격] [진행중] 국가기간전략산업 / UI디자인' },
  { name: '박용룡', birth: '1979-02-25', phone: '010-7777-8888', region: '', history: '[합격] [진행중] 모바일 디바이스를 위한 UI 디자인' },
  { name: '최용룡', birth: '1988-08-28', phone: '010-6666-7777', region: '', history: '[합격] [진행중] 모바일 디바이스를 위한 UI 디자인' },
  { name: '이용룡', birth: '1996-07-26', phone: '010-5555-6666', region: '', history: '[합격] [진행중] 모바일 디바이스를 위한 UI 디자인' },
  { name: '성길동', birth: '1999-08-07', phone: '010-4444-5555', region: '종로구', history: '[합격] [진행중] 모바일 디바이스를 위한 UI 디자인' },
];
const MEMBERS = [
  { level: '교사 [50]', name: '김교사', birth: '1988-01-27', phone: '010-4808-1870', region: '남구' },
  { level: '슈퍼관리자 [99]', name: '우리컴퍼런스', birth: '-', phone: '000-000-0000', region: '' },
];

const selectPerson = (name) => alert(`"${name}" 을(를) 접수자로 선택했습니다.`);
const match = (obj, q) => Object.values(obj).join(' ').includes(q);

const Field = ({ label, full, children }) => (
  <div className="field" style={full ? { gridColumn: '1/-1' } : undefined}>
    <div className="label">{label}</div>
    <div className="control">{children}</div>
  </div>
);

export default function EntryPopup() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('visitor');
  const [photo, setPhoto] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [traineeInput, setTraineeInput] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [traineeQuery, setTraineeQuery] = useState('');
  const [memberQuery, setMemberQuery] = useState('');

  const onPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveCsv = () => {
    if (!csvFile) return alert('CSV 파일을 선택하세요.');
    alert('CSV 등록이 완료되었습니다.');
  };
  const saveCurrent = () => {
    const label = TABS.find(([k]) => k === tab)[1];
    alert(`${label} 방식으로 접수 정보를 등록합니다.`);
  };

  const panel = (key) => 'tab-panel' + (tab === key ? ' active' : '');

  return (
    <div className="pg-entry-popup">
      <div className="overlay">
        <div className="modal">
          <div className="modal-head">
            <div className="modal-title">입학접수 간편입력</div>
            <div className="modal-sub">방문지원자 직접입력, 기존 접수자 선택, 회원선택, CSV 일괄등록을 한 화면에서 처리합니다.</div>
          </div>

          <div className="tabs">
            {TABS.map(([key, label]) => (
              <button key={key} className={'tab' + (tab === key ? ' active' : '')} onClick={() => setTab(key)}>{label}</button>
            ))}
          </div>

          {/* 방문지원자입력 */}
          <section className={panel('visitor')}>
            <div className="section-title">과정선택</div>
            <div className="course-box">
              <div className="course-grid">
                <Field label="훈련직종분류">
                  <select><option>내일배움카드(재직자)</option><option>국가기간전략산업</option><option>일반과정</option></select>
                </Field>
                <Field label="교육과정분류">
                  <select><option>프로그래밍</option><option>UI/UX디자인</option><option>컴퓨터활용</option></select>
                </Field>
                <Field label="과정명" full>
                  <select><option>[대구] 재직자를 위한 고급 JAVA 개발 (2026.11.21~2027.03.31)</option></select>
                </Field>
              </div>
            </div>

            <div className="section-title">지원자 기본정보</div>
            <div className="photo-wrap">
              <div>
                <div className="photo-box">
                  <img alt="" src={photo || undefined} style={{ display: photo ? 'block' : 'none' }} />
                  <span>사진을 등록하세요.</span>
                </div>
                <div className="inline" style={{ marginTop: 8 }}>
                  <label className="btn btn-small btn-primary" htmlFor="photoInput">+ 추가</label>
                  <input id="photoInput" type="file" accept="image/*" hidden onChange={onPhoto} />
                  <button className="btn btn-small btn-danger" onClick={() => setPhoto('')}>삭제</button>
                </div>
              </div>
              <div className="form-grid">
                <Field label="이름"><input defaultValue="홍길동" /></Field>
                <Field label="생년월일"><input type="date" defaultValue="1998-06-12" /></Field>
                <Field label="성별">
                  <div className="inline">
                    <label><input type="radio" name="gender" defaultChecked /> 남성</label>
                    <label><input type="radio" name="gender" /> 여성</label>
                  </div>
                </Field>
                <Field label="내/외국인">
                  <div className="inline">
                    <label><input type="radio" name="national" defaultChecked /> 내국인</label>
                    <label><input type="radio" name="national" /> 외국인</label>
                  </div>
                </Field>
                <Field label="대표연락처"><input defaultValue="010-1234-5678" /></Field>
                <Field label="추가연락처"><input placeholder="선택 입력" /></Field>
                <Field label="메일주소"><input defaultValue="hong@example.com" /></Field>
                <Field label="지역"><input defaultValue="서울 강서구" /></Field>
                <Field label="주소" full><input placeholder="상세주소 입력" /></Field>
              </div>
            </div>

            <div className="section-title" style={{ marginTop: 22 }}>추가정보</div>
            <div className="form-grid">
              <Field label="최종학교명"><input defaultValue="한국대학교" /></Field>
              <Field label="최종학력"><select><option>대졸</option><option>전문대졸</option><option>고졸</option></select></Field>
              <Field label="졸업구분"><select><option>졸업</option><option>졸업예정</option><option>중퇴</option></select></Field>
              <Field label="지원경로"><input defaultValue="고용24" /></Field>
              <Field label="접수방법">
                <select>{['방문', '인터넷', '모바일', '전화', '팩스'].map((o) => <option key={o}>{o}</option>)}</select>
              </Field>
              <Field label="남기실 말씀"><textarea defaultValue="과정 상담 후 등록을 희망합니다." /></Field>
            </div>

            <div className="section-title" style={{ marginTop: 22 }}>국민취업지원제도</div>
            <div className="form-grid">
              <Field label="참여여부">
                <div className="inline">
                  <label><input type="radio" name="support" /> 유형</label>
                  <label><input type="radio" name="support" /> II유형</label>
                  <label><input type="radio" name="support" defaultChecked /> 미참여</label>
                </div>
              </Field>
              <Field label="참여센터"><input placeholder="참여센터" /></Field>
              <Field label="담당자"><input placeholder="담당자" /></Field>
              <Field label="연락처"><input placeholder="연락처" /></Field>
            </div>
          </section>

          {/* 훈련생선택 */}
          <section className={panel('trainee')}>
            <div className="section-title">훈련생(접수자) 선택</div>
            <div className="searchbar">
              <select><option>접수자명</option><option>연락처</option></select>
              <input placeholder="검색어 입력" value={traineeInput} onChange={(e) => setTraineeInput(e.target.value)} />
              <button className="btn btn-primary" onClick={() => setTraineeQuery(traineeInput.trim())}>검색</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>이름</th><th>생년월일</th><th>대표연락처</th><th>지역</th><th>신청이력</th><th>선택</th></tr>
                </thead>
                <tbody>
                  {TRAINEES.filter((t) => match(t, traineeQuery)).map((t) => (
                    <tr key={t.name}>
                      <td className="center" style={{ color: '#1f6feb', fontWeight: 800 }}>{t.name}</td>
                      <td className="center">{t.birth}</td>
                      <td className="center">{t.phone}</td>
                      <td className="center">{t.region || '-'}</td>
                      <td>
                        <div className="history">
                          <span className="pass">[합격]</span> <span className="ongoing">[진행중]</span>{' '}
                          {t.history.replace('[합격] [진행중] ', '')}
                        </div>
                      </td>
                      <td className="center">
                        <div className="select-cell">
                          <select><option>접수방법</option><option>방문</option><option>전화</option><option>인터넷</option></select>
                          <button className="btn btn-small" onClick={() => selectPerson(t.name)}>선택</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 회원선택 */}
          <section className={panel('member')}>
            <div className="section-title">회원선택</div>
            <div className="searchbar">
              <select><option>통합검색</option><option>이름</option><option>연락처</option></select>
              <input placeholder="회원 검색" value={memberInput} onChange={(e) => setMemberInput(e.target.value)} />
              <select><option>전체회원보기</option><option>교사</option><option>관리자</option></select>
              <button className="btn btn-primary" onClick={() => setMemberQuery(memberInput.trim())}>검색</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>레벨</th><th>이름</th><th>생년월일</th><th>대표연락처</th><th>지역</th><th>선택</th></tr>
                </thead>
                <tbody>
                  {MEMBERS.filter((m) => match(m, memberQuery)).map((m) => (
                    <tr key={m.name}>
                      <td className="center">{m.level}</td>
                      <td className="center" style={{ color: '#1f6feb', fontWeight: 800 }}>{m.name}</td>
                      <td className="center">{m.birth}</td>
                      <td className="center">{m.phone}</td>
                      <td className="center">{m.region || '-'}</td>
                      <td className="center"><button className="btn btn-small" onClick={() => selectPerson(m.name)}>선택</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CSV */}
          <section className={panel('csv')}>
            <div className="section-title">CSV 일괄등록</div>
            <div className="csv-box">
              <strong>CSV 파일을 이용하여 접수자를 일괄 등록합니다.</strong>
              <p>먼저 샘플 CSV를 내려받아 형식에 맞게 작성한 후 업로드하세요.</p>
              <button className="btn" onClick={() => alert('샘플 CSV 다운로드 영역입니다.')}>샘플 CSV파일 다운로드</button>
              <div style={{ marginTop: 18 }}>
                <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0] || null)} />
              </div>
              <div style={{ marginTop: 14 }}>
                <button className="btn btn-primary" onClick={saveCsv}>CSV 등록</button>
              </div>
            </div>
          </section>

          <div className="bottom">
            <div className="note">선택한 탭에 따라 등록 방식이 달라집니다.</div>
            <div className="inline">
              <button className="btn" onClick={() => navigate(-1)}>취소</button>
              <button className="btn btn-primary" onClick={saveCurrent}>확인</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
