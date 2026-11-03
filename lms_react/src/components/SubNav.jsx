import { useNavigate } from 'react-router-dom';

const ITEMS = [
  ['NCS 평가항목 목록', '/ncs-list'],
  ['NCS 평가항목 등록', '/ncs-registration'],
  ['평가목록', '/ncs-management'],
  ['NCS 평가등록', '/ncs-exam-registration'],
  ['사전평가결과'],
  ['요소별 평가결과'],
  ['능력단위 평가결과'],
];

/** NCS 평가 관련 화면 공통 서브 메뉴. 아직 화면이 없는 항목은 알림만 띄웁니다. */
export default function SubNav({ active = -1 }) {
  const navigate = useNavigate();
  return (
    <div className="subnav">
      {ITEMS.map(([label, to], i) => (
        <button
          key={label}
          className={'btn btn-small' + (i === active ? ' active' : '')}
          onClick={() => (to ? navigate(to) : alert(`${label} 화면으로 이동`))}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
