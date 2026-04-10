import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

const Shell = styled.main`
  height: 100dvh; width: 100%;
  background: #111827; color: #e5e7eb;
  display: grid; grid-template-rows: 54px 1fr;
`;
const TopBar = styled.header`
  display: flex; align-items: center; gap: 10px;
  padding: 0 12px; border-bottom: 1px solid #1f2937;
`;
const Title = styled.h1`
  font-size: 15px; font-weight: 750; margin: 0;
  letter-spacing: -0.01em; color: #e5e7eb;
`;
const Actions = styled.div` margin-left: auto; display: flex; gap: 8px; `;
const Btn = styled.button`
  height: 34px; padding: 0 12px; border-radius: 8px; border: 1px solid #374151;
  background: #0b1220; color: #e5e7eb; font-weight: 700; cursor: pointer;
  &:hover { filter: brightness(1.1); }
`;
const Stage = styled.section` position: relative; `;
const Frame = styled.iframe` width: 100%; height: 100%; border: 0; background: #111827; `;
const ReaderHost = styled.div` width: 100%; height: 100%; `;

type ReaderType = "pdf" | "epub";

function useQuery() {
    const qs = new URLSearchParams(location.search);
    return {
        type: (qs.get("type") as ReaderType) || "pdf",
        src: qs.get("src") || "",
        title: qs.get("title") || "E-BOOK",
    };
}

export default function EbookReaderPage() {
    const { type, src, title } = useQuery();
    const [safeTitle] = useState(title);

    useEffect(() => { document.title = safeTitle; }, [safeTitle]);

    const openNewTab = () => { if (src) window.open(src, "_blank", "noopener"); };

    return (
        <Shell>
            <TopBar>
                <Title>{safeTitle}</Title>
                <Actions>
                    {src && <Btn onClick={openNewTab}>새 탭에서 열기</Btn>}
                    <Btn onClick={() => history.back()}>닫기</Btn>
                </Actions>
            </TopBar>
            <Stage>
                {type === "pdf" ? <PdfPane src={src} /> : <EpubPane src={src} />}
            </Stage>
        </Shell>
    );
}

/* ===== PDF 뷰어: pdf.js web viewer 임베드 =====
   /public/pdfjs/web/viewer.html 에 pdf.js 배치 후
   /reader?type=pdf&src=<PDF_URL> 로 접근
*/
function PdfPane({ src }: { src: string }) {
    const viewerUrl = useMemo(() => {
        if (!src) return "";
        return `/pdfjs/web/viewer.html?file=${encodeURIComponent(src)}#pagemode=thumbs&toolbar=1&navpanes=1`;
    }, [src]);
    return <Frame src={viewerUrl} title="PDF Reader" />;
}

/* ===== EPUB 뷰어: epub.js 사용 ===== */
function EpubPane({ src }: { src: string }) {
    const hostRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!src || !hostRef.current) return;
        import("epubjs").then(({ default: ePub }: any) => {
            const book = ePub(src);
            const rendition = book.renderTo(hostRef.current!, {
                width: "100%",
                height: "100%",
                spread: "always",
                flow: "paginated",
            });
            rendition.display();

            const onKey = (e: KeyboardEvent) => {
                if (e.key === "ArrowRight") rendition.next();
                if (e.key === "ArrowLeft") rendition.prev();
            };
            window.addEventListener("keydown", onKey);

            // 다크 테마 스타일 약식
            rendition.themes.register("dark", {
                "body": { "background": "#111827", "color": "#e5e7eb" },
                "p": { "line-height": "1.7" }
            });
            rendition.themes.select("dark");

            return () => {
                window.removeEventListener("keydown", onKey);
                book && book.destroy && book.destroy();
            };
        });
    }, [src]);

    return <ReaderHost ref={hostRef} />;
}
