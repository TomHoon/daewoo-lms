import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './EntryPopup.css';

const TABS = [
  ['visitor', '방문지원자입력'],
  ['trainee', '훈련생(접수자)선택'],
  ['member', '회원선택'],
  ['csv', 'CSV등록'],
];

const TRAINEES = [];
const MEMBERS = [];

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
  const [jobs, setJobs] = useState([]);
  const [educationCategories, setEducationCategories] = useState([]);
  const [trainingJobCategoryId, setTrainingJobCategoryId] = useState('');
  const [educationCategoryId, setEducationCategoryId] = useState('');
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');
  const [applicant, setApplicant] = useState({
    applicantName: '', birthDate: '', gender: '', nationalityType: '', phone: '', email: '', receptionMethod: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const applicantField = (name) => ({
    value: applicant[name],
    onChange: (e) => setApplicant((current) => ({...current, [name]: e.target.value})),
  });
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [categoryErrors, setCategoryErrors] = useState({});
  const [courseError, setCourseError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const loadCategory = async (path, setter, key, label) => {
      try {
        const {data} = await api.get(path, {signal: controller.signal});
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error('분류 응답이 배열이 아닙니다.');
        setter(data);
      } catch {
        if (!controller.signal.aborted) {
          setCategoryErrors((errors) => ({...errors, [key]: `${label} 목록을 불러오지 못했습니다.`}));
        }
      }
    };
    void Promise.all([
      loadCategory('/v1/trainingJobCategories', setJobs, 'jobs', '훈련직종분류'),
      loadCategory('/v1/educationCategories', setEducationCategories, 'education', '교육과정분류'),
    ]).then(() => {
      if (!controller.signal.aborted) setCategoryLoading(false);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!trainingJobCategoryId || !educationCategoryId) return;
    const controller = new AbortController();
    const loadCourses = async () => {
      try {
        const {data} = await api.get('/v1/courses', {
          params: {trainingJobCategoryId, educationCategoryId},
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error('과정 응답이 배열이 아닙니다.');
        setCourses(data);
      } catch {
        if (!controller.signal.aborted) setCourseError('과정 목록을 불러오지 못했습니다.');
      } finally {
        if (!controller.signal.aborted) setCourseLoading(false);
      }
    };
    void loadCourses();
    return () => controller.abort();
  }, [trainingJobCategoryId, educationCategoryId]);

  useEffect(() => {
    if (!courseId) return;
    const controller = new AbortController();
    const loadBatches = async () => {
      try {
        const {data} = await api.get(`/v1/courses/${encodeURIComponent(courseId)}/batches`, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error('기수 응답이 배열이 아닙니다.');
        setBatches(data);
      } catch {
        if (!controller.signal.aborted) setBatchError('기수 목록을 불러오지 못했습니다.');
      } finally {
        if (!controller.signal.aborted) setBatchLoading(false);
      }
    };
    void loadBatches();
    return () => controller.abort();
  }, [courseId]);

  const changeCategory = (setter, otherId) => (e) => {
    setter(e.target.value);
    setCourses([]);
    setCourseId('');
    setBatchId('');
    setBatches([]);
    setBatchLoading(false);
    setBatchError('');
    setCourseError('');
    setCourseLoading(Boolean(e.target.value && otherId));
  };

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
  const saveCurrent = async () => {
    if (submitLock.current) return;
    if (tab !== 'visitor') return alert('현재 방문지원자 입력 방식으로 등록할 수 있습니다.');
    if (!courseId || !courses.some((course) => String(course.courseId) === courseId)) {
      return alert('과정을 선택하세요.');
    }
    if (batchLoading || !batchId || !batches.some((batch) => String(batch.batchId) === batchId)) {
      return alert('기수를 선택하세요.');
    }
    if (!applicant.applicantName.trim()) return alert('이름을 입력하세요.');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (!applicant.birthDate || applicant.birthDate > today) {
      return alert('생년월일을 확인하세요.');
    }
    if (!applicant.gender) return alert('성별을 선택하세요.');
    if (!applicant.nationalityType) return alert('내/외국인을 선택하세요.');
    const phone = applicant.phone.replace(/[\s()-]/g, '');
    if (!/^\d{9,11}$/.test(phone)) return alert('대표연락처를 확인하세요.');
    if (applicant.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicant.email.trim())) {
      return alert('메일주소를 확인하세요.');
    }
    if (!applicant.receptionMethod) return alert('접수방법을 선택하세요.');
    const payload = {
      inputType: 'VISITOR',
      ...applicant,
      applicantName: applicant.applicantName.trim(),
      phone,
      email: applicant.email.trim(),
    };
    submitLock.current = true;
    setSubmitting(true);
    try {
      await api.post(`/v1/admissions/${encodeURIComponent(courseId)}/${encodeURIComponent(batchId)}`, payload);
      alert('입학접수가 등록되었습니다.');
      navigate(-1);
    } catch {
      alert('입학접수 등록에 실패했습니다. 입력값을 확인하고 다시 시도해 주세요.');
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
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
                  <select value={trainingJobCategoryId} onChange={changeCategory(setTrainingJobCategoryId, educationCategoryId)} disabled={categoryLoading}>
                    <option value="">{categoryLoading ? '불러오는 중...' : '훈련직종분류 선택'}</option>
                    {jobs.map((row) => <option key={row.trainingJobCategoryId} value={row.trainingJobCategoryId}>{row.categoryName}</option>)}
                  </select>
                  {categoryErrors.jobs && <span role="alert">{categoryErrors.jobs}</span>}
                </Field>
                <Field label="교육과정분류">
                  <select value={educationCategoryId} onChange={changeCategory(setEducationCategoryId, trainingJobCategoryId)} disabled={categoryLoading}>
                    <option value="">{categoryLoading ? '불러오는 중...' : '교육과정분류 선택'}</option>
                    {educationCategories.map((row) => <option key={row.educationCategoryId} value={row.educationCategoryId}>{row.categoryName}</option>)}
                  </select>
                  {categoryErrors.education && <span role="alert">{categoryErrors.education}</span>}
                </Field>
                <Field label="과정명" full>
                  <select value={courseId} onChange={(e) => {
                    setCourseId(e.target.value);
                    setBatchId('');
                    setBatches([]);
                    setBatchError('');
                    setBatchLoading(Boolean(e.target.value));
                  }} disabled={!trainingJobCategoryId || !educationCategoryId || courseLoading}>
                    <option value="">{courseLoading ? '불러오는 중...' : !trainingJobCategoryId || !educationCategoryId ? '분류를 먼저 선택하세요.' : courseError ? '과정 조회 실패' : courses.length ? '과정 선택' : '조회된 과정이 없습니다.'}</option>
                    {courses.map((row) => <option key={row.courseId} value={row.courseId}>{row.courseName}</option>)}
                  </select>
                  {courseError && <span role="alert">{courseError}</span>}
                </Field>
                <Field label="기수">
                  <select value={batchId} disabled={!courseId || batchLoading} onChange={(e) => setBatchId(e.target.value)}>
                    <option value="">{batchLoading ? '불러오는 중...' : !courseId ? '과정을 먼저 선택하세요.' : batchError ? '기수 조회 실패' : batches.length ? '기수 선택' : '조회된 기수가 없습니다.'}</option>
                    {batches.map((batch) => (
                      <option key={batch.batchId} value={batch.batchId}>
                        {batch.batchName || `${batch.batchNo ?? batch.batchId}기`}
                      </option>
                    ))}
                  </select>
                  {batchError && <span role="alert">{batchError}</span>}
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
                <Field label="이름"><input {...applicantField('applicantName')} /></Field>
                <Field label="생년월일"><input type="date" {...applicantField('birthDate')} /></Field>
                <Field label="성별">
                  <div className="inline">
                    <label><input type="radio" name="gender" value="M" checked={applicant.gender === 'M'} onChange={applicantField('gender').onChange} /> 남성</label>
                    <label><input type="radio" name="gender" value="F" checked={applicant.gender === 'F'} onChange={applicantField('gender').onChange} /> 여성</label>
                  </div>
                </Field>
                <Field label="내/외국인">
                  <div className="inline">
                    <label><input type="radio" name="national" value="DOMESTIC" checked={applicant.nationalityType === 'DOMESTIC'} onChange={applicantField('nationalityType').onChange} /> 내국인</label>
                    <label><input type="radio" name="national" value="FOREIGN" checked={applicant.nationalityType === 'FOREIGN'} onChange={applicantField('nationalityType').onChange} /> 외국인</label>
                  </div>
                </Field>
                <Field label="대표연락처"><input type="tel" {...applicantField('phone')} /></Field>
                <Field label="추가연락처"><input placeholder="선택 입력" /></Field>
                <Field label="메일주소"><input type="email" {...applicantField('email')} /></Field>
                <Field label="지역"><input /></Field>
                <Field label="주소" full><input placeholder="상세주소 입력" /></Field>
              </div>
            </div>

            <div className="section-title" style={{ marginTop: 22 }}>추가정보</div>
            <div className="form-grid">
              <Field label="최종학교명"><input /></Field>
              <Field label="최종학력"><select defaultValue=""><option value="">학력 선택</option><option>대졸</option><option>전문대졸</option><option>고졸</option></select></Field>
              <Field label="졸업구분"><select defaultValue=""><option value="">졸업구분 선택</option><option>졸업</option><option>졸업예정</option><option>중퇴</option></select></Field>
              <Field label="지원경로"><input /></Field>
              <Field label="접수방법">
                <select {...applicantField('receptionMethod')}>
                  <option value="">접수방법 선택</option>
                  {[['VISIT', '방문'], ['INTERNET', '인터넷'], ['MOBILE', '모바일'], ['PHONE', '전화'], ['FAX', '팩스']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Field>
              <Field label="남기실 말씀"><textarea /></Field>
            </div>

            <div className="section-title" style={{ marginTop: 22 }}>국민취업지원제도</div>
            <div className="form-grid">
              <Field label="참여여부">
                <div className="inline">
                  <label><input type="radio" name="support" /> 유형</label>
                  <label><input type="radio" name="support" /> II유형</label>
                  <label><input type="radio" name="support" /> 미참여</label>
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
                  {TRAINEES.filter((t) => match(t, traineeQuery)).length === 0 && (
                    <tr><td colSpan={6} className="center">훈련생(접수자) 내역이 없습니다.</td></tr>
                  )}
                  {TRAINEES.filter((t) => match(t, traineeQuery)).map((t) => (
                    <tr key={t.name}>
                      <td className="center" style={{ color: '#1f6feb', fontWeight: 800 }}>{t.name}</td>
                      <td className="center">{t.birth}</td>
                      <td className="center">{t.phone}</td>
                      <td className="center">{t.region || '-'}</td>
                      <td>
                        <div className="history">
                          {t.history || '-'}
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
                  {MEMBERS.filter((m) => match(m, memberQuery)).length === 0 && (
                    <tr><td colSpan={6} className="center">회원 내역이 없습니다.</td></tr>
                  )}
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
              <button className="btn btn-primary" onClick={saveCurrent} disabled={submitting}>{submitting ? '등록 중...' : '확인'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
