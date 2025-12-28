import React, { useEffect } from "react";
import styled from "styled-components";

type Variant = "default" | "cardOnly";

export default function DailyQuizModal({
                                           open,
                                           title,
                                           onClose,
                                           children,
                                           variant = "default",
                                       }: {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    variant?: Variant;
}) {
    useEffect(() => {
        if (!open) return;

        const body = document.body;
        body.setAttribute("data-modal-open", "true");
        if (variant === "cardOnly") body.setAttribute("data-card-modal", "true");

        const prevOverflow = body.style.overflow;
        body.style.overflow = "hidden";

        return () => {
            body.removeAttribute("data-modal-open");
            body.removeAttribute("data-card-modal");
            body.style.overflow = prevOverflow;
        };
    }, [open, variant]);

    if (!open) return null;

    return (
        <Scrim
            $variant={variant}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? "오늘의 퀴즈"}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <Sheet $variant={variant} onClick={(e) => e.stopPropagation()}>
                {variant === "default" ? (
                    <Header>
                        <h3>{title ?? "오늘의 퀴즈"}</h3>
                        <Close type="button" onClick={onClose} aria-label="닫기">
                            ×
                        </Close>
                    </Header>
                ) : (
                    <FloatingClose>
                        <CloseBtn type="button" onClick={onClose} aria-label="닫기">
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                                <path
                                    d="M6 6l12 12M18 6L6 18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </CloseBtn>
                    </FloatingClose>
                )}

                <Body $variant={variant}>{children}</Body>
            </Sheet>
        </Scrim>
    );
}

const Scrim = styled.div<{ $variant: Variant }>`
  position: fixed;
  inset: 0;
  z-index: 2000;

  background: ${(p) =>
    p.$variant === "cardOnly" ? "rgba(15,23,42,.78)" : "rgba(15,23,42,.45)"};

  backdrop-filter: ${(p) =>
    p.$variant === "cardOnly" ? "none" : "saturate(120%) blur(2px)"};
`;

const Sheet = styled.div<{ $variant: Variant }>`
  position: fixed;
  z-index: 2001;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: #fff;
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  ${({ $variant }) =>
    $variant === "cardOnly"
        ? `
        --gap: clamp(12px, 1.6vw, 22px);
        --vw: calc(100dvw - var(--gap));
        --vh: calc(100dvh - var(--gap));
        --maxW: 1360px;

        width: min(var(--maxW), var(--vw), calc(var(--vh) * 16 / 9));
        aspect-ratio: 16 / 9;
        height: auto;
      `
        : `
        width: min(980px, calc(100% - 32px));
        max-height: min(90vh, calc(100vh - 32px));
      `}
`;

const Body = styled.div<{ $variant: Variant }>`
  ${({ $variant }) =>
    $variant === "cardOnly"
        ? `
        flex: 1 1 auto;
        height: 100%;
        overflow: hidden;
        padding: 0;
        position: relative;
        isolation: isolate;

        & > * {
          width: 100%;
          height: 100%;
        }

        & [data-soft-blobs="true"] { display: none !important; }
      `
        : `
        overflow: auto;
        padding: 14px;
      `}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 14px 14px 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #0f172a;
  }
`;

const Close = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;

  font-size: 22px;
  line-height: 1;
  color: rgba(15, 23, 42, 0.72);

  &:hover {
    background: rgba(15, 23, 42, 0.06);
    color: rgba(15, 23, 42, 0.88);
  }
  &:focus-visible {
    outline: 3px solid rgba(62, 99, 224, 0.35);
    outline-offset: 3px;
  }
`;

const FloatingClose = styled.div`
    position: absolute;
    top: 16px;
    right: 16px;
    transform: translate(6px, -6px); /* +x = 오른쪽, -y = 위 */
    z-index: 50;
`;

const CloseBtn = styled.button`
    all: unset;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: grid;
    place-items: center;

    background: transparent !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;

    color: rgba(15, 23, 42, 0.75);

    &:hover {
        color: rgba(15, 23, 42, 0.92);
        transform: none;
    }
    &:active {
        transform: none;
    }
    &:focus-visible {
        outline: 3px solid rgba(62, 99, 224, 0.35);
        outline-offset: 3px;
        border-radius: 10px;
    }

    svg {
        width: 18px;
        height: 18px;
        display: block;
    }
`;
