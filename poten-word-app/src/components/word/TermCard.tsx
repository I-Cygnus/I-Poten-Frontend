import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ensureAuthOrAlertRedirect, AUTH_ALERT_MSG } from "../../utils/authGuard.ts";

export type TermCardProps = {
    id: number;
    title: string;
    description: string;
    tags?: string[];
    onAdd?: (id: number) => void;
    onTagClick?: (tag: string) => void;
    onRequireAuth?: (message: string, loginUrl: string) => void;
};

const TOKENS = {
    color: {
        bgWhite: "#ffffff",
        textPrimary: "#111827",
        textSecondary: "#374151",
        textMuted: "#6b7280",
        textLight: "#9ca3af",
        indigo: "#6366f1",
        indigo50: "#eef2ff",
        textBlue: "#2563eb",
        chipBg: "#eef2ff",
        chipBorder: "#c7d2fe",
        chipActiveBg: "#e0e7ff",
    },
    radius: { card: 20, inner: 14, chip: 10, pill: 999 },
    space: (n: number) => `${n}px`,
    font: { h3: "20px", body: "17px", chip: "12px", label: "12px" },
    shadow: {
        card: "0 1px 0 rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.04)",
        chip: "0 1px 0 rgba(99,102,241,0.08)",
    },
    border: {
        card: "1px solid rgba(99,102,241,0.28)",
        chip: "1px solid rgba(99,102,241,0.22)",
        chipHover: "1px solid #c7d2fe",
    },
} as const;

const CONTENT_INSET = 16;

const Article = styled.article`
    border-radius: ${TOKENS.radius.card}px;
    border: ${TOKENS.border.card};
    background: ${TOKENS.color.bgWhite};
    padding: ${TOKENS.space(20)};
    box-shadow: ${TOKENS.shadow.card};
`;

const Header = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${TOKENS.space(12)};
`;

const Title = styled.h3`
    font-size: ${TOKENS.font.h3};
    font-weight: 700;
    letter-spacing: -0.01em;
    color: ${TOKENS.color.textPrimary};
    margin: 0 0 0 ${TOKENS.space(CONTENT_INSET)};
    word-break: keep-all;
`;

const AddBtn = styled.button`
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: ${TOKENS.radius.pill}px;
    border: ${TOKENS.border.card};
    color: ${TOKENS.color.indigo};
    background: ${TOKENS.color.bgWhite};
    cursor: pointer;
    outline: none;
    box-shadow: none;
    transition: background-color 120ms ease, transform 40ms ease;

    &:hover {
        background: ${TOKENS.color.indigo50};
    }
    &:active {
        transform: scale(0.98);
    }
`;

const AddIcon = styled.svg`
    width: 16px;
    height: 16px;
    display: inline-block;
`;

const InnerBox = styled.div`
    margin-top: ${TOKENS.space(12)};
    border-radius: ${TOKENS.radius.inner}px;
    background: #f8fafc;
    padding: ${TOKENS.space(12)} ${TOKENS.space(16)};
`;

const Description = styled.p`
    font-size: ${TOKENS.font.body};
    line-height: 1.7;
    color: ${TOKENS.color.textSecondary};
    margin: 0;
    white-space: pre-wrap;
    word-break: keep-all;
`;

const TagsRow = styled.div`
    margin-top: ${TOKENS.space(16)};
    margin-left: ${TOKENS.space(CONTENT_INSET)};
    display: flex;
    align-items: center;
    gap: ${TOKENS.space(8)};
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
`;

const TagLabelInline = styled.span`
    flex: 0 0 auto;
    font-size: ${TOKENS.font.label};
    font-weight: 600;
    color: ${TOKENS.color.textMuted};
`;

const TagListInline = styled.div`
    display: inline-flex;
    align-items: center;
    gap: ${TOKENS.space(8)};
    white-space: nowrap;
`;

const TagEmptyInline = styled.span`
    flex: 0 0 auto;
    font-size: ${TOKENS.font.chip};
    color: ${TOKENS.color.textLight};
`;

const TagChipBtn = styled.button`
    flex: 0 0 auto;
    border-radius: ${TOKENS.radius.chip}px;
    border: ${TOKENS.border.chip};
    background: ${TOKENS.color.bgWhite};
    padding: ${TOKENS.space(4)} ${TOKENS.space(12)};
    font-size: ${TOKENS.font.chip};
    color: ${TOKENS.color.textSecondary};
    box-shadow: ${TOKENS.shadow.chip};
    cursor: pointer;
    outline: none;
    transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease,
    transform 40ms ease;

    &:hover {
        border: ${TOKENS.border.chipHover};
        background: ${TOKENS.color.chipBg};
        color: ${TOKENS.color.textBlue};
    }
    &:active {
        background: ${TOKENS.color.chipActiveBg};
        transform: scale(0.98);
    }
`;

const TermCard: React.FC<TermCardProps> = ({
                                               id,
                                               title,
                                               description,
                                               tags = [],
                                               onAdd,
                                               onTagClick,
                                               onRequireAuth,
                                           }) => {
    const navigate = useNavigate();

    const handleAddClick = React.useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            // 모달 오픈으로 이어지는 상위 클릭 핸들러 차단
            e.preventDefault();
            e.stopPropagation();

            // 최신 로그인 플래그 확인
            const loggedIn = !!localStorage.getItem("isLoggedIn");
            if (!loggedIn) {
                const ok = ensureAuthOrAlertRedirect(AUTH_ALERT_MSG, "/vue-account/account/login", {
                    isLoggedIn: loggedIn,
                    navigate,
                    promptType: "confirm",
                    flagKey: "isLoggedIn",
                    onRequireAuth: onRequireAuth
                        ? ({ message, loginUrl }) => onRequireAuth(message, loginUrl)
                        : undefined,
                });
                // 비로그인 흐름에서는 항상 false를 반환 → 여기서 즉시 종료 (모달 열기 금지)
                if (!ok) return;
            }

            // 로그인 상태에서만 실행
            onAdd?.(id);
        },
        [id, navigate, onAdd, onRequireAuth]
    );

    return (
        <Article aria-labelledby={`term-${id}`} data-term-id={id}>
            <Header>
                <Title id={`term-${id}`}>{title}</Title>
                <AddBtn
                    type="button"
                    title="내 단어장에 추가"
                    aria-label="내 단어장에 추가"
                    onClick={handleAddClick}
                >
                    <AddIcon viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </AddIcon>
                </AddBtn>
            </Header>

            <InnerBox>
                <Description>{description}</Description>
            </InnerBox>

            <TagsRow aria-label="연관 키워드">
                <TagLabelInline>연관 키워드</TagLabelInline>
                {tags.length > 0 ? (
                    <TagListInline role="list" aria-label="해시태그 목록">
                        {tags.map((t, idx) => (
                            <TagChipBtn
                                key={`${t}-${idx}`}
                                type="button"
                                role="listitem"
                                title={`#${t}`}
                                aria-label={`해시태그 ${t}`}
                                onClick={() => onTagClick?.(t)}
                            >
                                #{t}
                            </TagChipBtn>
                        ))}
                    </TagListInline>
                ) : (
                    <TagEmptyInline>등록된 키워드가 없습니다</TagEmptyInline>
                )}
            </TagsRow>
        </Article>
    );
};

export default React.memo(TermCard);
