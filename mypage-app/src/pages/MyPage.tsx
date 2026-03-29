import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useLocation, useNavigate, useOutlet } from "react-router-dom";
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
import {
    Bot,
    Bug,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    CircleHelp,
    Clock3,
    CreditCard,
    FileText,
    Inbox,
    LogOut,
    Settings,
    ShieldCheck,
    Sparkles,
    User,
    UserRound,
} from "lucide-react";
import {
    createInquiry,
    getMyInquiryDetail,
    getMyInquiryList,
    type InquiryDetail,
    type InquiryStatus,
    type InquirySummary,
    type InquiryType,
} from "../api/InquiryApi.ts";
import {
    getQuizDashboardStats,
    getQuizTimelineRecords,
    getRecentWrongNotes,
    type QuizDashboardStats,
    type QuizTimelineRecord,
    type QuizWrongNoteSummary,
} from "../api/QuizStatsApi.ts";
import { getInterviewResultList, type InterviewSummary } from "../api/InterviewApi.ts";
import { getMyProfileSummary } from "../api/MyProfileApi.ts";
import { getCreditAccountSummary, type CreditAccountSummary } from "../api/CreditApi.ts";
import { getMySchedules, type Schedule } from "../api/ScheduleApi.ts";
import {
    getInterests,
    getMyInterests,
    InterestsApiError,
    type Interest,
    updateMyInterests,
    validateUpdateMyInterestsRequest,
} from "../api/interestsApi.ts";
import { withdrawAccount } from "../api/withdrawalApi.ts";
import { getLastActivityAt, getMostRecentActivityAt, LAST_ACTIVITY_EVENT } from "../utils/activity.ts";
import { clearAuthStorage, AUTH_STORAGE_CLEARED_EVENT } from "../utils/authStorage.ts";
import { completeWithdrawal } from "../utils/withdrawalFlow.ts";
import { notifyError, notifySuccess } from "../utils/toast.ts";
import SystemMessageModal, { type SystemMessage } from "../components/common/SystemMessageModal.tsx";

type MenuKey = "profile" | "interview" | "quiz" | "schedule" | "interest field" | "inquiry" | "withdraw";

type UserProfile = {
    nickname: string;
    email: string;
    lastActivityAt?: string | null;
    representativeLabel?: string | null;
    representativeJob?: string | null;
    representativeCareer?: string | null;
};

const defaultUserProfile: UserProfile = {
    nickname: "사용자",
    email: "이메일 정보 없음",
    representativeLabel: null,
    representativeJob: null,
    representativeCareer: null,
};

const mockSchedules = [
    {
        id: 1,
        title: "AI 모의면접 예약",
        date: "2026.03.20",
        time: "20:00",
        type: "면접 연습",
    },
    {
        id: 2,
        title: "포텐퀴즈 복습",
        date: "2026.03.21",
        time: "19:30",
        type: "학습 일정",
    },
    {
        id: 3,
        title: "이력서 점검",
        date: "2026.03.22",
        time: "21:00",
        type: "개인 일정",
    },
];

const defaultCreditSummary: CreditAccountSummary = {
    balance: 0,
    monthlyEarned: 0,
    monthlyUsed: 0,
    expiresAt: null,
};

const defaultQuizStats: QuizDashboardStats = {
    solvedQuestions: 0,
    averageAccuracy: 0,
    streakDays: 0,
};

const menuItems = [
    { key: "profile" as const, label: "회원 정보", icon: UserRound },
    { key: "interview" as const, label: "AI 모의 면접 기록", icon: Bot },
    { key: "quiz" as const, label: "포텐퀴즈 기록", icon: FileText },
    { key: "schedule" as const, label: "일정 관리", icon: CalendarDays },
    // { key: "interest field" as const, label: "관심 분야 설정", icon: Sparkles },
    { key: "inquiry" as const, label: "문의하기", icon: CircleHelp },
    { key: "withdraw" as const, label: "회원 탈퇴", icon: LogOut },
];

type InquiryTypeKey = "" | InquiryType;
type InquiryView = "list" | "create" | "detail";

const legacyInquiryTypeOptions = [
    { value: "service" as const, label: "서비스 문의", icon: CircleHelp },
    { value: "payment" as const, label: "결제 문의", icon: CreditCard },
    { value: "bug" as const, label: "오류 제보", icon: Bug },
    { value: "feature" as const, label: "기능 제안", icon: Sparkles },
];

const inquiryTypeOptions = [
    { value: "SERVICE" as const, label: "서비스 문의", icon: CircleHelp },
    { value: "PAYMENT" as const, label: "결제 문의", icon: CreditCard },
    { value: "BUG" as const, label: "오류 제보", icon: Bug },
    { value: "FEATURE" as const, label: "기능 제안", icon: Sparkles },
    { value: "OTHER" as const, label: "기타", icon: Inbox },
];

type InterestSelection = {
    categories: number[];
    tags: number[];
};

const DEFAULT_INTEREST_SELECTION: InterestSelection = {
    categories: [],
    tags: [],
};

const PRIMARY_INTEREST_CATEGORY_LABELS: Record<string, string> = {
    Frontend: "프론트엔드(Frontend)",
    Backend: "백엔드(Backend)",
    Database: "데이터베이스(Database)",
    Network: "네트워크(Network)",
    "Operating System": "운영체제(Operating System)",
    "Data Structure & Algorithm": "자료구조 & 알고리즘(Data Structure & Algorithm)",
    Security: "보안(Security)",
    "Software Engineering": "소프트웨어 공학(Software Engineering)",
    "DevOps / Cloud": "데브옵스 / 클라우드(DevOps / Cloud)",
    "Computer Science": "컴퓨터 과학(Computer Science)",
    "AI / Data / Machine Learning": "인공지능 / 데이터 / 머신러닝(AI / Data / Machine Learning)",
    "Embedded / IoT / System Programming": "임베디드 / IoT / 시스템 프로그래밍(Embedded / IoT / System Programming)",
};

function normalizeInterestSelection(
    selection: InterestSelection,
    interestOptions: Interest[]
): InterestSelection {
    const uniqueCategories = Array.from(new Set(
        selection.categories.filter((id) =>
            interestOptions.some((interest) => interest.id === id)
        )
    ));

    const availableTagIds = new Set(
        getAvailableInterestTags(uniqueCategories, interestOptions).map((tag) => tag.id)
    );

    const uniqueTags = Array.from(new Set(
        selection.tags.filter((id) => availableTagIds.has(id))
    ));

    return {
        categories: uniqueCategories,
        tags: uniqueTags,
    };
}

function formatInterestCategoryLabel(name: string) {
    const trimmedName = name.trim();
    return PRIMARY_INTEREST_CATEGORY_LABELS[trimmedName] ?? trimmedName;
}

function getInterestCategoryLabel(id: number, interestOptions: Interest[]) {
    const categoryName = interestOptions.find((option) => option.id === id)?.name;
    return categoryName ? formatInterestCategoryLabel(categoryName) : String(id);
}

function getAvailableInterestTags(categoryIds: number[], interestOptions: Interest[]) {
    const tagMap = new Map<number, Interest["tags"][number]>();

    for (const tag of interestOptions
        .filter((option) => categoryIds.includes(option.id))
        .flatMap((option) => option.tags)) {
        tagMap.set(tag.id, tag);
    }

    return Array.from(tagMap.values());
}

function toQuestionTypeLabel(value: string) {
    switch (value) {
        case "OX":
            return "OX";
        case "INITIALS":
            return "초성";
        case "MIX":
            return "혼합";
        case "CHOICE":
        default:
            return "객관식";
    }
}

function toDifficultyLabel(value: string | null) {
    switch (value) {
        case "EASY":
            return "쉬움";
        case "MEDIUM":
            return "보통";
        case "HARD":
            return "어려움";
        case "MIX":
            return "혼합";
        default:
            return "난이도 미설정";
    }
}

function toInquiryTypeLabel(value: InquiryType) {
    return (
        inquiryTypeOptions.find((option) => option.value === value)?.label ?? value
    );
}

function toInquiryStatusMeta(status: InquiryStatus) {
    switch (status) {
        case "RECEIVED":
            return { label: "접수됨", tone: "received" as const };
        case "IN_PROGRESS":
            return { label: "처리 중", tone: "progress" as const };
        case "ANSWERED":
            return { label: "답변 완료", tone: "answered" as const };
        case "CLOSED":
            return { label: "종료", tone: "closed" as const };
        default:
            return { label: status, tone: "received" as const };
    }
}

function formatInquiryDate(value: string | null | undefined) {
    if (!value) return "-";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsed);
}

function formatCreditExpiryDate(value: string | null | undefined) {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(parsed);
}

function getUpcomingScheduleRange() {
    const from = new Date();
    const to = new Date(from);
    to.setDate(to.getDate() + 90);

    return {
        from: from.toISOString(),
        to: to.toISOString(),
    };
}

function formatScheduleDate(value: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(parsed);
}

function formatScheduleTime(schedule: Schedule) {
    if (schedule.allDay) {
        return "종일";
    }

    const start = new Date(schedule.startAt);
    const end = new Date(schedule.endAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return "-";
    }

    const formatter = new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function getScheduleTypeLabel(schedule: Schedule) {
    return schedule.allDay ? "종일 일정" : "시간 지정";
}

function formatInterviewDateTime(value: string) {
    if (!value) return "-";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsed);
}

const palette = {
    pageBlue: "#f8fbff",
    pageMint: "#f8fffd",

    card: "rgba(255, 255, 255, 0.92)",
    cardStrong: "rgba(255, 255, 255, 0.96)",

    border: "#e5e7eb",
    borderSoft: "#eef2f7",

    text: "#111827",
    textSoft: "#6b7280",
    textMuted: "#9aa4b2",

    primary: "#4F76F1",
    primaryBlue: "#4369e5",
    primaryStrong: "#3E63E0",
    primaryHover: "#3658c8",
    primarySoft: "rgba(79, 118, 241, 0.10)",
    primaryRing: "rgba(62, 99, 224, 0.16)",

    secondary: "#2BC6A6",
    secondaryStrong: "#10b981",
    secondaryHover: "#22b396",
    secondarySoft: "rgba(43, 198, 166, 0.12)",
    secondaryRing: "rgba(43, 198, 166, 0.16)",

    indigo50: "#eef2ff",
    indigo200: "#c7d2fe",

    accentGradient: "linear-gradient(90deg, #3E82E8 0%, #2BC6A6 100%)",
    accentGradientSoft:
        "linear-gradient(135deg, rgba(79,118,241,0.10) 0%, rgba(43,198,166,0.12) 100%)",

    chipBg: "rgba(79, 118, 241, 0.10)",
    mintChipBg: "#e9fcf8",

    hover: "#f7f9fc",

    warning: "#f59e0b",
    warningSoft: "rgba(245, 158, 11, 0.10)",
    warningBorder: "rgba(245, 158, 11, 0.18)",
    warningText: "#9a6b16",

    danger: "#ef4444",
    dangerSoft: "rgba(239, 68, 68, 0.12)",
};

export default function MyPage() {
    const [activeMenu, setActiveMenu] = useState<MenuKey>("profile");
    const [inquiryView, setInquiryView] = useState<InquiryView>("list");
    const [inquiryType, setInquiryType] = useState<InquiryTypeKey>("");
    const [isInquiryDropdownOpen, setIsInquiryDropdownOpen] = useState(false);
    const inquiryDropdownRef = useRef<HTMLDivElement | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        if (typeof window === "undefined") {
            return defaultUserProfile;
        }

        return {
            nickname: localStorage.getItem("nickname") || defaultUserProfile.nickname,
            email: localStorage.getItem("email") || defaultUserProfile.email,
            lastActivityAt: getLastActivityAt(),
        };
    });
    const [creditSummary, setCreditSummary] = useState<CreditAccountSummary>(defaultCreditSummary);
    const [creditLoading, setCreditLoading] = useState(true);
    const [quizStats, setQuizStats] = useState<QuizDashboardStats>(defaultQuizStats);
    const [quizStatsLoading, setQuizStatsLoading] = useState(true);
    const [quizTimelineRecords, setQuizTimelineRecords] = useState<QuizTimelineRecord[]>([]);
    const [quizTimelineLoading, setQuizTimelineLoading] = useState(true);
    const [wrongNotes, setWrongNotes] = useState<QuizWrongNoteSummary[]>([]);
    const [wrongNotesLoading, setWrongNotesLoading] = useState(true);
    const [interviewRecords, setInterviewRecords] = useState<InterviewSummary[]>([]);
    const [interviewLoading, setInterviewLoading] = useState(true);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [inquiryTitle, setInquiryTitle] = useState("");
    const [inquiryContent, setInquiryContent] = useState("");
    const [inquirySubmitting, setInquirySubmitting] = useState(false);
    const [inquiryList, setInquiryList] = useState<InquirySummary[]>([]);
    const [inquiryListLoading, setInquiryListLoading] = useState(false);
    const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
    const [selectedInquiryDetail, setSelectedInquiryDetail] = useState<InquiryDetail | null>(null);
    const [selectedInquiryLoading, setSelectedInquiryLoading] = useState(false);
    const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
    const [sysOpen, setSysOpen] = useState(false);
    const [sysMsg, setSysMsg] = useState<SystemMessage | null>(null);
    const [isEditingInterestFields, setIsEditingInterestFields] = useState(false);
    const [interestOptions, setInterestOptions] = useState<Interest[]>([]);
    const [interestOptionsLoading, setInterestOptionsLoading] = useState(true);
    const [interestSaving, setInterestSaving] = useState(false);
    const [interestSelection, setInterestSelection] = useState<InterestSelection>(DEFAULT_INTEREST_SELECTION);
    const [draftInterestSelection, setDraftInterestSelection] = useState<InterestSelection>(DEFAULT_INTEREST_SELECTION);
    const navigate = useNavigate();
    const location = useLocation();
    const outlet = useOutlet();

    const openSys = (message: SystemMessage) => {
        setSysMsg(message);
        setSysOpen(true);
    };

    const closeSys = () => {
        setSysOpen(false);
        setSysMsg(null);
    };

    const performWithdrawal = async () => {
        if (withdrawSubmitting) {
            return;
        }

        try {
            setWithdrawSubmitting(true);
            await withdrawAccount();
            notifySuccess("회원 탈퇴가 완료되었습니다.");
            completeWithdrawal(navigate);
        } catch (error) {
            console.error(error);
            notifyError(error instanceof Error ? error.message : "회원 탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setWithdrawSubmitting(false);
        }
    };

    const handleWithdrawRequest = () => {
        if (withdrawSubmitting) {
            return;
        }

        openSys({
            tone: "warning",
            title: "정말 회원 탈퇴를 진행할까요?",
            description: "탈퇴 후에는 학습 이력과 면접 기록을 되돌릴 수 없으며, 30일 동안 동일한 계정으로 재가입이 제한됩니다.",
            actions: [
                {
                    label: "취소",
                    tone: "normal",
                },
                {
                    label: "회원 탈퇴",
                    tone: "danger",
                    onClick: performWithdrawal,
                },
            ],
        });
    };

    const openInterestFieldEditor = () => {
        setDraftInterestSelection(interestSelection);
        setIsEditingInterestFields(true);
    };

    const toggleInterestCategory = (categoryId: number) => {
        setDraftInterestSelection((current) => {
            const nextCategories = current.categories.includes(categoryId)
                ? current.categories.filter((item) => item !== categoryId)
                : [...current.categories, categoryId];
            const availableTagIds = new Set(
                getAvailableInterestTags(nextCategories, interestOptions).map((tag) => tag.id)
            );

            return {
                categories: nextCategories,
                tags: current.tags.filter((tagId) => availableTagIds.has(tagId)),
            };
        });
    };

    const toggleInterestTag = (tagId: number) => {
        setDraftInterestSelection((current) => ({
            ...current,
            tags: current.tags.includes(tagId)
                ? current.tags.filter((item) => item !== tagId)
                : [...current.tags, tagId],
        }));
    };

    const handleCancelInterestFields = () => {
        setDraftInterestSelection(interestSelection);
        setIsEditingInterestFields(false);
    };

    const handleResetInterestFields = () => {
        setDraftInterestSelection(DEFAULT_INTEREST_SELECTION);
    };

    const handleSaveInterestFields = async () => {
        if (interestSaving) {
            return;
        }

        const payload = {
            interestsIds: draftInterestSelection.categories,
            interestTagIds: draftInterestSelection.tags,
        };

        try {
            validateUpdateMyInterestsRequest(payload, interestOptions);
        } catch (error) {
            openSys({
                tone: "warning",
                title: error instanceof Error ? error.message : "관심 분야를 다시 확인해 주세요.",
                confirmLabel: "확인",
            });
            return;
        }

        try {
            setInterestSaving(true);
            const saved = await updateMyInterests(payload);
            const nextSelection = normalizeInterestSelection(
                {
                    categories: saved.interestIds,
                    tags: saved.interestTagIds,
                },
                interestOptions
            );

            setInterestSelection(nextSelection);
            setDraftInterestSelection(nextSelection);
            setIsEditingInterestFields(false);
            openSys({
                title: "관심 분야를 저장했어요.",
                description: "선택한 카테고리와 태그를 바탕으로 추천 퀴즈와 학습 흐름을 구성하고 있어요.",
                confirmLabel: "확인",
            });
        } catch (error) {
            console.error(error);
            openSys({
                tone: "error",
                title: error instanceof Error ? error.message : "관심 분야 저장에 실패했습니다.",
                confirmLabel: "확인",
            });
        } finally {
            setInterestSaving(false);
        }
    };

    const selectedInquiryOption =
        inquiryTypeOptions.find((option) => option.value === inquiryType) ?? null;

    const SelectedInquiryIcon = selectedInquiryOption?.icon ?? CircleHelp;

    async function loadInquiryList(nextSelectedId?: number | null) {
        try {
            setInquiryListLoading(true);
            const items = await getMyInquiryList();
            setInquiryList(items);

            const targetId =
                nextSelectedId === undefined
                    ? (selectedInquiryId ?? items[0]?.id ?? null)
                    : (nextSelectedId ?? items[0]?.id ?? null);

            setSelectedInquiryId(targetId);

            if (!targetId) {
                setSelectedInquiryDetail(null);
            }
        } catch (error) {
            console.error(error);
            setInquiryList([]);
            setSelectedInquiryId(null);
            setSelectedInquiryDetail(null);
            openSys({
                tone: "error",
                title: "문의 목록을 불러오지 못했습니다.",
            });
        } finally {
            setInquiryListLoading(false);
        }
    }

    async function loadInquiryDetail(inquiryId: number) {
        try {
            setSelectedInquiryLoading(true);
            const detail = await getMyInquiryDetail(inquiryId);
            setSelectedInquiryDetail(detail);
        } catch (error) {
            console.error(error);
            setSelectedInquiryDetail(null);
            openSys({
                tone: "error",
                title: "문의 상세를 불러오지 못했습니다.",
            });
        } finally {
            setSelectedInquiryLoading(false);
        }
    }

    const handleInquirySubmit = async () => {
        if (!inquiryType) {
            openSys({
                tone: "warning",
                title: "문의 유형을 선택해 주세요.",
            });
            return;
        }

        const trimmedTitle = inquiryTitle.trim();
        const trimmedContent = inquiryContent.trim();

        if (trimmedTitle.length < 2 || trimmedTitle.length > 200) {
            openSys({
                tone: "warning",
                title: "제목은 2자 이상 200자 이하로 입력해 주세요.",
            });
            return;
        }

        if (trimmedContent.length < 5 || trimmedContent.length > 5000) {
            openSys({
                tone: "warning",
                title: "내용은 5자 이상 5000자 이하로 입력해 주세요.",
            });
            return;
        }

        try {
            setInquirySubmitting(true);
            const inquiryId = await createInquiry({
                type: inquiryType,
                title: trimmedTitle,
                content: trimmedContent,
            });

            setInquiryTitle("");
            setInquiryContent("");
            setInquiryType("");
            setIsInquiryDropdownOpen(false);

            await loadInquiryList(inquiryId);
            setInquiryView("list");
            openSys({
                tone: "success",
                title: "문의가 등록되었습니다.",
            });
        } catch (error) {
            console.error(error);
            openSys({
                tone: "error",
                title: "문의 등록에 실패했습니다.",
            });
        } finally {
            setInquirySubmitting(false);
        }
    };

    const handleInquiryReset = () => {
        setInquiryType("");
        setInquiryTitle("");
        setInquiryContent("");
        setIsInquiryDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inquiryDropdownRef.current &&
                !inquiryDropdownRef.current.contains(event.target as Node)
            ) {
                setIsInquiryDropdownOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsInquiryDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    useEffect(() => {
        const syncUserProfile = () => {
            setUserProfile((prev) => ({
                ...prev,
                nickname: localStorage.getItem("nickname") || defaultUserProfile.nickname,
                email: localStorage.getItem("email") || defaultUserProfile.email,
                lastActivityAt: getMostRecentActivityAt(prev.lastActivityAt, getLastActivityAt()),
            }));
        };

        syncUserProfile();
        window.addEventListener("storage", syncUserProfile);
        window.addEventListener("focus", syncUserProfile);
        window.addEventListener(LAST_ACTIVITY_EVENT, syncUserProfile as EventListener);

        return () => {
            window.removeEventListener("storage", syncUserProfile);
            window.removeEventListener("focus", syncUserProfile);
            window.removeEventListener(LAST_ACTIVITY_EVENT, syncUserProfile as EventListener);
        };
    }, []);

    useEffect(() => {
        const handleAuthStorageCleared = () => {
            setUserProfile({
                ...defaultUserProfile,
                lastActivityAt: null,
            });
        };

        window.addEventListener(AUTH_STORAGE_CLEARED_EVENT, handleAuthStorageCleared as EventListener);

        return () => {
            window.removeEventListener(AUTH_STORAGE_CLEARED_EVENT, handleAuthStorageCleared as EventListener);
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchMyProfile = async () => {
            try {
                const profile = await getMyProfileSummary();

                if (!mounted) {
                    return;
                }

                setUserProfile((prev) => ({
                    ...prev,
                    nickname: profile.nickname || prev.nickname,
                    email: profile.email || prev.email,
                    lastActivityAt: getMostRecentActivityAt(profile.lastActivityAt, getLastActivityAt()),
                    representativeLabel: profile.representativeLabel,
                    representativeJob: profile.representativeJob,
                    representativeCareer: profile.representativeCareer,
                }));
            } catch (error) {
                console.error(error);
            }
        };

        fetchMyProfile();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchInterests = async () => {
            try {
                setInterestOptionsLoading(true);
                const interests = await getInterests();

                if (!mounted) {
                    return;
                }

                setInterestOptions(interests);

                try {
                    const mine = await getMyInterests();

                    if (!mounted) {
                        return;
                    }

                    const nextSelection = normalizeInterestSelection(
                        {
                            categories: mine.interestIds,
                            tags: mine.interestTagIds,
                        },
                        interests
                    );

                    setInterestSelection(nextSelection);
                    setDraftInterestSelection(nextSelection);
                } catch (error) {
                    if (!mounted) {
                        return;
                    }

                    if (error instanceof InterestsApiError && error.status === 401) {
                        setInterestSelection(DEFAULT_INTEREST_SELECTION);
                        setDraftInterestSelection(DEFAULT_INTEREST_SELECTION);
                        return;
                    }

                    console.error(error);
                    openSys({
                        tone: "error",
                        title: "내 관심사를 불러오지 못했습니다.",
                    });
                    setInterestSelection(DEFAULT_INTEREST_SELECTION);
                    setDraftInterestSelection(DEFAULT_INTEREST_SELECTION);
                }
            } catch (error) {
                console.error(error);

                if (mounted) {
                    setInterestOptions([]);
                    setInterestSelection(DEFAULT_INTEREST_SELECTION);
                    setDraftInterestSelection(DEFAULT_INTEREST_SELECTION);
                    openSys({
                        tone: "error",
                        title: "관심사 목록을 불러오지 못했습니다.",
                    });
                }
            } finally {
                if (mounted) {
                    setInterestOptionsLoading(false);
                }
            }
        };

        void fetchInterests();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchCreditSummary = async () => {
            try {
                setCreditLoading(true);
                const summary = await getCreditAccountSummary();

                if (mounted) {
                    setCreditSummary(summary);
                }
            } catch (error) {
                console.error(error);
                if (mounted) {
                    setCreditSummary(defaultCreditSummary);
                }
            } finally {
                if (mounted) {
                    setCreditLoading(false);
                }
            }
        };

        fetchCreditSummary();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchQuizStats = async () => {
            try {
                setQuizStatsLoading(true);
                const summary = await getQuizDashboardStats();

                if (mounted) {
                    setQuizStats(summary);
                }
            } catch (error) {
                console.error(error);
                if (mounted) {
                    setQuizStats(defaultQuizStats);
                }
            } finally {
                if (mounted) {
                    setQuizStatsLoading(false);
                }
            }
        };

        void fetchQuizStats();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchQuizTimelineRecords = async () => {
            try {
                setQuizTimelineLoading(true);
                const records = await getQuizTimelineRecords(6);

                if (mounted) {
                    setQuizTimelineRecords(records);
                }
            } catch (error) {
                console.error(error);
                if (mounted) {
                    setQuizTimelineRecords([]);
                }
            } finally {
                if (mounted) {
                    setQuizTimelineLoading(false);
                }
            }
        };

        fetchQuizTimelineRecords();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchWrongNotes = async () => {
            try {
                setWrongNotesLoading(true);
                const items = await getRecentWrongNotes(5);

                if (mounted) {
                    setWrongNotes(items);
                }
            } catch (error) {
                console.error(error);
                if (mounted) {
                    setWrongNotes([]);
                }
            } finally {
                if (mounted) {
                    setWrongNotesLoading(false);
                }
            }
        };

        fetchWrongNotes();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchInterviewRecords = async () => {
            try {
                setInterviewLoading(true);
                const items = await getInterviewResultList();

                if (mounted) {
                    setInterviewRecords(
                        [...items].sort(
                            (left, right) =>
                                new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
                        )
                    );
                }
            } catch (error) {
                console.error(error);
                if (mounted) {
                    setInterviewRecords([]);
                }
            } finally {
                if (mounted) {
                    setInterviewLoading(false);
                }
            }
        };

        void fetchInterviewRecords();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchSchedules = async () => {
            try {
                setScheduleLoading(true);
                const items = await getMySchedules(getUpcomingScheduleRange());

                if (mounted) {
                    setSchedules(
                        [...items].sort(
                            (left, right) =>
                                new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
                        )
                    );
                }
            } catch (error) {
                console.error(error);
                if (mounted) {
                    setSchedules([]);
                }
            } finally {
                if (mounted) {
                    setScheduleLoading(false);
                }
            }
        };

        void fetchSchedules();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (activeMenu !== "inquiry") {
            return;
        }

        setInquiryView("list");
        void loadInquiryList();
    }, [activeMenu]);

    useEffect(() => {
        if (activeMenu !== "inquiry" || inquiryView !== "detail" || !selectedInquiryId) {
            return;
        }

        void loadInquiryDetail(selectedInquiryId);
    }, [activeMenu, inquiryView, selectedInquiryId]);

    const lastActivityLabel = useMemo(() => {
        if (!userProfile.lastActivityAt) return "최근 활동 없음";

        const parsed = new Date(userProfile.lastActivityAt);
        if (Number.isNaN(parsed.getTime())) {
            return "최근 활동 없음";
        }

        const diffMs = Date.now() - parsed.getTime();
        if (diffMs <= 0) return "방금 전";

        const minuteMs = 60 * 1000;
        const hourMs = 60 * minuteMs;
        const dayMs = 24 * hourMs;

        if (diffMs < minuteMs) return "방금 전";
        if (diffMs < hourMs) return `${Math.floor(diffMs / minuteMs)}분 전`;
        if (diffMs < dayMs) return `${Math.floor(diffMs / hourMs)}시간 전`;
        return `${Math.floor(diffMs / dayMs)}일 전`;
    }, [userProfile.lastActivityAt]);

    const totalWrongNotes = wrongNotes.length;
    const unresolvedWrongNotes = wrongNotes.filter((item) => !item.resolved).length;
    const bestQuizAccuracy = quizTimelineRecords.reduce(
        (max, record) => Math.max(max, record.accuracy),
        0
    );
    const recentSchedules = schedules.slice(0, 5);
    const recentInterviewRecords = interviewRecords.slice(0, 4);
    const recentQuizRecords = quizTimelineRecords.slice(0, 4);
    const selectedInterestCategoryLabels = interestSelection.categories.map((categoryId) =>
        getInterestCategoryLabel(categoryId, interestOptions)
    );
    const selectedInterestTagLabels = interestSelection.tags.map((tagId) =>
        getAvailableInterestTags(interestSelection.categories, interestOptions)
            .find((tag) => tag.id === tagId)?.name ?? String(tagId)
    );
    const availableDraftInterestTags = getAvailableInterestTags(draftInterestSelection.categories, interestOptions);

    const isInterviewRoute = location.pathname.startsWith("/mypage/interview");
    const displayActiveMenu: MenuKey = isInterviewRoute ? "interview" : activeMenu;

    const handleMenuClick = (menuKey: MenuKey) => {
        if (menuKey === "interview") {
            navigate("interview/records");
            return;
        }

        setActiveMenu(menuKey);

        if (isInterviewRoute) {
            navigate("/mypage");
        }
    };

    const renderInquirySection = () => (
        <Section>
            <SectionHeader>
                <div>
                    <SectionEyebrow>INTEREST FIELDS</SectionEyebrow>
                    <SectionTitle>관심 분야 설정</SectionTitle>
                    <SectionDescription>
                        관심 있는 분야를 선택하고, 나에게 맞는 학습 흐름과 추천 콘텐츠를 더 편하게 관리할 수 있습니다.
                    </SectionDescription>
                </div>
            </SectionHeader>

            <InquiryLayout $view={inquiryView}>
                <PanelCard>
                    <InquirySectionHeader>
                        <div>
                            <SectionTitle>문의 등록</SectionTitle>
                            <SectionDescription>
                                문의 유형, 제목, 내용을 입력하면 즉시 접수됩니다.
                            </SectionDescription>
                        </div>
                        <InquiryHeaderActions>
                            <GhostButton type="button" onClick={() => setInquiryView("list")}>
                                목록으로
                            </GhostButton>
                        </InquiryHeaderActions>
                    </InquirySectionHeader>

                    <FormGrid>
                        <FieldGroup>
                            <FieldLabel>문의 유형</FieldLabel>

                            <InquiryDropdownWrap ref={inquiryDropdownRef}>
                                <InquiryDropdownButton
                                    type="button"
                                    $open={isInquiryDropdownOpen}
                                    $placeholder={!selectedInquiryOption}
                                    onClick={() => setIsInquiryDropdownOpen((prev) => !prev)}
                                >
                                    <InquiryDropdownButtonLeft>
                                        <InquiryItemIconBox>
                                            <SelectedInquiryIcon size={16} />
                                        </InquiryItemIconBox>

                                        <InquiryDropdownButtonText>
                                            {selectedInquiryOption
                                                ? selectedInquiryOption.label
                                                : "문의 유형을 선택하세요"}
                                        </InquiryDropdownButtonText>
                                    </InquiryDropdownButtonLeft>

                                    <InquiryDropdownArrow $open={isInquiryDropdownOpen}>
                                        <ChevronDown size={18} />
                                    </InquiryDropdownArrow>
                                </InquiryDropdownButton>

                                {isInquiryDropdownOpen ? (
                                    <InquiryDropdownMenu>
                                        {inquiryTypeOptions.map((option) => {
                                            const Icon = option.icon;
                                            const isSelected = inquiryType === option.value;

                                            return (
                                                <InquiryDropdownItem
                                                    key={option.value}
                                                    type="button"
                                                    $selected={isSelected}
                                                    onClick={() => {
                                                        setInquiryType(option.value);
                                                        setIsInquiryDropdownOpen(false);
                                                    }}
                                                >
                                                    <InquiryItemIconBox>
                                                        <Icon size={16} />
                                                    </InquiryItemIconBox>

                                                    <InquiryItemLabel>{option.label}</InquiryItemLabel>
                                                </InquiryDropdownItem>
                                            );
                                        })}
                                    </InquiryDropdownMenu>
                                ) : null}
                            </InquiryDropdownWrap>
                        </FieldGroup>

                        <FieldGroup>
                            <FieldLabel>제목</FieldLabel>
                            <FieldInput
                                value={inquiryTitle}
                                onChange={(event) => setInquiryTitle(event.target.value)}
                                maxLength={200}
                                placeholder="문의 제목을 입력하세요"
                            />
                            <FieldHint>{inquiryTitle.trim().length}/200</FieldHint>
                        </FieldGroup>

                        <FieldGroup style={{ gridColumn: "1 / -1" }}>
                            <FieldLabel>내용</FieldLabel>
                            <FieldTextarea
                                value={inquiryContent}
                                onChange={(event) => setInquiryContent(event.target.value)}
                                maxLength={5000}
                                placeholder="문의 내용을 자세히 작성해 주세요"
                            />
                            <FieldHint>{inquiryContent.trim().length}/5000</FieldHint>
                        </FieldGroup>

                        <FieldGroup style={{ gridColumn: "1 / -1" }}>
                            <InlineInfo>
                                제목은 2자 이상 200자 이하, 내용은 5자 이상 5000자 이하로 입력할 수 있습니다.
                            </InlineInfo>
                        </FieldGroup>

                        <ButtonRow>
                            <GhostButton type="button" onClick={handleInquiryReset}>
                                초기화
                            </GhostButton>
                            <PrimaryButton
                                type="button"
                                onClick={handleInquirySubmit}
                                disabled={inquirySubmitting}
                            >
                                {inquirySubmitting ? "등록 중..." : "문의 등록"}
                            </PrimaryButton>
                        </ButtonRow>
                    </FormGrid>
                </PanelCard>

                <PanelCard>
                    <InquirySectionHeader>
                        <div>
                            <SectionTitle>내 문의 목록</SectionTitle>
                            <SectionDescription>
                                최신 문의부터 확인하고, 항목을 눌러 상세 내용을 볼 수 있습니다.
                            </SectionDescription>
                        </div>
                        <InquiryHeaderActions>
                            <PrimaryButton
                                type="button"
                                onClick={() => {
                                    handleInquiryReset();
                                    setInquiryView("create");
                                }}
                            >
                                문의 등록
                            </PrimaryButton>
                        </InquiryHeaderActions>
                    </InquirySectionHeader>

                    {inquiryListLoading ? (
                        <EmptyStateBox>문의 목록을 불러오는 중입니다.</EmptyStateBox>
                    ) : inquiryList.length === 0 ? (
                        <EmptyStateBox>아직 등록된 문의가 없습니다.</EmptyStateBox>
                    ) : (
                        <InquiryRecordList>
                            {inquiryList.map((item) => {
                                const statusMeta = toInquiryStatusMeta(item.status);
                                const isActive = selectedInquiryId === item.id;

                                return (
                                    <InquiryRecordCard
                                        key={item.id}
                                        type="button"
                                        $active={isActive}
                                        onClick={() => {
                                            setSelectedInquiryId(item.id);
                                            setInquiryView("detail");
                                        }}
                                    >
                                        <InquiryRecordTop>
                                            <InquiryMetaRow>
                                                <InquiryTypeChip>
                                                    {toInquiryTypeLabel(item.type)}
                                                </InquiryTypeChip>
                                                <InquiryStatusChip $tone={statusMeta.tone}>
                                                    {statusMeta.label}
                                                </InquiryStatusChip>
                                            </InquiryMetaRow>
                                            <InquiryRecordId>#{item.id}</InquiryRecordId>
                                        </InquiryRecordTop>

                                        <InquiryRecordTitle>{item.title}</InquiryRecordTitle>

                                        <InquiryDateRow>
                                            <span>등록 {formatInquiryDate(item.createdAt)}</span>
                                            <span>
                                                답변{" "}
                                                {item.answeredAt
                                                    ? formatInquiryDate(item.answeredAt)
                                                    : "대기 중"}
                                            </span>
                                        </InquiryDateRow>
                                    </InquiryRecordCard>
                                );
                            })}
                        </InquiryRecordList>
                    )}
                </PanelCard>

                <PanelCard>
                    <InquirySectionHeader>
                        <div>
                            <SectionTitle>문의 상세</SectionTitle>
                            <SectionDescription>
                                선택한 문의의 질문과 답변 상태를 확인할 수 있습니다.
                            </SectionDescription>
                        </div>
                        <InquiryHeaderActions>
                            <GhostButton type="button" onClick={() => setInquiryView("list")}>
                                목록으로
                            </GhostButton>
                        </InquiryHeaderActions>
                    </InquirySectionHeader>

                    {selectedInquiryLoading ? (
                        <EmptyStateBox>문의 상세를 불러오는 중입니다.</EmptyStateBox>
                    ) : !selectedInquiryDetail ? (
                        <EmptyStateBox>확인할 문의를 선택해 주세요.</EmptyStateBox>
                    ) : (
                        <InquiryDetailWrap>
                            <InquiryDetailHeader>
                                <InquiryMetaRow>
                                    <InquiryTypeChip>
                                        {toInquiryTypeLabel(selectedInquiryDetail.type)}
                                    </InquiryTypeChip>
                                    <InquiryStatusChip
                                        $tone={toInquiryStatusMeta(selectedInquiryDetail.status).tone}
                                    >
                                        {toInquiryStatusMeta(selectedInquiryDetail.status).label}
                                    </InquiryStatusChip>
                                </InquiryMetaRow>
                                <InquiryRecordId>#{selectedInquiryDetail.id}</InquiryRecordId>
                            </InquiryDetailHeader>

                            <InquiryDetailTitle>{selectedInquiryDetail.title}</InquiryDetailTitle>

                            <InquiryTimeline>
                                <InquiryTimelineCard>
                                    <InquiryTimelineLabel>질문</InquiryTimelineLabel>
                                    <InquiryTimelineContent>
                                        {selectedInquiryDetail.content}
                                    </InquiryTimelineContent>
                                    <InquiryTimelineDate>
                                        등록일 {formatInquiryDate(selectedInquiryDetail.createdAt)}
                                    </InquiryTimelineDate>
                                </InquiryTimelineCard>

                                <InquiryTimelineCard
                                    $answered={Boolean(selectedInquiryDetail.answerContent)}
                                >
                                    <InquiryTimelineLabel>
                                        {selectedInquiryDetail.answerContent ? "답변" : "답변 대기 중"}
                                    </InquiryTimelineLabel>
                                    <InquiryTimelineContent>
                                        {selectedInquiryDetail.answerContent ??
                                            "아직 등록된 답변이 없습니다. 처리 상태가 변경되면 이 영역에 답변이 표시됩니다."}
                                    </InquiryTimelineContent>
                                    <InquiryTimelineDate>
                                        {selectedInquiryDetail.answeredAt
                                            ? `답변일 ${formatInquiryDate(selectedInquiryDetail.answeredAt)}`
                                            : "답변 전"}
                                    </InquiryTimelineDate>
                                </InquiryTimelineCard>
                            </InquiryTimeline>
                        </InquiryDetailWrap>
                    )}
                </PanelCard>
            </InquiryLayout>
        </Section>
    );

    const renderContent = () => {
        switch (activeMenu) {
            case "profile":
                return (
                    <>
                        <Section>
                            <SectionHeader>
                                <div>
                                    <SectionEyebrow>MY DASHBOARD</SectionEyebrow>
                                    <SectionTitle>내 정보와 학습 현황</SectionTitle>
                                    <SectionDescription>
                                        나의 정보와 보유 크레딧, 학습 기록, 예정된 일정까지 한 화면에서 확인할 수 있습니다.
                                    </SectionDescription>
                                </div>
                            </SectionHeader>

                            <HeroCard>
                                <HeroLeft>
                                    <AvatarWrap>
                                        <User size={32} />
                                    </AvatarWrap>
                                    <HeroTextGroup>
                                        <HeroTitle>{userProfile.nickname}님, 안녕하세요.</HeroTitle>
                                        <HeroSub>
                                            {userProfile.email}
                                        </HeroSub>
                                        {userProfile.representativeLabel ? (
                                            <HeroBadgeRow>
                                                <RepresentativeBadge>
                                                    {userProfile.representativeLabel}
                                                </RepresentativeBadge>
                                                {(userProfile.representativeJob || userProfile.representativeCareer) ? (
                                                    <RepresentativeHint>
                                                        {[userProfile.representativeJob, userProfile.representativeCareer]
                                                            .filter(Boolean)
                                                            .join(" · ")}
                                                    </RepresentativeHint>
                                                ) : null}
                                            </HeroBadgeRow>
                                        ) : null}
                                        <HeroMetaRow>
                                            <HeroMetaChip>
                                                <Clock3 size={14} />
                                                {lastActivityLabel === "최근 활동 없음"
                                                    ? lastActivityLabel
                                                    : `최근 활동 ${lastActivityLabel}`}
                                            </HeroMetaChip>
                                        </HeroMetaRow>
                                    </HeroTextGroup>
                                </HeroLeft>

                                <HeroRight>
                                    <CreditSummaryCard>
                                        <CreditSummaryTop>
                                            <CreditSummaryBadge>
                                                <CreditCard size={14} />
                                                CREDIT OVERVIEW
                                            </CreditSummaryBadge>
                                            <CreditSummaryLabel>내 크레딧</CreditSummaryLabel>
                                        </CreditSummaryTop>

                                        <CreditBalanceRow>
                                            <CreditBalanceCopy>
                                                <CreditSummaryLabel>잔액</CreditSummaryLabel>
                                                <CreditBalanceValue>
                                                    {creditLoading ? "..." : creditSummary.balance.toLocaleString("ko-KR")}
                                                </CreditBalanceValue>
                                                <CreditBalanceUnit>credits</CreditBalanceUnit>
                                            </CreditBalanceCopy>
                                            <CreditBalanceCaption>
                                                {creditLoading ? "크레딧 정보를 불러오는 중입니다." : "AI 면접과 학습 기능에 사용하는 현재 보유량"}
                                            </CreditBalanceCaption>
                                        </CreditBalanceRow>

                                        {/*<CreditMetaGrid>*/}
                                        {/*    <CreditMetaItem>*/}
                                        {/*        <CreditMetaTitle>이번 달 적립</CreditMetaTitle>*/}
                                        {/*        <CreditMetaValue>*/}
                                        {/*            {creditLoading ? "..." : `${mockCreditSummary.monthlyEarned}개`}*/}
                                        {/*        </CreditMetaValue>*/}
                                        {/*    </CreditMetaItem>*/}

                                        {/*    <CreditMetaItem>*/}
                                        {/*        <CreditMetaTitle>이번 달 사용</CreditMetaTitle>*/}
                                        {/*        <CreditMetaValue>*/}
                                        {/*            {creditLoading ? "..." : `${mockCreditSummary.monthlyUsed}개`}*/}
                                        {/*        </CreditMetaValue>*/}
                                        {/*    </CreditMetaItem>*/}
                                        {/*</CreditMetaGrid>*/}

                                        {/*<CreditExpiryNotice>*/}
                                        {/*    <CreditExpiryLabel>만료 예정일</CreditExpiryLabel>*/}
                                        {/*    <CreditExpiryValue>*/}
                                        {/*        {creditLoading ? "..." : mockCreditSummary.expiresAt}*/}
                                        {/*    </CreditExpiryValue>*/}
                                        {/*</CreditExpiryNotice>*/}
                                    </CreditSummaryCard>
                                </HeroRight>
                            </HeroCard>
                        </Section>

                        <StatsGrid>
                            {/*<StatCard>*/}
                            {/*    <StatLabel>보유 크레딧</StatLabel>*/}
                            {/*    <StatValue>{creditLoading ? "..." : `${mockCreditSummary.balance}개`}</StatValue>*/}
                            {/*    <StatSub>*/}
                            {/*        이번 달 적립 {mockCreditSummary.monthlyEarned}개 · 사용 {mockCreditSummary.monthlyUsed}개*/}
                            {/*    </StatSub>*/}
                            {/*</StatCard>*/}
                            <StatCard>
                                <StatLabel>총 모의 면접 기록</StatLabel>
                                <StatValue>{interviewLoading ? "..." : `${interviewRecords.length}개`}</StatValue>
                                <StatSub>누적 AI 모의 면접 기록 수</StatSub>
                            </StatCard>
                            <StatCard>
                                <StatLabel>총 퀴즈 풀이</StatLabel>
                                <StatValue>{quizStatsLoading ? "..." : `${quizStats.solvedQuestions}문제`}</StatValue>
                                <StatSub>
                                    평균 정답률 {quizStatsLoading ? "..." : `${quizStats.averageAccuracy}%`}
                                </StatSub>
                            </StatCard>
                            <StatCard>
                                <StatLabel>내 포텐노트 개수</StatLabel>
                                <StatValue>{wrongNotesLoading ? "..." : `${totalWrongNotes}개`}</StatValue>
                                <StatSub>현재 불러온 포텐노트 기준</StatSub>
                            </StatCard>
                            <StatCard>
                                <StatLabel>연속 학습일</StatLabel>
                                <StatValue>{quizStatsLoading ? "..." : `${quizStats.streakDays}일`}</StatValue>
                                <StatSub>퀴즈 학습 타임라인 기준</StatSub>
                            </StatCard>
                        </StatsGrid>

                        <ContentGrid>
                            <PanelCard>
                                <PanelHeader>
                                    <PanelTitle>AI 모의 면접 기록</PanelTitle>
                                    <PanelAction onClick={() => navigate("interview/records")}>
                                        전체 보기
                                    </PanelAction>
                                </PanelHeader>
                                <RecordList>
                                    {interviewLoading ? (
                                        <RecordMeta>면접 기록을 불러오는 중입니다.</RecordMeta>
                                    ) : recentInterviewRecords.length === 0 ? (
                                        <RecordMeta>표시할 AI 모의 면접 기록이 없습니다.</RecordMeta>
                                    ) : (
                                        recentInterviewRecords.map((record) => (
                                            <RecordItem key={record.interviewId}>
                                                <RecordLeft>
                                                    <RecordTitle>{record.title || record.interviewType}</RecordTitle>
                                                    <RecordMeta>
                                                        {record.role} · {formatInterviewDateTime(record.createdAt)}
                                                    </RecordMeta>
                                                </RecordLeft>
                                                <RecordRight>
                                                    <ScoreBadge>{record.finished ? "완료" : "진행 중"}</ScoreBadge>
                                                    <DetailButton
                                                        type="button"
                                                        onClick={() => navigate(`/mypage/interview/${record.interviewId}`)}
                                                    >
                                                        상세 보기
                                                        <ChevronRight size={16} />
                                                    </DetailButton>
                                                </RecordRight>
                                            </RecordItem>
                                        ))
                                    )}
                                </RecordList>
                            </PanelCard>

                            <PanelCard>
                                <PanelHeader>
                                    <PanelTitle>내 퀴즈 기록</PanelTitle>
                                    <PanelAction onClick={() => window.location.assign("/learning/quiz/timeline")}>
                                        전체 보기
                                    </PanelAction>
                                </PanelHeader>
                                <RecordList>
                                    {quizTimelineLoading ? (
                                        <RecordMeta>퀴즈 기록을 불러오는 중입니다.</RecordMeta>
                                    ) : recentQuizRecords.length === 0 ? (
                                        <RecordMeta>표시할 퀴즈 기록이 없습니다.</RecordMeta>
                                    ) : (
                                        recentQuizRecords.map((record) => (
                                            <RecordItem key={record.id}>
                                                <RecordLeft>
                                                    <RecordTitle>{record.title}</RecordTitle>
                                                    <RecordMeta>
                                                        {record.category ? `${record.category} · ` : ""}
                                                        {record.correct}/{record.total} 정답 · {record.studiedAt}
                                                    </RecordMeta>
                                                </RecordLeft>
                                                <RecordRight>
                                                    <ScoreBadge>{record.accuracy}%</ScoreBadge>
                                                    <DetailButton
                                                        type="button"
                                                        onClick={() =>
                                                            window.location.assign(
                                                                `/learning/quiz/play/result/${record.sessionId ?? record.id}`
                                                            )
                                                        }
                                                    >
                                                        결과 보기
                                                        <ChevronRight size={16} />
                                                    </DetailButton>
                                                </RecordRight>
                                            </RecordItem>
                                        ))
                                    )}
                                </RecordList>
                            </PanelCard>
                        </ContentGrid>

                        <Section>
                            <SectionHeader>
                                <div>
                                    <SectionEyebrow>SCHEDULE</SectionEyebrow>
                                    <SectionTitle>일정</SectionTitle>
                                    <SectionDescription>
                                        예정된 학습 및 면접 준비 일정을 빠르게 확인할 수 있습니다.
                                    </SectionDescription>
                                </div>
                            </SectionHeader>
                            <PanelCard>
                                <PanelHeader>
                                    <PanelTitle>예정된 일정</PanelTitle>
                                    <PrimaryButton type="button" onClick={() => navigate("schedule")}>일정 관리</PrimaryButton>
                                </PanelHeader>
                                <ScheduleTable>
                                    <thead>
                                    <tr>
                                        <th>구분</th>
                                        <th>일정명</th>
                                        <th>날짜</th>
                                        <th>시간</th>
                                        <th>관리</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {scheduleLoading ? (
                                        <tr>
                                            <td colSpan={5}>
                                                <EmptyStateBox>일정 정보를 불러오는 중입니다.</EmptyStateBox>
                                            </td>
                                        </tr>
                                    ) : recentSchedules.length === 0 ? (
                                        <tr>
                                            <td colSpan={5}>
                                                <EmptyStateBox>등록된 일정이 없습니다.</EmptyStateBox>
                                            </td>
                                        </tr>
                                    ) : recentSchedules.map((item) => (
                                        <tr key={item.id}>
                                            <td>{getScheduleTypeLabel(item)}</td>
                                            <td>{item.title}</td>
                                            <td>{formatScheduleDate(item.startAt)}</td>
                                            <td>{formatScheduleTime(item)}</td>
                                            <td>
                                                <TableActionGroup>
                                                    <TextButton type="button" onClick={() => navigate("schedule")}>일정 관리</TextButton>
                                                </TableActionGroup>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </ScheduleTable>
                            </PanelCard>
                        </Section>
                    </>
                );

            case "quiz":
                return (
                    <>
                        <Section>
                            <SectionHeader>
                                <div>
                                    <SectionEyebrow>QUIZ RECORD</SectionEyebrow>
                                    <SectionTitle>퀴즈 타임라인과 오답 노트</SectionTitle>
                                    <SectionDescription>
                                        퀴즈 풀이 흐름과 복습이 필요한 문제를 함께 확인하며 학습 상태를 점검할 수 있습니다.
                                    </SectionDescription>
                                </div>
                            </SectionHeader>

                            <HeroCard>
                                <HeroLeft>
                                    <AvatarWrap>
                                        <FileText size={30} />
                                    </AvatarWrap>
                                    <HeroTextGroup>
                                        <HeroTitle>퀴즈 학습 이력을 마이페이지에서 바로 확인하세요.</HeroTitle>
                                        <HeroSub>
                                            최근 학습 흐름을 살펴보고 다시 풀어볼 문제까지 이어서 점검할 수 있습니다.
                                        </HeroSub>
                                        <HeroMetaRow>
                                            <HeroMetaChip>
                                                <Clock3 size={14} />
                                                최근 세션 {quizTimelineLoading ? "..." : `${quizTimelineRecords.length}개`}
                                            </HeroMetaChip>
                                            <HeroMetaChip>
                                                <ShieldCheck size={14} />
                                                복습 필요 {wrongNotesLoading ? "..." : `${unresolvedWrongNotes}개`}
                                            </HeroMetaChip>
                                        </HeroMetaRow>
                                    </HeroTextGroup>
                                </HeroLeft>
                                <HeroRight>
                                    <PrimaryButton type="button" onClick={() => window.location.assign("/learning/quiz/timeline")}>
                                        전체 퀴즈 기록 보기
                                    </PrimaryButton>
                                </HeroRight>
                            </HeroCard>
                        </Section>

                        <StatsGrid>
                            <StatCard>
                                <StatLabel>최근 퀴즈 세션</StatLabel>
                                <StatValue>{quizTimelineLoading ? "..." : `${quizTimelineRecords.length}개`}</StatValue>
                                <StatSub>타임라인 기준 최근 학습 세션 수</StatSub>
                            </StatCard>
                            <StatCard>
                                <StatLabel>미해결 오답</StatLabel>
                                <StatValue>{wrongNotesLoading ? "..." : `${unresolvedWrongNotes}개`}</StatValue>
                                <StatSub>다시 복습이 필요한 문제 수</StatSub>
                            </StatCard>
                            <StatCard>
                                <StatLabel>오답 노트 수</StatLabel>
                                <StatValue>{wrongNotesLoading ? "..." : `${totalWrongNotes}개`}</StatValue>
                                <StatSub>최근 오답 노트 항목 기준</StatSub>
                            </StatCard>
                            <StatCard>
                                <StatLabel>최고 정답률</StatLabel>
                                <StatValue>{quizTimelineLoading ? "..." : `${bestQuizAccuracy}%`}</StatValue>
                                <StatSub>최근 퀴즈 세션 중 최고 기록</StatSub>
                            </StatCard>
                        </StatsGrid>

                        <ContentGrid>
                            <PanelCard>
                                <PanelHeader>
                                    <PanelTitle>퀴즈 타임라인</PanelTitle>
                                    <PanelAction onClick={() => window.location.assign("/learning/quiz/timeline")}>
                                        전체 보기
                                    </PanelAction>
                                </PanelHeader>
                                <RecordList>
                                    {quizTimelineLoading ? (
                                        <RecordMeta>퀴즈 타임라인을 불러오는 중입니다.</RecordMeta>
                                    ) : quizTimelineRecords.length === 0 ? (
                                        <RecordMeta>표시할 퀴즈 타임라인이 없습니다.</RecordMeta>
                                    ) : (
                                        quizTimelineRecords.map((record) => (
                                            <RecordItem key={record.id}>
                                                <RecordLeft>
                                                    <RecordTitle>{record.title}</RecordTitle>
                                                    <RecordMeta>
                                                        {record.category ? `${record.category} · ` : ""}
                                                        {record.correct}/{record.total} 정답 · 최근 학습 {record.studiedAt}
                                                    </RecordMeta>
                                                </RecordLeft>
                                                <RecordRight>
                                                    <ScoreBadge>{record.accuracy}%</ScoreBadge>
                                                    <DetailButton
                                                        type="button"
                                                        onClick={() =>
                                                            window.location.assign(
                                                                `/learning/quiz/play/result/${record.sessionId ?? record.id}`
                                                            )
                                                        }
                                                    >
                                                        결과 보기
                                                        <ChevronRight size={16} />
                                                    </DetailButton>
                                                </RecordRight>
                                            </RecordItem>
                                        ))
                                    )}
                                </RecordList>
                            </PanelCard>

                            <PanelCard>
                                <PanelHeader>
                                    <PanelTitle>오답 노트</PanelTitle>
                                    <PanelAction onClick={() => window.location.assign("/learning/quiz/wrong-notes")}>
                                        전체 보기
                                    </PanelAction>
                                </PanelHeader>
                                <WrongNoteList>
                                    {wrongNotesLoading ? (
                                        <RecordMeta>오답 노트를 불러오는 중입니다.</RecordMeta>
                                    ) : wrongNotes.length === 0 ? (
                                        <RecordMeta>표시할 오답 노트가 없습니다.</RecordMeta>
                                    ) : (
                                        wrongNotes.map((item) => (
                                            <WrongNoteCard key={item.reviewId}>
                                                <WrongNoteHeader>
                                                    <WrongNoteBadges>
                                                        <WrongNoteBadge $tone={item.resolved ? "resolved" : "pending"}>
                                                            {item.resolved ? "복습 완료" : "복습 필요"}
                                                        </WrongNoteBadge>
                                                        <WrongNoteBadge $tone="default">
                                                            {toQuestionTypeLabel(item.questionType)}
                                                        </WrongNoteBadge>
                                                        <WrongNoteBadge $tone="default">
                                                            {toDifficultyLabel(item.difficulty)}
                                                        </WrongNoteBadge>
                                                    </WrongNoteBadges>
                                                    <WrongNoteDate>{item.answeredAt || "기록 일시 없음"}</WrongNoteDate>
                                                </WrongNoteHeader>
                                                <WrongNotePrompt>{item.prompt}</WrongNotePrompt>
                                                <WrongNoteMeta>
                                                    {item.categoryLabel ? `${item.categoryLabel} · ` : ""}
                                                    {item.sessionTitle ? item.sessionTitle : "세션 정보 없음"}
                                                </WrongNoteMeta>
                                                <WrongNoteAnswerGrid>
                                                    <WrongNoteAnswerBox>
                                                        <WrongNoteAnswerLabel>내 답안</WrongNoteAnswerLabel>
                                                        <WrongNoteAnswerValue $tone="user">
                                                            {item.userAnswer || "-"}
                                                        </WrongNoteAnswerValue>
                                                    </WrongNoteAnswerBox>
                                                    <WrongNoteAnswerBox>
                                                        <WrongNoteAnswerLabel>정답</WrongNoteAnswerLabel>
                                                        <WrongNoteAnswerValue $tone="correct">
                                                            {item.correctAnswer || "-"}
                                                        </WrongNoteAnswerValue>
                                                    </WrongNoteAnswerBox>
                                                </WrongNoteAnswerGrid>
                                            </WrongNoteCard>
                                        ))
                                    )}
                                </WrongNoteList>
                            </PanelCard>
                        </ContentGrid>
                    </>
                );

            case "schedule":
                return (
                    <Section>
                        <SectionHeader>
                            <div>
                                <SectionEyebrow>SCHEDULE</SectionEyebrow>
                                <SectionTitle>일정 관리</SectionTitle>
                                <SectionDescription>
                                    면접 준비, 퀴즈 복습, 자기소개서 점검 일정을 자유롭게 저장하고 관리할 수 있습니다.
                                </SectionDescription>
                            </div>
                        </SectionHeader>
                        <PanelCard>
                            <PanelHeader>
                                <PanelTitle>예정된 일정</PanelTitle>
                                <PrimaryButton type="button" onClick={() => navigate("schedule")}>일정 추가</PrimaryButton>
                            </PanelHeader>
                            <ScheduleTable>
                                <thead>
                                <tr>
                                    <th>구분</th>
                                    <th>일정명</th>
                                    <th>날짜</th>
                                    <th>시간</th>
                                    <th>관리</th>
                                </tr>
                                </thead>
                                <tbody>
                                {scheduleLoading ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <EmptyStateBox>일정 정보를 불러오는 중입니다.</EmptyStateBox>
                                        </td>
                                    </tr>
                                ) : schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <EmptyStateBox>등록된 일정이 없습니다.</EmptyStateBox>
                                        </td>
                                    </tr>
                                ) : schedules.map((item) => (
                                    <tr key={item.id}>
                                        <td>{getScheduleTypeLabel(item)}</td>
                                        <td>{item.title}</td>
                                        <td>{formatScheduleDate(item.startAt)}</td>
                                        <td>{formatScheduleTime(item)}</td>
                                        <td>
                                            <TableActionGroup>
                                                <TextButton type="button" onClick={() => navigate("schedule")}>일정 관리</TextButton>
                                            </TableActionGroup>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </ScheduleTable>
                        </PanelCard>
                    </Section>
                );

            case "interest field":
                return (
                    <Section>
                        <SectionHeader>
                            <div>
                                <SectionEyebrow>INTEREST FIELDS</SectionEyebrow>
                                <SectionTitle>관심 분야 설정</SectionTitle>
                                <SectionDescription>
                                    관심 분야를 설정하고, 학습에 맞는 정보를 더 편하게 관리할 수 있습니다.
                                </SectionDescription>
                            </div>
                        </SectionHeader>
                        <SettingsGrid>
                            {/*<SettingCard>*/}
                            {/*    <SettingTitle>?뚮┝ ?ㅼ젙</SettingTitle>*/}
                            {/*    <SettingDescription>?댁쫰 由щ쭏?몃뱶, 硫댁젒 ?쇱젙, 遺꾩꽍 ?꾨즺 ?뚮┝??耳쒓굅???????덉뒿?덈떎.</SettingDescription>*/}
                            {/*    <ToggleRow>*/}
                            {/*        <span>?몄떆 ?뚮┝</span>*/}
                            {/*        <FakeToggle $active />*/}
                            {/*    </ToggleRow>*/}
                            {/*    <ToggleRow>*/}
                            {/*        <span>?대찓???뚮┝</span>*/}
                            {/*        <FakeToggle $active={false} />*/}
                            {/*    </ToggleRow>*/}
                            {/*</SettingCard>*/}

                            <SettingCard $featured>
                                <SettingTitle>관심 분야 선택</SettingTitle>
                                <SettingDescription>
                                    1차로 {interestOptions.length}개 카테고리 중 관심 분야를 고르고, 2차로 세부 태그를 선택해 추천 흐름을 더 정교하게 맞출 수 있습니다.
                                </SettingDescription>
                                <InterestSummaryGrid>
                                    <InterestFieldSummary>
                                        <SummaryLabel>선택한 카테고리</SummaryLabel>
                                        <TagRow>
                                            {selectedInterestCategoryLabels.length > 0 ? selectedInterestCategoryLabels.map((field) => (
                                                <Tag key={field}>{field}</Tag>
                                            )) : (
                                                <Tag>관심 카테고리를 선택해 주세요.</Tag>
                                            )}
                                        </TagRow>
                                    </InterestFieldSummary>
                                    <InterestFieldSummary>
                                        <SummaryLabel>선택한 태그</SummaryLabel>
                                        <TagRow>
                                            {selectedInterestTagLabels.length > 0 ? selectedInterestTagLabels.map((tag) => (
                                                <Tag key={tag}>{tag}</Tag>
                                            )) : (
                                                <Tag>세부 태그를 선택해 주세요.</Tag>
                                            )}
                                        </TagRow>
                                    </InterestFieldSummary>
                                </InterestSummaryGrid>
                                {interestOptionsLoading ? (
                                    <EmptyInterestHint>관심사 목록을 불러오는 중입니다.</EmptyInterestHint>
                                ) : isEditingInterestFields ? (
                                    <>
                                        <InterestEditorGrid>
                                            <InterestFieldEditorSection>
                                                <EditorTitle>1차 카테고리 선택</EditorTitle>
                                                <InterestFieldPicker>
                                                    {interestOptions.map((category) => (
                                                        <InterestFieldChipButton
                                                            key={category.id}
                                                            type="button"
                                                            $active={draftInterestSelection.categories.includes(category.id)}
                                                            onClick={() => toggleInterestCategory(category.id)}
                                                        >
                                                            {formatInterestCategoryLabel(category.name)}
                                                        </InterestFieldChipButton>
                                                    ))}
                                                </InterestFieldPicker>
                                            </InterestFieldEditorSection>
                                            <InterestFieldEditorSection>
                                                <EditorTitle>2차 태그 선택</EditorTitle>
                                                {draftInterestSelection.categories.length > 0 ? (
                                                    <InterestFieldPicker>
                                                        {availableDraftInterestTags.map((tag) => (
                                                            <InterestFieldChipButton
                                                                key={tag.id}
                                                                type="button"
                                                                $active={draftInterestSelection.tags.includes(tag.id)}
                                                                onClick={() => toggleInterestTag(tag.id)}
                                                            >
                                                                #{tag.name}
                                                            </InterestFieldChipButton>
                                                        ))}
                                                    </InterestFieldPicker>
                                                ) : (
                                                    <EmptyInterestHint>
                                                        먼저 1차 카테고리를 선택하면 관련 태그가 열립니다.
                                                    </EmptyInterestHint>
                                                )}
                                            </InterestFieldEditorSection>
                                        </InterestEditorGrid>
                                        <InterestMetaRow>
                                            <SelectionMetaCard>
                                                <SelectionMetaValue>{draftInterestSelection.categories.length}개</SelectionMetaValue>
                                                <SelectionMetaLabel>선택된 카테고리</SelectionMetaLabel>
                                            </SelectionMetaCard>
                                            <SelectionMetaCard>
                                                <SelectionMetaValue>{draftInterestSelection.tags.length}개</SelectionMetaValue>
                                                <SelectionMetaLabel>선택된 태그</SelectionMetaLabel>
                                            </SelectionMetaCard>
                                        </InterestMetaRow>
                                        <SettingHelperText>
                                            카테고리는 최대 5개, 태그는 최대 20개까지 저장할 수 있습니다.
                                        </SettingHelperText>
                                        <StackButtonGroup>
                                            <PrimaryButton type="button" onClick={() => void handleSaveInterestFields()}>
                                                {interestSaving ? "저장 중..." : "관심 분야 저장"}
                                            </PrimaryButton>
                                            <GhostButton type="button" onClick={handleResetInterestFields}>
                                                선택 초기화
                                            </GhostButton>
                                            <GhostButton type="button" onClick={handleCancelInterestFields}>
                                                취소
                                            </GhostButton>
                                        </StackButtonGroup>
                                    </>
                                ) : (
                                    <GhostButton type="button" onClick={openInterestFieldEditor}>
                                        관심 분야 편집
                                    </GhostButton>
                                )}
                            </SettingCard>

                            {/*<SettingCard>*/}
                            {/*    <SettingTitle>蹂댁븞 ?ㅼ젙</SettingTitle>*/}
                            {/*    <SettingDescription>鍮꾨?踰덊샇 蹂€寃? ?뚯뀥 濡쒓렇???곕룞, ?묒냽 湲곌린 愿€由?湲곕뒫???ㅼ뼱媛??곸뿭?낅땲??</SettingDescription>*/}
                            {/*    <StackButtonGroup>*/}
                            {/*        <GhostButton>鍮꾨?踰덊샇 蹂€寃?/GhostButton>*/}
                            {/*        <GhostButton>?뚯뀥 怨꾩젙 ?곕룞</GhostButton>*/}
                            {/*    </StackButtonGroup>*/}
                            {/*</SettingCard>*/}
                        </SettingsGrid>
                    </Section>
                );

            case "inquiry":
                return renderInquirySection();

            case "withdraw":
                return (
                    <Section>
                        <SectionHeader>
                            <div>
                                <SectionEyebrow>WITHDRAW</SectionEyebrow>
                                <SectionTitle>회원 탈퇴</SectionTitle>
                                <SectionDescription>
                                    삭제되는 항목과 복구 불가 내용을 확인한 뒤 진행해 주세요.
                                </SectionDescription>
                            </div>
                        </SectionHeader>

                        <WithdrawHero>
                            <WithdrawHeroIcon>
                                <LogOut size={24} />
                            </WithdrawHeroIcon>

                            <WithdrawHeroContent>
                                <WithdrawHeroBadge>WITHDRAW GUIDE</WithdrawHeroBadge>
                                <WithdrawHeroTitle>탈퇴 시 삭제되는 항목을 확인해 주세요.</WithdrawHeroTitle>
                                <WithdrawHeroDesc>
                                    회원 탈퇴를 진행하면 학습 기록, AI 모의 면접 기록, 계정 설정 정보가 함께 정리됩니다.
                                </WithdrawHeroDesc>
                            </WithdrawHeroContent>
                        </WithdrawHero>

                        <WithdrawInfoGrid>
                            <WithdrawMiniCard>
                                <WithdrawMiniHead>
                                    <WithdrawMiniIcon>
                                        <FileText size={18} />
                                    </WithdrawMiniIcon>
                                    <WithdrawMiniTitle>학습 기록</WithdrawMiniTitle>
                                </WithdrawMiniHead>
                                <WithdrawMiniDesc>
                                    퀴즈 풀이 기록, 학습 이력, 오답노트 관련 데이터가 삭제되거나 복구되지 않아요.
                                </WithdrawMiniDesc>
                            </WithdrawMiniCard>

                            <WithdrawMiniCard>
                                <WithdrawMiniHead>
                                    <WithdrawMiniIcon>
                                        <Clock3 size={18} />
                                    </WithdrawMiniIcon>
                                    <WithdrawMiniTitle>AI 모의 면접 기록</WithdrawMiniTitle>
                                </WithdrawMiniHead>
                                <WithdrawMiniDesc>
                                    AI 모의 면접 결과와 피드백, 진행 히스토리도 함께 정리되니 필요한 내용은 미리 확인해 주세요.
                                </WithdrawMiniDesc>
                            </WithdrawMiniCard>

                            <WithdrawMiniCard>
                                <WithdrawMiniHead>
                                    <WithdrawMiniIcon>
                                        <Settings size={18} />
                                    </WithdrawMiniIcon>
                                    <WithdrawMiniTitle>계정 설정</WithdrawMiniTitle>
                                </WithdrawMiniHead>
                                <WithdrawMiniDesc>
                                    알림 설정, 관심 분야, 개인화된 추천 정보도 초기화되며 정보는 다시 복원되지 않을 수 있어요.
                                </WithdrawMiniDesc>
                            </WithdrawMiniCard>
                        </WithdrawInfoGrid>

                        <DangerCard>
                            <DangerTop>
                                <DangerIconWrap>
                                    <LogOut size={22} />
                                </DangerIconWrap>

                                <DangerTopText>
                                    <DangerTitle>최종 확인</DangerTitle>
                                    <DangerLead>
                                        아래 사항을 확인했다면 회원 탈퇴를 진행해 주세요.
                                    </DangerLead>
                                </DangerTopText>
                            </DangerTop>

                            <DangerList>
                                <li>학습 기록과 AI 모의 면접 기록은 삭제 후 복구할 수 없습니다.</li>
                                <li>계정 설정과 개인화 정보도 함께 초기화됩니다.</li>
                                <li>구독 또는 결제 이력이 있다면 먼저 확인이 필요합니다.</li>
                                <li>탈퇴 후 30일 동안 동일한 계정으로 재가입할 수 없습니다.</li>
                            </DangerList>

                            <DangerActionRow>
                                <GhostButton type="button" onClick={() => setActiveMenu("profile")}>이전으로</GhostButton>
                                <DangerButton type="button" onClick={handleWithdrawRequest} disabled={withdrawSubmitting}>
                                    {withdrawSubmitting ? "처리 중..." : "회원 탈퇴 진행"}
                                </DangerButton>
                            </DangerActionRow>
                        </DangerCard>
                    </Section>
                );

            default:
                return null;
        }
    };


    return (
        <Page>
            <PageInner>
                <Sidebar>
                    <BrandArea>
                        <BrandBadge>MYPAGE</BrandBadge>
                        <BrandTitle>내 성장 기록과 학습 흐름을 모아보는 공간</BrandTitle>
                        <BrandDescription>
                            계정 정보부터 AI 모의 면접 기록, 포텐퀴즈 기록, 일정까지 나만의 학습 여정을 한곳에서 확인할 수 있습니다.
                        </BrandDescription>
                    </BrandArea>

                    <MenuList>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <MenuButton
                                    key={item.key}
                                    type="button"
                                    $active={displayActiveMenu === item.key}
                                    onClick={() => handleMenuClick(item.key)}
                                >
                                    <MenuLeft>
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                    </MenuLeft>
                                    <ChevronRight size={16} />
                                </MenuButton>
                            );
                        })}
                    </MenuList>

                    <SidebarBottomCard>
                        <SidebarBottomTitle>이번 주 추천</SidebarBottomTitle>
                        <SidebarBottomText>
                            오답노트 복습과 최근 면접 피드백 확인을 함께 진행해 보세요.
                        </SidebarBottomText>
                    </SidebarBottomCard>
                </Sidebar>

                <Main>{outlet ?? renderContent()}</Main>
            </PageInner>
            <SystemMessageModal open={sysOpen} message={sysMsg} onClose={closeSys} />
        </Page>
    );
}

const Page = styled.div`
    ${pretendard};
    min-height: 100vh;
    background:
            radial-gradient(circle at top left, rgba(79, 118, 241, 0.08), transparent 24%),
            radial-gradient(circle at top right, rgba(43, 198, 166, 0.06), transparent 26%),
            linear-gradient(180deg, ${palette.pageBlue} 0%, ${palette.pageMint} 100%);
    padding: 32px;
    box-sizing: border-box;
    color: ${palette.text};
    line-height: 1.55;

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
    max-width: 1380px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 292px minmax(0, 1fr);
    gap: 22px;

    @media (max-width: 1080px) {
        grid-template-columns: 1fr;
    }
`;

const Sidebar = styled.aside`
    background: #ffffff;
    border: 1px solid ${palette.border};
    border-radius: 16px;
    padding: 24px 18px;
    box-shadow: 0 6px 16px rgba(30, 41, 59, 0.05);
    display: flex;
    flex-direction: column;
    gap: 22px;
`;

const BrandArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const BrandBadge = styled.span`
    width: fit-content;
    padding: 8px 12px;
    border-radius: 999px;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
`;

const BrandTitle = styled.h1`
    margin: 0;
    font-size: 23px;
    font-weight: 700;
    line-height: 1.38;
    letter-spacing: -0.03em;
    color: #0f172a;
`;

const BrandDescription = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.65;
    letter-spacing: -0.015em;
    color: ${palette.textSoft};
`;

const MenuList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const MenuButton = styled.button<{ $active: boolean }>`
    width: 100%;
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.15s ease;
    background: #f3f4f6;
    color: #374151;
    border: 1px solid ${palette.border};

    ${({ $active }) =>
            $active &&
            css`
                background: ${palette.primary};
                color: #ffffff;
                border-color: ${palette.primary};
                box-shadow: 0 4px 14px rgba(79, 118, 241, 0.18);
            `}

    &:hover {
        transform: translateY(-1px);
        background: ${({ $active }) => ($active ? palette.primaryStrong : "#e5e7eb")};
    }

    span,
    svg {
        color: inherit;
    }
`;

const MenuLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 650;
    line-height: 1.4;
    letter-spacing: -0.018em;
`;

const SidebarBottomCard = styled.div`
    margin-top: auto;
    border-radius: 24px;
    padding: 18px;
    background: linear-gradient(180deg, #eef7fd 0%, #f2fbf8 100%);
    border: 1px solid rgba(115, 174, 184, 0.18);
`;

const SidebarBottomTitle = styled.strong`
    display: block;
    font-size: 15px;
    color: #1e293b;
    margin-bottom: 8px;
`;

const SidebarBottomText = styled.p`
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: ${palette.textSoft};
`;

const Main = styled.main`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: 18px;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
`;

const SectionEyebrow = styled.div`
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: ${palette.primaryStrong};
    margin-top: 32px;
    margin-bottom: 8px;
`;

const SectionTitle = styled.h2`
    margin: 0;
    font-size: 28px;
    font-weight: 750;
    line-height: 1.32;
    letter-spacing: -0.035em;
`;

const SectionDescription = styled.p`
    margin: 10px 0 0;
    font-size: 15px;
    line-height: 1.7;
    letter-spacing: -0.015em;
    color: ${palette.textSoft};
`;

const HeroCard = styled.div`
    background: #ffffff;
    border: 1px solid rgba(14, 18, 28, 0.06);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 6px 16px rgba(30, 41, 59, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    @media (max-width: 900px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const HeroLeft = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 18px;
`;

const HeroRight = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: flex-end;
    min-width: 320px;
    flex: 0 0 360px;

    @media (max-width: 900px) {
        width: 100%;
        min-width: 0;
        flex: 1 1 auto;
    }
`;

const CreditSummaryCard = styled.div`
    width: 100%;
    min-height: 196px;
    padding: 20px;
    border-radius: 20px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    border: 1px solid ${palette.border};
    box-shadow: 0 8px 22px rgba(30, 41, 59, 0.05);
    display: flex;
    flex-direction: column;
    gap: 18px;
`;

const CreditSummaryTop = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const CreditSummaryBadge = styled.div`
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
`;

const CreditSummaryLabel = styled.div`
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: ${palette.text};
`;

const CreditBalanceRow = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
`;

const CreditBalanceCopy = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 8px;
`;

const CreditBalanceValue = styled.div`
    font-size: clamp(2.3rem, 4vw, 3rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.05em;
    color: #0f172a;
`;

const CreditBalanceUnit = styled.div`
    padding-bottom: 4px;
    font-size: 14px;
    font-weight: 700;
    color: ${palette.primaryStrong};
    text-transform: lowercase;
`;

const CreditBalanceCaption = styled.div`
    font-size: 13px;
    line-height: 1.6;
    color: ${palette.textSoft};
`;

const CreditMetaGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 520px) {
        grid-template-columns: 1fr;
    }
`;

const CreditMetaItem = styled.div`
    padding: 14px 14px;
    border-radius: 16px;
    background: #fbfcff;
    border: 1px solid ${palette.borderSoft};
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const CreditMetaTitle = styled.div`
    font-size: 12px;
    font-weight: 700;
    color: ${palette.textSoft};
`;

const CreditMetaValue = styled.div`
    font-size: 15px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.4;
`;

const CreditExpiryNotice = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 16px;
    background: ${palette.accentGradientSoft};
    border: 1px solid rgba(79, 118, 241, 0.08);
`;

const CreditExpiryLabel = styled.div`
    font-size: 12px;
    font-weight: 700;
    color: ${palette.textSoft};
`;

const CreditExpiryValue = styled.div`
    font-size: 14px;
    font-weight: 800;
    color: ${palette.text};
    text-align: right;
`;

const AvatarWrap = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: linear-gradient(135deg, ${palette.indigo50} 0%, #e9fcf8 100%);
    color: ${palette.primaryStrong};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;


const HeroTextGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const HeroTitle = styled.h3`
    margin: 0;
    font-size: 23px;
    font-weight: 750;
    line-height: 1.4;
    letter-spacing: -0.03em;
    color: #0f172a;
`;

const HeroSub = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: #64748b;
`;

const HeroBadgeRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
`;

const RepresentativeBadge = styled.div`
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    background: ${palette.accentGradientSoft};
    border: 1px solid rgba(62, 99, 224, 0.12);
    color: ${palette.primaryStrong};
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -0.015em;
`;

const RepresentativeHint = styled.div`
    font-size: 13px;
    line-height: 1.5;
    color: ${palette.textSoft};
`;

const HeroMetaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const HeroMetaChip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 999px;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    font-size: 13px;
    font-weight: 600;
`;

const HeroActionButton = styled.button`
    height: 46px;
    padding: 0 18px;
    border: none;
    border-radius: 12px;
    background: ${palette.primaryBlue};
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.015em;
    cursor: pointer;
    transition: transform 0.18s ease, background 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        background: ${palette.primaryStrong};
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 10px;
    min-height: 140px;
    padding: 18px 20px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 24px;
    background:
            radial-gradient(circle at top right, rgba(79, 118, 241, 0.18), transparent 34%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, #f8fbff 100%);
    box-shadow:
            0 18px 32px rgba(15, 23, 42, 0.08),
            0 6px 14px rgba(62, 99, 224, 0.05);
    backdrop-filter: blur(14px);
    transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
`;

const StatLabel = styled.div`
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: ${palette.primaryStrong};
    text-align: left;
    align-self: flex-start;
    margin: 0;
    padding: 0;
`;

const StatValue = styled.strong`
    font-size: clamp(1.9rem, 3vw, 2.35rem);
    font-weight: 800;
    color: #0f172a;
    line-height: 1;
    letter-spacing: -0.04em;
    text-align: left;
    align-self: flex-start;
    margin: 0;
`;

const StatSub = styled.div`
    font-size: 14px;
    line-height: 1.6;
    color: #475569;
    text-align: left;
    align-self: flex-start;
    margin: 0;
    padding: 0;
    background: transparent;
    border: none;
    box-shadow: none;
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const PanelCard = styled.div`
    border: 1px solid rgba(14, 18, 28, 0.06);
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 6px 16px rgba(30, 41, 59, 0.05);
    padding: 22px;
`;

const PanelHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
`;

const PanelTitle = styled.h3`
    margin: 0;
    font-size: 19px;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: -0.025em;
    color: #0f172a;
`;

const PanelAction = styled.button`
    ${pretendard};
    border: none;
    background: transparent;
    color: #2f56d9;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: -0.01em;
    line-height: 1;
    cursor: pointer;
    padding: 0;
`;

const InfoList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const InfoItem = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid #e2e8f0;

    &:last-child {
        padding-bottom: 0;
        border-bottom: none;
    }
`;

const InfoLabel = styled.span`
    font-size: 14px;
    color: #64748b;
`;

const InfoValue = styled.strong`
    font-size: 14px;
    color: #0f172a;
`;

const InfoValueWrap = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
`;

const InfoBadge = styled.span`
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    font-size: 13px;
    font-weight: 700;
    text-align: right;
`;

const InfoSubValue = styled.span`
    font-size: 12px;
    color: ${palette.textSoft};
    text-align: right;
`;

const TimelineList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const TimelineItem = styled.div`
    display: flex;
    gap: 12px;
`;

const TimelineDot = styled.div`
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: ${palette.secondary};
    margin-top: 6px;
    flex-shrink: 0;
`;

const TimelineBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const TimelineTitle = styled.div`
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
`;

const TimelineMeta = styled.div`
    font-size: 13px;
    color: #64748b;
`;

const RecordList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const RecordItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 18px;
    border-radius: 14px;
    background: #fbfcff;
    border: 1px solid #eef2f7;
    transition: background 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        background: #fbfcff;
        box-shadow: 0 1px 6px rgba(62, 99, 224, 0.05);
    }

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const RecordLeft = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const RecordTitle = styled.div`
    font-size: 15px;
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: -0.02em;
    color: #0f172a;
`;

const RecordMeta = styled.div`
    font-size: 13px;
    line-height: 1.55;
    color: #64748b;
`;

const RecordRight = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
`;

const WrongNoteList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const WrongNoteCard = styled.div`
    border: 1px solid #eef2f7;
    border-radius: 16px;
    background: #fbfcff;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const WrongNoteHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
`;

const WrongNoteBadges = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
`;

const WrongNoteBadge = styled.span<{ $tone: "default" | "pending" | "resolved" }>`
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: -0.015em;
    background: ${({ $tone }) =>
            $tone === "pending"
                    ? "rgba(245, 158, 11, 0.12)"
                    : $tone === "resolved"
                            ? "rgba(43, 198, 166, 0.12)"
                            : palette.primarySoft};
    color: ${({ $tone }) =>
            $tone === "pending"
                    ? palette.warningText
                    : $tone === "resolved"
                            ? palette.secondaryHover
                            : palette.primaryStrong};
`;

const WrongNoteDate = styled.span`
    font-size: 12px;
    color: ${palette.textSoft};
`;

const WrongNotePrompt = styled.h4`
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.6;
    color: ${palette.text};
`;

const WrongNoteMeta = styled.p`
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: ${palette.textSoft};
`;

const WrongNoteAnswerGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const WrongNoteAnswerBox = styled.div`
    border: 1px solid ${palette.border};
    border-radius: 14px;
    background: #ffffff;
    padding: 14px;
`;

const WrongNoteAnswerLabel = styled.div`
    font-size: 12px;
    font-weight: 700;
    color: ${palette.textSoft};
    margin-bottom: 8px;
`;

const WrongNoteAnswerValue = styled.div<{ $tone: "user" | "correct" }>`
    font-size: 14px;
    line-height: 1.6;
    font-weight: 700;
    color: ${({ $tone }) => ($tone === "correct" ? palette.secondaryHover : palette.text)};
    white-space: pre-wrap;
    word-break: break-word;
`;

const ScoreBadge = styled.div`
    min-width: 70px;
    height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: -0.015em;
    flex-shrink: 0;
`;

const DetailButton = styled.button`
    height: 38px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid #dbe4f0;
    background: #ffffff;
    color: #334155;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    letter-spacing: -0.015em;
    cursor: pointer;
    transition: background 0.18s ease, transform 0.18s ease;

    white-space: nowrap;
    flex-shrink: 0;
    word-break: keep-all;

    &:hover {
        background: #f8fafc;
        transform: translateY(-1px);
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
    letter-spacing: -0.015em;
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
    font-weight: 650;
    line-height: 1;
    letter-spacing: -0.015em;
    cursor: pointer;
    transition: background 0.18s ease, transform 0.18s ease;

    &:hover {
        background: ${palette.hover};
        transform: translateY(-1px);
    }
`;

const ScheduleTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    thead th {
        text-align: left;
        font-size: 13px;
        color: ${palette.textSoft};
        padding: 14px 12px;
        border-bottom: 1px solid ${palette.border};
    }

    tbody td {
        padding: 18px 12px;
        font-size: 14px;
        color: ${palette.text};
        border-bottom: 1px solid ${palette.borderSoft};
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    @media (max-width: 760px) {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }
`;

const TableActionGroup = styled.div`
    display: inline-flex;
    gap: 8px;
`;

const TextButton = styled.button<{ $danger?: boolean }>`
    border: none;
    background: transparent;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    color: ${({ $danger }) => ($danger ? "#dc2626" : palette.primary)};
`;

const SettingsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1080px) {
        grid-template-columns: 1fr;
    }
`;

const SettingCard = styled.div<{ $featured?: boolean }>`
    border: 1px solid rgba(14, 18, 28, 0.06);
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 6px 16px rgba(30, 41, 59, 0.05);
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    grid-column: ${({ $featured }) => ($featured ? "1 / -1" : "auto")};
`;

const SettingTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    color: #0f172a;
`;

const SettingDescription = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.75;
    color: #64748b;
`;

const ToggleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #334155;
`;

const FakeToggle = styled.div<{ $active: boolean }>`
    width: 52px;
    height: 30px;
    border-radius: 999px;
    position: relative;
    background: ${({ $active }) => ($active ? palette.secondary : "#cbd5e1")};

    &::after {
        content: "";
        position: absolute;
        top: 3px;
        left: ${({ $active }) => ($active ? "25px" : "3px")};
        width: 24px;
        height: 24px;
        border-radius: 999px;
        background: #ffffff;
        transition: left 0.2s ease;
    }
`;

const InterestSummaryGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 14px;

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
    }
`;

const TagRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const InterestFieldSummary = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 120px;
    padding: 16px 18px;
    border: 1px solid ${palette.border};
    border-radius: 16px;
    background: linear-gradient(180deg, #fcfdff 0%, #f8fbff 100%);
`;

const SummaryLabel = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: ${palette.textSoft};
`;

const Tag = styled.span`
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #e9fcf8;
    color: ${palette.secondaryHover};
    font-size: 13px;
    font-weight: 700;
`;

const InterestFieldEditorSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    padding: 18px;
    border: 1px solid ${palette.border};
    border-radius: 18px;
    background: #fbfdff;
`;

const EditorTitle = styled.h4`
    margin: 0;
    font-size: 14px;
    font-weight: 800;
    color: ${palette.text};
`;

const InterestEditorGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 16px;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const InterestFieldPicker = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const InterestFieldChipButton = styled.button<{ $active: boolean }>`
    ${interactiveText};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid ${({ $active }) => ($active ? "rgba(62, 99, 224, 0.24)" : palette.border)};
    background: ${({ $active }) => ($active ? "rgba(62, 99, 224, 0.1)" : "#ffffff")};
    color: ${({ $active }) => ($active ? palette.primary : "#334155")};
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        border-color: rgba(62, 99, 224, 0.24);
    }
`;

const InterestMetaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
`;

const SettingHelperText = styled.p`
    margin: 0;
    font-size: 13px;
    line-height: 1.65;
    color: #64748b;
`;

const EmptyInterestHint = styled.div`
    border: 1px dashed ${palette.border};
    border-radius: 14px;
    background: #f8fafc;
    padding: 14px 16px;
    font-size: 13px;
    line-height: 1.6;
    color: ${palette.textSoft};
`;

const SelectionMetaCard = styled.div`
    min-width: 140px;
    flex: 0 0 auto;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid ${palette.border};
    background: #fbfcff;
`;

const SelectionMetaValue = styled.div`
    font-size: 20px;
    font-weight: 800;
    line-height: 1.2;
    color: ${palette.text};
`;

const SelectionMetaLabel = styled.div`
    margin-top: 4px;
    font-size: 12px;
    color: ${palette.textSoft};
`;

const StackButtonGroup = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;

    > * {
        min-width: 140px;
    }

    @media (max-width: 760px) {
        flex-direction: column;
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
    }
`;

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FieldLabel = styled.label`
    font-size: 14px;
    font-weight: 700;
    line-height: 1.45;
    letter-spacing: -0.015em;
    color: #334155;
`;

const fieldBase = css`
    width: 100%;
    border: 1px solid ${palette.border};
    border-radius: 14px;
    background: #ffffff;
    padding: 14px 16px;
    box-sizing: border-box;
    font-size: 14px;
    line-height: 1.5;
    letter-spacing: -0.015em;
    color: ${palette.text};
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;

    &::placeholder {
        color: ${palette.textMuted};
    }

    &:focus {
        border-color: ${palette.primaryStrong};
        box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.16);
    }
`;

const FieldInput = styled.input`
    ${fieldBase}
    height: 52px;
`;

const FieldTextarea = styled.textarea`
    ${fieldBase}
    min-height: 180px;
    resize: vertical;
`;

const InquiryDropdownWrap = styled.div`
    position: relative;
    width: 100%;
`;

const InquiryDropdownButton = styled.button<{ $open: boolean; $placeholder: boolean }>`
    width: 100%;
    min-height: 54px;
    padding: 10px 14px;
    border-radius: 16px;
    border: 1px solid ${({ $open }) => ($open ? palette.primaryStrong : palette.border)};
    background: #ffffff;
    box-shadow: ${({ $open }) =>
            $open
                    ? "0 0 0 4px rgba(62, 99, 224, 0.10), 0 14px 30px rgba(30, 41, 59, 0.08)"
                    : "0 6px 16px rgba(30, 41, 59, 0.05)"};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
    transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            transform 0.18s ease;
    color: ${({ $placeholder }) => ($placeholder ? palette.textMuted : palette.text)};

    &:hover {
        transform: translateY(-1px);
        border-color: ${({ $open }) => ($open ? palette.primaryStrong : "#d8e1ee")};
    }
`;

const InquiryDropdownButtonLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
`;

const InquiryDropdownButtonText = styled.span`
    font-size: 14px;
    font-weight: 600;
    line-height: 1.45;
    letter-spacing: -0.015em;
    color: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const InquiryDropdownArrow = styled.div<{ $open: boolean }>`
    width: 28px;
    height: 28px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    flex-shrink: 0;
    transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
    transition: transform 0.18s ease;
`;

const InquiryDropdownMenu = styled.div`
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    right: 0;
    z-index: 30;
    padding: 10px;
    border-radius: 20px;
    background: #ffffff;
    border: 1px solid rgba(14, 18, 28, 0.08);
    box-shadow:
            0 18px 40px rgba(15, 23, 42, 0.10),
            0 4px 16px rgba(15, 23, 42, 0.06);
`;

const InquiryDropdownItem = styled.button<{ $selected: boolean }>`
    width: 100%;
    padding: 12px 12px;
    border: none;
    border-radius: 14px;
    background: ${({ $selected }) => ($selected ? palette.primarySoft : "transparent")};
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    text-align: left;
    transition: background 0.16s ease, transform 0.16s ease;

    &:hover {
        background: ${({ $selected }) => ($selected ? palette.primarySoft : palette.hover)};
        transform: translateY(-1px);
    }
`;

const InquiryItemIconBox = styled.div`
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: ${palette.accentGradientSoft};
    color: ${palette.primaryStrong};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const InquiryItemLabel = styled.span`
    font-size: 14px;
    font-weight: 700;
    line-height: 1.45;
    letter-spacing: -0.015em;
    color: ${palette.text};
`;

const InlineInfo = styled.div`
    font-size: 13px;
    color: #64748b;
    line-height: 1.7;
`;

const FieldHint = styled.div`
    font-size: 12px;
    color: ${palette.textSoft};
    text-align: right;
`;

const ButtonRow = styled.div`
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;

const InquiryLayout = styled.div<{ $view: InquiryView }>`
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;

    & > ${PanelCard}:nth-child(1) {
        display: ${({ $view }) => ($view === "create" ? "block" : "none")};
    }

    & > ${PanelCard}:nth-child(2) {
        display: ${({ $view }) => ($view === "list" ? "block" : "none")};
    }

    & > ${PanelCard}:nth-child(3) {
        display: ${({ $view }) => ($view === "detail" ? "block" : "none")};
    }
`;

const InquirySectionHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
`;

const InquiryHeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const EmptyStateBox = styled.div`
    min-height: 180px;
    border: 1px dashed ${palette.border};
    border-radius: 18px;
    background: #fbfcff;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    font-size: 14px;
    line-height: 1.7;
    color: ${palette.textSoft};
`;

const InquiryRecordList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const InquiryRecordCard = styled.button<{ $active: boolean }>`
    width: 100%;
    border: 1px solid ${({ $active }) => ($active ? palette.primaryStrong : palette.border)};
    border-radius: 18px;
    background: ${({ $active }) => ($active ? "#f8fbff" : "#ffffff")};
    box-shadow: ${({ $active }) =>
            $active ? "0 10px 24px rgba(62, 99, 224, 0.10)" : "0 6px 16px rgba(30, 41, 59, 0.04)"};
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: left;
    cursor: pointer;
    transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            border-color 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        border-color: ${palette.primaryStrong};
    }
`;

const InquiryRecordTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const InquiryMetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
`;

const InquiryTypeChip = styled.span`
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    font-size: 12px;
    font-weight: 700;
`;

const InquiryStatusChip = styled.span<{ $tone: "received" | "progress" | "answered" | "closed" }>`
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: ${({ $tone }) =>
            $tone === "answered"
                    ? "rgba(43, 198, 166, 0.14)"
                    : $tone === "progress"
                            ? "rgba(245, 158, 11, 0.12)"
                            : $tone === "closed"
                                    ? "rgba(100, 116, 139, 0.12)"
                                    : "rgba(79, 118, 241, 0.12)"};
    color: ${({ $tone }) =>
            $tone === "answered"
                    ? palette.secondaryHover
                    : $tone === "progress"
                            ? palette.warningText
                            : $tone === "closed"
                                    ? "#475569"
                                    : palette.primaryStrong};
`;

const InquiryRecordId = styled.span`
    font-size: 12px;
    font-weight: 700;
    color: ${palette.textSoft};
`;

const InquiryRecordTitle = styled.h4`
    margin: 0;
    font-size: 16px;
    line-height: 1.5;
    font-weight: 800;
    color: ${palette.text};
`;

const InquiryDateRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    font-size: 12px;
    color: ${palette.textSoft};
`;

const InquiryDetailWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 18px;
`;

const InquiryDetailHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const InquiryDetailTitle = styled.h3`
    margin: 0;
    font-size: 22px;
    line-height: 1.4;
    letter-spacing: -0.02em;
    color: ${palette.text};
`;

const InquiryTimeline = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const InquiryTimelineCard = styled.div<{ $answered?: boolean }>`
    border: 1px solid ${({ $answered }) => ($answered ? "rgba(43, 198, 166, 0.22)" : palette.border)};
    border-radius: 20px;
    background: ${({ $answered }) => ($answered ? "#f7fffc" : "#fbfcff")};
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const InquiryTimelineLabel = styled.div`
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: ${palette.textSoft};
`;

const InquiryTimelineContent = styled.div`
    font-size: 14px;
    line-height: 1.8;
    color: ${palette.text};
    white-space: pre-wrap;
    word-break: break-word;
`;

const InquiryTimelineDate = styled.div`
    font-size: 12px;
    color: ${palette.textSoft};
`;

const WithdrawHero = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 18px;
    padding: 24px;
    border-radius: 20px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
    border: 1px solid ${palette.border};
    box-shadow: 0 6px 16px rgba(30, 41, 59, 0.05);

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const WithdrawHeroIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const WithdrawHeroContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const WithdrawHeroBadge = styled.div`
    width: fit-content;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
`;

const WithdrawHeroTitle = styled.h3`
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: -0.03em;
    color: ${palette.text};
`;

const WithdrawHeroDesc = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: ${palette.textSoft};
`;

const WithdrawInfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const WithdrawMiniCard = styled.div`
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid ${palette.border};
    box-shadow: 0 6px 16px rgba(30, 41, 59, 0.04);
    padding: 20px;
`;

const WithdrawMiniHead = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
`;

const WithdrawMiniIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: ${palette.primarySoft};
    color: ${palette.primaryStrong};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const WithdrawMiniTitle = styled.div`
    font-size: 16px;
    font-weight: 750;
    letter-spacing: -0.02em;
    color: ${palette.text};
`;

const WithdrawMiniDesc = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: ${palette.textSoft};
`;

const DangerCard = styled.div`
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #ffffff 0%, #fffdf8 100%);
    border: 1px solid ${palette.border};
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 10px 24px rgba(30, 41, 59, 0.06);

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #f8c15c 0%, #f59e0b 40%, #ef4444 100%);
        opacity: 0.9;
    }
`;

const DangerTop = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 22px;
`;

const DangerIconWrap = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: ${palette.warningSoft};
    color: ${palette.warning};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const DangerTopText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const DangerTitle = styled.h3`
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.35;
    color: ${palette.text};
`;

const DangerLead = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: ${palette.textSoft};
`;

const DangerList = styled.ul`
    list-style: none;
    margin: 0 0 20px;
    padding: 0;
    display: grid;
    gap: 10px;

    li {
        position: relative;
        padding: 14px 16px 14px 42px;
        border-radius: 14px;
        background: #fffaf0;
        border: 1px solid ${palette.warningBorder};
        color: ${palette.warningText};
        font-size: 14px;
        line-height: 1.65;
    }

    li::before {
        content: "!";
        position: absolute;
        left: 16px;
        top: 13px;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: ${palette.warningSoft};
        color: ${palette.warning};
        font-size: 12px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

const WithdrawConfirmPanel = styled.div`
    padding: 18px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid ${palette.border};
    margin-bottom: 20px;
`;

const WithdrawHelperText = styled.p`
    margin: 12px 0 0;
    font-size: 13px;
    line-height: 1.7;
    color: ${palette.textSoft};
`;

const DangerActionRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    @media (max-width: 640px) {
        flex-direction: column-reverse;
    }
`;

const DangerButton = styled.button<{ disabled?: boolean }>`
    height: 44px;
    padding: 0 16px;
    border: none;
    border-radius: 12px;
    background: ${({ disabled }) => (disabled ? "#fca5a5" : palette.danger)};
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.015em;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

    &:hover {
        transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")};
        background: ${({ disabled }) => (disabled ? "#fca5a5" : "#dc2626")};
        box-shadow: ${({ disabled }) => (disabled ? "none" : "0 10px 20px rgba(239, 68, 68, 0.14)")};
    }
`;
