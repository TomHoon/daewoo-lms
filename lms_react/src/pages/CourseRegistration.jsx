import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import api from "../api/axios";
import "./CourseRegistration.css";

const STORAGE_KEY = "course_registration_v1";

const INITIAL = {
  jobCategory: "",
  courseCategory: "",
  courseStatus: "모집중",
  campus: "",
  batchNo: "1",
  batchName: "1기",
  createdBy: "",
  representativeFileId: "",
  instructorIds: "",
  trainingCode: "",
  courseName: "",
  courseGroup: "",
  courseColor: "#000000",
  recruitType: "기간확정",
  startDate: "",
  endDate: "",
  tuition: "0",
  tuitionVisible: "숨깁니다.",
  supportAmount: "0",
  selfPayment: "",
  allowanceType: "매달지급",
  allowanceAmount: "0",
  allowanceDesc: "",
  startTime: "09:00",
  endTime: "18:00",
  dailyHours: "8",
  capacity: "20",
  classDays: "0",
  location: "",
  homeroomTeacher: "",
  hrdLink: "",
  extraLabel1: "",
  extraValue1: "",
  extraLabel2: "",
  extraValue2: "",
};

const DAYS = [
  ["월", true, ""],
  ["화", true, ""],
  ["수", true, ""],
  ["목", true, ""],
  ["금", true, ""],
  ["토", false, "sat"],
  ["일", false, "sun"],
];

const TOOL = {
  bold: <b>B</b>,
  italic: <i>I</i>,
  underline: <u>U</u>,
  insertUnorderedList: "• 목록",
  insertOrderedList: "1. 목록",
  justifyLeft: "좌",
  justifyCenter: "중",
};
const EDITORS = [
  [
    "introEditor",
    "과정소개",
    ["bold", "italic", "underline", "insertUnorderedList", "justifyLeft", "justifyCenter"],
  ],
  ["qualificationEditor", "지원자격", ["bold", "italic", "insertUnorderedList"]],
  ["feeEditor", "교육비 / 환급금액", ["bold", "insertUnorderedList"]],
  ["contentEditor", "교육내용", ["bold", "italic", "insertOrderedList"]],
  ["careerEditor", "수료 후 진로", ["bold", "insertUnorderedList"]],
  ["certificateEditor", "관련자격증", ["bold", "insertUnorderedList"]],
];

function Select({options, ...props}) {
  return (
    <select {...props}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

export default function CourseRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [showBasicInfo, setShowBasicInfo] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [weekdays, setWeekdays] = useState(DAYS.map((d) => d[1]));
  const [image, setImage] = useState("");
  const editorRefs = useRef({});
  const nameRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const [jobResponse, categoryResponse] = await Promise.all([
          api.get("/v1/trainingJobCategories", {signal: controller.signal}),
          api.get("/v1/educationCategories", {signal: controller.signal}),
        ]);
        if (controller.signal.aborted) return;
        if (!Array.isArray(jobResponse.data) || !Array.isArray(categoryResponse.data)) {
          throw new Error("분류 목록 응답이 배열이 아닙니다.");
        }
        setJobs(jobResponse.data);
        setCategories(categoryResponse.data);
      } catch {
        if (!controller.signal.aborted)
          setCategoryError("분류 목록을 불러오지 못했습니다. 새로고침해 주세요.");
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const f = (name) => ({
    value: form[name],
    onChange: (e) => setForm((s) => ({...s, [name]: e.target.value})),
  });

  const onImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveDraft = () => {
    const editors = {};
    EDITORS.forEach(([id]) => (editors[id] = editorRefs.current[id]?.innerHTML ?? ""));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({...form, showBasicInfo, weekdays, editors}));
    alert("임시저장했습니다.");
  };

  const loadDraft = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return alert("저장된 임시저장이 없습니다.");
    const data = JSON.parse(raw);
    const next = {...INITIAL};
    Object.keys(INITIAL).forEach((k) => {
      if (data[k] !== undefined) next[k] = data[k];
    });
    setForm(next);
    if (typeof data.showBasicInfo === "boolean") setShowBasicInfo(data.showBasicInfo);
    if (Array.isArray(data.weekdays) && data.weekdays.length === 7)
      setWeekdays(data.weekdays.map(Boolean));
    Object.entries(data.editors || {}).forEach(([id, html]) => {
      if (editorRefs.current[id]) editorRefs.current[id].innerHTML = html;
    });
  };

  const submitCourse = async () => {
    if (submitLock.current) return;
    if (!form.courseName.trim()) {
      alert("과정명을 입력하세요.");
      nameRef.current?.focus();
      return;
    }
    let payload;
    try {
      const number = (value, label, {id = false, integer = false} = {}) => {
        const result = Number(value);
        if (
          String(value).trim() === "" ||
          !Number.isFinite(result) ||
          result < 0 ||
          ((id || integer) && !Number.isSafeInteger(result)) ||
          (id && result <= 0)
        ) {
          throw new Error(`${label}에 올바른 숫자를 입력하세요.`);
        }
        return result;
      };
      const trainingJobCategoryId = number(form.jobCategory, "훈련직종분류", {id: true});
      const educationCategoryId = number(form.courseCategory, "교육과정분류", {id: true});
      if (
        !jobs.some((row) => row.trainingJobCategoryId === trainingJobCategoryId) ||
        !categories.some((row) => row.educationCategoryId === educationCategoryId)
      ) {
        throw new Error("분류를 다시 선택하세요.");
      }
      if (!form.startDate || !form.endDate || form.startDate > form.endDate) {
        throw new Error("교육 시작일과 종료일을 확인하세요.");
      }
      if (!form.startTime || !form.endTime || form.startTime >= form.endTime) {
        throw new Error("수업 시작시간과 종료시간을 확인하세요.");
      }
      const createdBy = number(form.createdBy, "등록자 ID", {id: true});
      const instructorIds = [
        ...new Set(
          form.instructorIds
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
            .map((id) => number(id, "강사 ID", {id: true})),
        ),
      ];
      const mainId = form.homeroomTeacher
        ? number(form.homeroomTeacher, "담임강사 ID", {id: true})
        : null;
      if (mainId && !instructorIds.includes(mainId)) instructorIds.push(mainId);
      if (instructorIds.length > 10) throw new Error("교사는 최대 10명까지 등록 가능합니다.");
      const html = (id) => editorRefs.current[id]?.innerHTML ?? "";
      // 예시에 없는 서버 코드는 확인 전까지 전송하지 않습니다.
      const status = {모집중: "RECRUITING"}[form.courseStatus];
      const recruitType = {기간확정: "FIXED"}[form.recruitType];
      const allowanceType = {매달지급: "MONTHLY"}[form.allowanceType];
      if (!status || !recruitType || !allowanceType) {
        throw new Error(
          "현재 서버 코드가 확인된 모집중 / 기간확정 / 매달지급으로 등록할 수 있습니다.",
        );
      }
      const extraInfos = [1, 2].flatMap((n) => {
        const itemName = form[`extraLabel${n}`].trim();
        const itemValue = form[`extraValue${n}`].trim();
        if (!itemName && !itemValue) return [];
        if (!itemName) throw new Error(`추가정보 ${n}의 항목명을 입력하세요.`);
        return [{itemName, itemValue, sortOrder: n}];
      });
      payload = {
        course: {
          trainingJobCategoryId,
          educationCategoryId,
          courseName: form.courseName.trim(),
          courseDivision: form.courseGroup,
          courseColor: form.courseColor,
          introduction: html("introEditor"),
          qualification: html("qualificationEditor"),
          tuitionRefundInfo: html("feeEditor"),
          curriculumContent: html("contentEditor"),
          createdBy,
        },
        batch: {
          batchNo: number(form.batchNo, "기수", {id: true}),
          batchName: form.batchName,
          campusId: number(form.campus, "캠퍼스 ID", {id: true}),
          trainingCode: form.trainingCode,
          status,
          recruitType,
          startDate: form.startDate,
          endDate: form.endDate,
          tuitionAmount: number(form.tuition, "수강료"),
          tuitionVisibleYn: form.tuitionVisible === "노출합니다." ? "Y" : "N",
          govSupportAmount: number(form.supportAmount, "정부지원금"),
          selfPaymentDesc: form.selfPayment,
          allowanceType,
          allowanceAmount: number(form.allowanceAmount, "훈련수당"),
          allowanceDesc: form.allowanceDesc,
          representativeFileId: form.representativeFileId
            ? number(form.representativeFileId, "대표파일 ID", {id: true})
            : null,
          classStartTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
          classEndTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
          dailyHours: number(form.dailyHours, "하루수업시간"),
          approvalCount: number(form.capacity, "승인인원", {integer: true}),
          trainingDays: number(form.classDays, "수업일수", {integer: true}),
          trainingPlace: form.location,
          hrdLink: form.hrdLink,
          createdBy,
        },
        days: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].filter((_, i) => weekdays[i]),
        instructors: instructorIds.map((instructorId) => ({
          instructorId,
          mainYn: instructorId === mainId ? "Y" : "N",
        })),
        extraInfos,
      };
    } catch (error) {
      alert(error.message);
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    try {
      await api.post("/v1/courses/create", payload);
      alert("과정이 등록되었습니다.");
    } catch {
      alert("과정 등록에 실패했습니다. 입력값을 확인하고 다시 시도해 주세요.");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="pg-course-registration">
      <div className="page">
        <PageHeader
          title="교육과정 등록"
          desc="과정의 기본정보, 수강료, 훈련수당, 수업정보 및 상세소개를 등록합니다."
          actionClass="header-actions"
        >
          <button className="btn" onClick={loadDraft}>
            임시저장 불러오기
          </button>
          <button className="btn" onClick={saveDraft}>
            임시저장
          </button>
          <button className="btn btn-primary" onClick={submitCourse} disabled={submitting}>
            {submitting ? "등록 중..." : "과정 등록"}
          </button>
        </PageHeader>

        <section className="card">
          <div className="card-head">
            <div className="section-title">기본정보</div>
            <label className="switch-line">
              <input
                type="checkbox"
                checked={showBasicInfo}
                onChange={(e) => setShowBasicInfo(e.target.checked)}
              />
              <span className="help" style={{color: "#d9534f", fontWeight: 700}}>
                기본설명을 모두 출력합니다.
              </span>
            </label>
          </div>
          <div className="card-body">
            <div className="grid-2">
              <div className="field">
                <div className="label">분류선택</div>
                <div className="control inline">
                  <select {...f("jobCategory")}>
                    <option value="">훈련직종선택</option>
                    {jobs.map((row) => (
                      <option key={row.trainingJobCategoryId} value={row.trainingJobCategoryId}>
                        {row.categoryName}
                      </option>
                    ))}
                  </select>
                  <select {...f("courseCategory")}>
                    <option value="">교육과정선택</option>
                    {categories.map((row) => (
                      <option key={row.educationCategoryId} value={row.educationCategoryId}>
                        {row.categoryName}
                      </option>
                    ))}
                  </select>
                  {categoryError && <span role="alert">{categoryError}</span>}
                </div>
              </div>
              <div className="field">
                <div className="label">상태</div>
                <div className="control inline">
                  <Select
                    {...f("courseStatus")}
                    options={["임시등록", "모집중", "모집마감", "진행중", "종료"]}
                  />
                  <span className="help">과정을 노출하지 않습니다.</span>
                </div>
              </div>
              <div className="field">
                <div className="label">캠퍼스 ID</div>
                <div className="control">
                  <input type="number" min="1" {...f("campus")} />
                </div>
              </div>
              <div className="field">
                <div className="label">훈련코드</div>
                <div className="control">
                  <input type="text" placeholder="훈련코드 입력" {...f("trainingCode")} />
                </div>
              </div>
              {[
                ["batchNo", "기수", "number"],
                ["batchName", "기수명", "text"],
                ["createdBy", "등록자 ID", "text"],
                ["representativeFileId", "대표파일 ID (선택)", "text"],
              ].map(([key, label, type]) => (
                <div className="field" key={key}>
                  <div className="label">{label}</div>
                  <div className="control">
                    <input type={type} {...f(key)} />
                  </div>
                </div>
              ))}
              <div className="field">
                <div className="label">과정명 / 구분</div>
                <div className="control inline">
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="과정명 입력"
                    style={{flex: 1}}
                    {...f("courseName")}
                  />
                  <span>/</span>
                  <input
                    type="text"
                    placeholder="구분 입력"
                    style={{maxWidth: 230}}
                    {...f("courseGroup")}
                  />
                </div>
              </div>
              <div className="field">
                <div className="label">과정명 색상</div>
                <div className="control color-preview">
                  <input
                    type="color"
                    style={{width: 52, height: 38, padding: 3}}
                    {...f("courseColor")}
                  />
                  <span>{form.courseColor.toUpperCase()}</span>
                  <span className="color-swatch" style={{background: form.courseColor}}></span>
                </div>
              </div>
              <div className="field">
                <div className="label">모집분류</div>
                <div className="control inline">
                  <Select {...f("recruitType")} options={["기간확정", "상시모집", "별도문의"]} />
                  <span className="help blue">기간이 확정된 과정입니다.</span>
                </div>
              </div>
              <div className="field">
                <div className="label">교육기간</div>
                <div className="control inline">
                  <input type="date" {...f("startDate")} />
                  <span>~</span>
                  <input type="date" {...f("endDate")} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">교육과정 수강료 정보</div>
          </div>
          <div className="card-body">
            <div className="grid-2">
              <div className="field">
                <div className="label">수강료</div>
                <div className="control money">
                  <input type="number" {...f("tuition")} />
                </div>
              </div>
              <div className="field">
                <div className="label">노출여부</div>
                <div className="control">
                  <Select {...f("tuitionVisible")} options={["숨깁니다.", "노출합니다."]} />
                </div>
              </div>
              <div className="field">
                <div className="label">정부지원금</div>
                <div className="control money">
                  <input type="number" {...f("supportAmount")} />
                </div>
              </div>
              <div className="field">
                <div className="label">본인부담금</div>
                <div className="control">
                  <textarea placeholder="본인부담금 설명 입력" {...f("selfPayment")} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">훈련수당 정보</div>
          </div>
          <div className="card-body">
            <div className="grid-2">
              <div className="field">
                <div className="label">지급타입</div>
                <div className="control inline">
                  <Select
                    {...f("allowanceType")}
                    options={["매달지급", "수료후지급", "지급안함"]}
                  />
                  <span className="help" style={{color: "#7c4dff"}}>
                    매달지급 합니다.
                  </span>
                </div>
              </div>
              <div className="field">
                <div className="label">훈련수당</div>
                <div className="control money">
                  <input type="number" {...f("allowanceAmount")} />
                </div>
              </div>
              <div className="field full">
                <div className="label">수강료 / 훈련수당 설명</div>
                <div className="control">
                  <textarea
                    placeholder="훈련수당 및 수강료 안내사항을 입력하세요."
                    {...f("allowanceDesc")}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="section-title">상세정보</div>
          </div>
          <div className="card-body">
            <div className="detail-layout">
              <div>
                <div className="image-box">
                  <img
                    alt="대표이미지 미리보기"
                    src={image || undefined}
                    style={{display: image ? "block" : "none"}}
                  />
                  <strong>대표이미지</strong>
                  <span>과정 대표이미지를 등록하세요.</span>
                </div>
                <div className="image-actions">
                  <label className="btn btn-primary" htmlFor="imageInput">
                    + 이미지 추가
                  </label>
                  <input id="imageInput" type="file" accept="image/*" hidden onChange={onImage} />
                  <button className="btn btn-danger" onClick={() => setImage("")}>
                    삭제
                  </button>
                </div>
              </div>

              <div>
                <div className="grid-2">
                  <div className="field">
                    <div className="label">수업시간</div>
                    <div className="control inline">
                      <input type="time" {...f("startTime")} />
                      <span>~</span>
                      <input type="time" {...f("endTime")} />
                    </div>
                  </div>
                  <div className="field">
                    <div className="label">하루수업시간</div>
                    <div className="control">
                      <input type="number" {...f("dailyHours")} />
                    </div>
                  </div>
                  <div className="field full">
                    <div className="label">수업요일</div>
                    <div className="control weekdays">
                      {DAYS.map(([day, , cls], i) => (
                        <label key={day} className={"day" + (cls ? " " + cls : "")}>
                          <input
                            type="checkbox"
                            checked={weekdays[i]}
                            onChange={(e) =>
                              setWeekdays((w) => w.map((v, k) => (k === i ? e.target.checked : v)))
                            }
                          />{" "}
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <div className="label">승인인원</div>
                    <div className="control inline">
                      <input type="number" {...f("capacity")} />
                      <span className="help">명</span>
                    </div>
                  </div>
                  <div className="field">
                    <div className="label">수업일수</div>
                    <div className="control inline">
                      <input type="number" {...f("classDays")} />
                      <span className="help">일</span>
                    </div>
                  </div>
                  <div className="field">
                    <div className="label">교육장소</div>
                    <div className="control">
                      <input type="text" placeholder="교육장소 입력" {...f("location")} />
                    </div>
                  </div>
                  <div className="field">
                    <div className="label">담임강사 ID (선택)</div>
                    <div className="control">
                      <input type="number" min="1" {...f("homeroomTeacher")} />
                    </div>
                  </div>
                  <div className="field full">
                    <div className="label">강사 ID 목록</div>
                    <div className="control inline">
                      <input
                        type="text"
                        placeholder="쉼표로 구분 (예: 1, 2)"
                        {...f("instructorIds")}
                      />
                      <span className="help" style={{color: "#d9534f"}}>
                        최대 10명까지 등록 가능합니다.
                      </span>
                    </div>
                  </div>
                  <div className="field full">
                    <div className="label">HRD 링크</div>
                    <div className="control">
                      <input
                        type="url"
                        placeholder="https://www.work24.go.kr/..."
                        {...f("hrdLink")}
                      />
                      <div className="help" style={{marginTop: 6}}>
                        HRD/고용24 과정 주소를 입력하면 과정신청 영역에서 연결할 수 있습니다.
                      </div>
                    </div>
                  </div>
                  {[1, 2].map((n) => (
                    <div key={n} style={{display: "contents"}}>
                      <div className="field">
                        <div className="label">추가정보 {n}</div>
                        <div className="control">
                          <input type="text" placeholder="항목명" {...f("extraLabel" + n)} />
                        </div>
                      </div>
                      <div className="field">
                        <div className="label">내용</div>
                        <div className="control">
                          <input type="text" placeholder="내용 입력" {...f("extraValue" + n)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {EDITORS.map(([id, title, tools]) => (
              <div className="rich-section" key={id}>
                <div className="rich-head">
                  <strong>{title}</strong>
                </div>
                <div className="toolbar">
                  {tools.map((cmd) => (
                    <button
                      key={cmd}
                      className="tool"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => document.execCommand(cmd, false, null)}
                    >
                      {TOOL[cmd]}
                    </button>
                  ))}
                </div>
                <div
                  className="editor"
                  ref={(el) => (editorRefs.current[id] = el)}
                  contentEditable
                  suppressContentEditableWarning
                ></div>
              </div>
            ))}
          </div>
        </section>

        <div className="sticky-actions">
          <button className="btn" onClick={() => navigate(-1)}>
            취소
          </button>
          <button className="btn" onClick={saveDraft}>
            임시저장
          </button>
          <button className="btn btn-primary" onClick={submitCourse} disabled={submitting}>
            {submitting ? "등록 중..." : "과정 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
