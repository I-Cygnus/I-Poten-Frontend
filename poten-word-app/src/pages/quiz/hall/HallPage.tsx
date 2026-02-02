// HallPage.tsx
import React, { useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import SystemMessageModal, { SystemMessage } from "../../../components/common/SystemMessageModal.tsx";

/* ====== UI 토큰 (QuizHomePage 톤 유지) ====== */
const UI = {
    panelBgSoft: "#f4f8ff",
    panelLineSoft: "#d9e6ff",
    text: "#0f172a",
    sub: "#6b7280",
    primaryBlue: "#4369e5",
    radiusXXL: "24px",
    shadowSoft: "0 10px 30px rgba(67,105,229,.10)",

    chipBg: "#ffffff",
    chipBorder: "#e5e7eb",
    chipOnBg: "#eef2ff",
    chipOnBorder: "#c7d2fe",

    danger: "#ef4444",
    success: "#10b981",

    gradient: { hero: "radial-gradient(900px 400px at 50% -160px, rgba(67,105,229,.10) 0%, rgba(67,105,229,0) 60%)" },
    quizCta: "linear-gradient(90deg, #3E82E8 0%, #2BC6A6 100%)",
};

type PeriodKey = "today" | "week" | "month" | "season" | "all";
type MetricKey = "points" | "accuracy" | "streak" | "growth" | "recovery";
type CategoryKey = "all" | "Frontend" | "Backend" | "DSA" | "AI";

type LeaderRow = {
    id: string;
    nickname: string;
    category: Exclude<CategoryKey, "all">;
    points: number;
    accuracy: number; // 0~100
    streak: number;   // days
    growth: number;   // +points vs prev period
    recovery: number; // 오답 해결률 0~100
    badges: string[]; // 최대 2개만 보여주기
};

type Badge = {
    id: string;
    title: string;
    desc: string;
    unlocked: boolean;
    progressText?: string;
    icon: string;
};

const PERIODS: { key: PeriodKey; label: string }[] = [
    { key: "today", label: "오늘" },
    { key: "week", label: "이번 주" },
    { key: "month", label: "이번 달" },
    { key: "season", label: "시즌" },
    { key: "all", label: "전체" },
];

const METRICS: { key: MetricKey; label: string; hint: string }[] = [
    { key: "points", label: "포인트", hint: "난이도 가중치 + 스트릭 보너스가 포함된 종합 점수예요." },
    { key: "accuracy", label: "정답률", hint: "선택한 기간의 정답률(%) 기준이에요." },
    { key: "streak", label: "스트릭", hint: "연속 학습(일) 기준이에요." },
    { key: "growth", label: "급상승", hint: "이전 기간 대비 포인트 상승폭(+)." },
    { key: "recovery", label: "오답 회수율", hint: "오답노트에서 해결 처리된 비율(%)이에요." },
];

const CATEGORIES: { key: CategoryKey; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "Frontend", label: "Frontend" },
    { key: "Backend", label: "Backend" },
    { key: "DSA", label: "DSA" },
    { key: "AI", label: "AI" },
];

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function fmtPercent(n: number) {
    return `${Math.round(n)}%`;
}

function medal(rank: number) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
}

export default function HallPage() {
    const nav = useNavigate();

    // ===== System Message =====
    const [sysOpen, setSysOpen] = useState(false);
    const [sysMsg, setSysMsg] = useState<SystemMessage | null>(null);
    const openSys = (m: SystemMessage) => {
        setSysMsg(m);
        setSysOpen(true);
    };
    const closeSys = () => {
        setSysOpen(false);
        setSysMsg(null);
    };

    // ===== Filters =====
    const [period, setPeriod] = useState<PeriodKey>("week");
    const [metric, setMetric] = useState<MetricKey>("points");
    const [category, setCategory] = useState<CategoryKey>("all");

    // ===== Privacy =====
    const [publicRank, setPublicRank] = useState(false);

    // ===== Dummy "me" & leaderboard base data =====
    const meId = "me";
    const baseRows: LeaderRow[] = useMemo(
        () => [
            { id: meId, nickname: "나", category: "Backend", points: 1420, accuracy: 86, streak: 7, growth: 220, recovery: 58, badges: ["🔥 7일", "🧠 오답"] },
            { id: "u1", nickname: "포텐러1", category: "Frontend", points: 1670, accuracy: 91, streak: 12, growth: 90, recovery: 40, badges: ["🎯 정확", "🔥 12일"] },
            { id: "u2", nickname: "포텐러2", category: "DSA", points: 1550, accuracy: 84, streak: 5, growth: 330, recovery: 72, badges: ["🚀 급상승", "🧠 오답"] },
            { id: "u3", nickname: "포텐러3", category: "AI", points: 1490, accuracy: 88, streak: 9, growth: 140, recovery: 66, badges: ["🔥 9일"] },
            { id: "u4", nickname: "포텐러4", category: "Backend", points: 1330, accuracy: 82, streak: 16, growth: 60, recovery: 78, badges: ["🏃 꾸준", "🧠 오답"] },
            { id: "u5", nickname: "포텐러5", category: "Frontend", points: 1280, accuracy: 79, streak: 3, growth: 410, recovery: 35, badges: ["🚀 급상승"] },
            { id: "u6", nickname: "포텐러6", category: "DSA", points: 1210, accuracy: 90, streak: 6, growth: 110, recovery: 52, badges: ["🎯 정확"] },
            { id: "u7", nickname: "포텐러7", category: "AI", points: 1180, accuracy: 76, streak: 2, growth: 180, recovery: 60, badges: ["🧠 오답"] },
        ],
        []
    );

    // 기간별로 수치가 달라 보이게(데모용) 약간 변형
    const periodFactor = useMemo(() => {
        if (period === "today") return 0.25;
        if (period === "week") return 1;
        if (period === "month") return 1.6;
        if (period === "season") return 2.2;
        return 3.0; // all
    }, [period]);

    const leaderboard: LeaderRow[] = useMemo(() => {
        const adjusted = baseRows.map((r) => {
            const points = Math.round(r.points * periodFactor);
            const accuracy = clamp(r.accuracy + (period === "today" ? 2 : period === "all" ? -3 : 0), 45, 99);
            const streak = clamp(r.streak + (period === "month" ? 3 : period === "all" ? 6 : 0), 0, 365);
            const growth = Math.round(r.growth * (period === "today" ? 0.5 : period === "all" ? 1.2 : 1));
            const recovery = clamp(r.recovery + (period === "month" ? 6 : 0), 0, 100);
            return { ...r, points, accuracy, streak, growth, recovery };
        });

        const filtered =
            category === "all" ? adjusted : adjusted.filter((r) => r.category === category);

        const sorted = [...filtered].sort((a, b) => {
            const key = metric;
            if (key === "points") return b.points - a.points;
            if (key === "accuracy") return b.accuracy - a.accuracy;
            if (key === "streak") return b.streak - a.streak;
            if (key === "growth") return b.growth - a.growth;
            return b.recovery - a.recovery;
        });

        return sorted;
    }, [baseRows, category, metric, period, periodFactor]);

    const myRank = useMemo(() => {
        const idx = leaderboard.findIndex((r) => r.id === meId);
        return idx >= 0 ? idx + 1 : null;
    }, [leaderboard]);

    const myRow = useMemo(() => baseRows.find((r) => r.id === meId)!, [baseRows]);

    const myKpis = useMemo(() => {
        // 데모용: periodFactor 반영
        const points = Math.round(myRow.points * periodFactor);
        const accuracy = clamp(myRow.accuracy + (period === "today" ? 2 : period === "all" ? -3 : 0), 45, 99);
        const streak = clamp(myRow.streak + (period === "month" ? 3 : period === "all" ? 6 : 0), 0, 365);
        const recovery = clamp(myRow.recovery + (period === "month" ? 6 : 0), 0, 100);

        // 상위 퍼센트는 데모로 간단 계산(랭킹 기반)
        const total = Math.max(leaderboard.length, 1);
        const pct = myRank ? Math.round(((total - myRank + 1) / total) * 100) : 0;

        return {
            rankText: myRank ? `${myRank}위 · 상위 ${pct}%` : "집계 중",
            points,
            accuracy,
            streak,
            recovery,
        };
    }, [leaderboard.length, myRank, myRow, period, periodFactor]);

    const highlights = useMemo(() => {
        const topPoints = [...leaderboard].sort((a, b) => b.points - a.points)[0];
        const topGrowth = [...leaderboard].sort((a, b) => b.growth - a.growth)[0];
        const topRecovery = [...leaderboard].sort((a, b) => b.recovery - a.recovery)[0];
        const topStreak = [...leaderboard].sort((a, b) => b.streak - a.streak)[0];

        return [
            { title: "이번 기간 MVP", icon: "🏆", line1: `${topPoints.nickname}`, line2: `포인트 ${topPoints.points.toLocaleString()}` },
            { title: "급상승", icon: "🚀", line1: `${topGrowth.nickname}`, line2: `+${topGrowth.growth.toLocaleString()}점` },
            { title: "오답 마스터", icon: "🧠", line1: `${topRecovery.nickname}`, line2: `회수율 ${fmtPercent(topRecovery.recovery)}` },
            { title: "스트릭 킹", icon: "🔥", line1: `${topStreak.nickname}`, line2: `${topStreak.streak}일 연속` },
        ];
    }, [leaderboard]);

    const badges: Badge[] = useMemo(
        () => [
            { id: "b1", title: "3일 스트릭", desc: "3일 연속 학습 달성", unlocked: myKpis.streak >= 3, icon: "🔥" },
            { id: "b2", title: "7일 스트릭", desc: "7일 연속 학습 달성", unlocked: myKpis.streak >= 7, icon: "🔥", progressText: `${myKpis.streak}/7` },
            { id: "b3", title: "정확도 90", desc: "정답률 90% 달성", unlocked: myKpis.accuracy >= 90, icon: "🎯", progressText: `${Math.round(myKpis.accuracy)}/90` },
            { id: "b4", title: "오답 회수", desc: "오답 회수율 70% 달성", unlocked: myKpis.recovery >= 70, icon: "🧠", progressText: `${Math.round(myKpis.recovery)}/70` },
            { id: "b5", title: "올라운더", desc: "여러 카테고리에서 학습", unlocked: false, icon: "🌈", progressText: "2/4" },
            { id: "b6", title: "꾸준함", desc: "이번 기간 3회 이상 학습", unlocked: true, icon: "🏃" },
        ],
        [myKpis]
    );

    const metricHint = useMemo(() => METRICS.find((m) => m.key === metric)?.hint ?? "", [metric]);

    const onCopyShare = useCallback(async () => {
        const text = [
            `🏛️ 포텐퀴즈 명예의 전당`,
            `기간: ${PERIODS.find((p) => p.key === period)?.label ?? period}`,
            `내 순위: ${myKpis.rankText}`,
            `포인트: ${myKpis.points.toLocaleString()}`,
            `정답률: ${fmtPercent(myKpis.accuracy)}`,
            `스트릭: ${myKpis.streak}일`,
            `오답 회수율: ${fmtPercent(myKpis.recovery)}`,
        ].join("\n");

        try {
            await navigator.clipboard.writeText(text);
            openSys({
                title: "공유 문구가 복사됐어요",
                message: "붙여넣기만 하면 공유 카드처럼 쓸 수 있어요!",
                bullets: ["원하면 다음 단계로 이미지 카드 생성도 붙일 수 있어요."] as any,
            } as any);
        } catch {
            openSys({
                title: "복사에 실패했어요",
                message: "브라우저 권한 때문에 클립보드 복사가 막힐 수 있어요. 텍스트를 직접 선택해서 복사해 주세요.",
            } as any);
        }
    }, [myKpis, openSys, period]);

    return (
        <PageWrap>
            <Header>
                <HeaderTop>
                    <TitleBox>
                        <h1>명예의 전당</h1>
                        <p>기록은 쌓이고, 실력은 증명돼요. 오늘의 한 문제부터 다시 올라가 봅시다.</p>
                    </TitleBox>

                    <HeaderActions>
                        <GhostBtn onClick={() => nav("/poten-word/quiz/timeline")}>내 퀴즈 타임라인</GhostBtn>
                        <PrimaryBtn onClick={onCopyShare}>내 기록 공유</PrimaryBtn>
                    </HeaderActions>
                </HeaderTop>

                <HeaderCard>
                    <CardRow>
                        <CardLeft>
                            <CardLabel>내 현재 위치</CardLabel>
                            <CardValue>{myKpis.rankText}</CardValue>
                            <CardSub>
                                {publicRank ? (
                                    <span>랭킹 공개 중 · 리더보드에 표시됩니다</span>
                                ) : (
                                    <span>랭킹 비공개 · 내 화면에서만 확인</span>
                                )}
                            </CardSub>
                        </CardLeft>

                        <CardRight>
                            <ToggleRow>
                                <ToggleText>
                                    <strong>랭킹 공개</strong>
                                    <small>기본은 비공개를 추천해요</small>
                                </ToggleText>
                                <Switch
                                    role="switch"
                                    aria-checked={publicRank}
                                    $on={publicRank}
                                    onClick={() => setPublicRank((v) => !v)}
                                >
                                    <span className="dot" />
                                </Switch>
                            </ToggleRow>

                            <MiniHint>
                                집계 기준은 기간·카테고리·지표에 따라 달라져요. <br />
                                <strong>부정행위 의심 패턴</strong>은 리더보드 집계에서 제외될 수 있어요.
                            </MiniHint>
                        </CardRight>
                    </CardRow>
                </HeaderCard>
            </Header>

            {/* ===== 내 KPI ===== */}
            <Section>
                <SectionHead>
                    <h2>내 기록 요약</h2>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {PERIODS.map((p) => (
                            <Chip key={p.key} $on={p.key === period} onClick={() => setPeriod(p.key)}>
                                {p.label}
                            </Chip>
                        ))}
                    </div>
                </SectionHead>

                <KpiGrid>
                    <KpiCard>
                        <KpiLabel>포인트</KpiLabel>
                        <KpiValue>{myKpis.points.toLocaleString()}</KpiValue>
                        <KpiSub>기간 기준 종합 점수</KpiSub>
                    </KpiCard>

                    <KpiCard>
                        <KpiLabel>정답률</KpiLabel>
                        <KpiValue>{fmtPercent(myKpis.accuracy)}</KpiValue>
                        <KpiSub>최근 풀이 기준</KpiSub>
                    </KpiCard>

                    <KpiCard>
                        <KpiLabel>연속 학습</KpiLabel>
                        <KpiValue>
                            <span style={{ marginRight: 6 }}>🔥</span>
                            {myKpis.streak}일
                        </KpiValue>
                        <KpiSub>끊기지 않게 유지!</KpiSub>
                    </KpiCard>

                    <KpiCard>
                        <KpiLabel>오답 회수율</KpiLabel>
                        <KpiValue>{fmtPercent(myKpis.recovery)}</KpiValue>
                        <KpiSub>오답노트 해결 비율</KpiSub>
                    </KpiCard>
                </KpiGrid>
            </Section>

            {/* ===== 리더보드 ===== */}
            <Section>
                <SectionHead>
                    <h2>리더보드</h2>
                    <RightTools>
                        <Select
                            aria-label="카테고리 선택"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as CategoryKey)}
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c.key} value={c.key}>
                                    {c.label}
                                </option>
                            ))}
                        </Select>
                    </RightTools>
                </SectionHead>

                <MetricRow>
                    {METRICS.map((m) => (
                        <MetricChip key={m.key} $on={m.key === metric} onClick={() => setMetric(m.key)}>
                            {m.label}
                        </MetricChip>
                    ))}
                    <HintPill title={metricHint} aria-label="지표 설명">
                        ?
                    </HintPill>
                </MetricRow>

                <Board>
                    <BoardHead>
                        <span>순위</span>
                        <span>유저</span>
                        <span>배지</span>
                        <span style={{ textAlign: "right" }}>
              {METRICS.find((m) => m.key === metric)?.label ?? "지표"}
            </span>
                    </BoardHead>

                    <BoardBody>
                        {leaderboard.map((r, i) => {
                            const rank = i + 1;
                            const isMe = r.id === meId;
                            const metricValue =
                                metric === "points"
                                    ? r.points.toLocaleString()
                                    : metric === "accuracy"
                                        ? fmtPercent(r.accuracy)
                                        : metric === "streak"
                                            ? `${r.streak}일`
                                            : metric === "growth"
                                                ? `+${r.growth.toLocaleString()}`
                                                : fmtPercent(r.recovery);

                            return (
                                <BoardRow key={r.id} $me={isMe}>
                                    <RankCell>
                                        <span className="medal">{medal(rank)}</span>
                                        <strong>{rank}</strong>
                                    </RankCell>

                                    <UserCell>
                                        <strong>{r.nickname}</strong>
                                        <small>{r.category}</small>
                                    </UserCell>

                                    <BadgeCell>
                                        {(r.badges ?? []).slice(0, 2).map((b, idx) => (
                                            <MiniBadge key={`${r.id}-b-${idx}`}>{b}</MiniBadge>
                                        ))}
                                    </BadgeCell>

                                    <MetricCell $me={isMe}>{metricValue}</MetricCell>
                                </BoardRow>
                            );
                        })}
                    </BoardBody>

                    <BoardFoot>
                        <small>
                            * 기간·카테고리·지표에 따라 순위가 달라요. “오답 회수율”은 오답노트 해결 처리 기준입니다.
                        </small>
                    </BoardFoot>
                </Board>
            </Section>

            {/* ===== 이번 기간 하이라이트 ===== */}
            <Section>
                <SectionHead>
                    <h2>이번 기간 하이라이트</h2>
                    <small>전당을 ‘스토리’ 있게 만드는 카드예요</small>
                </SectionHead>

                <HighlightGrid>
                    {highlights.map((h) => (
                        <HighlightCard key={h.title}>
                            <div className="top">
                <span className="icon" aria-hidden>
                  {h.icon}
                </span>
                                <strong>{h.title}</strong>
                            </div>
                            <p className="l1">{h.line1}</p>
                            <p className="l2">{h.line2}</p>
                        </HighlightCard>
                    ))}
                </HighlightGrid>
            </Section>

            {/* ===== 배지 / 칭호 ===== */}
            <Section>
                <SectionHead>
                    <h2>배지 · 칭호</h2>
                    <small>잠금 배지는 다음 목표가 돼요</small>
                </SectionHead>

                <BadgeGrid>
                    {badges.map((b) => (
                        <BadgeCard key={b.id} $locked={!b.unlocked}>
                            <div className="icon" aria-hidden>
                                {b.icon}
                            </div>
                            <div className="meta">
                                <strong>{b.title}</strong>
                                <p>{b.desc}</p>
                                <div className="foot">
                                    {b.unlocked ? (
                                        <StatusPill $ok>획득</StatusPill>
                                    ) : (
                                        <StatusPill>잠금</StatusPill>
                                    )}
                                    {b.progressText && <ProgressText>{b.progressText}</ProgressText>}
                                </div>
                            </div>
                        </BadgeCard>
                    ))}
                </BadgeGrid>
            </Section>

            <Spacer />

            <SystemMessageModal open={sysOpen} message={sysMsg} onClose={closeSys} />
        </PageWrap>
    );
}

/* ====== Styles ====== */
const PageWrap = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 0 20px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.section`
  --hero-max: 1240px;
  width: 100%;
  max-width: var(--hero-max);
  margin: 0 auto;
  padding-top: 6px;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const TitleBox = styled.div`
  h1 {
    margin: 0;
    font-size: clamp(22px, 3.2vw, 32px);
    letter-spacing: -0.02em;
    color: ${UI.text};
    font-weight: 800;
  }
  p {
    margin: 8px 0 0;
    color: ${UI.sub};
    letter-spacing: -0.02em;
    line-height: 1.5;
    font-size: 14px;
  }
`;

const HeaderActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const GhostBtn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${UI.panelLineSoft};
  background: #fff;
  color: ${UI.text};
  font-weight: 750;
  letter-spacing: -0.02em;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
  &:focus-visible {
    outline: 3px solid rgba(79, 118, 241, 0.28);
    outline-offset: 2px;
  }
`;

const PrimaryBtn = styled.button`
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 0;
  background: ${UI.quizCta};
  color: #fff;
  font-weight: 800;
  letter-spacing: -0.02em;
  cursor: pointer;

  &:active {
    transform: scale(0.99);
  }
  &:focus-visible {
    outline: 3px solid rgba(79, 118, 241, 0.28);
    outline-offset: 2px;
  }
`;

const HeaderCard = styled.div`
  margin-top: 14px;
  background: ${UI.panelBgSoft};
  border: 1px solid ${UI.panelLineSoft};
  border-radius: ${UI.radiusXXL};
  box-shadow: ${UI.shadowSoft};
  overflow: hidden;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: ${UI.gradient.hero};
    pointer-events: none;
  }
`;

const CardRow = styled.div`
  position: relative;
  z-index: 1;
  padding: 18px 18px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const CardLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CardLabel = styled.span`
  color: ${UI.sub};
  font-size: 13px;
  letter-spacing: -0.02em;
  font-weight: 700;
`;

const CardValue = styled.div`
  color: ${UI.text};
  font-size: 22px;
  letter-spacing: -0.02em;
  font-weight: 900;
`;

const CardSub = styled.div`
  color: ${UI.sub};
  font-size: 13px;
  letter-spacing: -0.02em;
`;

const CardRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: space-between;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ToggleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    color: ${UI.text};
    font-weight: 900;
    letter-spacing: -0.02em;
    font-size: 14px;
  }
  small {
    color: ${UI.sub};
    letter-spacing: -0.02em;
    font-size: 12px;
  }
`;

const Switch = styled.button<{ $on?: boolean }>`
  width: 52px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid ${({ $on }) => ($on ? "rgba(16,185,129,.35)" : "rgba(148,163,184,.55)")};
  background: ${({ $on }) => ($on ? "rgba(16,185,129,.12)" : "#fff")};
  position: relative;
  cursor: pointer;

  .dot {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: ${({ $on }) => ($on ? "24px" : "6px")};
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: ${({ $on }) => ($on ? UI.success : "#94a3b8")};
    transition: left 160ms ease;
  }

  &:focus-visible {
    outline: 3px solid rgba(79, 118, 241, 0.28);
    outline-offset: 2px;
  }
`;

const MiniHint = styled.div`
  color: ${UI.sub};
  font-size: 12px;
  letter-spacing: -0.02em;
  line-height: 1.45;

  strong {
    color: ${UI.text};
    font-weight: 850;
  }
`;

const Section = styled.section`
  --hero-max: 1240px;
  width: 100%;
  max-width: var(--hero-max);
  margin: 0 auto;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: 8px 0 12px;

  h2 {
    margin: 0;
    font-size: 18px;
    letter-spacing: -0.02em;
    color: ${UI.text};
    font-weight: 900;
  }

  small {
    color: ${UI.sub};
    letter-spacing: -0.02em;
    font-size: 13px;
  }
`;

const RightTools = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const Chip = styled.button<{ $on?: boolean }>`
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: -0.02em;
  border: 1px solid ${({ $on }) => ($on ? UI.chipOnBorder : UI.chipBorder)};
  background: ${({ $on }) => ($on ? UI.chipOnBg : UI.chipBg)};
  color: ${({ $on }) => ($on ? UI.primaryBlue : UI.text)};
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
  &:focus-visible {
    outline: 3px solid rgba(79, 118, 241, 0.28);
    outline-offset: 2px;
  }
`;

const Select = styled.select`
  height: 34px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${UI.chipBorder};
  background: #fff;
  color: #0f172a;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const KpiCard = styled.div`
  background: #fff;
  border: 1px solid ${UI.panelLineSoft};
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(67, 105, 229, 0.08);
  padding: 14px 14px 12px;
`;

const KpiLabel = styled.div`
  color: ${UI.sub};
  font-size: 13px;
  letter-spacing: -0.02em;
  font-weight: 800;
`;

const KpiValue = styled.div`
  margin-top: 8px;
  color: ${UI.text};
  font-size: 20px;
  letter-spacing: -0.02em;
  font-weight: 950;
`;

const KpiSub = styled.div`
  margin-top: 6px;
  color: ${UI.sub};
  font-size: 12px;
  letter-spacing: -0.02em;
`;

const MetricRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 8px 0 12px;
`;

const MetricChip = styled(Chip)<{ $on?: boolean }>`
  height: 36px;
  padding: 0 14px;
`;

const HintPill = styled.span`
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(67, 105, 229, 0.08);
  border: 1px solid rgba(67, 105, 229, 0.18);
  color: ${UI.primaryBlue};
  font-weight: 950;
  cursor: help;
  user-select: none;
`;

const Board = styled.div`
  background: #fff;
  border: 1px solid ${UI.panelLineSoft};
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(67, 105, 229, 0.08);
`;

const BoardHead = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr 1.2fr 140px;
  gap: 10px;
  padding: 12px 14px;
  background: ${UI.panelBgSoft};
  border-bottom: 1px solid ${UI.panelLineSoft};

  span {
    color: ${UI.sub};
    font-size: 12px;
    letter-spacing: -0.02em;
    font-weight: 900;
  }

  @media (max-width: 720px) {
    grid-template-columns: 74px 1fr 140px;
    span:nth-child(3) {
      display: none;
    }
  }
`;

const BoardBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const BoardRow = styled.div<{ $me?: boolean }>`
  display: grid;
  grid-template-columns: 90px 1fr 1.2fr 140px;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #eef2ff;
  background: ${({ $me }) => ($me ? "rgba(67,105,229,.06)" : "#fff")};

  @media (max-width: 720px) {
    grid-template-columns: 74px 1fr 140px;
  }
`;

const RankCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .medal {
    width: 20px;
    display: inline-block;
  }
  strong {
    font-weight: 950;
    color: ${UI.text};
    letter-spacing: -0.02em;
  }
`;

const UserCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    color: ${UI.text};
    font-weight: 950;
    letter-spacing: -0.02em;
  }
  small {
    color: ${UI.sub};
    font-size: 12px;
    letter-spacing: -0.02em;
  }
`;

const BadgeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  @media (max-width: 720px) {
    display: none;
  }
`;

const MiniBadge = styled.span`
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(43, 198, 166, 0.12);
  border: 1px solid rgba(43, 198, 166, 0.22);
  color: #0f766e;
  font-weight: 850;
  letter-spacing: -0.02em;
  font-size: 12px;
  white-space: nowrap;
`;

const MetricCell = styled.div<{ $me?: boolean }>`
  text-align: right;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: ${({ $me }) => ($me ? UI.primaryBlue : UI.text)};
`;

const BoardFoot = styled.div`
  padding: 10px 14px;
  background: #fff;
  small {
    color: ${UI.sub};
    font-size: 12px;
    letter-spacing: -0.02em;
    line-height: 1.45;
  }
`;

const HighlightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(200px, 1fr));
  gap: 12px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(200px, 1fr));
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightCard = styled.div`
  background: #fff;
  border: 1px solid ${UI.panelLineSoft};
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(67, 105, 229, 0.08);
  padding: 14px 14px 12px;

  .top {
    display: flex;
    align-items: center;
    gap: 10px;

    .icon {
      width: 34px;
      height: 34px;
      border-radius: 12px;
      background: rgba(67, 105, 229, 0.1);
      display: grid;
      place-items: center;
      font-size: 16px;
    }

    strong {
      color: ${UI.text};
      font-weight: 950;
      letter-spacing: -0.02em;
    }
  }

  .l1 {
    margin: 10px 0 0;
    color: ${UI.text};
    font-weight: 950;
    letter-spacing: -0.02em;
  }

  .l2 {
    margin: 6px 0 0;
    color: ${UI.sub};
    letter-spacing: -0.02em;
    font-size: 13px;
  }
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 12px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const BadgeCard = styled.div<{ $locked?: boolean }>`
  background: #fff;
  border: 1px solid ${UI.panelLineSoft};
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(67, 105, 229, 0.08);
  padding: 14px;
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 12px;
  opacity: ${({ $locked }) => ($locked ? 0.6 : 1)};
  filter: ${({ $locked }) => ($locked ? "grayscale(0.25)" : "none")};

  .icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: rgba(43, 198, 166, 0.12);
    border: 1px solid rgba(43, 198, 166, 0.22);
    display: grid;
    place-items: center;
    font-size: 18px;
  }

  .meta {
    strong {
      color: ${UI.text};
      font-weight: 950;
      letter-spacing: -0.02em;
      display: block;
    }
    p {
      margin: 6px 0 0;
      color: ${UI.sub};
      letter-spacing: -0.02em;
      font-size: 13px;
      line-height: 1.45;
    }
    .foot {
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
`;

const StatusPill = styled.span<{ $ok?: boolean }>`
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: ${({ $ok }) => ($ok ? "rgba(16,185,129,.12)" : "rgba(148,163,184,.14)")};
  border: 1px solid ${({ $ok }) => ($ok ? "rgba(16,185,129,.22)" : "rgba(148,163,184,.28)")};
  color: ${({ $ok }) => ($ok ? UI.success : UI.sub)};
  font-weight: 900;
  letter-spacing: -0.02em;
  font-size: 12px;
`;

const ProgressText = styled.span`
  color: ${UI.sub};
  font-size: 12px;
  letter-spacing: -0.02em;
  font-weight: 800;
`;

const Spacer = styled.div`
  height: 6px;
`;
