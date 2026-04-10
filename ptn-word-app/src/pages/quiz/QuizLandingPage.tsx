import React from "react";
import styled, {keyframes} from "styled-components";
import { useNavigate } from "react-router-dom";

import shot1 from "../../assets/quiz/landing/shot-1.jpg";
import shot2 from "../../assets/quiz/landing/shot-2.jpg";
import shot3 from "../../assets/quiz/landing/shot-3.png";
import shot4 from "../../assets/quiz/landing/shot-4.png";

const SLIDES = [
    { src: shot1, title: "오늘의 퀴즈", desc: "매일 추천 문제로 빠르게 감을 잡아요. 짧게 풀고 바로 복습까지 이어집니다." },
    { src: shot2, title: "내가 만드는 포텐퀴즈", desc: "학습 주제와 문제 스타일을 직접 고르고, 나만의 루틴으로 반복 학습해요." },
    { src: shot3, title: "오답노트", desc: "틀린 문제만 모아 다시 풀고, 왜 틀렸는지 기록하면서 약점을 줄여요." },
    { src: shot4, title: "퀴즈 타임라인", desc: "학습 기록을 타임라인으로 확인하고, 꾸준함을 지표로 관리합니다." },
];

const WAVE_PATH_BIG =
    "M0,290 " +
    "C120,310 160,335 240,335 " +
    "C360,335 560,205 700,205 " +
    "C840,205 980,225 1165,225 " +
    "C1260,225 1340,165 1400,120";

export default function QuizLandingPage() {
    const navigate = useNavigate();
    const stageRef = React.useRef<HTMLElement | null>(null);

    type JumpState = { targetIdx: number; targetP: number; until: number };

    const [active, setActive] = React.useState(0);

    const [, setStageProgress] = React.useState(0);

    const jumpRef = React.useRef<JumpState | null>(null);

    const svhProbeRef = React.useRef<HTMLDivElement | null>(null);

    const getStepVh = React.useCallback(() => {
        const probe = svhProbeRef.current;
        if (probe) {
            const h = probe.getBoundingClientRect().height;
            if (h > 0) return h;
        }
        return document.documentElement.clientHeight || window.innerHeight || 1;
    }, []);

    const calcFrameHPx = () => {
        const h = window.innerHeight || 800;
        return clamp(h - 300, 540, 600);
    };

    const [frameHPx, setFrameHPx] = React.useState<number>(() => calcFrameHPx());
    const vpRef = React.useRef<{ w: number; h: number }>({
        w: typeof window !== "undefined" ? window.innerWidth : 0,
        h: typeof window !== "undefined" ? window.innerHeight : 0,
    });

    React.useEffect(() => {
        const onResize = () => setFrameHPx(calcFrameHPx());
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const images = React.useMemo(() => {
        if (SLIDES.length === 4) return SLIDES;
        return new Array(4).fill(null);
    }, []);

    const PREVIEW: Record<PreviewType, { q: string; a: string; why: string; hint?: string; choices?: string[] }> = {
        CHOICE: {
            q: "브라우저에서 렌더 트리를 만들기 전에 수행되는 과정으로 가장 가까운 것은?",
            a: "DOM/CSSOM 생성",
            why: "HTML 파싱으로 DOM, CSS 파싱으로 CSSOM을 만들고 이를 합쳐 렌더 트리를 구성해요.",
            choices: ["이벤트 루프 실행", "DOM/CSSOM 생성", "가비지 컬렉션 수행", "서비스 워커 등록"],
        },
        OX: {
            q: "HTTP는 기본적으로 상태(state)를 유지하지 않는다.",
            a: "O",
            why: "HTTP는 stateless라 세션/쿠키/토큰 같은 별도 메커니즘으로 상태를 이어가요.",
        },
        INITIAL: {
            q: "컴포넌트 트리에서 데이터 흐름을 관리하는 전역 상태 관리 패턴은?",
            a: "플럭스 패턴(Flux Architecture)",
            why: "Flux는 Action → Dispatcher → Store → View로 이어지는 단방향 데이터 흐름을 통해 전역 상태를 예측 가능하게 관리하는 아키텍처(패턴)예요.",
        },
    };

    const FAQS = [
        { q: "오늘의 퀴즈는 어떤 기준으로 추천되나요?", a: "직무/난이도/학습 흐름을 고려해 매일 빠르게 점검할 수 있는 구성을 제공합니다." },
        { q: "오답노트는 어떻게 관리되나요?", a: "틀린 문제를 모아 다시 풀 수 있고, 완료/진행중으로 분리해 약점만 집중 관리할 수 있어요." },
        { q: "직무별 퀴즈는 무엇을 설정할 수 있나요?", a: "주제(직무)와 문제 유형(객관식/OX/초성), 난이도를 골라 나만의 루틴을 만들 수 있어요." },
        { q: "타임라인은 어떤 걸 보여주나요?", a: "언제 어떤 주제를 풀었는지와 함께 정답률/풀이 수/연속 학습 같은 지표 흐름을 확인할 수 있어요." },
        { q: "포텐워드/포텐노트와 연결되나요?", a: "문제의 연관 용어를 눌러 포텐워드로 이동하고, 필요하면 포텐노트에 저장해 정리할 수 있어요." },
        { q: "모바일에서도 사용하기 좋나요?", a: "핵심 기능은 동일하게 제공되고, 화면이 좁을 때는 카드/탭 UI로 자연스럽게 재배치됩니다." },
    ];

    const [previewType, setPreviewType] = React.useState<PreviewType>("CHOICE");
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [openFaq, setOpenFaq] = React.useState<number>(0);

    React.useEffect(() => {
        setShowAnswer(false); // 탭 바뀌면 정답 숨김
    }, [previewType]);

    React.useEffect(() => {
        let raf = 0;

        const onScroll = () => {
            if (!stageRef.current) return;
            cancelAnimationFrame(raf);

            raf = requestAnimationFrame(() => {
                const el = stageRef.current!;
                const rect = el.getBoundingClientRect();

                const vh = getStepVh();
                const steps = Math.max(1, SLIDES.length - 1);
                const raw = clamp((-rect.top) / (vh * steps), 0, 1);

                setStageProgress(raw);

                const j = jumpRef.current;
                if (j) {
                    setActive(j.targetIdx);
                    if (Math.abs(raw - j.targetP) < 0.035 || performance.now() > j.until) {
                        jumpRef.current = null;
                    }
                    return;
                }

                const idx = clamp(Math.round(raw * steps), 0, SLIDES.length - 1);
                setActive(idx);
            });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    const stepRef = React.useRef<HTMLElement | null>(null);
    const [stepProgress, setStepProgress] = React.useState(0);

    const stepSmoothedRef = React.useRef(0);

    React.useEffect(() => {
        let raf = 0;

        const onScroll = () => {
            if (!stepRef.current) return;
            cancelAnimationFrame(raf);

            raf = requestAnimationFrame(() => {
                const el = stepRef.current!;
                const rect = el.getBoundingClientRect();
                const vh = window.innerHeight || 1;

                const scrollable = Math.max(1, rect.height - vh);
                const passed = clamp(-rect.top, 0, scrollable);
                const raw = passed / scrollable;

                const smoothed = lerp(stepSmoothedRef.current, raw, 0.18);
                stepSmoothedRef.current = smoothed;

                const snapped = magnetize(smoothed, [0.18, 0.55, 0.88], 0.12, 0.58);

                setStepProgress(snapped);
            });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    const stepIndex =
        stepProgress < 0.36 ? 0 :
            stepProgress < 0.72 ? 1 : 2;

    const is1 = stepIndex === 0;
    const is2 = stepIndex === 1;
    const is3 = stepIndex === 2;

    const waveSvgRef = React.useRef<SVGSVGElement | null>(null);
    const wavePathRef = React.useRef<SVGPathElement | null>(null);
    const [waveIconPts, setWaveIconPts] = React.useState<{ x: number; y: number }[]>([]);

    React.useLayoutEffect(() => {
        const svg = waveSvgRef.current;
        const path = wavePathRef.current;
        if (!svg || !path) return;

        const update = () => {
            const svgRect = svg.getBoundingClientRect();
            const w = Math.max(1, svgRect.width);
            const h = Math.max(1, svgRect.height);

            const vb = svg.viewBox.baseVal;
            const vbX = vb?.x ?? 0;
            const vbY = vb?.y ?? 0;
            const vbW = vb?.width ?? 1400;
            const vbH = vb?.height ?? 420;

            const sx = w / vbW;
            const sy = h / vbH;

            const total = path.getTotalLength();

            const fallback = [0.2, 0.5, 0.8].map((t) => t * w);

            const targetX = [0, 1, 2].map((i) => {
                const el = stepBoxRefs.current[i];
                if (!el) return fallback[i];
                const r = el.getBoundingClientRect();
                return clamp(r.left + r.width / 2 - svgRect.left, 0, w);
            });

            const samples = 900;
            const pts = Array.from({ length: samples }, (_, i) => {
                const p = path.getPointAtLength((total * i) / (samples - 1));
                return { x: (p.x - vbX) * sx, y: (p.y - vbY) * sy };
            });

            const picked = targetX.map((tx) => {
                let best = pts[0];
                let bestD = Math.abs(pts[0].x - tx);
                for (const p of pts) {
                    const d = Math.abs(p.x - tx);
                    if (d < bestD) {
                        bestD = d;
                        best = p;
                    }
                }
                return best;
            });

            setWaveIconPts(picked);
        };

        update();

        const ro = new ResizeObserver(update);
        ro.observe(svg);
        stepBoxRefs.current.forEach((el) => el && ro.observe(el));

        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, { passive: true });

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update);
        };
    }, []);

    const stepBoxRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    const setStepBoxRef = (idx: number) => (el: HTMLDivElement | null) => {
        stepBoxRefs.current[idx] = el;
    };

    const getStageTop = () => {
        const el = stageRef.current;
        if (!el) return 0;
        return el.getBoundingClientRect().top + window.scrollY;
    };

    const preClickYRef = React.useRef(0);

    const rememberPreClickY = () => {
        preClickYRef.current = window.scrollY;
    };

    const prefersReducedMotion = React.useMemo(() => {
        try {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch {
            return false;
        }
    }, []);

    const scrollToSlide = React.useCallback(
        (idx: number) => {
            const el = stageRef.current;
            if (!el) return;

            const stageTop = el.getBoundingClientRect().top + window.scrollY;

            const vh = getStepVh();
            const steps = Math.max(1, SLIDES.length - 1);

            const safeIdx = clamp(idx, 0, SLIDES.length - 1);
            const target = stageTop + vh * safeIdx;

            const minY = stageTop;
            const maxY = stageTop + vh * steps;

            window.scrollTo({
                top: clamp(target, minY, maxY),
                behavior: prefersReducedMotion ? "auto" : "smooth",
            });
        },
        [prefersReducedMotion, getStepVh]
    );

    const beginJumpTo = (idx: number, keepY: number) => {
        const steps = Math.max(1, SLIDES.length - 1);
        const p = idx / steps;

        setActive(idx);
        setStageProgress(p);

        jumpRef.current = {
            targetIdx: idx,
            targetP: p,
            until: performance.now() + 3000,
        };

        requestAnimationFrame(() => {
            window.scrollTo({ top: keepY, behavior: "auto" });
            requestAnimationFrame(() => scrollToSlide(idx));
        });
    };

    return (
        <>
            <ViewportBg aria-hidden />
            <SvhProbe ref={svhProbeRef} aria-hidden />

            {/* 스크롤로 이미지가 바뀌는 구간 */}
            <ScrollStage ref={stageRef} style={{ ["--steps" as any]: images.length }}>
                <StickyFrame>
                    <HeroBlock className="hero" aria-label="포텐퀴즈 소개">
                        <HeroKicker className="heroKicker">포텐퀴즈</HeroKicker>
                        <HeroTitle className="heroTitle">매일 조금씩, 실력은 확실하게.</HeroTitle>
                        <HeroCTA className="heroCta">
                            <HeroStartButton
                                type="button"
                                onClick={() => {
                                    try {
                                        navigate("/learning/quiz/home");
                                    } catch {
                                        window.location.href = "http://localhost/learning/quiz/home";
                                    }
                                }}
                            >
                                포텐퀴즈 지금 시작하기
                            </HeroStartButton>
                        </HeroCTA>
                    </HeroBlock>

                    <StageWrap
                        className="stageWrap"
                        style={{ ["--frame-h" as any]: `${frameHPx}px` } as React.CSSProperties}
                    >
                        <UnifiedFrame>
                            <UnifiedGlow aria-hidden />
                            <LeftInfo aria-live="polite">
                                {SLIDES.map((s, i) => (
                                    <LeftInfoItem key={s.title} $active={i === active}>
                                        <h2>{s.title}</h2>
                                        <p>{s.desc}</p>

                                        {/* 오늘의 퀴즈에서만 추가 설명 노출 */}
                                        { s.title === "오늘의 퀴즈" && (
                                            <QuizTypes>
                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconChoice /></Icon>
                                                    <h3>객관식 퀴즈</h3>
                                                    <p>4지선다형 문제로 보다 깊이 있는 문제를 풀어보세요.</p>
                                                </QuizTypeItem>

                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconOX /></Icon>
                                                    <h3>OX 퀴즈</h3>
                                                    <p>문장의 진위 여부를 묻는 OX 퀴즈 문제를 풀어보세요.</p>
                                                </QuizTypeItem>

                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconInitial /></Icon>
                                                    <h3>초성 퀴즈</h3>
                                                    <p>주어진 문장과 초성을 보고 이 답이 무엇인지 예측해 보세요.</p>
                                                </QuizTypeItem>
                                            </QuizTypes>
                                        )}

                                        { s.title === "내가 만드는 포텐퀴즈" && (
                                            <QuizTypes>
                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconTopics /></Icon>
                                                    <h3>다양한 주제</h3>
                                                    <p>프론트엔드, 백엔드 및 데이터베이스, 자료구조·알고리즘, AI 개발자까지 골라 학습해요.</p>
                                                </QuizTypeItem>

                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconModes /></Icon>
                                                    <h3>문제 유형 설정</h3>
                                                    <p>객관식, OX, 초성 퀴즈를 선택하거나 랜덤 유형으로 섞어서 풀 수 있어요.</p>
                                                </QuizTypeItem>

                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconDifficulty /></Icon>
                                                    <h3>문제 난이도 설정</h3>
                                                    <p>혼합, 쉬움, 보통, 어려움 중에서 현재 실력에 맞춰 난이도를 조절해요.</p>
                                                </QuizTypeItem>
                                            </QuizTypes>
                                        )}

                                        { s.title === "오답노트" && (
                                            <QuizTypes>
                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconReviewStatus /></Icon>
                                                    <h3>오답 학습관리</h3>
                                                    <p>다시 풀어 학습이 끝난 문제는 ‘해결 완료’로 정리하고, 남은 문제는 ‘미해결’로 모아 관리해요.</p>
                                                </QuizTypeItem>

                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconRelatedTerms /></Icon>
                                                    <h3>연관 용어 바로가기</h3>
                                                    <p>연관 용어를 누르면 포텐워드 검색으로 이동해요. 용어를 저장해 포텐노트에 함께 정리해 보세요.</p>
                                                </QuizTypeItem>

                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconRetry /></Icon>
                                                    <h3>선택 오답 다시풀기</h3>
                                                    <p>원하는 문제만 선택해 다시 풀 수 있어요. 약점만 빠르게 보완할 수 있어요.</p>
                                                </QuizTypeItem>
                                            </QuizTypes>
                                        )}

                                        { s.title === "퀴즈 타임라인" && (
                                            <QuizTypes>
                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconTimeline /></Icon>
                                                    <h3>학습 기록 타임라인</h3>
                                                    <p>언제 어떤 주제로 풀었는지 흐름으로 확인해요. 학습이 끊긴 구간도 한눈에 보입니다.</p>
                                                </QuizTypeItem>

                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconStats /></Icon>
                                                    <h3>성과 지표 한눈에</h3>
                                                    <p>정답률, 풀이 수, 연속 학습 같은 지표로 변화를 확인해요. 꾸준함이 숫자로 남습니다.</p>
                                                </QuizTypeItem>

                                                <QuizTypeItem>
                                                    <Icon aria-hidden><IconInsights /></Icon>
                                                    <h3>약점 패턴 인사이트</h3>
                                                    <p>자주 틀리는 주제나 난이도를 파악해요. 다음 학습 계획을 더 정확하게 세울 수 있어요.</p>
                                                </QuizTypeItem>
                                            </QuizTypes>
                                        )}
                                    </LeftInfoItem>
                                ))}
                            </LeftInfo>
                            <RightPane>
                                <PreviewFrame>
                                    <Screen>
                                        {images.map((s, i) => (
                                            <Shot key={s.title} $active={i === active}>
                                                <img src={s.src} alt="" draggable={false} />
                                            </Shot>
                                        ))}
                                    </Screen>
                                </PreviewFrame>
                            </RightPane>
                        </UnifiedFrame>
                        <PillTabs role="tablist" aria-label="기능 탭">
                            {SLIDES.map((s, i) => (
                                <PillTab
                                    key={s.title}
                                    type="button"
                                    $active={i === active}

                                    onPointerDownCapture={() => {
                                        preClickYRef.current = window.scrollY;
                                    }}

                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                    }}

                                    onKeyDown={() => {
                                        preClickYRef.current = window.scrollY;
                                    }}

                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        const keepY = preClickYRef.current || window.scrollY;
                                        beginJumpTo(i, keepY);
                                    }}
                                >
                                    {s.title}
                                </PillTab>
                            ))}
                        </PillTabs>
                    </StageWrap>
                </StickyFrame>
            </ScrollStage>

            <Inner>
                <Reveal delay={0}>
                    <PinStage aria-label="학습 루틴" ref={stepRef as any}>
                        <PinSticky>
                            <PinInner>
                                <SectionHeadBig>
                                    <SectionTitleBig>풀고 · 정리하고 · 성장하세요</SectionTitleBig>
                                    <SectionDescBig>포텐퀴즈는 “퀴즈 앱”이 아니라, 학습 루틴을 만들어주는 시스템이에요.</SectionDescBig>
                                </SectionHeadBig>

                                <FlowWrapBig>
                                    {/* 라인(웨이브) */}
                                    <FlowLineBig aria-hidden>
                                        <svg ref={waveSvgRef} viewBox="0 70 1400 350" preserveAspectRatio="none">
                                            <path ref={wavePathRef} className="ghost" d={WAVE_PATH_BIG} pathLength={1000} />
                                            <path
                                                className="progress"
                                                d={WAVE_PATH_BIG}
                                                pathLength={1000}
                                                style={{ ["--p" as any]: stepProgress }}
                                            />
                                        </svg>
                                    </FlowLineBig>

                                    <FlowIconsBig aria-hidden>
                                        <WaveIconAnchor style={{ left: `${waveIconPts[0]?.x ?? 0}px`, top: `${waveIconPts[0]?.y ?? 0}px` }}>
                                            <StepIconCurve $active={stepProgress >= 0.05} $tone="primary">
                                                <IconChoice />
                                            </StepIconCurve>
                                        </WaveIconAnchor>

                                        <WaveIconAnchor style={{ left: `${waveIconPts[1]?.x ?? 0}px`, top: `${waveIconPts[1]?.y ?? 0}px` }}>
                                            <StepIconCurve $active={stepProgress >= 0.42} $tone="mint">
                                                <IconReviewStatus />
                                            </StepIconCurve>
                                        </WaveIconAnchor>

                                        <WaveIconAnchor style={{ left: `${waveIconPts[2]?.x ?? 0}px`, top: `${waveIconPts[2]?.y ?? 0}px` }}>
                                            <StepIconCurve $active={stepProgress >= 0.74} $tone="violet">
                                                <IconStats />
                                            </StepIconCurve>
                                        </WaveIconAnchor>
                                    </FlowIconsBig>

                                    {/* 카드 그리드 */}
                                    <FlowGridBig>
                                        {/* STEP 1 */}
                                        <FlowStepBig ref={setStepBoxRef(0)} $active={is1}>
                                            <StepIconBigMobile $active={stepProgress >= 0.05} $tone="primary">
                                                <IconChoice />
                                            </StepIconBigMobile>

                                            <StepCardBig $active={is1}>
                                                <StepBadgeBig>STEP 1</StepBadgeBig>
                                                <StepTitleBig2>풀어보기</StepTitleBig2>
                                                <StepDescBig2>
                                                    오늘의 추천 또는 직무별 설정으로 지금 필요한 문제부터 시작해요.
                                                </StepDescBig2>
                                            </StepCardBig>
                                        </FlowStepBig>

                                        {/* STEP 2 */}
                                        <FlowStepBig ref={setStepBoxRef(1)} $active={is2}>
                                            <StepIconBigMobile $active={stepProgress >= 0.42} $tone="mint">
                                                <IconReviewStatus />
                                            </StepIconBigMobile>

                                            <StepCardBig $active={is2}>
                                                <StepBadgeBig>STEP 2</StepBadgeBig>
                                                <StepTitleBig2>정리하기</StepTitleBig2>
                                                <StepDescBig2>
                                                    틀린 문제만 모아 다시 풀고, 해결 완료/진행 중으로 약점을 관리해요.
                                                </StepDescBig2>
                                            </StepCardBig>
                                        </FlowStepBig>

                                        {/* STEP 3 */}
                                        <FlowStepBig ref={setStepBoxRef(2)} $active={is3}>
                                            <StepIconBigMobile $active={stepProgress >= 0.74} $tone="violet">
                                                <IconStats />
                                            </StepIconBigMobile>

                                            <StepCardBig $active={is3}>
                                                <StepBadgeBig>STEP 3</StepBadgeBig>
                                                <StepTitleBig2>성장하기</StepTitleBig2>
                                                <StepDescBig2>
                                                    학습 기록을 타임라인으로 확인하고, 꾸준함을 지표로 관리해요.
                                                </StepDescBig2>
                                            </StepCardBig>
                                        </FlowStepBig>
                                    </FlowGridBig>
                                </FlowWrapBig>
                            </PinInner>
                        </PinSticky>
                    </PinStage>
                </Reveal>

                <Reveal delay={60}>
                    <Section aria-label="문제 유형 미리보기">
                        <SectionHead>
                            <SectionTitle>문제 유형 미리보기</SectionTitle>
                            <SectionDesc>객관식 · OX · 초성 퀴즈를 실제 플레이 UI 느낌으로 체감해보세요.</SectionDesc>
                        </SectionHead>

                        <TypePreviewShell>
                            <QuizTypePreview />
                        </TypePreviewShell>
                    </Section>
                </Reveal>

                <Reveal delay={80}>
                    <Section aria-label="자주 묻는 질문">
                        <SectionHead>
                            <SectionTitle>자주 묻는 질문</SectionTitle>
                            <SectionDesc>처음 쓰는 분들이 가장 많이 물어보는 것만 모았어요.</SectionDesc>
                        </SectionHead>

                        <FAQWrap>
                            <FAQList role="list">
                                {FAQS.map((f, i) => {
                                    const opened = openFaq === i;

                                    return (
                                        <Reveal key={f.q} delay={i * 60}>
                                            <FAQRow>
                                                <FAQButton
                                                    type="button"
                                                    onClick={() => setOpenFaq(opened ? -1 : i)}
                                                    aria-expanded={opened}
                                                >
                                                    <FAQQuestion>{f.q}</FAQQuestion>
                                                    <FAQChevron $open={opened} aria-hidden />
                                                </FAQButton>

                                                <FAQAnswer $open={opened}>
                                                    <FAQAnswerInner $open={opened}>
                                                        <p>{f.a}</p>
                                                    </FAQAnswerInner>
                                                </FAQAnswer>
                                            </FAQRow>
                                        </Reveal>
                                    );
                                })}
                            </FAQList>
                        </FAQWrap>
                    </Section>
                </Reveal>
            </Inner>
        </>
    );
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

/** 화면 전체 배경 (네가 만든 컬러 유지) */
const ViewportBg = styled.div`
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;

    background: linear-gradient(90deg, #d7eff9 0%, #e3eff8 28%, #efe0e5 68%, #f5e9ee 100%);

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
                radial-gradient(900px 420px at 50% -10%, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0) 60%),
                linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.18) 20%, rgba(255, 255, 255, 0) 55%);
        opacity: 0.95;
    }

    &::after {
        content: "";
        position: absolute;
        inset: -18%;
        background:
                radial-gradient(520px 380px at 16% 26%, rgba(215, 239, 249, 0.85), rgba(215, 239, 249, 0) 72%),
                radial-gradient(560px 420px at 78% 18%, rgba(239, 224, 229, 0.85), rgba(239, 224, 229, 0) 74%),
                radial-gradient(680px 520px at 72% 78%, rgba(227, 239, 248, 0.8), rgba(227, 239, 248, 0) 76%),
                radial-gradient(520px 420px at 28% 82%, rgba(245, 233, 238, 0.78), rgba(245, 233, 238, 0) 78%);
        filter: blur(26px);
        opacity: 0.95;
        transform: translate3d(0, 0, 0);
    }
`;

/** 스크롤 구간: (이미지 개수) × 100vh */
const ScrollStage = styled.section`
    position: relative;
    z-index: 1;

    overflow-anchor: none;

    height: calc(var(--steps, 4) * 100svh);
    @supports not (height: 100svh) {
        height: calc(var(--steps, 4) * 100vh);
    }

    padding-top: 110px;

    width: 100vw;
    margin-left: calc(50% - 50vw);
`;


/** 스크롤하는 동안 프레임은 고정 */
const StickyFrame = styled.div`
    --side-pad: 12px;
    --hero-shift-y: 20px;

    position: sticky;
    top: calc(var(--ptn-header-h, 0px) + 12px);

    z-index: 10;
    isolation: isolate;

    height: calc(100svh - (var(--ptn-header-h, 0px) + 24px));
    @supports not (height: 100svh) {
        height: calc(100vh - (var(--ptn-header-h, 0px) + 24px));
    }

    width: 100%;
    padding: 0 var(--side-pad);

    display: grid;
    grid-template-rows: auto auto;
    justify-items: center;
    align-content: start;
    gap: 16px;
    overflow: visible;

    .hero { position: relative; z-index: 2; width: 100%; }
    .stageWrap { position: relative; z-index: 5; width: 100%; }

    @media (max-width: 720px) {
        --hero-shift-y: 10px;
    }
`;


/** 스샷처럼 큰 유리 프레임 */
const Frame = styled.div`
    width: fit-content;
    height: var(--frame-h);
    aspect-ratio: 16 / 9;

    position: relative;
    overflow: hidden;
    border-radius: 48px;

    background: rgba(255, 255, 255, 0.22);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 18px 70px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.65);

    @media (max-width: 1080px) {
        width: 100%;
        height: auto;
    }
`;

const FrameArea = styled.div`
    width: fit-content;
    height: var(--frame-h);
    margin: 0 auto;
    position: relative;

    @media (max-width: 1080px) {
        width: 100%;
        height: auto;
    }
`;

/** 살짝 더 “유리 겹” 느낌 */
const FrameLayer = styled.div`
    position: absolute;
    inset: 16px;
    border-radius: 38px;
    border: 1px solid rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.12);
`;
const FrameGlow = styled.div`
    position: absolute;
    inset: -30%;
    background:
            radial-gradient(800px 420px at 20% 30%, rgba(215, 239, 249, 0.35), rgba(255, 255, 255, 0) 60%),
            radial-gradient(900px 480px at 80% 20%, rgba(239, 224, 229, 0.35), rgba(255, 255, 255, 0) 62%);
    filter: blur(28px);
    opacity: 0.9;
`;

/** LeftInfo + Preview를 한 덩어리로 감싸는 컨테이너 */
const UnifiedFrame = styled.div`
    --left-w: clamp(240px, 18vw, 300px);

    position: relative;
    z-index: 1;

    width: min(var(--frame-w), 100%);
    margin-inline: auto;

    height: var(--frame-h);
    min-height: var(--frame-h);
    max-height: var(--frame-h);

    overflow: hidden;
    border-radius: 44px;

    display: grid;
    grid-template-columns: var(--left-w) minmax(0, 1fr);

    background: rgba(255, 255, 255, 0.22);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 18px 70px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);

    @media (max-width: 720px) {
        height: auto;
        min-height: auto;
        max-height: none;
        width: 100%;
        grid-template-columns: 1fr;
        border-radius: 28px;
    }
`;

/** 기존 FrameGlow/FrameLayer를 “전체 컨테이너”용으로 이동 */
const UnifiedGlow = styled.div`
  position: absolute;
  inset: -30%;
  pointer-events: none;

  background:
    radial-gradient(800px 420px at 20% 30%, rgba(215, 239, 249, 0.35), rgba(255, 255, 255, 0) 60%),
    radial-gradient(900px 480px at 80% 20%, rgba(239, 224, 229, 0.35), rgba(255, 255, 255, 0) 62%);
  filter: blur(28px);
  opacity: 0.9;
`;

const UnifiedLayer = styled.div`
    position: absolute;

    inset: 12px; 
    border-radius: 36px; 

    pointer-events: none;
    border: 1px solid rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.12);
`;

/** 오른쪽 영역 */
const RightPane = styled.div`
    position: relative;
    z-index: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    align-items: stretch;
`;

/** 우측 프리뷰(기존 Frame의 “바깥 테두리” 역할을 덜어낸 내부 프레임) */
const PreviewFrame = styled.div`
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: 0;
    position: relative;
    overflow: hidden;

    aspect-ratio: auto;

    border-radius: 0;
    background: transparent;
    border: none;
    box-shadow: none;
    
    @media (max-width: 720px) {
        height: auto;
        aspect-ratio: 16 / 9;
    }
`;

/** 이미지가 들어가는 스크린 */
const Screen = styled.div`
    position: relative;
    isolation: isolate;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    overflow: hidden;
`;

/** 각 이미지(페이드 전환) */
const Shot = styled.div<{ $active: boolean }>`
    position: absolute;
    inset: 0;
    z-index: ${({ $active }) => ($active ? 2 : 1)};
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transform: ${({ $active }) => ($active ? "translateY(0)" : "translateY(10px)")};
    transition: opacity 320ms ease, transform 420ms ease;
    will-change: opacity, transform;
    pointer-events: ${({ $active }) => ($active ? "auto" : "none")};

    img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

/** 인디케이터 */
const PillTab = styled.button<{ $active: boolean }>`
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) =>
    $active ? "rgba(17,24,39,0.85)" : "rgba(255, 255, 255, 0.82)"};
  background: ${({ $active }) =>
    $active ? "rgba(17, 24, 39, 0.92)" : "rgba(255, 255, 255, 0.62)"};
  color: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.98)" : "rgba(17, 24, 39, 0.92)"};
  font-family: "Pretendard Variable", Pretendard, "Noto Sans KR", system-ui, 
    -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-size: 13.5px;
  line-height: 1;
  font-weight: 860;
  letter-spacing: -0.02em;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1), 
    background 180ms ease, 
    box-shadow 180ms ease, 
    border-color 180ms ease, 
    filter 180ms ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: -30%;
    pointer-events: none;
    opacity: ${({ $active }) => ($active ? 0.18 : 0.12)};
    background: radial-gradient(
      220px 120px at 30% 20%,
      rgba(255,255,255,0.75),
      rgba(255,255,255,0) 60%
    );
    transition: opacity 180ms ease;
  }

  &:hover {
    box-shadow: ${({ $active }) =>
    $active
        ? "0 10px 26px rgba(17,24,39,0.16)"
        : "0 14px 34px rgba(15, 23, 42, 0.10)"};
    filter: brightness(1.02);
  }

  &:active {
    transform: translateY(1px) scale(0.985);
    box-shadow: ${({ $active }) =>
    $active
        ? "0 6px 18px rgba(17,24,39,0.14)"
        : "0 8px 20px rgba(15, 23, 42, 0.08)"};
    filter: brightness(0.99);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 5px rgba(58, 131, 243, 0.14), 
      0 14px 34px rgba(15, 23, 42, 0.10);
  }

  @media (max-width: 720px) {
    height: 32px;
    padding: 0 12px;
    font-size: 12.75px;
    letter-spacing: -0.045em;
  }
`;

/** 인디케이터 */
const PillTabs = styled.div`
    position: relative;
    z-index: 9999;
    pointer-events: auto;
    transform: translateZ(0);

    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;

    padding: 7px 8px;
    border-radius: 999px;

    background: rgba(255, 255, 255, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.55);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    backdrop-filter: blur(10px);

    max-width: min(920px, 100%);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
`;

/** 랜딩 본문(아래 섹션) */
const Inner = styled.main`
    position: relative;

    width: min(1120px, 100%);
    margin: 0 auto;

    padding: 64px 20px 110px;

    @media (max-width: 720px) {
        padding: 44px 16px 96px;
    }
`;

const StageWrap = styled.div`
    position: relative;
    z-index: 2;
    isolation: isolate;
    width: 100%;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;

    --frame-h: clamp(540px, calc(100svh - 300px), 600px);
    @supports not (height: 100svh) {
        --frame-h: clamp(540px, calc(100vh - 300px), 600px);
    }

    --frame-w: min(
            calc(var(--frame-h) * 2),
            2240px,
            calc(100vw - 24px)
    );

    @media (max-width: 1080px) {
        --frame-h: clamp(520px, calc(100svh - 240px), 640px);
        @supports not (height: 100svh) {
            --frame-h: clamp(520px, calc(100vh - 240px), 640px);
        }

        --frame-w: min(
                calc(var(--frame-h) * 2),
                1120px,
                calc(100% - 20px)
        );
    }
`;

/** 왼쪽 설명 카드: 프레임 바깥 왼쪽에 겹쳐서 배치 */
const LeftInfo = styled.aside`
    font-family: "Pretendard Variable", Pretendard, "Noto Sans KR", system-ui, -apple-system, "Segoe UI", sans-serif;

    position: relative;
    z-index: 1;

    width: 100%;
    height: 100%;

    background: rgba(255, 255, 255, 0.58);
    border-right: 1px solid rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(10px);

    overflow: hidden;
    display: grid;
    align-items: start;

    @media (max-width: 720px) {
        height: auto;
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.65);
    }
`;

/** 슬라이드별 텍스트 전환 */
const LeftInfoItem = styled.div<{ $active: boolean }>`
    position: absolute;
    inset: 0;
    padding: 52px 28px 32px;

    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transform: ${({ $active }) => ($active ? "translateY(0)" : "translateY(8px)")};
    transition: opacity 240ms ease, transform 320ms ease;

    h2 {
        margin: 0;
        font-size: 34px;
        font-weight: 700;
        letter-spacing: -0.06em;
        line-height: 1.12;
        color: rgba(17, 24, 39, 0.96);
    }

    > p {
        margin: 18px 0 0;
        font-size: 13.5px;
        font-weight: 500;
        line-height: 1.78;
        letter-spacing: -0.02em;
        color: rgba(55, 65, 81, 0.72);
        max-width: 32ch;
    }

    @media (max-width: 720px) {
        position: relative;
        inset: auto;

        display: ${({ $active }) => ($active ? "block" : "none")};
        opacity: 1;
        transform: none;
        transition: none;

        padding: 22px 18px;

        > p {
            max-width: 70ch;
        }
    }
`;

const QuizTypes = styled.div`
    margin-top: 28px;
    display: grid;
    gap: 22px;
`;

const Icon = styled.span`
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
        width: 22px;
        height: 22px;
        display: block;
        stroke: rgba(17, 24, 39, 0.7);
    }
`;

const QuizTypeItem = styled.div`
    display: grid;
    grid-template-columns: 22px 1fr;
    column-gap: 12px; 
    row-gap: 6px;
    align-items: start;

    ${Icon} {
        grid-column: 1;
        grid-row: 1;
        margin-top: 2px;
    }

    h3 {
        grid-column: 2;
        grid-row: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1.15;
        color: rgba(17, 24, 39, 0.96);
    }

    p {
        grid-column: 1 / -1;
        grid-row: 2;
        margin: 0;
        font-size: 13px;
        font-weight: 520;
        line-height: 1.68;
        letter-spacing: -0.015em;
        color: rgba(55, 65, 81, 0.72);
        max-width: 34ch;
    }
`;

function IconChoice() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
            <path d="M7 6v0" />
        </svg>
    );
}

function IconOX() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="geometricPrecision"
        >
            {/* O */}
            <circle cx="8" cy="12" r="4.1" strokeWidth="1.8" />

            {/* X: 살짝 축소(끝점만 안으로) */}
            <g strokeWidth="2.0">
                <path d="M13.6 8.1 L21.4 15.9" />
                <path d="M21.4 8.1 L13.6 15.9" />
            </g>
        </svg>
    );
}

function IconOMark() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="geometricPrecision"
        >
            <circle cx="12" cy="12" r="7.2" />
        </svg>
    );
}

function IconXMark() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="geometricPrecision"
        >
            <path d="M7 7l10 10" />
            <path d="M17 7L7 17" />
        </svg>
    );
}

function IconInitial() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4.5" y="5.5" width="15" height="13" rx="2.5" />
            <path d="M8 10h8" />
            <path d="M8 14h5" />
        </svg>
    );
}

function IconTopics() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* grid of 4 tiles */}
            <rect x="4.5" y="4.5" width="7" height="7" rx="1.6" />
            <rect x="12.5" y="4.5" width="7" height="7" rx="1.6" />
            <rect x="4.5" y="12.5" width="7" height="7" rx="1.6" />
            <rect x="12.5" y="12.5" width="7" height="7" rx="1.6" />
        </svg>
    );
}

function IconModes() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* sliders */}
            <path d="M5 7h14" />
            <circle cx="9" cy="7" r="2" />
            <path d="M5 12h14" />
            <circle cx="15" cy="12" r="2" />
            <path d="M5 17h14" />
            <circle cx="11" cy="17" r="2" />
        </svg>
    );
}

function IconDifficulty() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* bar chart */}
            <path d="M5 19V11" />
            <path d="M10 19V8" />
            <path d="M15 19V13" />
            <path d="M20 19V6" />
            <path d="M4 19h17" />
        </svg>
    );
}

function IconReviewStatus() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* check in a circle */}
            <circle cx="12" cy="12" r="8" />
            <path d="M8.7 12.2l2.2 2.2 4.6-5.1" />
        </svg>
    );
}

function IconRelatedTerms() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* tag + small link 느낌 */}
            <path d="M7 7h6l4 4-6 6-4-4V7z" />
            <path d="M9.5 9.5h.01" />
            <path d="M14.2 13.1l2.2-2.2" />
            <path d="M16.4 13.1l-2.2 2.2" />
        </svg>
    );
}

function IconFilter() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* funnel */}
            <path d="M5 6h14" />
            <path d="M7 10h10" />
            <path d="M10 14h4" />
            <path d="M11 14v5l2-1.2V14" />
        </svg>
    );
}

function IconRetry() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* replay arrow */}
            <path d="M7.5 8.5H5V6" />
            <path d="M5 8.5a7 7 0 1 1-1 3.6" />
            <path d="M12 9v3l2 2" />
        </svg>
    );
}

function IconTimeline() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* vertical timeline */}
            <path d="M8 5v14" />
            <circle cx="8" cy="7" r="1.6" />
            <circle cx="8" cy="12" r="1.6" />
            <circle cx="8" cy="17" r="1.6" />
            <path d="M12 7h7" />
            <path d="M12 12h6" />
            <path d="M12 17h5" />
        </svg>
    );
}

function IconCalendarFilter() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* calendar */}
            <rect x="4.5" y="5.5" width="15" height="14" rx="2.2" />
            <path d="M8 4.5v3" />
            <path d="M16 4.5v3" />
            <path d="M4.5 9h15" />
            {/* small filter mark */}
            <path d="M14.5 13h4" />
            <path d="M15.5 15.5h2" />
            <path d="M16.2 13v5" />
        </svg>
    );
}

function IconStats() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* line chart */}
            <path d="M5 18.5V6.5" />
            <path d="M5 18.5h14" />
            <path d="M7.5 14l3-3 2.5 2.2 4-5" />
            <circle cx="7.5" cy="14" r="1.1" />
            <circle cx="10.5" cy="11" r="1.1" />
            <circle cx="13" cy="13.2" r="1.1" />
            <circle cx="17" cy="8.2" r="1.1" />
        </svg>
    );
}

function IconInsights() {
    return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* spark / insight */}
            <path d="M12 3.8v3" />
            <path d="M12 17.2v3" />
            <path d="M3.8 12h3" />
            <path d="M17.2 12h3" />
            <path d="M6.2 6.2l2.1 2.1" />
            <path d="M15.7 15.7l2.1 2.1" />
            <path d="M17.8 6.2l-2.1 2.1" />
            <path d="M8.3 15.7l-2.1 2.1" />
            <circle cx="12" cy="12" r="2.6" />
        </svg>
    );
}

const fadeUpHero = keyframes`
  0% { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const fadeUp = keyframes`
    0% { opacity: 0; transform: translateY(20px) scale(0.98); }
    100% { opacity: 1; transform: translateY(0px) scale(1); }
`;

const waveDrift = keyframes`
    0%   { opacity: 0.18; }
    50%  { opacity: 0.32; }
    100% { opacity: 0.18; }
`;

const HeroBlock = styled.div`
    text-align: center;

    padding-top: var(--hero-shift-y);

    margin-bottom: 14px;
    pointer-events: none;

    @media (max-width: 640px) {
        text-align: left;
        width: 100%;
    }
`;

const HeroKicker = styled.h1`
    margin: 0 0 6px;
    font-size: clamp(44px, 6vw, 68px);
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;

    opacity: 0;
    animation: ${fadeUpHero} 0.55s ease forwards;
    animation-delay: 0.02s;
`;

const HeroTitle = styled.h2`
    margin: 0 0 8px;
    font-size: 36px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;

    opacity: 0;
    animation: ${fadeUpHero} 0.55s ease forwards;
    animation-delay: 0.12s;

    .strong {
        font-weight: 800;
    }

    @media (max-width: 640px) {
        font-size: 26px;
    }
`;

const HeroCTA = styled.div`
    margin-top: calc(18px + (var(--hero-shift-y) * 0.55));

    display: flex;
    justify-content: center;

    pointer-events: auto;

    opacity: 0;
    animation: ${fadeUp} 0.55s ease forwards;
    animation-delay: 0.28s;

    @media (max-width: 1080px) {
        margin-top: calc(14px + (var(--hero-shift-y) * 0.45));
    }
`;

const HeroStartButton = styled.button`
    pointer-events: auto;
    height: 60px;            
    padding: 0 24px;         
    min-width: 320px;
    border-radius: 999px;
    border: none;

    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    font-family: "Pretendard Variable", Pretendard, "Noto Sans KR", system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;

    color: rgba(255, 255, 255, 0.98);
    background: linear-gradient(90deg, #3a83f3, #11b884);
    box-shadow: 0 22px 70px rgba(58, 131, 243, 0.22);

    transition: transform 120ms ease, box-shadow 180ms ease, filter 180ms ease;

    &:hover {
        box-shadow: 0 28px 86px rgba(17, 184, 132, 0.22);
        filter: brightness(1.03);
    }

    &:active {
        transform: translateY(1px) scale(0.99);
        filter: brightness(0.99);
    }

    &:focus-visible {
        outline: none;
        box-shadow:
                0 0 0 6px rgba(58, 131, 243, 0.16),
                0 28px 86px rgba(17, 184, 132, 0.22);
    }

    @media (max-width: 720px) {
        height: 52px;
        padding: 0 18px;
        font-size: 15px;
        min-width: 0;
        width: min(100%, 360px);
    }
`;

const Section = styled.section`
    margin-top: 110px;

    @media (max-width: 720px) {
        margin-top: 84px;
    }
`;

const SectionHead = styled.div`
    margin-bottom: 34px;
    text-align: center;

    @media (max-width: 720px) {
        margin-bottom: 26px;
    }
`;

const SectionTitle = styled.h2`
    margin: 0;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: rgba(17, 24, 39, 0.95);
`;

const SectionDesc = styled.p`
    margin: 10px auto 0;
    max-width: 64ch;
    font-size: 15px;
    line-height: 1.75;
    font-weight: 540;
    letter-spacing: -0.01em;
    color: rgba(55, 65, 81, 0.72);
`;

const GlassCard = styled.div`
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.75);
    box-shadow: 0 18px 60px rgba(15, 23, 42, 0.10);
    backdrop-filter: blur(10px);
`;

const FAQWrap = styled.div`
    margin-top: 44px;
    display: flex;
    justify-content: center;

    @media (max-width: 720px) {
        margin-top: 34px;
    }
`;

const FAQList = styled.div`
    width: min(820px, 100%);
`;

const FAQRow = styled.div`
    border-bottom: 1px solid rgba(17, 24, 39, 0.10);
`;

const FAQQuestion = styled.div`
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: rgba(17, 24, 39, 0.90);
    line-height: 1.6;

    @media (max-width: 720px) {
        font-size: 15.5px;
    }
`;

const FAQButton = styled.button`
    width: 100%;
    padding: 22px 6px;
    background: transparent;
    border: none;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    text-align: left;

    &:hover ${FAQQuestion} {
        color: rgba(17, 24, 39, 0.96);
    }

    @media (max-width: 720px) {
        padding: 18px 2px;
    }
`;

const FAQChevron = styled.span<{ $open: boolean }>`
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    opacity: 0.65;

    transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
    transition: transform 180ms ease, opacity 180ms ease;

    background: currentColor;
    color: rgba(17, 24, 39, 0.72);

    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M6.7 9.3a1 1 0 0 1 1.4 0L12 13.2l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.7a1 1 0 0 1 0-1.4'/%3E%3C/svg%3E") center / contain no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M6.7 9.3a1 1 0 0 1 1.4 0L12 13.2l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.7a1 1 0 0 1 0-1.4'/%3E%3C/svg%3E") center / contain no-repeat;
`;

const FAQAnswer = styled.div<{ $open: boolean }>`
    display: grid;
    grid-template-rows: ${({ $open }) => ($open ? "1fr" : "0fr")};
    transition: grid-template-rows 360ms cubic-bezier(0.22, 1, 0.36, 1);
`;

const FAQAnswerInner = styled.div<{ $open: boolean }>`
  overflow: hidden;

  padding: ${({ $open }) => ($open ? "0 6px 18px" : "0 6px 0")};

  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) => ($open ? "translateY(0)" : "translateY(-6px)")};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};

  transition:
    padding 360ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 220ms ease,
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1);

  will-change: opacity, transform;

  p {
    margin: 0;
    font-size: 15px;
    line-height: 1.62;
    font-weight: 430;
    letter-spacing: -0.02em;
    color: rgba(55, 65, 81, 0.68);
    max-width: 70ch;
  }

  @media (max-width: 720px) {
    padding: ${({ $open }) => ($open ? "0 2px 16px" : "0 2px 0")};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;
  }
`;

const StepIcon = styled.div<{ $active: boolean; $tone: "primary" | "mint" | "violet" }>`
    width: 54px;
    height: 54px;
    border-radius: 18px;
    display: grid;
    place-items: center;

    background:
            ${({ $tone }) =>
                    $tone === "primary"
                            ? "linear-gradient(180deg, rgba(58,131,243,0.22), rgba(255,255,255,0.76))"
                            : $tone === "mint"
                                    ? "linear-gradient(180deg, rgba(17,184,132,0.22), rgba(255,255,255,0.76))"
                                    : "linear-gradient(180deg, rgba(155,81,224,0.22), rgba(255,255,255,0.76))"};

    border: 1px solid rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(10px);

    box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.10),
            0 0 0 ${({ $active }) => ($active ? "6px" : "0px")} rgba(58, 131, 243, 0.14);

    transform:
            translateY(var(--step-icon-shift, 0px))
            ${({ $active }) => ($active ? "translateY(-2px) scale(1.02)" : "scale(1)")};

    transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease;

    svg {
        width: 24px;
        height: 24px;
        stroke: ${({ $tone }) =>
                $tone === "primary"
                        ? "rgba(58,131,243,0.98)"
                        : $tone === "mint"
                                ? "rgba(17,184,132,0.98)"
                                : "rgba(155,81,224,0.98)"};
    }
`;

const StepCardNew = styled(GlassCard)<{ $active: boolean }>`
    width: 100%;
    padding: 16px 16px 15px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.58);

    box-shadow:
            0 18px 60px rgba(15, 23, 42, 0.10),
            0 0 0 ${({ $active }) => ($active ? "1px" : "0px")} rgba(58, 131, 243, 0.14);

    transform: ${({ $active }) => ($active ? "translateY(-2px)" : "translateY(0)")};
    transition: transform 220ms ease, box-shadow 220ms ease;

    @media (max-width: 900px) {
        grid-column: 2;
    }
`;

const StepBadgeNew = styled.div`
    display: inline-flex;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 820;
    letter-spacing: 0.02em;
    color: rgba(17, 24, 39, 0.78);
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.75);
`;

const StepTitleNew = styled.h3`
    margin: 12px 0 0;
    font-size: 18px;
    font-weight: 820;
    letter-spacing: -0.02em;
    color: rgba(17, 24, 39, 0.95);
`;

const StepDescNew = styled.p`
    margin: 8px 0 0;
    font-size: 14px;
    line-height: 1.62;
    font-weight: 430;
    letter-spacing: -0.02em;
    color: rgba(55, 65, 81, 0.68);
`;

const PinStage = styled.section`
    position: relative;
    z-index: 1;

    width: 100%;
    margin-left: 0;
    margin-right: 0;

    height: 280vh;
    margin-top: 110px;

    @media (max-width: 900px) {
        height: 240vh;
        margin-top: 84px;
    }
`;

const PinSticky = styled.div`
    position: sticky;
    top: calc(var(--ptn-header-h, 0px) + 14px);
    height: calc(100vh - (var(--ptn-header-h, 0px) + 24px));
    display: grid;
    place-items: center;
`;

const PinInner = styled.div`
    width: min(1120px, calc(100% - 40px));
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    align-items: center;
`;

const SectionHeadBig = styled.div`
    width: 100%;
    text-align: center;

    margin-top: -10px;
    margin-bottom: 20px;

    display: flex;
    flex-direction: column;
    align-items: center;

    @media (max-width: 900px) {
        margin-top: -6px;
        margin-bottom: 16px;
    }
`;

const SectionTitleBig = styled.h2`
    margin: 0;
    font-size: 36px; 
    font-weight: 700;
    letter-spacing: -0.03em;
    color: rgba(17, 24, 39, 0.95);
    line-height: 1.2;
`;

const SectionDescBig = styled.p`
    margin: 12px auto 0;    /* 14px → 12px */

    max-width: 60ch;
    font-size: clamp(16px, 1.35vw, 20px);
    line-height: 1.7;
    font-weight: 560;
    letter-spacing: -0.015em;
    color: rgba(55, 65, 81, 0.72);
`;

/** Flow 자체를 ‘한 화면’ 느낌으로 크게 */
const FlowWrapBig = styled.div`
    --pad-x: 28px;
    --line-top: 14px;

    --wave-h: clamp(360px, 36vw, 420px);

    --grid-top: calc(var(--wave-h) - 18px);

    width: 100%;
    margin: 0 auto;
    position: relative;
    padding: 46px var(--pad-x) 22px;

    border-radius: 34px;
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;

    @media (max-width: 900px) {
        --wave-h: 300px;
        padding: 24px 16px 16px;
        border-radius: 24px;
    }
`;

const FlowLineBig = styled.div`
    position: absolute;
    top: 0;

    left: var(--pad-x);
    right: var(--pad-x);

    height: calc(var(--line-top) + var(--wave-h));

    pointer-events: none;
    z-index: 0;

    padding-top: var(--line-top);

    svg {
        width: 100%;
        height: var(--wave-h);
        display: block;
    }

    path {
        fill: none;
        stroke-linecap: round;
    }

    path.ghost {
        stroke: rgba(17, 24, 39, 0.075);
        stroke-width: 5.2;
        transform-origin: center;
        animation: ${waveDrift} 7.2s ease-in-out infinite;
    }

    path.progress {
        stroke: rgba(58, 131, 243, 0.58);
        stroke-width: 6.2;
        stroke-dasharray: 1000;
        stroke-dashoffset: calc(1000 * (1 - var(--p)));
        filter: drop-shadow(0 14px 34px rgba(58, 131, 243, 0.18));
        transition: stroke-dashoffset 140ms linear;
    }

    @media (max-width: 900px) {
        display: none;
    }

    @media (prefers-reduced-motion: reduce) {
        path.ghost { animation: none; }
    }
`;

const FlowGridBig = styled.div`
    position: relative;
    z-index: 1;

    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    align-items: start;

    justify-items: center;

    padding-top: var(--grid-top);

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        padding-top: 0;
        gap: 14px;
        padding-left: 10px;

        &::before {
            content: "";
            position: absolute;
            left: 30px;
            top: 8px;
            bottom: 8px;
            width: 2px;
            border-radius: 999px;
            background: linear-gradient(
                    180deg,
                    rgba(58,131,243,0.18),
                    rgba(17,184,132,0.14),
                    rgba(155,81,224,0.14)
            );
            opacity: 0.85;
        }
    }
`;

const StepIconBig = styled(StepIcon)`
    width: 72px;
    height: 72px;
    border-radius: 24px;

    svg {
        width: 28px;
        height: 28px;
    }

    @media (max-width: 900px) {
        width: 54px;
        height: 54px;
        border-radius: 18px;
        grid-column: 1;
    }
`;

const FlowStepBig = styled.div<{ $active: boolean }>`
    width: min(340px, 100%);
    justify-self: center;

    display: grid;
    justify-items: center;
    gap: 14px;

    transform: ${({ $active }) => ($active ? "translateY(-8px)" : "translateY(0)")};
    transition: transform 220ms ease;

    @media (max-width: 900px) {
        width: 100%;
        grid-template-columns: 64px 1fr;
        justify-items: stretch;
        align-items: start;
        gap: 12px;
        transform: ${({ $active }) => ($active ? "translateY(-2px)" : "translateY(0)")};
    }
`;

const StepCardBig = styled(StepCardNew)<{ $active: boolean }>`
    padding: 22px 20px 18px;
    border-radius: 26px;

    @media (max-width: 900px) {
        grid-column: 2;
    }
`;

const StepBadgeBig = styled(StepBadgeNew)`
    font-size: 13px;

    background: rgba(17, 24, 39, 0.92);
    color: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.14);
`;

const StepTitleBig2 = styled(StepTitleNew)`
    font-size: 22px;
    font-weight: 750;
    letter-spacing: -0.02em;
`;

const StepDescBig2 = styled(StepDescNew)`
    font-size: 15px;
    line-height: 1.7;
`;

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

function magnetize(
    p: number,
    centers: number[] = [0.18, 0.55, 0.88],
    radius = 0.12,
    strength = 0.55
) {
    let out = p;

    for (const c of centers) {
        const d = Math.abs(out - c);
        if (d < radius) {
            // 중심에 가까울수록 1에 가까워지는 weight
            const w = 1 - smoothstep(0, radius, d);
            // weight * strength만큼 center로 끌어당김
            out = lerp(out, c, w * strength);
        }
    }
    return clamp(out, 0, 1);
}

const FlowIconsBig = styled.div`
    position: absolute;

    left: var(--pad-x);
    right: var(--pad-x);

    top: var(--line-top);
    height: var(--wave-h);

    pointer-events: none;

    z-index: 10;

    @media (max-width: 900px) {
        display: none;
    }
`;

const WaveIconAnchor = styled.div`
    position: absolute;
    transform: translate(-50%, -50%);
`;

const StepIconCurve = styled(StepIcon)<{ $active: boolean; $tone: "primary" | "mint" | "violet" }>`
    width: 72px;
    height: 72px;
    border-radius: 24px;

    transform: ${({ $active }) => ($active ? "scale(1.03)" : "scale(1)")};

    svg { width: 28px; height: 28px; }

    @media (max-width: 900px) { display: none; }
`;

const StepIconBigMobile = styled(StepIconBig)`
    @media (min-width: 901px) {
        display: none;
    }
`;

type PreviewType = "CHOICE" | "OX" | "INITIAL";

const PREVIEW2: Record<
    PreviewType,
    {
        q: string;
        a: string;
        why: string;
        hint?: string;
        choices?: string[];
        correctIndex?: number;
        initials?: string;

        accept?: string[];
    }
> = {
    CHOICE: {
        q: "브라우저에서 렌더 트리를 만들기 전에 수행되는 과정으로 가장 가까운 것은?",
        a: "DOM/CSSOM 생성",
        why: "HTML 파싱으로 DOM, CSS 파싱으로 CSSOM을 만든 뒤 결합해 렌더 트리를 구성해요.",
        choices: ["이벤트 루프 실행", "DOM/CSSOM 생성", "가비지 컬렉션 수행", "서비스 워커 등록"],
        correctIndex: 1,
    },
    OX: {
        q: "HTTP는 기본적으로 상태(state)를 유지하지 않는다.",
        a: "O",
        why: "HTTP는 stateless라 세션/쿠키/토큰 같은 별도 메커니즘으로 상태를 이어가요.",
    },
    INITIAL: {
        q: "컴포넌트 트리에서 데이터 흐름을 관리하는 전역 상태 관리 패턴은?",
        a: "플럭스 패턴(Flux Architecture)",
        why: "Flux는 Action → Dispatcher → Store → View의 단방향 흐름으로 전역 상태를 예측 가능하게 관리하는 아키텍처(패턴)예요.",
        initials: "ㅍㄹㅅㅍㅌ",
        accept: ["플럭스 패턴", "플럭스패턴"],
    },
};

type InitialJudge = "idle" | "correct" | "wrong";

const normalizeInitialAnswer = (s: string) =>
    String(s ?? "")
        .trim()
        .replace(/\([^)]*\)/g, "") // 괄호 내용 제거
        .replace(/\s+/g, "")       // 공백 제거
        .toLowerCase();

function QuizTypePreview() {
    const [type, setType] = React.useState<PreviewType>("CHOICE");

    // CHOICE
    const [pick, setPick] = React.useState<number | null>(null);

    // OX
    const [ox, setOx] = React.useState<"O" | "X" | null>(null);

    // INITIAL
    const [input, setInput] = React.useState("");
    const [submitted, setSubmitted] = React.useState(false);

    const [forceReveal, setForceReveal] = React.useState(false);

    React.useEffect(() => {
        // 탭 바뀌면 상태 초기화
        setPick(null);
        setOx(null);
        setInput("");
        setSubmitted(false);
        setForceReveal(false);
    }, [type]);

    const data = PREVIEW2[type];

    const answered =
        type === "CHOICE"
            ? pick != null && pick !== -999
            : type === "OX"
                ? ox != null
                : submitted;

    const reveal =
        (type === "CHOICE" ? pick != null : type === "OX" ? ox != null : submitted) || forceReveal;

    const showJudgePills = forceReveal || answered;

    const onReset = () => {
        setPick(null);
        setOx(null);
        setInput("");
        setSubmitted(false);
        setForceReveal(false);
    };

    const onRevealOnly = () => {
        // 답을 안 했어도 해설은 열 수 있게
        if (type === "CHOICE" && pick == null) setPick(-999); // 보기만 정답 표시
        setForceReveal(true);
    };

    const choiceCorrect = data.correctIndex ?? -1;
    const isForcedRevealChoice = type === "CHOICE" && pick === -999;

    const typeLabel = type === "CHOICE" ? "객관식" : type === "OX" ? "OX" : "초성";

    const hintText =
        type === "OX"
            ? ""
            : data.hint
                ? String(data.hint).replace(/^힌트:\s*/i, "").trim()
                : "";

    const correctOX = String(data.a ?? "").trim().toUpperCase() === "O" ? "O" : "X";

    const initialAnswerTiles = React.useMemo(() => {
        if (type !== "INITIAL") return "";

        const raw = String((data.accept?.[0] ?? data.a ?? ""));

        // 괄호 내용 제거 + 공백 제거
        const cleaned = raw.replace(/\([^)]*\)/g, "").replace(/\s+/g, "");

        // 한글/숫자만 남김 (예: "플럭스패턴")
        const kor = (cleaned.match(/[0-9가-힣]/g) ?? []).join("") || cleaned;

        // 초성 길이만큼만 맞춰주기(타일 개수 유지)
        const targetLen = (data.initials ?? "").length;
        return targetLen ? kor.slice(0, targetLen) : kor;
    }, [type, data]);

    const initialTileValue =
        type === "INITIAL"
            ? (reveal ? initialAnswerTiles : (data.initials ?? ""))
            : "";

    const initialJudge: InitialJudge = React.useMemo(() => {
        if (type !== "INITIAL" || !submitted) return "idle";

        const guess = normalizeInitialAnswer(input);
        const accepts = (data.accept?.length ? data.accept : [data.a]).filter(Boolean) as string[];

        const ok = accepts.some((a) => normalizeInitialAnswer(a) === guess);
        return ok ? "correct" : "wrong";
    }, [type, submitted, input, data]);

    return (
        <TypePreviewWrap>
            <TypeTabs role="tablist" aria-label="문제 유형 탭">
                <TypeTab
                    type="button"
                    role="tab"
                    aria-selected={type === "CHOICE"}
                    $active={type === "CHOICE"}
                    onClick={() => setType("CHOICE")}
                >
                    <span className="ic" aria-hidden><IconChoice /></span>
                    객관식
                </TypeTab>

                <TypeTab
                    type="button"
                    role="tab"
                    aria-selected={type === "OX"}
                    $active={type === "OX"}
                    onClick={() => setType("OX")}
                >
                    <span className="ic" aria-hidden><IconOX /></span>
                    OX
                </TypeTab>

                <TypeTab
                    type="button"
                    role="tab"
                    aria-selected={type === "INITIAL"}
                    $active={type === "INITIAL"}
                    onClick={() => setType("INITIAL")}
                >
                    <span className="ic" aria-hidden><IconInitial /></span>
                    초성
                </TypeTab>
            </TypeTabs>

            <TypePreviewRight>
                <MiniQuizCard>
                    <MiniScreen16x9>
                        <MiniScreenBody>
                            <MiniQuestion2>
                                <span className="qLead">Q.</span>
                                {data.q}
                            </MiniQuestion2>

                            {!!hintText && (
                                <MiniHintInScreen>
                                    <span className="k">HINT</span>
                                    <span className="v">{hintText}</span>
                                </MiniHintInScreen>
                            )}

                            {type === "CHOICE" && (
                                <MiniChoiceList role="radiogroup" aria-label="객관식 보기">
                                    {(data.choices ?? []).map((t, i) => {
                                        const selected = pick === i;
                                        const showCorrect = reveal || isForcedRevealChoice;
                                        const isCorrectOpt = i === choiceCorrect;

                                        const state =
                                            !showCorrect
                                                ? "idle"
                                                : isCorrectOpt
                                                    ? "correct"
                                                    : selected && !isCorrectOpt
                                                        ? "wrong"
                                                        : "idle";

                                        const lock = (pick != null && pick !== -999) || forceReveal;

                                        const showCorrectPill = showJudgePills && showCorrect && isCorrectOpt;
                                        const showWrongPill =
                                            showJudgePills && showCorrect && selected && !isCorrectOpt && pick != null && pick >= 0;

                                        return (
                                            <MiniChoiceRow key={t} $state={state} $active={selected}>
                                                <MiniChoiceBtn
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={selected}
                                                    disabled={lock}
                                                    onClick={() => {
                                                        if (lock) return;
                                                        setPick(i);
                                                    }}
                                                >
                                                    <MiniNum><span className="n">{i + 1}</span></MiniNum>
                                                    <span className="txt">{t}</span>

                                                    <MiniChoiceRight>
                                                        {showCorrectPill && <MiniAnswerPill>정답</MiniAnswerPill>}
                                                        {showWrongPill && <MiniAnswerPill $kind="wrong">오답</MiniAnswerPill>}
                                                    </MiniChoiceRight>
                                                </MiniChoiceBtn>
                                            </MiniChoiceRow>
                                        );
                                    })}
                                </MiniChoiceList>
                            )}

                            {type === "OX" && (
                                <MiniOX>
                                    <MiniOXBtn
                                        type="button"
                                        aria-label="O"
                                        $tone="o"
                                        $picked={ox === "O"}
                                        disabled={ox != null || forceReveal}
                                        onClick={() => setOx("O")}
                                    >
                                        <span className="mark" aria-hidden><IconOMark /></span>
                                        {showJudgePills && correctOX === "O" && <MiniPillCorner>정답</MiniPillCorner>}
                                        {showJudgePills && ox === "O" && correctOX !== "O" && (
                                            <MiniPillCorner $kind="wrong">오답</MiniPillCorner>
                                        )}
                                    </MiniOXBtn>

                                    <MiniOXBtn
                                        type="button"
                                        aria-label="X"
                                        $tone="x"
                                        $picked={ox === "X"}
                                        disabled={ox != null || forceReveal}
                                        onClick={() => setOx("X")}
                                    >
                                        <span className="mark" aria-hidden><IconXMark /></span>
                                        {showJudgePills && correctOX === "X" && <MiniPillCorner>정답</MiniPillCorner>}
                                        {showJudgePills && ox === "X" && correctOX !== "X" && (
                                            <MiniPillCorner $kind="wrong">오답</MiniPillCorner>
                                        )}
                                    </MiniOXBtn>
                                </MiniOX>
                            )}

                            {/* 초성 타일: 화면 중앙에 크게 */}
                            {type === "INITIAL" && (
                                <MiniInitialTilesStage>
                                    <InitialTiles value={initialTileValue} size="lg" judge={initialJudge} />
                                </MiniInitialTilesStage>
                            )}

                            <MiniDock data-open={reveal || isForcedRevealChoice}>
                                <MiniDockRow>
                                    <span className="k">정답</span>
                                    <span className="v">{data.a}</span>
                                </MiniDockRow>
                                <MiniDockRow>
                                    <span className="k">해설</span>
                                    <span className="v">{data.why}</span>
                                </MiniDockRow>
                            </MiniDock>
                        </MiniScreenBody>

                        {/* 정답 입력칸: Footer 바로 위 */}
                        <MiniScreenInputBar data-show={type === "INITIAL"}>
                            {type === "INITIAL" && (
                                <MiniInitial>
                                    <MiniInput
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="정답을 입력해보세요"
                                        disabled={submitted || forceReveal}
                                        aria-label="초성 퀴즈 정답 입력"
                                    />
                                    <MiniSubmit
                                        type="button"
                                        onClick={() => setSubmitted(true)}
                                        disabled={submitted || forceReveal || !input.trim()}
                                    >
                                        확인
                                    </MiniSubmit>
                                </MiniInitial>
                            )}
                        </MiniScreenInputBar>

                        <MiniScreenFooter>
                            <MiniFooterActions>
                                <MiniFooterGhost type="button" onClick={onReset}>
                                    다시 해보기
                                </MiniFooterGhost>

                                <MiniFooterPrimary type="button" onClick={onRevealOnly}>
                                    {reveal ? "해설 다시 보기" : "정답/해설 보기"}
                                </MiniFooterPrimary>
                            </MiniFooterActions>
                        </MiniScreenFooter>
                    </MiniScreen16x9>
                </MiniQuizCard>
            </TypePreviewRight>
        </TypePreviewWrap>
    );
}

const TypePreviewShell = styled(GlassCard)`
    font-family: "Pretendard Variable", Pretendard, "Noto Sans KR", system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;

    padding: 22px;
    border-radius: 34px;

    width: min(1120px, 100%);
    margin: 0 auto;

    background: rgba(255, 255, 255, 0.52);
    border: 1px solid rgba(255, 255, 255, 0.78);

    @media (max-width: 720px) {
        padding: 18px;
        border-radius: 22px;
    }
`;

const TypePreviewWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const TypeTabs = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
`;

const TypeTab = styled.button<{ $active: boolean }>`
    height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.82);
    background: ${({ $active }) =>
    $active ? "rgba(17, 24, 39, 0.90)" : "rgba(255, 255, 255, 0.55)"};
    color: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.96)" : "rgba(17, 24, 39, 0.90)"};

    display: inline-flex;
    align-items: center;
    gap: 8px;

    font-weight: 850;
    letter-spacing: -0.03em;

    cursor: pointer;
    transition: transform 120ms ease, background 180ms ease, box-shadow 180ms ease;

    &:active { transform: translateY(1px); }

    .ic {
        display: inline-flex;
        width: 18px;
        height: 18px;
    }
    .ic svg {
        width: 18px;
        height: 18px;
        stroke: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.92)" : "rgba(17,24,39,0.70)"};
    }
`;

const TypeBtnBase = styled.button`
    height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.82);
    font-weight: 900;
    letter-spacing: -0.02em;
    cursor: pointer;
    transition: transform 120ms ease, box-shadow 180ms ease, background 180ms ease;

    &:active {
        transform: translateY(1px);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
        transform: none;
    }
`;

const TypePreviewRight = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const MiniChoiceList = styled.div`
    margin-top: 12px;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 520px) {
        gap: 8px;
    }
`;

const MiniChoiceRow = styled.div<{ $state: "idle" | "correct" | "wrong"; $active: boolean }>`
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 18px;

  --tone-ring: ${({ $state, $active }) =>
    $state === "correct"
        ? "rgba(17,184,132,0.14)"
        : $state === "wrong"
            ? "rgba(239,68,68,0.12)"
            : $active
                ? "rgba(58,131,243,0.12)"
                : "rgba(0,0,0,0)"};

  --mini-num-bg: ${({ $state }) =>
    $state === "correct"
        ? "rgba(17,184,132,0.14)"
        : $state === "wrong"
            ? "rgba(239,68,68,0.12)"
            : "rgba(17,24,39,0.07)"};
  --mini-num-border: ${({ $state }) =>
    $state === "correct"
        ? "rgba(17,184,132,0.22)"
        : $state === "wrong"
            ? "rgba(239,68,68,0.20)"
            : "rgba(17,24,39,0.12)"};
  --mini-num-fg: ${({ $state }) =>
    $state === "correct"
        ? "rgba(17,184,132,0.92)"
        : $state === "wrong"
            ? "rgba(239,68,68,0.92)"
            : "rgba(17,24,39,0.82)"};

  background: ${({ $state }) =>
    $state === "correct"
        ? "linear-gradient(180deg, rgba(17,184,132,0.16) 0%, rgba(255,255,255,0.56) 76%)"
        : $state === "wrong"
            ? "linear-gradient(180deg, rgba(239,68,68,0.14) 0%, rgba(255,255,255,0.56) 76%)"
            : "rgba(255, 255, 255, 0.55)"};

  border: 1px solid
    ${({ $state }) =>
    $state === "correct"
        ? "rgba(17,184,132,0.28)"
        : $state === "wrong"
            ? "rgba(239,68,68,0.24)"
            : "rgba(255,255,255,0.78)"};

  box-shadow: ${({ $active, $state }) =>
    $active || $state !== "idle"
        ? `${$active ? "0 16px 40px rgba(15, 23, 42, 0.10), " : ""}0 0 0 6px var(--tone-ring)`
        : "none"};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.9;
    background:
      radial-gradient(240px 140px at 30% 18%, rgba(255,255,255,0.62), rgba(255,255,255,0) 60%),
      radial-gradient(260px 160px at 70% 0%, rgba(255,255,255,0.28), rgba(255,255,255,0) 58%);
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;


const MiniChoiceBtn = styled.button`
    width: 100%;
    height: 100%;
    padding: 14px 14px;
    border: none;
    background: transparent;
    cursor: pointer;

    --right-slot: clamp(64px, 14vw, 86px);

    display: grid;
    grid-template-columns: 30px minmax(0, 1fr) var(--right-slot);
    align-items: center;
    gap: 12px;
    text-align: left;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.78;
    }

    .txt {
        min-width: 0;
        font-size: 16px;
        line-height: 1.35;
        font-weight: 700;
        letter-spacing: -0.025em;
        color: rgba(17, 24, 39, 0.9);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @media (max-width: 720px) {
        .txt { font-size: 15px; }
    }
`;

const MiniChoiceRight = styled.span`
    width: var(--right-slot);
    min-width: var(--right-slot);

    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex: 0 0 auto;
`;

const MiniAnswerPill = styled.div<{ $kind?: "wrong" }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    height: 26px;              /* 24~28 사이 취향대로 */
    padding: 0 10px;
    line-height: 1;
    box-sizing: border-box;

    border-radius: 999px;
    font-size: 12px;
    font-weight: 950;
    letter-spacing: -0.01em;
    white-space: nowrap;

    color: ${({ $kind }) =>
    $kind === "wrong" ? "rgba(239,68,68,0.90)" : "rgba(17,184,132,0.92)"};

    background: ${({ $kind }) =>
    $kind === "wrong" ? "rgba(239,68,68,0.10)" : "rgba(17,184,132,0.12)"};

    border: 1px solid ${({ $kind }) =>
    $kind === "wrong" ? "rgba(239,68,68,0.18)" : "rgba(17,184,132,0.22)"};
`;

const MiniPillCorner = styled(MiniAnswerPill)`
  position: absolute;
  top: 10px;
  right: 10px;
  pointer-events: none;
`;

const MiniDock = styled.div`
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 16px;

    border-radius: 20px;
    background: rgba(17, 24, 39, 0.06);
    border: 1px solid rgba(17, 24, 39, 0.12);

    padding: 14px 14px;
    display: grid;
    gap: 10px;

    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
    visibility: hidden;

    transition: opacity 180ms ease, transform 220ms ease, visibility 0s linear 220ms;

    &[data-open="true"] {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
        visibility: visible;
        transition: opacity 180ms ease, transform 220ms ease, visibility 0s;
    }
`;

const MiniNum = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 11px;

    display: flex;
    align-items: center;
    justify-content: center;

    line-height: 1;      
    font-weight: 950;
    font-variant-numeric: tabular-nums;

    background: var(--mini-num-bg, rgba(17, 24, 39, 0.07));
    border: 1px solid var(--mini-num-border, rgba(17, 24, 39, 0.12));
    color: var(--mini-num-fg, rgba(17, 24, 39, 0.82));

    .n {
        display: block;
        transform: translateY(-0.5px);
    }
`;

const MiniOX = styled.div`
    margin-top: 14px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px; 
`;

const MiniOXBtn = styled.button<{ $tone: "o" | "x"; $picked: boolean }>`
    position: relative;
    display: grid;
    place-items: center;

    height: clamp(112px, 12vw, 148px);
    border-radius: 28px;
    border: 1px solid rgba(255, 255, 255, 0.78);

    cursor: pointer;
    font-size: 0;
    outline: none;

    background: rgba(255, 255, 255, 0.52);
    backdrop-filter: blur(10px);
    box-shadow:
            0 18px 60px rgba(15, 23, 42, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.70);

    color: ${({ $tone, $picked }) =>
    $picked
        ? $tone === "o"
            ? "rgba(17,184,132,0.95)"
            : "rgba(239,68,68,0.92)"
        : "#f2f2f2"};

    ${({ $tone, $picked }) =>
    $picked &&
    `
      border-color: ${
        $tone === "o" ? "rgba(17,184,132,0.30)" : "rgba(239,68,68,0.28)"
    };
      background: linear-gradient(
        180deg,
        ${
        $tone === "o"
            ? "rgba(17,184,132,0.16)"
            : "rgba(239,68,68,0.14)"
    } 0%,
        rgba(255,255,255,0.55) 72%
      );
      box-shadow:
        0 20px 70px rgba(15, 23, 42, 0.12),
        0 0 0 6px ${
        $tone === "o"
            ? "rgba(17,184,132,0.12)"
            : "rgba(239,68,68,0.10)"
    },
        inset 0 1px 0 rgba(255,255,255,0.75);
    `}

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        opacity: ${({ $picked }) => ($picked ? 0.95 : 0.75)};
        background:
                radial-gradient(220px 140px at 30% 20%, rgba(255,255,255,0.70), rgba(255,255,255,0) 60%),
                radial-gradient(240px 160px at 70% 0%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%);
        transition: opacity 180ms ease;
    }

    transition:
            transform 140ms ease,
            box-shadow 180ms ease,
            background 180ms ease,
            border-color 180ms ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow:
                0 22px 72px rgba(15, 23, 42, 0.12),
                inset 0 1px 0 rgba(255,255,255,0.75);
    }

    &:active {
        transform: translateY(0px) scale(0.99);
    }

    &:focus-visible {
        box-shadow:
                0 22px 72px rgba(15, 23, 42, 0.12),
                0 0 0 5px rgba(58, 131, 243, 0.14),
                inset 0 1px 0 rgba(255,255,255,0.75);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.88;
        transform: none;
    }

    .mark {
        display: grid;
        place-items: center;
        position: relative;
        z-index: 1;
    }

    .mark svg {
        width: clamp(64px, 7vw, 88px);
        height: clamp(64px, 7vw, 88px);
        stroke: currentColor;
    }

    .mark svg * {
        stroke-width: 10;
        vector-effect: non-scaling-stroke;
    }

    @media (max-width: 520px) {
        height: 108px;
        border-radius: 24px;
        .mark svg {
            width: 68px;
            height: 68px;
        }
    }
`;

const MiniInitial = styled.div`
    margin-top: 0;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
`;

const MiniInput = styled.input`
    height: 52px;             
    border-radius: 18px;     
    border: 1px solid rgba(255, 255, 255, 0.78);
    background: rgba(255, 255, 255, 0.55);
    padding: 0 14px;

    font-size: 15px;          
    font-weight: 800;
    letter-spacing: -0.02em;
    color: rgba(17, 24, 39, 0.92);

    outline: none;

    &:focus {
        border-color: rgba(58, 131, 243, 0.35);
        box-shadow: 0 0 0 4px rgba(58, 131, 243, 0.10);
    }

    &:disabled {
        opacity: 0.75;
    }
`;

const MiniSubmit = styled.button`
    height: 52px;             
    padding: 0 16px;         
    border-radius: 18px;   
    border: none;
    cursor: pointer;

    background: rgba(17, 24, 39, 0.88);
    color: rgba(255, 255, 255, 0.96);

    font-weight: 950;
    letter-spacing: -0.02em;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
    }
`;

const MiniDockRow = styled.div`
    display: flex;
    align-items: baseline;   
    gap: 12px;

    .k {
        flex: 0 0 48px;        
        white-space: nowrap;

        font-size: 13.5px;     
        line-height: 1.6;     
        font-weight: 950;
        letter-spacing: -0.02em;
        color: rgba(17, 24, 39, 0.72);
    }

    .v {
        flex: 1 1 auto;
        min-width: 0;

        font-size: 15.5px;     
        line-height: 1.6;    
        font-weight: 750;
        letter-spacing: -0.02em;
        color: rgba(17, 24, 39, 0.9);
        word-break: keep-all;
    }

    @media (max-width: 720px) {
        .k { font-size: 13px; }    
        .v { font-size: 14.5px; } 
    }
`;

const MiniScreen16x9 = styled.div`
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 24px;
    overflow: hidden;

    background: rgba(255, 255, 255, 0.44);
    border: 1px solid rgba(255, 255, 255, 0.75);
    box-shadow:
            0 18px 60px rgba(15, 23, 42, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.65);

    display: grid;
    grid-template-rows: auto 1fr auto auto;

    /* 접힌 코너/종이 느낌 제거 */
    &::before,
    &::after {
        content: none !important;
        display: none !important;
    }
`;

const MiniScreenBody = styled.div`
    grid-row: 2;
    position: relative;

    padding: 16px 16px 12px;

    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const MiniScreenFooter = styled.div`
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.40);
    border-top: 1px solid rgba(17, 24, 39, 0.10);
    grid-row: 4;
`;

const MiniFooterActions = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
`;

const MiniFooterGhost = styled.button`
    height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.82);
    background: rgba(255, 255, 255, 0.60);
    color: rgba(17, 24, 39, 0.90);

    font-weight: 950;
    letter-spacing: -0.02em;
    cursor: pointer;

    &:active { transform: translateY(1px); }
`;

const MiniFooterPrimary = styled.button`
    height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: none;

    background: linear-gradient(90deg, #3a83f3, #11b884);
    color: rgba(255,255,255,0.96);

    font-weight: 950;
    letter-spacing: -0.02em;
    cursor: pointer;

    &:active { transform: translateY(1px); }
`;

const MiniQuestion2 = styled.div`
    margin-top: 16px;

    font-size: 21px;   
    line-height: 1.62;
    font-weight: 750;
    letter-spacing: -0.02em;
    color: rgba(17, 24, 39, 0.94);

    .qLead {
        margin-right: 6px;
        color: rgba(58, 131, 243, 0.95);
        font-weight: 950;
    }

    @media (max-width: 720px) {
        font-size: 19px; 
    }
`;

const MiniHintInScreen = styled.div`
    margin-top: 10px;
    width: fit-content;
    max-width: 100%;

    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 999px;

    background: rgba(58, 131, 243, 0.10);
    border: 1px solid rgba(58, 131, 243, 0.18);

    .k {
        font-size: 12px;
        font-weight: 950;
        letter-spacing: 0.04em;
        color: rgba(58, 131, 243, 0.95);
    }
    .v {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: rgba(17, 24, 39, 0.88);
        white-space: nowrap;
    }
`;

const MiniQuizCard = styled(GlassCard)`
    position: relative;
    overflow: hidden;

    /* 접힌 코너/종이 효과 제거 */
    &::before,
    &::after {
        content: none !important;
        display: none !important;
    }
`;

function InitialTiles({
                          value,
                          size = "md",
                          judge = "idle",
                      }: {
    value: string;
    size?: "md" | "lg";
    judge?: InitialJudge;
}) {
    const chars = String(value ?? "").trim().split("").filter(Boolean);
    if (!chars.length) return null;

    return (
        <InitialTilesWrap $size={size} aria-label={`초성 ${value}`}>
            {chars.map((c, i) => (
                <InitialTile key={`${c}-${i}`} $size={size} $judge={judge}>
                    <span className="ch">{c}</span>
                </InitialTile>
            ))}
        </InitialTilesWrap>
    );
}

type InitialTileSize = "sm" | "md" | "lg";

const InitialTilesWrap = styled.div<{ $size: InitialTileSize }>`
    --tile: ${({ $size }) =>
    $size === "lg"
        ? "clamp(60px, 8.8vw, 98px)"
        : $size === "md"
            ? "clamp(42px, 6.5vw, 66px)"
            : "clamp(34px, 5.5vw, 54px)"};

    --gap: ${({ $size }) =>
    $size === "lg" ? "14px" : $size === "md" ? "10px" : "8px"};

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap);
    flex-wrap: nowrap;
`;

const InitialTile = styled.div<{ $size: "md" | "lg"; $judge: InitialJudge }>`
    width: var(--tile);
    height: var(--tile);

    border-radius: ${({ $size }) => ($size === "lg" ? "24px" : "18px")};

    display: grid;
    place-items: center;
    position: relative;
    overflow: hidden;

    --tile-bg: ${({ $judge }) =>
    $judge === "correct"
        ? "rgba(230, 253, 245, 0.95)"
        : $judge === "wrong"
            ? "rgba(255, 236, 236, 0.95)"
            : "rgba(233, 243, 255, 0.95)"};

    --tile-border: ${({ $judge }) =>
    $judge === "correct"
        ? "rgba(17, 184, 132, 0.65)"
        : $judge === "wrong"
            ? "rgba(239, 68, 68, 0.65)"
            : "rgba(58, 131, 243, 0.65)"};

    --tile-fg: ${({ $judge }) =>
    $judge === "correct"
        ? "rgba(17, 184, 132, 0.95)"
        : $judge === "wrong"
            ? "rgba(239, 68, 68, 0.95)"
            : "rgba(58, 131, 243, 0.95)"};

    background: var(--tile-bg);
    border: 2px solid var(--tile-border);

    box-shadow:
            0 14px 40px rgba(15, 23, 42, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.75);

    font-family: "GhanaChocolate", "Pretendard Variable", Pretendard, "Noto Sans KR",
    system-ui, -apple-system, "Segoe UI", sans-serif;

    font-weight: 500;
    font-size: ${({ $size }) =>
    $size === "lg"
        ? "clamp(32px, 3.9vw, 48px)"
        : "clamp(20px, 2.6vw, 30px)"};

    letter-spacing: -0.04em;
    color: var(--tile-fg);

    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;

    .ch {
        transform: translateY(1px);
    }

    &::before,
    &::after {
        content: none !important;
        display: none !important;
    }
`;

const MiniScreenInputBar = styled.div`
  grid-row: 3;
  padding: 12px 16px;

  background: rgba(255, 255, 255, 0.42);
  border-top: 1px solid rgba(17, 24, 39, 0.10);

  display: none;
  &[data-show="true"] {
    display: block;
  }
`;

const MiniInitialTilesStage = styled.div`
    flex: 1 1 auto;
    display: grid;
    place-items: center;

    margin-top: clamp(6px, 1.2vh, 12px);
    padding-top: 0;

    transform: translateY(-48px);

    @media (max-width: 720px) {
        transform: translateY(-24px);
    }
`;

function useInViewOnce<T extends Element>(opts?: {
    rootMargin?: string;
    threshold?: number;
}) {
    const ref = React.useRef<T | null>(null);
    const [inView, setInView] = React.useState(false);

    React.useEffect(() => {
        const el = ref.current;
        if (!el || inView) return;

        const io = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    setInView(true);
                    io.disconnect();
                }
            },
            {
                root: null,
                rootMargin: opts?.rootMargin ?? "0px 0px -10% 0px",
                threshold: opts?.threshold ?? 0.12,
            }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [inView, opts?.rootMargin, opts?.threshold]);

    return { ref, inView };
}

function Reveal({
                    children,
                    delay = 0,
                    y = 16,
                    scale = 0.995,
                    once = true,
                }: {
    children: React.ReactNode;
    delay?: number;
    y?: number;
    scale?: number;
    once?: boolean;
}) {
    const { ref, inView } = useInViewOnce<HTMLDivElement>({
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
    });

    return (
        <RevealBox
            ref={ref}
            data-show={inView ? "true" : "false"}
            style={
                {
                    ["--d" as any]: `${delay}ms`,
                    ["--y" as any]: `${y}px`,
                    ["--s" as any]: `${scale}`,
                } as React.CSSProperties
            }
        >
            {children}
        </RevealBox>
    );
}

const RevealBox = styled.div`
  opacity: 0;
  transform: translateY(var(--y, 16px)) scale(var(--s, 0.995));
  filter: blur(6px);
  transition:
    opacity 560ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 560ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 560ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--d, 0ms);
  will-change: opacity, transform, filter;

  &[data-show="true"] {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    filter: none;
    transform: none;
    opacity: 1;
  }
`;

const SvhProbe = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 100svh;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
`;