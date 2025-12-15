// host: ThemeSync.tsx
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { themeAtom } from '@jobspoon/app-state';
import { setTheme, onThemeChange } from '@jobspoon/theme-bridge';

export default function ThemeSync() {
  const [mode, setMode] = useRecoilState(themeAtom);

  // ✅ Host(Recoil) -> Bridge(+DOM) 단방향
  useEffect(() => { setTheme(mode); }, [mode]);

  // ✅ 외부(다른 리모트/다른 탭)가 브리지를 갱신하면 Recoil만 따라감
  useEffect(() => onThemeChange((t) => {
    setMode((prev) => (prev === t ? prev : t)); // 루프 방지
  }), [setMode]);

  return null;
}
