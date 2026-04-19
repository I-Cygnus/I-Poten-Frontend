import React, { useMemo } from "react";
import styled from "styled-components";
import type { Schedule } from "../../api/ScheduleApi.ts";

type Props = {
    schedules: Schedule[];
    currentMonth: Date;
    selectedScheduleId?: number | null;
    onMonthChange: (date: Date) => void;
    onSelectSchedule: (scheduleId: number, target: HTMLElement) => void;
    onCreateForDate: (date: Date) => void;
};

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfCalendar(date: Date) {
    const firstDay = startOfMonth(date);
    return new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate() - firstDay.getDay()
    );
}

function isSameDay(left: Date, right: Date) {
    return (
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate()
    );
}

function formatMonthLabel(date: Date) {
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
    }).format(date);
}

function formatEventTime(schedule: Schedule) {
    if (schedule.allDay) return "종일";

    return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(schedule.startAt));
}

export default function Calendar({
    schedules,
    currentMonth,
    selectedScheduleId,
    onMonthChange,
    onSelectSchedule,
    onCreateForDate,
}: Props) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const today = new Date();

    const weeks = useMemo(() => {
        const calendarStart = startOfCalendar(currentMonth);
        const next = new Date(calendarStart);
        const result: Date[][] = [];

        for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
            const week: Date[] = [];
            for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
                week.push(new Date(next));
                next.setDate(next.getDate() + 1);
            }
            result.push(week);
        }

        return result;
    }, [currentMonth]);

    const schedulesByDay = useMemo(() => {
        const map = new Map<string, Schedule[]>();

        schedules.forEach((schedule) => {
            const date = new Date(schedule.startAt);
            if (Number.isNaN(date.getTime())) {
                return;
            }

            const key = date.toDateString();
            const bucket = map.get(key) ?? [];
            bucket.push(schedule);
            bucket.sort(
                (left, right) =>
                    new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
            );
            map.set(key, bucket);
        });

        return map;
    }, [schedules]);

    return (
        <Wrapper>
            <Header>
                <MonthTitle>{formatMonthLabel(currentMonth)}</MonthTitle>
                <HeaderActions>
                    <MonthButton
                        type="button"
                        onClick={() =>
                            onMonthChange(
                                new Date(
                                    currentMonth.getFullYear(),
                                    currentMonth.getMonth() - 1,
                                    1
                                )
                            )
                        }
                    >
                        이전 달
                    </MonthButton>
                    <MonthButton type="button" onClick={() => onMonthChange(new Date())}>
                        이번 달
                    </MonthButton>
                    <MonthButton
                        type="button"
                        onClick={() =>
                            onMonthChange(
                                new Date(
                                    currentMonth.getFullYear(),
                                    currentMonth.getMonth() + 1,
                                    1
                                )
                            )
                        }
                    >
                        다음 달
                    </MonthButton>
                </HeaderActions>
            </Header>

            <WeekHeader>
                {WEEK_LABELS.map((label) => (
                    <WeekLabel key={label}>{label}</WeekLabel>
                ))}
            </WeekHeader>

            <Grid>
                {weeks.flat().map((date) => {
                    const inCurrentMonth =
                        date >= monthStart &&
                        date <= monthEnd &&
                        date.getMonth() === currentMonth.getMonth();
                    const daySchedules = schedulesByDay.get(date.toDateString()) ?? [];
                    const visibleSchedules = daySchedules.slice(0, 3);
                    const hiddenCount = daySchedules.length - visibleSchedules.length;

                    return (
                        <DayCell
                            key={date.toISOString()}
                            $muted={!inCurrentMonth}
                            $today={isSameDay(date, today)}
                            onDoubleClick={() => onCreateForDate(date)}
                        >
                            <DayHeader>
                                <DayNumber>{date.getDate()}</DayNumber>
                                <AddLink
                                    type="button"
                                    onClick={() => onCreateForDate(date)}
                                    disabled={!inCurrentMonth}
                                >
                                    +
                                </AddLink>
                            </DayHeader>

                            <EventList>
                                {visibleSchedules.map((schedule) => (
                                    <EventButton
                                        key={schedule.id}
                                        type="button"
                                        $selected={selectedScheduleId === schedule.id}
                                        data-schedule-trigger="true"
                                        onClick={(event) =>
                                            onSelectSchedule(schedule.id, event.currentTarget)
                                        }
                                    >
                                        <EventTime>{formatEventTime(schedule)}</EventTime>
                                        <EventTitle>{schedule.title}</EventTitle>
                                    </EventButton>
                                ))}

                                {hiddenCount > 0 && <MoreText>+ {hiddenCount}개 더보기</MoreText>}
                            </EventList>
                        </DayCell>
                    );
                })}
            </Grid>
        </Wrapper>
    );
}

const Wrapper = styled.section`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const MonthTitle = styled.h2`
    margin: 0;
    font-size: clamp(20px, 2.2vw, 24px);
    font-weight: 700;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: #0f172a;

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

const MonthButton = styled.button`
    height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(255, 255, 255, 0.7);
    color: #0f172a;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);

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

const WeekHeader = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
    padding: 0 4px;

    @media (max-width: 980px) {
        display: none;
    }
`;

const WeekLabel = styled.div`
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(15, 23, 42, 0.5);
    text-align: center;

    &:first-child {
        color: rgba(220, 38, 38, 0.6);
    }

    &:last-child {
        color: rgba(37, 99, 235, 0.6);
    }

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.55);

        &:first-child {
            color: rgba(248, 113, 113, 0.7);
        }

        &:last-child {
            color: rgba(147, 197, 253, 0.75);
        }
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
    padding: 4px;
    border-radius: 18px;
    background: rgba(248, 250, 252, 0.5);

    @media (max-width: 980px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }

    :root[data-theme="dark"] & {
        background: rgba(15, 23, 42, 0.35);
    }
`;

const DayCell = styled.div<{ $muted: boolean; $today: boolean }>`
    min-height: 148px;
    border-radius: 14px;
    background: ${({ $muted, $today }) =>
        $today
            ? "rgba(59, 130, 246, 0.08)"
            : $muted
                ? "transparent"
                : "rgba(255, 255, 255, 0.7)"};
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: ${({ $muted }) => ($muted ? 0.45 : 1)};
    border: 1px solid ${({ $today }) =>
        $today ? "rgba(59, 130, 246, 0.28)" : "transparent"};
    transition: background 0.28s cubic-bezier(0.16, 1, 0.3, 1);

    :root[data-theme="dark"] & {
        background: ${({ $muted, $today }) =>
            $today
                ? "rgba(96, 165, 250, 0.12)"
                : $muted
                    ? "transparent"
                    : "rgba(15, 23, 42, 0.55)"};
        border-color: ${({ $today }) =>
            $today ? "rgba(96, 165, 250, 0.32)" : "transparent"};
    }
`;

const DayHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const DayNumber = styled.div`
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #0f172a;

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const AddLink = styled.button`
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: none;
    background: rgba(59, 130, 246, 0.08);
    color: #2563eb;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover:not(:disabled) {
        background: #3b82f6;
        color: #ffffff;
        transform: scale(1.05);
    }

    &:disabled {
        opacity: 0.3;
        cursor: default;
    }

    :root[data-theme="dark"] & {
        background: rgba(96, 165, 250, 0.14);
        color: #93c5fd;

        &:hover:not(:disabled) {
            background: #60a5fa;
            color: #0b0f19;
        }
    }
`;

const EventList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const EventButton = styled.button<{ $selected: boolean }>`
    width: 100%;
    border: none;
    border-radius: 8px;
    background: ${({ $selected }) =>
        $selected ? "rgba(59, 130, 246, 0.18)" : "rgba(59, 130, 246, 0.08)"};
    padding: 6px 8px;
    text-align: left;
    cursor: pointer;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: rgba(59, 130, 246, 0.18);
    }

    :root[data-theme="dark"] & {
        background: ${({ $selected }) =>
            $selected ? "rgba(96, 165, 250, 0.22)" : "rgba(96, 165, 250, 0.12)"};

        &:hover {
            background: rgba(96, 165, 250, 0.22);
        }
    }
`;

const EventTime = styled.div`
    font-size: 10px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #2563eb;
    margin-bottom: 2px;

    :root[data-theme="dark"] & {
        color: #93c5fd;
    }
`;

const EventTitle = styled.div`
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
    color: #0f172a;
    word-break: break-word;

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const MoreText = styled.div`
    font-size: 11px;
    font-weight: 600;
    color: rgba(15, 23, 42, 0.5);
    padding: 2px 8px;

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.5);
    }
`;
