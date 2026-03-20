import React from "react";
import styled from "styled-components";
import type { Schedule } from "../../api/userScheduleApi.ts";

export type ScheduleDetailAnchor = {
    top: number;
    left: number;
    width: number;
    height: number;
    placement: "top" | "bottom";
};

type Props = {
    schedule: Schedule | null;
    loading?: boolean;
    anchor?: ScheduleDetailAnchor | null;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => Promise<void>;
    isDeleting?: boolean;
};

function formatDateTime(value: string, allDay: boolean) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
        ...(allDay
            ? {}
            : {
                  hour: "2-digit",
                  minute: "2-digit",
              }),
    }).format(date);
}

function formatCompactDateTime(value: string) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default function ScheduleDetailPanel({
    schedule,
    loading = false,
    anchor = null,
    onClose,
    onEdit,
    onDelete,
    isDeleting = false,
}: Props) {
    if (!schedule && !loading) {
        return null;
    }

    const placement = anchor?.placement ?? "top";

    return (
        <Panel
            role="dialog"
            aria-modal="false"
            $anchor={anchor}
            $placement={placement}
        >
            <PanelArrow $placement={placement} />
            <Header>
                <HeaderText>
                    <Eyebrow>SELECTED SCHEDULE</Eyebrow>
                    <Title>{loading ? "일정 정보를 불러오는 중.." : "선택한 일정"}</Title>
                    <Description>
                        {loading
                            ? "상세 정보를 불러온 뒤 수정이나 삭제를 진행할 수 있습니다."
                            : "캘린더를 가리지 않으면서도 일정 맥락을 유지하도록 큰 팝오버로 보여줍니다."}
                    </Description>
                </HeaderText>
                <CloseButton type="button" onClick={onClose} aria-label="닫기">
                    ×
                </CloseButton>
            </Header>

            {loading || !schedule ? (
                <StateBox>일정 상세 정보를 불러오는 중입니다.</StateBox>
            ) : (
                <Body>
                    <HeroCard>
                        <HeroTop>
                            <Badge>{schedule.allDay ? "종일 일정" : "시간 지정 일정"}</Badge>
                            <StatusPill>{formatCompactDateTime(schedule.updatedAt)} 업데이트</StatusPill>
                        </HeroTop>

                        <ScheduleTitle>{schedule.title}</ScheduleTitle>
                        <ScheduleTime>
                            {formatDateTime(schedule.startAt, schedule.allDay)}
                            {" - "}
                            {formatDateTime(schedule.endAt, schedule.allDay)}
                        </ScheduleTime>
                    </HeroCard>

                    <MetaGrid>
                        <InfoCard>
                            <InfoLabel>메모</InfoLabel>
                            <InfoValue>
                                {schedule.memo.trim() ? schedule.memo : "등록된 메모가 없습니다."}
                            </InfoValue>
                        </InfoCard>

                        <InfoCard>
                            <InfoLabel>생성일</InfoLabel>
                            <InfoValue>{formatDateTime(schedule.createdAt, false)}</InfoValue>
                        </InfoCard>

                        <InfoCard>
                            <InfoLabel>수정일</InfoLabel>
                            <InfoValue>{formatDateTime(schedule.updatedAt, false)}</InfoValue>
                        </InfoCard>
                    </MetaGrid>

                    <ActionRow>
                        <SecondaryButton type="button" onClick={onEdit}>
                            수정
                        </SecondaryButton>
                        <DangerButton
                            type="button"
                            onClick={() => {
                                void onDelete();
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "삭제 중.." : "삭제"}
                        </DangerButton>
                    </ActionRow>
                </Body>
            )}
        </Panel>
    );
}

const Panel = styled.section<{
    $anchor: ScheduleDetailAnchor | null;
    $placement: "top" | "bottom";
}>`
    position: absolute;
    z-index: 20;
    top: ${({ $anchor }) =>
        $anchor
            ? `${$anchor.placement === "top" ? $anchor.top - 18 : $anchor.top + $anchor.height + 18}px`
            : "24px"};
    left: ${({ $anchor }) =>
        $anchor
            ? `clamp(12px, ${$anchor.left + $anchor.width / 2}px - 210px, calc(100% - 432px))`
            : "24px"};
    width: min(420px, calc(100% - 24px));
    transform: ${({ $placement }) =>
        $placement === "top" ? "translateY(-100%)" : "translateY(0)"};
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px;
    border-radius: 28px;
    background:
        radial-gradient(circle at top right, rgba(79, 118, 241, 0.18), transparent 34%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, #f8fbff 100%);
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow:
        0 24px 56px rgba(15, 23, 42, 0.16),
        0 8px 18px rgba(62, 99, 224, 0.08);
    backdrop-filter: blur(18px);

    @media (max-width: 768px) {
        left: 12px;
        right: 12px;
        top: auto;
        bottom: 12px;
        width: auto;
        max-height: calc(100dvh - 32px);
        overflow-y: auto;
        transform: none;
        border-radius: 24px;
    }
`;

const PanelArrow = styled.div<{ $placement: "top" | "bottom" }>`
    position: absolute;
    left: 50%;
    width: 18px;
    height: 18px;
    background: #f8fbff;
    border-right: 1px solid rgba(15, 23, 42, 0.08);
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    ${({ $placement }) =>
        $placement === "top"
            ? "bottom: -10px; transform: translateX(-50%) rotate(45deg);"
            : "top: -10px; transform: translateX(-50%) rotate(225deg);"}

    @media (max-width: 768px) {
        display: none;
    }
`;

const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;

    @media (max-width: 768px) {
        flex-direction: row;
    }
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Eyebrow = styled.div`
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: #3e63e0;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.04em;
    color: #0f172a;
`;

const Description = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: #64748b;
`;

const CloseButton = styled.button`
    width: 42px;
    height: 42px;
    border: 1px solid rgba(79, 118, 241, 0.18);
    border-radius: 999px;
    background: rgba(79, 118, 241, 0.1);
    color: #3e63e0;
    font-size: 24px;
    line-height: 1;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
`;

const StateBox = styled.div`
    min-height: 180px;
    border-radius: 22px;
    border: 1px dashed #dbe2ea;
    background: rgba(255, 255, 255, 0.72);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    color: #64748b;
    font-size: 14px;
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const HeroCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 22px;
    border-radius: 24px;
    background: linear-gradient(135deg, #3e82e8 0%, #2bc6a6 100%);
    color: #ffffff;
`;

const HeroTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
`;

const Badge = styled.div`
    width: fit-content;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.16);
    color: #eff6ff;
    font-size: 12px;
    font-weight: 800;
`;

const StatusPill = styled.div`
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.92);
    background: rgba(255, 255, 255, 0.14);
`;

const ScheduleTitle = styled.h3`
    margin: 0;
    font-size: 28px;
    font-weight: 900;
    line-height: 1.3;
    letter-spacing: -0.04em;
`;

const ScheduleTime = styled.div`
    font-size: 14px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.9);
`;

const MetaGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) repeat(2, minmax(0, 1fr));
    gap: 14px;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const InfoCard = styled.div`
    min-height: 124px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.84);
    padding: 18px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
`;

const InfoLabel = styled.div`
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
    margin-bottom: 10px;
`;

const InfoValue = styled.div`
    font-size: 14px;
    line-height: 1.8;
    color: #0f172a;
    white-space: pre-wrap;
    word-break: break-word;
`;

const ActionRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    @media (max-width: 640px) {
        flex-direction: column;
    }
`;

const SecondaryButton = styled.button`
    min-width: 120px;
    height: 46px;
    padding: 0 18px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #334155;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
`;

const DangerButton = styled.button`
    min-width: 120px;
    height: 46px;
    padding: 0 18px;
    border: none;
    border-radius: 14px;
    background: #ef4444;
    color: #ffffff;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;

    &:disabled {
        opacity: 0.65;
        cursor: default;
    }
`;
