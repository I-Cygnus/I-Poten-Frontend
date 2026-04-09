<template>
  <!-- 로딩 -->
  <LoadingSpinner v-if="isLoading"/>

  <!-- 면접 준비 화면 -->
  <div v-else-if="!start" :style="interviewStartContainerStyle">
    <div :style="bgDecoStyle"></div>
    <div :style="backgroundTextStyle">AI INTERVIEW</div>

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

        <!-- 미확인 오버레이 -->
        <div :style="videoOverlayStyle" v-if="!mediaChecked && (useMic || useCamera)">
          <v-icon size="56" color="rgba(255,255,255,0.25)">{{ useMic ? 'mdi-microphone-outline' : 'mdi-video-outline' }}</v-icon>
          <p :style="overlayTextStyle">
            {{ useMic && useCamera ? '마이크·카메라 확인이 필요합니다' : useMic ? '마이크 확인이 필요합니다' : '카메라 확인이 필요합니다' }}
          </p>
        </div>

        <!-- 장치 없음 플레이스홀더 (확인 완료 + 카메라 없거나 꺼진 경우) -->
        <div :style="videoOverlayStyle" v-else-if="mediaChecked && !cameraAvailable">
          <v-icon size="56" color="rgba(255,255,255,0.15)">mdi-account-outline</v-icon>
          <p :style="overlayTextStyle">{{ !useCamera ? '카메라 미사용' : '카메라 없음' }} · {{ useMic ? '마이크로 진행' : '장치 없이 진행' }}</p>
        </div>

        <!-- PiP (카메라 있을 때만) -->
        <div :style="smallPreviewStyle" v-if="mediaChecked && cameraAvailable">
          <video ref="smallPreview" autoplay playsinline muted :style="smallVideoStyle" />
        </div>

        <!-- 상태 뱃지 (좌측 상단) -->
        <div :style="topLeftBadgeStyle">
          <v-icon size="11" :color="mediaChecked ? '#10b981' : 'rgba(255,255,255,0.4)'">mdi-circle</v-icon>
          <span>{{ !mediaChecked ? '확인 필요' : cameraAvailable ? '카메라·마이크 준비 완료' : useMic ? '마이크 준비 완료' : '준비 완료' }}</span>
        </div>

        <!-- 하단 오버레이 -->
        <div :style="videoBottomOverlayStyle">
          <div :style="qBadgeStyle">PREP</div>
          <div :style="questionScrollContainerStyle" class="question-scroll">
            <p :style="videoQuestionTextStyle">
              {{ !mediaChecked && (useMic || useCamera)
                ? '우측 상단 토글로 사용할 장치를 선택하고 확인 버튼을 눌러주세요.'
                : cameraAvailable
                  ? '카메라와 마이크가 준비됐습니다. 면접을 시작하세요.'
                  : useMic
                    ? '마이크가 준비됐습니다. 면접을 시작하세요.'
                    : '장치 없이 진행합니다. 면접을 시작하세요.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 컨트롤 버튼 -->
      <div :style="controlsRowStyle">
        <template v-if="!mediaChecked">
          <v-btn :style="primaryControlBtnStyle" elevation="0" @click="checkMediaReady">
            <v-icon left size="18">{{ useMic || useCamera ? 'mdi-check-circle-outline' : 'mdi-play-circle' }}</v-icon>
            {{ !useMic && !useCamera ? '장치 없이 시작' : useMic && useCamera ? '마이크·카메라 확인' : useMic ? '마이크 확인' : '카메라 확인' }}
          </v-btn>
        </template>
        <template v-else>
          <div :style="iconControlBtnStyle" @click="startRecording" style="cursor:pointer">
            <v-icon color="rgba(255,255,255,0.7)" size="22">mdi-waveform</v-icon>
          </div>
          <v-btn :style="primaryControlBtnStyle" elevation="0" @click="handleStartInterview">
            <v-icon left size="18">mdi-play-circle</v-icon>
            면접 시작
          </v-btn>
          <div :style="iconControlBtnStyle" @click="playRecording" style="cursor:pointer">
            <v-icon color="rgba(255,255,255,0.7)" size="22">mdi-play</v-icon>
          </div>
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
        <span :style="progressLabelStyle">{{ interviewSequence }} / 6</span>
        <div :style="progressBarWrapStyle">
          <div :style="progressBarFillStyle(interviewSequence / 6 * 100)"></div>
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

        <!-- 사용자 PiP (우측 상단, 카메라 있을 때만) -->
        <div :style="smallPreviewStyle" v-if="cameraAvailable">
          <video ref="userVideo" autoplay playsinline muted :style="smallVideoStyle"></video>
        </div>

        <!-- 타이머 (좌측 상단) -->
        <div :style="topLeftBadgeStyle">
          <v-icon size="11" color="rgba(255,255,255,0.6)">mdi-clock-outline</v-icon>
          <span>{{ Math.floor(remainingTime / 60) }}:{{ (remainingTime % 60).toString().padStart(2, '0') }}</span>
        </div>

        <!-- 하단 오버레이: 질문 표시 -->
        <div :style="videoBottomOverlayStyle">
          <div :style="qBadgeStyle">Q{{ interviewSequence }}</div>
          <div v-if="visible" :style="questionLoadingInlineStyle">
            <p :style="videoQuestionTextStyle">{{ isGenerating ? '답변 준비중입니다' : '면접 질문을 준비 중입니다' }}</p>
            <div :style="loadingDotsInlineStyle">
              <div :style="loadingDotStyle"></div>
              <div :style="loadingDotStyle"></div>
              <div :style="loadingDotStyle"></div>
            </div>
          </div>
          <div v-else :style="questionScrollContainerStyle" class="question-scroll">
            <p :style="videoQuestionTextStyle" v-html="formattedAIMessage"></p>
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
          <!-- 다크/라이트 토글 -->
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

      <!-- 컨트롤 버튼 (한 줄) -->
      <div :style="controlsRowStyle">
        <div :style="iconControlBtnStyle" @click="replayQuestion" style="cursor:pointer">
          <v-icon color="rgba(255,255,255,0.7)" size="20">mdi-volume-high</v-icon>
        </div>

        <v-btn
          v-if="!recognizing"
          :style="primaryVoiceBtnStyle"
          @click="startSTT"
          :disabled="isGenerating || visible"
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
          :disabled="isGenerating || (sttLog === '' && textAnswer === '')"
          elevation="0"
        >
          <v-icon left size="16">{{ isGenerating ? 'mdi-loading mdi-spin' : 'mdi-arrow-right-circle' }}</v-icon>
          {{ isGenerating ? '처리 중...' : (interviewSequence === 6 ? '면접 종료' : '다음 질문') }}
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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useAiInterviewStore } from "../stores/aiInterviewStore";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import "@mdi/font/css/materialdesignicons.css";
import { useHead } from '@vueuse/head'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import AlertPopup from '@/components/common/AlertPopup.vue';
import { clearInterviewSessionToken } from '@/utils/sessionToken';

const alertVisible = ref(false);
const alertMessage = ref('');
const showAlert = (msg) => { alertMessage.value = msg; alertVisible.value = true; };
const interview1Video = 'https://cdn.i-poten.com/interview/interview1.mp4';
const interview2Video = 'https://cdn.i-poten.com/interview/interview2.mp4';
const interview3Video = 'https://cdn.i-poten.com/interview/interview3.mp4';
const interview4Video = 'https://cdn.i-poten.com/interview/interview4.mp4';

const answerVideoSources = [interview2Video, interview3Video, interview4Video];
const currentQuestionVideo = ref(interview2Video);

// 랜덤 영상 선택 함수 (신규 질문 시 호출)
const selectRandomVideo = () => {
  const randomIndex = Math.floor(Math.random() * answerVideoSources.length);
  currentQuestionVideo.value = answerVideoSources[randomIndex];
};





useHead({
  title: "AI 모의 면접 시작 | I-Poten",
  meta: [
    { name: "description", content: "AI 기반 모의 면접을 진행하고, 원하는 기업, 직무에 대한 기술 면접을 대비해보세요." },
    { name: "keywords", content: "AI 면접, 모의 면접, 기술 면접, AI 기반 모의 면접, 카메라 테스트, 면접 준비, 온라인 면접, 비대면 면접, 인공지능 면접, JobStick, job-stick, 잡스틱, 개발자 플랫폼, 개발자 취업" },
    { property: "og:title", content: "AI 모의 면접 준비 - 잡스틱(JobStick)" },
    { property: "og:description", content: "잡스틱(JobStick)에서 AI 기반의 실전 면습 연습을 통해 기술 면접의 실전 감각을 길러보세요." },
    { property: "og:image", content: "" },
    { name: "robots", content: "index, follow" },
  ],
});



// ======= script 로직 (전부) =======
const router = useRouter();
const aiInterviewStore = useAiInterviewStore();

const textAnswer = ref(""); // 텍스트 입력용 변수 추가
const answerCardDark = ref(true); // 내 답변 카드 다크/라이트 모드
const textMode = ref(false); // 키보드 텍스트 입력 모드

const start = ref(false);
const bypassLeaveGuard = ref(false);
const visible = ref(true);
const isLoading = ref(false);
const finished = ref(false);
const recognizing = ref(false);
const sttLog = ref("");
const currentAIMessage = ref("");
const currentQuestionId = ref(1);
const interviewSequence = ref(1);
const currentInterviewId = ref(null);
const remainingTime = ref(90);
const timer = ref(null);
const maxQuestionId = ref(10);
const startMessage = ref("");
const userVideo = ref(null);
const mediaChecked = ref(false);
const cameraAvailable = ref(false);
const useMic = ref(true);
const useCamera = ref(true);
const previewVideo = ref(null);
const mediaStream = ref(null);
const isGenerating = ref(false);
const isEnded = ref(false);
const interviewerVideo = ref(null);
const currentAudioUrl = ref('');
const audioPlayer = ref(null);
const videoSequenceState = ref('idle'); // 'idle', 'interview2', 'interview1', 'loading'

// 카운트다운 관련 refs
const isStartingCountdown = ref(false);
const countdownValue = ref(3);
let countdownTimer = null;

// 맨 위로 스크롤
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const mapCompanyName = (original) => {
  if (!original) return "";
  const mapping = {
    당근마켓: "danggeun",
    Toss: "toss",
    "SK-encore": "sk_encore",
    "KT M mobile": "kt_mobile",
  };
  return mapping[original] || original.toLowerCase().replace(/[\s-]+/g, "_");
};

// 비디오 재생 종료 시 처리
const onInterviewerVideoEnded = async () => {
  console.log('Video ended, current state:', videoSequenceState.value);
  if (videoSequenceState.value === 'loading') {
    // loading 비디오는 반복 재생
    if (interviewerVideo.value) {
      interviewerVideo.value.currentTime = 0;
      try {
        await interviewerVideo.value.play();
      } catch (err) {
        console.error('로딩 비디오 재생 실패:', err);
      }
    }
  }
};

// 오디오 재생 및 비디오 시퀀스 시작
const playQuestionAudio = async (audioUrl) => {
  console.log('Playing question audio:', audioUrl);
  if (!audioUrl) return;

  // 로딩 비디오 중지
  if (videoSequenceState.value === 'loading' && interviewerVideo.value) {
    interviewerVideo.value.pause();
  }

  // 선택된 랜덤 면접관 답변 영상 재생 시작 (음성 재생 시에만)
  videoSequenceState.value = 'interview2';
  if (interviewerVideo.value) {
    console.log('Playing answering animation:', currentQuestionVideo.value);
    interviewerVideo.value.loop = true; // 음성 길이에 맞춰 루프 재생
    interviewerVideo.value.src = currentQuestionVideo.value;
    try {
      await interviewerVideo.value.play();
    } catch (err) {
      console.error('비디오 재생 실패:', err);
    }
  }

  // 오디오 재생
  if (!audioPlayer.value) {
    audioPlayer.value = new Audio();
  }

  audioPlayer.value.src = audioUrl;
  try {
    await audioPlayer.value.play();
  } catch (err) {
    console.error('오디오 재생 실패:', err);
  }

  // 오디오 종료 시 처리
  audioPlayer.value.onended = async () => {
    console.log('Audio ended, switching to idle (interview1)');

    // 다시 기본 대기 상태(interview1)로 전환
    videoSequenceState.value = 'interview1';
    if (interviewerVideo.value) {
      interviewerVideo.value.src = interview1Video;
      interviewerVideo.value.loop = true;
      try {
        await interviewerVideo.value.play();
      } catch (err) {
        console.error('interview1 재생 실패:', err);
      }
    }

    clearInterval(timer.value);
    remainingTime.value = 90;
    startTimer();
  };
};

// 로딩 비디오 시작
const startLoadingVideo = async () => {
  console.log('Starting loading video');
  videoSequenceState.value = 'loading';
  if (interviewerVideo.value) {
    interviewerVideo.value.loop = true;
    interviewerVideo.value.src = interview1Video; // "나머지는 interview1" 이라는 요청에 따라 interview1 사용
    try {
      await interviewerVideo.value.play();
    } catch (err) {
      console.error('로딩 비디오 재생 실패:', err);
    }
  }
};

// 토글 변경 시 기존 스트림 해제 및 확인 상태 초기화
watch([useMic, useCamera], () => {
  mediaChecked.value = false;
  cameraAvailable.value = false;
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((t) => t.stop());
    mediaStream.value = null;
  }
  if (previewVideo.value) previewVideo.value.srcObject = null;
  // 둘 다 꺼져 있으면 확인 불필요
  if (!useMic.value && !useCamera.value) mediaChecked.value = true;
});

const checkMediaReady = async () => {
  // 둘 다 꺼져 있으면 즉시 통과
  if (!useMic.value && !useCamera.value) {
    mediaChecked.value = true;
    return;
  }

  // 요청할 제약 조건
  const constraints = { video: useCamera.value, audio: useMic.value };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraAvailable.value = useCamera.value;
    mediaChecked.value = true;
    mediaStream.value = stream;
    if (previewVideo.value) previewVideo.value.srcObject = stream;
    if (useCamera.value) {
      await nextTick();
      if (smallPreview.value) smallPreview.value.srcObject = stream;
    }
    const label = useMic.value && useCamera.value
      ? "마이크와 카메라가 준비됐습니다."
      : useMic.value
        ? "마이크가 준비됐습니다."
        : "카메라가 준비됐습니다.";
    showAlert(label);
    return;
  } catch (_) {
    // 카메라+마이크 동시 요청 실패 → 마이크만 폴백 (둘 다 요청한 경우만)
    if (useCamera.value && useMic.value) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        cameraAvailable.value = false;
        mediaChecked.value = true;
        mediaStream.value = stream;
        showAlert("카메라를 찾을 수 없어 마이크만으로 진행합니다.");
        return;
      } catch (_) {}
    }
    showAlert("장치에 접근할 수 없습니다. 브라우저 권한을 확인하세요.");
    mediaChecked.value = false;
  }
};

const recordedVideo = ref(null);
const recordedBlob = ref(null);
const smallPreview = ref(null);
let recordingStream = null;
let recorder = null;
let chunks = [];
const startRecording = async () => {
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({
      video: cameraAvailable.value,
      audio: true,
    });
    if (cameraAvailable.value) {
      if (previewVideo.value) previewVideo.value.srcObject = recordingStream;
      if (smallPreview.value) smallPreview.value.srcObject = recordingStream;
    }

    chunks = [];
    const mimeType = cameraAvailable.value ? "video/webm" : "audio/webm";
    recorder = new MediaRecorder(recordingStream, { mimeType });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const type = cameraAvailable.value ? "video/webm" : "audio/webm";
      recordedBlob.value = new Blob(chunks, { type });
      const videoURL = URL.createObjectURL(recordedBlob.value);
      localStorage.setItem("interviewRecordingUrl", videoURL);
      if (cameraAvailable.value && previewVideo.value) {
        previewVideo.value.srcObject = null;
        previewVideo.value.src = videoURL;
        previewVideo.value.controls = true;
        previewVideo.value.play();
      }
    };
    recorder.start();
    showAlert("녹화를 시작합니다");
  } catch (err) {
    console.error("🎥 녹화 시작 실패:", err);
    showAlert("녹화 시작 중 오류가 발생했습니다.");
  }
};
const stopRecording = () => {
  if (recorder && recorder.state === "recording") {
    recorder.stop();
    if (recordingStream) {
      recordingStream.getTracks().forEach((track) => track.stop());
    }
    showAlert("녹화 종료됨");
  }
};

let recognition;

onMounted(async () => {
  // 초기 비디오 설정 (interview1.mp4를 기본으로 표시)
  // start가 false일 때는 interviewerVideo가 없으므로 handleStartInterview에서 처리하도록 함

  if (useCamera.value) {
    try {
      const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (previewVideo.value) previewVideo.value.srcObject = videoOnlyStream;
    } catch (_) {
      // 카메라 없어도 정상 진행
    }
  }
  if (typeof window !== "undefined") {
    speakStartMessage();

    await nextTick();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showAlert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => (recognizing.value = true);
    recognition.onend = () => (recognizing.value = false);
    recognition.onerror = () => (recognizing.value = false);
    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      sttLog.value += finalTranscript;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
  }
});

const showWarning = ref(true);

const speakStartMessage = () => {
  startMessage.value = `
    <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
      <div style="margin-bottom: 10px; font-size: 14px; font-weight: 600; color: #1565c0;">
        <span style="display: block; margin-bottom: 4px; font-size: 15px;">AI 모의 면접 준비</span>
        아래 순서대로 진행해주세요
      </div>

      <div style="margin-bottom: 8px; padding: 6px 10px; background: #e3f2fd; border-radius: 6px; width: 100%;">
        <p style="margin: 0; font-weight: 500; font-size: 12px;">1. <mark style="background: #bbdefb; padding: 1px 4px; border-radius: 3px;">카메라/마이크 확인</mark> 버튼 클릭</p>
      </div>

      <div style="margin-bottom: 8px; padding: 6px 10px; background: #e8f5e9; border-radius: 6px; width: 100%;">
        <p style="margin: 0; font-weight: 500; font-size: 12px;">2. <mark style="background: #c8e6c9; padding: 1px 4px; border-radius: 3px;">녹화 테스트</mark> 진행</p>
      </div>

      <div style="margin-bottom: 10px; padding: 6px 10px; background: #fff8e1; border-radius: 6px; width: 100%;">
        <p style="margin: 0; font-weight: 500; font-size: 12px;">3. <mark style="background: #ffecb3; padding: 1px 4px; border-radius: 3px;">면접 시작</mark> 버튼 클릭</p>
      </div>

      ${showWarning.value ?
        '<div style="margin-top: 6px; padding: 6px 8px; background: #ffebee; border-left: 3px solid #f44336; border-radius: 4px; text-align: left;">' +
        '<p style="margin: 0; color: #c62828; font-weight: 600; display: flex; align-items: center; font-size: 12px;">' +
        '<span style="margin-right: 4px; font-size: 14px;">⚠️</span>' +
        '카메라/마이크 확인 필요</p>' +
        '</div>' :
        '<div style="margin-top: 6px; padding: 6px 8px; background: #e8f5e9; border-left: 3px solid #4caf50; border-radius: 4px; text-align: left;">' +
        '<p style="margin: 0; color: #2e7d32; font-weight: 600; display: flex; align-items: center; font-size: 12px;">' +
        '<span style="margin-right: 4px; font-size: 14px;">✅</span>' +
        '준비 완료 - 면접 시작 가능</p>' +
        '</div>'
      }
    </div>
  `;
};

const formattedAIMessage = computed(() => {
  return currentAIMessage.value.replace(/([.?])/g, "$1<br>");
});

const replayQuestion = () => {
  if (currentAudioUrl.value) {
    playQuestionAudio(currentAudioUrl.value);
  }
};

const handleBeforeUnload = (event) => {
  clearInterviewSessionToken();
  if (start.value && !finished.value) {
    event.preventDefault();
    event.returnValue = "면접이 진행 중입니다. 페이지를 나가시겠습니까?";
  }
};

const speakCurrentMessage = () => {
  if (currentAudioUrl.value) {
    playQuestionAudio(currentAudioUrl.value);
  }
};

const showStartMessage = () => {
  visible.value = false;
  speakCurrentMessage();
};

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

const startSTT = () => {
  if (!recognition) return;

  if (recognizing.value) {
    // STT 중지
    recognition.stop();
  } else {
    // STT 시작
    sttLog.value = "";
    recognition.start();
  }
};
const startRecordingAuto = async () => {
  if (!useMic.value && !useCamera.value) return;
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({
      video: useCamera.value && cameraAvailable.value,
      audio: useMic.value,
    });
    if (useCamera.value && cameraAvailable.value && userVideo.value) {
      userVideo.value.srcObject = recordingStream;
    }
    chunks = [];
    const mimeType = (useCamera.value && cameraAvailable.value) ? "video/webm" : "audio/webm";
    recorder = new MediaRecorder(recordingStream, { mimeType });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      const type = (useCamera.value && cameraAvailable.value) ? "video/webm" : "audio/webm";
      recordedBlob.value = new Blob(chunks, { type });
      const videoURL = URL.createObjectURL(recordedBlob.value);
      localStorage.setItem("interviewRecordingUrl", videoURL);
    };
    recorder.start();
    console.log("녹화 시작");
  } catch (err) {
    console.error("녹화 실패");
  }
};
const stopRecordingAuto = () => {
  if (recorder && recorder.state === "recording") {
    recorder.stop();
    if (recordingStream) {
      recordingStream.getTracks().forEach((track) => track.stop());
    }
    console.log("녹화 종료");
  }
};

const handleStartInterview = async () => {
  const info = JSON.parse(localStorage.getItem("interviewInfo") || "{}");
  const processedCompanyName = mapCompanyName(info.company);
  console.log(JSON.stringify(info, null, 2));

  if (!info.job || !info.career) {
    showAlert("면접 정보를 찾을 수 없습니다. 처음으로 돌아갑니다.");
    bypassLeaveGuard.value = true;
    router.push("/ai-interview/select");
    return;
  }

  start.value = true;
  isStartingCountdown.value = true;
  countdownValue.value = 3;

  await nextTick(); // DOM 업데이트 대기 (비디오 엘리먼트 생성)

  // 초기 면접관 비디오 설정
  if (interviewerVideo.value) {
    interviewerVideo.value.src = interview1Video;
    interviewerVideo.value.loop = true;
    try {
      await interviewerVideo.value.play();
    } catch (err) {
      console.error('면접관 비디오 초기 재생 실패:', err);
    }
  }

  await startRecordingAuto();

  showWarning.value = false;
  speakStartMessage();

  // 3초 카운트다운 시작
  countdownTimer = setInterval(() => {
    if (countdownValue.value > 1) {
      countdownValue.value--;
    } else {
      clearInterval(countdownTimer);
      isStartingCountdown.value = false;

      // 첫 번째 질문 시작
      interviewSequence.value = 1;
      currentAIMessage.value = "안녕하세요 간단하게 자기소개 부탁드릴게요";
      // 지정해주신 첫 번째 질문 오디오 URL
      currentAudioUrl.value = "https://cdn.i-poten.com/questions/fix/3aa8f8fd-db2d-475a-819f-2e61dc1d635a.mp3";

      selectRandomVideo(); // 랜덤 영상 선택
      showStartMessage();
    }
  }, 1000);
};



const onAnswerComplete = async () => {
  isGenerating.value = true;
  textMode.value = false;

  // 로딩 비디오 시작
  startLoadingVideo();
  visible.value = true; // 질문 로딩 메시지 표시

  clearInterval(timer.value);
  if (recognition && recognizing.value) recognition.stop();

  const finalAnswer = (sttLog.value + " " + textAnswer.value).trim();

  if (!finalAnswer) {
    showAlert("답변 내용이 없습니다. 음성 또는 텍스트로 답변을 입력해주세요.");
    isGenerating.value = false;
    videoSequenceState.value = 'idle';
    visible.value = false;
    return;
  }

  const info = JSON.parse(localStorage.getItem("interviewInfo") || "{}");
  const processedCompanyName = mapCompanyName(info.company);

  // 첫 번째 질문(자기소개)에 대한 답변인 경우
  if (interviewSequence.value === 1) {
    // 면접 생성 API 호출 (자기소개 답변 포함)
    console.log("=== 면접 생성 요청 데이터 ===");
    console.log("interviewType:", info.interviewType);
    console.log("company:", info.company);
    console.log("major:", info.major);
    console.log("career:", info.career);
    console.log("projectExp:", info.projectExp);
    console.log("job:", info.job);
    console.log("interviewAccountProjectRequests:", info.interviewAccountProjectRequests);
    console.log("techStacks:", info.techStacks);
    console.log("firstQuestion:", "안녕하세요 자기소개 부탁드립니다.");
    console.log("firstAnswer:", finalAnswer);

    const res = await aiInterviewStore.requestCreateInterviewToSpring({
      interviewType: info.interviewType,
      company: info.company || "",
      major: info.major,
      career: info.career,
      projectExp: info.projectExp,
      job: info.job,
      interviewAccountProjectRequests: info.interviewAccountProjectRequests || [],
      techStacks: info.techStacks,
      firstQuestion: "안녕하세요 자기소개 부탁드립니다.",
      firstAnswer: finalAnswer,
    });

    currentInterviewId.value = Number(res.interviewId);
    currentQuestionId.value = res.interviewQAId;

    // API 응답에서 오디오 URL과 텍스트 분리
    currentAudioUrl.value = res.interviewQuestion || ''; // 오디오 URL
    currentAIMessage.value = res.interviewQuestionText || res.interviewQuestion || ''; // 텍스트

    // localStorage에 interviewId 저장 (결과 페이지에서 사용)
    localStorage.setItem("currentInterviewId", String(res.interviewId));

    sttLog.value = "";
    textAnswer.value = "";
    visible.value = false; // 로딩 메시지 숨기기
    isGenerating.value = false;

    // 랜덤 영상 선택 후 재생 및 비디오 시퀀스 시작
    selectRandomVideo();
    playQuestionAudio(currentAudioUrl.value);

  } else{
    // 이후 질문들에 대한 처리
    console.log("=== 답변 진행 요청 데이터 ===");
    console.log("interviewId:", currentInterviewId.value);
    console.log("interviewQAId:", currentQuestionId.value);
    console.log("answer:", finalAnswer);
    console.log("interviewType:", info.interviewType);
    console.log("interviewSequence:", interviewSequence.value);

    // 6번째 질문이면 면접 종료 페이지로 이동
    if(interviewSequence.value === 6){
      isLoading.value = true;

      // 면접 종료 데이터 저장
      localStorage.setItem("interviewEndData", JSON.stringify({
        interviewId: currentInterviewId.value,
        interviewQAId: currentQuestionId.value,
        lastAnswer: finalAnswer
      }));

      nextTick(() => {
        setTimeout(() => {
          router.push("/ai-interview/end");
        }, 5000); // n초 후 이동
      });

      return;
    }

    const payload = {
      interviewId: currentInterviewId.value,
      interviewQAId: currentQuestionId.value,
      answer: finalAnswer,
      interviewType: info.interviewType,
      interviewSequence: interviewSequence.value
    };

    const questionRes = await aiInterviewStore.requestCreateAnswerToSpring(payload);


    if (!questionRes.interviewQuestion || !questionRes.interviewQAId) {
      showAlert("다음 질문을 불러오지 못했습니다.");
      isGenerating.value = false;
      return;
    }

    currentQuestionId.value = questionRes.interviewQAId;

    // API 응답에서 오디오 URL과 텍스트 분리
    currentAudioUrl.value = questionRes.interviewQuestion || ''; // 오디오 URL
    currentAIMessage.value = questionRes.interviewQuestionText || questionRes.interviewQuestion || ''; // 텍스트

    sttLog.value = "";
    textAnswer.value = "";
    visible.value = false; // 로딩 메시지 숨기기

    // 랜덤 영상 선택 후 재생 및 비디오 시퀀스 시작
    selectRandomVideo();
    playQuestionAudio(currentAudioUrl.value);

    isGenerating.value = false;
  }
  interviewSequence.value = interviewSequence.value + 1;

}


onBeforeUnmount(() => {
  // 면접이 완료되지 않은 상태로 페이지를 떠나는 경우 세션 토큰 삭제
  if (start.value && !finished.value) {
    clearInterviewSessionToken();
  }

  // 오디오 재생 중지
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value = null;
  }

  localStorage.removeItem("interviewInfo");
  clearInterval(timer.value);
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

onBeforeRouteLeave((to, from, next) => {
  // 코드에서 강제 이동하는 경우 (정보 없음 등) 경고 없이 통과
  if (bypassLeaveGuard.value) {
    bypassLeaveGuard.value = false;
    next();
    return;
  }

  // 면접 종료 후 결과 페이지로 이동하는 경우 경고 없이 통과
  if (interviewSequence.value === 6 || to.path === '/ai-interview/end') {
    next();
    return;
  }

  const message = start.value
    ? "면접이 진행 중입니다. 페이지를 나가면 면접이 종료됩니다. 나가시겠습니까?"
    : "면접 페이지를 나가시겠습니까? 면접 정보가 초기화됩니다.";

  const answer = window.confirm(message);
  if (answer) {
    if (start.value) {
      clearInterviewSessionToken();
    }
    next();
  } else {
    next(false);
  }
});
const playRecording = () => {
  if (recordedBlob.value) {
    const videoURL = URL.createObjectURL(recordedBlob.value);
    if (previewVideo.value) {
      previewVideo.value.srcObject = null;
      previewVideo.value.src = videoURL;
      previewVideo.value.controls = true;
      previewVideo.value.play();
    }
  }
};



// ==== 스타일 상수 (생략없이 전체) ====
const interviewContainerStyle = {
  marginTop: "32px",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  padding: "16px",
  borderRadius: "16px",
  width: "70%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  background: "#fff",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
};
const mt16Style = { marginTop: "16px" };
const mt4Style = { marginTop: "16px" };

// 새로운 스타일 객체 추가
const mainContentStyle = {
  display: "grid",
  gridTemplateColumns: "1.3fr 1fr",
  gap: "2.5vw",
  marginTop: "2vh",
  marginBottom: "2vh",
  width: "100%",
  "@media (max-width: 968px)": {
    gridTemplateColumns: "1fr",
    gap: "2vh"
  }
};

// 면접 준비 화면 스타일
const interviewProgressStyle = {
  width: "100%",
  marginBottom: "2vh"
};

const progressBarStyle = {
  height: "4px",
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  borderRadius: "12px",
  marginBottom: "1.5vh",
  position: "relative",
  overflow: "hidden"
};

const progressFillStyle = (percent) => ({
  position: "absolute",
  left: "0",
  top: "0",
  height: "100%",
  width: `${percent}%`,
  background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
  borderRadius: "12px",
  transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
});

const stepActiveStyle = {
  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
  borderColor: "rgba(59, 130, 246, 0.4)",
  boxShadow: "0 6px 16px rgba(59, 130, 246, 0.2)",
  transform: "scale(1.05)"
};

const stepArrowStyle = {
  fontSize: "20px",
  color: "#cbd5e1",
  fontWeight: "300",
  margin: "0 0.5vw"
};

const sectionTitleStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#1a202c",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const questionDisplayStyle = {
  marginBottom: "2.5vh",
  textAlign: "center"
};

const statusIconStyle = {
  marginRight: "12px",
  marginTop: "2px"
};

const statusContentStyle = {
  flex: "1"
};

const statusTitleStyle = {
  margin: "0 0 4px 0",
  fontSize: "14px",
  fontWeight: "700",
  color: "#1a202c"
};

const statusTextStyle = {
  margin: "0",
  fontSize: "13px",
  color: "#4a5568",
  lineHeight: "1.5"
};

const cameraPreviewSectionStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column"
};

const infoSectionStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const controlSectionStyle = {
  marginTop: "16px",
  borderTop: "1px solid rgba(0, 0, 0, 0.05)",
  paddingTop: "16px"
};

const questionTextDisplayStyle = {
  fontSize: "16px",
  color: "#1e293b",
  fontWeight: "500",
  lineHeight: "1.6",
  margin: "0",
  maxWidth: "800px",
  marginLeft: "auto",
  marginRight: "auto"
};

const startDisclaimerStyle = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0",
  fontWeight: "500",
  textAlign: "center"
};

const cameraStatusBadgeStyle = {
  position: "absolute",
  top: "16px",
  right: "16px",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "white",
  padding: "8px 16px",
  borderRadius: "20px",
  fontSize: "14px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backdropFilter: "blur(10px)",
  boxShadow: "0 6px 16px rgba(16, 185, 129, 0.4)"
};

const cameraSectionTextStyle = {
  marginLeft: "24px",
};

const buttonGroupStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "12px",
  marginTop: "12px"
};

const cameraCardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap"
}
const sendButtonStyle = {
  padding: "12px 20px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: "24px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  height: "44px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "120px",
  boxSizing: "border-box",
  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
};
const plainButtonStyle = {
  padding: "12px 20px",
  backgroundColor: "white",
  color: "#1a202c",
  border: "2px solid rgba(102, 126, 234, 0.2)",
  borderRadius: "24px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  height: "44px",
  minWidth: "120px",
  boxSizing: "border-box",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
};
const videoWrapStyle = {
  width: "75%",
  margin: "0 auto",
  paddingTop: "16px"
};
const videoRowStyle = {
  marginTop: "24px",
  marginBottom: "24px"
};
const colRightStyle = {
  display: "flex",
  justifyContent: "flex-end",
  padding: 0
};
const colLeftStyle = {
  display: "flex",
  justifyContent: "flex-start",
  padding: 0
};
const colSpacerStyle = {
  maxWidth: "16px",
  padding: 0
};
const videoBoxStyle = {
  width: "100%",
  aspectRatio: "4 / 3",
  border: "3px solid rgba(102, 126, 234, 0.3)",
  borderRadius: "16px",
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#000",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)"
};
const interviewerImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};
const userVideoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};
const centeredColStyle = {
  maxWidth: "100%",
  display: "flex",
  justifyContent: "center",
  padding: 0,
  marginTop: "16px"
};
const centeredTextBoxStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center"
};
const timerStyle = {
  fontWeight: "bold",
  margin: "16px 0",
  fontSize: "20px"
};
const redTextStyle = {
  color: "red"
};
const aiMessageStyle = {
  margin: "20px 0",
  textAlign: "center"
};
const loadingMessageStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  justifyContent: "center"
};
const dotStyle = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: "#6366f1",
  margin: "0 2px",
  animation: "dot-blink 1.4s infinite both"
};
const inputAreaStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
  width: "50%",
  marginBottom: 0
};
const sttLogStyle = {
  marginTop: "8px",
  textAlign: "center"
};
const pa0Style = { padding: 0 };

// ==== 미디어 쿼리 및 애니메이션 직접 동적 삽입 ====
if (typeof window !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    @keyframes dot-blink {
      0%, 80%, 100% { opacity: 0; }
      40% { opacity: 1; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.9; }
    }

    @keyframes recording-pulse {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }

    @keyframes wave {
      0% { height: 5px; }
      25% { height: 15px; }
      50% { height: 10px; }
      75% { height: 20px; }
      100% { height: 5px; }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .interview-card {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .interview-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.25) !important;
    }

    /* 버튼 호버 효과 */
    button:hover:not(:disabled), .v-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3) !important;
    }

    button:active:not(:disabled), .v-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    /* 스크롤바 스타일링 */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(102, 126, 234, 0.1);
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
    }

    @media (max-width: 768px) {
      .button-group, [style*="display: flex"][style*="gap: 12px"] {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .button-group > *, [style*="display: flex"][style*="gap: 12px"] > * {
        width: 100% !important;
      }
      .input-area, [style*="width: 50%"] {
        width: 100% !important;
      }

      /* 모바일 환경에서 비디오 레이아웃 조정 */
      [style*="videoRowStyle"] {
        flex-direction: column !important;
      }
      [style*="colRightStyle"], [style*="colLeftStyle"] {
        width: 100% !important;
        max-width: 100% !important;
        flex: 0 0 100% !important;
        margin-bottom: 16px !important;
      }
      [style*="videoBoxStyle"] {
        width: 100% !important;
        aspect-ratio: 4/3 !important;
        margin-bottom: 16px !important;
      }
      [style*="questionContainerStyle"] {
        padding: 16px !important;
      }
      [style*="cameraSectionStyle"] {
        padding: 16px !important;
      }
      [style*="interviewStartContainerStyle"] {
        padding: 12px 8px !important;
      }
      [style*="interviewLogoTextStyle"] {
        font-size: 24px !important;
      }
      [style*="interviewSubtitleStyle"] {
        font-size: 14px !important;
      }
      [style*="stepItemStyle"] {
        min-width: 100% !important;
        margin-bottom: 8px !important;
      }
    }
  `;
  document.head.appendChild(styleTag);
}

// 스타일 객체 정의
const interviewStartContainerStyle = {
  padding: "0",
  maxWidth: "100%",
  minHeight: "100vh",
  background: "#0D0D0F",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const interviewStartWrapperStyle = {
  width: "80%",
  maxWidth: "1400px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  zIndex: 1,
  gap: "16px",
  height: "100vh",
  padding: "28px 0",
  boxSizing: "border-box",
};

const interviewHeaderStyle = {
  textAlign: "center",
  marginBottom: "2vh",
  padding: "0",
  position: "relative",
  width: "100%",
  maxWidth: "900px"
};

const heroTagStyle = {
  display: "inline-block",
  padding: "8px 20px",
  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.12))",
  color: "#3b82f6",
  borderRadius: "30px",
  fontSize: "14px",
  fontWeight: "700",
  marginBottom: "16px",
  letterSpacing: "0.03em",
  border: "1px solid rgba(59, 130, 246, 0.2)"
};

const backgroundTextStyle = {
  position: "absolute",
  fontSize: "clamp(80px, 14vw, 180px)",
  fontWeight: "900",
  color: "rgba(255,255,255,0.025)",
  whiteSpace: "nowrap",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
  zIndex: 0,
  letterSpacing: "0.1em",
  userSelect: "none",
};

const interviewLogoTextStyle = {
  fontSize: "clamp(28px, 4vw, 42px)",
  fontWeight: "900",
  color: "#1e293b",
  marginBottom: "0",
  lineHeight: "1.2",
  letterSpacing: "-0.04em",
  margin: "0"
};

const heroHighlightStyle = {
  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const interviewSubtitleStyle = {
  fontSize: "clamp(15px, 1.8vw, 18px)",
  color: "#64748b",
  lineHeight: "1.6",
  marginBottom: "0",
  fontWeight: "500"
};

// 메인 카메라 컨테이너
const mainCameraContainerStyle = {
  position: "relative",
  width: "100%",
  aspectRatio: "16 / 9", // 16:9 비율로 고정
  background: "#111118",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const mainVideoStyle = {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  objectFit: "cover", // 비율에 맞춰 꽉 채움
  display: "block"
};

const interviewerVideoStyle = {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  objectFit: "cover", // 면접관 영상도 꽉 채움
  display: "block"
};

const smallPreviewStyle = {
  position: "absolute",
  top: "16px",
  right: "16px",
  width: "120px",
  height: "88px",
  borderRadius: "12px",
  overflow: "hidden",
  border: "2px solid rgba(255,255,255,0.2)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
  background: "#000",
};

const smallVideoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const topLeftBadgeStyle = {
  position: "absolute",
  top: "16px",
  left: "16px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 12px",
  background: "rgba(0,0,0,0.55)",
  borderRadius: "100px",
  color: "rgba(255,255,255,0.85)",
  fontSize: "12px",
  fontWeight: "600",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const videoOverlayStyle = {
  position: "absolute",
  inset: "0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const overlayTextStyle = {
  marginTop: "16px",
  fontSize: "15px",
  fontWeight: "600",
  color: "rgba(255,255,255,0.45)",
};

// 하단 컨트롤 카드
const bottomControlCardStyle = {
  width: "100%",
  maxWidth: "1200px",
  borderRadius: "24px",
  overflow: "visible",
  boxShadow: "0 10px 40px rgba(59, 130, 246, 0.15)",
  border: "2px solid rgba(59, 130, 246, 0.1)",
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 255, 0.98))",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)"
};

const controlCardTextStyle = {
  padding: "2.5vh 3vw"
};

// 면접 정보 섹션 스타일
const interviewInfoSectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const interviewCardStyle = {
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  background: "#fff"
};

const startMessageStyle = {
  backgroundColor: "#e3f2fd",
  padding: "10px",
  borderRadius: "8px",
  borderLeft: "3px solid #2196f3",
  marginBottom: "12px",
  fontSize: "13px",
  lineHeight: "1.5",
  color: "#0d47a1",
  boxShadow: "0 1px 4px rgba(33, 150, 243, 0.12)"
};

const interviewStepsStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1vw",
  marginBottom: "0"
};

const stepItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.8vw",
  padding: "1vh 1.2vw",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "2px solid rgba(59, 130, 246, 0.1)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  position: "relative",
  flex: "0 0 auto"
};

const stepBadgeStyle = (isActive) => ({
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  background: isActive ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" : "rgba(59, 130, 246, 0.1)",
  color: isActive ? "white" : "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: "700",
  flexShrink: 0,
  transition: "all 0.3s ease",
  boxShadow: isActive ? "0 4px 12px rgba(59, 130, 246, 0.4)" : "none"
});

const stepContentStyle = {
  flex: "1"
};

const stepTitleStyle = {
  margin: "0",
  fontSize: "14px",
  color: "#1e293b",
  fontWeight: "700",
  letterSpacing: "-0.01em",
  whiteSpace: "nowrap"
};

const stepDescStyle = {
  margin: "0",
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "1.5"
};

const interviewActionsStyle = {
  padding: "12px 16px 16px",
  borderTop: "1px solid rgba(0, 0, 0, 0.05)"
};

const bottomButtonsStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px"
};

const mainActionBtnStyle = {
  textTransform: "none",
  fontSize: "16px",
  letterSpacing: "0.5px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontWeight: "700",
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.35)",
  padding: "14px 48px",
  minWidth: "160px",
  borderRadius: "50px",
  height: "auto",
  color: "white"
};

const secondaryActionBtnStyle = {
  textTransform: "none",
  fontSize: "14px",
  letterSpacing: "0.3px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontWeight: "600",
  background: "rgba(59, 130, 246, 0.1)",
  color: "#3b82f6",
  boxShadow: "none",
  padding: "10px 24px",
  borderRadius: "50px",
  height: "auto",
  border: "2px solid rgba(59, 130, 246, 0.2)"
};

const questionBadgeStyle = {
  display: "inline-block",
  padding: "6px 16px",
  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
  color: "#3b82f6",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: "700",
  marginBottom: "12px",
  letterSpacing: "0.5px"
};

const tipsTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginTop: "0",
  marginBottom: "10px",
  color: "#f57c00",
  fontSize: "14px",
  fontWeight: "700"
};

const tipsListStyle = {
  margin: "0",
  paddingLeft: "18px"
};

const tipsItemStyle = {
  marginBottom: "6px",
  color: "#5d4037",
  fontSize: "12px",
  lineHeight: "1.5",
  paddingLeft: "4px"
};

// 카운트다운 오버레이 스타일
const countdownOverlayStyle = {
  position: "absolute",
  inset: "0",
  background: "rgba(13, 13, 15, 0.9)",
  backdropFilter: "blur(15px)",
  WebkitBackdropFilter: "blur(15px)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const countdownContentStyle = {
  animation: "fadeIn 0.8s ease-out",
};

const countdownLabelStyle = {
  fontSize: "14px",
  fontWeight: "800",
  color: "#5B6BFF",
  letterSpacing: "0.3em",
  marginBottom: "16px",
};

const countdownTitleStyle = {
  fontSize: "24px",
  fontWeight: "700",
  color: "white",
  marginBottom: "40px",
  letterSpacing: "-0.02em",
};

const countdownNumberStyle = {
  fontSize: "120px",
  fontWeight: "900",
  color: "white",
  lineHeight: "1",
  marginBottom: "40px",
  fontFamily: "Pretendard, sans-serif",
  textShadow: "0 0 30px rgba(91, 107, 255, 0.3)",
};

const countdownProgressStyle = {
  width: "200px",
  height: "2px",
  background: "rgba(255,255,255,0.1)",
  margin: "0 auto",
  borderRadius: "2px",
  overflow: "hidden",
};

const countdownBarFillStyle = {
  width: "100%",
  height: "100%",
  background: "#5B6BFF",
  animation: "shimmer 2s infinite linear",
};

// 면접 진행 화면 스타일
const interviewActiveContainerStyle = {
  padding: "0",
  margin: "0",
  maxWidth: "100%",
  background: "#0D0D0F",
  height: "100vh",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const interviewHeaderBarStyle = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  padding: "12px 20px",
  boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const interviewHeaderContentStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1200px",
  margin: "0 auto",
  width: "100%"
};

// 우측 상단 사용자 비디오 (작은 화면)
const userVideoSmallContainerStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  width: "200px",
  height: "150px",
  borderRadius: "12px",
  overflow: "hidden",
  border: "3px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
  background: "#000",
  zIndex: 100
};

const interviewHeaderTitleStyle = {
  fontSize: "19px",
  fontWeight: "700",
  letterSpacing: "0.5px"
};

const recordingBadgeSmallStyle = {
  position: "absolute",
  bottom: "8px",
  left: "8px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "4px 10px",
  background: "rgba(239, 68, 68, 0.9)",
  borderRadius: "12px",
  color: "white",
  fontSize: "11px",
  fontWeight: "600"
};

const interviewStatusBadgeStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "rgba(255, 255, 255, 0.25)",
  padding: "6px 16px",
  borderRadius: "20px",
  fontSize: "14px",
  fontWeight: "600",
  backdropFilter: "blur(8px)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
};

const interviewStatusTextStyle = {
  color: "white"
};

const statusLoadingDotsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px"
};

const statusDotStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "white",
  opacity: 0.8,
  animation: "dot-blink 1.4s infinite both"
};

const videoSectionStyle = {
  flex: 1,
  padding: "24px",
  maxWidth: "1200px",
  margin: "0 auto",
  width: "100%"
};

const participantLabelStyle = {
  position: "absolute",
  bottom: "16px",
  left: "16px",
  background: "linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%)",
  color: "white",
  padding: "6px 14px",
  borderRadius: "16px",
  fontSize: "13px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  backdropFilter: "blur(8px)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
};

const recordingIndicatorStyle = {
  position: "absolute",
  top: "16px",
  right: "16px",
  background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
  color: "white",
  padding: "6px 14px",
  borderRadius: "16px",
  fontSize: "13px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backdropFilter: "blur(8px)",
  boxShadow: "0 4px 12px rgba(244, 67, 54, 0.4)"
};

const recordingDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#f44336",
  animation: "recording-pulse 1.5s infinite"
};

const questionSectionStyle = {
  marginTop: "24px",
  marginBottom: "24px",
  width: "100%"
};

const questionContainerStyle = {
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  width: "100%",
  animation: "fadeIn 0.7s ease-out",
  border: "1px solid rgba(102, 126, 234, 0.1)",
  backdropFilter: "blur(10px)"
};

const questionPrepareStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 0",
  gap: "16px"
};

const questionPrepareTextStyle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#333",
  margin: "8px 0"
};

const loadingDotsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginTop: "8px"
};

const loadingDotStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  backgroundColor: "rgba(255,255,255,0.7)",
  animation: "dot-blink 1.4s infinite both",
};

const questionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "16px"
};

const questionTitleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#333",
  margin: 0
};

const questionContentStyle = {
  marginBottom: "24px",
  padding: "20px",
  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
  borderRadius: "16px",
  border: "1px solid rgba(102, 126, 234, 0.15)"
};

const questionTextStyle = {
  fontSize: "17px",
  lineHeight: "1.7",
  color: "#1a202c",
  margin: 0,
  fontWeight: "600"
};

const timerContainerStyle = {
  marginTop: "16px"
};

const aiLoadingMessageStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: "16px",
  marginBottom: "16px"
};

const loadingCardStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "16px 24px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px"
};

const loadingTextStyle = {
  fontSize: "15px",
  color: "#333",
  margin: 0
};

const answerSectionStyle = {
  marginTop: "24px",
  width: "100%"
};

const answerControlsStyle = {
  marginBottom: "16px"
};

const activeSpeakingStyle = {
  background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
  color: "white",
  boxShadow: "0 6px 16px rgba(244, 67, 54, 0.4)",
  animation: "pulse 1.5s infinite",
  transform: "scale(1.05)"
};

const answerCompleteBtnStyle = {
  padding: "10px 16px",
  fontSize: "14px",
  fontWeight: "500"
};

const sttResultContainerStyle = {
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  marginBottom: "20px",
  border: "1px solid rgba(102, 126, 234, 0.1)",
  backdropFilter: "blur(10px)"
};

const sttHeaderStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px"
};

const sttTitleStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#333",
  margin: 0
};

const sttContentStyle = {
  padding: "16px",
  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
  borderRadius: "12px",
  border: "1px solid rgba(102, 126, 234, 0.15)",
  minHeight: "120px"
};

const sttRecordingStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  gap: "12px"
};

const sttRecordingAnimationStyle = {
  width: "100%",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px"
};

const sttRecordingTextStyle = {
  fontSize: "14px",
  color: "#333",
  margin: 0
};

const sttGeneratingStyle = {
  fontSize: "14px",
  color: "#555",
  margin: "0 0 8px 0"
};

const sttLogContentStyle = {
  fontSize: "15px",
  color: "#333",
  lineHeight: "1.6",
  margin: 0,
  whiteSpace: "pre-wrap"
};

const sttEmptyStyle = {
  fontSize: "14px",
  color: "#757575",
  fontStyle: "italic",
  margin: 0,
  textAlign: "center"
};

const devInputStyle = {
  marginTop: "16px"
};

const devTextFieldStyle = {
  maxWidth: "500px",
  margin: "0 auto"
};

// ===== 새로운 면접 진행 화면 스타일 =====

const userVideoSmallStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};


// 질문 로딩 박스
const questionLoadingBoxStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "3vh 2vw",
  gap: "16px"
};

const questionLoadingTextStyle = {
  fontSize: "16px",
  color: "#64748b",
  fontWeight: "500",
  margin: "0"
};

// 질문 박스
const questionBoxStyle = {
  marginBottom: "12px"
};

const questionBoxHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px"
};

const questionNumberBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 20px",
  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
  color: "white",
  borderRadius: "20px",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "0.5px"
};

const questionProgressTextStyle = {
  fontSize: "14px",
  color: "#64748b",
  fontWeight: "600"
};

const questionBoxTextStyle = {
  fontSize: "17px",
  color: "#1e293b",
  fontWeight: "600",
  lineHeight: "1.6",
  margin: "0"
};

// 답변 버튼 영역
const answerButtonAreaStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

// STT 미리보기
const sttPreviewStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 16px",
  background: "rgba(91,107,255,0.1)",
  borderRadius: "12px",
  border: "1px solid rgba(91,107,255,0.2)",
  flexShrink: 0,
};

const sttPreviewTextStyle = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.65)",
  fontWeight: "400",
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

// 면접 액션 버튼들
const interviewActionButtonsStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px"
};

const startAnswerBtnStyle = {
  textTransform: "none",
  fontSize: "16px",
  letterSpacing: "0.5px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontWeight: "700",
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.35)",
  padding: "14px 48px",
  minWidth: "180px",
  borderRadius: "50px",
  height: "auto",
  color: "white"
};

const stopAnswerBtnStyle = {
  textTransform: "none",
  fontSize: "16px",
  letterSpacing: "0.5px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontWeight: "700",
  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  boxShadow: "0 8px 24px rgba(239, 68, 68, 0.35)",
  padding: "14px 48px",
  minWidth: "180px",
  borderRadius: "50px",
  height: "auto",
  color: "white"
};

const replayBtnStyle = {
  textTransform: "none",
  fontSize: "14px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontWeight: "600",
  background: "rgba(59, 130, 246, 0.1)",
  color: "#3b82f6",
  boxShadow: "none",
  padding: "12px 16px",
  borderRadius: "50px",
  height: "auto",
  border: "2px solid rgba(59, 130, 246, 0.2)",
  minWidth: "auto"
};

const completeBtnStyle = {
  textTransform: "none",
  fontSize: "15px",
  letterSpacing: "0.3px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontWeight: "700",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)",
  padding: "12px 32px",
  borderRadius: "50px",
  height: "auto",
  color: "white"
};

// 맨 위로 올리기 버튼 스타일
const scrollTopBtnStyle = {
  position: "fixed",
  bottom: "80px",
  right: "20px",
  zIndex: 1000,
  width: "56px",
  height: "56px",
  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer"
};
// 텍스트 입력 컨테이너
const textInputContainerStyle = {
  width: "100%",
  marginBottom: "0"
};

const textInputFieldStyle = {
  width: "100%",
  fontSize: "13px",
  backgroundColor: "white",
  borderRadius: "10px"
};

// ===== 재설계된 UI 스타일 =====

const bgDecoStyle = {
  position: "absolute",
  inset: "0",
  background: "radial-gradient(ellipse at 20% 50%, rgba(91,107,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(16,185,129,0.06) 0%, transparent 60%)",
  pointerEvents: "none",
  zIndex: 0,
};

const progressHeaderStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexShrink: 0,
};

const progressLabelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "rgba(255,255,255,0.5)",
  whiteSpace: "nowrap",
  letterSpacing: "0.05em",
};

const progressBarWrapStyle = {
  flex: 1,
  height: "2px",
  background: "rgba(255,255,255,0.12)",
  borderRadius: "100px",
  overflow: "hidden",
};

const progressBarFillStyle = (pct = 0) => ({
  height: "100%",
  width: `${pct}%`,
  background: "linear-gradient(90deg, #5B6BFF, #8B5CF6)",
  borderRadius: "100px",
  transition: "width 0.6s ease",
});

const progressStatusStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "rgba(255,255,255,0.4)",
  whiteSpace: "nowrap",
};

const progressTimerStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "rgba(255,255,255,0.6)",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
};

const videoBottomOverlayStyle = {
  position: "absolute",
  bottom: "0",
  left: "0",
  right: "0",
  maxHeight: "62%",
  padding: "52px 32px 28px",
  background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.55) 72%, transparent 100%)",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  overflow: "hidden",
};

const questionScrollContainerStyle = {
  overflowY: "auto",
  maxHeight: "28vh",
  paddingRight: "6px",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(255,255,255,0.2) transparent",
};

const qBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5px 14px",
  borderRadius: "100px",
  background: "rgba(91,107,255,0.9)",
  backdropFilter: "blur(8px)",
  color: "white",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.08em",
  alignSelf: "flex-start",
};

const videoQuestionTextStyle = {
  fontSize: "clamp(14px, 1.4vw, 17px)",
  fontWeight: "500",
  color: "rgba(255,255,255,0.95)",
  lineHeight: "1.75",
  margin: "0",
  letterSpacing: "-0.01em",
  textShadow: "0 1px 8px rgba(0,0,0,0.6)",
  wordBreak: "keep-all",
};

const controlsRowStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "14px",
  flexShrink: 0,
};

const iconControlBtnStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "background 0.2s ease",
};

const keyboardBtnStyle = computed(() => ({
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  background: textMode.value ? "rgba(91,107,255,0.18)" : "rgba(255,255,255,0.08)",
  border: textMode.value ? "1px solid rgba(91,107,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "background 0.2s ease, border 0.2s ease",
}));

const textAnswerInputStyle = computed(() => ({
  width: "100%",
  minHeight: "60px",
  background: "transparent",
  border: "none",
  outline: "none",
  resize: "none",
  fontSize: "14px",
  fontWeight: "500",
  lineHeight: "1.6",
  color: answerCardDark.value ? "rgba(255,255,255,0.9)" : "#1e293b",
  fontFamily: "inherit",
  padding: "0",
}));

const primaryControlBtnStyle = {
  flex: "1",
  maxWidth: "340px",
  height: "54px",
  borderRadius: "100px",
  background: "#5B6BFF",
  color: "white",
  fontSize: "15px",
  fontWeight: "700",
  textTransform: "none",
  letterSpacing: "0.02em",
  boxShadow: "0 8px 28px rgba(91,107,255,0.45)",
};

const primaryVoiceBtnStyle = {
  flex: "1",
  maxWidth: "340px",
  height: "54px",
  borderRadius: "100px",
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  fontSize: "15px",
  fontWeight: "700",
  textTransform: "none",
  letterSpacing: "0.02em",
};

const stopVoiceBtnStyle = {
  flex: "1",
  maxWidth: "340px",
  height: "54px",
  borderRadius: "100px",
  background: "rgba(239,68,68,0.85)",
  border: "1px solid rgba(239,68,68,0.4)",
  color: "white",
  fontSize: "15px",
  fontWeight: "700",
  textTransform: "none",
  letterSpacing: "0.02em",
  boxShadow: "0 6px 20px rgba(239,68,68,0.35)",
};

const nextQuestionBtnStyle = {
  width: "100%",
  height: "50px",
  borderRadius: "100px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.65)",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "none",
  letterSpacing: "0.02em",
  flexShrink: 0,
};

const questionLoadingInlineStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const loadingDotsInlineStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  flexShrink: 0,
};

// ===== 내 답변 카드 (다크/라이트 동적) =====
const dynamicSttAnswerCardStyle = computed(() => ({
  width: "100%",
  background: answerCardDark.value ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.96)",
  border: answerCardDark.value ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(0,0,0,0.09)",
  borderRadius: "16px",
  padding: "14px 18px",
  flexShrink: 0,
  transition: "all 0.25s ease",
  boxShadow: answerCardDark.value ? "none" : "0 4px 20px rgba(0,0,0,0.15)",
}));

const sttAnswerHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  marginBottom: "10px",
};

const dynamicSttAnswerLabelStyle = computed(() => ({
  fontSize: "11px",
  fontWeight: "700",
  color: answerCardDark.value ? "rgba(255,255,255,0.4)" : "#94a3b8",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  flex: 1,
  transition: "color 0.25s ease",
}));

const answerThemeToggleStyle = computed(() => ({
  width: "26px",
  height: "26px",
  borderRadius: "50%",
  background: answerCardDark.value ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
  border: answerCardDark.value ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.25s ease",
  flexShrink: 0,
}));

// 하위 호환을 위해 유지 (unused)
const sttAnswerLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "rgba(255,255,255,0.4)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  flex: 1,
};

const recordingPillStyle = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  padding: "3px 10px",
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: "100px",
  fontSize: "11px",
  fontWeight: "600",
  color: "rgba(239,68,68,0.85)",
};

const recordingDotAnimStyle = {
  width: "5px",
  height: "5px",
  borderRadius: "50%",
  background: "#ef4444",
  animation: "recording-pulse 1.5s infinite",
  flexShrink: 0,
};

const sttAnswerScrollStyle = {
  maxHeight: "68px",
  overflowY: "auto",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(255,255,255,0.15) transparent",
};

const dynamicSttAnswerTextStyle = computed(() => ({
  fontSize: "14px",
  fontWeight: "500",
  color: answerCardDark.value ? "rgba(255,255,255,0.95)" : "#1e293b",
  lineHeight: "1.7",
  margin: "0",
  wordBreak: "keep-all",
  transition: "color 0.25s ease",
}));

const dynamicSttAnswerScrollStyle = computed(() => ({
  maxHeight: "68px",
  overflowY: "auto",
  scrollbarWidth: "thin",
  scrollbarColor: answerCardDark.value ? "rgba(255,255,255,0.15) transparent" : "rgba(0,0,0,0.15) transparent",
}));

const nextQuestionBtnInlineStyle = {
  flex: "1",
  maxWidth: "340px",
  height: "54px",
  borderRadius: "100px",
  background: "rgba(91,107,255,0.15)",
  border: "1px solid rgba(91,107,255,0.35)",
  color: "rgba(255,255,255,0.9)",
  fontSize: "15px",
  fontWeight: "700",
  textTransform: "none",
  letterSpacing: "0.02em",
};

// ===== 장치 토글 버튼 =====
const deviceToggleBarStyle = {
  position: "absolute",
  top: "20px",
  right: "24px",
  zIndex: 10,
  display: "flex",
  gap: "8px",
};

const deviceToggleBtnStyle = (isOn) => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "7px 14px",
  borderRadius: "100px",
  border: isOn ? "1px solid rgba(91,107,255,0.5)" : "1px solid rgba(255,255,255,0.12)",
  background: isOn ? "rgba(91,107,255,0.18)" : "rgba(255,255,255,0.06)",
  color: isOn ? "#a5b4fc" : "rgba(255,255,255,0.3)",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  transition: "all 0.2s ease",
  letterSpacing: "-0.01em",
  userSelect: "none",
});

</script>

<style scoped>
.scroll-top-btn {
  animation: fadeInUp 0.3s ease-out;
}

/* 질문 스크롤 컨테이너 스크롤바 */
.question-scroll::-webkit-scrollbar {
  width: 3px;
}

.question-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.question-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 100px;
}

.question-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

.scroll-top-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5) !important;
}

.scroll-top-btn:active {
  transform: translateY(-2px) scale(1.02);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
