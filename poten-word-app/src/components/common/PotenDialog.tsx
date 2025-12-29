import React from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

/* ===== 디자인 토큰 ===== */
const TOKENS = {
    color: {
        overlay: "rgba(15,23,42,.45)",
        panelBg: "#ffffff",
        headerGradTop: "#ffffff",
        headerGradBot: "#fbfbfd",
        textPrimary: "#0f172a",
        textSecondary: "#374151",
        textMuted: "#6b7280",
        line: "#e5e7eb",
        primary: "#4F76F1",
        primaryStrong: "#3E63E0",
        primarySoft: "#e6edff",
        btnGhostHover: "#f3f4f6",
        danger: "#ef4444",
        dangerHover: "#dc2626",
        dangerText: "#ffffff",
    },
    gradient: {
        brandSoft: "linear-gradient(135deg, rgba(79,118,241,0.12) 0%, rgba(62,99,224,0.12) 100%)",
    },
    radius: { panel: 18, btn: 5, item: 12 },
    space: (n: number) => `${n}px`,
    shadow: { panel: "0 30px 80px rgba(0,0,0,.18)" },
    font: { h3: "20px", body: "15px", tiny: "12px" },
} as const;

/* ===== 공통 레이아웃 ===== */
const Overlay = styled.div`
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, .45);
    backdrop-filter: saturate(120%) blur(2px);
    display: flex; align-items: center; justify-content: center;
    z-index: 2147483647;
`;

const Panel = styled.div<{ $danger?: boolean }>`
    position: relative;
    width: 420px;                         
    max-width: calc(100vw - 32px);
    max-height: min(84vh, calc(100vh - 32px));
    display: flex; flex-direction: column;

    background: #fff;
    border: 1px solid ${TOKENS.color.line};
    border-radius: 18px;                  /* 퀴즈 모달 톤 */
    box-shadow: 0 30px 80px rgba(0,0,0,.18);
    overflow: hidden;

    --sheet-pad-x: 24px;

    animation: fadeIn .16s ease-out;
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
    }
`;

const Header = styled.div`
    position: relative;
    padding: 20px var(--sheet-pad-x) 16px;
    font-size: ${TOKENS.font.h3};
    font-weight: 750;
    color: #0f172a;
    letter-spacing: -0.02em;
    border-bottom: 1px solid ${TOKENS.color.line};
    background: linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%);
`;

const Body = styled.div`
    padding: 18px var(--sheet-pad-x) 8px;
    color: ${TOKENS.color.textSecondary};
    font-size: ${TOKENS.font.body};
    overflow: auto;
    scrollbar-gutter: stable;
    /* 모바일에서 뷰포트 찌그러짐 방지 */
    min-height: 60px;
`;

const Footer = styled.div`
    position: sticky; bottom: 0;
    display: flex; justify-content: flex-end; gap: 8px;
    padding: 12px var(--sheet-pad-x);
    border-top: 1px solid ${TOKENS.color.line};
    background: linear-gradient(180deg, rgba(255,255,255,.85), #fff 60%);
`;

/* ===== 버튼 (퀴즈 모달 톤) ===== */
const GhostBtn = styled.button`
    height: 35px; min-width: 84px; padding: 0 16px;
    border-radius: ${TOKENS.radius.btn}px;
    border: 1px solid ${TOKENS.color.primaryStrong};
    background: #fff;
    color: ${TOKENS.color.primaryStrong};
    font-weight: 700; cursor: pointer;

    transition: background-color .15s ease, color .15s ease, border-color .15s ease, transform .08s ease;
    &:hover { background: ${TOKENS.color.primarySoft}; }
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(62,99,224,.25); }
`;

const PrimaryBtn = styled.button<{ disabled?: boolean }>`
    height: 35px; min-width: 96px; padding: 0 18px;
    border-radius: ${TOKENS.radius.btn}px;
    border: 1px solid ${TOKENS.color.primary};
    background: ${TOKENS.color.primary};
    color: #fff; font-weight: 700; letter-spacing: -0.02em;
    cursor: pointer; box-shadow: none;

    transition: filter .15s ease, transform .08s ease, box-shadow .15s ease;
    &:hover { filter: brightness(.96); }
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25); }
    &:disabled { opacity: .7; cursor: not-allowed; }
`;

const DangerBtn = styled(PrimaryBtn)`
    border-color: ${TOKENS.color.danger};
    background: ${TOKENS.color.danger};
    &:hover { filter: brightness(.98); background: ${TOKENS.color.dangerHover}; }
`;

const Label = styled.label`
    display:block; font-size: 13px; color: ${TOKENS.color.textMuted}; margin-bottom: 8px;
`;

const TextInput = styled.input`
    width: 100%; height: 38px;
    border-radius: ${TOKENS.radius.item}px;
    border: 1px solid ${TOKENS.color.line};
    padding: 0 12px; outline: none; font-size: ${TOKENS.font.body};
    background: #fff; color: ${TOKENS.color.textSecondary};
    transition: box-shadow .12s ease, border-color .12s ease, background .12s ease;

    &:focus {
        border-color: ${TOKENS.color.primaryStrong};
        box-shadow: 0 0 0 3px rgba(79,118,241,.25);
        background: #f6f8fb;
    }
`;

const ErrorText = styled.p`
    margin: 8px 2px 0; font-size: ${TOKENS.font.tiny};
    color: ${TOKENS.color.danger};
`;

/* ===== 타입 ===== */
type ConfirmOpts = {
    title: string;
    description?: React.ReactNode;
    okText?: string;
    cancelText?: string;
    danger?: boolean;
};

type AlertOpts = {
    title: string;
    description?: React.ReactNode;
    okText?: string;
};

type PromptOpts = {
    title: string;
    label?: string;
    placeholder?: string;
    initialValue?: string;
    okText?: string;
    cancelText?: string;
    validator?: (value: string) => string | undefined; // 에러 메시지 반환
};

/* ===== 컨텍스트/프로바이더 ===== */
type DialogAPI = {
    confirm: (opts: ConfirmOpts) => Promise<boolean>;
    alert: (opts: AlertOpts) => Promise<void>;
    prompt: (opts: PromptOpts) => Promise<string | null>;
};

const DialogCtx = React.createContext<DialogAPI | null>(null);

type State =
    | { type: "none" }
    | { type: "confirm"; opts: ConfirmOpts; resolve: (v: boolean) => void }
    | { type: "alert"; opts: AlertOpts; resolve: () => void }
    | { type: "prompt"; opts: PromptOpts; resolve: (v: string | null) => void };

export const PotenDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = React.useState<State>({ type: "none" });
    const [input, setInput] = React.useState("");

    // 배경 스크롤 잠금
    React.useEffect(() => {
        if (state.type === "none") return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [state.type]);

    const api = React.useMemo<DialogAPI>(() => ({
        confirm: (opts) =>
            new Promise<boolean>((resolve) => setState({ type: "confirm", opts, resolve })),
        alert: (opts) =>
            new Promise<void>((resolve) => setState({ type: "alert", opts, resolve })),
        prompt: (opts) =>
            new Promise<string | null>((resolve) => {
                setInput(opts.initialValue ?? "");
                setState({ type: "prompt", opts, resolve });
            }),
    }), []);

    const close = () => setState({ type: "none" });

    // ESC 핸들
    React.useEffect(() => {
        if (state.type === "none") return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") {
            if (state.type === "confirm") { state.resolve(false); }
            if (state.type === "alert")   { state.resolve(); }
            if (state.type === "prompt")  { state.resolve(null); }
            close();
        }};
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [state]);

    // 포커스 이동
    const okRef = React.useRef<HTMLButtonElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() => {
        if (state.type === "prompt") inputRef.current?.focus();
        else if (state.type !== "none") okRef.current?.focus();
    }, [state]);

    const modal =
        state.type === "none" ? null : (
            <Overlay
                role="dialog"
                aria-modal="true"
                onMouseDown={(e) => {
                    // 바깥 클릭 닫기
                    if (e.target === e.currentTarget) {
                        if (state.type === "confirm") state.resolve(false);
                        if (state.type === "alert")   state.resolve();
                        if (state.type === "prompt")  state.resolve(null);
                        close();
                    }
                }}
            >
                {/* ===== Confirm ===== */}
                {state.type === "confirm" && (
                    <Panel $danger={state.opts.danger}>
                        <Header>{state.opts.title}</Header>
                        {state.opts.description && <Body>{state.opts.description}</Body>}
                        <Footer>
                            <GhostBtn onClick={() => { state.resolve(false); close(); }}>
                                {state.opts.cancelText ?? "취소"}
                            </GhostBtn>
                            {state.opts.danger ? (
                                <DangerBtn ref={okRef} onClick={() => { state.resolve(true); close(); }}>
                                    {state.opts.okText ?? "확인"}
                                </DangerBtn>
                            ) : (
                                <PrimaryBtn ref={okRef} onClick={() => { state.resolve(true); close(); }}>
                                    {state.opts.okText ?? "확인"}
                                </PrimaryBtn>
                            )}
                        </Footer>
                    </Panel>
                )}

                {/* ===== Alert ===== */}
                {state.type === "alert" && (
                    <Panel>
                        <Header>{state.opts.title}</Header>
                        {state.opts.description && <Body>{state.opts.description}</Body>}
                        <Footer>
                            <PrimaryBtn ref={okRef} onClick={() => { state.resolve(); close(); }}>
                                {state.opts.okText ?? "확인"}
                            </PrimaryBtn>
                        </Footer>
                    </Panel>
                )}

                {/* ===== Prompt ===== */}
                {state.type === "prompt" && (
                    <Panel>
                        <Header>{state.opts.title}</Header>
                        <Body>
                            {state.opts.label && <Label htmlFor="sp-prompt-input">{state.opts.label}</Label>}
                            <TextInput
                                id="sp-prompt-input"
                                ref={inputRef}
                                value={input}
                                placeholder={state.opts.placeholder}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        const err = state.opts.validator?.(input);
                                        if (!err) { state.resolve(input.trim()); close(); }
                                    }
                                }}
                            />
                            {/* 유효성 실시간 표시(옵션) */}
                            {state.opts.validator && (() => {
                                const msg = state.opts.validator(input);
                                return msg ? <ErrorText role="alert">{msg}</ErrorText> : null;
                            })()}
                        </Body>
                        <Footer>
                            <GhostBtn onClick={() => { state.resolve(null); close(); }}>
                                {state.opts.cancelText ?? "취소"}
                            </GhostBtn>
                            <PrimaryBtn
                                ref={okRef}
                                onClick={() => {
                                    const err = state.opts.validator?.(input);
                                    if (!err) { state.resolve(input.trim()); close(); }
                                }}
                                disabled={!!state.opts.validator?.(input)}
                                aria-disabled={!!state.opts.validator?.(input)}
                            >
                                {state.opts.okText ?? "확인"}
                            </PrimaryBtn>
                        </Footer>
                    </Panel>
                )}
            </Overlay>
        );

    return (
        <DialogCtx.Provider value={api}>
            {children}
            {modal ? createPortal(modal, document.body) : null}
        </DialogCtx.Provider>
    );
};

export const usePotenDialog = () => {
    const ctx = React.useContext(DialogCtx);
    if (!ctx) throw new Error("usePotenDialog must be used inside <PotenDialogProvider>");
    return ctx;
};
