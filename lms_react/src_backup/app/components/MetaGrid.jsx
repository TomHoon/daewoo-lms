/** items: [라벨, 필드명, input type(선택)] */
export default function MetaGrid({ items, draft }) {
  return (
    <div className="meta-grid">
      {items.map(([label, name, type]) => (
        <div className="meta-item" key={name}>
          <div className="meta-label">{label}</div>
          <input className="meta-input" type={type} {...draft.field(name)} />
        </div>
      ))}
    </div>
  );
}
