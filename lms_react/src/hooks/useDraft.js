import { useState } from 'react';

/**
 * 임시저장(localStorage)이 있는 서식형 페이지 공통 훅.
 * - data      : 폼 전체 상태 (rows 같은 배열 포함)
 * - field(n)  : <input {...field('name')} /> 형태로 쓰는 제어 컴포넌트 바인딩
 * - rows(...) : 표(행) 추가/복사/삭제/수정 도우미
 */
export default function useDraft(storageKey, initial) {
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(false);

  const set = (patch) => {
    setData((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) }));
    setSaved(false);
  };

  const field = (name) => ({
    value: data[name] ?? '',
    onChange: (e) => set({ [name]: e.target.value }),
  });

  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify(data));
    setSaved(true);
  };

  const load = () => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      alert('저장된 임시저장이 없습니다.');
      return;
    }
    setData({ ...initial, ...JSON.parse(raw) });
    setSaved(true);
  };

  const reset = () => {
    if (!confirm('입력한 내용을 초기화하시겠습니까?')) return;
    localStorage.removeItem(storageKey);
    setData(initial);
    setSaved(false);
  };

  const markDirty = () => setSaved(false);

  /** 배열 필드(key)용 행 조작 모음 */
  const rows = (key, emptyRow, minMessage) => ({
    list: data[key],
    update: (i, patch) =>
      set((d) => ({ [key]: d[key].map((r, j) => (j === i ? { ...r, ...patch } : r)) })),
    add: () => set((d) => ({ [key]: [...d[key], { ...emptyRow }] })),
    duplicate: (i) => set((d) => ({ [key]: [...d[key], { ...d[key][i] }] })),
    copyLast: () =>
      set((d) =>
        d[key].length
          ? { [key]: [...d[key], { ...d[key][d[key].length - 1] }] }
          : { [key]: [{ ...emptyRow }] }
      ),
    remove: (i) => {
      if (data[key].length <= 1) {
        alert(minMessage);
        return;
      }
      set((d) => ({ [key]: d[key].filter((_, j) => j !== i) }));
    },
  });

  return { data, set, field, saved, save, load, reset, markDirty, rows };
}
