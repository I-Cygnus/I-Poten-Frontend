<template>
  <!-- 로딩 -->
  <LoadingSpinner v-if="isLoading"/>

  <!-- 면접 준비 화면 -->
  <div v-else-if="!start" :style="interviewStartContainerStyle">
    <div :style="bgDecoStyle"></div>
    <div :style="backgroundTextStyle">PERSONALITY</div>

    <!-- 장치 토글 버튼 (우측 상단) -->
    <div :style="deviceToggleBarStyle">
      <div :style="deviceToggleBtnStyle(useMic)" @click="useMic = !useMic">
        <v-icon size="13" :color="useMic ? '#a5b4fc' : 'rgba(255,255,255,0.3)'">mdi-microphone{{ useMic ? '' : '-off' }}</v-icon>
        마이크
      </div>
      <div :style="deviceToggleBtnStyle(useCamera)" @click="useCamera = !useCamera">
        <v-icon size="13" :color="useCamera ? '#a5b4fc' : 'rgba(255,255,255,0.3)'">mdi-video{{ useCamera ? '' : '-off' }}</v-icon>
        카메라
      </div>
    </div>

    <div :style="interviewStartWrapperStyle">
      <!-- 진행 표시 헤더 -->
      <div :style="progressHeaderStyle">
        <span :style="progressLabelStyle">면접 준비</span>
        <div :style="progressBarWrapStyle">
          <div :style="progressBarFillStyle(mediaChecked ? 100 : 20)"></div>
        </div>
        <span :style="progressStatusStyle">{{ mediaChecked ? '준비 완료' : '확인 필요' }}</span>
      </div>

      <!-- 메인 카메라 영역 -->
      <div :style="mainCameraContainerStyle">
        <video ref="previewVideo" autoplay playsinline muted :style="mainVideoStyle" />

        <!-- 카메라 비활성화 오버레이 -->
        <div :style="videoOverlayStyle" v-if="!mediaChecked || !useCamera">
          <v-icon size="56" color="rgba(255,255,255,0.25)">{{ useCamera ? 'mdi-video-outline' : 'mdi-video-off-outline' }}</v-icon>
          <p :style="overlayTextStyle">{{ !mediaChecked ? '장치를 확인하세요' : '카메라가 꺼져 있습니다' }}</p>
        </div>

        <!-- PiP -->
        <div :style="smallPreviewStyle" v-if="mediaChecked && useCamera">
          <video ref="smallPreview" autoplay playsinline muted :style="smallVideoStyle" />
        </div>

        <!-- 상태 뱃지 -->
        <div :style="topLeftBadgeStyle">
          <v-icon size="11" :color="mediaChecked ? '#10b981' : 'rgba(255,255,255,0.4)'">mdi-circle</v-icon>
          <span>{{ mediaChecked ? '준비 완료' : '카메라 확인 필요' }}</span>
        </div>

        <!-- 하단 오버레이 -->
        <div :style="videoBottomOverlayStyle">
          <div :style="qBadgeStyle">PREP</div>
          <div :style="questionScrollContainerStyle" class="question-scroll">
            <p :style="videoQuestionTextStyle">
              {{ mediaChecked
                ? '장치가 준비되었습니다. 면접을 시작하세요.'
                : '장치를 확인하고 면접을 준비해주세요.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 컨트롤 버튼 -->
      <div :style="controlsRowStyle">
        <template v-if="!mediaChecked">
          <v-btn :style="primaryControlBtnStyle" elevation="0" @click="checkMediaReady">
            <v-icon left size="18">mdi-camera-check</v-icon>
            카메라 / 마이크 확인
          </v-btn>
        </template>
        <template v-else>
          <v-btn :style="primaryControlBtnStyle" elevation="0" @click="handleStartInterview">
            <v-icon left size="18">mdi-play-circle</v-icon>
            면접 시작
          </v-btn>
        </template>
      </div>
    </div>
  </div>

  <!-- 면접 진행 화면 -->
  <div v-else :style="interviewActiveContainerStyle">
    <!-- 카운트다운 오버레이 -->
    <div v-if="isStartingCountdown" :style="countdownOverlayStyle">
      <div :style="countdownContentStyle">
        <div :style="countdownLabelStyle">PREPARING</div>
        <h2 :style="countdownTitleStyle">잠시 후 면접이 시작됩니다</h2>
        <div :style="countdownNumberStyle">{{ countdownValue }}</div>
        <div :style="countdownProgressStyle">
          <div :style="countdownBarFillStyle"></div>
        </div>
      </div>
    </div>

    <div :style="interviewStartWrapperStyle">
      <!-- 진행 헤더 -->
      <div :style="progressHeaderStyle">
        <span :style="progressLabelStyle">{{ interviewSequence }} / {{ interviewList.length }}</span>
        <div :style="progressBarWrapStyle">
          <div :style="progressBarFillStyle(interviewSequence / interviewList.length * 100)"></div>
        </div>
        <span :style="progressTimerStyle">
          {{ Math.floor(remainingTime / 60) }}:{{ (remainingTime % 60).toString().padStart(2, '0') }}
        </span>
      </div>

      <!-- 메인 영상 영역 -->
      <div :style="mainCameraContainerStyle">
        <!-- 면접관 비디오 -->
        <video
          ref="interviewerVideo"
          :style="interviewerVideoStyle"
          playsinline
          muted
          autoplay
          @ended="onInterviewerVideoEnded"
        ></video>

        <!-- 사용자 PiP -->
        <div :style="smallPreviewStyle" v-if="cameraAvailable">
          <video ref="userVideo" v-show="start" autoplay playsinline muted :style="smallVideoStyle"></video>
        </div>

        <!-- 타이머 -->
        <div :style="topLeftBadgeStyle">
          <v-icon size="11" color="rgba(255,255,255,0.6)">mdi-clock-outline</v-icon>
          <span>{{ Math.floor(remainingTime / 60) }}:{{ (remainingTime % 60).toString().padStart(2, '0') }}</span>
        </div>

        <!-- 하단 오버레이: 질문 표시 -->
        <div :style="videoBottomOverlayStyle">
          <div :style="qBadgeStyle">Q{{ interviewSequence }}</div>
          <div v-if="isQuestionPreparing" :style="questionLoadingInlineStyle">
            <p :style="prepTextStyle">면접 질문을 준비중입니다</p>
            <div :style="loadingDotsInlineStyle">
              <div :style="loadingDotStyle"></div>
              <div :style="loadingDotStyle"></div>
              <div :style="loadingDotStyle"></div>
            </div>
          </div>
          <div v-else-if="visible" :style="questionLoadingInlineStyle">
            <p :style="videoQuestionTextStyle">질문을 재생 중입니다</p>
            <div :style="loadingDotsInlineStyle">
              <div :style="loadingDotStyle"></div>
              <div :style="loadingDotStyle"></div>
              <div :style="loadingDotStyle"></div>
            </div>
          </div>
          <div v-else :style="questionScrollContainerStyle" class="question-scroll">
            <p :style="videoQuestionTextStyle" v-html="formattedCurrentQuestion"></p>
          </div>
        </div>
      </div>

      <!-- 내 답변 표시 카드 -->
      <div v-if="!visible" :style="dynamicSttAnswerCardStyle">
        <div :style="sttAnswerHeaderStyle">
          <v-icon size="13" color="#5B6BFF">mdi-text-to-speech</v-icon>
          <span :style="dynamicSttAnswerLabelStyle">내 답변</span>
          <div v-if="recognizing" :style="recordingPillStyle">
            <div :style="recordingDotAnimStyle"></div>
            <span>녹음 중</span>
          </div>
          <div :style="answerThemeToggleStyle" @click="answerCardDark = !answerCardDark">
            <v-icon size="13" :color="answerCardDark ? 'rgba(255,255,255,0.7)' : '#64748b'">
              {{ answerCardDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
            </v-icon>
          </div>
        </div>
        <div class="question-scroll" :style="dynamicSttAnswerScrollStyle">
          <textarea
            v-if="textMode"
            v-model="textAnswer"
            :style="textAnswerInputStyle"
            placeholder="답변을 직접 입력하세요..."
            @keydown.stop
          />
          <p v-else :style="dynamicSttAnswerTextStyle">
            {{ sttLog || '음성 답변 버튼을 눌러 답변을 시작하세요.' }}
          </p>
        </div>
      </div>

      <!-- 컨트롤 버튼 -->
      <div :style="controlsRowStyle">
        <div :style="iconControlBtnStyle" @click="replayQuestion" style="cursor:pointer">
          <v-icon color="rgba(255,255,255,0.7)" size="20">mdi-volume-high</v-icon>
        </div>

        <v-btn
          v-if="!recognizing"
          :style="primaryVoiceBtnStyle"
          @click="startSTT"
          :disabled="visible"
          elevation="0"
        >
          <v-icon left size="17">mdi-microphone</v-icon>
          음성 답변
        </v-btn>
        <v-btn
          v-else
          :style="stopVoiceBtnStyle"
          @click="startSTT"
          elevation="0"
        >
          <v-icon left size="17">mdi-stop-circle</v-icon>
          답변 중지
        </v-btn>

        <v-btn
          v-if="!visible"
          :style="nextQuestionBtnInlineStyle"
          @click="onAnswerComplete"
          :disabled="isSubmitting || (sttLog === '' && textAnswer === '')"
          elevation="0"
        >
          <v-icon left size="16">{{ isSubmitting ? 'mdi-loading mdi-spin' : 'mdi-arrow-right-circle' }}</v-icon>
          {{ isSubmitting ? '처리 중...' : (interviewSequence === interviewList.length ? '면접 종료' : '다음 질문') }}
        </v-btn>

        <div :style="keyboardBtnStyle" @click="textMode = !textMode" style="cursor:pointer">
          <v-icon :color="textMode ? '#5B6BFF' : 'rgba(255,255,255,0.5)'" size="20">mdi-keyboard-outline</v-icon>
        </div>
      </div>
    </div>
  </div>

  <AlertPopup v-model="alertVisible" :message="alertMessage" />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import '@mdi/font/css/materialdesignicons.css';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import AlertPopup from '@/components/common/AlertPopup.vue';
import * as axiosUtility from '../utility/axiosInstance';

const router = useRouter();
const alertVisible = ref(false);
const alertMessage = ref('');
const showAlert = (msg) => { alertMessage.value = msg; alertVisible.value = true; };

const interview1Video = 'https://cdn.i-poten.com/interview/interview1.mp4';
const interview2Video = 'https://cdn.i-poten.com/interview/interview2.mp4';
const interview3Video = 'https://cdn.i-poten.com/interview/interview3.mp4';
const interview4Video = 'https://cdn.i-poten.com/interview/interview4.mp4';
const answerVideoSources = [interview2Video, interview3Video, interview4Video];
const currentQuestionVideo = ref(interview2Video);
const selectRandomVideo = () => {
  currentQuestionVideo.value = answerVideoSources[Math.floor(Math.random() * answerVideoSources.length)];
};

// 면접 데이터
const interviewId = ref(null);
const interviewList = ref([]); // [{question, audioUrl}]
const collectedAnswers = ref([]); // [{question, answer}]

// 면접 상태
const start = ref(false);
const visible = ref(true);
const isLoading = ref(false);
const isSubmitting = ref(false);
const finished = ref(false);
const recognizing = ref(false);
const sttLog = ref('');
const interviewSequence = ref(1);
const remainingTime = ref(90);
const timer = ref(null);
const textAnswer = ref('');
const answerCardDark = ref(true);
const textMode = ref(false);

// 장치 토글
const useMic = ref(true);
const useCamera = ref(true);
const cameraAvailable = ref(false);

// 비디오 관련
const userVideo = ref(null);
const previewVideo = ref(null);
const smallPreview = ref(null);
const mediaChecked = ref(false);
const mediaStream = ref(null);
const interviewerVideo = ref(null);
const audioPlayer = ref(null);
const videoSequenceState = ref('idle');

// 카운트다운
const isStartingCountdown = ref(false);
const countdownValue = ref(3);
let countdownTimer = null;

// 질문 준비 카운트다운
const isQuestionPreparing = ref(false);
const questionPrepValue = ref(4);
let questionPrepTimer = null;

const startQuestionPrep = () => {
  return new Promise((resolve) => {
    isQuestionPreparing.value = true;
    questionPrepValue.value = 4;
    questionPrepTimer = setInterval(() => {
      if (questionPrepValue.value > 1) {
        questionPrepValue.value--;
      } else {
        clearInterval(questionPrepTimer);
        isQuestionPreparing.value = false;
        resolve();
      }
    }, 1000);
  });
};

// 현재 질문
const currentQuestion = computed(() => {
  const idx = interviewSequence.value - 1;
  return interviewList.value[idx] || null;
});

const formattedCurrentQuestion = computed(() => {
  const q = currentQuestion.value?.question || '';
  return q.replace(/([.?])/g, '$1<br>');
});

// 비디오 시퀀스
const onInterviewerVideoEnded = async () => {
  if (videoSequenceState.value === 'loading') {
    if (interviewerVideo.value) {
      interviewerVideo.value.currentTime = 0;
      try { await interviewerVideo.value.play(); } catch (e) {}
    }
  }
};

const playQuestionAudio = async (audioUrl) => {
  if (!audioUrl) return;
  if (videoSequenceState.value === 'loading' && interviewerVideo.value) {
    interviewerVideo.value.pause();
  }
  videoSequenceState.value = 'interview2';
  if (interviewerVideo.value) {
    interviewerVideo.value.loop = true;
    interviewerVideo.value.src = currentQuestionVideo.value;
    try { await interviewerVideo.value.play(); } catch (e) {}
  }
  if (!audioPlayer.value) audioPlayer.value = new Audio();
  audioPlayer.value.src = audioUrl;
  try { await audioPlayer.value.play(); } catch (e) {}
  audioPlayer.value.onended = async () => {
    videoSequenceState.value = 'interview1';
    if (interviewerVideo.value) {
      interviewerVideo.value.src = interview1Video;
      interviewerVideo.value.loop = true;
      try { await interviewerVideo.value.play(); } catch (e) {}
    }
    clearInterval(timer.value);
    remainingTime.value = 90;
    startTimer();
  };
};

const startLoadingVideo = async () => {
  videoSequenceState.value = 'loading';
  if (interviewerVideo.value) {
    interviewerVideo.value.loop = true;
    interviewerVideo.value.src = interview1Video;
    try { await interviewerVideo.value.play(); } catch (e) {}
  }
};

// 미디어 체크
const checkMediaReady = async () => {
  // 둘 다 꺼져 있으면 즉시 통과
  if (!useMic.value && !useCamera.value) {
    mediaChecked.value = true;
    cameraAvailable.value = false;
    return;
  }

  const constraints = { video: useCamera.value, audio: useMic.value };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraAvailable.value = useCamera.value;
    mediaChecked.value = true;
    mediaStream.value = stream;
    if (useCamera.value && previewVideo.value) previewVideo.value.srcObject = stream;
    if (useCamera.value) {
      await nextTick();
      if (smallPreview.value) smallPreview.value.srcObject = stream;
    }
    const label = useMic.value && useCamera.value
      ? '마이크와 카메라가 준비됐습니다.'
      : useMic.value
        ? '마이크가 준비됐습니다.'
        : '카메라가 준비됐습니다.';
    showAlert(label);
  } catch (_) {
    // 카메라+마이크 동시 요청 실패 → 마이크만 폴백
    if (useCamera.value && useMic.value) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        cameraAvailable.value = false;
        mediaChecked.value = true;
        mediaStream.value = stream;
        showAlert('카메라를 찾을 수 없어 마이크만으로 진행합니다.');
        return;
      } catch (_) {}
    }
    showAlert('장치에 접근할 수 없습니다. 브라우저 권한을 확인하세요.');
    mediaChecked.value = false;
  }
};

// 녹화
let recordingStream = null;
let recorder = null;
let chunks = [];
const startRecordingAuto = async () => {
  try {
    const hasVideo = cameraAvailable.value;
    const constraints = { video: hasVideo, audio: useMic.value || true };
    recordingStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (hasVideo && userVideo.value) userVideo.value.srcObject = recordingStream;
    chunks = [];
    const mimeType = hasVideo ? 'video/webm' : 'audio/webm';
    recorder = new MediaRecorder(recordingStream, { mimeType });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.start();
  } catch (e) {}
};
const stopRecordingAuto = () => {
  if (recorder && recorder.state === 'recording') {
    recorder.stop();
    if (recordingStream) recordingStream.getTracks().forEach(t => t.stop());
  }
};

// STT
let recognition;
const startSTT = () => {
  if (!recognition) return;
  if (recognizing.value) {
    recognition.stop();
  } else {
    sttLog.value = '';
    recognition.start();
  }
};

// 타이머
const startTimer = () => {
  clearInterval(timer.value);
  timer.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      clearInterval(timer.value);
      onAnswerComplete();
    }
  }, 1000);
};

const replayQuestion = () => {
  if (currentQuestion.value?.audioUrl) {
    playQuestionAudio(currentQuestion.value.audioUrl);
  }
};

// 면접 시작
const handleStartInterview = async () => {
  start.value = true;
  isStartingCountdown.value = true;
  countdownValue.value = 3;

  await nextTick();

  if (interviewerVideo.value) {
    interviewerVideo.value.src = interview1Video;
    interviewerVideo.value.loop = true;
    try { await interviewerVideo.value.play(); } catch (e) {}
  }
  await startRecordingAuto();

  countdownTimer = setInterval(async () => {
    if (countdownValue.value > 1) {
      countdownValue.value--;
    } else {
      clearInterval(countdownTimer);
      isStartingCountdown.value = false;

      // 첫 번째 질문 4초 준비
      await startQuestionPrep();
      selectRandomVideo();
      visible.value = false;
      if (currentQuestion.value?.audioUrl) {
        await playQuestionAudio(currentQuestion.value.audioUrl);
      } else {
        clearInterval(timer.value);
        remainingTime.value = 90;
        startTimer();
      }
    }
  }, 1000);
};

// 답변 완료
const onAnswerComplete = async () => {
  if (isSubmitting.value) return;

  clearInterval(timer.value);
  if (recognition && recognizing.value) recognition.stop();

  const finalAnswer = (sttLog.value + ' ' + textAnswer.value).trim();
  if (!finalAnswer) {
    showAlert('답변 내용이 없습니다. 음성 또는 텍스트로 답변을 입력해주세요.');
    return;
  }

  // 현재 Q&A 저장
  collectedAnswers.value.push({
    question: currentQuestion.value?.question || '',
    answer: finalAnswer,
  });

  sttLog.value = '';
  textAnswer.value = '';
  textMode.value = false;

  // 마지막 질문인지 확인
  if (interviewSequence.value >= interviewList.value.length) {
    // 면접 종료: 제출
    isLoading.value = true;
    stopRecordingAuto();
    try {
      const { springAxiosInstance } = axiosUtility.createAxiosInstances();
      await springAxiosInstance.post('/api/interview/normal/submit', {
        interviewId: interviewId.value,
        qaList: collectedAnswers.value,
      }, { withCredentials: true });

      finished.value = true;
      localStorage.setItem('personalityInterviewId', String(interviewId.value));
      router.push(`/ai-interview/personality-result/${interviewId.value}`);
    } catch (err) {
      console.error('인성 면접 제출 실패:', err);
      showAlert('답변 제출 중 오류가 발생했습니다.');
      isLoading.value = false;
    }
    return;
  }

  // 다음 질문으로
  interviewSequence.value++;
  visible.value = true;

  await startLoadingVideo();
  await nextTick();

  // 4초 질문 준비 후 다음 질문 재생
  await startQuestionPrep();
  visible.value = false;
  selectRandomVideo();
  if (currentQuestion.value?.audioUrl) {
    await playQuestionAudio(currentQuestion.value.audioUrl);
  } else {
    remainingTime.value = 90;
    startTimer();
  }
};

const handleBeforeUnload = () => {
  // 페이지 나가기 시 정리
};

onMounted(async () => {
  // 면접 데이터 로드
  const raw = localStorage.getItem('personalityInterviewData');
  if (!raw) {
    showAlert('면접 정보를 찾을 수 없습니다. 처음으로 돌아갑니다.');
    setTimeout(() => router.push('/ai-interview/personality-form'), 1500);
    return;
  }
  const data = JSON.parse(raw);
  interviewId.value = data.interviewId;
  interviewList.value = data.interviewList || [];

  if (!interviewList.value.length) {
    showAlert('질문 목록을 불러올 수 없습니다.');
    setTimeout(() => router.push('/ai-interview/personality-form'), 1500);
    return;
  }

  // 카메라 미리보기
  if (useCamera.value) {
    try {
      const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (previewVideo.value) previewVideo.value.srcObject = videoOnlyStream;
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => (recognizing.value = true);
      recognition.onend = () => (recognizing.value = false);
      recognition.onerror = () => (recognizing.value = false);
      recognition.onresult = (event) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
        }
        sttLog.value += final;
      };
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
  }
});

onBeforeUnmount(() => {
  if (audioPlayer.value) { audioPlayer.value.pause(); audioPlayer.value = null; }
  clearInterval(timer.value);
  clearInterval(questionPrepTimer);
  stopRecordingAuto();
  window.removeEventListener('beforeunload', handleBeforeUnload);
  localStorage.removeItem('personalityInterviewData');
});

onBeforeRouteLeave((to, from, next) => {
  if (start.value && !finished.value) {
    const answer = window.confirm('면접이 진행 중입니다. 페이지를 나가시겠습니까?');
    if (answer) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

// ===== 스타일 =====
if (typeof window !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes dot-blink { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes recording-pulse { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
    .question-scroll { overflow-y: auto; }
    .question-scroll::-webkit-scrollbar { width: 4px; }
    .question-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
  `;
  document.head.appendChild(styleTag);
}

const bgDecoStyle = {
  position: 'absolute', inset: 0,
  background: 'radial-gradient(ellipse at 20% 50%, rgba(91,107,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 50%)',
  pointerEvents: 'none', zIndex: 0,
};
const backgroundTextStyle = {
  position: 'absolute', fontSize: 'clamp(60px, 10vw, 140px)', fontWeight: '900',
  color: 'rgba(255,255,255,0.025)', whiteSpace: 'nowrap', left: '50%', top: '50%',
  transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0,
  letterSpacing: '0.1em', userSelect: 'none',
};
const interviewStartContainerStyle = {
  padding: '0', maxWidth: '100%', minHeight: '100vh', background: '#0D0D0F',
  position: 'relative', overflow: 'hidden', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};
const interviewActiveContainerStyle = {
  padding: '0', margin: '0', maxWidth: '100%', background: '#0D0D0F',
  height: '100vh', position: 'relative', overflow: 'hidden',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
};
const interviewStartWrapperStyle = {
  width: '80%', maxWidth: '1400px', margin: '0 auto',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  position: 'relative', zIndex: 1, gap: '16px',
  height: '100vh', padding: '28px 0', boxSizing: 'border-box',
};
const progressHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
};
const progressLabelStyle = {
  fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.7)',
  minWidth: '60px', letterSpacing: '0.05em',
};
const progressStatusStyle = {
  fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.5)',
  minWidth: '60px', textAlign: 'right',
};
const progressTimerStyle = {
  fontSize: '13px', fontWeight: '700', color: '#5B6BFF',
  minWidth: '48px', textAlign: 'right',
};
const progressBarWrapStyle = {
  flex: 1, height: '3px', background: 'rgba(255,255,255,0.1)',
  borderRadius: '4px', overflow: 'hidden',
};
const progressBarFillStyle = (pct) => ({
  height: '100%', width: `${pct}%`,
  background: 'linear-gradient(90deg, #5B6BFF 0%, #8b5cf6 100%)',
  borderRadius: '4px', transition: 'width 0.6s ease',
});
const mainCameraContainerStyle = {
  position: 'relative', width: '100%', aspectRatio: '16 / 9',
  background: '#111118', borderRadius: '20px', overflow: 'hidden',
  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const mainVideoStyle = {
  position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
  objectFit: 'cover', display: 'block',
};
const interviewerVideoStyle = {
  position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
  objectFit: 'cover', display: 'block',
};
const smallPreviewStyle = {
  position: 'absolute', top: '16px', right: '16px', width: '120px', height: '88px',
  borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.6)', background: '#000',
};
const smallVideoStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const topLeftBadgeStyle = {
  position: 'absolute', top: '16px', left: '16px',
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '6px 12px', background: 'rgba(0,0,0,0.55)', borderRadius: '100px',
  color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '600',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
};
const videoOverlayStyle = {
  position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
};
const overlayTextStyle = {
  marginTop: '16px', fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.45)',
};
const videoBottomOverlayStyle = {
  position: 'absolute', bottom: '0', left: '0', right: '0',
  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
  padding: '24px 24px 20px',
  display: 'flex', flexDirection: 'column', gap: '8px',
};
const qBadgeStyle = {
  display: 'inline-flex', alignItems: 'center',
  padding: '4px 12px', background: 'rgba(91,107,255,0.8)', borderRadius: '20px',
  color: 'white', fontSize: '11px', fontWeight: '700',
  letterSpacing: '0.05em', width: 'fit-content',
};
const questionScrollContainerStyle = {
  maxHeight: '80px', overflowY: 'auto',
};
const videoQuestionTextStyle = {
  fontSize: 'clamp(13px, 1.4vw, 16px)', fontWeight: '600',
  color: 'rgba(255,255,255,0.95)', lineHeight: '1.5', margin: '0',
};
const questionLoadingInlineStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
};
const loadingDotsInlineStyle = { display: 'flex', gap: '4px' };
const loadingDotStyle = {
  width: '5px', height: '5px', borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.7)', animation: 'dot-blink 1.4s infinite both',
};
const controlsRowStyle = {
  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center',
};
const primaryControlBtnStyle = {
  padding: '0 28px', height: '44px', borderRadius: '50px',
  background: 'linear-gradient(135deg, #5B6BFF 0%, #8b5cf6 100%)',
  color: 'white', fontSize: '14px', fontWeight: '700',
  textTransform: 'none', boxShadow: '0 8px 20px rgba(91,107,255,0.35)',
  letterSpacing: '0.02em',
};
const primaryVoiceBtnStyle = {
  padding: '0 24px', height: '44px', borderRadius: '50px',
  background: 'rgba(91,107,255,0.15)', color: '#8b9fff',
  border: '1px solid rgba(91,107,255,0.3)', fontSize: '14px', fontWeight: '600',
  textTransform: 'none',
};
const stopVoiceBtnStyle = {
  padding: '0 24px', height: '44px', borderRadius: '50px',
  background: 'rgba(239,68,68,0.15)', color: '#f87171',
  border: '1px solid rgba(239,68,68,0.3)', fontSize: '14px', fontWeight: '600',
  textTransform: 'none', animation: 'recording-pulse 1.5s infinite',
};
const nextQuestionBtnInlineStyle = {
  padding: '0 24px', height: '44px', borderRadius: '50px',
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: 'white', fontSize: '14px', fontWeight: '700',
  textTransform: 'none', boxShadow: '0 6px 16px rgba(16,185,129,0.3)',
};
const iconControlBtnStyle = {
  width: '44px', height: '44px', borderRadius: '50%',
  background: 'rgba(255,255,255,0.08)', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.12)',
};
const keyboardBtnStyle = {
  width: '44px', height: '44px', borderRadius: '50%',
  background: 'rgba(255,255,255,0.08)', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.12)',
};
const dynamicSttAnswerCardStyle = computed(() => ({
  width: '100%',
  background: answerCardDark.value
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(255,255,255,0.95)',
  borderRadius: '16px',
  border: answerCardDark.value
    ? '1px solid rgba(255,255,255,0.1)'
    : '1px solid rgba(0,0,0,0.08)',
  overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
  maxHeight: '130px', flexShrink: 0,
}));
const sttAnswerHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: '8px',
  padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
};
const dynamicSttAnswerLabelStyle = computed(() => ({
  fontSize: '12px', fontWeight: '700',
  color: answerCardDark.value ? 'rgba(255,255,255,0.7)' : '#475569',
  flex: 1,
}));
const recordingPillStyle = {
  display: 'flex', alignItems: 'center', gap: '5px',
  padding: '3px 10px', background: 'rgba(239,68,68,0.2)',
  borderRadius: '20px', color: '#f87171', fontSize: '11px', fontWeight: '600',
};
const recordingDotAnimStyle = {
  width: '6px', height: '6px', borderRadius: '50%',
  background: '#ef4444', animation: 'recording-pulse 1.5s infinite',
};
const answerThemeToggleStyle = {
  padding: '4px', borderRadius: '6px',
  background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
};
const dynamicSttAnswerScrollStyle = computed(() => ({
  padding: '10px 16px', overflowY: 'auto', flex: 1,
}));
const dynamicSttAnswerTextStyle = computed(() => ({
  fontSize: '13px', lineHeight: '1.6', margin: '0',
  color: answerCardDark.value ? 'rgba(255,255,255,0.75)' : '#334155',
  whiteSpace: 'pre-wrap',
}));
const textAnswerInputStyle = computed(() => ({
  width: '100%', border: 'none', outline: 'none', resize: 'none',
  background: 'transparent', fontSize: '13px', lineHeight: '1.6',
  color: answerCardDark.value ? 'rgba(255,255,255,0.85)' : '#334155',
  fontFamily: 'inherit', minHeight: '60px',
}));

// 카운트다운 스타일
const countdownOverlayStyle = {
  position: 'absolute', inset: '0',
  background: 'rgba(13, 13, 15, 0.9)', backdropFilter: 'blur(15px)',
  WebkitBackdropFilter: 'blur(15px)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
};
const countdownContentStyle = { animation: 'fadeIn 0.8s ease-out' };
const countdownLabelStyle = {
  fontSize: '14px', fontWeight: '800', color: '#5B6BFF',
  letterSpacing: '0.3em', marginBottom: '16px',
};
const countdownTitleStyle = {
  fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '40px', letterSpacing: '-0.02em',
};
const countdownNumberStyle = {
  fontSize: '120px', fontWeight: '900', color: 'white',
  lineHeight: '1', marginBottom: '40px', textShadow: '0 0 30px rgba(91, 107, 255, 0.3)',
};
const countdownProgressStyle = {
  width: '200px', height: '2px', background: 'rgba(255,255,255,0.1)',
  margin: '0 auto', borderRadius: '2px', overflow: 'hidden',
};
const countdownBarFillStyle = {
  width: '100%', height: '100%', background: '#5B6BFF', animation: 'shimmer 2s infinite linear',
};

const prepTextStyle = {
  fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.6)', margin: '0',
};

// 장치 토글 스타일
const deviceToggleBarStyle = {
  position: 'absolute', top: '20px', right: '24px', zIndex: 10,
  display: 'flex', gap: '8px',
};
const deviceToggleBtnStyle = (isOn) => ({
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '7px 14px', borderRadius: '100px',
  border: isOn ? '1px solid rgba(91,107,255,0.5)' : '1px solid rgba(255,255,255,0.12)',
  background: isOn ? 'rgba(91,107,255,0.18)' : 'rgba(255,255,255,0.06)',
  color: isOn ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
  transition: 'all 0.2s ease', letterSpacing: '-0.01em', userSelect: 'none',
});
</script>
