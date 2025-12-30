import React, { useState } from "react";
import PdfViewerModal from "./PdfViewerModal.tsx";
import styled from "styled-components";

export type EbookItem = {
    id: string | number;
    title: string;
    coverUrl: string;
    pdfUrl?: string;
    ebookUrl?: string;
};

type Props = { items: EbookItem[]; className?: string; };

const UI = {
    panel: "#ffffff", text: "#0f172a", sub: "#475569", line: "#e5e7eb",
    primary: "#4F76F1", primaryStrong: "#3E63E0", primarySoft: "#e6edff",
    shadow: "0 24px 60px rgba(15, 23, 42, .10)",
};

const CtaBtn = styled.button.attrs({ type: "button" })`
    height: 35px; min-width: 96px; padding: 0 18px;
    border-radius: 5px; border: 1px solid ${UI.primary};
    background: ${UI.primary}; color: #fff;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    font-weight: 700; font-size: 14px; letter-spacing: -0.02em;
    cursor: pointer;
    transition: filter .15s ease, transform .08s ease, box-shadow .15s ease;
    &:hover { filter: brightness(.96); }
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25); }
`;

const BookIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 6.5A2.5 2.5 0 0 1 7 4.0h4.5c.6 0 1.2.3 1.6.7l.7.8c.3.4.8.5 1.3.5H17
             A2.5 2.5 0 0 1 19.5 8v9.5A2.5 2.5 0 0 1 17 20H7
             A2.5 2.5 0 0 1 4.5 17.5V6.5Z"
              fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 7.5v10" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const Wrap = styled.section` padding: 6px 0 24px; `;
const Grid = styled.ul`
    list-style: none; margin: 0; padding: 0;
    display: grid; gap: 34px 36px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;
const Card = styled.li` display: grid; justify-items: center; text-align: center; `;
const CoverBox = styled.button.attrs({ type: "button" })`
    width: 100%; aspect-ratio: 3 / 4.2; max-width: 260px;
    background: ${UI.panel}; border: 1px solid ${UI.line}; border-radius: 14px;
    box-shadow: ${UI.shadow}; padding: 12px;
    display: grid; place-items: center; overflow: hidden;
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
    cursor: pointer;
    &:hover {
        transform: translateY(-2px);
        border-color: ${UI.primaryStrong};
        box-shadow: 0 26px 70px rgba(62,99,224,.22);
    }
`;
const CoverImg = styled.img`
    max-width: 100%; max-height: 100%; object-fit: contain;
    filter: drop-shadow(0 6px 14px rgba(0,0,0,.08));
`;
const Title = styled.h3`
    margin: 14px 0 0; padding: 0 4px;
    font-size: 16px; font-weight: 750; letter-spacing: -0.02em; line-height: 1.45;
    color: ${UI.text};
`;
const Actions = styled.div`
    margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
`;

export default function EbookGrid({ items, className }: Props) {
    const [pdfOpen, setPdfOpen] = useState(false);
    const [pdfSrc, setPdfSrc] = useState<string | undefined>();
    const [pdfTitle, setPdfTitle] = useState<string | undefined>();

    const openPdf = (title: string, url?: string) => {
        if (!url) return;
        setPdfTitle(title);
        setPdfSrc(url);
        setPdfOpen(true);
    };

    return (
        <Wrap className={className} aria-label="E-BOOK 리스트">
            <Grid>
                {items.map(it => {
                    const hasPdf = !!it.pdfUrl;
                    return (
                        <Card key={it.id}>
                            <CoverBox
                                aria-label={`${it.title} 표지 보기`}
                                onClick={() => openPdf(it.title, it.pdfUrl)}
                                disabled={!hasPdf}
                                title={hasPdf ? "클릭하여 열기" : "PDF가 없습니다"}
                            >
                                <CoverImg src={it.coverUrl} alt={`${it.title} 표지`} />
                            </CoverBox>

                            <Title>{it.title}</Title>

                            {hasPdf && (
                                <Actions>
                                    <CtaBtn onClick={() => openPdf(it.title, it.pdfUrl)} aria-label={`${it.title} E-BOOK 보기`}>
                                        <BookIcon />
                                        <span>E-BOOK 보기</span>
                                    </CtaBtn>
                                </Actions>
                            )}
                        </Card>
                    );
                })}
            </Grid>

            <PdfViewerModal
                open={pdfOpen}
                title={pdfTitle}
                src={pdfSrc}
                onClose={() => setPdfOpen(false)}
            />
        </Wrap>
    );
}
