export default function PageHeader({ title, desc, actionClass, children }) {
  return (
    <header className="page-header">
      <div className="page-title">
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {children && <div className={actionClass}>{children}</div>}
    </header>
  );
}
