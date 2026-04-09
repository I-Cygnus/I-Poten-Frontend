import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import {
    User,
    FolderOpen,
    CalendarDays,
    Settings2,
    MessageCircle,
    LogOut,
} from "lucide-react";
import ServiceModal from "../modals/ServiceModal.tsx";

const NAV_ITEMS = [
    { to: "account/edit",      icon: User,          label: "회원정보2" },
    { to: "interview/records", icon: FolderOpen,     label: "면접기록2", matchPrefix: "/mypage/interview" },
    { to: "schedule",          icon: CalendarDays,   label: "일정관리" },
    { to: "setting",           icon: Settings2,      label: "설정" },
];

export default function SideBar() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    const isActive = (item: typeof NAV_ITEMS[number]) =>
        item.matchPrefix
            ? location.pathname.startsWith(item.matchPrefix)
            : location.pathname.endsWith(item.to);

    return (
        <Wrapper>
            {/* 메인 메뉴 */}
            <Section>
                <SectionLabel>NAVIGATION</SectionLabel>
                <MenuList>
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item);
                        return (
                            <li key={item.to}>
                                <MenuItem
                                    to={item.to}
                                    className={active ? "active" : undefined}
                                    $active={active}
                                >
                                    <IconWrap $active={active}>
                                        <item.icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                                    </IconWrap>
                                    <span>{item.label}123</span>
                                    {active && <ActiveDot />}
                                </MenuItem>
                            </li>
                        );
                    })}
                </MenuList>
            </Section>

            {/* 하단 메뉴 */}
            <BottomSection>
                <Divider />
                <MenuList>
                    <li>
                        <SupportItem to="inquiry">
                            <IconWrap $active={false}>
                                <MessageCircle size={16} strokeWidth={1.8} />
                            </IconWrap>
                            <span>문의하기</span>
                        </SupportItem>
                    </li>
                    <li>
                        <DangerItem to="withdrawal">
                            <IconWrap $active={false} $danger>
                                <LogOut size={16} strokeWidth={1.8} />
                            </IconWrap>
                            <span>회원탈퇴</span>
                        </DangerItem>
                    </li>
                </MenuList>
            </BottomSection>

            <ServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </Wrapper>
    );
}

/* ─── Animations ─────────────────────────────────────────────────────────── */

const slideIn = keyframes`
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
`;

const dotPop = keyframes`
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.3); }
    100% { transform: scale(1); opacity: 1; }
`;

/* ─── Styled ─────────────────────────────────────────────────────────────── */

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0;
    animation: ${slideIn} 0.35s ease;
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const SectionLabel = styled.p`
    margin: 0 0 10px 4px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #c1c8d4;
`;

const MenuList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 3px;
    list-style: none;
    padding: 0;
    margin: 0;
`;

const baseLink = css`
    position: relative;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -0.2px;
    text-decoration: none;
    transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
    cursor: pointer;
`;

const MenuItem = styled(NavLink)<{ $active?: boolean }>`
    ${baseLink};
    color: ${({ $active }) => ($active ? "#ffffff" : "#64748b")};
    background: ${({ $active }) =>
        $active
            ? "linear-gradient(135deg, #3E82E8 0%, #2BC6A6 100%)"
            : "transparent"};
    box-shadow: ${({ $active }) =>
        $active
            ? "0 6px 20px rgba(62, 130, 232, 0.28)"
            : "none"};
    font-weight: ${({ $active }) => ($active ? 650 : 500)};

    &:not(.active):hover {
        background: #f1f5f9;
        color: #0f172a;
        transform: translateX(2px);
    }
`;

const IconWrap = styled.span<{ $active?: boolean; $danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    flex-shrink: 0;
    background: ${({ $active, $danger }) =>
        $active
            ? "rgba(255,255,255,0.22)"
            : $danger
            ? "transparent"
            : "transparent"};
    color: inherit;
    transition: background 0.18s ease;
`;

const ActiveDot = styled.span`
    margin-left: auto;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.75);
    animation: ${dotPop} 0.3s ease;
`;

const BottomSection = styled.div`
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 3px;
`;

const Divider = styled.div`
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0 30%, #e2e8f0 70%, transparent);
    margin: 12px 0;
`;

const SupportItem = styled(NavLink)`
    ${baseLink};
    color: #94a3b8;
    font-size: 13.5px;

    &:hover {
        background: #f8fafc;
        color: #475569;
        transform: translateX(2px);
    }
`;

const DangerItem = styled(NavLink)`
    ${baseLink};
    color: #cbd5e1;
    font-size: 13.5px;

    &:hover {
        background: #fff1f2;
        color: #e11d48;
        transform: translateX(2px);
    }
`;
