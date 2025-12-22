import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getTheme, onThemeChange } from "@jobspoon/theme-bridge";

const VueAccountAppWrapper = ({ eventBus }: { eventBus: any }) => {
    const vueModuleRef = useRef<HTMLDivElement>(null);
    const isMountedRef = useRef(false);
    const unmountRef = useRef<(() => void) | null>(null);

    const location = useLocation()

    useEffect(() => {
        const el = vueModuleRef.current;
        if (!el) return;
        const apply = (t: "light" | "dark") => {
            el.setAttribute("data-theme", t);
            (el.style as any).colorScheme = t;

            // 최소 공통 토큰 주입(원하면 확장)
            const light = { 
                '--text': '#111', 
                '--card': '#ffffffc0',
                '--flex-direction': 'row',
                '--login-width': '50%'
            };
            const dark = { 
                '--text': '#eaeaea', 
                '--card': '#00000000',
                '--flex-direction': 'row',
                '--login-width': '50%'
            };
            const tokens = t === 'dark' ? dark : light;
            Object.entries(tokens).forEach(([k, v]) => el.style.setProperty(k, v));
        };
        apply(getTheme());
        const off = onThemeChange(apply);
        return () => { off(); };
    }, []);

    useEffect(() => {
        const mountVueApp = async () => {
            const { vueAccountAppMount, vueAccountAppUnmount } = await import("vueAccountApp/bootstrap");

            if (vueModuleRef.current && !isMountedRef.current) {
                vueAccountAppMount(vueModuleRef.current, eventBus);
                isMountedRef.current = true;

                unmountRef.current = () => {
                    vueAccountAppUnmount?.(vueModuleRef.current!);
                    isMountedRef.current = false;
                };
                const iframeDoc = document;
                iframeDoc.body.style.margin = "0";
                iframeDoc.body.style.padding = "0";
            }

        }
        mountVueApp();

        return () => {
            if (unmountRef.current) {
                unmountRef.current();
                unmountRef.current = null;
            }
            eventBus.off("routing-event");
        };
    }, []);

    useEffect(() => {
        if (location.pathname === "/vue-account/login") {
            eventBus.emit("vue-account-routing-event", "/");
        }
    }, [location]);

    return (
        <div
            id="vue-account-wrapper"
            ref={vueModuleRef}
            style={{
                width: "100%",
                height: "100vh", // 전체 높이 사용
                margin: 0,
                padding: 0,

            }}
        />
    )
};

export default VueAccountAppWrapper;