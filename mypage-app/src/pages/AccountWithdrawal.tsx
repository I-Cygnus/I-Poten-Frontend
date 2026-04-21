import React, { useState } from "react";
import styled, { css } from "styled-components";
import { Clock3, FileText, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { withdrawAccount } from "../api/withdrawalApi.ts";
import SystemMessageModal, { type SystemMessage } from "../components/common/SystemMessageModal.tsx";
import { completeWithdrawal } from "../utils/withdrawalFlow.ts";
import { notifyError, notifyInfo, notifySuccess } from "../utils/toast.ts";

const pretendard = css`
    font-family:
        "Pretendard",
        -apple-system,
        BlinkMacSystemFont,
        "Apple SD Gothic Neo",
        "Noto Sans KR",
        "Segoe UI",
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    letter-spacing: -0.015em;
    word-break: keep-all;
`;

const interactiveText = css`
    ${pretendard};
    font: inherit;
    letter-spacing: -0.015em;
`;

const palette = {
    softBorder: "rgba(148, 163, 184, 0.22)",
    softerBorder: "rgba(148, 163, 184, 0.14)",
    text: "#0f172a",
    textSoft: "rgba(15, 23, 42, 0.6)",
    textMuted: "rgba(15, 23, 42, 0.4)",
    primaryStrong: "#2563eb",
    chipBg: "rgba(59, 130, 246, 0.08)",
    mintChipBg: "rgba(16, 185, 129, 0.1)",
    warningSoft: "rgba(245, 158, 11, 0.1)",
    warningBorder: "rgba(245, 158, 11, 0.22)",
    warningText: "#b45309",
    danger: "#dc2626",
    dangerHover: "#b91c1c",
    dangerSoft: "rgba(220, 38, 38, 0.08)",
    dangerBorder: "rgba(220, 38, 38, 0.22)",
    surface: "#ffffff",
    surfaceAlt: "#f8fafc",
    shadowSoft: "0 20px 60px rgba(15, 23, 42, 0.06)",
};

export default function AccountWithdrawal() {
    const [withdrawAgreed, setWithdrawAgreed] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [sysOpen, setSysOpen] = useState(false);
    const [sysMsg, setSysMsg] = useState<SystemMessage | null>(null);
    const navigate = useNavigate();

    const openSys = (message: SystemMessage) => {
        setSysMsg(message);
        setSysOpen(true);
    };

    const closeSys = () => {
        setSysOpen(false);
        setSysMsg(null);
    };

    const performWithdraw = async () => {
        if (withdrawing) {
            return;
        }

        if (!withdrawAgreed) {
            notifyInfo("회원 탈퇴 안내에 동의한 뒤 다시 진행해 주세요.");
            return;
        }

        try {
            setWithdrawing(true);
            await withdrawAccount();
            completeWithdrawal(navigate);
            notifySuccess("회원 탈퇴가 완료되었습니다.");
        } catch (error) {
            console.error(error);
            notifyError(error instanceof Error ? error.message : "회원 탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setWithdrawing(false);
        }
    };

    const handleWithdraw = () => {
        if (withdrawing) {
            return;
        }

        if (!withdrawAgreed) {
            notifyInfo("회원 탈퇴 안내에 동의한 뒤 다시 진행해 주세요.");
            return;
        }

        openSys({
            tone: "warning",
            title: "정말 회원 탈퇴를 진행할까요?",
            description: "탈퇴 후에는 학습 이력과 면접 기록을 되돌릴 수 없으며, 30일 동안 동일한 계정으로 재가입이 제한됩니다.",
            actions: [
                {
                    label: "취소",
                    tone: "normal",
                },
                {
                    label: "회원 탈퇴",
                    tone: "danger",
                    onClick: performWithdraw,
                },
            ],
        });
    };

    return (
        <PageShell>
            <HeroCard>
                <HeroTitle>탈퇴 전에 꼭 확인해 주세요.</HeroTitle>
                <HeroDescription>
                    삭제되는 항목과 복구 불가 내용을 살펴본 뒤 진행해 주세요. 학습 기록, AI 모의 면접 기록, 계정 설정이 함께 정리됩니다.
                </HeroDescription>
            </HeroCard>

            <InfoGrid>
                <InfoCard>
                    <InfoIconWrap>
                        <FileText size={18} strokeWidth={2} />
                    </InfoIconWrap>
                    <InfoTitle>학습 기록</InfoTitle>
                    <InfoDesc>
                        퀴즈 풀이 기록, 학습 이력, 오답노트 관련 데이터가 삭제되거나 복구되지 않을 수 있어요.
                    </InfoDesc>
                </InfoCard>

                <InfoCard>
                    <InfoIconWrap>
                        <Clock3 size={18} strokeWidth={2} />
                    </InfoIconWrap>
                    <InfoTitle>AI 모의 면접 기록</InfoTitle>
                    <InfoDesc>
                        AI 모의 면접 결과와 피드백, 진행 히스토리도 함께 정리될 수 있으니 필요한 내용은 미리 확인해 주세요.
                    </InfoDesc>
                </InfoCard>

                <InfoCard>
                    <InfoIconWrap>
                        <Settings size={18} strokeWidth={2} />
                    </InfoIconWrap>
                    <InfoTitle>계정 설정</InfoTitle>
                    <InfoDesc>
                        알림 설정, 관심 분야, 개인화 추천 정보도 초기화되며 일부 정보는 다시 복원되지 않을 수 있어요.
                    </InfoDesc>
                </InfoCard>
            </InfoGrid>

            <DangerCard>
                <DangerHead>
                    <DangerIconWrap>
                        <LogOut size={20} strokeWidth={2} />
                    </DangerIconWrap>

                    <DangerHeadText>
                        <DangerEyebrow>최종 확인</DangerEyebrow>
                        <DangerLead>
                            아래 네 가지를 확인했다면 회원 탈퇴를 진행해 주세요.
                        </DangerLead>
                    </DangerHeadText>
                </DangerHead>

                <DangerList>
                    <li>학습 기록과 AI 모의 면접 기록은 삭제 후 복구할 수 없습니다.</li>
                    <li>계정 설정과 개인화 정보도 함께 초기화됩니다.</li>
                    <li>구독 또는 결제 이력이 있다면 먼저 확인이 필요합니다.</li>
                    <li>회원 탈퇴 후 30일 동안 동일한 계정으로 재가입이 제한됩니다.</li>
                </DangerList>

                <ConfirmPanel>
                    <CheckboxLabel htmlFor="withdraw-check" $checked={withdrawAgreed}>
                        <input
                            type="checkbox"
                            id="withdraw-check"
                            checked={withdrawAgreed}
                            onChange={(event) => setWithdrawAgreed(event.target.checked)}
                        />
                        <span>안내 내용을 모두 확인했고 회원 탈퇴에 동의합니다.</span>
                    </CheckboxLabel>

                    <HelperText>
                        탈퇴 버튼을 누르면 현재 세션이 즉시 종료되며, 30일 동안 동일한 계정으로 재가입이 제한됩니다.
                    </HelperText>
                </ConfirmPanel>

                <ActionRow>
                    <GhostButton type="button" onClick={() => navigate("/mypage")}>
                        이전으로
                    </GhostButton>
                    <DangerButton
                        type="button"
                        disabled={!withdrawAgreed || withdrawing}
                        onClick={handleWithdraw}
                    >
                        {withdrawing ? "처리 중..." : "회원 탈퇴 진행"}
                    </DangerButton>
                </ActionRow>
            </DangerCard>
            <SystemMessageModal open={sysOpen} message={sysMsg} onClose={closeSys} />
        </PageShell>
    );
}

const PageShell = styled.div`
    ${pretendard};
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    padding: 48px 24px 72px;
    display: flex;
    flex-direction: column;
    gap: 28px;

    @media (max-width: 768px) {
        padding: 28px 16px 48px;
        gap: 20px;
    }

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const HeroCard = styled.section`
    padding: 28px 32px;
    border-radius: 20px;
    background: ${palette.surface};
    border: 1px solid ${palette.softBorder};

    @media (max-width: 768px) {
        padding: 24px 20px;
    }

    :root[data-theme="dark"] & {
        background: #0f172a;
        border-color: rgba(148, 163, 184, 0.18);
    }
`;

const HeroTitle = styled.h2`
    margin: 0 0 10px;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.02em;
    color: ${palette.text};

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const HeroDescription = styled.p`
    margin: 0;
    max-width: 60ch;
    font-size: 14px;
    line-height: 1.7;
    color: ${palette.textSoft};

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.66);
    }
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const InfoCard = styled.article`
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 26px 24px;
    border-radius: 18px;
    background: ${palette.surface};
    border: 1px solid ${palette.softBorder};
    transition: border-color 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        border-color: rgba(59, 130, 246, 0.22);
    }

    :root[data-theme="dark"] & {
        background: #0f172a;
        border-color: rgba(148, 163, 184, 0.18);

        &:hover {
            border-color: rgba(96, 165, 250, 0.28);
        }
    }
`;

const InfoIconWrap = styled.div`
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: ${palette.chipBg};
    color: ${palette.primaryStrong};

    :root[data-theme="dark"] & {
        background: rgba(96, 165, 250, 0.14);
        color: #93c5fd;
    }
`;

const InfoTitle = styled.h3`
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.015em;
    color: ${palette.text};

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const InfoDesc = styled.p`
    margin: 0;
    font-size: 13.5px;
    line-height: 1.7;
    color: ${palette.textSoft};

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.66);
    }
`;

const DangerCard = styled.section`
    padding: 32px 32px 28px;
    border-radius: 24px;
    background: ${palette.surface};
    border: 1px solid ${palette.softBorder};

    @media (max-width: 768px) {
        padding: 26px 22px 24px;
    }

    :root[data-theme="dark"] & {
        background: #0f172a;
        border-color: rgba(148, 163, 184, 0.18);
    }
`;

const DangerHead = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;

    @media (max-width: 640px) {
        flex-direction: column;
        gap: 12px;
    }
`;

const DangerIconWrap = styled.div`
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: ${palette.warningSoft};
    color: ${palette.warningText};

    :root[data-theme="dark"] & {
        background: rgba(251, 191, 36, 0.12);
        color: #fbbf24;
    }
`;

const DangerHeadText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const DangerEyebrow = styled.div`
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    padding: 5px 12px;
    border-radius: 999px;
    background: ${palette.warningSoft};
    font-size: 12px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${palette.warningText};

    :root[data-theme="dark"] & {
        background: rgba(251, 191, 36, 0.14);
        color: #fbbf24;
    }
`;

const DangerLead = styled.p`
    margin: 0;
    max-width: 60ch;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.55;
    letter-spacing: -0.015em;
    color: ${palette.text};

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const DangerList = styled.ul`
    list-style: none;
    margin: 0 0 24px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    li {
        position: relative;
        padding: 14px 16px 14px 44px;
        border-radius: 14px;
        background: ${palette.warningSoft};
        border: 1px solid ${palette.warningBorder};
        color: ${palette.warningText};
        font-size: 13.5px;
        font-weight: 500;
        line-height: 1.6;
    }

    li::before {
        content: "";
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.22);
        color: ${palette.warningText};
    }

    li::after {
        content: "!";
        position: absolute;
        left: 22px;
        top: 50%;
        transform: translateY(-52%);
        font-size: 12px;
        font-weight: 700;
        color: ${palette.warningText};
        font-family: "Pretendard", sans-serif;
    }

    :root[data-theme="dark"] & {
        li {
            background: rgba(251, 191, 36, 0.08);
            border-color: rgba(251, 191, 36, 0.22);
            color: #fde68a;
        }

        li::before {
            background: rgba(251, 191, 36, 0.2);
        }

        li::after {
            color: #fbbf24;
        }
    }
`;

const ConfirmPanel = styled.div`
    padding: 18px 20px;
    border-radius: 16px;
    background: ${palette.surfaceAlt};
    border: 1px solid ${palette.softerBorder};
    margin-bottom: 22px;

    :root[data-theme="dark"] & {
        background: rgba(15, 23, 42, 0.6);
        border-color: rgba(148, 163, 184, 0.16);
    }
`;

const CheckboxLabel = styled.label<{ $checked: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    background: ${({ $checked }) => ($checked ? palette.chipBg : "transparent")};
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${({ $checked }) => ($checked ? palette.primaryStrong : palette.text)};
    cursor: pointer;
    transition: background 0.24s cubic-bezier(0.16, 1, 0.3, 1), color 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    input {
        width: 16px;
        height: 16px;
        accent-color: ${palette.primaryStrong};
        cursor: pointer;
    }

    :root[data-theme="dark"] & {
        background: ${({ $checked }) => ($checked ? "rgba(96, 165, 250, 0.14)" : "transparent")};
        color: ${({ $checked }) => ($checked ? "#93c5fd" : "#f1f5f9")};

        input {
            accent-color: #60a5fa;
        }
    }
`;

const HelperText = styled.p`
    margin: 10px 14px 0;
    font-size: 12.5px;
    line-height: 1.7;
    color: ${palette.textMuted};

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.42);
    }
`;

const ActionRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    @media (max-width: 640px) {
        flex-direction: column-reverse;
    }
`;

const GhostButton = styled.button`
    ${interactiveText};
    min-width: 104px;
    height: 46px;
    padding: 0 22px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 14px;
    background: #ffffff;
    color: rgba(15, 23, 42, 0.75);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: ${palette.chipBg};
        border-color: rgba(59, 130, 246, 0.22);
        color: ${palette.primaryStrong};
    }

    :root[data-theme="dark"] & {
        border-color: rgba(148, 163, 184, 0.22);
        background: #0f172a;
        color: rgba(226, 232, 240, 0.75);

        &:hover {
            background: rgba(96, 165, 250, 0.14);
            border-color: rgba(96, 165, 250, 0.28);
            color: #93c5fd;
        }
    }
`;

const DangerButton = styled.button.attrs({ "data-account-withdraw-danger-btn": "true" })<{ disabled?: boolean }>`
    &[data-account-withdraw-danger-btn="true"] {
        ${interactiveText};
        min-width: 148px;
        height: 46px;
        padding: 0 26px;
        border: none;
        border-radius: 14px;
        background: ${({ disabled }) => (disabled ? "rgba(148, 163, 184, 0.18)" : palette.danger)};
        color: ${({ disabled }) => (disabled ? "rgba(15, 23, 42, 0.4)" : "#ffffff")};
        font-size: 13px;
        font-weight: 700;
        letter-spacing: -0.01em;
        cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
        box-shadow: ${({ disabled }) => (disabled ? "none" : "0 12px 26px rgba(220, 38, 38, 0.22)")};
        transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    }

    &[data-account-withdraw-danger-btn="true"]:hover:not(:disabled) {
        background: ${palette.dangerHover};
        transform: translateY(-1px);
        box-shadow: 0 16px 32px rgba(220, 38, 38, 0.28);
    }

    &[data-account-withdraw-danger-btn="true"]:active:not(:disabled) {
        transform: translateY(0);
    }

    :root[data-theme="dark"] &[data-account-withdraw-danger-btn="true"] {
        background: ${({ disabled }) => (disabled ? "rgba(148, 163, 184, 0.18)" : "#f87171")};
        color: ${({ disabled }) => (disabled ? "rgba(226, 232, 240, 0.42)" : "#0f172a")};
        box-shadow: ${({ disabled }) => (disabled ? "none" : "0 12px 26px rgba(248, 113, 113, 0.24)")};
    }

    :root[data-theme="dark"] &[data-account-withdraw-danger-btn="true"]:hover:not(:disabled) {
        background: #ef4444;
        color: #ffffff;
        box-shadow: 0 16px 32px rgba(248, 113, 113, 0.32);
    }
`;
