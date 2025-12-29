import React, { useEffect, useRef, useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";

import PotenNoteModal from "../../components/note/PotenNoteModal.tsx";
import http from "../../utils/http.ts";
import { fetchUserFolders, patchReorderFolders } from "../../api/wordbook.ts";
import { deleteUserFolder, deleteUserFoldersBulk, renameUserFolder } from "../../api/folder.ts";

const fadeUp = keyframes`
    0% {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
    }
    100% {
        opacity: 1;
        transform: translateY(0px) scale(1);
    }
`;

const IconWord = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>
    </svg>
);

const IconNote = () => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="5" y="3" width="14" height="18" rx="2" ry="2" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="16" y2="16" />
    </svg>
);

const IconQuiz = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 1 1 3.84 3.87l-.9.38v1" />
        <circle cx="12" cy="17" r="1" />
    </svg>
);

const IconSearch = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5174e7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="11" cy="11" r="7" />
        <line x1="16" y1="16" x2="21" y2="21" />
    </svg>
);


const MediaWrapper = styled.div`
    position: relative;
    width: 100%;
    border-radius: inherit;
    overflow: hidden;
    aspect-ratio: 16 / 9;

    @supports not (aspect-ratio: 16 / 9) {
        /* 오래된 브라우저 대비용 */
        padding-top: 56.25%;
        height: 0;
    }
`;

const MediaVideo = styled.video`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const WORD_VIDEO_URL =
    (process.env.MFE_PUBLIC_SERVICE || "") + "/video/word.mp4";

const NOTE_VIDEO_URL =
    (process.env.MFE_PUBLIC_SERVICE || "") + "/video/note.mp4";

/* ========= 공용 타입/유틸 ========= */

type Notebook = { id: string; name: string };

async function postWithFallback(urls: string[], body: any) {
    let lastErr: any;
    for (const u of urls) {
        try {
            const res = await http.post(u, body);
            return res?.data ?? res;
        } catch (e: any) {
            lastErr = e;
            if (e?.response?.status !== 404) throw e;
        }
    }
    throw lastErr;
}

/** 직무별 추천 단어 세트를 폴더에 저장하는 API */
async function attachJobRecommendationToFolder(
    wordbookId: string,
    jobKey: string
) {
    const res = await http.post(
        `/me/folders/${wordbookId}/recommended-terms/by-job`,
        { jobKey }
    );
    return res.data;
}

/* ========= 스크롤 인뷰용 래퍼 ========= */

type FeatureRowInViewProps = {
    children: React.ReactNode;
    cardOnLeft?: boolean;
    shiftX?: number;
};
const FeatureRowInView: React.FC<FeatureRowInViewProps> = ({
                                                               children,
                                                               cardOnLeft,
                                                               shiftX = 0,
                                                           }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }

        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => setVisible(entry.isIntersecting));
            },
            { threshold: 0.3 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <FeatureRow
            ref={ref}
            $cardOnLeft={cardOnLeft}
            $visible={visible}
            $shiftX={shiftX}
        >
            {children}
        </FeatureRow>
    );
};

/** 직무 카드 그리드용 인뷰 래퍼 */
type JobGridInViewProps = {
    children: React.ReactNode;
};

const JobGridInView: React.FC<JobGridInViewProps> = ({ children }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }

        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target !== node) return;
                    setVisible(entry.isIntersecting);
                });
            },
            { threshold: 0.2 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const columnsPerRow = 3;

    return (
        <JobCardGrid ref={ref}>
            {React.Children.map(children, (child, index) => {
                if (!React.isValidElement(child)) return child;

                const row = Math.floor(index / columnsPerRow);

                return React.cloneElement(child as React.ReactElement<any>, {
                    $visible: visible,
                    $row: row,
                });
            })}
        </JobCardGrid>
    );
};

/** 검색 영역 인뷰 래퍼 */
type SearchSectionInViewProps = {
    children: React.ReactNode;
    onVisible?: () => void;
};

const SearchSectionInView: React.FC<SearchSectionInViewProps> = ({ children, onVisible }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);
    const hasFiredRef = useRef(false);

    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            if (!hasFiredRef.current) {
                hasFiredRef.current = true;
                onVisible?.();
            }
            return;
        }

        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target !== node) return;

                    if (entry.isIntersecting) {
                        setVisible(true);

                        if (!hasFiredRef.current) {
                            hasFiredRef.current = true;
                            onVisible?.();
                        }
                    } else {
                        setVisible(false);
                    }
                });
            },
            { threshold: 0.2 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [onVisible]);

    return (
        <SearchSection ref={ref} $visible={visible}>
            {children}
        </SearchSection>
    );
};

type JobGroup = {
    key: string;
    title: string;
    desc: string;
};

const JOB_GROUPS: JobGroup[] = [
    {
        key: "FRONTEND",
        title: "Frontend",
        desc: "HTML/CSS부터 상태관리까지\n프론트엔드 필수 100",
    },
    {
        key: "BACKEND",
        title: "Backend",
        desc: "HTTP부터 트랜잭션까지\n백엔드 필수 100",
    },
    {
        key: "DATABASE",
        title: "Database",
        desc: "정규화부터 트랜잭션까지\n데이터베이스 필수 100",
    },
    {
        key: "NETWORK",
        title: "Network",
        desc: "OSI 7계층부터 HTTP까지\n네트워크 필수 100",
    },
    {
        key: "OS",
        title: "Operating System",
        desc: "프로세스부터 스레드까지\n운영체제 필수 100",
    },
    {
        key: "DSA",
        title: "Data Structure & Algorithm",
        desc: "자료구조·알고리즘 필수 100",
    },
    {
        key: "SECURITY",
        title: "Security",
        desc: "인증부터 암호화까지\n보안 필수 100",
    },
    {
        key: "SE",
        title: "Software Engineering",
        desc: "요구분석부터 테스트까지\n소프트웨어 공학 필수 100",
    },
    {
        key: "DEVOPS",
        title: "DevOps / Cloud",
        desc: "CI/CD부터 컨테이너까지\nDevOps·클라우드 필수 100",
    },
    {
        key: "CS",
        title: "Computer Science",
        desc: "컴퓨터 구조부터 계산 이론까지\n컴퓨터 공학 필수 100",
    },
    {
        key: "AI",
        title: "AI / Data / Machine Learning",
        desc: "회귀부터 딥러닝까지 AI·데이터·머신러닝 필수 100",
    },
    {
        key: "EMBEDDED",
        title: "Embedded / IoT / System Programming",
        desc: "임베디드·IoT·시스템 프로그래밍 필수 100",
    },
];

const POPULAR_TERMS = [
    "CAP",
    "DI",
    "CSR",
    "DNS",
    "N+1 문제",
];

const SEARCH_PLACEHOLDER = "예: CAP, DI, CSR, DNS";

export default function PotenWordLandingPage() {
    const navigate = useNavigate();

    // 직무용 포텐노트 모달 상태
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobGroup | null>(null);
    const [saving, setSaving] = useState(false);

    // 랜딩 하단 검색 상태
    const [searchKeyword, setSearchKeyword] = useState("");

    // 검색 인풋 placeholder 타자 효과
    const [placeholderText, setPlaceholderText] = useState("");
    const [startTypingPlaceholder, setStartTypingPlaceholder] = useState(false);

    useEffect(() => {
        if (!startTypingPlaceholder) return;

        const text = SEARCH_PLACEHOLDER;
        const typeSpeed = 80;      // 글자 하나씩 나오는 속도
        const holdSteps = 20;      // 끝까지 다 쓴 다음 유지할 스텝 수 (gap)

        let step = 0;

        const timer = setInterval(() => {
            step = (step + 1) % (text.length + holdSteps);

            if (step === 0) {
                setPlaceholderText("");
            } else if (step <= text.length) {
                setPlaceholderText(text.slice(0, step));
            } else {
                setPlaceholderText(text);
            }
        }, typeSpeed);

        return () => clearInterval(timer);
    }, [startTypingPlaceholder]);

    const goSearch = useCallback(() => {
        const q = searchKeyword.trim();
        if (!q) return;
        navigate(`/poten-word/search?q=${encodeURIComponent(q)}`);
    }, [searchKeyword, navigate]);

    const handleSearchSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            goSearch();
        },
        [goSearch]
    );

    const handlePopularTermClick = useCallback(
        (term: string) => {
            navigate(`/poten-word/search?q=${encodeURIComponent(term)}`);
        },
        [navigate]
    );

    const handleJobPlusClick = useCallback(
        async (e: React.MouseEvent, job: JobGroup) => {
            e.stopPropagation();
            setSelectedJob(job);

            try {
                const folders = await fetchUserFolders();
                setNotebooks(folders);
            } catch (err: any) {
                if (err?.response?.status === 401) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                }
                console.error("[fetchUserFolders] 실패:", err);
                setNotebooks([]);
            }

            setNoteModalOpen(true);
        },
        [navigate]
    );

    // 모달에서 폴더 선택 후 저장
    const handleSaveJobToNotebook = useCallback(
        async (wordbookId: string) => {
            if (!selectedJob || saving) return;
            try {
                setSaving(true);
                await attachJobRecommendationToFolder(
                    wordbookId,
                    selectedJob.key
                );

                alert(
                    `'${selectedJob.title}' 직무의 추천 포텐워드가 내 포텐노트에 저장됐어요.`
                );

                setNoteModalOpen(false);
                setSelectedJob(null);
            } catch (err: any) {
                const s = err?.response?.status;
                if (s === 401) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                } else if (s === 403) {
                    alert("해당 폴더에 저장할 권한이 없습니다.");
                } else if (s === 404) {
                    alert("폴더 또는 직무 추천 세트를 찾을 수 없습니다.");
                } else {
                    alert("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                }
                console.error("[attachJobGroupToFolder] 실패:", err);
            } finally {
                setSaving(false);
            }
        },
        [selectedJob, saving, navigate]
    );

    const ROW_SHIFT = 24;

    return (
        <>
            <SoftBg />
            <Wrapper>
                <TopSection>
                    <SubTitle>
                        기술 면접 IT 개념 정리 + 내 단어장 + 직무별 퀴즈까지 한 번에
                    </SubTitle>
                    <Title>
                        <span className="highlight">포텐워드</span>와 함께 시작하세요
                    </Title>
                </TopSection>

                {/* 상단 3카드 */}
                <Cards>
                    <Card onClick={() => navigate("/poten-word/terms")}>
                        <CardIcon><IconWord /></CardIcon>
                        <CardTitle>포텐워드</CardTitle>
                        <CardDesc>
                            실제 기술면접에서 자주 나오는 개념만 모아 정리한 IT 용어 사전
                        </CardDesc>
                        <CardFooter>PotenWord</CardFooter>
                    </Card>

                    <Card onClick={() => navigate("/poten-word/notes")}>
                        <CardIcon><IconNote /></CardIcon>
                        <CardTitle>포텐노트</CardTitle>
                        <CardDesc>
                            마음에 걸리는 개념은 내 단어장에 넣고, 단어 뜻 가리기로 계속 반복
                        </CardDesc>
                        <CardFooter>PotenNote</CardFooter>
                    </Card>

                    <Card onClick={() => navigate("/poten-word/quiz")}>
                        <CardIcon><IconQuiz /></CardIcon>
                        <CardTitle>포텐퀴즈</CardTitle>
                        <CardDesc>
                            직무, 난이도, 카테고리를 선택해 기술면접 전 빠르게 개념 확인
                        </CardDesc>
                        <CardFooter>PotenQuiz</CardFooter>
                    </Card>
                </Cards>

                {/* ===== 아래 설명 섹션 ===== */}
                <MoreSection aria-label="포텐워드 상세 설명">
                    {/* Row 1: 포텐워드 (왼쪽 라벨, 오른쪽 이미지+텍스트) */}
                    <FeatureRowInView shiftX={-ROW_SHIFT}>
                        <LabelBlock>
                            <LabelPill>포텐워드</LabelPill>
                            <LabelTitle>기술면접 개념 아카이브</LabelTitle>
                            <Dots>
                                <DotRow>
                                    <Dot />
                                    <DotText>실제 기술면접에서 자주 나오는 개념만 모아 정리한 IT 용어 사전</DotText>
                                </DotRow>
                                <DotRow>
                                    <Dot />
                                    <DotText>면접 질문 포인트, 유사 개념까지 함께 정리</DotText>
                                </DotRow>
                                <DotRow>
                                    <Dot />
                                    <DotText>나만의 단어장에 바로 저장해서 복습까지 연결</DotText>
                                </DotRow>
                            </Dots>
                        </LabelBlock>
                        <DetailContent>
                            <DetailCard>
                                <MediaWrapper>
                                    <MediaVideo
                                        src={WORD_VIDEO_URL}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                </MediaWrapper>
                            </DetailCard>
                        </DetailContent>
                    </FeatureRowInView>

                    {/* Row 2: 포텐노트 (왼쪽 이미지+텍스트, 오른쪽 라벨) */}
                    <FeatureRowInView cardOnLeft shiftX={ROW_SHIFT}>
                        <DetailCard>
                            <MediaWrapper>
                                <MediaVideo
                                    src={NOTE_VIDEO_URL}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            </MediaWrapper>
                        </DetailCard>
                        <LabelBlock>
                            <LabelPill>포텐노트</LabelPill>
                            <LabelTitle>내 학습 속도에 맞춘 나만의 단어장</LabelTitle>
                            <Dots $align="left">
                                <DotRow>
                                    <Dot />
                                    <DotText>
                                        헷갈리는 개념은 포텐노트에 담아두고, ‘단어 · 뜻 가리기’ 모드로 반복 학습
                                    </DotText>
                                </DotRow>
                                <DotRow>
                                    <Dot />
                                    <DotText>
                                        외우지 못한 단어만 다시 복습하면서 효율적으로 학습 가능
                                    </DotText>
                                </DotRow>
                                <DotRow>
                                    <Dot />
                                    <DotText>
                                        폴더를 나눠서 관리하고, 진행률을 보면서 어느 정도 준비됐는지 한눈에 확인
                                    </DotText>
                                </DotRow>
                            </Dots>
                        </LabelBlock>
                    </FeatureRowInView>

                    {/* Row 3: 포텐퀴즈 (왼쪽 라벨, 오른쪽 이미지+텍스트) */}
                    <FeatureRowInView shiftX={-ROW_SHIFT}>
                        <LabelBlock>
                            <LabelPill>포텐퀴즈</LabelPill>
                            <LabelTitle>실전처럼 푸는 직무별 개념 퀴즈</LabelTitle>
                            <Dots>
                                <DotRow>
                                    <Dot />
                                    <DotText>
                                        직무 · 난이도 · 카테고리를 선택해서 오늘 공부한 개념을 바로 퀴즈로 확인
                                    </DotText>
                                </DotRow>
                                <DotRow>
                                    <Dot />
                                    <DotText>
                                        객관식, OX, 초성퀴즈 등 다양한 퀴즈 유형 선택 가능
                                    </DotText>
                                </DotRow>
                                <DotRow>
                                    <Dot />
                                    <DotText>
                                        틀린 문제만 다시 풀기, 일일 추천 세트 등으로 면접 직전까지 감각 유지
                                    </DotText>
                                </DotRow>
                            </Dots>
                        </LabelBlock>
                        <DetailCard>
                            <MediaWrapper>
                                <MediaVideo
                                    src={WORD_VIDEO_URL}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            </MediaWrapper>
                        </DetailCard>
                    </FeatureRowInView>
                </MoreSection>

                <TopSection>
                    <SubTitle>
                        지금 어느 직무를 준비 중이신가요?
                    </SubTitle>
                    <Title>
                        직무별 추천 <span className="highlight">포텐워드</span>를 나만의 <span className="highlight">포텐노트</span>에 빠르게 저장해 보세요
                    </Title>
                </TopSection>

                <JobSection>
                    <JobGridInView>
                        {JOB_GROUPS.map((job) => (
                            <JobCard
                                key={job.key}
                            >
                                <JobCardHeader>
                                    <JobTitle>{job.title}</JobTitle>
                                    <JobPlusCircle
                                        type="button"
                                        onClick={(e) => handleJobPlusClick(e, job)}
                                        aria-label={`${job.title} 직무 추천 포텐워드를 내 포텐노트에 저장`}
                                    >
                                        <span>+</span>
                                    </JobPlusCircle>
                                </JobCardHeader>
                                <JobDesc>{job.desc}</JobDesc>
                            </JobCard>
                        ))}
                    </JobGridInView>
                </JobSection>

                {/* 직무별 내 포텐노트 저장 모달 */}
                <PotenNoteModal
                    open={noteModalOpen}
                    notebooks={notebooks}
                    onClose={() => {
                        setNoteModalOpen(false);
                        setSelectedJob(null);
                    }}
                    onSave={handleSaveJobToNotebook}
                    onCreate={async (name) => {
                        // 폴더 생성
                        const { data: wb } = await http.post("/me/folders", {
                            wordbookName: name,
                        });

                        const newId = String(wb.id);

                        // 2생성된 폴더에 직무 추천 단어 저장
                        await attachJobRecommendationToFolder(
                            newId,
                            selectedJob!.key
                        );

                        // UI 갱신
                        const newName = wb.wordbookName ?? name;
                        setNotebooks((prev) => [{ id: newId, name: newName }, ...prev]);

                        return newId;
                    }}
                    onReorder={async (orderedIds) => {
                        try {
                            await patchReorderFolders(orderedIds);
                            const refreshed = await fetchUserFolders();
                            setNotebooks(refreshed);
                        } catch (e) {
                            console.warn("[folders reorder] 실패", e);
                        }
                    }}
                    onGoToFolder={() => {
                        setNoteModalOpen(false);
                    }}
                    onRename={async (wordbookId, newName) => {
                        await renameUserFolder(wordbookId, newName);
                        setNotebooks(prev =>
                            prev.map(n => n.id === wordbookId ? ({ ...n, name: newName }) : n)
                        );
                    }}
                    onRequestDelete={async (fid) => {
                        await deleteUserFolder(fid, "purge");
                        setNotebooks(await fetchUserFolders());
                    }}
                    onRequestBulkDelete={async (ids) => {
                        await deleteUserFoldersBulk(ids, "purge");
                        setNotebooks(await fetchUserFolders());
                    }}
                    onRefresh={async () => await fetchUserFolders()}
                />

                {/* 통합 검색 & 탐색 영역 */}
                <SearchSectionInView onVisible={() => setStartTypingPlaceholder(true)}>
                    <SearchHeader>
                        <SearchTitle align="center">궁금한 IT 용어를 바로 검색해 보세요.</SearchTitle>
                        <SearchDesc align="center">
                            모르는 용어를 만날 때마다 포텐워드에서 바로 검색해 보세요.
                            개념, 중요성, 실무 혹은 면접에서의 포인트까지
                            연결해서 정리해 드립니다.
                        </SearchDesc>
                    </SearchHeader>

                    <SearchBarForm
                        onSubmit={(e) => {
                            e.preventDefault();
                            goSearch();
                        }}
                    >
                        <SearchInput
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    goSearch();
                                }
                            }}
                            placeholder={placeholderText || SEARCH_PLACEHOLDER}
                        />
                        <SearchButton
                            type="button"
                            aria-label="검색"
                            onClick={goSearch}
                        >
                            <IconSearch />
                        </SearchButton>
                    </SearchBarForm>

                    {/*<PopularRow>*/}
                    {/*    <PopularHeader>요즘 면접에서 자주 나오는 용어</PopularHeader>*/}
                    {/*    <PopularList>*/}
                    {/*        {POPULAR_TERMS.map((term) => (*/}
                    {/*            <TagChip*/}
                    {/*                key={term}*/}
                    {/*                type="button"*/}
                    {/*                onClick={() => handlePopularTermClick(term)}*/}
                    {/*            >*/}
                    {/*                {term}*/}
                    {/*            </TagChip>*/}
                    {/*        ))}*/}
                    {/*    </PopularList>*/}
                    {/*</PopularRow>*/}
                </SearchSectionInView>
            </Wrapper>
        </>
    );
}

/* =================== 스타일 =================== */

const SoftBg = styled.div`
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;

    background:
            radial-gradient(
                    900px 900px at 20% 60%,
                    rgba(211, 228, 253, 0.55) 0%,
                    rgba(211, 228, 253, 0.30) 40%,
                    rgba(211, 228, 253, 0.15) 60%,
                    rgba(211, 228, 253, 0.05) 80%,
                    transparent 100%
            ),
            radial-gradient(
                    900px 900px at 80% 55%,
                    rgba(213, 247, 239, 0.55) 0%,
                    rgba(213, 247, 239, 0.30) 40%,
                    rgba(213, 247, 239, 0.15) 60%,
                    rgba(213, 247, 239, 0.05) 80%,
                    transparent 100%
            ),
            #ffffff;

    @media (max-width: 640px) {
        background:
                radial-gradient(
                        600px 600px at 30% 70%,
                        rgba(211, 228, 253, 0.50) 0%,
                        rgba(211, 228, 253, 0.20) 50%,
                        transparent 100%
                ),
                radial-gradient(
                        600px 600px at 80% 50%,
                        rgba(213, 247, 239, 0.50) 0%,
                        rgba(213, 247, 239, 0.20) 50%,
                        transparent 100%
                ),
                #ffffff;
    }
`;

const Wrapper = styled.div`
    width: 100%;
    padding: 80px 20px 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
`;

const TopSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60px;
`;

const SubTitle = styled.div`
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 5px;
    letter-spacing: -0.02em;

    opacity: 0;
    animation: ${fadeUp} 0.5s ease forwards;
    animation-delay: 0.05s;
`;

const Title = styled.div`
    font-size: 36px;
    font-weight: 700;
    color: #111827;
    text-align: center;
    letter-spacing: -0.02em;
    word-break: keep-all;

    .highlight {
        background: linear-gradient(90deg, #3a83f3, #11b884);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
    }

    opacity: 0;
    animation: ${fadeUp} 0.55s ease forwards;
    animation-delay: 0.18s;
`;

const Cards = styled.div`
    width: 100%;
    max-width: 1100px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;

    @media (max-width: 960px) {
        grid-template-columns: 1fr;
    }
`;

const CardTitle = styled.div`
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #111827;
    letter-spacing: -.02em;
    transition: color .25s ease;
`;

const CardDesc = styled.div`
    font-size: 15px;
    color: #6b7280;
    line-height: 1.5;
    height: 60px;
    letter-spacing: -.02em;
    transition: color .25s ease;
    word-break: keep-all;
`;

const CardFooter = styled.div`
    margin-top: 22px;
    font-family: "GhanaChocolate", sans-serif;
    font-size: 30px;
    color: #4f76f1;
    letter-spacing: -.02em;
    transition: color .25s ease;
`;

const CardIcon = styled.div`
    width: 58px;
    height: 58px;
    border-radius: 50%;
    margin: 0 auto 20px auto;
    background: #5174E7;
    display: flex;
    align-items: center;
    justify-content: center;

    color: #ffffff;
    transition: all .25s ease;

    svg {
        width: 28px;
        height: 28px;
        stroke: currentColor;
    }
`;

const Card = styled.div`
    background: #ffffff;
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
    transition:
            background .35s ease,
            transform .35s cubic-bezier(.16,1,.3,1),
            box-shadow .35s ease,
            border .35s ease;
    border: 1px solid rgba(0,0,0,0.05);

    opacity: 0;
    animation: ${fadeUp} 0.6s ease forwards;

    cursor: pointer;

    &:nth-child(1) { animation-delay: 0.28s; }
    &:nth-child(2) { animation-delay: 0.43s; }
    &:nth-child(3) { animation-delay: 0.58s; }

    &:hover {
        background: #5174E7;
        transform: translateY(-6px) scale(1.03);
        border-color: rgba(81, 116, 231, 0.5);
    }

    &:hover ${CardTitle},
    &:hover ${CardDesc},
    &:hover ${CardFooter} {
        color: #ffffff;
    }

    &:hover ${CardIcon} {
        background: #ffffff;
        color: #5174E7;
    }
`;

/* ====== 아래 설명 섹션 ====== */

const MoreSection = styled.section`
    width: 100%;
    max-width: 1100px;
    margin-top: 120px;
    margin-bottom: 120px;
    display: flex;
    flex-direction: column;
    gap: 96px;
`;

const FeatureRow = styled.div<{
    $cardOnLeft?: boolean;
    $visible?: boolean;
    $shiftX?: number;
}>`
    --shift-x: 0px;

    /* 데스크탑에서만 좌우 시프트 적용 (모바일은 0) */
    @media (min-width: 961px) {
        --shift-x: ${({ $shiftX = 0 }) => `${$shiftX}px`};
    }

    display: grid;
    grid-template-columns: ${({ $cardOnLeft }) =>
            $cardOnLeft ? "minmax(0, 1.6fr) minmax(0, 1fr)" : "minmax(0, 1fr) minmax(0, 1.6fr)"};
    gap: 40px;
    align-items: center;

    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transform: ${({ $visible }) =>
            $visible
                    ? "translate3d(var(--shift-x), 0px, 0) scale(1)"
                    : "translate3d(var(--shift-x), 20px, 0) scale(0.98)"};
    transition: opacity 0.6s ease, transform 0.6s cubic-bezier(.16,1,.3,1);

    @media (max-width: 960px) {
        grid-template-columns: 1fr;
    }
`;

const LabelBlock = styled.div<{ $align?: "left" | "right" }>`
    justify-self: ${({ $align }) => ($align === "right" ? "flex-end" : "flex-start")};
    text-align: ${({ $align }) => ($align === "right" ? "right" : "left")};
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 420px;
`;

const LabelPill = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 6px 18px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #ffffff;
    background: linear-gradient(90deg, #3a83f3, #11b884);
    align-self: flex-start;
`;

const LabelTitle = styled.h3`
    margin: 6px 0 0;
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
`;

const Dots = styled.div<{ $align?: "left" | "right" }>`
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: ${({ $align }) => ($align === "right" ? "flex-end" : "flex-start")};
`;

const DotRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    max-width: 400px;
    word-break: keep-all;
`;

const Dot = styled.span`
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: #4f76f1;
    opacity: 0.9;
    margin-top: 7px;
    flex-shrink: 0;
`;

const DotText = styled.p`
    margin: 0;
    font-size: 16px;
    color: #4c505e;
    line-height: 1.6;
    letter-spacing: -0.02em;
`;

/* 오른쪽 컬럼 래퍼 – 모든 Row에서 동일 사용 */
const DetailContent = styled.div`
    width: 100%;
`;

/* 실제 이미지 들어갈 흰 박스 – 컬럼 폭과 동일하게 */
const DetailCard = styled.div`
    width: 100%;
    background: #ffffff;
    border-radius: 32px;
    box-shadow: 0 18px 60px rgba(15, 23, 42, 0.12);

    display: flex;
    justify-content: center;

    @media (max-width: 640px) {
        border-radius: 24px;
    }
`;

const JobSection = styled.section`
    width: 100%;
    max-width: 1100px;
    margin-top: 24px;
    margin-bottom: 40px;
`;

const JobCardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const JobCard = styled.div<{ $visible?: boolean; $row?: number }>`
    background: #ffffff;
    border-radius: 28px;
    padding: 22px 22px 20px;
    box-shadow: 0 10px 32px rgba(15, 23, 42, 0.08);
    border: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    /* 인뷰 등장 애니메이션 (줄 단위 딜레이) */
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transform: ${({ $visible }) =>
            $visible ? "translateY(0px)" : "translateY(18px)"};
    transition:
            opacity 0.55s ease,
            transform 0.55s cubic-bezier(.16,1,.3,1),
            box-shadow 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease;
    transition-delay: ${({ $visible, $row }) =>
            $visible ? `${0.08 * (($row ?? 0))}s` : "0s"};

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.14);
        border-color: rgba(79, 118, 241, 0.7);
        background: #f9fbff;
    }
`;

const JobCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 10px;
`;

const JobTitle = styled.h4`
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
    word-break: keep-all;
`;

const JobPlusCircle = styled.button`
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: #4f76f1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 6px 16px rgba(79, 118, 241, 0.18);

    border: 0;
    padding: 0;
    cursor: pointer;

    span {
        color: #ffffff;
        font-size: 20px;
        line-height: 1;
        margin-top: -1px;
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.35);
    }
`;

const JobDesc = styled.p`
    margin: 0;
    margin-top: 4px;
    font-size: 15px;
    color: #4b5563;
    line-height: 1.5;
    letter-spacing: -0.02em;
    white-space: pre-line;
`;

const SearchSection = styled.section<{ $visible?: boolean }>`
    width: 100%;
    max-width: 1100px;
    margin-top: 60px;
    margin-bottom: 80px;
    
    & > * {
        opacity: 0;
        transform: translateY(18px);
        transition: opacity 0.6s ease, transform 0.6s cubic-bezier(.16,1,.3,1);
    }

    ${({ $visible }) =>
            $visible &&
            css`
            & > * {
                opacity: 1;
                transform: translateY(0);
            }

            /* 순차 등장 딜레이 */
            & > *:nth-child(1) {
                transition-delay: 0.0s;
            }
            & > *:nth-child(2) {
                transition-delay: 0.08s;
            }
            & > *:nth-child(3) {
                transition-delay: 0.16s;
            }
            & > *:nth-child(4) {
                transition-delay: 0.24s;
            }
        `}
`;

const SearchHeader = styled.div`
    text-align: center;
    margin-bottom: 24px;

    @media (max-width: 640px) {
        text-align: left;
    }
`;

const SearchTitle = styled.h2`
    margin: 0 0 8px;
    font-size: 36px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
`;

const SearchDesc = styled.p`
    margin: 0;
    font-size: 15px;
    color: #4b5563;
    line-height: 1.6;
    letter-spacing: -0.02em;
    word-break: keep-all;
`;

const SearchBarForm = styled.form`
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #ffffff;
    border-radius: 999px;
    padding: 8px 10px 8px 18px;
    box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
    border: 1px solid #e5e7eb;

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: stretch;
        border-radius: 18px;
        padding: 10px 12px;
    }
`;

const SearchInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: 15px;
    color: #111827;
    background: transparent;

    &::placeholder {
        color: #9ca3af;
    }
`;

const SearchButton = styled.button`
    flex-shrink: 0;
    border: 1px solid #ffffff;
    border-radius: 999px;
    width: 36px;
    height: 36px;
    padding: 0;
    background: #ffffff;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    transition: transform 80ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;

    svg {
        display: block;
    }
`;

const TagChip = styled.button`
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 400;
    background: #2d3340;
    color: #ffffff;
    border: 1px solid #3a4354;
    cursor: pointer;
    letter-spacing: -.02em;
    transition:
            background 0.15s ease,
            border-color 0.15s ease,
            transform 80ms ease;

    &:hover {
        background: #3a4354;
        border-color: #6b7280;
    }

    &:active {
        transform: scale(0.97);
    }
`;

const PopularRow = styled.div`
    margin-top: 26px;
    margin-bottom: 18px;
    text-align: center;
`;

const PopularHeader = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 10px;
    white-space: nowrap;
    flex-shrink: 0;
    letter-spacing: -.02em;
`;

const PopularList = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    letter-spacing: -.02em;
`;