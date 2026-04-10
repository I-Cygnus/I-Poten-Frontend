import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useRecoilValue } from "recoil";
import { themeAtom } from "@jobspoon/app-state";

const BRAND = {
    blue: "#3b82f6",
    blueDark: "#60a5fa",
    blueHover: "#2563eb",
    cyan: "#22d3ee",
    cyanDeep: "#06b6d4",
    green: "#34d399",
    greenDeep: "#10b981",
} as const;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const shake = keyframes`
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
`;

const Wrapper = styled.div<{ $dark: boolean }>`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $dark }) =>
        $dark
            ? `radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.08) 0%, transparent 60%),
         radial-gradient(ellipse at 70% 80%, rgba(34,211,238,0.06) 0%, transparent 60%),
         #0f1115`
            : `radial-gradient(900px at 20% 60%, rgba(211,228,253,0.55) 0%, transparent 100%),
         radial-gradient(900px at 80% 55%, rgba(213,247,239,0.55) 0%, transparent 100%),
         #ffffff`};
    padding: 20px;
    position: relative;
    overflow: hidden;
`;

const FloatingOrb = styled.div<{ $dark: boolean; $delay: string; $top: string; $left: string; $size: string }>`
    position: absolute;
    width: ${({ $size }) => $size};
    height: ${({ $size }) => $size};
    top: ${({ $top }) => $top};
    left: ${({ $left }) => $left};
    border-radius: 50%;
    background: ${({ $dark }) =>
        $dark
            ? `radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)`
            : `radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)`};
    animation: ${pulse} 4s ease-in-out infinite;
    animation-delay: ${({ $delay }) => $delay};
    pointer-events: none;
`;

const Card = styled.div<{ $dark: boolean; $shake: boolean }>`
    width: 100%;
    max-width: 420px;
    padding: 48px 40px;
    border-radius: 28px;
    background: ${({ $dark }) => ($dark ? "rgba(21,25,34,0.85)" : "rgba(255,255,255,0.85)")};
    backdrop-filter: blur(24px);
    border: 1px solid ${({ $dark }) => ($dark ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.18)")};
    box-shadow: ${({ $dark }) =>
        $dark
            ? "0 34px 110px rgba(2,6,23,0.55), 0 0 0 1px rgba(255,255,255,0.03)"
            : "0 22px 70px rgba(15,23,42,0.06), 0 0 0 1px rgba(0,0,0,0.02)"};
    animation: ${({ $shake }) => ($shake ? shake : fadeIn)} ${({ $shake }) => ($shake ? "0.4s" : "0.6s")} ease;
    z-index: 1;

    @media (max-width: 480px) {
        padding: 36px 24px;
        border-radius: 20px;
    }
`;

const Logo = styled.div<{ $dark: boolean }>`
    text-align: center;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    background: linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const Title = styled.h1<{ $dark: boolean }>`
    text-align: center;
    font-size: 28px;
    font-weight: 800;
    color: ${({ $dark }) => ($dark ? "#eaeaea" : "#111111")};
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
`;

const Subtitle = styled.p<{ $dark: boolean }>`
    text-align: center;
    font-size: 14px;
    color: ${({ $dark }) => ($dark ? "#a0a0a0" : "#666666")};
    margin: 0 0 36px 0;
`;

const CodeContainer = styled.div`
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 32px;
`;

const CodeInput = styled.input<{ $dark: boolean; $filled: boolean }>`
    width: 44px;
    height: 56px;
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    border-radius: 14px;
    border: 2px solid ${({ $dark, $filled }) =>
        $filled
            ? BRAND.blue
            : $dark
            ? "rgba(148,163,184,0.2)"
            : "rgba(148,163,184,0.3)"};
    background: ${({ $dark }) => ($dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)")};
    color: ${({ $dark }) => ($dark ? "#eaeaea" : "#111111")};
    outline: none;
    transition: all 0.2s ease;
    caret-color: ${BRAND.blue};

    &:focus {
        border-color: ${BRAND.cyan};
        box-shadow: 0 0 0 3px rgba(34,211,238,0.15);
        background: ${({ $dark }) => ($dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,1)")};
    }
`;

const SubmitButton = styled.button<{ $dark: boolean; $loading: boolean }>`
    width: 100%;
    height: 52px;
    border: none;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 700;
    cursor: ${({ $loading }) => ($loading ? "wait" : "pointer")};
    background: linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyanDeep});
    color: #fff;
    transition: all 0.2s ease;
    letter-spacing: 0.5px;

    &:hover {
        transform: ${({ $loading }) => ($loading ? "none" : "translateY(-1px)")};
        box-shadow: 0 8px 24px rgba(59,130,246,0.3);
    }

    &:active {
        transform: translateY(0);
    }
`;

const ErrorMsg = styled.p`
    text-align: center;
    color: #ef4444;
    font-size: 13px;
    margin: -16px 0 20px 0;
    font-weight: 500;
`;

const SecurityBadge = styled.div<{ $dark: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 24px;
    font-size: 12px;
    color: ${({ $dark }) => ($dark ? "#666" : "#999")};

    &::before {
        content: "🔒";
        font-size: 11px;
    }
`;

interface AdminAuthProps {
    onSuccess: () => void;
}

export default function AdminAuth({ onSuccess }: AdminAuthProps) {
    const mode = useRecoilValue(themeAtom);
    const dark = mode === "dark";
    const [step, setStep] = useState<"phone" | "birth">("phone");
    const [code, setCode] = useState<string[]>(Array(11).fill(""));
    const [birthCode, setBirthCode] = useState<string[]>(Array(6).fill(""));
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [shaking, setShaking] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const birthRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (step === "phone") {
            inputRefs.current[0]?.focus();
        } else {
            birthRefs.current[0]?.focus();
        }
    }, [step]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        if (value.length > 1) {
            const digits = value.replace(/\D/g, "").split("");
            digits.forEach((d, i) => {
                if (index + i < 11) newCode[index + i] = d;
            });
            setCode(newCode);
            const nextIdx = Math.min(index + digits.length, 10);
            inputRefs.current[nextIdx]?.focus();
        } else {
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 10) inputRefs.current[index + 1]?.focus();
        }
        setError("");
    };

    const handleBirthChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...birthCode];
        if (value.length > 1) {
            const digits = value.replace(/\D/g, "").split("");
            digits.forEach((d, i) => {
                if (index + i < 6) newCode[index + i] = d;
            });
            setBirthCode(newCode);
            const nextIdx = Math.min(index + digits.length, 5);
            birthRefs.current[nextIdx]?.focus();
        } else {
            newCode[index] = value;
            setBirthCode(newCode);
            if (value && index < 5) birthRefs.current[index + 1]?.focus();
        }
        setError("");
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (step === "phone") {
            if (e.key === "Backspace" && !code[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else {
            if (e.key === "Backspace" && !birthCode[index] && index > 0) {
                birthRefs.current[index - 1]?.focus();
            }
        }
        if (e.key === "Enter") handleSubmit();
    };

    const handleSubmit = async () => {
        if (step === "phone") {
            const fullCode = code.join("");
            if (fullCode.length !== 11) {
                setError("11자리 코드를 입력해주세요");
                return;
            }
            setLoading(true);
            try {
                const res = await fetch("/spring/api/admin/dashboard/verify-code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: fullCode }),
                });
                const data = await res.json();
                if (data.verified) {
                    setStep("birth");
                    setError("");
                } else {
                    setError("잘못된 코드입니다");
                    setShaking(true);
                    setTimeout(() => setShaking(false), 400);
                }
            } catch {
                setError("서버 연결 실패");
                setShaking(true);
                setTimeout(() => setShaking(false), 400);
            }
            setLoading(false);
        } else {
            const fullBirth = birthCode.join("");
            if (fullBirth.length !== 6) {
                setError("6자리 생년월일을 입력해주세요");
                return;
            }
            if (fullBirth === "990823") {
                sessionStorage.setItem("adminCode", code.join(""));
                onSuccess();
            } else {
                setError("잘못된 생년월일입니다");
                setShaking(true);
                setTimeout(() => setShaking(false), 400);
            }
        }
    };

    const stepLabels = {
        phone: { title: "관리자 콘솔", subtitle: "관리자 인증 코드를 입력하세요", btn: "다음", stepText: "1단계: 전화번호 인증" },
        birth: { title: "2차 인증", subtitle: "생년월일 6자리를 입력하세요", btn: "인증하기", stepText: "2단계: 생년월일 인증" },
    };

    const current = stepLabels[step];

    return (
        <Wrapper $dark={dark}>
            <FloatingOrb $dark={dark} $delay="0s" $top="20%" $left="15%" $size="300px" />
            <FloatingOrb $dark={dark} $delay="1.5s" $top="70%" $left="80%" $size="250px" />
            <FloatingOrb $dark={dark} $delay="3s" $top="40%" $left="60%" $size="200px" />

            <Card $dark={dark} $shake={shaking}>
                <Logo $dark={dark}>I-PTN</Logo>
                <Title $dark={dark}>{current.title}</Title>
                <Subtitle $dark={dark}>{current.subtitle}</Subtitle>

                {step === "phone" ? (
                    <CodeContainer>
                        {code.map((digit, i) => (
                            <React.Fragment key={i}>
                                {(i === 3 || i === 7) && (
                                    <span style={{ color: dark ? "#555" : "#ccc", fontSize: 20, alignSelf: "center" }}>-</span>
                                )}
                                <CodeInput
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    $dark={dark}
                                    $filled={!!digit}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const paste = e.clipboardData.getData("text").replace(/\D/g, "");
                                        handleChange(i, paste);
                                    }}
                                />
                            </React.Fragment>
                        ))}
                    </CodeContainer>
                ) : (
                    <CodeContainer>
                        {birthCode.map((digit, i) => (
                            <React.Fragment key={i}>
                                {(i === 2 || i === 4) && (
                                    <span style={{ color: dark ? "#555" : "#ccc", fontSize: 20, alignSelf: "center" }}>/</span>
                                )}
                                <CodeInput
                                    ref={(el) => { birthRefs.current[i] = el; }}
                                    $dark={dark}
                                    $filled={!!digit}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleBirthChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const paste = e.clipboardData.getData("text").replace(/\D/g, "");
                                        handleBirthChange(i, paste);
                                    }}
                                />
                            </React.Fragment>
                        ))}
                    </CodeContainer>
                )}

                {error && <ErrorMsg>{error}</ErrorMsg>}

                <SubmitButton $dark={dark} $loading={loading} onClick={handleSubmit} disabled={loading}>
                    {loading ? "확인 중..." : current.btn}
                </SubmitButton>

                <SecurityBadge $dark={dark}>{current.stepText}</SecurityBadge>
            </Card>
        </Wrapper>
    );
}
