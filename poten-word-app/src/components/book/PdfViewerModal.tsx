// components/PdfViewerModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;

/* ========= 스타일 ========= */
const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    display: grid;
    place-items: center;
    z-index: 9999;
`;

const Modal = styled.div`
    width: min(1400px, 98vw);
    height: min(94vh, 980px);
    background: #0b1220;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
    display: grid;
    grid-template-rows: 52px 1fr;
`;

const Bar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    border-bottom: 1px solid #1f2937;
    font-weight: 750;
    color: #e5e7eb;
    background: #0b1220;
`;

const Stage = styled.div`
    position: relative;
    background: #111827;
    height: 100%;
`;

const Btn = styled.button`
    height: 34px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid #374151;
    background: #0b1220;
    color: #e5e7eb;
    font-weight: 700;
    cursor: pointer;
    &:hover {
        filter: brightness(1.1);
    }
`;

const NavBtn = styled.button<{ side: "left" | "right" }>`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${(p) => (p.side === "left" ? "left: 10px;" : "right: 10px;")}
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 1px solid #374151;
    background: rgba(17, 24, 39, 0.65);
    color: #e5e7eb;
    font-size: 18px;
    font-weight: 800;
    display: grid;
    place-items: center;
    cursor: pointer;
    backdrop-filter: blur(2px);
    &:hover {
        background: rgba(31, 41, 55, 0.8);
    }
`;

const CanvasWrap = styled.div`
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
    canvas {
        box-shadow: 0 2px 24px rgba(0, 0, 0, 0.25);
        border-radius: 8px;
        will-change: transform;
        transform: translateZ(0);
    }
    &.enter {
        opacity: 0;
        transform: translateX(12px);
    }
    &.enter-active {
        opacity: 1;
        transform: translateX(0);
        transition: opacity 0.18s ease, transform 0.18s ease;
    }
    &.exit {
        opacity: 1;
        transform: translateX(0);
    }
    &.exit-active {
        opacity: 0;
        transform: translateX(-12px);
        transition: opacity 0.18s ease, transform 0.18s ease;
    }
`;

const ZoomControls = styled.div`
    position: absolute;
    top: 12px;
    right: 12px;
    display: grid;
    grid-auto-flow: column;
    gap: 8px;
    background: rgba(17, 24, 39, 0.85);
    border: 1px solid #374151;
    padding: 6px;
    border-radius: 10px;
    backdrop-filter: blur(3px);
    button {
        height: 30px;
        padding: 0 10px;
        border-radius: 8px;
        border: 1px solid #374151;
        background: #0b1220;
        color: #e5e7eb;
        font-weight: 700;
        cursor: pointer;
        min-width: 36px;
    }
`;

const Hud = styled.div`
    position: absolute;
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%);
    background: rgba(17, 24, 39, 0.85);
    border: 1px solid #374151;
    color: #e5e7eb;
    padding: 6px 10px;
    border-radius: 8px;
    font-weight: 750;
    font-size: 12px;
    line-height: 1;
    user-select: none;
    pointer-events: none;
`;

/* ========= 타입 ========= */
type Props = {
    open: boolean;
    title?: string;
    src?: string;
    assetOrigin?: string;
    onClose: () => void;
};

/** 전역에서 사용할 리모트 오리진 상수 */
function isHttpOrigin(o: string) {
    return /^https?:\/\//i.test(o);
}

function resolveRemoteOrigin(): string {
    // 1) 런타임 주입이 있으면 그게 제일 정확함 (권장)
    try {
        const injected = (window as any).__APP_CONFIG__?.MFE_PUBLIC_SERVICE;
        if (injected) {
            const o = new URL(injected, window.location.href).origin;
            if (isHttpOrigin(o)) return o;
        }
    } catch {}

    // 2) import.meta.url에서 오리진 추출 (단, http(s)만 허용)
    try {
        // @ts-ignore
        const o = new URL(import.meta.url).origin;
        if (isHttpOrigin(o)) return o;
    } catch {}

    // 3) 마지막 fallback: 현재 페이지 오리진 (http(s)만)
    return isHttpOrigin(window.location.origin) ? window.location.origin : "http://localhost:3006";
}

const REMOTE_ORIGIN = resolveRemoteOrigin();

/* ========= URL 후보 & 안전 fetch ========= */
function buildPdfUrlCandidates(src: string, assetOrigin?: string): string[] {
    if (!src) return [];

    if (/^file:\/\//i.test(src)) {
        try { src = new URL(src).pathname; } catch { return []; }
    }

    if (/^https?:\/\//i.test(src)) return [src];

    const candidates: string[] = [];

    if (assetOrigin && /^https?:\/\//i.test(assetOrigin)) {
        candidates.push(new URL(src, assetOrigin + "/").toString());
    }

    // 기존 fallback들
    if (/^https?:\/\//i.test(REMOTE_ORIGIN)) {
        candidates.push(new URL(src, REMOTE_ORIGIN + "/").toString());
    }
    candidates.push(new URL(src, window.location.origin + "/").toString());

    return Array.from(new Set(candidates));
}


/** PDF 컨텐츠를 안전하게 받아온다(HTML이면 다음 후보로 재시도) */
async function fetchPdfBuffer(urls: string[]): Promise<{ buf: ArrayBuffer; finalUrl: string }> {
    console.log("[PdfViewer] candidates =", urls);
    let lastErr: any = null;

    for (const url of urls) {
        try {
            const res = await fetch(url, {
                credentials: "omit",
                cache: "no-store"
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0, 120)}…`);
            }
            const ct = (res.headers.get("content-type") || "").toLowerCase();
            const looksPdf = ct.startsWith("application/pdf") || ct.startsWith("application/octet-stream");
            if (!looksPdf) {
                const snippet = await res.text().catch(() => "");
                throw new Error(`Not a PDF (content-type=${ct}). Snippet: ${snippet.slice(0, 200)}…`);
            }
            const buf = await res.arrayBuffer();
            return { buf, finalUrl: url };
        } catch (e) {
            lastErr = e;
            // 다음 후보 계속 시도
        }
    }
    throw lastErr ?? new Error("Failed to fetch PDF from all candidates.");
}

/* ========= 공통 훅 ========= */
function useDpr() {
    const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio || 1, 3));
    useEffect(() => {
        const on = () => setDpr(Math.min(window.devicePixelRatio || 1, 3));
        window.addEventListener("resize", on);
        return () => window.removeEventListener("resize", on);
    }, []);
    return dpr;
}

/* ========= 뷰어 ========= */
function SmoothPdfPane({
                           src,
                           assetOrigin,
                           onResolvedUrl,
                       } : {
    src: string;
    assetOrigin?: string;
    onResolvedUrl?: (url: string) => void;
}) {
    console.log("[PdfViewer] src =", src);

    // 줌
    const [zoom, setZoom] = useState(1);
    const Z_MIN = 0.5,
        Z_MAX = 3,
        Z_STEP = 0.1;
    const setZoomClamped = (z: number) => setZoom(Math.min(Z_MAX, Math.max(Z_MIN, z)));
    const zoomIn = () => setZoomClamped(+(zoom + Z_STEP).toFixed(2));
    const zoomOut = () => setZoomClamped(+(zoom - Z_STEP).toFixed(2));
    const zoomReset = () => setZoom(1);

    const hostRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [pdf, setPdf] = useState<any>(null);
    const [pageNum, setPageNum] = useState(1);
    const [pages, setPages] = useState(0);
    const [phase, setPhase] = useState<"enter" | "enter-active" | "exit" | "exit-active" | "idle">("idle");
    const [err, setErr] = useState<string | null>(null);
    const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

    const dpr = useDpr();
    const OVERSAMPLE = 1.3;
    const MAX_PIXELS = 12_000_000;

    const urlCandidates = useMemo(
        () => buildPdfUrlCandidates(src, assetOrigin),
        [src, assetOrigin]
    );

    // 컨테이너 크기 관찰
    useEffect(() => {
        if (!hostRef.current) return;
        const el = hostRef.current;
        const ro = new ResizeObserver((entries) => {
            for (const e of entries) {
                const cr = e.contentRect;
                setBox({ w: Math.floor(cr.width), h: Math.floor(cr.height) });
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Ctrl + Wheel 확대/축소
    useEffect(() => {
        const el = hostRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return; // Ctrl + 휠일 때만 확대/축소
            e.preventDefault();
            const dir = e.deltaY > 0 ? -1 : 1; // 위로 굴리면 확대
            const factor = 1 + Z_STEP * 0.9; // 부드러운 감도
            const next = dir > 0 ? zoom * factor : zoom / factor;
            setZoomClamped(+next.toFixed(3));
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [zoom]);

    // 문서 로드
    useEffect(() => {
        let alive = true;

        setErr(null);
        setPdf(null);
        setPages(0);
        setPageNum(1);

        (async () => {
            try {
                const { buf, finalUrl } = await fetchPdfBuffer(urlCandidates);
                if (!alive) return;

                const loadingTask = pdfjsLib.getDocument({ data: buf });
                const doc = await loadingTask.promise;
                if (!alive) return;

                setPdf(doc);
                setPages(doc.numPages || 0);
                setPageNum(1);
                onResolvedUrl?.(finalUrl);
            } catch (e: any) {
                console.error("PDF load error:", e);
                if (alive) setErr(e?.message || "PDF 로드 실패");
            }
        })();

        return () => {
            alive = false;
        };
    }, [urlCandidates, onResolvedUrl]);

    // 페이지 렌더
    useEffect(() => {
        if (!pdf || !hostRef.current || !canvasRef.current) return;
        if (box.w <= 0 || box.h <= 0) return;
        let canceled = false;

        (async () => {
            try {
                const page = await pdf.getPage(pageNum);
                const host = hostRef.current!;
                const canvas = canvasRef.current!;
                const ctx = canvas.getContext("2d")!;

                const pad = 16;
                const availW = Math.max(0, host.clientWidth - pad * 2);
                const availH = Math.max(0, host.clientHeight - pad * 2);
                if (availW === 0 || availH === 0) return;

                const vpBase = page.getViewport({ scale: 1 });
                const fitScale = Math.min(availW / vpBase.width, availH / vpBase.height);

                let outputScale = fitScale * zoom * dpr * OVERSAMPLE;
                let viewport = page.getViewport({ scale: outputScale });

                const estPixels = Math.ceil(viewport.width) * Math.ceil(viewport.height);
                if (estPixels > MAX_PIXELS) {
                    const cap = Math.sqrt(MAX_PIXELS / estPixels);
                    outputScale *= cap;
                    viewport = page.getViewport({ scale: outputScale });
                }

                canvas.width = Math.ceil(viewport.width);
                canvas.height = Math.ceil(viewport.height);
                canvas.style.width = Math.round(viewport.width / (dpr * OVERSAMPLE)) + "px";
                canvas.style.height = Math.round(viewport.height / (dpr * OVERSAMPLE)) + "px";

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.imageSmoothingEnabled = true;

                setPhase("enter");
                requestAnimationFrame(() => setPhase("enter-active"));

                await page.render({ canvasContext: ctx, viewport }).promise;
                if (canceled) return;

                setTimeout(() => setPhase("idle"), 180);
            } catch (e: any) {
                console.error("Render error:", e);
                if (!canceled) setErr(e?.message || "렌더링 실패");
            }
        })();

        return () => {
            canceled = true;
        };
    }, [pdf, pageNum, dpr, box.w, box.h, zoom]);

    // 더블클릭 줌 토글
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const onDbl = (e: MouseEvent) => {
            e.preventDefault();
            setZoom((z) => (Math.abs(z - 1) < 0.05 ? 1.6 : 1)); // 1 ↔ 1.6 토글
        };
        canvas.addEventListener("dblclick", onDbl);
        return () => canvas.removeEventListener("dblclick", onDbl);
    }, []);

    // 키보드 네비 & 줌
    const go = (d: number) => setPageNum((p) => Math.max(1, Math.min(pages || 1, p + d)));
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // 확대/축소 단축키
            if (e.ctrlKey && !e.altKey && !e.metaKey) {
                if (e.key === "+" || e.key === "=") {
                    e.preventDefault();
                    zoomIn();
                    return;
                }
                if (e.key === "-") {
                    e.preventDefault();
                    zoomOut();
                    return;
                }
                if (e.key === "0") {
                    e.preventDefault();
                    zoomReset();
                    return;
                }
            }
            // 페이지 네비게이션
            if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
            switch (e.key) {
                case "ArrowLeft":
                case "PageUp":
                    e.preventDefault();
                    go(-1);
                    break;
                case "ArrowRight":
                case "PageDown":
                    e.preventDefault();
                    go(+1);
                    break;
                case "Home":
                    e.preventDefault();
                    setPageNum(1);
                    break;
                case "End":
                    e.preventDefault();
                    setPageNum(pages || 1);
                    break;
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [pages, zoom]);

    const showOverlay = err || !pdf || box.w === 0 || box.h === 0;

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }} ref={hostRef}>
            <CanvasWrap
                className={
                    phase === "enter"
                        ? "enter"
                        : phase === "enter-active"
                            ? "enter-active"
                            : phase === "exit"
                                ? "exit"
                                : phase === "exit-active"
                                    ? "exit-active"
                                    : ""
                }
            >
                <canvas ref={canvasRef} />
                <ZoomControls>
                    <button type="button" onClick={zoomOut} aria-label="축소">
                        −
                    </button>
                    <button type="button" onClick={zoomReset} aria-label="화면맞춤">
                        100%
                    </button>
                    <button type="button" onClick={zoomIn} aria-label="확대">
                        ＋
                    </button>
                </ZoomControls>
            </CanvasWrap>

            {pages > 0 && !err && (
                <Hud aria-live="polite" role="status">
                    {pageNum} / {pages} · {Math.round(zoom * 100)}%
                </Hud>
            )}

            {showOverlay && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        color: "#e5e7eb",
                        background: "transparent",
                        fontWeight: 700,
                    }}
                >
                    {err ? `오류: ${err}` : "불러오는 중..."}
                </div>
            )}

            {pages > 1 && !err && (
                <>
                    <NavBtn side="left" onClick={() => go(-1)} aria-label="이전 페이지">
                        ‹
                    </NavBtn>
                    <NavBtn side="right" onClick={() => go(+1)} aria-label="다음 페이지">
                        ›
                    </NavBtn>
                </>
            )}
        </div>
    );
}

/* ========= 모달 본체 ========= */
function PdfViewerModalInner({ open, title, src, assetOrigin, onClose }: Props)  {
    // ESC + 스크롤 잠금
    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        if (open) {
            document.addEventListener("keydown", onEsc);
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.removeEventListener("keydown", onEsc);
                document.body.style.overflow = prev;
            };
        }
    }, [open, onClose]);

    const [originUrl, setOriginUrl] = useState<string>("");

    if (!open) return null;

    return createPortal(
        <Backdrop
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? "E-BOOK"}
        >
            <Modal onClick={(e) => e.stopPropagation()}>
                <Bar>
                    <span>{title ?? "E-BOOK"}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {originUrl && (
                            <a href={originUrl} target="_blank" rel="noopener noreferrer">
                                <Btn type="button">원본</Btn>
                            </a>
                        )}
                        <Btn type="button" onClick={onClose}>
                            닫기
                        </Btn>
                    </div>
                </Bar>

                <Stage>
                    {src ? (
                        <SmoothPdfPane
                            src={src}
                            assetOrigin={assetOrigin}
                            onResolvedUrl={(u) => setOriginUrl(u)}
                        />
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                placeItems: "center",
                                height: "100%",
                                color: "#e5e7eb",
                            }}
                        >
                            PDF 경로가 비어있습니다.
                        </div>
                    )}
                </Stage>
            </Modal>
        </Backdrop>,
        document.body
    );
}

export default function PdfViewerModal(props: Props) {
    return <PdfViewerModalInner {...props} />;
}
