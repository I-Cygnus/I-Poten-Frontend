import { atom } from 'recoil';
export type ThemeMode = 'light' | 'dark';

export const themeAtom = atom<ThemeMode>({
    key: 'theme',
    default:
        (typeof window !== 'undefined' &&
            (localStorage.getItem('theme') as ThemeMode)) || 'light',
});
