// public/boot-host.js
(async () => {
    try {
        let manifest = null;

        // 1) manifest 시도
        try {
            const res = await fetch('/assets/manifest.json', { cache: 'no-store' });
            if (res.ok) manifest = await res.json();
        } catch { /* ignore */ }

        let cssList = [];
        let jsList = [];

        if (manifest?.entrypoints?.main?.assets) {
            const ep = manifest.entrypoints.main.assets;
            cssList = Array.isArray(ep.css) ? ep.css : [];
            jsList = Array.isArray(ep.js) ? ep.js : [];
        } else {
            // 2) 폴백(dev용 무해시 파일명)
            cssList = ['/assets/main.css']; // 없으면 404 나도 무시됨
            jsList = ['/assets/main.js'];
        }

        // CSS
        for (const href of cssList) {
            const l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = href;
            document.head.appendChild(l);
        }

        // JS
        for (const src of jsList) {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = src;
                s.defer = true;
                s.onload = resolve;
                s.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(s);
            });
        }

        document.documentElement.classList.add('react-mounted');
    } catch (e) {
        console.error('Failed to boot host app:', e);
    }
})();
