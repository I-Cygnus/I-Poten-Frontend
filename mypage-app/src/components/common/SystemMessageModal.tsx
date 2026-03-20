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

    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 10v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
    );
};

const Scrim = styled.div<{ $zIndex: number }>`
    position: fixed;
    inset: 0;
    z-index: ${({ $zIndex }) => $zIndex};
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: saturate(120%) blur(2px);
`;

const Sheet = styled.div<{ $size: "default" | "wide"; $hasDescription: boolean; $zIndex: number }>`
    position: fixed;
    z-index: ${({ $zIndex }) => $zIndex + 1};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-flex;
    flex-direction: column;
    width: auto;
    min-width: 320px;
    max-width: ${({ $size }) =>
        $size === "wide"
            ? "min(720px, calc(100% - 32px))"
            : "min(480px, calc(100% - 32px))"};
    max-height: min(80vh, calc(100vh - 48px));
    background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
    overflow: hidden;
`;

const SheetHeader = styled.div<{ $hasDescription: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 20px 16px;
`;

const iconPop = keyframes`
    0% { transform: scale(0.8); opacity: 0; }
    60% { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
`;

const iconRing = keyframes`
    0% { transform: scale(1); opacity: 0.45; }
    100% { transform: scale(1.5); opacity: 0; }
`;

const IconBox = styled.span<{ $tone: SystemMessageTone }>`
    position: relative;
    margin-bottom: 6px;
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
    gap: 4px;
    padding-top: 10px;
    text-align: center;
    align-items: center;

    h3 {
        margin: 0;
        font-size: 17px;
        line-height: 1.4;
        letter-spacing: -0.02em;
        color: #111827;
    }

    small {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: #6b7280;
    }
`;

const CloseX = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    border: 0;
    background: transparent;
    cursor: pointer;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 18px;
    color: #9ca3af;

    &:hover {
        background: #f3f4f6;
        color: #4b5563;
    }
`;

const SheetBody = styled.div`
    padding: 0 22px 20px;
    overflow: auto;
`;

const BulletList = styled.ul`
    margin: 0;
    padding-left: 18px;
    color: #4b5563;
    font-size: 13px;
    line-height: 1.65;
`;

const BulletItem = styled.li`
    & + & {
        margin-top: 6px;
    }
`;

const SheetFooter = styled.div<{ $hasDescription: boolean }>`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
    padding: ${({ $hasDescription }) => ($hasDescription ? "0 22px 22px" : "18px 22px 22px")};
`;

const Ghost = styled.button`
    min-height: 44px;
    border-radius: 12px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #374151;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        background: #f9fafb;
    }
`;

const Primary = styled(Ghost)`
    border-color: #3e63e0;
    background: #4f76f1;
    color: #ffffff;

    &:hover {
        background: #3e63e0;
        border-color: #3e63e0;
        filter: brightness(0.96);
    }
`;

const Danger = styled(Ghost)`
    border-color: rgba(239, 68, 68, 0.45);
    background: rgba(239, 68, 68, 0.12);
    color: #dc2626;

    &:hover {
        background: rgba(239, 68, 68, 0.16);
    }
`;

const checkDraw = keyframes`
    from { stroke-dasharray: 22; stroke-dashoffset: 22; opacity: 0; }
    to { stroke-dasharray: 22; stroke-dashoffset: 0; opacity: 1; }
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
    font-size: 13px;
    line-height: 1.6;
    color: #4b5563;
    white-space: pre-wrap;
    text-align: center;
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

    const tone = message.tone ?? "info";
    const hasBullets = !!(message.bullets && message.bullets.length > 0);
    const shouldRenderBullets = hasBullets && (tone === "warning" || tone === "error");
    const hasBodyDescription = !!message.description && !shouldRenderBullets;
    const hasBodyFromBullets = hasBullets && !shouldRenderBullets;
    const showHeaderDescription = !!message.description && shouldRenderBullets;
    const hasDescription = hasBodyDescription || hasBodyFromBullets || showHeaderDescription;
    const size =
        message.size ??
        ((tone === "warning" || tone === "error") && shouldRenderBullets ? "wide" : "default");
    const actions = message.actions?.length
        ? message.actions
        : [{ label: "닫기", tone: "normal" as const, onClick: onClose, autoClose: true }];
    const closeOnScrim = message.closeOnScrim ?? true;

    const renderActionBtn = (action: SystemMessageAction) => {
        const buttonTone = action.tone ?? "normal";
        if (buttonTone === "danger") return Danger;
        if (buttonTone === "primary") return Primary;
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
                                {message.bullets!.map((bullet, index) => (
                                    <BulletItem key={index}>{bullet}</BulletItem>
                                ))}
                            </BulletList>
                        ) : hasBodyFromBullets ? (
                            <PlainBody>
                                {message.bullets!.map((bullet, index) => (
                                    <div key={index}>{bullet}</div>
                                ))}
                            </PlainBody>
                        ) : (
                            <PlainBody>{message.description}</PlainBody>
                        )}
                    </SheetBody>
                )}

                <SheetFooter $hasDescription={hasDescription}>
                    {actions.map((action, index) => {
                        const Button = renderActionBtn(action);
                        return (
                            <Button
                                key={index}
                                type="button"
                                onClick={async () => {
                                    try {
                                        await action.onClick?.();
                                        if (action.autoClose ?? true) onClose();
                                    } catch (error) {
                                        console.error("[SystemMessageModal action error]", error);
                                    }
                                }}
                            >
                                {action.label}
                            </Button>
                        );
                    })}
                </SheetFooter>
            </Sheet>
        </>
    );
};

export default SystemMessageModal;
