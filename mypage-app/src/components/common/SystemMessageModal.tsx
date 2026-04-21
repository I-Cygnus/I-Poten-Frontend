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
    info: "#2563eb",
    success: "#059669",
    warning: "#b45309",
    error: "#dc2626",
};

const TONE_BG: Record<SystemMessageTone, string> = {
    info: "rgba(59, 130, 246, 0.1)",
    success: "rgba(16, 185, 129, 0.12)",
    warning: "rgba(245, 158, 11, 0.12)",
    error: "rgba(220, 38, 38, 0.1)",
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
    background: rgba(15, 23, 42, 0.5);
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
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 24px;
    box-shadow: 0 32px 80px rgba(15, 23, 42, 0.18);
    overflow: hidden;

    :root[data-theme="dark"] & {
        background: #0f172a;
        border-color: rgba(148, 163, 184, 0.22);
    }
`;

const SheetHeader = styled.div<{ $hasDescription: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 28px 28px 4px;
`;

const iconPop = keyframes`
    0% { transform: translateY(-2px) scale(0.9); opacity: 0; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
`;

const IconBox = styled.span<{ $tone: SystemMessageTone }>`
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    color: ${({ $tone }) => TONE_COLORS[$tone]};
    background: ${({ $tone }) => TONE_BG[$tone]};
    animation: ${iconPop} 0.32s cubic-bezier(0.16, 1, 0.3, 1);

    & > svg {
        width: 22px;
        height: 22px;
    }

    :root[data-theme="dark"] & {
        color: ${({ $tone }) => {
            if ($tone === "info") return "#93c5fd";
            if ($tone === "success") return "#34d399";
            if ($tone === "warning") return "#fbbf24";
            return "#f87171";
        }};
        background: ${({ $tone }) => {
            if ($tone === "info") return "rgba(96, 165, 250, 0.14)";
            if ($tone === "success") return "rgba(52, 211, 153, 0.14)";
            if ($tone === "warning") return "rgba(251, 191, 36, 0.14)";
            return "rgba(248, 113, 113, 0.14)";
        }};
    }
`;

const TitleWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
    align-items: flex-start;
    width: 100%;

    h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.35;
        letter-spacing: -0.02em;
        color: #0f172a;
    }

    small {
        margin: 0;
        font-size: 13px;
        line-height: 1.65;
        color: rgba(15, 23, 42, 0.6);
    }

    :root[data-theme="dark"] & {
        h3 {
            color: #f1f5f9;
        }

        small {
            color: rgba(226, 232, 240, 0.66);
        }
    }
`;

const CloseX = styled.button`
    position: absolute;
    top: 18px;
    right: 18px;
    border: none;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.1);
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    font-size: 16px;
    line-height: 1;
    color: rgba(15, 23, 42, 0.6);
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
    }

    :root[data-theme="dark"] & {
        background: rgba(148, 163, 184, 0.16);
        color: rgba(226, 232, 240, 0.65);

        &:hover {
            background: rgba(248, 113, 113, 0.16);
            color: #f87171;
        }
    }
`;

const SheetBody = styled.div`
    padding: 16px 28px 20px;
    overflow: auto;
`;

const BulletList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const BulletItem = styled.li`
    position: relative;
    padding: 12px 16px 12px 36px;
    border-radius: 14px;
    background: rgba(248, 250, 252, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.14);
    font-size: 13px;
    line-height: 1.65;
    font-weight: 500;
    color: rgba(15, 23, 42, 0.75);

    &::before {
        content: "";
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: rgba(59, 130, 246, 0.7);
    }

    :root[data-theme="dark"] & {
        background: rgba(15, 23, 42, 0.45);
        border-color: rgba(148, 163, 184, 0.16);
        color: rgba(226, 232, 240, 0.75);

        &::before {
            background: rgba(96, 165, 250, 0.8);
        }
    }
`;

const SheetFooter = styled.div<{ $hasDescription: boolean }>`
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    padding: 16px 28px 24px;
`;

const Ghost = styled.button`
    min-height: 44px;
    min-width: 100px;
    padding: 0 22px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.7);
    color: rgba(15, 23, 42, 0.75);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: rgba(59, 130, 246, 0.08);
        border-color: rgba(59, 130, 246, 0.22);
        color: #2563eb;
    }

    :root[data-theme="dark"] & {
        border-color: rgba(148, 163, 184, 0.22);
        background: rgba(15, 23, 42, 0.45);
        color: rgba(226, 232, 240, 0.75);

        &:hover {
            background: rgba(96, 165, 250, 0.14);
            border-color: rgba(96, 165, 250, 0.28);
            color: #93c5fd;
        }
    }
`;

const Primary = styled(Ghost)`
    border: none;
    background: #2563eb;
    color: #ffffff;

    &:hover {
        background: #1d4ed8;
        color: #ffffff;
    }

    :root[data-theme="dark"] & {
        background: #3b82f6;
        color: #ffffff;

        &:hover {
            background: #2563eb;
            color: #ffffff;
        }
    }
`;

const Danger = styled(Ghost)`
    border: none;
    background: #dc2626;
    color: #ffffff;
    box-shadow: 0 10px 22px rgba(220, 38, 38, 0.22);

    &:hover {
        background: #b91c1c;
        color: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 14px 28px rgba(220, 38, 38, 0.28);
    }

    :root[data-theme="dark"] & {
        background: #f87171;
        color: #0f172a;
        box-shadow: 0 10px 22px rgba(248, 113, 113, 0.24);

        &:hover {
            background: #ef4444;
            color: #ffffff;
            box-shadow: 0 14px 28px rgba(248, 113, 113, 0.3);
        }
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
        animation: ${checkDraw} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
`;

const PlainBody = styled.div`
    margin-top: 0;
    font-size: 14px;
    line-height: 1.7;
    color: rgba(15, 23, 42, 0.72);
    white-space: pre-wrap;
    text-align: left;

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.72);
    }
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
