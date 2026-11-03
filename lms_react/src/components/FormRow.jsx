export default function FormRow({ label, children }) {
  return (
    <div className="form-row">
      <div className="form-label">{label}</div>
      <div className="form-control">{children}</div>
    </div>
  );
}
