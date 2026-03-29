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
    border: "#e5e7eb",
    text: "#111827",
    textSoft: "#6b7280",
    primaryStrong: "#3E63E0",
    primarySoft: "rgba(79, 118, 241, 0.10)",
    warning: "#f59e0b",
    warningSoft: "rgba(245, 158, 11, 0.10)",
    warningBorder: "rgba(245, 158, 11, 0.18)",
    warningText: "#9a6b16",
    danger: "#ef4444",
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
            <SectionHeader>
                <div>
                    <SectionEyebrow>WITHDRAW</SectionEyebrow>
                    <SectionTitle>회원 탈퇴</SectionTitle>
                    <SectionDescription>
                        삭제되는 항목과 복구 불가 내용을 확인한 뒤 진행해 주세요.
                    </SectionDescription>
                </div>
            </SectionHeader>

            <WithdrawHero>
                <WithdrawHeroIcon>
                    <LogOut size={24} />
                </WithdrawHeroIcon>

                <WithdrawHeroContent>
                    <WithdrawHeroBadge>WITHDRAW GUIDE</WithdrawHeroBadge>
                    <WithdrawHeroTitle>탈퇴 시 삭제되는 항목을 확인해 주세요.</WithdrawHeroTitle>
                    <WithdrawHeroDesc>
                        회원 탈퇴를 진행하면 학습 기록, AI 모의 면접 기록, 계정 설정 정보가 함께 정리됩니다.
                    </WithdrawHeroDesc>
                </WithdrawHeroContent>
            </WithdrawHero>

            <WithdrawInfoGrid>
                <WithdrawMiniCard>
                    <WithdrawMiniHead>
                        <WithdrawMiniIcon>
                            <FileText size={18} />
                        </WithdrawMiniIcon>
                        <WithdrawMiniTitle>학습 기록</WithdrawMiniTitle>
                    </WithdrawMiniHead>
                    <WithdrawMiniDesc>
                        퀴즈 풀이 기록, 학습 이력, 오답노트 관련 데이터가 삭제되거나 복구되지 않을 수 있어요.
                    </WithdrawMiniDesc>
                </WithdrawMiniCard>

                <WithdrawMiniCard>
                    <WithdrawMiniHead>
                        <WithdrawMiniIcon>
                            <Clock3 size={18} />
                        </WithdrawMiniIcon>
                        <WithdrawMiniTitle>AI 모의 면접 기록</WithdrawMiniTitle>
                    </WithdrawMiniHead>
                    <WithdrawMiniDesc>
                        AI 모의 면접 결과와 피드백, 진행 히스토리도 함께 정리될 수 있으니 필요한 내용은 미리 확인해 주세요.
                    </WithdrawMiniDesc>
                </WithdrawMiniCard>

                <WithdrawMiniCard>
                    <WithdrawMiniHead>
                        <WithdrawMiniIcon>
                            <Settings size={18} />
                        </WithdrawMiniIcon>
                        <WithdrawMiniTitle>계정 설정</WithdrawMiniTitle>
                    </WithdrawMiniHead>
                    <WithdrawMiniDesc>
                        알림 설정, 관심 분야, 개인화 추천 정보도 초기화되며 일부 정보는 다시 복원되지 않을 수 있어요.
                    </WithdrawMiniDesc>
                </WithdrawMiniCard>
            </WithdrawInfoGrid>

            <DangerCard>
                <DangerTop>
                    <DangerIconWrap>
                        <LogOut size={22} />
                    </DangerIconWrap>

                    <DangerTopText>
                        <DangerTitle>최종 확인</DangerTitle>
                        <DangerLead>
                            아래 세 가지를 확인했다면 회원 탈퇴를 진행해 주세요.
                        </DangerLead>
                    </DangerTopText>
                </DangerTop>

                <DangerList>
                    <li>학습 기록과 AI 모의 면접 기록은 삭제 후 복구할 수 없습니다.</li>
                    <li>계정 설정과 개인화 정보도 함께 초기화됩니다.</li>
                    <li>구독 또는 결제 이력이 있다면 먼저 확인이 필요합니다.</li>
                    <li>회원 탈퇴 후 30일 동안 동일한 계정으로 재가입이 제한됩니다.</li>
                </DangerList>

                <WithdrawConfirmPanel>
                    <DangerCheckbox>
                        <input
                            type="checkbox"
                            id="withdraw-check"
                            checked={withdrawAgreed}
                            onChange={(event) => setWithdrawAgreed(event.target.checked)}
                        />
                        <label htmlFor="withdraw-check">안내 내용을 모두 확인했고 회원 탈퇴에 동의합니다.</label>
                    </DangerCheckbox>

                    <WithdrawHelperText>
                        탈퇴 버튼을 누르면 현재 세션이 즉시 종료되며, 30일 동안 동일한 계정으로 재가입이 제한됩니다.
                    </WithdrawHelperText>
                </WithdrawConfirmPanel>

                <DangerActionRow>
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
                </DangerActionRow>
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
    padding: 40px 24px 56px;
    display: flex;
    flex-direction: column;
    gap: 24px;

    @media (max-width: 768px) {
        padding: 28px 16px 40px;
    }
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
`;

const SectionEyebrow = styled.div`
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: ${palette.primaryStrong};
`;

const SectionTitle = styled.h2`
    margin: 8px 0 0;
    font-size: 30px;
    line-height: 1.2;
    letter-spacing: -0.03em;
    color: ${palette.text};
`;

const SectionDescription = styled.p`
    margin: 12px 0 0;
    font-size: 15px;
    line-height: 1.75;
    color: ${palette.textSoft};
`;

const WithdrawHero = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 18px;
    padding: 24px;
    border-radius: 20px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
    border: 1px solid ${palette.border};
    box-shadow: 0 6px 16px rgba(30, 41, 59, 0.05);

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const WithdrawHeroIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const WithdrawHeroContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const WithdrawHeroBadge = styled.div`
    width: fit-content;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
`;

const WithdrawHeroTitle = styled.h3`
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: -0.03em;
    color: ${palette.text};
`;

const WithdrawHeroDesc = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: ${palette.textSoft};
`;

const WithdrawInfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const WithdrawMiniCard = styled.div`
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid ${palette.border};
    box-shadow: 0 6px 16px rgba(30, 41, 59, 0.04);
    padding: 20px;
`;

const WithdrawMiniHead = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
`;

const WithdrawMiniIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const WithdrawMiniTitle = styled.div`
    font-size: 16px;
    font-weight: 750;
    letter-spacing: -0.02em;
    color: ${palette.text};
`;

const WithdrawMiniDesc = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: ${palette.textSoft};
`;

const DangerCard = styled.div`
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #ffffff 0%, #fffdf8 100%);
    border: 1px solid ${palette.border};
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 10px 24px rgba(30, 41, 59, 0.06);

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #f8c15c 0%, #f59e0b 40%, #ef4444 100%);
        opacity: 0.9;
    }
`;

const DangerTop = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 22px;
`;

const DangerIconWrap = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: ${palette.warningSoft};
    color: ${palette.warning};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const DangerTopText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const DangerTitle = styled.h3`
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.35;
    color: ${palette.text};
`;

const DangerLead = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: ${palette.textSoft};
`;

const DangerList = styled.ul`
    list-style: none;
    margin: 0 0 20px;
    padding: 0;
    display: grid;
    gap: 10px;

    li {
        position: relative;
        padding: 14px 16px 14px 42px;
        border-radius: 14px;
        background: #fffaf0;
        border: 1px solid ${palette.warningBorder};
        color: ${palette.warningText};
        font-size: 14px;
        line-height: 1.65;
    }

    li::before {
        content: "!";
        position: absolute;
        left: 16px;
        top: 13px;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: ${palette.warningSoft};
        color: ${palette.warning};
        font-size: 12px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

const WithdrawConfirmPanel = styled.div`
    padding: 18px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid ${palette.border};
    margin-bottom: 20px;
`;

const DangerCheckbox = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    line-height: 1.5;
    color: #334155;

    input {
        width: 16px;
        height: 16px;
        accent-color: ${palette.primaryStrong};
        cursor: pointer;
    }

    label {
        cursor: pointer;
        font-weight: 600;
    }
`;

const WithdrawHelperText = styled.p`
    margin: 12px 0 0;
    font-size: 13px;
    line-height: 1.7;
    color: ${palette.textSoft};
`;

const DangerActionRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    @media (max-width: 640px) {
        flex-direction: column-reverse;
    }
`;

const GhostButton = styled.button`
    ${interactiveText};
    height: 44px;
    padding: 0 16px;
    border-radius: 12px;
    border: 1px solid ${palette.border};
    background: #ffffff;
    color: ${palette.text};
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        border-color: #d1d5db;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
    }
`;

const DangerButton = styled.button<{ disabled?: boolean }>`
    ${interactiveText};
    height: 44px;
    padding: 0 16px;
    border: none;
    border-radius: 12px;
    background: ${({ disabled }) => (disabled ? "#fca5a5" : palette.danger)};
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

    &:hover {
        transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")};
        background: ${({ disabled }) => (disabled ? "#fca5a5" : "#dc2626")};
        box-shadow: ${({ disabled }) => (disabled ? "none" : "0 10px 20px rgba(239, 68, 68, 0.14)")};
    }
`;
