import title1 from "../assets/titles/title1.png";
import title2 from "../assets/titles/title2.png";
import title3 from "../assets/titles/title3.png";
import title4 from "../assets/titles/title4.png";
import title5 from "../assets/titles/title5.png";
import title6 from "../assets/titles/title6.png";

const IMAGES = [title1, title2, title3, title4, title5, title6];

/** 렌더 시마다 랜덤 이미지 반환 */
export const getRandomTitleImage = () => {
    const index = Math.floor(Math.random() * IMAGES.length);
    return IMAGES[index];
};

/** 시드 기반(고정형) - 확장용 */
export const getTitleImageBySeed = (seed: number) => {
    return IMAGES[seed % IMAGES.length];
};