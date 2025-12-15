import React, { useMemo, useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import http, { authHeader } from "../utils/http";
import quiz1 from "../assets/hero/quiz-1.png";
import quiz2 from "../assets/hero/quiz-2.png";
import quiz3 from "../assets/hero/quiz-3.png";
import act1 from "../assets/quiz/quiz-actionbar-1.png";
import act2 from "../assets/quiz/quiz-actionbar-2.png";
import act3 from "../assets/quiz/quiz-actionbar-3.png";
import act4 from "../assets/quiz/quiz-actionbar-4.png";

/* ====== UI 토큰 ====== */
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

    color: {
        quizHover: "#2c73e5",
        primaryStrong: "#3E63E0",
        indigo50: "#EEF2FF",
    },

    gradient: { quizCta: "linear-gradient(90deg, #3E82E8 0%, #2BC6A6 100%)" },
};

export default function QuizHomePage() {
    const nav = useNavigate();
    const loc = useLocation();

    const slides = useMemo(
        () => [
            {
                id: "today",
                titlePrefix: "오늘의 ",
                titleEmphasis: "포텐퀴즈",
                subtitle: "하루 10분 투자로 당신의 가치를 만들어 나가세요",
                ctaLabel: "지금 포텐퀴즈 도전하기",
                artSrc: quiz1,
            },
            {
                id: "initials",
                titlePrefix: "오늘의 ",
                titleEmphasis: "초성퀴즈",
                subtitle: "AI 면접 준비, 초성퀴즈로 핵심 개념을 빠르게 점검하세요",
                ctaLabel: "지금 포텐퀴즈 도전하기",
                artSrc: quiz2,
            },
            {
                id: "ox",
                titlePrefix: "오늘의 ",
                titleEmphasis: "OX 퀴즈",
                subtitle: "이 개념 맞을까? 틀릴까? OX로 빠르게 체크해 보세요!",
                ctaLabel: "지금 포텐퀴즈 도전하기",
                artSrc: quiz3,
            },
        ],
        []
    );

    const actions = useMemo(
        () => [
            { id: "a1", label: "내 포텐노트",        icon: act1, to: "/poten-word/notes" },
            { id: "a2", label: "내 퀴즈 타임라인",  icon: act2, to: "/poten-word/quiz/timeline" },
            { id: "a3", label: "오답노트 바로 가기", icon: act3, to: "/poten-word/notes/wrong" },
            { id: "a4", label: "명예의 전당",        icon: act4, to: "/poten-word/hall" },
        ],
        []
    );

    const [idx, setIdx] = useState(0);
    const len = slides.length;

    const goPrev = useCallback(() => {
        setProgress(0);
        setIdx(p => (p - 1 + len) % len);
    }, [len]);
    const goNext = useCallback(() => {
        setProgress(0);
        setIdx(p => (p + 1) % len);
    }, [len]);

    const onStart = useCallback(() => {
        const id = slides[idx].id;
        const base = "/poten-word/quiz";

        const routeMap: Record<string, string> = {
            today:    `${base}/today`,
            initials: `${base}/initials`,
            ox:       `${base}/ox`,
        };

        nav(routeMap[id] ?? `${base}/play`, { state: loc.state });
    }, [slides, idx, nav, loc.state]);

    const AUTO_MS = 5000;               // 한 슬라이드 유지 시간(5초)
    const [auto, setAuto] = useState(true);
    const [progress, setProgress] = useState(0); // 0~1

// 자동 진행 + 프로그레스 업데이트
    useEffect(() => {
        if (!auto) return;                       // 정지 상태면 멈춤
        let raf: number;
        let start = performance.now();

        const loop = (now: number) => {
            const ratio = (now - start) / AUTO_MS;
            if (ratio >= 1) {
                start = now;
                goNext();
            } else {
                setProgress(ratio);
            }
            raf = requestAnimationFrame(loop);
        };

        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [auto, idx, goNext]);

    const jobGroups = [
        {
            id: "fe",
            title: "프론트엔드 개발자 추천 퀴즈",
            tag: "Frontend",
            tone: "blue",
            items: [
                { id: "js",   label: "JavaScript",    to: "/quiz/js" },
                { id: "react",label: "React",         to: "/quiz/react" },
                { id: "vue",  label: "Vue",           to: "/quiz/vue" },
                { id: "html", label: "HTML/CSS",      to: "/quiz/html-css" },
                { id: "ts",   label: "TypeScript 패턴",to: "/quiz/ts-pattern" },
                { id: "a11y", label: "웹 접근성",     to: "/quiz/a11y" },
            ],
        },
        {
            id: "be",
            title: "백엔드(서버 및 데이터베이스) 개발자 추천 퀴즈",
            tag: "Backend",
            tone: "green",
            items: [
                { id: "sql",   label: "SQL·데이터베이스 설계", to: "/quiz/sql" },
                { id: "rest",  label: "HTTP·REST API 설계",    to: "/quiz/rest" },
                { id: "spring",label: "Java·Spring Boot 핵심",  to: "/quiz/spring" },
                { id: "devops",label: "DevOps·클라우드",        to: "/quiz/devops" },
                { id: "redis", label: "캐싱·스케일링(Redis)",   to: "/quiz/redis" },
                { id: "sec",   label: "보안·인증",              to: "/quiz/security" },
            ],
        },
        {
            id: "fs",
            title: "풀스택 개발자 추천 퀴즈",
            tag: "Full-Stack",
            tone: "purple",
            items: [
                { id: "rag",   label: "LLM·RAG·파인튜닝",   to: "/quiz/rag" },
                { id: "exp",   label: "모델 평가·실험 설계", to: "/quiz/eval" },
                { id: "mlops", label: "MLOps·프로덕션 운영", to: "/quiz/mlops" },
                { id: "de",    label: "데이터 엔지니어링",   to: "/quiz/data-eng" },
                { id: "perf",  label: "성능 최적화·가속",    to: "/quiz/perf" },
                { id: "gov",   label: "책임 있는 AI·거버넌스",to: "/quiz/ai-gov" },
            ],
        },
        {
            id: "ai",
            title: "AI 개발자 추천 퀴즈",
            tag: "AI",
            tone: "slate",
            items: [
                { id: "rag2",  label: "LLM·RAG·파인튜닝",   to: "/quiz/ai-rag" },
                { id: "exp2",  label: "모델 평가·실험 설계", to: "/quiz/ai-eval" },
                { id: "mlops2",label: "MLOps·프로덕션 운영", to: "/quiz/ai-mlops" },
                { id: "de2",   label: "데이터 엔지니어링",   to: "/quiz/ai-de" },
                { id: "perf2", label: "성능 최적화·가속",    to: "/quiz/ai-perf" },
                { id: "gov2",  label: "책임 있는 AI·거버넌스",to: "/quiz/ai-gov2" },
            ],
        },
    ] as const;

    // ===== Job Quiz Setup state =====
    const [setupOpen, setSetupOpen] = useState(false);

    type QType = "mix" | "choice" | "ox" | "initials";
    type QLevel = "mix" | "easy" | "medium" | "hard";
    const [qCount, setQCount] = useState<number>(10);
    const [qType, setQType]   = useState<QType>("mix");
    const [qLevel, setQLevel] = useState<QLevel>("mix");

    type Topic = { id: string; label: string; to: string; groupId: string };
    const [topic, setTopic] = useState<Topic | null>(null);

    const toServerType = (t: QType) =>
        ({ mix: "MIX", choice: "CHOICE", ox: "OX", initials: "INITIALS" } as const)[t];
    const toServerLevel = (l: QLevel) =>
        ({ mix: "MIX", easy: "EASY", medium: "MEDIUM", hard: "HARD" } as const)[l];

    const onConfirmStart = () => {
       if (!topic) { alert("먼저 퀴즈를 선택해 주세요."); return; }
       const base = "/poten-word/quiz";
       nav(`${base}/play`, {
             state: {
               source: "topic",
                   topicKey: topic.id,
                   count: qCount,
                   type: toServerType(qType),
                   level: toServerLevel(qLevel),
                 },
       });
    };


    return (
        <PageWrap>
            <HeroWrap style={{
                ['--content-nudge' as any]: '20px',
                ['--hero-gap' as any]: '28px',
            }}
                      role="region"
                      aria-label="포텐퀴즈 배너"
                      tabIndex={0}
                      onKeyDown={(e) => {
                          if (e.key === "ArrowLeft") goPrev();
                          if (e.key === "ArrowRight") goNext();
                      }}
            >
                {/* ◀ 이전 */}
                <ArrowButton aria-label="이전" onClick={goPrev} $side="left">
                    <ArrowSvg viewBox="0 0 24 24"><polyline points="15 4 7 12 15 20" /></ArrowSvg>
                </ArrowButton>

                <HeroPanel data-slide={slides[idx].id}>
                    {/* 슬라이더 */}
                    <Slider aria-live="polite">
                        <Track $index={idx}>
                            {slides.map(slide => (
                                <SlideItem key={slide.id}>
                                    {/* 왼쪽: 텍스트 */}
                                    <SlideContent>
                                        <Title>
                                            {slide.titlePrefix}
                                            <Em>{slide.titleEmphasis}</Em>
                                        </Title>
                                        <Subtitle>{slide.subtitle}</Subtitle>

                                        <CTA
                                            $size="md"
                                            style={{ ['--cta-w' as any]: '230px' }}
                                            onClick={onStart}
                                            aria-label={slide.ctaLabel}
                                        >
                                            <strong>{slide.ctaLabel}</strong>
                                            <CtaIcon aria-hidden>
                                                <svg viewBox="0 0 24 24" width="18" height="18">
                                                    <path d="M8 5l8 7-8 7V5z" />
                                                </svg>
                                            </CtaIcon>
                                        </CTA>
                                    </SlideContent>
                                </SlideItem>
                            ))}
                        </Track>
                    </Slider>
                    {/* 슬라이더와 독립된 절대배치 아트 (잘림 방지) */}
                    <HeroArt aria-hidden="true">
                        <ArtImg key={slides[idx].artSrc} src={slides[idx].artSrc} alt="" />
                    </HeroArt>
                </HeroPanel>

                {/* ▶ 다음 */}
                <ArrowButton aria-label="다음" onClick={goNext} $side="right">
                    <ArrowSvg viewBox="0 0 24 24"><polyline points="9 4 17 12 9 20" /></ArrowSvg>
                </ArrowButton>
            </HeroWrap>
            <ProgressShell
                role="region"
                aria-label="슬라이드 진행 상태"
            >
                <Bar aria-hidden="true">
                    <Fill style={{ ['--p' as any]: progress }} />
                </Bar>

                <Counter>
                    <strong>{String(idx + 1).padStart(2, '0')}</strong>
                    <span>&nbsp;/&nbsp;{String(len).padStart(2, '0')}</span>
                </Counter>

                <Controls>
                    <CtrlBtn onClick={goPrev} aria-label="이전 슬라이드">←</CtrlBtn>
                    <CtrlBtn onClick={() => setAuto(a => !a)} aria-label={auto ? '일시정지' : '재생'}>
                        {auto ? 'Ⅱ' : '▶'}
                    </CtrlBtn>
                    <CtrlBtn onClick={goNext} aria-label="다음 슬라이드">→</CtrlBtn>
                </Controls>
            </ProgressShell>
            <QuickActions>
                <ActionsGrid role="list">
                    {actions.map((a, i) => (
                        <ActionItem
                            key={a.id}
                            role="listitem"
                            onClick={() => nav(a.to)}
                            aria-label={a.label}
                        >
                            <IconCircle>
                                <IconImg src={a.icon} alt="" aria-hidden $big={i === 0} />
                            </IconCircle>
                            <ActionLabel>{a.label}</ActionLabel>
                        </ActionItem>
                    ))}
                </ActionsGrid>
            </QuickActions>
            <JobSection>
                <JobsSurface>
                    <JobsHeading>
                        <strong>직무별 <em>퀴즈</em></strong>
                        <small>자신이 지원하고 싶은 분야만 골라서 풀어보기!</small>
                    </JobsHeading>

                    {jobGroups.map(group => (
                        <JobGroup key={group.id}>
                            <JobGroupTitle>{group.title}</JobGroupTitle>
                            <JobsGrid>
                                {group.items.map(it => (
                                    <JobCard
                                        key={it.id}
                                        $tone={group.tone}
                                        onClick={() => { setTopic({ ...it, groupId: group.id }); setSetupOpen(true); }}
                                        aria-label={`${it.label} 퀴즈 시작`}
                                    >
                                        <TagPill $tone={group.tone}>{group.tag}</TagPill>

                                        <CardRow>
                                            <CardTitle>{it.label}</CardTitle>
                                            <StartPill $tone={group.tone} aria-hidden>시작</StartPill>
                                        </CardRow>
                                    </JobCard>
                                ))}
                            </JobsGrid>
                        </JobGroup>
                    ))}

                    <MoreRow>
                        <MoreBtn onClick={() => nav('/poten-word/quiz/categories')}>
                            더 많은 직무 카테고리에서 고르기
                        </MoreBtn>
                    </MoreRow>
                </JobsSurface>
            </JobSection>
            <ShareSection>
                <ShareWrap>
                    <ShareHeading>
                        <strong>
                            내가 만든 <ShareAccent>포텐퀴즈</ShareAccent>를 아이포텐 회원들과 공유해 보세요
                        </strong>
                        <p>게시판에 퀴즈를 등록하고 댓글로 정답을 맞춰보세요.</p>
                    </ShareHeading>

                    <ShareButton
                        onClick={() => nav('/poten-word/quiz/post')}
                        aria-label="포텐퀴즈 지금 등록하기"
                    >
                        지금 등록하기
                    </ShareButton>
                </ShareWrap>
            </ShareSection>
            {setupOpen && (
                <Scrim role="dialog" aria-modal="true"
                       onClick={(e) => { if (e.target === e.currentTarget) setSetupOpen(false); }}>
                    <Sheet onClick={(e) => e.stopPropagation()}>
                        <SheetHeader>

                            <IconBox aria-hidden>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M8.5 9c.6-1.5 2.1-2.5 3.8-2.5 2.1 0 3.8 1.7 3.8 3.8 0 1.5-1 2.7-2.4 3.3-.9.4-1.3.8-1.3 1.9"
                                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </IconBox>
                            <TitleWrap>
                                <h3>{topic ? `${topic.label} 퀴즈 설정` : '퀴즈 설정'}</h3>
                                <small>문항 수, 유형, 난이도만 선택해 시작해요.</small>
                            </TitleWrap>
                            <CloseX aria-label="닫기" onClick={() => setSetupOpen(false)}>×</CloseX>
                        </SheetHeader>


                            <SheetBody>
                                {/* 문항 수 */}
                                <Section>
                                    <h4>문항 수</h4>
                                    <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                                        {[5,10,15,20,30].map(n => (
                                            <CountChip key={n} $on={qCount===n} onClick={()=>setQCount(n)}>
                                                {n}문항
                                            </CountChip>
                                        ))}
                                    </div>
                                </Section>

                                {/* 문제 유형 */}
                                <Section>
                                    <h4>문제 유형</h4>
                                    <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                                        <Chip $on={qType==="mix"}      onClick={()=>setQType("mix")}>유형 섞기</Chip>
                                        <Chip $on={qType==="choice"}   onClick={()=>setQType("choice")}>객관식</Chip>
                                        <Chip $on={qType==="ox"}       onClick={()=>setQType("ox")}>OX</Chip>
                                        <Chip $on={qType==="initials"} onClick={()=>setQType("initials")}>초성</Chip>
                                    </div>
                                </Section>

                                {/* 난이도 */}
                                <Section>
                                    <h4>문제 난이도</h4>
                                    <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                                        <Chip $on={qLevel==="mix"}    onClick={()=>setQLevel("mix")}>혼합</Chip>
                                        <Chip $on={qLevel==="easy"}   onClick={()=>setQLevel("easy")}>쉬움</Chip>
                                        <Chip $on={qLevel==="medium"} onClick={()=>setQLevel("medium")}>보통</Chip>
                                        <Chip $on={qLevel==="hard"}   onClick={()=>setQLevel("hard")}>어려움</Chip>
                                    </div>
                                </Section>
                        </SheetBody>

                        <SheetFooter>
                            <Ghost onClick={()=>setSetupOpen(false)}>취소</Ghost>
                            <Primary onClick={onConfirmStart}>시작하기</Primary>
                        </SheetFooter>
                    </Sheet>
                </Scrim>
            )}
            <Spacer />
        </PageWrap>
    );
}

/* ====== 스타일 ====== */
const PageWrap = styled.div`
    width: 100%;
    min-height: 100%;
    padding: 0 20px 40px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const HeroWrap = styled.section`
    position: relative;
    --hero-max: 1240px;
    width: 100%;
    max-width: var(--hero-max);
    margin: 0 auto;
    outline: none;

    margin-bottom: var(--hero-gap, 16px);

    /* 화살표 안전 영역 + 왼쪽으로 더 붙이고 싶을 때 쓰는 누지 값 */
    --arrow-safe: 50px;
    --content-nudge: 0px;

    @media (max-width: 640px) {
        --arrow-safe: 48px;
        /* --content-nudge: 8px; */
    }
`;

const HeroPanel = styled.div`
    position: relative;
    z-index: 1;
    background: ${UI.panelBgSoft};
    border: 1px solid ${UI.panelLineSoft};
    border-radius: ${UI.radiusXXL};
    box-shadow: ${UI.shadowSoft};
    min-height: clamp(180px, 22vw, 240px);
    padding: clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px);
    padding-left: calc(clamp(20px, 4vw, 32px) + max(0px, var(--arrow-safe) - var(--content-nudge)));
    margin-top: 25px;
    display: flex; align-items: center;
    overflow: visible;
    --art-w: min(280px, 28vw);
    --art-right: clamp(12px, 3vw, 28px);
    --art-pop: -22px;
    --art-space: calc(var(--art-w) + var(--art-right) + 8px);

    &[data-slide="initials"] {
        --art-right: clamp(22px, 9.6vw, 40px); /* 오른쪽 여유 4~6px 증가 */
        --art-nudge-x: -10px;
        /* 필요하면 아주 미세하게 축소
            --art-scale: 0.84;
        */
    }

    &::before{
        content:""; position:absolute; inset:0; border-radius:inherit;
        background: radial-gradient(900px 400px at 50% -180px, rgba(67,105,229,.06) 0%, rgba(67,105,229,0) 60%);
        pointer-events:none;
    }
`;

/* --- 슬라이더 --- */
const Slider = styled.div`
    position: relative;
    overflow: hidden;
    width: 100%;
    isolation: isolate;
`;

const Track = styled.div<{ $index: number }>`
    display: flex;
    flex-wrap: nowrap;            /* 한 줄 고정 → 겹침 방지 */
    transform: translateX(${p => `-${p.$index * 100}%`});
    transition: transform .45s cubic-bezier(.22,.61,.36,1);
    will-change: transform;

    @media (prefers-reduced-motion: reduce) { transition: none; }
`;

/* 한 화면 = 한 슬라이드, 2열 그리드 */
const SlideItem = styled.div`
    position: relative;
    min-width: 100%;
    flex: 0 0 100%;
    display: block;
    padding-right: var(--art-space);
    @media (max-width: 980px) { --art-w: min(240px, 32vw); }
    @media (max-width: 760px)  { --art-space: 0px; }
`;

/* 왼쪽 텍스트 열 */
const SlideContent = styled.div`
  display: flex; flex-direction: column; gap: 14px;
  max-width: 680px;  /* 문장 줄 길이 컨트롤 */
`;

/* 오른쪽 아트 열 */
const HeroArt = styled.div`

  position: absolute;
  inset-inline-end: var(--art-right);
  inset-block-start: 50%;
  --art-scale: 0.85;
    --art-nudge-x: 0px; /* 기본값: 이동 없음 */
    transform: translateY(calc(-50% + var(--art-pop))) translateX(var(--art-nudge-x)) scale(var(--art-scale));
  transform-origin: bottom right;
  width: var(--art-w);
  aspect-ratio: 1 / 1;
  pointer-events: none;
  z-index: 2;
  filter: drop-shadow(0 18px 30px rgba(67,105,229,.18));

  @media (max-width: 980px)  { --art-w: min(240px, 32vw); }
  @media (max-width: 760px)  { display: none; }
`;

/* 이미지 자체 */
const ArtImg = styled.img`
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: contain; user-select: none;
  animation: fade .24s ease;
  @keyframes fade { from { opacity: .01; transform: translateY(4px) } to { opacity: 1; transform: none } }

  /* 살짝 둥실 애니메이션 (선택) */
  //animation: bob 4.5s ease-in-out infinite;
  //@keyframes bob {
  //  0%   { transform: translateY(0) rotate(-2deg); }
  //  50%  { transform: translateY(-6px) rotate(0deg); }
  //  100% { transform: translateY(0) rotate(-2deg); }
  //}
  //@media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Title = styled.h1`
    margin: 0; font-size: clamp(22px, 3.2vw, 34px);
    line-height: 1.18; letter-spacing: -0.2px; color: ${UI.text};
`;
const Em = styled.span` color: ${UI.primaryBlue}; font-weight: 750; letter-spacing: -0.02em `;
const Subtitle = styled.p`
    margin: 0; color: ${UI.sub}; font-size: clamp(14px, 1.6vw, 16px); letter-spacing: -0.02em;
`;

/* 배너 CTA: QuizCta 동일 */
const CTA = styled.button<{ $size?: "sm" | "md" }>`
    /* 기존 토큰 */
    --cta-h: 48px; --cta-px: 18px; --cta-fs: 16px; --cta-ic: 28px;

    ${({ $size }) => $size === "sm" && `
    --cta-h: 40px; --cta-px: 14px; --cta-fs: 14px; --cta-ic: 24px;
  `}

        /* ⬇ 가로 길이 고정/제한용 변수 추가 */
    --cta-w: auto;           /* 예: 120px 로 덮어쓰면 고정폭 버튼 */
    width: var(--cta-w);
    max-width: 100%;
    text-align: left;
    
    margin-top: 15px;

    position: relative;
    isolation: isolate;
    overflow: hidden;         /* 말줄임을 위해 필요 */
    height: var(--cta-h);
    padding: 0 var(--cta-px);
    border: 0;
    border-radius: 999px;
    background: ${UI.gradient.quizCta};
    color: #fff;
    font-weight: 750;
    font-size: var(--cta-fs);
    letter-spacing: -0.02em;
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 10px;
    -webkit-tap-highlight-color: transparent;
    transition: transform 80ms ease;

    /* 텍스트만 줄어들게 (아이콘은 유지) */
    & > strong{
        font-weight: 600;
        flex: 1 1 auto;
        min-width: 0;              /* flex 아이템 말줄임 핵심 */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    & > * { position: relative; z-index: 1; }
    &::before{
        content:""; position:absolute; inset:0;
        background:${UI.color.quizHover};
        transform:scaleX(0); transform-origin:left center;
        transition: transform 260ms ease;
        z-index:-1; pointer-events:none;
    }
    &:hover::before, &:focus-visible::before { transform: scaleX(1); }
    &:active { transform: scale(0.98); }
    &:focus-visible { outline:none; box-shadow:0 0 0 3px rgba(79,118,241,.28); }

    @media (prefers-reduced-motion: reduce) { &::before{ transition: none; } }
`;

const CtaIcon = styled.span`
  width: var(--cta-ic);
  height: var(--cta-ic);
  flex: 0 0 auto;           /* 아이콘은 줄어들지 않게 고정 */
  border-radius: 999px;
  background: #ffffff;
  display: inline-grid; place-items: center;
  svg path { fill: ${UI.primaryBlue}; }
`;


/* ◀/▶ 애로우 버튼 */
const ArrowButton = styled.button<{ $side: "left" | "right" }>`
    position: absolute; top: 50%;
    ${(p) => (p.$side === "left" ? "left: 20px;" : "right: 20px;")}
    transform: translateY(-50%);
    width: 44px; height: 44px;
    border-radius: 10px; border: 0; background: transparent;
    display: grid; place-items: center; cursor: pointer;

    z-index: 3; /* 패널/텍스트 위로 */
    /* 모바일에서 누르기 쉽게 히트영역 확장 */
    &::after{
        content:""; position:absolute; inset:-6px; border-radius:12px;
    }

    &:hover svg { stroke: ${UI.arrowHover}; }
    &:active { transform: translateY(-50%) scale(0.98); }
    &:focus-visible { outline: 3px solid rgba(143,178,255,.6); outline-offset: 2px; }

    @media (min-width: 1280px) {
        ${(p) => (p.$side === "left" ? "left: 10px;" : "right: 10px;")}
    }
`;

const ArrowSvg = styled.svg`
    width: 28px; height: 28px;
    stroke: ${UI.arrow}; stroke-width: 3; fill: none;
    stroke-linecap: round; stroke-linejoin: round;
`;

const Spacer = styled.div` height: 4px; `;

const ProgressShell = styled.div`
  --hero-max: 1240px;
  max-width: var(--hero-max);
  width: 100%;
  margin: 8px auto 0;                 /* HeroWrap과의 간격 */
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 8px 18px;
  user-select: none;
`;

const Bar = styled.div`
  position: relative;
  height: 2px;
  background: #e5e7eb;               /* 트랙 */
  border-radius: 2px;
  overflow: hidden;
`;

const Fill = styled.div`
  position: absolute; inset: 0 auto 0 0;
  width: 100%;
  background: #0f172a;               /* 진행 바 색 */
  transform-origin: left center;
  transform: scaleX(var(--p, 0));    /* 0→1 로 자연스럽게 차오름 */
  transition: transform 120ms linear;
  will-change: transform;
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Counter = styled.div`
  font-size: 14px;
  color: ${UI.text};
  white-space: nowrap;
  strong { font-weight: 750; }
  span { color: ${UI.sub}; }
`;

const Controls = styled.div`
  display: inline-flex; align-items: center; gap: 14px;
`;

const CtrlBtn = styled.button`
  appearance: none;
  border: 0; background: transparent;
  font-size: 16px; line-height: 1;
  color: ${UI.text};
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 6px;
  &:hover { background: #f3f4f6; }
  &:focus-visible { outline: 2px solid rgba(79,118,241,.35); outline-offset: 2px; }
`;

const QuickActions = styled.section`
  --hero-max: 1240px;
  max-width: var(--hero-max);
  width: 100%;
  margin: 18px auto 0;
`;

const Divider = styled.div`
  height: 1px;
  background: #111827;
  opacity: .75;
  margin: 8px 0 22px;
  position: relative;
  display: none;

  &::after{
    content: "";
    position: absolute; left: 24px; top: 0;
    width: 92px; height: 2px;
    background: #111827;   /* 왼쪽 진한 부분(스크린샷 느낌) */
  }
`;

/* 동그란 아이콘 컨테이너 */
const IconCircle = styled.span<{ $big?: boolean }>`
    width: ${p => (p.$big ? '96px' : '88px')};
    height: ${p => (p.$big ? '96px' : '88px')};
    border-radius: 999px;
    background: #fff;
    border: 1px solid #e6e8ef;
    display: grid; place-items: center;
    box-shadow: 0 8px 24px rgba(62,99,224,.08);
    transition:
            transform 220ms cubic-bezier(.22,.61,.36,1),
            box-shadow 220ms ease,
            width 160ms ease,
            height 160ms ease;
    will-change: transform;
`;

const IconImg = styled.img<{ $big?: boolean }>`
    width: 72px; height: 72px;
    object-fit: contain;
    display: block;
    transform-origin: center;
    transform: ${p => (p.$big ? 'scale(0.8)' : 'none')}; /* ← 첫 번째만 살짝(12%) 확대 */
    transition: transform 160ms ease;
`;

const ActionsGrid = styled.ul`
  list-style: none;
  padding: 0; margin: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 24px 26px;
  justify-items: center;
  align-items: start;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
    row-gap: 22px;
  }
`;

const ActionItem = styled.button`
    appearance: none;
    border: 0;
    background: transparent;
    padding: 0;
    width: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
    cursor: pointer;
    box-shadow: none;
    transition: none;

    /* 데스크톱에서 아이콘만 살짝 움직이게 */
    @media (hover:hover) and (pointer:fine) {
        &:hover ${IconCircle} {
            transform: translateY(-2px) rotate(-2deg);
            box-shadow: 0 14px 30px rgba(62,99,224,.12);
            border-color: rgba(62,99,224,.25);
        }
    }

    /* 접근성: 포커스 시 아이콘에만 링 표시 */
    &:focus-visible ${IconCircle} {
        outline: 3px solid rgba(79,118,241,.35);
        outline-offset: 3px;
    }
`;

const ActionLabel = styled.span`
  font-size: 16px;
  letter-spacing: -0.02em;
  color: ${UI.text};
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
`;

/* ===== 직무별 퀴즈 영역 ===== */
const JobSection = styled.section`
  --hero-max: 1240px;
  max-width: var(--hero-max);
  width: 100%;
  margin: 28px auto 0;
`;

const JobsHeading = styled.header`
  display: flex;
  align-items: baseline;     /* 큰 제목과 보조문구 기준선 맞춤 */
  gap: 12px;                 /* 제목 ↔ 보조문구 간격 */
  flex-wrap: wrap;           /* 좁으면 줄바꿈 */
  margin-bottom: 14px;

  strong {
    font-size: 24px;
    color: ${UI.text};
    letter-spacing: -0.02em;
    white-space: nowrap;
  }
  em { color: ${UI.primaryBlue}; font-style: normal; }

  small {
    font-size: 14px;
    color: ${UI.sub};
    margin-top: 0;           /* 위쪽 여백 제거 */
    white-space: nowrap;     /* 한 줄 유지(원하면 지워도 됨) */
  }

  @media (max-width: 640px) {
    align-items: flex-start;
    gap: 6px;
  }
`;

const JobGroup = styled.section`
  &:not(:first-of-type){ margin-top: 22px; }
`;

const JobGroupTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 18px; font-weight: 750; letter-spacing: -0.02em;
  color: #121212;
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 12px;
  @media (max-width: 980px){ grid-template-columns: repeat(2, minmax(220px, 1fr)); }
  @media (max-width: 640px){ grid-template-columns: 1fr; }
`;

/* 톤 팔레트 */
const tones = {
    blue:  { cardBg:'#f6f9ff', border:'#CDE0FF', tagBg:'#ecf2ff', tag:'#3E63E0', startBg:'#3E63E0', startHover:'#3657c3', shadow:'rgba(62,99,224,.15)' },

    // Backend(이전 메시지에서 반영했던 값)
    green: { border:'#BAEBE0', cardBg:'rgba(248,251,255,.92)', tagBg:'#E9FBF6', tag:'#28C8A3', startBg:'#28C8A3', startHover:'#21b193', shadow:'rgba(40,200,163,.15)' },

    // Full-Stack
    purple:{ border:'#D7D4FF', cardBg:'rgba(248,251,255,.92)', tagBg:'#F2F0FF', tag:'#B5AFFF', startBg:'#B5AFFF', startHover:'#a29cff', shadow:'rgba(181,175,255,.15)' },

    // AI
    slate: { border:'#66747F', cardBg:'rgba(248,251,255,.92)', tagBg:'#EFF2F4', tag:'#66747F', startBg:'#66747F', startHover:'#56616a', shadow:'rgba(102,116,127,.15)' },
} as const;

type ToneKey = keyof typeof tones;

const StartBtn = styled.span<{ $tone: ToneKey }>`
  padding: 6px 10px;
  font-size: 13px; font-weight: 800;
  border-radius: 8px;
  background: ${p => tones[p.$tone].startBg};
  color: ${p => tones[p.$tone].tag};
  border: 1px solid rgba(0,0,0,.04);
`;

const JobCard = styled.button<{ $tone: ToneKey }>`
    width: 100%;
    text-align: left;
    border: 1.5px solid ${p => tones[p.$tone].border};
    background: ${p => tones[p.$tone].cardBg};
    border-radius: 14px 0px 14px 0px;
    padding: 16px 16px 18px;
    cursor: pointer;
    box-shadow: 0 3px 10px ${p => tones[p.$tone].shadow};
    transition: transform 160ms cubic-bezier(.22,.61,.36,1), box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease;

    @media (hover:hover) and (pointer:fine) {
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 18px ${p => tones[p.$tone].shadow};
        }
    }
    &:active { transform: translateY(-1px) scale(.995); }
    &:focus-visible { outline: 3px solid rgba(79,118,241,.35); outline-offset: 2px; }
`;

const TagPill = styled.span<{ $tone: ToneKey }>`
  display: inline-flex; align-items: center;
  height: 30px; padding: 0 14px;
  border-radius: 999px;
  font-size: 14px; font-weight: 700; letter-spacing: -.01em;
  color: ${p => tones[p.$tone].tag};
  background: ${p => tones[p.$tone].tagBg};
  border: 1.5px solid ${p => tones[p.$tone].tag};
`;

const StartPill = styled.span<{ $tone: ToneKey }>`
  display: inline-flex; align-items: center; justify-content: center;
  height: 32px; padding: 0 14px;
  border-radius: 10px;
  background: ${p => tones[p.$tone].startBg};
  color: #fff; font-weight: 750; font-size: 15px; letter-spacing: -.01em;
  box-shadow: 0 6px 14px ${p => tones[p.$tone].shadow};
  user-select: none;

  white-space: nowrap;   /* “시작” 절대 줄바꿈 안 되게 */
  flex: 0 0 auto;        /* 줄어들지 않도록 고정 */

  @media (hover:hover) and (pointer:fine) {
    &:hover { background: ${p => tones[p.$tone].startHover}; }
  }
`;

/* 제목 + 시작 pill 한 줄 */
const CardRow = styled.div`
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

/* 제목 */
const CardTitle = styled.h3`
    margin: 0;
    margin-left: 5px;
    font-size: 18px;
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: -.02em;
    color: ${UI.text};

    flex: 1 1 auto;
    min-width: 0;
`;

const MoreRow = styled.div`
  display: flex; justify-content: center;
  margin-top: 18px;
`;

const MoreBtn = styled.button`
  appearance: none; border: 0; background: transparent;
  color: ${UI.sub}; font-size: 14px; cursor: pointer;
  padding: 8px 10px; border-radius: 8px;
  &:hover{ color: ${UI.primaryBlue}; background: #f3f4f6; }
`;

/* 직무별 퀴즈 섹션 배경 */
const JobsSurface = styled.div`
  /* 이미지처럼 아주 은은한 수직 그라데이션 */
  background: #f4f8ff;
  border-radius: 18px;      /* 모서리 둥글게 */
  padding: clamp(16px, 2.6vw, 24px);
  overflow: hidden;         /* 라운드 밖 내용 숨김 */

  /* 박스 느낌 제거: 테두리/그림자 없음 */
  border: none;
  box-shadow: none;
`;

/* 게시판 공유 */
const ShareSection = styled.section`
  --hero-max: 1240px;
  max-width: var(--hero-max);
  width: 100%;
  margin: 5px auto 0;
`;

const ShareWrap = styled.div`
  text-align: center;
  padding: clamp(20px, 3.6vw, 32px) 10px clamp(28px, 4.2vw, 36px);
`;

const ShareHeading = styled.div`
  strong{
    display:block;
      font-size: clamp(18px, 3.0vw, 34px);
      line-height: 1.18;
    font-weight: 750;
    letter-spacing: -0.02em;
    color: ${UI.text};
  }
  p{
    margin: 10px 0 0;
    font-size: clamp(14px, 1.8vw, 18px);
    color: ${UI.sub};
  }
`;

const ShareButton = styled.button`
    margin-top: clamp(14px, 2.6vw, 22px);
    height: 35px;
    padding: 0 16px;
    border-radius: 5px;
    font-weight: 700;
    background: #fff;
    color: ${UI.color.primaryStrong};
    border: 1px solid ${UI.color.primaryStrong};
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background-color .15s ease, color .15s ease,
    border-color .15s ease, transform .08s ease;

    &:hover { background: ${UI.color.indigo50}; }
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(62,99,224,.25); }
    &:disabled { opacity: .6; cursor: not-allowed; }
`;

const ShareAccent = styled.em`
  color: ${UI.primaryBlue};
  font-style: normal;
`;

// ===== Modal Styles (compact) =====
const Scrim = styled.div`
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(15,23,42,.45);
  backdrop-filter: saturate(120%) blur(2px);
`;
const Sheet = styled.div`
  position: fixed; z-index: 1001;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: min(760px, calc(100% - 32px));
  max-height: min(84vh, calc(100vh - 32px));
  display: flex; flex-direction: column;
  background: #fff; border: 1px solid ${UI.panelLineSoft};
  border-radius: 18px; box-shadow: 0 30px 80px rgba(0,0,0,.18);
  overflow: hidden;
`;
const SheetHeader = styled.div`
  position: relative; padding: 18px 20px 14px;
  display:flex; align-items:center; gap:12px;
  border-bottom: 1px solid ${UI.panelLineSoft};
  background: linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%);
`;
const TitleWrap = styled.div`
  display:flex; flex-direction:column; gap:4px;
  h3{ margin:0; font-size:18px; letter-spacing:-0.02em; color:${UI.text}; }
  small{ color:${UI.sub}; font-weight:400; }
`;
const CloseX = styled.button`
  margin-left:auto; border:0; background:transparent; cursor:pointer;
  width:32px; height:32px; border-radius:10px;
  display:grid; place-items:center; color:#6b7280;
  &:hover{ background:#f3f4f6; color:#111827; }
`;
const SheetBody = styled.div`
  padding: 16px 20px 8px;
  overflow: auto; scrollbar-gutter: stable;
`;
const Section = styled.section`
  &:not(:first-child){ margin-top: 16px; }
  h4{ margin:0 0 10px; font-size:14px; color:#0f172a; letter-spacing:-0.02em; }
`;
const IconBox = styled.span`
  width:36px; height:36px; border-radius:10px;
  display:grid; place-items:center;
  background: linear-gradient(135deg, rgba(79,118,241,0.12) 0%, rgba(62,99,224,0.12) 100%);
  color: ${UI.color?.primaryStrong ?? UI.primaryBlue};
  flex: 0 0 auto;
`;
const Chip = styled.button<{ $on?: boolean }>`
  height: 34px; padding: 0 14px; border-radius: 999px; font-weight:700; letter-spacing:-0.02em;
  border:1px solid ${({$on}) => $on ? "#c7d2fe" : "#e5e7eb"};
  background: ${({$on}) => $on ? "#eef2ff" : "#fff"};
  color: ${({$on}) => $on ? UI.primaryBlue : UI.text};
  cursor:pointer; &:hover{ background:#f9fafb; }
`;
const CountChip = styled(Chip)``;
const Select = styled.select`
  box-sizing: border-box;
  height: 38px; width: 100%;
  padding: 0 12px;
  border-radius: 12px; border:1px solid #e5e7eb;
  background:#fff; color:#374151; letter-spacing: -0.02em;
`;
const SheetFooter = styled.div`
  position: sticky; bottom: 0;
  display:flex; justify-content:flex-end; gap:10px;
  padding: 12px 20px;
  background: linear-gradient(180deg, rgba(255,255,255,.85), #fff 60%);
  border-top: 1px solid #e5e7eb;
`;
const Ghost = styled.button`
  height: 35px; padding: 0 16px; border-radius: 6px; font-weight: 700;
  background: #fff; color: ${UI.primaryBlue}; border: 1px solid ${UI.primaryBlue};
  cursor: pointer; &:hover { background: #eef2ff; }
`;
const Primary = styled.button`
  height: 35px; padding: 0 18px; border-radius: 6px; font-weight: 700; letter-spacing: -0.02em;
  background: ${UI.primaryBlue}; border: 1px solid ${UI.primaryBlue}; color: #fff;
  cursor: pointer; &:hover { filter: brightness(0.96); }
`;
