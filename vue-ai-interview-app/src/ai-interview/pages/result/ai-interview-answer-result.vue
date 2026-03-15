<template>
  <main :style="mainContainerStyle">

    <!-- 로딩 스켈레톤 -->
    <div v-if="isLoading" :style="skeletonPageStyle">
      <div :style="skeletonHeaderStyle">
        <div :style="skelBadgeStyle"></div>
        <div :style="skelTitleLgStyle"></div>
        <div :style="skelTitleSmStyle"></div>
      </div>
      <div :style="skelCardTallStyle"></div>
      <div :style="skelCardMediumStyle"></div>
      <div :style="skelCardStyle" v-for="i in 3" :key="i"></div>
    </div>

    <v-container v-else :style="reportContainerStyle">

      <!-- 헤더 -->
      <div :style="headerSectionStyle">
        <div :style="headerBadgeStyle">
          <span v-html="SVG.checkSmall"></span>
          <span :style="badgeTextStyle">면접 완료</span>
        </div>
        <h1 :style="reportTitleStyle">AI 면접 결과</h1>
        <h1 :style="reportTitleStyle2">분석 리포트</h1>
      </div>

      <!-- 종합 평가 카드 -->
      <v-card :style="summaryCardStyle" elevation="0">
        <v-row align="center" justify="center" no-gutters>
          <v-col cols="12" md="3" :style="gradeColStyle">
            <div :style="gradeWrapperStyle">
              <p :style="gradeLabelStyle">종합 등급</p>
              <div :style="gradeBadgeStyle">{{ grade }}</div>
              <div :style="gradeScoreStyle">
                {{ scorePercent }}<span :style="gradeScoreUnitStyle">점</span>
              </div>
              <div :style="gradeDescStyle">{{ getGradeDescription(grade) }}</div>
            </div>
          </v-col>

          <v-divider vertical class="d-none d-md-block" :style="verticalDividerStyle" />

          <v-col cols="12" md="4" :style="chartColStyle">
            <p :style="chartLabelStyle">역량 지형도</p>
            <HexagonChart :scoreList="scoreList" />
          </v-col>

          <v-divider vertical class="d-none d-md-block" :style="verticalDividerStyle" />

          <v-col cols="12" md="4" :style="barsColStyle">
            <p :style="chartLabelStyle">세부 점수</p>
            <div v-for="(score, idx) in scoreList" :key="idx" :style="scoreBarRowStyle">
              <span :style="scoreBarLabelStyle">{{ score.type }}</span>
              <div :style="scoreBarTrackStyle">
                <div :style="getScoreBarFillStyle(score.score)"></div>
              </div>
              <span :style="getScoreValueStyle(score.score)">{{ score.score }}</span>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- 총평 -->
      <v-card v-if="overallComment" :style="overallCommentCardStyle" elevation="0">
        <div :style="commentMainHeaderStyle">
          <div :style="commentHeaderContentStyle">
            <div :style="commentIconWrapperStyle">
              <span v-html="SVG.starOutline" style="display:flex;align-items:center;justify-content:center;"></span>
            </div>
            <div>
              <h3 :style="commentTitleStyle">AI 종합 총평</h3>
              <p :style="commentSubtitleStyle">면접 전반에 대한 종합적인 분석 결과입니다</p>
            </div>
          </div>
          <div :style="headerDecoStyle"></div>
        </div>
        <div :style="commentContentWrapperStyle">
          <div
            v-for="(section, index) in parsedComment"
            :key="index"
            :style="getCommentSectionStyle(index)"
            class="comment-section"
          >
            <div :style="sectionHeaderWrapperStyle">
              <div :style="getSectionIconWrapperStyle(section.title)">
                <span v-html="getSectionIconSvg(section.title)" style="display:flex;align-items:center;justify-content:center;color:white;"></span>
              </div>
              <h4 :style="sectionTitleTextStyle">{{ section.title }}</h4>
              <div :style="sectionBadgeStyle(section.title)">{{ getSectionBadgeText(section.title) }}</div>
            </div>
            <div :style="sectionContentWrapperStyle">
              <p :style="sectionContentStyle">{{ section.content }}</p>
            </div>
          </div>
        </div>
      </v-card>

      <!-- 질문별 상세 분석 헤더 -->
      <div :style="detailSectionHeaderStyle">
        <span v-html="SVG.document"></span>
        <h2 :style="detailTitleStyle">질문별 상세 분석</h2>
      </div>

      <!-- Q&A 아코디언 -->
      <div
        v-for="(item, index) in inputList"
        :key="index"
        :style="accordionCardStyle"
        class="accordion-card"
      >
        <!-- 헤더 -->
        <div :style="accordionHeaderStyle" class="accordion-header" @click="toggleItem(index)">
          <div :style="questionNumberStyle">Q{{ index + 1 }}</div>
          <div :style="questionMetaStyle">
            <h3 :style="questionTextStyle">{{ item.question }}</h3>
          </div>
          <div :style="getChevronStyle(index)">
            <span v-html="SVG.chevron" style="display:flex;align-items:center;"></span>
          </div>
        </div>

        <!-- 바디 -->
        <div v-if="openItems[index]" :style="accordionBodyStyle">

          <!-- 당신의 답변 -->
          <div :style="answerSectionStyle">
            <div :style="sectionLabelRowStyle">
              <span :style="sectionIconStyle('#10b981')">
                <span v-html="SVG.bubble" style="display:flex;color:white;"></span>
              </span>
              <h4 :style="sectionLabelStyle">당신의 답변</h4>
            </div>
            <p :style="sectionTextStyle">{{ item.answer }}</p>
          </div>

          <!-- AI 피드백 (구버전 마커가 없는 경우만 표시) -->
          <div v-if="getDisplayFeedback(item)" :style="feedbackSectionStyle">
            <div :style="sectionLabelRowStyle">
              <span :style="sectionIconStyle('#3b82f6')">
                <span v-html="SVG.starCircle" style="display:flex;color:white;"></span>
              </span>
              <h4 :style="sectionLabelStyle">AI 피드백</h4>
            </div>
            <p :style="sectionTextStyle">{{ getDisplayFeedback(item) }}</p>
          </div>

          <!-- 면접관 의도 (신버전 전용: 짧은 레이블) -->
          <div v-if="getDisplayIntent(item)" :style="intentSectionStyle">
            <div :style="sectionLabelRowStyle">
              <span :style="sectionIconStyle('#6366f1')">
                <span v-html="SVG.target" style="display:flex;color:white;"></span>
              </span>
              <h4 :style="sectionLabelStyle">면접관 의도</h4>
            </div>
            <p :style="intentContentStyle">{{ getDisplayIntent(item) }}</p>
          </div>

          <!-- 코칭 리포트 (correction 또는 구버전 feedback 마커 데이터 파싱) -->
          <div v-if="parsedCorrections[index] && parsedCorrections[index].length > 0" :style="coachingSectionStyle">
            <div :style="sectionLabelRowStyle">
              <span :style="sectionIconStyle('#8b5cf6')">
                <span v-html="SVG.wand" style="display:flex;color:white;"></span>
              </span>
              <h4 :style="sectionLabelStyle">코칭 리포트</h4>
            </div>
            <div :style="coachingBodyStyle">
              <template v-for="(cs, ci) in parsedCorrections[index]" :key="ci">

                <!-- 텍스트 -->
                <div v-if="cs.type === 'text'" :style="coachingItemStyle(cs.color)">
                  <div :style="coachingItemHeaderStyle">
                    <span v-html="getCoachingIconSvg(cs.title)" :style="{ color: cs.color, display: 'flex' }"></span>
                    <span :style="coachingItemTitleStyle(cs.color)">{{ cs.title }}</span>
                  </div>
                  <p :style="coachingItemContentStyle">{{ cs.content }}</p>
                </div>

                <!-- 불렛 -->
                <div v-else-if="cs.type === 'bullets'" :style="coachingItemStyle(cs.color)">
                  <div :style="coachingItemHeaderStyle">
                    <span v-html="getCoachingIconSvg(cs.title)" :style="{ color: cs.color, display: 'flex' }"></span>
                    <span :style="coachingItemTitleStyle(cs.color)">{{ cs.title }}</span>
                  </div>
                  <ul :style="bulletListStyle">
                    <li v-for="(bullet, bi) in cs.items" :key="bi" :style="bulletItemStyle">
                      <span :style="bulletDotStyle(cs.color)"></span>
                      {{ bullet }}
                    </li>
                  </ul>
                </div>

                <!-- 표현 개선 -->
                <div v-else-if="cs.type === 'expressions'" :style="coachingItemStyle(cs.color)">
                  <div :style="coachingItemHeaderStyle">
                    <span v-html="getCoachingIconSvg(cs.title)" :style="{ color: cs.color, display: 'flex' }"></span>
                    <span :style="coachingItemTitleStyle(cs.color)">{{ cs.title }}</span>
                  </div>
                  <div v-if="cs.pairs && cs.pairs.length">
                    <div v-for="(pair, pi) in cs.pairs" :key="pi" :style="expressionPairStyle">
                      <div :style="expressionBeforeStyle">
                        <span :style="expBadgeBeforeStyle">Before</span>
                        <p :style="expTextBeforeStyle">{{ pair.before }}</p>
                      </div>
                      <div :style="expressionArrowStyle">→</div>
                      <div :style="expressionAfterStyle">
                        <span :style="expBadgeAfterStyle">After</span>
                        <p :style="expTextAfterStyle">{{ pair.after }}</p>
                      </div>
                    </div>
                  </div>
                  <p v-else :style="coachingItemContentStyle">{{ cs.content }}</p>
                </div>

              </template>

            </div>
          </div>

        </div>
      </div>

      <!-- 액션 버튼 -->
      <div :style="actionButtonsStyle" class="no-print">
        <v-btn v-if="downloadUrl" :style="primaryButtonStyle" elevation="0" size="large" @click="downloadRecording">
          <span v-html="SVG.download" style="display:flex;margin-right:8px;"></span>
          녹화 영상 저장
        </v-btn>
        <v-btn :style="primaryButtonStyle" elevation="0" size="large" @click="handlePrint">
          <span v-html="SVG.printer" style="display:flex;margin-right:8px;"></span>
          PDF로 저장
        </v-btn>
        <v-btn :style="retryButtonStyle" elevation="0" size="large" @click="goToRetry">
          <span v-html="SVG.retry" style="display:flex;margin-right:8px;"></span>
          다시 도전하기
        </v-btn>
        <v-btn :style="homeButtonStyle" elevation="0" size="large" @click="goToHome">
          <span v-html="SVG.home" style="display:flex;margin-right:8px;"></span>
          홈으로
        </v-btn>
      </div>

    </v-container>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAiInterviewStore } from "../../stores/aiInterviewStore";
import HexagonChart from "../result/HexagonChart.vue";
import { useHead } from "@vueuse/head";
import Swal from "sweetalert2";

const route = useRoute();
const interviewId = ref(route.params.interviewId || "");

useHead({
  title: "AI 면접 결과 보기 | 잡스틱(JobStick)",
  meta: [
    { name: "description", content: "AI 기반 모의 면접 결과를 확인하고, 나의 강점과 개선점을 분석해보세요." },
    { name: "keywords", content: "AI 면접, 면접 결과, 자기 분석, 모의 면접, AI 분석, 잡스틱, 개발자 취업" },
    { property: "og:title", content: "AI 면접 결과 - 잡스틱(JobStick)" },
    { property: "og:description", content: "AI가 분석한 나의 면접 결과를 지금 확인해보세요." },
    { name: "robots", content: "index, follow" },
  ],
});

// ─────────────────────────────────────────
// SVG 아이콘
// ─────────────────────────────────────────
const SVG = {
  checkSmall:  `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5,10 7.5,14 16.5,5.5"/></svg>`,
  starOutline: `<svg width="32" height="32" viewBox="0 0 20 20" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M10 5.5l1.5 3.5 3.5.5-2.5 2.5.5 3.5L10 14l-3 1.5.5-3.5L5 9.5l3.5-.5z"/></svg>`,
  document:    `<svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2h8.5L17 6.5V18H4z"/><polyline points="12.5,2 12.5,6.5 17,6.5"/><line x1="7" y1="10" x2="14" y2="10"/><line x1="7" y1="13" x2="14" y2="13"/><line x1="7" y1="16" x2="11" y2="16"/></svg>`,
  chevron:     `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="5,8 10,13 15,8"/></svg>`,
  bubble:      `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H7l-4 3v-3a1 1 0 01-1-1V4z"/></svg>`,
  starCircle:  `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M10 6l1.2 3.2 3.3.5-2.4 2.3.6 3.3-2.7-1.5-2.7 1.5.6-3.3-2.4-2.3 3.3-.5z"/></svg>`,
  wand:        `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="2.5" y1="17.5" x2="12.5" y2="7.5"/><path d="M12.5 5l2.5 2.5-1 1-2.5-2.5z"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="6" x2="16" y2="6"/></svg>`,
  target:      `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3.5"/><circle cx="10" cy="10" r="1" fill="currentColor" stroke="none"/></svg>`,
  check:       `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5,10 7.5,14 16.5,5.5"/></svg>`,
  improve:     `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="10" y1="16" x2="10" y2="5"/><polyline points="6,9 10,5 14,9"/><line x1="5" y1="16" x2="15" y2="16"/></svg>`,
  edit:        `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2.5l3 3-9.5 9.5H5.5v-2.5z"/><path d="M12.5 4.5l3 3"/></svg>`,
  eye:         `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 10s3-6.5 9-6.5S19 10 19 10s-3 6.5-9 6.5S1 10 1 10z"/><circle cx="10" cy="10" r="2.5"/></svg>`,
  peak:        `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,17 10,4 18,17"/></svg>`,
  cycle:       `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14.5 3.5A7.5 7.5 0 1 1 3.5 13"/><polyline points="14.5,0.5 14.5,3.5 11.5,3.5"/></svg>`,
  flag:        `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="4" y1="2.5" x2="4" y2="18"/><path d="M4 2.5l12 4-12 4"/></svg>`,
  download:    `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="3" x2="10" y2="14"/><polyline points="6,10 10,14 14,10"/><line x1="3" y1="17" x2="17" y2="17"/></svg>`,
  printer:     `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7V3h10v4"/><path d="M5 14H3a1 1 0 01-1-1V8a1 1 0 011-1h14a1 1 0 011 1v5a1 1 0 01-1 1h-2"/><rect x="5" y="12" width="10" height="6" rx="1"/></svg>`,
  retry:       `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14 3.5A7.5 7.5 0 1 1 3.5 13"/><polyline points="14,0.5 14,3.5 11,3.5"/></svg>`,
  home:        `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10L10 3l7 7"/><path d="M5 8.5v9h4v-5h2v5h4v-9"/></svg>`,
};

// ─────────────────────────────────────────
// 스켈레톤 스타일 (inline)
// ─────────────────────────────────────────
const skelBase = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
  backgroundSize: "600px 100%",
  animation: "shimmer 1.4s infinite linear",
  borderRadius: "12px",
};
const skeletonPageStyle   = { maxWidth: "1200px", margin: "80px auto", padding: "0 20px" };
const skeletonHeaderStyle = { textAlign: "center", marginBottom: "48px" };
const skelBadgeStyle      = { ...skelBase, width: "120px", height: "36px", margin: "0 auto 24px", borderRadius: "50px" };
const skelTitleLgStyle    = { ...skelBase, width: "280px", height: "52px", margin: "0 auto 12px" };
const skelTitleSmStyle    = { ...skelBase, width: "180px", height: "36px", margin: "0 auto" };
const skelCardTallStyle   = { ...skelBase, height: "320px", marginBottom: "32px" };
const skelCardMediumStyle = { ...skelBase, height: "200px", marginBottom: "32px" };
const skelCardStyle       = { ...skelBase, height: "120px", marginBottom: "16px" };

// ─────────────────────────────────────────
// 페이지 레이아웃
// ─────────────────────────────────────────
const mainContainerStyle = { minHeight: "100vh", background: "#ffffff", padding: "80px 20px 60px" };
const reportContainerStyle = { maxWidth: "1200px", margin: "auto" };

const headerSectionStyle = { textAlign: "center", marginBottom: "64px", animation: "fadeInDown 0.8s ease-out" };
const headerBadgeStyle = {
  display: "inline-flex", alignItems: "center", gap: "8px",
  padding: "10px 24px", background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)",
  borderRadius: "50px", marginBottom: "24px", boxShadow: "0 4px 16px rgba(79,156,249,0.25)",
};
const badgeTextStyle   = { color: "white", fontSize: "14px", fontWeight: "700", letterSpacing: "0.5px" };
const reportTitleStyle = { fontSize: "48px", fontWeight: "900", color: "#1a1a1a", marginBottom: "8px", letterSpacing: "-2px", lineHeight: "1.2" };
const reportTitleStyle2= { fontSize: "30px", fontWeight: "900", color: "#1a1a1a", marginBottom: "16px", letterSpacing: "-2px", lineHeight: "1.2" };

// ─────────────────────────────────────────
// 종합 평가 카드
// ─────────────────────────────────────────
const summaryCardStyle = {
  background: "white", borderRadius: "20px", padding: "48px 32px", marginBottom: "40px",
  boxShadow: "0 2px 20px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0",
  animation: "fadeInUp 0.8s ease-out 0.2s both",
};
const gradeColStyle    = { display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" };
const gradeWrapperStyle= { textAlign: "center" };
const gradeLabelStyle  = { fontSize: "12px", color: "#999", marginBottom: "20px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase" };
const gradeBadgeStyle  = {
  width: "120px", height: "120px", margin: "0 auto 16px",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "56px", fontWeight: "900",
  background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)",
  color: "white", borderRadius: "50%", boxShadow: "0 8px 32px rgba(79,156,249,0.3)",
  animation: "pulse 2s ease-in-out infinite",
};
const gradeScoreStyle    = { fontSize: "28px", fontWeight: "800", color: "#1a1a1a", letterSpacing: "-1px", marginBottom: "6px" };
const gradeScoreUnitStyle= { fontSize: "16px", fontWeight: "600", color: "#999", marginLeft: "2px" };
const gradeDescStyle     = { fontSize: "13px", color: "#888", fontWeight: "500" };
const verticalDividerStyle= { height: "200px", width: "1px", background: "#f0f0f0", margin: "0 20px" };
const chartColStyle  = { display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px" };
const barsColStyle   = { display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 32px 20px 24px" };
const chartLabelStyle= { fontSize: "12px", fontWeight: "700", color: "#999", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px", textAlign: "center" };

const scoreBarRowStyle  = { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" };
const scoreBarLabelStyle= { fontSize: "12px", fontWeight: "700", color: "#555", width: "52px", flexShrink: 0, letterSpacing: "-0.2px" };
const scoreBarTrackStyle= { flex: 1, height: "8px", background: "#f0f0f0", borderRadius: "8px", overflow: "hidden" };
const getScoreBarFillStyle = (score) => ({
  height: "100%", borderRadius: "8px", width: `${score * 10}%`,
  background: getScoreColor(score), transformOrigin: "left center",
  animation: "barGrow 0.9s ease-out both",
});
const getScoreValueStyle = (score) => ({
  fontSize: "13px", fontWeight: "800", width: "18px", textAlign: "right", flexShrink: 0, color: getScoreColor(score),
});

// ─────────────────────────────────────────
// 총평 카드
// ─────────────────────────────────────────
const overallCommentCardStyle = {
  background: "white", borderRadius: "24px", padding: "0", marginBottom: "56px",
  boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
  overflow: "hidden", animation: "fadeInUp 0.8s ease-out 0.3s both", position: "relative",
};
const commentMainHeaderStyle = {
  position: "relative", padding: "48px 48px 56px",
  background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)", overflow: "hidden",
};
const commentHeaderContentStyle = { display: "flex", alignItems: "center", gap: "24px", position: "relative", zIndex: 2 };
const headerDecoStyle = {
  position: "absolute", right: "-40px", top: "-40px", width: "200px", height: "200px",
  background: "rgba(255,255,255,0.1)", borderRadius: "50%", zIndex: 1,
};
const commentIconWrapperStyle = {
  width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
  borderRadius: "20px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
};
const commentTitleStyle   = { fontSize: "32px", fontWeight: "900", color: "white", margin: 0, marginBottom: "8px", letterSpacing: "-1.5px" };
const commentSubtitleStyle= { fontSize: "15px", color: "rgba(255,255,255,0.9)", margin: 0, fontWeight: "500" };
const commentContentWrapperStyle = { padding: "48px", background: "white" };
const sectionHeaderWrapperStyle  = { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" };
const sectionTitleTextStyle = { fontSize: "20px", fontWeight: "900", color: "#1a1a1a", margin: 0, letterSpacing: "-0.8px", flex: 1 };
const sectionContentWrapperStyle = { paddingLeft: "68px" };
const sectionContentStyle = { fontSize: "15px", lineHeight: "1.9", color: "#333", margin: 0, whiteSpace: "pre-line" };

// ─────────────────────────────────────────
// 상세 분석 헤더
// ─────────────────────────────────────────
const detailSectionHeaderStyle = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", animation: "fadeInUp 0.8s ease-out 0.4s both" };
const detailTitleStyle = { fontSize: "32px", fontWeight: "900", color: "#1a1a1a", margin: 0, letterSpacing: "-1.5px" };

// ─────────────────────────────────────────
// 아코디언 (모두 inline)
// ─────────────────────────────────────────
const accordionCardStyle = {
  background: "white", borderRadius: "20px", marginBottom: "16px",
  boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", overflow: "hidden",
};
const accordionHeaderStyle = {
  display: "flex", alignItems: "center", gap: "16px",
  padding: "24px 28px", cursor: "pointer", userSelect: "none",
};
const questionNumberStyle = {
  width: "44px", minWidth: "44px", height: "44px", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)",
  color: "white", borderRadius: "12px", fontSize: "16px", fontWeight: "800",
  boxShadow: "0 4px 16px rgba(79,156,249,0.25)",
};
const questionMetaStyle = { flex: 1, minWidth: 0 };
const intentTagStyle = {
  display: "inline-block", padding: "3px 10px", background: "#f0f4ff",
  color: "#3b82f6", fontSize: "11px", fontWeight: "700",
  borderRadius: "50px", marginBottom: "6px", letterSpacing: "0.3px",
};
const questionTextStyle = { fontSize: "17px", fontWeight: "700", color: "#1a1a1a", lineHeight: "1.5", margin: 0, letterSpacing: "-0.3px" };
const getChevronStyle = (index) => ({
  color: openItems.value[index] ? "#4F9CF9" : "#aaa",
  transform: openItems.value[index] ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 0.3s ease, color 0.2s ease",
  flexShrink: 0, display: "flex",
});
const accordionBodyStyle = { padding: "0 28px 28px", borderTop: "1px solid #f5f5f5" };

// Q섹션 공통 base
const qaSectionBase = { borderRadius: "14px", padding: "20px 22px", marginTop: "16px" };
const answerSectionStyle   = { ...qaSectionBase, background: "#f7fcf9", border: "1px solid #e6f7ed" };
const feedbackSectionStyle = { ...qaSectionBase, background: "#f7f9fc", border: "1px solid #e6eef7" };
const intentSectionStyle   = { ...qaSectionBase, background: "#f5f3ff", border: "1px solid #e0e7ff" };
const coachingSectionStyle = { ...qaSectionBase, background: "#faf8ff", border: "1px solid #ede9fe" };
const intentContentStyle   = { fontSize: "14px", lineHeight: "1.8", color: "#4338ca", margin: 0, fontWeight: "500" };

const sectionLabelRowStyle = { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" };
const sectionIconStyle = (bg) => ({
  width: "28px", height: "28px", borderRadius: "8px", background: bg,
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
});
const sectionLabelStyle = { fontSize: "13px", fontWeight: "700", color: "#1a1a1a", margin: 0 };
const sectionTextStyle  = { fontSize: "14px", lineHeight: "1.8", color: "#444", margin: 0, whiteSpace: "pre-line" };

// 코칭
const coachingBodyStyle = { display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" };
const coachingItemStyle = (color) => ({
  padding: "16px 18px", background: "white", borderRadius: "12px",
  borderTop: "1px solid #f0f0f0", borderRight: "1px solid #f0f0f0",
  borderBottom: "1px solid #f0f0f0", borderLeft: `3px solid ${color}`,
});
const coachingItemHeaderStyle  = { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" };
const coachingItemTitleStyle   = (color) => ({ fontSize: "13px", fontWeight: "700", letterSpacing: "-0.2px", color });
const coachingItemContentStyle = { fontSize: "14px", lineHeight: "1.75", color: "#444", margin: 0 };

// 불렛
const bulletListStyle = { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" };
const bulletItemStyle = { fontSize: "14px", lineHeight: "1.7", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" };
const bulletDotStyle  = (color) => ({ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0, marginTop: "8px" });

// 표현 개선
const expressionPairStyle  = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", flexWrap: "wrap" };
const expressionBeforeStyle= { flex: 1, minWidth: "180px", background: "#fafafa", borderRadius: "10px", padding: "12px 14px" };
const expressionAfterStyle = { flex: 1, minWidth: "180px", background: "#f0fdf8", borderRadius: "10px", padding: "12px 14px" };
const expressionArrowStyle = { fontSize: "18px", color: "#aaa", flexShrink: 0 };
const expBadgeBeforeStyle  = { display: "inline-block", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "50px", marginBottom: "6px", background: "#fee2e2", color: "#dc2626" };
const expBadgeAfterStyle   = { display: "inline-block", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "50px", marginBottom: "6px", background: "#d1fae5", color: "#059669" };
const expTextBeforeStyle   = { fontSize: "13px", lineHeight: "1.6", color: "#555", margin: 0 };
const expTextAfterStyle    = { fontSize: "13px", lineHeight: "1.6", color: "#1a1a1a", fontWeight: "600", margin: 0 };

// 액션 버튼
const actionButtonsStyle = { display: "flex", justifyContent: "center", gap: "12px", marginTop: "64px", flexWrap: "wrap", animation: "fadeInUp 0.8s ease-out 0.6s both" };
const primaryButtonStyle = { background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)", color: "white", padding: "14px 28px", borderRadius: "50px", fontWeight: "700", fontSize: "14px", textTransform: "none", boxShadow: "0 4px 16px rgba(79,156,249,0.25)", letterSpacing: "-0.3px" };
const retryButtonStyle   = { background: "white", color: "#4F9CF9", padding: "14px 28px", borderRadius: "50px", fontWeight: "700", fontSize: "14px", textTransform: "none", border: "2px solid #4F9CF9", letterSpacing: "-0.3px" };
const homeButtonStyle    = { background: "white", color: "#666", padding: "14px 28px", borderRadius: "50px", fontWeight: "700", fontSize: "14px", textTransform: "none", border: "1px solid #e5e5e5", letterSpacing: "-0.3px" };

// ─────────────────────────────────────────
// 총평 섹션 헬퍼
// ─────────────────────────────────────────
const getSectionIconSvg = (title) => {
  if (title.includes("전반적")) return SVG.eye;
  if (title.includes("강점"))   return SVG.peak;
  if (title.includes("개선"))   return SVG.cycle;
  if (title.includes("최종"))   return SVG.flag;
  return SVG.starOutline;
};
const getSectionColor = (title) => {
  if (title.includes("전반적")) return "#3b82f6";
  if (title.includes("강점"))   return "#10b981";
  if (title.includes("개선"))   return "#f59e0b";
  if (title.includes("최종"))   return "#8b5cf6";
  return "#64748b";
};
const getSectionIconWrapperStyle = (title) => {
  const color = getSectionColor(title);
  return { width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", background: color, borderRadius: "16px", boxShadow: `0 4px 16px ${color}40`, flexShrink: 0 };
};
const sectionBadgeStyle = (title) => {
  const map = { "전반적인 인상": "#3b82f6", "강점": "#10b981", "개선점": "#f59e0b", "최종 평가": "#8b5cf6" };
  let bgColor = "#e5e5e5", textColor = "#666";
  for (const [key, color] of Object.entries(map)) {
    if (title.includes(key)) { bgColor = `${color}15`; textColor = color; break; }
  }
  return { padding: "6px 14px", borderRadius: "50px", background: bgColor, color: textColor, fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", whiteSpace: "nowrap" };
};
const getSectionBadgeText = (title) => {
  if (title.includes("강점"))   return "STRENGTH";
  if (title.includes("개선"))   return "IMPROVE";
  if (title.includes("최종"))   return "FINAL";
  if (title.includes("전반적")) return "OVERVIEW";
  return "✓";
};
const getCommentSectionStyle = (index) => ({
  marginBottom: "24px", padding: "32px",
  background: "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
  borderRadius: "20px", border: "1px solid #f0f0f0", transition: "all 0.3s ease",
  animation: `fadeInUp 0.6s ease-out ${0.5 + index * 0.1}s both`,
});

// ─────────────────────────────────────────
// 코칭 아이콘 헬퍼
// ─────────────────────────────────────────
const getCoachingIconSvg = (title) => {
  if (title.includes("핵심")) return SVG.target;
  if (title.includes("잘한")) return SVG.check;
  if (title.includes("보완")) return SVG.improve;
  if (title.includes("표현")) return SVG.edit;
  return SVG.target;
};

// ─────────────────────────────────────────
// 점수 색상
// ─────────────────────────────────────────
const getScoreColor = (score) => {
  if (score >= 8) return "#10b981";
  if (score >= 5) return "#f59e0b";
  return "#ef4444";
};

// ─────────────────────────────────────────
// correction 파싱
// ─────────────────────────────────────────
const CORRECTION_META = {
  "이 질문의 핵심":     { color: "#3b82f6", type: "text" },
  "잘한 점":           { color: "#10b981", type: "text" },
  "이렇게 보완해보세요": { color: "#f59e0b", type: "bullets" },
  "표현 개선":         { color: "#8b5cf6", type: "expressions" },
  "보강 추천":         { color: "#f59e0b", type: "bullets" },
  "표현 첨삭":         { color: "#8b5cf6", type: "expressions" },
};
const parseCorrection = (text) => {
  if (!text) return [];
  const results = [];
  const regex = /\[([^\]]+)\]\s*\n?([\s\S]*?)(?=\n?\[|$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();
    if (!title || !content) continue;
    const meta = CORRECTION_META[title] || { color: "#64748b", type: "text" };
    const section = { title, content, color: meta.color, type: meta.type };
    if (meta.type === "bullets") {
      section.items = content.split("\n").map(l => l.replace(/^[•·\-*]\s*/, "").trim()).filter(l => l && l !== "개선 불필요");
    } else if (meta.type === "expressions") {
      const pairs = [];
      const inlineRegex = /❌\s*(.+?)\s*→\s*⭕\s*(.+)/g;
      let m;
      while ((m = inlineRegex.exec(content)) !== null) pairs.push({ before: m[1].trim(), after: m[2].trim() });
      if (pairs.length === 0) {
        const lines = content.split("\n");
        let before = null;
        lines.forEach(line => {
          const t = line.trim();
          if (t.startsWith("❌")) { before = t.replace(/^❌\s*/, "").trim(); }
          else if (t.startsWith("⭕") && before) { pairs.push({ before, after: t.replace(/^⭕\s*/, "").trim() }); before = null; }
        });
      }
      section.pairs = pairs;
      // 쌍도 없고 "불필요" 텍스트면 섹션 자체를 숨김
      if (pairs.length === 0 && content.includes("불필요")) continue;
    }
    results.push(section);
  }
  return results;
};

// ─────────────────────────────────────────
// 상태
// ─────────────────────────────────────────
const aiInterviewStore = useAiInterviewStore();
const router = useRouter();
const isLoading   = ref(true);
const inputList   = ref([]);
const overallComment = ref("");
const parsedComment  = ref([]);
const downloadUrl = ref(null);
const grade       = ref("");
const scorePercent= ref(0);
const scoreList   = ref([]);
const openItems   = ref({});
const userToken   = ref("");

// ── 구버전/신버전 데이터 판별 ──────────────────────────
const SECTION_MARKERS = ["[보강 추천]", "[표현 첨삭]", "[이 질문의 핵심]", "[잘한 점]", "[이렇게 보완해보세요]", "[표현 개선]"];
const hasSectionMarkers = (text) => !!text && SECTION_MARKERS.some(m => text.includes(m));

// 구버전: intent 필드에 짧은 레이블 대신 긴 피드백 문장이 들어있음 (60자 초과 = 구버전 피드백)
const isLegacyIntent = (text) => !!text && text.length > 60;

// 코칭 리포트 파싱: correction → feedback(마커 있을 때) 순서
const parsedCorrections = computed(() =>
  inputList.value.map(item => {
    if (item.correction && item.correction.trim()) return parseCorrection(item.correction);
    if (hasSectionMarkers(item.feedback)) return parseCorrection(item.feedback);
    return [];
  })
);

// 화면에 보여줄 "AI 피드백" 텍스트
// - 구버전: intent에 피드백이 있고, feedback에는 마커가 있음 → intent를 보여줌
// - 신버전: feedback이 짧은 텍스트 → feedback을 보여줌
const getDisplayFeedback = (item) => {
  if (isLegacyIntent(item.intent) && hasSectionMarkers(item.feedback)) return item.intent;
  if (!hasSectionMarkers(item.feedback)) return item.feedback;
  return null;
};

// "면접관 의도" 섹션: 신버전에만 표시 (짧은 레이블)
const getDisplayIntent = (item) => isLegacyIntent(item.intent) ? null : item.intent;

const toggleItem = (index) => { openItems.value = { ...openItems.value, [index]: !openItems.value[index] }; };

const calculateGrade = (percent) => {
  if (percent >= 90) return "A";
  if (percent >= 75) return "B";
  if (percent >= 50) return "C";
  if (percent >= 25) return "D";
  return "F";
};
const getGradeDescription = (g) => ({
  A: "상위 10% 수준", B: "상위 25% 수준", C: "평균 수준",
  D: "추가 연습이 필요해요", F: "기초부터 다시 시작해요",
}[g] || "");

const parseOverallComment = (comment) => {
  if (!comment) return [];
  const sections = [];
  const lines = comment.split("\n").filter(l => l.trim());
  let cur = null;
  lines.forEach(line => {
    const m = line.match(/\*\*(.+?)\*\*/);
    if (m) {
      if (cur) sections.push(cur);
      cur = { title: m[1].replace(/:$/, "").trim(), content: line.replace(/\*\*(.+?)\*\*:?\s*/, "").trim() };
    } else if (cur) {
      cur.content += (cur.content ? "\n" : "") + line.trim();
    }
  });
  if (cur) sections.push(cur);
  if (sections.length === 0) sections.push({ title: "종합 평가", content: comment });
  return sections;
};

// ─────────────────────────────────────────
// 데이터 로드
// ─────────────────────────────────────────
const getScoreResultList = async (id) => {
  isLoading.value = true;
  try {
    const res = await aiInterviewStore.requestGetInterviewResultToSpring(id);
    if (res.status === 401) {
      Swal.fire({ title: "권한이 없습니다", text: "접근 권한이 없습니다.", icon: "warning", iconColor: "#2563EB", confirmButtonText: "확인" })
        .then(r => { if (r.isConfirmed) window.location.href = "/"; });
      return;
    }
    inputList.value = res.interviewResultList;
    overallComment.value = res.overallComment;
    parsedComment.value  = parseOverallComment(res.overallComment);
    const hexagon = res.hexagonScore || {};
    scoreList.value = [
      { type: "표현력",  score: hexagon.communication       || 0 },
      { type: "기술역량", score: hexagon.technical_skills    || 0 },
      { type: "문제해결", score: hexagon.problem_solving     || 0 },
      { type: "실행력",  score: hexagon.productivity         || 0 },
      { type: "논리구조", score: hexagon.documentation_skills|| 0 },
      { type: "적응력",  score: hexagon.flexibility          || 0 },
    ];
    const total = scoreList.value.reduce((s, i) => s + i.score, 0);
    scorePercent.value = Math.round((total / 60) * 100);
    grade.value = calculateGrade(scorePercent.value);
    openItems.value = { 0: true };
  } catch (err) {
    console.error("❌ 면접 결과 불러오기 실패:", err);
  } finally {
    isLoading.value = false;
  }
};

// ─────────────────────────────────────────
// 동적 스타일 주입 (keyframes + hover + print만)
// ─────────────────────────────────────────
const STYLE_TAG_ID = "ai-report-inline-style";
function injectDynamicStyle() {
  if (document.getElementById(STYLE_TAG_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_TAG_ID;
  style.textContent = `
    @keyframes fadeInDown { from{opacity:0;transform:translateY(-30px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeInUp   { from{opacity:0;transform:translateY(30px)}  to{opacity:1;transform:translateY(0)} }
    @keyframes pulse      { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    @keyframes shimmer    { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
    @keyframes barGrow    { from{transform:scaleX(0)} to{transform:scaleX(1)} }
    .comment-section { position: relative; }
    .comment-section::before {
      content:''; position:absolute; left:0; top:0; width:4px; height:0;
      background:linear-gradient(135deg,#4F9CF9 0%,#10B981 100%);
      border-radius:0 4px 4px 0; transition:height 0.3s ease;
    }
    .comment-section:hover { transform:translateX(4px); box-shadow:0 8px 32px rgba(0,0,0,0.12); }
    .comment-section:hover::before { height:100%; }
    .accordion-card:hover { box-shadow:0 6px 28px rgba(0,0,0,0.09) !important; }
    .accordion-header:hover { background:#fafafa !important; }
    @media print { .no-print{display:none!important} body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important} }
    @media (min-width:960px) { .d-md-block{display:block!important} }
  `;
  document.head.appendChild(style);
}
function removeDynamicStyle() {
  const s = document.getElementById(STYLE_TAG_ID);
  if (s) s.remove();
}

// ─────────────────────────────────────────
// 라이프사이클
// ─────────────────────────────────────────
onMounted(async () => {
  injectDynamicStyle();
  userToken.value = localStorage.getItem("userToken");
  if (!interviewId.value) { alert("인터뷰 ID가 없습니다."); return; }
  await getScoreResultList(interviewId.value);
  const saveUrl = localStorage.getItem("interviewRecordingUrl");
  if (saveUrl) downloadUrl.value = saveUrl;
});
onBeforeUnmount(() => {
  removeDynamicStyle();
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value);
  localStorage.removeItem("interviewRecordingUrl");
});

// ─────────────────────────────────────────
// 액션
// ─────────────────────────────────────────
const handlePrint = () => window.print();
const downloadRecording = () => {
  if (downloadUrl.value) {
    const link = document.createElement("a");
    link.href = downloadUrl.value;
    link.download = "interview-recording.webm";
    link.click();
  }
};
const goToRetry = () => router.push("/ai-interview/select");
const goToHome  = () => router.push("/");
</script>
