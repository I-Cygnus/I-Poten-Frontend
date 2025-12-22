import { Fab } from '@mui/material';
import { useRecoilState } from 'recoil';
import { themeAtom } from '@jobspoon/app-state';

export default function ThemeToggleButton() {
    const [mode, setMode] = useRecoilState(themeAtom);

    return (
        <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 2147483647 }}>
            <Fab
                variant="extended"
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                aria-label="toggle theme"
            >
                {mode === 'dark' ? 'Light' : 'Dark'}
            </Fab>
        </div>
    );
}
