import { Link } from 'react-router-dom';
import { routes } from '../routes.jsx';
import './Home.css';

export default function Home() {
  const groups = [...new Set(routes.map((r) => r.group))];
  return (
    <div className="pg-home">
      <h1>LMS 관리자 화면 목록</h1>
      <p>HTML에서 React로 전환된 {routes.length}개 화면입니다.</p>
      {groups.map((g) => (
        <section key={g}>
          <h2>{g}</h2>
          <ul>
            {routes.filter((r) => r.group === g).map((r) => (
              <li key={r.path}><Link to={r.path}>{r.title}</Link></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
