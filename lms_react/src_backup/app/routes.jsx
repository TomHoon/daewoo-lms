import AdmissionApplicationList from './pages/AdmissionApplicationList.jsx';
import AdmissionStatus from './pages/AdmissionStatus.jsx';
import AssessmentPlan from './pages/AssessmentPlan.jsx';
import AssessmentResultSummary from './pages/AssessmentResultSummary.jsx';
import CounselingDiary from './pages/CounselingDiary.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import CourseList from './pages/CourseList.jsx';
import CourseManagement from './pages/CourseManagement.jsx';
import CourseRegistration from './pages/CourseRegistration.jsx';
import EduDiary from './pages/EduDiary.jsx';
import EntryPopup from './pages/EntryPopup.jsx';
import ExamStudent from './pages/ExamStudent.jsx';
import ExamTeacher from './pages/ExamTeacher.jsx';
import NcsExamRegistration from './pages/NcsExamRegistration.jsx';
import NcsExamSheetRegistration from './pages/NcsExamSheetRegistration.jsx';
import NcsList from './pages/NcsList.jsx';
import NcsManagement from './pages/NcsManagement.jsx';
import NcsRegistration from './pages/NcsRegistration.jsx';
import QuestionSheet from './pages/QuestionSheet.jsx';
import ScenarioStudent from './pages/ScenarioStudent.jsx';
import ScenarioTeacher from './pages/ScenarioTeacher.jsx';
import ScoringRubric from './pages/ScoringRubric.jsx';
import SolvingCreateTeacher from './pages/SolvingCreateTeacher.jsx';
import Survey from './pages/Survey.jsx';
import SurveyList from './pages/SurveyList.jsx';
import SurveyRegistration from './pages/SurveyRegistration.jsx';
import SurveyResponsePopup from './pages/SurveyResponsePopup.jsx';
import TrainDiary from './pages/TrainDiary.jsx';

// 그룹 / 경로 / 화면 이름 / 컴포넌트
export const routes = [
  { group: '과정 · 입학', path: '/course-list', title: '과정목록', element: <CourseList /> },
  { group: '과정 · 입학', path: '/course-registration', title: '교육과정 등록', element: <CourseRegistration /> },
  { group: '과정 · 입학', path: '/course-management', title: '과정분류 관리', element: <CourseManagement /> },
  { group: '과정 · 입학', path: '/course-detail', title: '과정 상세', element: <CourseDetail /> },
  { group: '과정 · 입학', path: '/admission-status', title: '입학접수현황', element: <AdmissionStatus /> },
  { group: '과정 · 입학', path: '/admission-application-list', title: '입학접수목록', element: <AdmissionApplicationList /> },
  { group: '과정 · 입학', path: '/entry-popup', title: '입학접수 간편입력', element: <EntryPopup /> },

  { group: 'NCS 평가', path: '/ncs-list', title: 'NCS 평가항목 목록', element: <NcsList /> },
  { group: 'NCS 평가', path: '/ncs-registration', title: 'NCS 평가항목 등록', element: <NcsRegistration /> },
  { group: 'NCS 평가', path: '/ncs-management', title: 'NCS 평가 관리', element: <NcsManagement /> },
  { group: 'NCS 평가', path: '/ncs-exam-registration', title: 'NCS 평가 등록', element: <NcsExamRegistration /> },
  { group: 'NCS 평가', path: '/ncs-exam-sheet-registration', title: 'NCS 평가지 등록', element: <NcsExamSheetRegistration /> },
  { group: 'NCS 평가', path: '/exam-teacher', title: '서술형 시험지 생성 (교사)', element: <ExamTeacher /> },
  { group: 'NCS 평가', path: '/exam-student', title: '서술형 평가 (학생)', element: <ExamStudent /> },
  { group: 'NCS 평가', path: '/solving-create-teacher', title: '문제해결시나리오 평가도구 생성 (교사)', element: <SolvingCreateTeacher /> },
  { group: 'NCS 평가', path: '/scenario-student', title: '문제해결시나리오 제출 (학생)', element: <ScenarioStudent /> },
  { group: 'NCS 평가', path: '/scenario-teacher', title: '문제해결시나리오 채점 (교사)', element: <ScenarioTeacher /> },

  { group: '서식 · 일지', path: '/train-diary', title: '훈련일지', element: <TrainDiary /> },
  { group: '서식 · 일지', path: '/edu-diary', title: '교육훈련일지', element: <EduDiary /> },
  { group: '서식 · 일지', path: '/counseling-diary', title: '상담일지', element: <CounselingDiary /> },
  { group: '서식 · 일지', path: '/assessment-plan', title: '평가계획서', element: <AssessmentPlan /> },
  { group: '서식 · 일지', path: '/assessment-result-summary', title: '평가결과 집계표', element: <AssessmentResultSummary /> },
  { group: '서식 · 일지', path: '/scoring-rubric', title: '채점기준표', element: <ScoringRubric /> },
  { group: '서식 · 일지', path: '/question-sheet', title: '문제지', element: <QuestionSheet /> },
  { group: '서식 · 일지', path: '/survey', title: '경로조사', element: <Survey /> },

  { group: '설문조사', path: '/survey-list', title: '설문조사 목록', element: <SurveyList /> },
  { group: '설문조사', path: '/survey-registration', title: '설문조사 등록', element: <SurveyRegistration /> },
  { group: '설문조사', path: '/survey-response-popup', title: '설문조사 응답', element: <SurveyResponsePopup /> },
];
