import styled, { css } from "styled-components";

export const containerCss = css`
  margin-left: auto;
  margin-right: auto;
  max-width: ${({ theme }) => (theme?.custom?.layout?.containerMaxWidth ?? 1280)}px;
  padding-left: ${({ theme }) => (theme?.custom?.layout?.gutterX ?? 20)}px;
  padding-right: ${({ theme }) => (theme?.custom?.layout?.gutterX ?? 20)}px;
`;

export const Container = styled.div`
  ${containerCss}
  padding-top: 40px;
  padding-bottom: 40px;
`;

export const PageContainerFlushTop = styled(Container)`
  padding-top: 0;
`;

/** 컨테이너 안에서만 쓰는 좁은 컬럼: 왼쪽선 고정, 가로만 제한 */
export const NarrowLeft = styled.div`
  max-width: ${({ theme }) => theme?.custom?.layout?.narrowMaxWidth ?? 980}px;
  width: 100%;
  margin-left: auto;     /* 왼쪽 붙임 */
  margin-right: auto; /* 남는 공간은 오른쪽으로 */
`;