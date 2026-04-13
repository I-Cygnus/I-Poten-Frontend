import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError, getActiveSurvey, submitActiveSurvey } from "../api/api.ts";
import scale1Icon from "../../assets/survey/scale/scale-1-very-bad.png";
import scale2Icon from "../../assets/survey/scale/scale-2-bad.png";
import scale3Icon from "../../assets/survey/scale/scale-3-neutral.png";
import scale4Icon from "../../assets/survey/scale/scale-4-good.png";
import scale5Icon from "../../assets/survey/scale/scale-5-great.png";
import type {
    GetActiveSurveyResponse,
    SubmitSurveyAnswerRequest,
    SurveyQuestion,
} from "../api/types.ts";

type AnswerState = {
    selectedOptionCode?: string;
    scaleValue?: number;
    textAnswer?: string;
};

type AnswerMap = Record<string, AnswerState>;
type ValidationMap = Record<string, string>;

const goToAccountLogin = (redirect?: string) => {
    const target = redirect?.trim() || "/";
    const encodedRedirect = encodeURIComponent(target);
    window.location.assign(`/vue-account/account/login?redirect=${encodedRedirect}`);
};

const UI = {
    panelBgSoft: "#f4f8ff",
    panelLineSoft: "#d9e6ff",
    text: "#0f172a",
    sub: "#6b7280",
    primaryBlue: "#4369e5",
    arrow: "#c3d6ff",
    arrowHover: "#8fb2ff",
    radiusXXL: "24px",
    shadowSoft: "0 10px 30px rgba(67,105,229,.10)",

    font: {
        family:
            "'Pretendard Variable', Pretendard, 'SUIT Variable', SUIT, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Segoe UI', sans-serif",
    },

    color: {
        quizHover: "#2c73e5",
        primaryStrong: "#3E63E0",
        indigo50: "#EEF2FF",
        primary: "#4F76F1",
        primarySoft: "#e6edff",
        success: "#22c55e",
        successSoft: "#ecfdf3",
        danger: "#e15693",
        dangerSoft: "#fff1f7",
        info: "#3b82f6",
        infoSoft: "#eff6ff",
    },

    gradient: {
        hero: "linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)",
        cta: "linear-gradient(90deg, #3E82E8 0%, #2BC6A6 100%)",
    },
};

function normalizeText(value?: string) {
    const trimmed = (value ?? "").trim();
    return trimmed.length > 0 ? trimmed : "";
}

function isAnswered(question: SurveyQuestion, answer?: AnswerState) {
    if (!answer) return false;

    if (question.type === "SINGLE_CHOICE") {
        return !!answer.selectedOptionCode;
    }

    if (question.type === "LINEAR_SCALE") {
        return typeof answer.scaleValue === "number";
    }

    if (question.type === "LONG_TEXT") {
        return normalizeText(answer.textAnswer).length > 0;
    }

    return false;
}

function getFivePointScaleMeta(value: number) {
    const meta: Record<number, { meaning: string; iconSrc: string }> = {
        1: {
            meaning: "전혀 만족하지 않음",
            iconSrc: scale1Icon,
        },
        2: {
            meaning: "별로 만족하지 않음",
            iconSrc: scale2Icon,
        },
        3: {
            meaning: "보통이다",
            iconSrc: scale3Icon,
        },
        4: {
            meaning: "대체로 만족한다",
            iconSrc: scale4Icon,
        },
        5: {
            meaning: "매우 만족함",
            iconSrc: scale5Icon,
        },
    };

    return meta[value] ?? { meaning: "", iconSrc: "" };
}

function getScaleMeta(question: SurveyQuestion, value: number) {
    if (!question.scale) {
        return { meaning: "", iconSrc: "" };
    }

    const { min, max } = question.scale;

    if (min === 1 && max === 5) {
        return getFivePointScaleMeta(value);
    }

    return { meaning: "", iconSrc: "" };
}

export default function ReviewSurveyPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [survey, setSurvey] = useState<GetActiveSurveyResponse | null>(null);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [validationErrors, setValidationErrors] = useState<ValidationMap>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitCompleteModalOpen, setSubmitCompleteModalOpen] = useState(false);

    const openSubmitCompleteModal = () => {
        setSubmitCompleteModalOpen(true);
    };

    const closeSubmitCompleteModal = () => {
        setSubmitCompleteModalOpen(false);
        navigate("/");
    };
    const [pageError, setPageError] = useState("");
    const [authRequired, setAuthRequired] = useState(false);

    const heroRef = useRef<HTMLElement | null>(null);
    const [showStickyProgress, setShowStickyProgress] = useState(false);

    useEffect(() => {
        if (loading) return;

        setShowStickyProgress(false);

        const heroElement = heroRef.current;
        if (!heroElement) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowStickyProgress(!entry.isIntersecting);
            },
            {
                threshold: 0.15,
            }
        );

        observer.observe(heroElement);

        return () => {
            observer.disconnect();
        };
    }, [loading]);

    useEffect(() => {
        let active = true;

        const fetchSurvey = async () => {
            setLoading(true);
            setPageError("");
            setAuthRequired(false);

            try {
                const data = await getActiveSurvey();
                if (!active) return;
                setSurvey(data);
            } catch (error) {
                if (!active) return;

                if (error instanceof ApiError) {
                    if (error.status === 401) {
                        setAuthRequired(true);
                    } else {
                        setPageError(error.message);
                    }
                } else {
                    setPageError("설문 정보를 불러오는 중 오류가 발생했습니다.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchSurvey();

        return () => {
            active = false;
        };
    }, []);

    type NoticeModalState = {
        open: boolean;
        title: string;
        message: string;
        tone: "warning" | "info";
        goBackOnClose: boolean;
    };

    const [noticeModal, setNoticeModal] = useState<NoticeModalState>({
        open: false,
        title: "",
        message: "",
        tone: "info",
        goBackOnClose: false,
    });

    const openNoticeModal = (
        title: string,
        message: string,
        tone: "warning" | "info" = "info",
        goBackOnClose = false
    ) => {
        setNoticeModal({
            open: true,
            title,
            message,
            tone,
            goBackOnClose,
        });
    };

    const closeNoticeModal = () => {
        const shouldGoBack = noticeModal.goBackOnClose;

        setNoticeModal((prev) => ({
            ...prev,
            open: false,
            goBackOnClose: false,
        }));

        if (shouldGoBack) {
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                navigate("/");
            }
        }
    };

    type ExitConfirmModalState = {
        open: boolean;
    };

    const [exitConfirmModal, setExitConfirmModal] = useState<ExitConfirmModalState>({
        open: false,
    });

    const openExitConfirmModal = () => {
        setExitConfirmModal({ open: true });
    };

    const closeExitConfirmModal = () => {
        setExitConfirmModal({ open: false });
    };

    useEffect(() => {
        if (!noticeModal.open && !exitConfirmModal.open && !submitCompleteModalOpen) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = prev;
        };
    }, [noticeModal.open, exitConfirmModal.open, submitCompleteModalOpen]);

    const progress = useMemo(() => {
        if (!survey || survey.questions.length === 0) return 0;

        const answeredCount = survey.questions.filter((question) =>
            isAnswered(question, answers[question.code])
        ).length;

        return Math.round((answeredCount / survey.questions.length) * 100);
    }, [survey, answers]);

    const answeredCount = useMemo(() => {
        if (!survey || survey.questions.length === 0) return 0;

        return survey.questions.filter((question) =>
            isAnswered(question, answers[question.code])
        ).length;
    }, [survey, answers]);

    const updateAnswer = (questionCode: string, patch: Partial<AnswerState>) => {
        setAnswers((prev) => ({
            ...prev,
            [questionCode]: {
                ...prev[questionCode],
                ...patch,
            },
        }));

        setValidationErrors((prev) => {
            if (!prev[questionCode]) return prev;
            const next = { ...prev };
            delete next[questionCode];
            return next;
        });
    };

    const validate = (): boolean => {
        if (!survey) return false;

        const nextErrors: ValidationMap = {};

        for (const question of survey.questions) {
            if (!question.required) continue;

            const answer = answers[question.code];

            if (question.type === "SINGLE_CHOICE" && !answer?.selectedOptionCode) {
                nextErrors[question.code] = "선택지를 골라주세요.";
            }

            if (question.type === "LINEAR_SCALE" && typeof answer?.scaleValue !== "number") {
                nextErrors[question.code] = "점수를 선택해주세요.";
            }

            if (question.type === "LONG_TEXT" && !normalizeText(answer?.textAnswer)) {
                nextErrors[question.code] = "내용을 입력해주세요.";
            }
        }

        setValidationErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const buildPayload = (): SubmitSurveyAnswerRequest[] => {
        if (!survey) return [];

        return survey.questions.flatMap((question) => {
            const answer = answers[question.code];
            if (!isAnswered(question, answer)) return [];

            if (question.type === "SINGLE_CHOICE") {
                return [
                    {
                        questionCode: question.code,
                        selectedOptionCode: answer?.selectedOptionCode,
                    },
                ];
            }

            if (question.type === "LINEAR_SCALE") {
                return [
                    {
                        questionCode: question.code,
                        scaleValue: answer?.scaleValue,
                    },
                ];
            }

            return [
                {
                    questionCode: question.code,
                    textAnswer: normalizeText(answer?.textAnswer),
                },
            ];
        });
    };

    useEffect(() => {
        if (!authRequired) return;

        goToAccountLogin(location.pathname + location.search + location.hash);
    }, [authRequired, location.pathname, location.search, location.hash]);

    const handleExitClick = () => {
        openExitConfirmModal();
    };

    const handleConfirmExit = () => {
        closeExitConfirmModal();

        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    const handleSubmit = async () => {
        if (!survey || submitting) return;

        setPageError("");

        if (answeredCount === 0) {
            openNoticeModal(
                "이미 응모가 완료되었어요",
                "베스트 리뷰어 이벤트는 계정당 1회만 참여할 수 있어요.",
                "info",
                true
            );
            return;
        }

        if (!validate()) {
            openNoticeModal(
                "필수 문항을 확인해 주세요",
                "필수로 응답해야 하는 문항이 아직 남아 있어요. 표시된 문항을 먼저 작성해 주세요.",
                "warning"
            );

            const firstInvalid = document.querySelector("[data-invalid='true']");
            firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        try {
            setSubmitting(true);

            await submitActiveSurvey({
                answers: buildPayload(),
            });

            window.scrollTo({ top: 0, behavior: "smooth" });
            openSubmitCompleteModal();
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    setAuthRequired(true);
                } else if (error.status === 409) {
                    openNoticeModal(
                        "이미 응모가 완료되었어요",
                        "베스트 리뷰어 이벤트는 계정당 1회만 참여할 수 있어요.",
                        "info"
                    );
                } else {
                    setPageError(error.message);
                }
            } else {
                setPageError("설문 제출 중 오류가 발생했습니다.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <PageWrap>
                <PageShell>
                    <StateCard>
                        <StateTitle>설문 정보를 불러오는 중입니다</StateTitle>
                        <StateText>잠시만 기다려주세요.</StateText>
                    </StateCard>
                </PageShell>
            </PageWrap>
        );
    }

    if (authRequired) {
        return (
            <PageWrap>
                <PageShell>
                    <StateCard>
                        <StateBadge>로그인 필요</StateBadge>
                        <StateTitle>로그인 후 참여할 수 있어요</StateTitle>
                        <StateText>
                            설문 참여와 제출은 로그인한 사용자만 가능해요.
                            <br />
                            잠시 후 로그인 페이지로 이동합니다.
                        </StateText>

                        <ActionRow>
                            <PrimaryButton
                                type="button"
                                onClick={() =>
                                    goToAccountLogin(
                                        location.pathname + location.search + location.hash
                                    )
                                }
                            >
                                로그인하러 가기
                            </PrimaryButton>
                        </ActionRow>
                    </StateCard>
                </PageShell>
            </PageWrap>
        );
    }

    if (!survey) {
        return (
            <PageWrap>
                <PageShell>
                    <StateCard>
                        <StateTitle>진행 중인 설문이 없습니다</StateTitle>
                        <StateText>{pageError || "현재 참여 가능한 설문이 없어요."}</StateText>
                    </StateCard>
                </PageShell>
            </PageWrap>
        );
    }

    return (
        <PageWrap>
            <PageShell>
                <HeroWrap ref={heroRef}>
                    <HeroPanel>
                        <HeroTopRow>
                            <HeroBadge>베스트 리뷰어 이벤트</HeroBadge>
                        </HeroTopRow>

                        <HeroTitle>{survey.title}</HeroTitle>
                        <HeroSub>{survey.description}</HeroSub>

                        <ProgressWrap>
                            <ProgressTop>
                                <span>응답 진행률</span>
                                <strong>{progress}%</strong>
                            </ProgressTop>
                            <ProgressBar>
                                <ProgressFill style={{ width: `${progress}%` }} />
                            </ProgressBar>
                        </ProgressWrap>
                    </HeroPanel>
                </HeroWrap>

                {showStickyProgress && (
                    <StickyProgressBar>
                        <StickyProgressInner>
                            <StickyProgressLeft>
                                <StickyProgressLabel>응답 진행률</StickyProgressLabel>
                                <StickyProgressMeta>
                                    {answeredCount} / {survey.questions.length} 문항 완료
                                </StickyProgressMeta>
                            </StickyProgressLeft>

                            <StickyProgressRight>{progress}%</StickyProgressRight>
                        </StickyProgressInner>

                        <StickyProgressTrack>
                            <StickyProgressValue style={{ width: `${progress}%` }} />
                        </StickyProgressTrack>
                    </StickyProgressBar>
                )}

                {pageError && <AlertBox $variant="error">{pageError}</AlertBox>}

                <QuestionSection>
                    <SectionHeading>
                        <strong>
                            리뷰 설문 <em>문항</em>
                        </strong>
                        <small>실제 사용 경험을 바탕으로 편하게 응답해 주세요.</small>
                    </SectionHeading>

                    <QuestionGrid>
                        {survey.questions.map((question, index) => {
                            const answer = answers[question.code];
                            const error = validationErrors[question.code];

                            return (
                                <QuestionCard
                                    key={question.code}
                                    $invalid={!!error}
                                    data-invalid={error ? "true" : "false"}
                                >
                                    <QuestionHead>
                                        <QuestionNo>{String(index + 1).padStart(2, "0")}</QuestionNo>
                                        <QuestionTitleWrap>
                                            <QuestionTitle>{question.title}</QuestionTitle>
                                            {question.required && <RequiredPill>필수</RequiredPill>}
                                        </QuestionTitleWrap>
                                    </QuestionHead>

                                    {question.type === "SINGLE_CHOICE" && question.options && (
                                        <ChoiceList>
                                            {question.options.map((option) => {
                                                const checked = answer?.selectedOptionCode === option.code;

                                                return (
                                                    <ChoiceItem
                                                        key={option.code}
                                                        $checked={checked}
                                                        onClick={() =>
                                                            updateAnswer(question.code, {
                                                                selectedOptionCode: option.code,
                                                            })
                                                        }
                                                    >
                                                        <ChoiceLabel>{option.label}</ChoiceLabel>
                                                    </ChoiceItem>
                                                );
                                            })}
                                        </ChoiceList>
                                    )}

                                    {question.type === "LINEAR_SCALE" && question.scale && (
                                        <ScaleWrap>
                                            {/*<ScaleLabelRow>*/}
                                            {/*    <span>{question.scale.minLabel}</span>*/}
                                            {/*    <span>{question.scale.maxLabel}</span>*/}
                                            {/*</ScaleLabelRow>*/}

                                            <ScaleList>
                                                {Array.from(
                                                    { length: question.scale.max - question.scale.min + 1 },
                                                    (_, i) => question.scale.min + i
                                                ).map((value) => {
                                                    const checked = answer?.scaleValue === value;
                                                    const { meaning, iconSrc } = getScaleMeta(question, value);

                                                    return (
                                                        <ScaleItemButton
                                                            key={value}
                                                            type="button"
                                                            $checked={checked}
                                                            onClick={() =>
                                                                updateAnswer(question.code, {
                                                                    scaleValue: value,
                                                                })
                                                            }
                                                            aria-pressed={checked}
                                                            aria-label={`${value}점 ${meaning}`}
                                                        >
                                                            <ScaleItemContent>
                                                                <ScaleNumber>{value}</ScaleNumber>
                                                                {iconSrc && (
                                                                    <ScaleEmojiImage
                                                                        src={iconSrc}
                                                                        alt=""
                                                                        aria-hidden="true"
                                                                    />
                                                                )}

                                                                {meaning && <ScaleMeaning>{meaning}</ScaleMeaning>}
                                                            </ScaleItemContent>
                                                        </ScaleItemButton>
                                                    );
                                                })}
                                            </ScaleList>
                                        </ScaleWrap>
                                    )}

                                    {question.type === "LONG_TEXT" && (
                                        <TextAreaWrap>
                                            <TextArea
                                                value={answer?.textAnswer ?? ""}
                                                onChange={(e) =>
                                                    updateAnswer(question.code, {
                                                        textAnswer: e.target.value,
                                                    })
                                                }
                                                placeholder="좋았던 점, 도움이 된 점, 아쉬운 점 등을 자유롭게 작성해 주세요."
                                                rows={6}
                                                maxLength={2000}
                                            />
                                            <TextCount>{(answer?.textAnswer ?? "").length}/2000</TextCount>
                                        </TextAreaWrap>
                                    )}

                                    {error && <ErrorText>{error}</ErrorText>}
                                </QuestionCard>
                            );
                        })}
                    </QuestionGrid>
                </QuestionSection>

                <FooterCard>
                    <FooterNote>
                        실제 사용 경험을 바탕으로 솔직하게 작성해 주시면 이벤트 참여에 도움이 됩니다.
                    </FooterNote>

                    <FooterButtonGroup>
                        <SecondaryButton type="button" onClick={handleExitClick} disabled={submitting}>
                            나가기
                        </SecondaryButton>

                        <PrimaryButton type="button" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "제출 중..." : "리뷰 제출하기"}
                        </PrimaryButton>
                    </FooterButtonGroup>
                </FooterCard>
            </PageShell>
            {noticeModal.open && (
                <NoticeModalScrim
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeNoticeModal();
                        }
                    }}
                >
                    <NoticeModalCard onClick={(e) => e.stopPropagation()}>
                        <NoticeModalIconWrap $tone={noticeModal.tone}>
                            {noticeModal.tone === "warning" ? "!" : "i"}
                        </NoticeModalIconWrap>

                        <NoticeModalTitle>{noticeModal.title}</NoticeModalTitle>
                        <NoticeModalMessage>{noticeModal.message}</NoticeModalMessage>

                        <NoticeModalButtonRow>
                            <NoticeModalConfirmButton type="button" onClick={closeNoticeModal}>
                                확인했어요
                            </NoticeModalConfirmButton>
                        </NoticeModalButtonRow>
                    </NoticeModalCard>
                </NoticeModalScrim>
            )}
            {exitConfirmModal.open && (
                <NoticeModalScrim
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeExitConfirmModal();
                        }
                    }}
                >
                    <NoticeModalCard onClick={(e) => e.stopPropagation()}>
                        <NoticeModalIconWrap $tone="warning">!</NoticeModalIconWrap>

                        <NoticeModalTitle>진짜 나가시겠어요?</NoticeModalTitle>
                        <NoticeModalMessage>
                            지금 페이지를 나가면 작성 중인 설문 응답은 저장되지 않아요.
                            <br />
                            리뷰 제출하기 버튼을 누르기 전까지는 모든 내용이 사라질 수 있어요.
                        </NoticeModalMessage>

                        <NoticeModalDualButtonRow>
                            <NoticeModalGhostButton type="button" onClick={closeExitConfirmModal}>
                                계속 작성하기
                            </NoticeModalGhostButton>

                            <NoticeModalDangerButton type="button" onClick={handleConfirmExit}>
                                나갈게요
                            </NoticeModalDangerButton>
                        </NoticeModalDualButtonRow>
                    </NoticeModalCard>
                </NoticeModalScrim>
            )}
            {submitCompleteModalOpen && (
                <NoticeModalScrim
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeSubmitCompleteModal();
                        }
                    }}
                >
                    <NoticeModalCard onClick={(e) => e.stopPropagation()}>
                        <NoticeModalSuccessIcon>✓</NoticeModalSuccessIcon>

                        <NoticeModalTitle>리뷰 제출 감사합니다.</NoticeModalTitle>
                        <NoticeModalMessage>
                            베스트 리뷰어 이벤트에 정상적으로 응모 완료되었습니다.
                        </NoticeModalMessage>

                        <NoticeModalButtonRow>
                            <NoticeModalConfirmButton type="button" onClick={closeSubmitCompleteModal}>
                                홈으로 이동
                            </NoticeModalConfirmButton>
                        </NoticeModalButtonRow>
                    </NoticeModalCard>
                </NoticeModalScrim>
            )}
        </PageWrap>
    );
}

/* ===== styled ===== */

const PageWrap = styled.div`
    width: 100%;
    min-height: 100%;
    padding: 0 20px 40px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background:
            radial-gradient(900px 400px at 50% -180px, rgba(67, 105, 229, 0.06) 0%, rgba(67, 105, 229, 0) 60%),
            linear-gradient(180deg, #f8fbff 0%, #fdfcff 100%);

    font-family: ${UI.font.family};
    color: ${UI.text};
    letter-spacing: -0.012em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    word-break: keep-all;
`;

const PageShell = styled.div`
    --hero-max: 1240px;
    width: 100%;
    max-width: var(--hero-max);
    margin: 0 auto;
    padding-top: 24px;
`;

const HeroWrap = styled.section`
    width: 100%;
    margin: 28px auto 16px;
`;

const HeroPanel = styled.div`
    position: relative;
    background: ${UI.panelBgSoft};
    border: 1px solid ${UI.panelLineSoft};
    border-radius: ${UI.radiusXXL};
    box-shadow: ${UI.shadowSoft};
    padding: 26px 28px;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
                900px 400px at 50% -180px,
                rgba(67, 105, 229, 0.07) 0%,
                rgba(67, 105, 229, 0) 60%
        );
        pointer-events: none;
    }
`;

const HeroTopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const HeroBadge = styled.span`
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 14px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: ${UI.primaryBlue};
    background: ${UI.color.indigo50};
    border: 1.5px solid rgba(62, 99, 224, 0.18);
`;

const HeroTitle = styled.h1`
    margin: 16px 0 10px;
    font-size: clamp(28px, 3.3vw, 38px);
    line-height: 1.24;
    letter-spacing: -0.04em;
    font-weight: 800;
    color: ${UI.text};
`;

const HeroSub = styled.p`
    margin: 0;
    color: ${UI.sub};
    font-size: 16px;
    line-height: 1.72;
    letter-spacing: -0.018em;
    font-weight: 500;
`;

const ProgressWrap = styled.div`
    margin-top: 22px;
`;

const ProgressTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    color: ${UI.sub};
    font-size: 14px;

    strong {
        color: ${UI.primaryBlue};
        font-size: 15px;
        font-weight: 800;
    }
`;

const ProgressBar = styled.div`
    height: 10px;
    background: #e7eefc;
    border-radius: 999px;
    overflow: hidden;
`;

const ProgressFill = styled.div`
    height: 100%;
    border-radius: 999px;
    background: ${UI.gradient.cta};
    transition: width 0.22s ease;
`;

const cardBase = css`
    background: #fff;
    border: 1px solid ${UI.panelLineSoft};
    border-radius: 18px;
    box-shadow: ${UI.shadowSoft};
`;

const StickyProgressBar = styled.div`
    position: sticky;
    top: 88px;
    z-index: 20;

    ${cardBase};
    margin-bottom: 14px;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(10px);

    @media (max-width: 768px) {
        top: 76px;
    }
`;

const StickyProgressInner = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
`;

const StickyProgressLeft = styled.div`
    min-width: 0;
`;

const StickyProgressLabel = styled.div`
    font-size: 13px;
    line-height: 1.35;
    letter-spacing: -0.02em;
    font-weight: 800;
    color: ${UI.text};
`;

const StickyProgressMeta = styled.div`
    margin-top: 3px;
    font-size: 12px;
    line-height: 1.45;
    letter-spacing: -0.015em;
    color: ${UI.sub};
    font-weight: 600;
`;

const StickyProgressRight = styled.div`
    flex: 0 0 auto;
    font-size: 16px;
    line-height: 1;
    letter-spacing: -0.03em;
    font-weight: 900;
    color: ${UI.primaryBlue};
`;

const StickyProgressTrack = styled.div`
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: #e7eefc;
    overflow: hidden;
`;

const StickyProgressValue = styled.div`
    height: 100%;
    border-radius: 999px;
    background: ${UI.gradient.cta};
    transition: width 0.22s ease;
`;

const AlertBox = styled.div<{ $variant: "error" | "info" }>`
    ${cardBase};
    margin-bottom: 14px;
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.55;

    ${({ $variant }) =>
            $variant === "error"
                    ? css`
                        background: ${UI.color.dangerSoft};
                        color: ${UI.color.danger};
                        border-color: rgba(225, 86, 147, 0.16);
                    `
                    : css`
                        background: ${UI.color.infoSoft};
                        color: ${UI.color.info};
                        border-color: rgba(59, 130, 246, 0.16);
                    `}
`;

const QuestionSection = styled.section`
    width: 100%;
`;

const SectionHeading = styled.header`
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;

    strong {
        font-size: 24px;
        color: ${UI.text};
        letter-spacing: -0.02em;
        white-space: nowrap;
    }

    em {
        color: ${UI.primaryBlue};
        font-style: normal;
    }

    small {
        font-size: 14px;
        color: ${UI.sub};
        white-space: nowrap;
    }

    @media (max-width: 640px) {
        gap: 6px;
        align-items: flex-start;
    }
`;

const QuestionGrid = styled.div`
    display: grid;
    gap: 14px;
`;

const QuestionCard = styled.section<{ $invalid: boolean }>`
    ${cardBase};
    padding: 20px 18px;
    border-color: ${({ $invalid }) =>
            $invalid ? "rgba(225, 86, 147, 0.26)" : UI.panelLineSoft};
`;

const QuestionHead = styled.div`
    display: flex;
    gap: 14px;
    margin-bottom: 18px;
`;

const QuestionNo = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: ${UI.color.indigo50};
    color: ${UI.primaryBlue};
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const QuestionTitleWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const QuestionTitle = styled.h2`
    margin: 0;
    font-size: 22px;
    line-height: 1.38;
    letter-spacing: -0.03em;
    font-weight: 750;
    color: ${UI.text};
`;

const RequiredPill = styled.span`
    display: inline-flex;
    align-items: center;
    width: fit-content;
    height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: #fff1f7;
    color: ${UI.color.danger};
    font-size: 12px;
    letter-spacing: -0.02em;
    font-weight: 800;
    border: 1px solid rgba(225, 86, 147, 0.15);
`;

const ChoiceList = styled.div`
    display: grid;
    gap: 10px;
`;

const ChoiceItem = styled.label<{ $checked: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 0 16px;
    border-radius: 14px;
    cursor: pointer;
    transition: 0.16s ease;
    line-height: 1.45;
    border: 1px solid
    ${({ $checked }) => ($checked ? "rgba(62, 99, 224, 0.22)" : "#e6eaf4")};
    background: ${({ $checked }) => ($checked ? "#eef3ff" : "#fbfcff")};

    &:hover {
        background: ${({ $checked }) => ($checked ? "#eef3ff" : "#f7f9fd")};
    }
`;

const ChoiceInput = styled.input`
    accent-color: ${UI.primaryBlue};
`;

const ChoiceLabel = styled.span`
    color: ${UI.text};
    font-size: 16px;
    line-height: 1.45;
    letter-spacing: -0.02em;
    font-weight: 600;
`;

const ScaleWrap = styled.div`
    display: grid;
    gap: 12px;
`;

const ScaleLabelRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    color: ${UI.sub};
    font-size: 13px;
    line-height: 1.45;
    letter-spacing: -0.018em;
    font-weight: 600;
`;

const ScaleList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(56px, 1fr));
    gap: 10px;
`;

const ScaleItemButton = styled.button<{ $checked: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 118px;
    padding: 12px 10px;
    border-radius: 16px;
    cursor: pointer;
    transition: 0.16s ease;
    border: 1px solid
    ${({ $checked }) => ($checked ? "rgba(62, 99, 224, 0.28)" : "#e6eaf4")};
    background: ${({ $checked }) => ($checked ? "#eef3ff" : "#fbfcff")};
    color: ${UI.text};
    font-weight: 700;
    appearance: none;

    &:hover {
        background: ${({ $checked }) => ($checked ? "#eef3ff" : "#f7f9fd")};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.18);
    }
`;

const ScaleEmojiImage = styled.img`
    width: 34px;
    height: 34px;
    object-fit: contain;
    display: block;
`;

const ScaleItemContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
`;

const ScaleNumber = styled.span`
    font-size: 16px;
    line-height: 1;
    letter-spacing: -0.02em;
    font-weight: 800;
    color: ${UI.text};
`;

const ScaleMeaning = styled.span`
    font-size: 11px;
    line-height: 1.35;
    letter-spacing: -0.015em;
    font-weight: 600;
    color: ${UI.sub};
    word-break: keep-all;
`;

const TextAreaWrap = styled.div``;

const TextArea = styled.textarea`
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
    min-height: 148px;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    background: #fcfdff;
    color: ${UI.text};
    padding: 15px 16px;

    font-family: ${UI.font.family};
    font-size: 15px;
    line-height: 1.72;
    letter-spacing: -0.018em;
    font-weight: 500;
    outline: none;

    &:focus {
        border-color: rgba(79, 118, 241, 0.42);
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.16);
    }

    &::placeholder {
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
        letter-spacing: -0.015em;
        font-weight: 500;
        color: #94a3b8;
    }
`;

const TextCount = styled.div`
    margin-top: 8px;
    text-align: right;
    color: ${UI.sub};
    font-size: 12px;
`;

const ErrorText = styled.p`
    margin: 10px 0 0;
    color: ${UI.color.danger};
    font-size: 13px;
    font-weight: 700;
`;

const FooterCard = styled.footer`
    ${cardBase};
    margin-top: 20px;
    padding: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    @media (max-width: 820px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const FooterNote = styled.div`
    color: ${UI.sub};
    font-size: 15px;
    line-height: 1.72;
    letter-spacing: -0.018em;
    font-weight: 500;
`;

const PrimaryButton = styled.button`
    height: 42px;
    padding: 0 16px;
    border-radius: 10px;
    min-width: 120px;
    border: 1px solid ${UI.color.primary};
    background: ${UI.color.primary};
    color: #fff;
    font-size: 15px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.025em;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    transition: filter 0.15s ease, transform 0.08s ease, box-shadow 0.15s ease;

    &:hover {
        filter: brightness(0.96);
    }

    &:active {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.18);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const StateCard = styled.section`
    ${cardBase};
    padding: 48px 24px;
    text-align: center;
    margin-top: 20px;
`;

const SuccessCard = styled(StateCard)``;

const StateBadge = styled.div`
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 14px;
    border-radius: 999px;
    background: ${UI.color.successSoft};
    color: ${UI.color.success};
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 14px;
`;

const StateTitle = styled.h1`
    margin: 0 0 12px;
    font-size: 32px;
    line-height: 1.28;
    letter-spacing: -0.035em;
    font-weight: 800;
    color: ${UI.text};
`;

const StateText = styled.p`
    margin: 0;
    color: ${UI.sub};
    font-size: 16px;
    line-height: 1.74;
    letter-spacing: -0.018em;
    font-weight: 500;
`;

const ActionRow = styled.div`
    margin-top: 22px;
    display: flex;
    justify-content: center;
`;

const NoticeModalScrim = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(15, 23, 42, 0.42);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
`;

const NoticeModalCard = styled.div`
    width: min(420px, 100%);
    background: #fff;
    border: 1px solid ${UI.panelLineSoft};
    border-radius: 24px;
    box-shadow: 0 26px 70px rgba(15, 23, 42, 0.18);
    padding: 28px 24px 22px;
    text-align: center;
    animation: noticeModalIn 0.16s ease-out;

    @keyframes noticeModalIn {
        from {
            opacity: 0.01;
            transform: translateY(8px) scale(0.985);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const NoticeModalIconWrap = styled.div<{ $tone: "warning" | "info" }>`
    width: 58px;
    height: 58px;
    margin: 0 auto 16px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.03em;

    background: ${({ $tone }) =>
            $tone === "warning" ? "#fff4f7" : UI.color.infoSoft};
    color: ${({ $tone }) =>
            $tone === "warning" ? UI.color.danger : UI.color.info};
    border: 1px solid
    ${({ $tone }) =>
            $tone === "warning"
                    ? "rgba(225, 86, 147, 0.14)"
                    : "rgba(59, 130, 246, 0.14)"};
`;

const NoticeModalTitle = styled.h3`
    margin: 0;
    color: ${UI.text};
    font-size: 24px;
    line-height: 1.3;
    letter-spacing: -0.035em;
    font-weight: 800;
`;

const NoticeModalMessage = styled.p`
    margin: 12px 0 0;
    color: ${UI.sub};
    font-size: 15px;
    line-height: 1.72;
    letter-spacing: -0.018em;
    font-weight: 500;
    word-break: keep-all;
`;

const NoticeModalButtonRow = styled.div`
    margin-top: 22px;
    display: flex;
    justify-content: center;
`;

const NoticeModalConfirmButton = styled.button`
    height: 44px;
    min-width: 128px;
    padding: 0 18px;
    border-radius: 12px;
    border: 1px solid ${UI.color.primary};
    background: ${UI.color.primary};
    color: #fff;
    font-family: ${UI.font.family};
    font-size: 15px;
    line-height: 1;
    letter-spacing: -0.025em;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: filter 0.15s ease, transform 0.08s ease, box-shadow 0.15s ease;

    &:hover {
        filter: brightness(0.97);
    }

    &:active {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.18);
    }
`;

const FooterButtonGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;

    @media (max-width: 820px) {
        width: 100%;
    }
`;

const SecondaryButton = styled.button`
    height: 42px;
    padding: 0 16px;
    border-radius: 10px;
    min-width: 108px;
    border: 1px solid ${UI.color.primary};
    background: #fff;
    color: ${UI.color.primary};
    font-size: 15px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.025em;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    transition: background-color 0.15s ease, transform 0.08s ease, box-shadow 0.15s ease;

    &:hover {
        background: ${UI.color.primarySoft};
    }

    &:active {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.18);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const NoticeModalDualButtonRow = styled.div`
    margin-top: 22px;
    display: flex;
    justify-content: center;
    gap: 10px;

    @media (max-width: 480px) {
        flex-direction: column;
    }
`;

const NoticeModalGhostButton = styled.button`
    height: 44px;
    min-width: 132px;
    padding: 0 18px;
    border-radius: 12px;
    border: 1px solid ${UI.color.primary};
    background: #fff;
    color: ${UI.color.primary};
    font-family: ${UI.font.family};
    font-size: 15px;
    line-height: 1;
    letter-spacing: -0.025em;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s ease, transform 0.08s ease, box-shadow 0.15s ease;

    &:hover {
        background: ${UI.color.primarySoft};
    }

    &:active {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.18);
    }
`;

const NoticeModalDangerButton = styled.button`
    height: 44px;
    min-width: 132px;
    padding: 0 18px;
    border-radius: 12px;
    border: 1px solid ${UI.color.danger};
    background: ${UI.color.danger};
    color: #fff;
    font-family: ${UI.font.family};
    font-size: 15px;
    line-height: 1;
    letter-spacing: -0.025em;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: filter 0.15s ease, transform 0.08s ease, box-shadow 0.15s ease;

    &:hover {
        filter: brightness(0.97);
    }

    &:active {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(225, 86, 147, 0.18);
    }
`;

const NoticeModalSuccessIcon = styled.div`
    width: 58px;
    height: 58px;
    margin: 0 auto 16px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.03em;

    background: ${UI.color.successSoft};
    color: ${UI.color.success};
    border: 1px solid rgba(34, 197, 94, 0.16);
`;