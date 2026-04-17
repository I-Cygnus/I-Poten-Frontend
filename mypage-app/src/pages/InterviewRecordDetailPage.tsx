import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    FileText,
    ShieldCheck,
    Target,
    TrendingUp,
    Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getInterviewResultDetail } from "../api/InterviewApi.ts";
import { notifyError } from "../utils/toast.ts";

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
    pageBlue: "#f8fbff",
    pageMint: "#f8fffd",

    card: "rgba(255, 255, 255, 0.96)",
    border: "#e5e7eb",
    borderSoft: "#eef2f7",

    text: "#111827",
    textSoft: "#6b7280",
    textMuted: "#9aa4b2",

    primary: "#4F76F1",
    primaryBlue: "#4369e5",
    primaryStrong: "#3E63E0",
    primarySoft: "rgba(79, 118, 241, 0.10)",
    primaryRing: "rgba(62, 99, 224, 0.16)",

    secondary: "#2BC6A6",
    secondaryStrong: "#10b981",
    secondarySoft: "rgba(43, 198, 166, 0.12)",

    successBg: "#ecfdf5",
    successText: "#047857",

    warningBg: "#fffbeb",
    warningText: "#b45309",

    dangerBg: "#fef2f2",
    dangerText: "#dc2626",

    accentGradient: "linear-gradient(90deg, #3E82E8 0%, #2BC6A6 100%)",
    accentGradientSoft:
        "linear-gradient(135deg, rgba(79,118,241,0.10) 0%, rgba(43,198,166,0.12) 100%)",
};

type InterviewQuestionDetail = {
    id: number;
    order: number;
    question: string;
    answer: string;
    feedback: string;
    idealAnswer: string;
    score: number;
    keywords: string[];
};

type InterviewDetail = {
    id: number;
    title: string;
    role: string;
    status: string;
    createdAt: string;
    completedAt?: string;
    totalScore: number;
    durationMinutes: number;
    questionCount: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    techKeywords: string[];
    questions: InterviewQuestionDetail[];
};

const mockDetailMap: Record<number, InterviewDetail> = {
    1: {
        id: 1,
        title: "백엔드 실전 면접",
        role: "Backend",
        status: "분석 완료",
        createdAt: "2026.03.18",
        completedAt: "2026.03.18 21:40",
        totalScore: 84,
        durationMinutes: 27,
        questionCount: 3,
        summary:
            "전반적으로 핵심 개념을 안정적으로 설명했고, 실무 경험을 가정한 질문에도 논리적인 흐름을 유지했습니다. 다만 일부 답변에서는 구체적인 사례와 수치가 부족해 설득력이 조금 약해질 수 있었습니다.",
        strengths: [
            "질문 의도를 빠르게 파악하고 답변 구조를 안정적으로 가져갔습니다.",
            "백엔드 기본기와 API 설계 관점이 잘 드러났습니다.",
            "모르는 내용도 회피하지 않고 아는 범위 안에서 정리해 말한 점이 좋았습니다.",
        ],
        improvements: [
            "성능 개선이나 트러블슈팅 경험은 실제 사례 중심으로 조금 더 구체화하면 좋습니다.",
            "답변 말미에 결론을 한 번 더 정리하면 전달력이 높아집니다.",
            "기술 선택 이유와 대안 비교를 조금 더 명확하게 언급하면 좋습니다.",
        ],
        techKeywords: ["Java", "Spring Boot", "JPA", "MySQL", "REST API"],
        questions: [
            {
                id: 1,
                order: 1,
                question: "트랜잭션과 동시성 제어가 왜 중요한지 설명해 주세요.",
                answer:
                    "트랜잭션은 데이터의 일관성을 보장하기 위해 필요하고, 동시성 제어는 여러 사용자가 동시에 접근할 때 데이터 충돌을 막기 위해 필요하다고 답변했습니다.",
                feedback:
                    "핵심 정의는 잘 설명했지만, Dirty Read나 Lost Update 같은 실제 문제 상황을 함께 언급했으면 더 좋았을 답변입니다.",
                idealAnswer:
                    "트랜잭션은 데이터베이스 작업을 하나의 논리적 단위로 묶어 ACID 특성을 보장합니다. 동시성 제어는 다중 사용자 환경에서 Dirty Read, Non-repeatable Read, Lost Update 같은 문제를 방지하여 데이터 정합성을 유지하는 데 중요합니다.",
                score: 86,
                keywords: ["트랜잭션", "동시성 제어", "ACID"],
            },
            {
                id: 2,
                order: 2,
                question: "JPA를 사용할 때 N+1 문제가 발생하는 이유와 해결 방법은 무엇인가요?",
                answer:
                    "지연 로딩 환경에서 연관 엔티티를 반복 조회하면서 추가 쿼리가 계속 발생한다고 설명했고, fetch join으로 해결할 수 있다고 답변했습니다.",
                feedback:
                    "핵심은 잘 짚었습니다. 다만 EntityGraph, Batch Size, DTO 조회 전략까지 함께 언급했으면 더 높은 평가를 받을 수 있습니다.",
                idealAnswer:
                    "N+1 문제는 연관 엔티티를 조회할 때 예상보다 많은 추가 쿼리가 발생하는 현상입니다. 보통 지연 로딩과 반복 접근 패턴에서 발생하며, fetch join, EntityGraph, 배치 사이즈 조정, DTO 직접 조회 등으로 완화할 수 있습니다.",
                score: 89,
                keywords: ["JPA", "N+1", "Fetch Join"],
            },
            {
                id: 3,
                order: 3,
                question: "REST API 설계 시 가장 중요하게 보는 기준은 무엇인가요?",
                answer:
                    "일관된 URI 설계와 HTTP 메서드 사용, 그리고 프론트엔드가 이해하기 쉬운 응답 구조가 중요하다고 답변했습니다.",
                feedback:
                    "실무 감각이 보이는 답변이었습니다. 여기에 상태 코드, 예외 응답 표준화, 버전 관리 전략까지 덧붙이면 더 완성도가 높습니다.",
                idealAnswer:
                    "REST API 설계에서는 리소스 중심 URI, HTTP 메서드의 의미 보존, 일관된 응답 포맷, 적절한 상태 코드, 예외 처리 규칙, 확장 가능한 버전 전략이 중요합니다. 협업 효율과 유지보수성을 함께 고려해야 합니다.",
                score: 78,
                keywords: ["REST API", "HTTP", "응답 규약"],
            },
        ],
    },
    2: {
        id: 2,
        title: "CS 핵심 면접",
        role: "Computer Science",
        status: "피드백 확인 필요",
        createdAt: "2026.03.15",
        completedAt: "2026.03.15 19:10",
        totalScore: 78,
        durationMinutes: 24,
        questionCount: 2,
        summary:
            "핵심 CS 개념은 알고 있었지만, 답변 구조가 조금 흔들리는 구간이 있었습니다. 정의와 예시를 더 짝지어서 설명하면 전체 점수를 빠르게 끌어올릴 수 있습니다.",
        strengths: [
            "자료구조와 운영체제 기본 개념을 알고 있습니다.",
            "모르는 개념에서도 최대한 사고 과정을 설명하려는 태도가 좋았습니다.",
        ],
        improvements: [
            "답변 시작 시 정의를 짧게 먼저 제시하는 습관이 필요합니다.",
            "예시를 통한 설명이 부족해 추상적으로 들릴 수 있습니다.",
        ],
        techKeywords: ["운영체제", "네트워크", "자료구조"],
        questions: [
            {
                id: 1,
                order: 1,
                question: "프로세스와 스레드의 차이를 설명해 주세요.",
                answer:
                    "프로세스는 실행 중인 프로그램이고, 스레드는 그 안에서 실행되는 작업 단위라고 답변했습니다.",
                feedback:
                    "방향은 맞지만 메모리 구조 공유 여부와 컨텍스트 스위칭 비용을 함께 설명했으면 더 좋았습니다.",
                idealAnswer:
                    "프로세스는 독립된 메모리 공간을 가진 실행 단위이고, 스레드는 같은 프로세스 내에서 코드, 데이터, 힙을 공유하며 실행되는 흐름 단위입니다. 스레드는 자원 공유가 쉽지만 동기화 이슈가 발생할 수 있습니다.",
                score: 76,
                keywords: ["프로세스", "스레드", "메모리"],
            },
            {
                id: 2,
                order: 2,
                question: "TCP와 UDP의 차이를 설명해 주세요.",
                answer:
                    "TCP는 신뢰성이 있고 UDP는 빠르지만 신뢰성이 떨어진다고 답변했습니다.",
                feedback:
                    "핵심은 맞습니다. 연결 지향 여부, 흐름 제어, 재전송, 사용 사례를 함께 말하면 훨씬 완성도 있는 답변이 됩니다.",
                idealAnswer:
                    "TCP는 연결 지향 방식으로 신뢰성, 순서 보장, 흐름 제어, 혼잡 제어를 제공합니다. UDP는 비연결형으로 빠르고 단순하지만 패킷 전달 보장이나 순서 보장이 없습니다. 따라서 실시간 스트리밍, 게임 등에서는 UDP가, 정확한 전달이 필요한 경우 TCP가 자주 사용됩니다.",
                score: 80,
                keywords: ["TCP", "UDP", "신뢰성"],
            },
        ],
    },
};

function pickFirst<T>(...values: T[]): T | undefined {
    return values.find(
        (value) => value !== undefined && value !== null && value !== ("" as T)
    );
}

function normalizeStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === "string") return item.trim();
                if (item && typeof item === "object") {
                    const maybe =
                        (item as any).name ??
                        (item as any).label ??
                        (item as any).keyword ??
                        (item as any).value;
                    return typeof maybe === "string" ? maybe.trim() : "";
                }
                return "";
            })
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\n|,/g)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function normalizeQuestions(rawQuestions: any[]): InterviewQuestionDetail[] {
    if (!Array.isArray(rawQuestions)) return [];

    return rawQuestions.map((item, index) => ({
        id: Number(
            pickFirst(item?.id, item?.questionId, item?.resultId, index + 1) ?? index + 1
        ),
        order: Number(
            pickFirst(item?.order, item?.sequence, item?.questionOrder, index + 1) ??
            index + 1
        ),
        question: String(
            pickFirst(
                item?.question,
                item?.questionText,
                item?.interviewQuestion,
                item?.prompt,
                `질문 ${index + 1}`
            ) ?? `질문 ${index + 1}`
        ),
        answer: String(
            pickFirst(item?.answer, item?.userAnswer, item?.myAnswer, item?.reply, "") ?? ""
        ),
        feedback: String(
            pickFirst(
                item?.feedback,
                item?.comment,
                item?.analysis,
                item?.evaluation,
                ""
            ) ?? ""
        ),
        idealAnswer: String(
            pickFirst(
                item?.idealAnswer,
                item?.exampleAnswer,
                item?.recommendedAnswer,
                item?.sampleAnswer,
                ""
            ) ?? ""
        ),
        score: Number(
            pickFirst(item?.score, item?.questionScore, item?.rating, 0) ?? 0
        ),
        keywords: normalizeStringArray(
            pickFirst(item?.keywords, item?.keywordList, item?.tags, [])
        ),
    }));
}

function normalizeInterviewDetail(raw: any, interviewId: number): InterviewDetail {
    const source = raw?.result ?? raw?.data ?? raw ?? {};
    const rawQuestions =
        pickFirst(
            source?.questions,
            source?.questionResults,
            source?.questionList,
            source?.feedbackList,
            []
        ) ?? [];

    const questions = normalizeQuestions(rawQuestions);

    return {
        id: Number(
            pickFirst(
                source?.interviewId,
                source?.id,
                source?.resultId,
                interviewId
            ) ?? interviewId
        ),
        title: String(
            pickFirst(
                source?.title,
                source?.interviewTitle,
                source?.name,
                "AI 모의면접 결과"
            ) ?? "AI 모의면접 결과"
        ),
        role: String(
            pickFirst(
                source?.role,
                source?.interviewType,
                source?.jobRole,
                source?.category,
                "Interview"
            ) ?? "Interview"
        ),
        status: String(
            pickFirst(
                source?.status,
                source?.analysisStatus,
                source?.resultStatus,
                "분석 완료"
            ) ?? "분석 완료"
        ),
        createdAt: String(
            pickFirst(
                source?.createdAt,
                source?.date,
                source?.interviewDate,
                source?.requestedAt,
                "-"
            ) ?? "-"
        ),
        completedAt: String(
            pickFirst(source?.completedAt, source?.finishedAt, source?.updatedAt, "") ?? ""
        ),
        totalScore: Number(
            pickFirst(source?.totalScore, source?.score, source?.overallScore, 0) ?? 0
        ),
        durationMinutes: Number(
            pickFirst(
                source?.durationMinutes,
                source?.duration,
                source?.elapsedMinutes,
                0
            ) ?? 0
        ),
        questionCount:
            questions.length ||
            Number(
                pickFirst(source?.questionCount, source?.totalQuestionCount, 0) ?? 0
            ),
        summary: String(
            pickFirst(
                source?.summary,
                source?.overallFeedback,
                source?.resultSummary,
                "면접 분석 결과가 도착했습니다. 세부 피드백을 확인해 보세요."
            ) ?? "면접 분석 결과가 도착했습니다. 세부 피드백을 확인해 보세요."
        ),
        strengths: normalizeStringArray(
            pickFirst(source?.strengths, source?.goodPoints, source?.strongPoints, [])
        ),
        improvements: normalizeStringArray(
            pickFirst(source?.improvements, source?.weakPoints, source?.toImprove, [])
        ),
        techKeywords: normalizeStringArray(
            pickFirst(source?.techKeywords, source?.techStack, source?.stacks, [])
        ),
        questions,
    };
}

function getScoreTone(score: number) {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    return "caution";
}

export default function InterviewRecordDetailPage() {
    const navigate = useNavigate();
    const { interviewId } = useParams<{ interviewId: string }>();

    const numericInterviewId = Number(interviewId ?? 0);

    const [detail, setDetail] = useState<InterviewDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let mounted = true;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                setLoadError("");

                const normalized = await getInterviewResultDetail(numericInterviewId);

                if (mounted) {
                    setDetail(normalized);
                }
            } catch (error: any) {
                console.error(error);

                if (mounted) {
                    const isAuthError = error?.message?.includes("권한");
                    const msg = isAuthError
                        ? "접근 권한이 없습니다."
                        : "면접 결과를 불러오지 못했습니다.";
                    notifyError(msg);
                    setLoadError(msg);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        if (!numericInterviewId) {
            setLoading(false);
            setLoadError("잘못된 면접 기록입니다.");
            return;
        }

        fetchDetail();

        return () => {
            mounted = false;
        };
    }, [numericInterviewId]);

    const scoreTone = useMemo(
        () => getScoreTone(detail?.totalScore ?? 0),
        [detail?.totalScore]
    );

    if (loading) {
        return (
            <Page>
                <PageInner>
                    <LoadingCard>면접 결과를 불러오는 중입니다...</LoadingCard>
                </PageInner>
            </Page>
        );
    }

    if (loadError || !detail) {
        return (
            <Page>
                <PageInner>
                    <ErrorCard>
                        <ErrorTitle>상세 결과를 불러오지 못했어요.</ErrorTitle>
                        <ErrorText>{loadError || "잠시 후 다시 시도해 주세요."}</ErrorText>
                        <ActionRow>
                            <GhostButton type="button" onClick={() => navigate(-1)}>
                                이전으로
                            </GhostButton>
                            <PrimaryButton type="button" onClick={() => navigate("/mypage")}>
                                마이페이지로 이동
                            </PrimaryButton>
                        </ActionRow>
                    </ErrorCard>
                </PageInner>
            </Page>
        );
    }

    return (
        <Page>
            <PageInner>
                <TopBar>
                    <BackButton type="button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        목록으로 돌아가기
                    </BackButton>
                </TopBar>

                <HeroCard>
                    <HeroLeft>
                        <HeroBadge>INTERVIEW DETAIL</HeroBadge>
                        <HeroTitle>{detail.title}</HeroTitle>
                        <HeroDescription>{detail.summary}</HeroDescription>

                        <MetaRow>
                            <MetaChip>
                                <CalendarDays size={14} />
                                진행일 {detail.createdAt}
                            </MetaChip>
                            <MetaChip>
                                <Clock3 size={14} />
                                소요 시간 {detail.durationMinutes || "-"}분
                            </MetaChip>
                            <MetaChip>
                                <ShieldCheck size={14} />
                                상태 {detail.status}
                            </MetaChip>
                            <MetaChip>
                                <FileText size={14} />
                                질문 수 {detail.questionCount}개
                            </MetaChip>
                        </MetaRow>

                        {detail.techKeywords.length > 0 && (
                            <TagRow>
                                {detail.techKeywords.map((keyword) => (
                                    <Tag key={keyword}>{keyword}</Tag>
                                ))}
                            </TagRow>
                        )}
                    </HeroLeft>

                    <HeroScoreCard>
                        <ScoreLabel>종합 점수</ScoreLabel>
                        <ScoreValue>{detail.totalScore}</ScoreValue>
                        <ScoreUnit>점</ScoreUnit>
                        <ScoreState $tone={scoreTone}>
                            {scoreTone === "excellent"
                                ? "매우 안정적"
                                : scoreTone === "good"
                                    ? "양호"
                                    : "보완 필요"}
                        </ScoreState>
                    </HeroScoreCard>
                </HeroCard>

                <StatsGrid>
                    <StatCard>
                        <StatIconWrap>
                            <Target size={18} />
                        </StatIconWrap>
                        <StatContent>
                            <StatLabel>직무 분야</StatLabel>
                            <StatValue>{detail.role}</StatValue>
                            <StatSub>이번 면접의 주요 직무 기준</StatSub>
                        </StatContent>
                    </StatCard>

                    <StatCard>
                        <StatIconWrap>
                            <TrendingUp size={18} />
                        </StatIconWrap>
                        <StatContent>
                            <StatLabel>문항 평균</StatLabel>
                            <StatValue>
                                {detail.questionCount > 0 &&
                                detail.questions.some((item) => item.score > 0)
                                    ? Math.round(
                                        detail.questions.reduce((acc, item) => acc + item.score, 0) /
                                        detail.questionCount
                                    )
                                    : detail.totalScore}
                                점
                            </StatValue>
                            <StatSub>세부 문항 기준 평균 점수</StatSub>
                        </StatContent>
                    </StatCard>

                    <StatCard>
                        <StatIconWrap>
                            <Sparkles size={18} />
                        </StatIconWrap>
                        <StatContent>
                            <StatLabel>강점 개수</StatLabel>
                            <StatValue>{detail.strengths.length}개</StatValue>
                            <StatSub>면접에서 좋게 평가된 요소</StatSub>
                        </StatContent>
                    </StatCard>

                    <StatCard>
                        <StatIconWrap>
                            <FileText size={18} />
                        </StatIconWrap>
                        <StatContent>
                            <StatLabel>보완 포인트</StatLabel>
                            <StatValue>{detail.improvements.length}개</StatValue>
                            <StatSub>다음 면접 전 우선 점검 항목</StatSub>
                        </StatContent>
                    </StatCard>
                </StatsGrid>

                <SummaryGrid>
                    <SummaryCard>
                        <SummaryHeader>
                            <SummaryTitle>좋았던 점</SummaryTitle>
                            <SummaryBadge>STRONG POINTS</SummaryBadge>
                        </SummaryHeader>

                        <BulletList>
                            {detail.strengths.length > 0 ? (
                                detail.strengths.map((item, index) => (
                                    <li key={`${item}-${index}`}>{item}</li>
                                ))
                            ) : (
                                <EmptyText>아직 강점 분석 데이터가 없습니다.</EmptyText>
                            )}
                        </BulletList>
                    </SummaryCard>

                    <SummaryCard>
                        <SummaryHeader>
                            <SummaryTitle>보완하면 좋은 점</SummaryTitle>
                            <SummaryBadge $variant="mint">IMPROVEMENTS</SummaryBadge>
                        </SummaryHeader>

                        <BulletList>
                            {detail.improvements.length > 0 ? (
                                detail.improvements.map((item, index) => (
                                    <li key={`${item}-${index}`}>{item}</li>
                                ))
                            ) : (
                                <EmptyText>아직 보완 포인트 데이터가 없습니다.</EmptyText>
                            )}
                        </BulletList>
                    </SummaryCard>
                </SummaryGrid>

                <SectionCard>
                    <SectionHead>
                        <div>
                            <SectionEyebrow>QUESTION ANALYSIS</SectionEyebrow>
                            <SectionTitle>문항별 상세 분석</SectionTitle>
                            <SectionDesc>
                                실제 답변과 피드백을 바탕으로 보완할 점과 답변 방향을 함께 확인할 수 있습니다.
                            </SectionDesc>
                        </div>
                    </SectionHead>

                    <QuestionList>
                        {detail.questions.length > 0 ? (
                            detail.questions.map((question) => (
                                <QuestionCard key={question.id}>
                                    <QuestionTop>
                                        <QuestionOrder>Q{question.order}</QuestionOrder>
                                        {/*<QuestionScore $tone={getScoreTone(question.score)}>*/}
                                        {/*    {question.score}점*/}
                                        {/*</QuestionScore>*/}
                                    </QuestionTop>

                                    <QuestionTitle>{question.question}</QuestionTitle>

                                    {question.keywords.length > 0 && (
                                        <TagRow style={{ marginTop: 0 }}>
                                            {question.keywords.map((keyword) => (
                                                <Tag key={`${question.id}-${keyword}`}>{keyword}</Tag>
                                            ))}
                                        </TagRow>
                                    )}

                                    <AnswerGrid>
                                        <AnswerBox>
                                            <AnswerLabel>내 답변</AnswerLabel>
                                            <AnswerText>
                                                {question.answer || "저장된 답변 데이터가 없습니다."}
                                            </AnswerText>
                                        </AnswerBox>

                                        <AnswerBox>
                                            <AnswerLabel>AI 피드백</AnswerLabel>
                                            <AnswerText>
                                                {question.feedback || "피드백 데이터가 없습니다."}
                                            </AnswerText>
                                        </AnswerBox>
                                    </AnswerGrid>

                                    {question.idealAnswer && (
                                        <RecommendedBox>
                                            <RecommendedLabel>보완된 답변 방향</RecommendedLabel>
                                            <RecommendedText>{question.idealAnswer}</RecommendedText>
                                        </RecommendedBox>
                                    )}
                                </QuestionCard>
                            ))
                        ) : (
                            <EmptyPanel>세부 문항 분석 데이터가 아직 없습니다.</EmptyPanel>
                        )}
                    </QuestionList>
                </SectionCard>

                <BottomActionBar>
                    <GhostButton type="button" onClick={() => navigate(-1)}>
                        목록으로 돌아가기
                    </GhostButton>
                    <PrimaryButton type="button">다시 면접 연습하기</PrimaryButton>
                </BottomActionBar>
            </PageInner>
        </Page>
    );
}

const Page = styled.div`
  ${pretendard};
  min-height: 100vh;
  background: transparent;
  padding: 32px;
  box-sizing: border-box;
  color: ${palette.text};

  * {
    box-sizing: border-box;
  }

  button,
  input,
  textarea,
  select {
    ${interactiveText};
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const PageInner = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const BackButton = styled.button`
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${palette.border};
  background: #ffffff;
  color: #334155;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;

  &:hover {
    background: #f8fafc;
    transform: translateY(-1px);
  }
`;

const HeroCard = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 18px;
  align-items: stretch;
  padding: 26px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(14, 18, 28, 0.06);
  box-shadow: 0 8px 20px rgba(30, 41, 59, 0.05);

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

const HeroLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeroBadge = styled.div`
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  background: ${palette.primarySoft};
  color: ${palette.primaryStrong};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.04em;
  color: #0f172a;
`;

const HeroDescription = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.75;
  color: ${palette.textSoft};
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const MetaChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid ${palette.borderSoft};
  color: #475569;
  font-size: 13px;
  font-weight: 700;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(79, 118, 241, 0.08);
  color: ${palette.primaryStrong};
  font-size: 13px;
  font-weight: 700;
`;

const HeroScoreCard = styled.div`
  border-radius: 20px;
  background: ${palette.accentGradientSoft};
  border: 1px solid rgba(79, 118, 241, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px;
`;

const ScoreLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
`;

const ScoreValue = styled.div`
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  color: #0f172a;
`;

const ScoreUnit = styled.div`
  margin-top: -4px;
  font-size: 13px;
  color: #64748b;
`;

const ScoreState = styled.div<{ $tone: "excellent" | "good" | "caution" }>`
  margin-top: 6px;
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  ${({ $tone }) =>
    $tone === "excellent"
        ? css`
          background: ${palette.successBg};
          color: ${palette.successText};
        `
        : $tone === "good"
            ? css`
          background: ${palette.primarySoft};
          color: ${palette.primaryStrong};
        `
            : css`
          background: ${palette.warningBg};
          color: ${palette.warningText};
        `}
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  border-radius: 18px;
  padding: 18px;
  background: #ffffff;
  border: 1px solid ${palette.border};
  box-shadow: 0 6px 16px rgba(30, 41, 59, 0.04);
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const StatIconWrap = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: ${palette.primarySoft};
  color: ${palette.primaryStrong};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: #0f172a;
`;

const StatSub = styled.div`
  font-size: 13px;
  line-height: 1.55;
  color: ${palette.textMuted};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  border-radius: 20px;
  padding: 22px;
  background: #ffffff;
  border: 1px solid ${palette.border};
  box-shadow: 0 6px 16px rgba(30, 41, 59, 0.04);
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const SummaryTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0f172a;
`;

const SummaryBadge = styled.div<{ $variant?: "mint" }>`
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  ${({ $variant }) =>
    $variant === "mint"
        ? css`
          background: rgba(43, 198, 166, 0.12);
          color: ${palette.secondaryStrong};
        `
        : css`
          background: ${palette.primarySoft};
          color: ${palette.primaryStrong};
        `}
`;

const BulletList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;

  li {
    position: relative;
    padding: 14px 14px 14px 38px;
    border-radius: 14px;
    background: #f8fafc;
    border: 1px solid ${palette.borderSoft};
    font-size: 14px;
    line-height: 1.7;
    color: #334155;
  }

  li::before {
    content: "";
    position: absolute;
    left: 16px;
    top: 20px;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${palette.primary};
  }
`;

const EmptyText = styled.div`
  font-size: 14px;
  line-height: 1.7;
  color: ${palette.textMuted};
`;

const SectionCard = styled.section`
  border-radius: 24px;
  padding: 24px;
  background: #ffffff;
  border: 1px solid ${palette.border};
  box-shadow: 0 8px 20px rgba(30, 41, 59, 0.04);
`;

const SectionHead = styled.div`
  margin-bottom: 18px;
`;

const SectionEyebrow = styled.div`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: ${palette.primaryStrong};
  margin-bottom: 8px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.04em;
  color: #0f172a;
`;

const SectionDesc = styled.p`
  margin: 10px 0 0;
  font-size: 15px;
  line-height: 1.7;
  color: ${palette.textSoft};
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QuestionCard = styled.article`
  border-radius: 18px;
  padding: 20px;
  background: #fbfcff;
  border: 1px solid ${palette.borderSoft};
`;

const QuestionTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`;

const QuestionOrder = styled.div`
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: ${palette.primaryStrong};
`;

const QuestionScore = styled.div<{ $tone: "excellent" | "good" | "caution" }>`
  min-width: 74px;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;

  ${({ $tone }) =>
    $tone === "excellent"
        ? css`
          background: ${palette.successBg};
          color: ${palette.successText};
        `
        : $tone === "good"
            ? css`
          background: ${palette.primarySoft};
          color: ${palette.primaryStrong};
        `
            : css`
          background: ${palette.warningBg};
          color: ${palette.warningText};
        `}
`;

const QuestionTitle = styled.h3`
  margin: 0 0 14px;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.5;
  letter-spacing: -0.03em;
  color: #0f172a;
`;

const AnswerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 12px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const AnswerBox = styled.div`
  border-radius: 16px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid ${palette.border};
`;

const AnswerLabel = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${palette.primaryStrong};
  margin-bottom: 10px;
`;

const AnswerText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #334155;
`;

const RecommendedBox = styled.div`
  margin-top: 14px;
  border-radius: 16px;
  padding: 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #f8fffd 100%);
  border: 1px solid rgba(79, 118, 241, 0.14);
`;

const RecommendedLabel = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${palette.secondaryStrong};
  margin-bottom: 10px;
`;

const RecommendedText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #334155;
`;

const EmptyPanel = styled.div`
  border-radius: 16px;
  padding: 20px;
  background: #f8fafc;
  border: 1px dashed ${palette.border};
  font-size: 14px;
  color: ${palette.textSoft};
`;

const BottomActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
  }
`;

const PrimaryButton = styled.button`
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 12px;
  background: ${palette.accentGradient};
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(62, 99, 224, 0.16);
  }
`;

const GhostButton = styled.button`
  height: 44px;
  padding: 0 16px;
  border: 1px solid ${palette.border};
  border-radius: 12px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;

  &:hover {
    background: #f8fafc;
    transform: translateY(-1px);
  }
`;

const LoadingCard = styled.div`
  min-height: 320px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid ${palette.border};
  box-shadow: 0 8px 20px rgba(30, 41, 59, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${palette.textSoft};
  font-size: 15px;
  font-weight: 600;
`;

const ErrorCard = styled.div`
  min-height: 320px;
  border-radius: 24px;
  padding: 28px;
  background: #ffffff;
  border: 1px solid ${palette.border};
  box-shadow: 0 8px 20px rgba(30, 41, 59, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ErrorTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
`;

const ErrorText = styled.p`
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.7;
  color: ${palette.textSoft};
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
  }
`;
