import { useState } from 'react';

export default function ApprovalTable({ onApprove }) {
  const [approved, setApproved] = useState(false);
  return (
    <div className="approval-wrap">
      <table className="approval-table">
        <thead>
          <tr>
            <th>담당</th>
            <th>팀장</th>
            <th>본부장</th>
            <th>원장</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="stamp">승인<br />담당</div>
            </td>
            <td>
              <div className="approval-state">대기</div>
            </td>
            <td>
              <div className="approval-state">대기</div>
            </td>
            <td>
              {approved ? (
                <div className="stamp">승인<br />원장</div>
              ) : (
                <button
                  className="approve-btn"
                  onClick={() => {
                    setApproved(true);
                    onApprove?.();
                  }}
                >
                  결재
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
