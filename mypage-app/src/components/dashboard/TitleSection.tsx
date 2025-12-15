import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
// API imports removed - using mock data
type ProfileAppearanceResponse = {
    photoUrl: string | null;
    nickname: string;
    email: string;
};

type UserTitleResponse = {
    id: number;
    code: string;
    displayName: string;
    description: string;
    equipped: boolean;
    acquiredAt: string;
};
import styled from "styled-components";
import defaultTitle from "../../assets/default_rank.png";
import { notifyError } from "../../utils/toast";
import { motion } from "framer-motion";

export default function TitleSection() {
    const [profile, setProfile] = useState<ProfileAppearanceResponse | null>(null);
    const [titles, setTitles] = useState<UserTitleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const visibleCount = 4;
    const prevCount = useRef(0);

    const handlePrev = () => setCurrentIndex((p) => Math.max(p - 1, 0));
    const handleNext = () => setCurrentIndex((p) => Math.min(p + 1, Math.max(titles.length - visibleCount, 0)));

    useEffect(() => {
        // Mock data for UI display
        setProfile({
            photoUrl: null,
            nickname: "사용자",
            email: "user@example.com"
        });
        
        const mockTitles: UserTitleResponse[] = [
            {
                id: 1,
                code: "BEGINNER",
                displayName: "초보 개발자",
                description: "첫 걸음을 시작한 개발자",
                equipped: true,
                acquiredAt: new Date().toISOString()
            },
            {
                id: 2,
                code: "ACTIVE",
                displayName: "활동왕",
                description: "활발하게 활동하는 멤버",
                equipped: false,
                acquiredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        setTitles(mockTitles);
        setLoading(false);
    }, []);

    const triggerConfetti = () => {
        const duration = 2000;
        const end = Date.now() + duration;
        const frame = () => {
            confetti({ particleCount: 3, angle: 60, spread: 60, origin: { x: 0 }, colors: ["#4F46E5", "#60A5FA", "#93C5FD"] });
            confetti({ particleCount: 3, angle: 120, spread: 60, origin: { x: 1 }, colors: ["#4F46E5", "#60A5FA", "#93C5FD"] });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
    };

    if (loading) return <p>불러오는 중...</p>;

    const equipped = titles.find((t) => t.equipped);

    return (
        <>
            <ContentGrid>
                <CurrentTitleCard>
                    {equipped ? (
                        <>
                            <Badge>현재 장착 중</Badge>
                            <img src={defaultTitle} alt={equipped.displayName} />
                            <h3>{equipped.displayName}</h3>
                            <p>나의 대표 칭호</p>
                        </>
                    ) : (
                        <>
                            <img src={defaultTitle} alt="no title" />
                            <h3>대표 칭호 없음</h3>
                            <p>아직 장착된 칭호가 없습니다.</p>
                        </>
                    )}
                </CurrentTitleCard>

                <TitleListCard>
                    <TitleListHeader>
                        <span>획득 개수 {titles.length}개</span>
                    </TitleListHeader>

                    {titles.length === 0 ? (
                        <EmptyWrapper><Empty>아직 획득한 칭호가 없습니다.</Empty></EmptyWrapper>
                    ) : (
                        <PreviewWrapper>
                            <NavButton position="left" onClick={handlePrev} disabled={currentIndex === 0}>{"<"}</NavButton>
                            <TitleList>
                                {titles.slice(currentIndex, currentIndex + visibleCount).map((t) => (
                                    <MotionTitleItem key={t.id} isEquipped={t.equipped}
                                                     whileHover={{ scale: 1.08, y: -6 }} transition={{ type: "spring", stiffness: 420, damping: 18, mass: 0.6, }}>
                                        <div className="iconWrapper">
                                            <img src={defaultTitle} alt={t.displayName} />
                                            {t.equipped && <EquippedBadge>장착</EquippedBadge>}
                                        </div>
                                        <h4>{t.displayName}</h4>
                                        <p>{new Date(t.acquiredAt).toLocaleDateString()}</p>
                                        <Tooltip className="tooltip">{t.description}</Tooltip>
                                    </MotionTitleItem>
                                ))}
                            </TitleList>
                            <NavButton position="right" onClick={handleNext} disabled={currentIndex >= titles.length - visibleCount}>{">"}</NavButton>
                        </PreviewWrapper>
                    )}
                </TitleListCard>
            </ContentGrid>
        </>
    );
}

/* ================= 색상 팔레트 ================= */
const palette = {
    primary: "#4CC4A8",    // 따뜻하고 밝은 민트
    accent: "#3AB49A",     // 강조용 진민트
    softBG: "linear-gradient(145deg, #f9fbfa, #f4fbf7)", // 부드러운 배경
    borderLight: "rgba(76,196,168,0.35)",
    shadow: "rgba(76,196,168,0.22)",
    textMain: "#0F172A",
    textSub: "#64748B",
};


/* ================= styled-components ================= */
const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const CurrentTitleCard = styled.div`
    position: relative;
    background: linear-gradient(
            180deg,
            rgba(16, 185, 129, 0.04) 0%,
            rgba(59, 130, 246, 0.05) 100%
    );
    border: 1.5px solid ${palette.primary};
    border-radius: 12px;
    box-shadow: 0 2px 8px ${palette.shadow};
    padding: 28px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: transform 0.25s ease;

    &:hover {
        transform: translateY(-3px);
    }

    img {
        width: 80px;
        height: 80px;
        margin-bottom: 8px;
        object-fit: contain;
    }

    h3 {
        font-size: 18px;
        font-weight: 700;
        color: ${palette.textMain};
    }

    p {
        font-size: 13px;
        color: ${palette.textSub};
    }
`;

const Badge = styled.div`
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(90deg, #43d0b2, #25a58b);
    color: white;
    font-size: 10px;            
    font-weight: 600;
    padding: 4px 8px;             
    border-radius: 999px;
    box-shadow: 0 1.5px 4px rgba(76, 196, 168, 0.25);
    letter-spacing: 0.2px;
`;

const TitleListCard = styled.div`
    background: white;
    border-radius: 12px;
    border: 1px solid ${palette.borderLight};
    box-shadow: 0 2px 8px ${palette.shadow};
    padding: 24px;
    display: flex;
    flex-direction: column;
`;

const TitleListHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 14px;
    font-weight: 600;
    color: ${palette.textSub};
`;

const PreviewWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const TitleList = styled.div`
    display: flex;
    gap: 24px;
    padding: 4px 8px;
    justify-content: center;
`;


const MotionTitleItem = styled(motion.div)<{ isEquipped?: boolean }>`
    position: relative;
    min-width: 90px;
    text-align: center;
    background: ${({ isEquipped }) => (isEquipped ? "rgba(76,196,168,0.06)" : "#F9FAFB")};
    border: ${({ isEquipped }) =>
            isEquipped
                    ? `1px solid ${palette.primary}`
                    : `1px solid ${palette.borderLight}`};
    border-radius: 14px;
    padding: 14px 8px;
    transition: box-shadow 0.15s ease, border 0.15s ease;

    &:hover .tooltip {
        opacity: 1;
        visibility: visible;
        transform: translate(-50%, -6px);
    }

    h4 {
        font-size: 13px;
        font-weight: 600;
        color: ${palette.textMain};
    }

    p {
        font-size: 11px;
        color: ${palette.textSub};
    }
`;

const Tooltip = styled.div`
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    background: rgba(17, 24, 39, 0.9);
    color: white;
    font-size: 11px;
    padding: 6px 8px;
    border-radius: 8px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;

    &::after {
        content: "";
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid rgba(17, 24, 39, 0.9);
    }
`;

const EquippedBadge = styled.span`
    position: absolute;
    top: -5px;
    right: -8px;
    background: linear-gradient(90deg, #43d0b2, #25a58b);
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 999px;
    box-shadow: 0 2px 5px rgba(76, 196, 168, 0.25);
`;

const NavButton = styled.button<{ position: "left" | "right" }>`
    position: absolute;
    top: 50%;
    ${({ position }) => (position === "left" ? "left: 8px;" : "right: 8px;")}
    font-size: 22px;
    font-weight: bold;
    color: ${palette.textSub};
    background: transparent;
    border: none;
    cursor: pointer;

    &:hover:not(:disabled) {
        color: ${palette.primary};
        transform: scale(1.2);
    }

    &:disabled {
        opacity: 0.3;
        cursor: default;
    }
`;

const EmptyWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
`;

const Empty = styled.p`
    color: #888;
    font-size: 14px;
`;
