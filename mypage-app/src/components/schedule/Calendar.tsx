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
    gap: 14px;
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
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #0f172a;
`;

const HeaderActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const MonthButton = styled.button`
    height: 38px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #334155;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
`;

const WeekHeader = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 10px;
`;

const WeekLabel = styled.div`
    text-align: center;
    font-size: 13px;
    font-weight: 800;
    color: #64748b;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 980px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const DayCell = styled.div<{ $muted: boolean; $today: boolean }>`
    min-height: 160px;
    border-radius: 18px;
    border: 1px solid
        ${({ $today }) => ($today ? "rgba(79, 118, 241, 0.3)" : "#e5e7eb")};
    background: ${({ $muted }) => ($muted ? "#f8fafc" : "#ffffff")};
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    opacity: ${({ $muted }) => ($muted ? 0.62 : 1)};
`;

const DayHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const DayNumber = styled.div`
    font-size: 15px;
    font-weight: 800;
    color: #0f172a;
`;

const AddLink = styled.button`
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 999px;
    background: rgba(79, 118, 241, 0.1);
    color: #3e63e0;
    font-size: 18px;
    cursor: pointer;

    &:disabled {
        opacity: 0.45;
        cursor: default;
    }
`;

const EventList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const EventButton = styled.button<{ $selected: boolean }>`
    width: 100%;
    border: 1px solid
        ${({ $selected }) => ($selected ? "rgba(79, 118, 241, 0.3)" : "transparent")};
    border-radius: 12px;
    background: ${({ $selected }) => ($selected ? "#eef4ff" : "#f8fbff")};
    padding: 10px;
    text-align: left;
    cursor: pointer;
`;

const EventTime = styled.div`
    font-size: 11px;
    font-weight: 800;
    color: #4f76f1;
    margin-bottom: 4px;
`;

const EventTitle = styled.div`
    font-size: 13px;
    line-height: 1.5;
    color: #0f172a;
    word-break: break-word;
`;

const MoreText = styled.div`
    font-size: 12px;
    color: #64748b;
`;
