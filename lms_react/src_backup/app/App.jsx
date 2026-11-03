import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import { routes } from './routes.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {routes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
