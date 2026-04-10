import React from "react";
import styled, { keyframes } from "styled-components";

export type SystemMessageActionTone = "normal" | "primary" | "danger";

export type SystemMessageTone = "info" | "success" | "warning" | "error";

export type SystemMessageAction = {
    label: string;
    tone?: SystemMessageActionTone;
    onClick?: () => void | Promise<void>;
    autoClose?: boolean;
};

export type SystemMessage = {
    tone?: SystemMessageTone;
    title: string;
    description?: React.ReactNode;
    bullets?: React.ReactNode[];
    size?: "default" | "wide";
    actions?: SystemMessageAction[];
    closeOnScrim?: boolean;
    closeOnEsc?: boolean;
};

export type SystemMessageModalProps = {
    open: boolean;
    message: SystemMessage | null;
    onClose: () => void;
    zIndexBase?: number;
};

const TONE_COLORS: Record<SystemMessageTone, string> = {
    info: "#3E63E0",
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
};

const TONE_BG_COLORS: Record<SystemMessageTone, string> = {
    info: "rgba(62, 99, 224, 0.06)",
    success: "rgba(16, 185, 129, 0.06)",
    warning: "rgba(234, 179, 8, 0.06)",
    error: "rgba(239, 68, 68, 0.06)",
};

const ToneIcon: React.FC<{ tone: SystemMessageTone }> = ({ tone }) => {
    if (tone === "success") {
        return (
            <SuccessIconSvg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.08" />
                <path
                    className="check-path"
                    d="M17 9l-5.2 6L7 11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </SuccessIconSvg>
        );
    }

    if (tone === "warning") {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                    d="M12 3 3 19h18L12 3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1" fill="currentColor" />
            </svg>
        );
    }
    if (tone === "error") {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path
                    d="M9 9l6 6M15 9l-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }
    // info
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 10v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
    );
};

const fadeIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)); }
    to   { opacity: 1; transform: translate(-50%, -50%); }
`;

const Scrim = styled.div<{ $zIndex: number }>`
    position: fixed;
    inset: 0;
    z-index: ${({ $zIndex }) => $zIndex};
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: saturate(140%) blur(3px);
    animation: ${fadeIn} 0.18s ease;
`;

type SheetProps = {
    $size: "default" | "wide";
    $hasDescription: boolean;
    $zIndex: number;
};

const Sheet = styled.div<SheetProps>`
    position: fixed;
    z-index: ${({ $zIndex }) => $zIndex + 1};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-flex;
    flex-direction: column;

    width: ${({ $size }) => ($size === "wide" ? "min(620px, calc(100% - 40px))" : "min(460px, calc(100% - 40px))")};

    max-height: min(85vh, calc(100vh - 48px));

    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', system-ui, sans-serif;

    background: #ffffff;
    border-radius: 20px;
    border: 1px solid rgba(0, 0, 0, 0.07);
    box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.6) inset,
        0 8px 24px rgba(15, 23, 42, 0.08),
        0 32px 72px rgba(15, 23, 42, 0.2);
    overflow: hidden;
    animation: ${slideUp} 0.22s cubic-bezier(0.22, 1, 0.36, 1);
`;

type SheetHeaderProps = { $hasDescription: boolean };

const SheetHeader = styled.div<SheetHeaderProps>`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 36px 28px 24px;
    background: transparent;
`;

type IconBoxProps = { $tone: SystemMessageTone };

const iconPop = keyframes`
    0% {
        transform: scale(0.8);
        opacity: 0;
    }
    60% {
        transform: scale(1.08);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
`;

const iconRing = keyframes`
    0% {
        transform: scale(1);
        opacity: 0.45;
    }
    100% {
        transform: scale(1.5);
        opacity: 0;
    }
`;

const IconBox = styled.span<IconBoxProps>`
    position: relative;
    margin-bottom: 16px;
    flex: 0 0 auto;
    width: 76px;
    height: 76px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: ${({ $tone }) => TONE_COLORS[$tone]};
    background: ${({ $tone }) => TONE_BG_COLORS[$tone]};
    box-shadow:
            0 14px 30px rgba(15, 23, 42, 0.18),
            inset 0 0 0 1px rgba(255, 255, 255, 0.7);

    animation: ${iconPop} 0.38s ease-out;

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        border: 2px solid currentColor;
        opacity: 0;
        pointer-events: none;
        animation: ${iconRing} 0.6s ease-out 0.1s forwards;
    }

    & > svg {
        width: 40px;
        height: 40px;
    }
`;

const TitleWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: center;
    align-items: center;

    h3 {
        margin: 2px;
        font-size: 24px;
        font-weight: 900;
        line-height: 1.1;
        letter-spacing: -0.035em;
        color: #0f172a;
        word-break: keep-all;
    }

    small {
        margin: 0;
        font-size: 13px;
        font-weight: 450;
        line-height: 1.55;
        letter-spacing: -0.01em;
        color: #64748b;
        word-break: keep-all;
    }
`;

const CloseX = styled.button`
    position: absolute;
    top: 14px;
    right: 14px;
    border: 0;
    background: transparent;
    cursor: pointer;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 20px;
    color: #94a3b8;
    transition: background 0.12s ease, color 0.12s ease, transform 0.08s ease;

    &:hover {
        background: #f1f5f9;
        color: #475569;
    }
    &:active {
        transform: scale(0.93);
    }
`;

const SheetBody = styled.div`
    padding: 0 28px 24px;
    overflow: auto;
`;

const BulletList = styled.ul`
    margin: 0;
    padding-left: 20px;
    font-size: 13.5px;
    font-weight: 450;
    line-height: 1.7;
    letter-spacing: -0.01em;
    color: #475569;
    text-align: left;
    word-break: keep-all;
`;

const BulletItem = styled.li`
    &:not(:last-child) {
        margin-bottom: 6px;
    }
`;

type SheetFooterProps = { $hasDescription: boolean; $single: boolean };

const SheetFooter = styled.div<SheetFooterProps>`
    display: flex;
    flex-direction: ${({ $single }) => ($single ? "column" : "row")};
    justify-content: ${({ $single }) => ($single ? "stretch" : "flex-end")};
    gap: 10px;
    padding: ${({ $hasDescription }) => ($hasDescription ? "16px 24px 24px" : "4px 24px 28px")};

    border-top: ${({ $hasDescription }) =>
            $hasDescription ? "1px solid #f1f5f9" : "none"};
`;

const BaseBtn = styled.button`
    height: 44px;
    padding: 0 24px;
    border-radius: 12px;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', system-ui, sans-serif;
    font-size: 14.5px;
    font-weight: 700;
    letter-spacing: -0.025em;
    cursor: pointer;
    transition:
        background 0.14s ease,
        filter 0.14s ease,
        transform 0.08s ease,
        box-shadow 0.14s ease;

    &:active {
        transform: translateY(1px);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.28);
    }
`;

const Ghost = styled(BaseBtn)`
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    color: #475569;

    &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
    }
`;

const Primary = styled(BaseBtn)`
    border: none;
    background: #3E63E0;
    color: #fff;
    box-shadow: 0 2px 8px rgba(62, 99, 224, 0.3);

    &:hover {
        filter: brightness(1.06);
        box-shadow: 0 4px 14px rgba(62, 99, 224, 0.38);
    }
`;

const Danger = styled(BaseBtn)`
    border: 1.5px solid rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.06);
    color: #DC2626;

    &:hover {
        background: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.5);
    }
`;

const checkDraw = keyframes`
    from {
        stroke-dasharray: 22;
        stroke-dashoffset: 22;
        opacity: 0;
    }
    to {
        stroke-dasharray: 22;
        stroke-dashoffset: 0;
        opacity: 1;
    }
`;

const SuccessIconSvg = styled.svg`
    .check-path {
        stroke-dasharray: 22;
        stroke-dashoffset: 22;
        animation: ${checkDraw} 0.4s ease-out forwards;
    }
`;

const PlainBody = styled.div`
    margin-top: 0;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.65;
    letter-spacing: -0.015em;
    color: #4b5563;
    white-space: pre-wrap;
    text-align: center;
    word-break: keep-all;
`;

const SystemMessageModal: React.FC<SystemMessageModalProps> = ({
                                                                   open,
                                                                   message,
                                                                   onClose,
                                                                   zIndexBase = 2000,
                                                               }) => {
    React.useEffect(() => {
        if (!open || !message) return;

        const closeOnEsc = message.closeOnEsc ?? true;
        if (!closeOnEsc) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, message, onClose]);

    if (!open || !message) return null;

    const tone: SystemMessageTone = message.tone ?? "info";

    const hasBullets = !!(message.bullets && message.bullets.length > 0);

    // 불릿은 warning/error에서만 허용
    const shouldRenderBullets = hasBullets && (tone === "warning" || tone === "error");

    // bullets를 안 쓰는 경우 description을 본문으로
    const hasBodyDescription = !!message.description && !shouldRenderBullets;

    // bullets가 들어왔지만 warning/error가 아니면 문장 형태로 보여주기
    const hasBodyFromBullets = hasBullets && !shouldRenderBullets;

    // 헤더 small은 불릿 모드에서만 (원치 않으면 false로 고정해도 됨)
    const showHeaderDescription = !!message.description && shouldRenderBullets;

    // 스타일(테두리/배경)용: 본문이 있으면 true
    const hasDescription = hasBodyDescription || hasBodyFromBullets || showHeaderDescription;

    const size: "default" | "wide" =
        message.size ??
        ((tone === "warning" || tone === "error") && shouldRenderBullets ? "wide" : "default");

    const actions: SystemMessageAction[] = message.actions?.length
        ? message.actions
        : [{ label: "닫기", tone: "normal", onClick: onClose, autoClose: true }];

    const closeOnScrim = message.closeOnScrim ?? true;

    const renderActionBtn = (a: SystemMessageAction) => {
        const t = a.tone ?? "normal";
        if (t === "danger") return Danger;
        if (t === "primary") return Primary;
        return Ghost;
    };

    return (
        <>
            <Scrim $zIndex={zIndexBase} onClick={closeOnScrim ? onClose : undefined} />
            <Sheet
                role="dialog"
                aria-modal="true"
                aria-labelledby="system-message-title"
                $size={size}
                $hasDescription={hasDescription}
                $zIndex={zIndexBase}
            >
                <SheetHeader $hasDescription={hasDescription}>
                    <IconBox $tone={tone}>
                        <ToneIcon tone={tone} />
                    </IconBox>

                    <TitleWrap>
                        <h3 id="system-message-title">{message.title}</h3>

                        {/* bullets 있을 때만 small(헤더)로 */}
                        {showHeaderDescription && <small>{message.description}</small>}
                    </TitleWrap>

                    <CloseX type="button" aria-label="닫기" onClick={onClose}>
                        ×
                    </CloseX>
                </SheetHeader>

                {(shouldRenderBullets || hasBodyDescription || hasBodyFromBullets) && (
                    <SheetBody>
                        {shouldRenderBullets ? (
                            <BulletList>
                                {message.bullets!.map((b, i) => (
                                    <BulletItem key={i}>{b}</BulletItem>
                                ))}
                            </BulletList>
                        ) : hasBodyFromBullets ? (
                            <PlainBody>
                                {message.bullets!.map((b, i) => (
                                    <div key={i}>{b}</div>
                                ))}
                            </PlainBody>
                        ) : (
                            <PlainBody>{message.description}</PlainBody>
                        )}
                    </SheetBody>
                )}


                <SheetFooter $hasDescription={hasDescription} $single={actions.length === 1}>
                    {actions.map((a, idx) => {
                        const Btn = renderActionBtn(a);
                        return (
                            <Btn
                                key={idx}
                                type="button"
                                onClick={async () => {
                                    try {
                                        await a.onClick?.();
                                        const autoClose = a.autoClose ?? true;
                                        if (autoClose) onClose();
                                    } catch (err) {
                                        console.error("[SystemMessageModal action error]", err);
                                    }
                                }}
                            >
                                {a.label}
                            </Btn>
                        );
                    })}
                </SheetFooter>
            </Sheet>
        </>
    );
};

export default SystemMessageModal;