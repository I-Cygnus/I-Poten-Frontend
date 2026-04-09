import React from "react";
import styled from "styled-components";

const UI = {
    color: {
        bg: "#ffffff",
        text: "#111827",
        muted: "#6b7280",
    },
    font: {
        h2: "22px",
        body: "15px",
    },
};

const Toolbar = styled.div`
    position: sticky;
    top: 0;
    z-index: 5;
    background: ${UI.color.bg};
    padding: 12px 8px;
    margin-bottom: 16px;

    @media (max-width: 720px) {
        padding: 10px 0;
        margin-bottom: 12px;
    }
`;

const RowFlex = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    min-height: 38px;

    @media (max-width: 720px) {
        align-items: flex-start;
        min-height: 36px;
        row-gap: 10px;
    }
`;

const BackBtn = styled.button`
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    border: 0;
    background: transparent;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    width: 38px;
    height: 38px;
    padding: 0;

    @media (max-width: 720px) {
        width: 36px;
        height: 36px;
    }
`;

const TitleGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 0 1 auto;

    @media (max-width: 720px) {
        min-width: 0;
        gap: 8px;
    }
`;

const MetaWrap = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 0 1 auto;

    @media (max-width: 720px) {
        width: 100%;
        justify-content: flex-start;
    }
`;

const Title = styled.h2`
    margin: 0;
    font-size: ${UI.font.h2};
    letter-spacing: -0.01em;
    color: ${UI.color.text};
    min-width: 0;

    @media (max-width: 720px) {
        font-size: 20px;
        line-height: 1.3;
    }
`;

const TitleMetaGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1 1 auto;

    @media (max-width: 720px) {
        flex: 1 1 calc(100% - 48px);
        flex-wrap: wrap;
        row-gap: 8px;
        align-items: center;
    }
`;

const Count = styled.span`
    margin-left: 12px;
    font-size: ${UI.font.body};
    font-weight: 400;
    letter-spacing: -0.02em;
    color: ${UI.color.muted};
    line-height: 1;
    white-space: nowrap;
    flex: 0 0 auto;

    @media (max-width: 720px) {
        margin-left: 2px;
    }
`;

const Spacer = styled.div`
    flex: 1 1 auto;

    @media (max-width: 720px) {
        display: none;
    }
`;

type Props = {
    title: string;
    count?: React.ReactNode;
    onBack: () => void;
    meta?: React.ReactNode;
    right?: React.ReactNode;
};

export default function LearningPageHeader({
                                               title,
                                               count,
                                               onBack,
                                               meta,
                                               right,
                                           }: Props) {
    return (
        <Toolbar>
            <RowFlex>
                <BackBtn onClick={onBack} aria-label="뒤로 가기">
                    ←
                </BackBtn>

                <TitleMetaGroup>
                    <TitleGroup>
                        <Title>{title}</Title>
                        {count ? <Count>{count}</Count> : null}
                    </TitleGroup>

                    {meta ? <MetaWrap>{meta}</MetaWrap> : null}
                </TitleMetaGroup>

                <Spacer />
                {right}
            </RowFlex>
        </Toolbar>
    );
}
