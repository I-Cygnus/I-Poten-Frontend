import React from "react";
import styled from "styled-components";
import type { Schedule } from "../../api/ScheduleApi.ts";

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

export default function ScheduleDetailPopover({
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
                            : "보고 싶은 일정을 화면에서 바로 확인할 수 있어요."}
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
    gap: 20px;
    padding: 26px;
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 20px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);

    @media (max-width: 768px) {
        left: 12px;
        right: 12px;
        top: auto;
        bottom: 12px;
        width: auto;
        max-height: calc(100dvh - 32px);
        overflow-y: auto;
        transform: none;
    }

    :root[data-theme="dark"] & {
        background: rgba(15, 23, 42, 0.94);
        border-color: rgba(148, 163, 184, 0.22);
        box-shadow: 0 24px 60px rgba(2, 6, 23, 0.6);
    }
`;

const PanelArrow = styled.div<{ $placement: "top" | "bottom" }>`
    position: absolute;
    left: 50%;
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.96);
    border-right: 1px solid rgba(148, 163, 184, 0.22);
    border-bottom: 1px solid rgba(148, 163, 184, 0.22);
    ${({ $placement }) =>
        $placement === "top"
            ? "bottom: -7px; transform: translateX(-50%) rotate(45deg);"
            : "top: -7px; transform: translateX(-50%) rotate(225deg);"}

    @media (max-width: 768px) {
        display: none;
    }

    :root[data-theme="dark"] & {
        background: rgba(15, 23, 42, 0.94);
        border-right-color: rgba(148, 163, 184, 0.22);
        border-bottom-color: rgba(148, 163, 184, 0.22);
    }
`;

const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;

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
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.08);
    color: #2563eb;
    font-size: 11px;
    font-weight: 700;

    :root[data-theme="dark"] & {
        background: rgba(96, 165, 250, 0.14);
        color: #93c5fd;
    }
`;

const Title = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #0f172a;

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const Description = styled.p`
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: rgba(15, 23, 42, 0.6);

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.6);
    }
`;

const CloseButton = styled.button`
    width: 32px;
    height: 32px;
    border-radius: 999px;
    border: none;
    background: rgba(148, 163, 184, 0.1);
    color: rgba(15, 23, 42, 0.6);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
    }

    :root[data-theme="dark"] & {
        background: rgba(148, 163, 184, 0.16);
        color: rgba(226, 232, 240, 0.65);

        &:hover {
            background: rgba(248, 113, 113, 0.16);
            color: #f87171;
        }
    }
`;

const StateBox = styled.div`
    min-height: 160px;
    border-radius: 14px;
    border: 1px dashed rgba(148, 163, 184, 0.34);
    background: rgba(248, 250, 252, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px 20px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(15, 23, 42, 0.6);

    :root[data-theme="dark"] & {
        background: rgba(15, 23, 42, 0.4);
        border-color: rgba(148, 163, 184, 0.3);
        color: rgba(226, 232, 240, 0.6);
    }
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const HeroCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    border-radius: 16px;
    background: rgba(59, 130, 246, 0.06);
    border: 1px solid rgba(59, 130, 246, 0.12);

    :root[data-theme="dark"] & {
        background: rgba(96, 165, 250, 0.1);
        border-color: rgba(96, 165, 250, 0.2);
    }
`;

const HeroTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
`;

const Badge = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.8);
    color: #2563eb;
    font-size: 12px;
    font-weight: 600;

    :root[data-theme="dark"] & {
        background: rgba(15, 23, 42, 0.6);
        color: #93c5fd;
    }
`;

const StatusPill = styled.div`
    font-size: 11px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: rgba(15, 23, 42, 0.55);

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.55);
    }
`;

const ScheduleTitle = styled.h3`
    margin: 0;
    font-size: clamp(18px, 2vw, 22px);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.02em;
    color: #0f172a;

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const ScheduleTime = styled.div`
    font-size: 13px;
    line-height: 1.6;
    font-variant-numeric: tabular-nums;
    color: rgba(15, 23, 42, 0.7);

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.7);
    }
`;

const MetaGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
`;

const InfoCard = styled.div`
    padding: 14px 16px;
    border-radius: 12px;
    background: rgba(248, 250, 252, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.14);

    :root[data-theme="dark"] & {
        background: rgba(15, 23, 42, 0.5);
        border-color: rgba(148, 163, 184, 0.16);
    }
`;

const InfoLabel = styled.div`
    font-size: 11px;
    font-weight: 600;
    color: rgba(15, 23, 42, 0.55);
    margin-bottom: 6px;

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.55);
    }
`;

const InfoValue = styled.div`
    font-size: 13px;
    line-height: 1.65;
    color: #0f172a;
    white-space: pre-wrap;
    word-break: break-word;

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const ActionRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 4px;

    @media (max-width: 640px) {
        flex-direction: column;
    }
`;

const SecondaryButton = styled.button`
    min-width: 110px;
    height: 42px;
    padding: 0 20px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(255, 255, 255, 0.7);
    color: #0f172a;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: rgba(59, 130, 246, 0.08);
        border-color: rgba(59, 130, 246, 0.2);
        color: #2563eb;
    }

    :root[data-theme="dark"] & {
        border-color: rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.5);
        color: #f1f5f9;

        &:hover {
            background: rgba(96, 165, 250, 0.14);
            border-color: rgba(96, 165, 250, 0.3);
            color: #93c5fd;
        }
    }
`;

const DangerButton = styled.button`
    min-width: 110px;
    height: 42px;
    padding: 0 20px;
    border-radius: 12px;
    border: none;
    background: #dc2626;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 10px 22px rgba(220, 38, 38, 0.22);
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover:not(:disabled) {
        background: #b91c1c;
        transform: translateY(-1px);
        box-shadow: 0 14px 28px rgba(220, 38, 38, 0.28);
    }

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }

    :root[data-theme="dark"] & {
        background: #f87171;
        color: #0f172a;
        box-shadow: 0 10px 22px rgba(248, 113, 113, 0.24);

        &:hover:not(:disabled) {
            background: #ef4444;
            color: #ffffff;
        }
    }
`;
