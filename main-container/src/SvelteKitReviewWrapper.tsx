// SvelteKitReviewWrapper.tsx
import React, { useLayoutEffect, useEffect, useRef } from "react";
import { getTheme, onThemeChange } from "@jobspoon/theme-bridge";

type Mode = "light" | "dark";

const readInitialTheme = (): Mode => {
    // 1) Host가 이미 찍어둔 html의 data-theme를 최우선
    const fromHtml = document.documentElement.getAttribute("data-theme");
    if (fromHtml === "light" || fromHtml === "dark") return fromHtml;

    // 2) bridge 값
    try {
        const t = getTheme();
        if (t === "light" || t === "dark") return t;
    } catch { }

    // 3) OS 선호(폴백)
    if (window.matchMedia?.("(prefers-color-scheme: light)")?.matches) return "light";
    return "dark";
};

const SvelteKitReviewAppWrapper: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const initialTheme = readInitialTheme();

    // ⚡ 첫 페인트 전에 theme 동기화(깜빡임/역전 방지)
    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const apply = (t: Mode) => {
            // 컨테이너(리모트 내부 CSS 변수용)
            el.setAttribute("data-theme", t);
            (el.style as any).colorScheme = t;

            // html(전역 선택자/미디어쿼리 가드용) — 덮어쓰지 않으면 미전파됨
            document.documentElement.setAttribute("data-theme", t);
            (document.documentElement.style as any).colorScheme = t;
        };

        // 초기 즉시 반영
        apply(initialTheme);

        // 이후 host에서 방송하는 변경 구독
        const off = onThemeChange(apply);
        return off;
        // initialTheme를 deps에 넣지 말 것(초기화 1회)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 리모트 마운트(네 코드 그대로)
    useEffect(() => {
        if (!containerRef.current) return;
        let cleanup: (() => void) | undefined;

        (async () => {
            try {
                // 1) Svelte 5 mount 우선
                const mod1 = await import("svelteKitReviewApp/mount").catch(() => null);
                if (mod1 && typeof (mod1 as any).mount === "function") {
                    const handle: any = (mod1 as any).mount(containerRef.current!, {
                        storageKey: "review-widget:v1",
                    });
                    cleanup =
                        typeof handle === "function" ? handle : handle?.destroy?.bind(handle);
                    return;
                }

                // 2) Svelte 4 호환
                const mod2 = await import("svelteKitReviewApp/App");
                const C: any = (mod2 as any).default;
                const inst = new C({
                    target: containerRef.current!,
                    props: { storageKey: "review-widget:v1" },
                });
                cleanup = inst.$destroy?.bind(inst) ?? inst.destroy?.bind(inst);
            } catch (err) {
                console.error("❌ Failed to mount svelteKitReviewApp via MF:", err);
            }
        })();

        return () => {
            try { cleanup?.(); } catch { }
        };
    }, []);

    // 첫 페인트부터 값 실어주되, 이후 onThemeChange가 계속 덮어쓴다
    return (
        <div
            ref={containerRef}
            data-theme={initialTheme}
            style={{ colorScheme: initialTheme as any }}
        />
    );
};

export default SvelteKitReviewAppWrapper;
