import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import Calendar from "../components/schedule/Calendar.tsx";
import AddScheduleModal from "../components/modals/AddScheduleModal.tsx";
import SystemMessageModal, {
    type SystemMessage,
} from "../components/common/SystemMessageModal.tsx";
import ScheduleDetailPopover, {
    type ScheduleDetailAnchor,
} from "../components/schedule/ScheduleDetailPopover.tsx";
import {
    createMySchedule,
    deleteMySchedule,
    getMyScheduleDetail,
    getMySchedules,
    updateMySchedule,
    type Schedule,
    type ScheduleUpsertRequest,
} from "../api/ScheduleApi.ts";

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

type ViewMode = "month" | "list";

function getMonthRange(date: Date) {
    const from = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    return {
        from: from.toISOString(),
        to: to.toISOString(),
    };
}

function formatMonthHeading(date: Date) {
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
    }).format(date);
}

function formatScheduleDate(schedule: Schedule) {
    const start = new Date(schedule.startAt);
    const end = new Date(schedule.endAt);

    if (schedule.allDay) {
        return `${new Intl.DateTimeFormat("ko-KR", {
            month: "2-digit",
            day: "2-digit",
            weekday: "short",
        }).format(start)} 종일`;
    }

    return `${new Intl.DateTimeFormat("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(start)} ~ ${new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(end)}`;
}

function toMonthStart(value: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
}

export default function SchedulePage() {
    const contentCardRef = useRef<HTMLElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("month");
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [popoverAnchor, setPopoverAnchor] = useState<ScheduleDetailAnchor | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [systemMessageOpen, setSystemMessageOpen] = useState(false);
    const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(null);

    const openSystemMessage = (message: SystemMessage) => {
        setSystemMessage(message);
        setSystemMessageOpen(true);
    };

    const closeSystemMessage = () => {
        setSystemMessageOpen(false);
        setSystemMessage(null);
    };

    const loadSchedules = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const range = getMonthRange(currentMonth);
            const nextSchedules = await getMySchedules(range);
            setSchedules(
                [...nextSchedules].sort(
                    (left, right) =>
                        new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
                )
            );
        } catch (error) {
            console.error(error);
            setSchedules([]);
            setErrorMessage("일정 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadSchedules();
    }, [currentMonth]);

    useEffect(() => {
        if (selectedScheduleId == null) {
            setSelectedSchedule(null);
            setPopoverAnchor(null);
            setDetailLoading(false);
            return;
        }

        let mounted = true;

        const loadDetail = async () => {
            try {
                setDetailLoading(true);
                const detail = await getMyScheduleDetail(selectedScheduleId);

                if (mounted) {
                    setSelectedSchedule(detail);
                }
            } catch (error) {
                console.error(error);
                if (mounted) {
                    setSelectedSchedule(null);
                    openSystemMessage({
                        tone: "error",
                        title: "일정 상세 정보를 불러오지 못했습니다.",
                    });
                }
            } finally {
                if (mounted) {
                    setDetailLoading(false);
                }
            }
        };

        void loadDetail();

        return () => {
            mounted = false;
        };
    }, [selectedScheduleId]);

    useEffect(() => {
        if (selectedScheduleId == null) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (popoverRef.current?.contains(target)) {
                return;
            }

            if (target.closest("[data-schedule-trigger='true']")) {
                return;
            }

            setSelectedScheduleId(null);
            setSelectedSchedule(null);
            setPopoverAnchor(null);
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key !== "Escape") {
                return;
            }

            setSelectedScheduleId(null);
            setSelectedSchedule(null);
            setPopoverAnchor(null);
        };

        document.addEventListener("mousedown", handlePointerDown);
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            window.removeEventListener("keydown", handleEscape);
        };
    }, [selectedScheduleId]);

    const scheduleCountText = useMemo(() => {
        return `${formatMonthHeading(currentMonth)} 일정 ${schedules.length}개`;
    }, [currentMonth, schedules.length]);

    const openCreateModal = (date?: Date) => {
        setEditingSchedule(
            date
                ? {
                      id: 0,
                      title: "",
                      memo: "",
                      startAt: new Date(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate(),
                          9,
                          0,
                          0,
                          0
                      ).toISOString(),
                      endAt: new Date(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate(),
                          10,
                          0,
                          0,
                          0
                      ).toISOString(),
                      allDay: false,
                      createdAt: "",
                      updatedAt: "",
                  }
                : null
        );
        setIsModalOpen(true);
    };

    const handleCreateOrUpdate = async (payload: ScheduleUpsertRequest) => {
        try {
            setSubmitting(true);
            const targetMonth = toMonthStart(payload.startAt);
            const shouldChangeMonth =
                targetMonth != null &&
                (targetMonth.getFullYear() !== currentMonth.getFullYear() ||
                    targetMonth.getMonth() !== currentMonth.getMonth());

            if (editingSchedule && editingSchedule.id > 0) {
                await updateMySchedule(editingSchedule.id, payload);
                openSystemMessage({
                    tone: "success",
                    title: "일정을 수정했습니다.",
                });
            } else {
                await createMySchedule(payload);
                openSystemMessage({
                    tone: "success",
                    title: "일정을 등록했습니다.",
                });
            }

            setIsModalOpen(false);
            setEditingSchedule(null);
            if (shouldChangeMonth && targetMonth) {
                setCurrentMonth(targetMonth);
            } else {
                await loadSchedules();
            }

            if (selectedScheduleId != null) {
                const refreshed = await getMyScheduleDetail(
                    editingSchedule && editingSchedule.id > 0
                        ? editingSchedule.id
                        : selectedScheduleId
                ).catch(() => null);
                if (refreshed) {
                    setSelectedSchedule(refreshed);
                }
            }
        } catch (error) {
            console.error(error);
            openSystemMessage({
                tone: "error",
                title: "일정 저장에 실패했습니다.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedSchedule) return;

        const confirmed = window.confirm(`"${selectedSchedule.title}" 일정을 삭제할까요?`);
        if (!confirmed) return;

        try {
            setDeleting(true);
            const result = await deleteMySchedule(selectedSchedule.id);

            if (!result.deleted) {
                throw new Error("Schedule delete response was not successful.");
            }

            openSystemMessage({
                tone: "success",
                title: "일정을 삭제했습니다.",
            });
            setSelectedScheduleId(null);
            setSelectedSchedule(null);
            setPopoverAnchor(null);
            await loadSchedules();
        } catch (error) {
            console.error(error);
            openSystemMessage({
                tone: "error",
                title: "일정 삭제에 실패했습니다.",
            });
        } finally {
            setDeleting(false);
        }
    };

    const listSchedules = useMemo(() => {
        return [...schedules].sort(
            (left, right) =>
                new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
        );
    }, [schedules]);

    const closeScheduleDetail = () => {
        setSelectedScheduleId(null);
        setSelectedSchedule(null);
        setPopoverAnchor(null);
    };

    const openScheduleDetail = (scheduleId: number, target: HTMLElement) => {
        const container = contentCardRef.current;

        if (container) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const estimatedPopoverHeight = 360;
            const spaceAbove = targetRect.top - containerRect.top;
            const placement = spaceAbove > estimatedPopoverHeight + 24 ? "top" : "bottom";

            setPopoverAnchor({
                top: targetRect.top - containerRect.top,
                left: targetRect.left - containerRect.left,
                width: targetRect.width,
                height: targetRect.height,
                placement,
            });
        }

        setSelectedScheduleId(scheduleId);
    };

    return (
        <Page>
            <PageInner>
                <HeroCard>
                    <HeroText>
                        <HeroBadge>SCHEDULE</HeroBadge>
                        <HeroTitle>일정 기록</HeroTitle>
                        <HeroDescription>
                            캘린더와 목록으로 일정을 한눈에 보고, 필요한 일정은 바로 관리할 수 있어요.
                        </HeroDescription>
                    </HeroText>

                    <HeroSide>
                        <HeroStatLabel>{scheduleCountText}</HeroStatLabel>
                        <PrimaryButton type="button" onClick={() => openCreateModal()}>
                            일정 추가
                        </PrimaryButton>
                    </HeroSide>
                </HeroCard>

                <Toolbar>
                    <ViewToggle>
                        <ToggleButton
                            type="button"
                            $active={viewMode === "month"}
                            onClick={() => setViewMode("month")}
                        >
                            월 보기
                        </ToggleButton>
                        <ToggleButton
                            type="button"
                            $active={viewMode === "list"}
                            onClick={() => setViewMode("list")}
                        >
                            리스트 보기
                        </ToggleButton>
                    </ViewToggle>

                    <ToolbarSide>
                        <MonthNav>
                            <MonthNavButton
                                type="button"
                                onClick={() =>
                                    setCurrentMonth(
                                        new Date(
                                            currentMonth.getFullYear(),
                                            currentMonth.getMonth() - 1,
                                            1
                                        )
                                    )
                                }
                            >
                                이전 달
                            </MonthNavButton>
                            <MonthNavButton type="button" onClick={() => setCurrentMonth(new Date())}>
                                이번 달
                            </MonthNavButton>
                            <MonthNavButton
                                type="button"
                                onClick={() =>
                                    setCurrentMonth(
                                        new Date(
                                            currentMonth.getFullYear(),
                                            currentMonth.getMonth() + 1,
                                            1
                                        )
                                    )
                                }
                            >
                                다음 달
                            </MonthNavButton>
                        </MonthNav>
                        <MonthLabel>{formatMonthHeading(currentMonth)}</MonthLabel>
                    </ToolbarSide>
                </Toolbar>

                {loading ? (
                    <ContentCard ref={contentCardRef}>
                        <Spinner />
                    </ContentCard>
                ) : errorMessage ? (
                    <StateCard>
                        <StateTitle>일정 데이터를 가져오지 못했습니다.</StateTitle>
                        <StateDescription>{errorMessage}</StateDescription>
                        <SecondaryButton type="button" onClick={() => void loadSchedules()}>
                            다시 시도
                        </SecondaryButton>
                    </StateCard>
                ) : schedules.length === 0 ? (
                    <StateCard>
                        <StateTitle>등록된 일정이 없습니다.</StateTitle>
                        <StateDescription>
                            {formatMonthHeading(currentMonth)}에 첫 일정을 추가해보세요.
                        </StateDescription>
                        <PrimaryButton type="button" onClick={() => openCreateModal()}>
                            일정 추가
                        </PrimaryButton>
                    </StateCard>
                ) : (
                    <ContentCard ref={contentCardRef}>
                        {viewMode === "month" ? (
                            <>
                                <Calendar
                                schedules={schedules}
                                currentMonth={currentMonth}
                                selectedScheduleId={selectedScheduleId}
                                onMonthChange={setCurrentMonth}
                                onSelectSchedule={openScheduleDetail}
                                onCreateForDate={openCreateModal}
                                />
                                {(selectedScheduleId != null || detailLoading) && (
                                    <PopoverLayer ref={popoverRef}>
                                        <ScheduleDetailPopover
                                            schedule={selectedSchedule}
                                            loading={detailLoading}
                                            anchor={popoverAnchor}
                                            onClose={closeScheduleDetail}
                                            onEdit={() => {
                                                if (!selectedSchedule) return;
                                                setEditingSchedule(selectedSchedule);
                                                setIsModalOpen(true);
                                            }}
                                            onDelete={handleDelete}
                                            isDeleting={deleting}
                                        />
                                    </PopoverLayer>
                                )}
                            </>
                        ) : (
                            <>
                                <ListWrap>
                                {listSchedules.map((schedule) => (
                                    <ListCard
                                        key={schedule.id}
                                        type="button"
                                        data-schedule-trigger="true"
                                        onClick={(event) =>
                                            openScheduleDetail(schedule.id, event.currentTarget)
                                        }
                                    >
                                        <ListCardTop>
                                            <ListBadge>
                                                {schedule.allDay ? "종일" : "시간 지정"}
                                            </ListBadge>
                                            <ListDate>{formatScheduleDate(schedule)}</ListDate>
                                        </ListCardTop>
                                        <ListTitle>{schedule.title}</ListTitle>
                                        <ListMemo>
                                            {schedule.memo.trim()
                                                ? schedule.memo
                                                : "메모가 없는 일정입니다."}
                                        </ListMemo>
                                    </ListCard>
                                ))}
                                </ListWrap>
                                {(selectedScheduleId != null || detailLoading) && (
                                    <PopoverLayer ref={popoverRef}>
                                        <ScheduleDetailPopover
                                            schedule={selectedSchedule}
                                            loading={detailLoading}
                                            anchor={popoverAnchor}
                                            onClose={closeScheduleDetail}
                                            onEdit={() => {
                                                if (!selectedSchedule) return;
                                                setEditingSchedule(selectedSchedule);
                                                setIsModalOpen(true);
                                            }}
                                            onDelete={handleDelete}
                                            isDeleting={deleting}
                                        />
                                    </PopoverLayer>
                                )}
                            </>
                        )}
                    </ContentCard>
                )}
            </PageInner>

            {isModalOpen && (
                <AddScheduleModal
                    initialData={editingSchedule}
                    isSubmitting={submitting}
                    onClose={() => {
                        if (submitting) return;
                        setIsModalOpen(false);
                        setEditingSchedule(null);
                    }}
                    onSubmit={handleCreateOrUpdate}
                />
            )}
            <SystemMessageModal
                open={systemMessageOpen}
                message={systemMessage}
                onClose={closeSystemMessage}
            />
        </Page>
    );
}

const Page = styled.div`
    ${pretendard};
    min-height: auto;
    color: #111827;

    * {
        box-sizing: border-box;
    }
`;

const PageInner = styled.div`
    display: flex;
    flex-direction: column;
    gap: 18px;
`;

const HeroCard = styled.section`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 28px;
    border-radius: 24px;
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const HeroText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const HeroBadge = styled.div`
    width: fit-content;
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    background: rgba(79, 118, 241, 0.1);
    color: #3e63e0;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
`;

const HeroTitle = styled.h1`
    margin: 0;
    font-size: 34px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #0f172a;
`;

const HeroDescription = styled.p`
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
    color: #64748b;
`;

const HeroSide = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;

    @media (max-width: 768px) {
        width: 100%;
        align-items: stretch;
    }
`;

const HeroStatLabel = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: #475569;
`;

const Toolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px;
    border-radius: 20px;
    background: #ffffff;
    border: 1px solid #e5e7eb;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const ViewToggle = styled.div`
    display: inline-flex;
    gap: 8px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
    height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid ${({ $active }) => ($active ? "#111827" : "#dbe2ea")};
    background: ${({ $active }) => ($active ? "#111827" : "#ffffff")};
    color: ${({ $active }) => ($active ? "#ffffff" : "#334155")};
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
`;

const MonthLabel = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: #475569;
`;

const ToolbarSide = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const MonthNav = styled.div`
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const MonthNavButton = styled.button`
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

const ContentCard = styled.section`
    position: relative;
    overflow: visible;
    padding: 24px;
    border-radius: 24px;
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
`;

const spin = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

const Spinner = styled.div`
    width: 44px;
    height: 44px;
    margin: 56px auto;
    border-radius: 50%;
    border: 4px solid rgba(62, 130, 232, 0.16);
    border-top-color: #3e82e8;
    animation: ${spin} 0.8s linear infinite;
`;

const PopoverLayer = styled.div`
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;

    & > * {
        pointer-events: auto;
    }
`;

const StateCard = styled.section`
    min-height: 300px;
    padding: 24px;
    border-radius: 24px;
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
`;

const StateTitle = styled.h2`
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
`;

const StateDescription = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: #64748b;
`;

const PrimaryButton = styled.button`
    min-width: 120px;
    height: 44px;
    padding: 0 16px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(90deg, #3e82e8 0%, #2bc6a6 100%);
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
`;

const SecondaryButton = styled.button`
    min-width: 120px;
    height: 44px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #334155;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
`;

const ListWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ListCard = styled.button`
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    background: #ffffff;
    padding: 18px;
    text-align: left;
    cursor: pointer;
    transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        border-color 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        border-color: rgba(79, 118, 241, 0.28);
        box-shadow: 0 10px 24px rgba(62, 99, 224, 0.08);
    }
`;

const ListCardTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const ListBadge = styled.div`
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    background: rgba(79, 118, 241, 0.1);
    color: #3e63e0;
    font-size: 12px;
    font-weight: 800;
`;

const ListDate = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
`;

const ListTitle = styled.h3`
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
`;

const ListMemo = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: #475569;
    white-space: pre-wrap;
    word-break: break-word;
`;
