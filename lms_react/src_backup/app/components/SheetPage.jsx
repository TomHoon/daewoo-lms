import ApprovalTable from './ApprovalTable.jsx';

/**
 * 결재란 + 임시저장 툴바가 있는 서식형 페이지(훈련일지, 상담일지, 채점기준표 등)의 공통 틀.
 * pg          : 페이지 CSS 스코프 클래스 (예: "pg-train-diary")
 * meta        : <MetaGrid /> 등 헤더 하단 영역
 * toolbarLeft : 인쇄/초기화 사이에 끼워 넣을 추가 버튼
 */
export default function SheetPage({ pg, title, sub, footer, draft, meta, toolbarLeft, children }) {
  return (
    <div className={pg}>
      <div className="page">
        <div className="toolbar">
          <div className="group">
            <button className="btn" onClick={() => window.print()}>인쇄</button>
            {toolbarLeft}
            <button className="btn" onClick={draft.reset}>초기화</button>
          </div>
          <div className="group">
            <button className="btn" onClick={draft.load}>임시저장 불러오기</button>
            <button className="btn btn-primary" onClick={draft.save}>임시저장</button>
          </div>
        </div>
        <main className="sheet">
          <header className="sheet-header">
            <div className="header-top">
              <div className="title-box">
                <h1>{title}</h1>
                <div className="sub">{sub}</div>
              </div>
              <ApprovalTable onApprove={draft.markDirty} />
            </div>
            {meta}
          </header>

          {children}

          <div className="footer-status">
            <div className="save-state">
              <span className={'dot' + (draft.saved ? ' saved' : '')}></span>
              <span>{draft.saved ? '임시저장 완료' : '저장되지 않은 변경사항이 있습니다.'}</span>
            </div>
            <div style={{ fontSize: 12, color: '#8a94a3' }}>대우능력개발원 LMS · {footer}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
