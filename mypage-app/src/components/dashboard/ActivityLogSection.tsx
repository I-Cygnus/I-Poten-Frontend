import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
// API imports removed - using mock data
type AttendanceRateResponse = {
    attendanceRate: number;
    attended: number;
    totalDays: number;
};

type QuizCompletionResponse = {
    quizTotalCount: number;
    quizMonthlyCount: number;
};

type WritingCountResponse = {
    studyroomCount: number;
};

type InterviewCompletionResponse = {
    interviewTotal: number;
    interviewMonthly: number;
};

type TrustScoreResponse = {
    attendanceRate: number;
    attendanceScore: number;
    interviewScore: number;
    problemScore: number;
    studyroomScore: number;
    totalScore: number;
    calculatedAt: string;
};
import { notifyError } from "../../utils/toast";
import TrustScoreModal from "../modals/TrustScoreModal.tsx";

/* ================== 색상 팔레트 ================== */
const palette = {
    primary: "#4CC4A8",
    accent: "#3AB49A",
    lightBG: "#F8FBF8",
    border: "rgba(76,196,168,0.35)",
    shadow: "rgba(76,196,168,0.22)",
    textMain: "#0F172A",
    textSub: "#64748B",
};

const COLORS = [palette.primary, "rgb(229,231,235)"];

/* ================== 애니메이션 ================== */
const fadeUp = keyframes`
    from { opacity: 0; margin-top: 16px; }
    to { opacity: 1; margin-top: 0; }
`;

/* ================== 도넛 데이터 생성 ================== */
const makeDonutData = (percent: number) => [
    { name: "progress", value: percent },
    { name: "remain", value: 100 - percent },
];

/* ================== 도넛 차트 컴포넌트 ================== */
function DonutChart({
                        value,
                        label,
                        unit,
                        onDetailClick,
                    }: {
    value: number;
    label: string;
    unit: string;
    onDetailClick?: () => void;
}) {
    const percent = Math.min(100, value);
    const isPrimary = label === "활동 점수";

    return (
        <DonutCard isPrimary={isPrimary}>
            <DonutLabelTop>{label}</DonutLabelTop>

            <ChartWrapper>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={makeDonutData(percent)}
                            innerRadius={40}
                            outerRadius={55}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                        >
                            <Cell fill={COLORS[0]} />
                            <Cell fill={COLORS[1]} />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <CenterText>
                    <p>
                        {unit === "%" ? value.toFixed(1) : Math.round(value)}
                        {unit}
                    </p>
                </CenterText>
            </ChartWrapper>

            {isPrimary && <DetailButton onClick={onDetailClick}>자세히 보기</DetailButton>}
        </DonutCard>
    );
}

/* ================== 메인 컴포넌트 ================== */
export default function ActivityLogSection() {
    const [attendance, setAttendance] = useState<AttendanceRateResponse | null>(null);
    const [quiz, setQuiz] = useState<QuizCompletionResponse | null>(null);
    const [writing, setWriting] = useState<WritingCountResponse | null>(null);
    const [interview, setInterview] = useState<InterviewCompletionResponse | null>(null);
    const [trust, setTrust] = useState<TrustScoreResponse | null>(null);

    const [trustModalOpen, setTrustModalOpen] = useState(false);

    /* ---------- 데이터 로드 (Mock) ---------- */
    useEffect(() => {
        // Mock data for UI display
        setAttendance({
            attendanceRate: 85.5,
            attended: 20,
            totalDays: 30
        });
        setQuiz({
            quizTotalCount: 45,
            quizMonthlyCount: 12
        });
        setWriting({
            studyroomCount: 8
        });
        setInterview({
            interviewTotal: 15,
            interviewMonthly: 3
        });
        setTrust({
            attendanceRate: 85.5,
            attendanceScore: 34,
            interviewScore: 20,
            problemScore: 18,
            studyroomScore: 8,
            totalScore: 80,
            calculatedAt: new Date().toISOString()
        });
    }, []);

    if (!attendance || !interview || !quiz || !writing || !trust)
        return <LoadingText>불러오는 중...</LoadingText>;

    /* ---------- 렌더링 ---------- */
    return (
        <>
            {/* 상단 카드 요약 */}
            <TopCardGrid>
                <TopCard>
                    <p>이번 달 출석</p>
                    <strong>
                        {attendance.attended}/{attendance.totalDays}일
                    </strong>
                </TopCard>
                <TopCard>
                    <p>총 모의면접</p>
                    <strong>{interview.interviewTotal}회</strong>
                </TopCard>
                <TopCard>
                    <p>총 문제풀이</p>
                    <strong>{quiz.quizTotalCount}개</strong>
                </TopCard>
                <TopCard> {/* ✅ ActivityItem → TopCard 통일 */}
                    <p>총 글 작성</p>
                    <strong>{writing?.studyroomCount ?? 0}개</strong>
                </TopCard>
            </TopCardGrid>

            {/* 도넛 차트 섹션 */}
            <DonutGrid>
                <DonutChart value={attendance.attendanceRate} label="이번 달 출석률" unit="%" />
                <DonutChart value={interview.interviewMonthly} label="이번 달 모의면접" unit="회" />
                <DonutChart value={quiz.quizMonthlyCount} label="이번 달 문제풀이" unit="개" />
                <DonutChart
                    value={trust.totalScore}
                    label="활동 점수"
                    unit="점"
                    onDetailClick={() => setTrustModalOpen(true)}
                />
            </DonutGrid>

            {/* 모달 */}
            <TrustScoreModal
                isOpen={trustModalOpen}
                onClose={() => setTrustModalOpen(false)}
                trustScore={trust}
                trustStatus={trust ? "loaded" : "empty"}
            />
        </>
    );
}

/* ================== 스타일 ================== */

const LoadingText = styled.p`
    font-size: 15px;
    color: ${palette.textSub};
    text-align: center;
    margin-top: 40px;
`;

const TopCardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const TopCard = styled.div`
    background: white;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    border-top: 4px solid ${palette.border};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-3px);
    }

    p {
        font-size: 0.95rem;
        color: ${palette.textSub};
    }
    strong {
        font-size: 18px;
        color: ${palette.textMain};
    }
`;

const DetailButton = styled.button`
    margin-top: 6px;
    padding: 5px 11px;
    border-radius: 100px;
    background: linear-gradient(90deg, #43d0b2, #25a58b);
    color: white;
    font-weight: 500;
    font-size: 0.78rem;
    border: none;
    letter-spacing: 0.1px;
    box-shadow: 0 1px 3px rgba(76, 196, 168, 0.25);
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
        transform: translateY(-1px);
        filter: brightness(1.06);
        box-shadow: 0 2px 6px rgba(76, 196, 168, 0.3);
    }

    &:active {
        transform: scale(0.98);
    }
`;

const DonutGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const DonutCard = styled.div<{ isPrimary?: boolean }>`
    padding: 20px 10px 16px;
    background: ${({ isPrimary }) =>
            isPrimary
                    ? `linear-gradient(180deg, rgba(16,185,129,0.04), rgba(59,130,246,0.05))`
                    : "white"};
    border: ${({ isPrimary }) =>
            isPrimary ? `1.5px solid ${palette.primary}` : "1px solid #E5E7EB"};
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    text-align: center;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-3px);
    }
`;

const DonutLabelTop = styled.p`
    font-size: 0.95rem;
    color: ${palette.textSub};
    margin-bottom: 12px;
    text-align: center;
`;

const ChartWrapper = styled.div`
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto;
`;

const CenterText = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;

    p {
        font-size: 22px;
        font-weight: 700;
        color: ${palette.textMain};
        margin: 0;
        line-height: 1;
    }
`;
