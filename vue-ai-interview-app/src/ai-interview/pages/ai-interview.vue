<template>
  <!--  로딩  -->
  <LoadingSpinner v-if="isLoading"/>


  <v-container v-else-if="!start" :style="interviewStartContainerStyle" fluid>
    <!-- 배경 텍스트 -->
    <div :style="backgroundTextStyle">
      AI INTERVIEW
    </div>



    <div :style="interviewStartWrapperStyle">
      <!-- 큰 카메라 화면 -->
      <div :style="mainCameraContainerStyle">
        <video
          ref="previewVideo"
          autoplay
          playsinline
          muted
          :style="mainVideoStyle"
        />
        <div :style="videoOverlayStyle" v-if="!mediaChecked">
          <v-icon size="80" color="white">mdi-video-outline</v-icon>
          <p :style="overlayTextStyle">카메라를 활성화하세요</p>
        </div>

        <!-- 우측 상단 작은 프리뷰 (선택사항) -->
        <div :style="smallPreviewStyle" v-if="mediaChecked">
          <video
            ref="smallPreview"
            autoplay
            playsinline
            muted
            :style="smallVideoStyle"
          />
        </div>

        <!-- 좌측 상단 타이머 -->
        <div :style="topLeftBadgeStyle">
          <v-icon size="16" color="white">mdi-circle</v-icon>
          <span>03:00</span>
        </div>
      </div>

      <!-- 하단 컨트롤 카드 -->
      <v-card :style="bottomControlCardStyle" class="interview-card">
        <v-card-text :style="controlCardTextStyle">
          <!-- 질문 표시 영역 -->
          <div :style="questionDisplayStyle">
            <div :style="questionBadgeStyle">Q1</div>
            <p :style="questionTextDisplayStyle">
              {{ mediaChecked ? '카메라와 마이크가 정상적으로 작동합니다. 면접을 시작하세요.' : '카메라와 마이크를 확인해주세요' }}
            </p>
          </div>

          <!-- 컨트롤 버튼 -->
          <div :style="bottomButtonsStyle">
            <v-btn
              v-if="!mediaChecked"
              color="primary"
              :style="mainActionBtnStyle"
              elevation="0"
              rounded
              large
              @click="checkMediaReady"
            >
              확인
            </v-btn>

            <template v-else>
              <v-btn
                color="primary"
                :style="secondaryActionBtnStyle"
                elevation="0"
                rounded
                @click="startRecording"
                :disabled="!mediaChecked"
              >
                <v-icon>mdi-waveform</v-icon>
              </v-btn>

              <v-btn
                color="primary"
                :style="mainActionBtnStyle"
                elevation="0"
                rounded
                large
                @click="handleStartInterview"
              >
                <v-icon left size="20">mdi-play-circle</v-icon>
                면접 시작
              </v-btn>

              <v-btn
                color="default"
                :style="secondaryActionBtnStyle"
                elevation="0"
                rounded
                @click="playRecording"
                :disabled="!recordedBlob"
              </v-btn>
            </template>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </v-container>



  <v-container v-else fluid :style="interviewActiveContainerStyle">
    <div :style="interviewStartWrapperStyle">
      <!-- 큰 이미지 화면 (카메라 자리) -->
      <div :style="mainCameraContainerStyle">
        <!-- 면접관 이미지 -->
        <img :src="hhImage" alt="면접관" :style="interviewerImageInCameraStyle" />

        <!-- 우측 상단: 사용자 비디오 (작은 화면) -->
        <div :style="smallPreviewStyle">
          <video
            ref="userVideo"
            v-show="start"
            autoplay
            playsinline
            muted
            :style="smallVideoStyle"
          ></video>
        </div>

        <!-- 좌측 상단: 타이머 -->
        <div :style="topLeftBadgeStyle">
          <v-icon size="16" color="white">mdi-clock-outline</v-icon>
          <span>{{ Math.floor(remainingTime / 60) }}:{{ (remainingTime % 60).toString().padStart(2, "0") }}</span>
        </div>
      </div>

      <!-- 하단 컨트롤 카드 (질문 + 버튼) -->
      <v-card :style="bottomControlCardStyle" class="interview-card">
      <v-card-text :style="controlCardTextStyle">
        <!-- 질문 표시 -->
        <div v-if="visible" :style="questionLoadingBoxStyle">
          <v-icon size="32" color="primary">mdi-loading mdi-spin</v-icon>
          <p :style="questionLoadingTextStyle">면접 질문을 준비 중입니다...</p>
        </div>

        <div v-else :style="questionBoxStyle">
          <div :style="questionBoxHeaderStyle">
            <div :style="questionNumberBadgeStyle">Q{{ interviewSequence + 1 }}</div>
            <div :style="questionProgressTextStyle">{{ interviewSequence + 1 }} / 6</div>
          </div>
          <p :style="questionBoxTextStyle" v-html="formattedAIMessage"></p>
        </div>

        <!-- 답변 버튼 영역 -->
        <div v-if="!visible" :style="answerButtonAreaStyle">
          <!-- STT 결과 미리보기 (간단하게) -->
          <div v-if="sttLog !== ''" :style="sttPreviewStyle">
            <v-icon size="16" color="#3b82f6">mdi-text-to-speech</v-icon>
            <span :style="sttPreviewTextStyle">{{ sttLog.substring(0, 50) }}{{ sttLog.length > 50 ? '...' : '' }}</span>
          </div>

          <!-- 답변 버튼 영역 -->
          <div v-if="!visible" :style="answerButtonAreaStyle">
            <!-- 텍스트 입력 필드 추가 -->
<!--            <div :style="textInputContainerStyle">-->
<!--              <v-textarea-->
<!--                  v-model="textAnswer"-->
<!--                  :style="textInputFieldStyle"-->
<!--                  placeholder="음성 인식이 어려운 경우 여기에 직접 입력하세요"-->
<!--                  rows="2"-->
<!--                  outlined-->
<!--                  dense-->
<!--                  hide-details-->
<!--                  :disabled="recognizing"-->
<!--              ></v-textarea>-->
<!--            </div>-->


            <!-- 버튼 그룹 -->
            <div :style="interviewActionButtonsStyle">
              <!-- 기존 버튼들... -->
            </div>
          </div>

          <!-- 버튼 그룹 -->
          <div :style="interviewActionButtonsStyle">
            <v-btn
              v-if="!recognizing"
              color="primary"
              :style="startAnswerBtnStyle"
              elevation="0"
              rounded
              large
              @click="startSTT"
              :disabled="isGenerating"
            >
              <v-icon left size="20">mdi-microphone</v-icon>
              답변 시작
            </v-btn>

            <v-btn
              v-else
              color="error"
              :style="stopAnswerBtnStyle"
              elevation="0"
              rounded
              large
              @click="startSTT"
            >
              <v-icon left size="20">mdi-stop-circle</v-icon>
              답변 중지
            </v-btn>

            <v-btn
              color="default"
              :style="replayBtnStyle"
              elevation="0"
              rounded
              @click="replayQuestion"
              :disabled="isGenerating"
            >
              <v-icon>mdi-volume-high</v-icon>
            </v-btn>

            <v-btn
                color="success"
                :style="completeBtnStyle"
                elevation="0"
                rounded
                @click="onAnswerComplete"
                :disabled="isGenerating || (sttLog === '' && textAnswer === '')"
            >
              <v-icon left size="18">{{ isGenerating ? 'mdi-loading mdi-spin' : 'mdi-check-circle' }}</v-icon>
              {{ isGenerating ? '처리중...' : '답변 완료' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    </div>
  </v-container>

  <!-- 맨 위로 올리기 버튼 -->
  <v-btn
    :style="scrollTopBtnStyle"
    @click="scrollToTop"
    fab
    color="primary"
    elevation="8"
    class="scroll-top-btn"
  >
    <v-icon size="28" color="white">mdi-chevron-up</v-icon>
  </v-btn>
</template>




<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useAiInterviewStore } from "../stores/aiInterviewStore";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import "@mdi/font/css/materialdesignicons.css";
import hhImage from "@/assets/images/fixed/aiai.png";
import { useHead } from '@vueuse/head'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';





useHead({
  title: "AI 모의 면접 시작 | 잡스틱(JobStick)",
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

const start = ref(false);
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
const previewVideo = ref(null);
const mediaStream = ref(null);
const isGenerating = ref(false);
const isEnded = ref(false);

// 맨 위로 스크롤
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const mapCompanyName = (original) => {
  const mapping = {
    당근마켓: "danggeun",
    Toss: "toss",
    "SK-encore": "sk_encore",
    "KT M mobile": "kt_mobile",
  };
  return mapping[original] || original.toLowerCase().replace(/[\s-]+/g, "_");
};

const checkMediaReady = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    mediaChecked.value = true;
    alert("마이크와 카메라가 정상적으로 작동합니다.");
    mediaStream.value = stream;
    if (previewVideo.value) previewVideo.value.srcObject = stream;
  } catch (err) {
    alert("마이크 또는 카메라에 접근할 수 없습니다. 브라우저 권한을 확인하세요.");
    mediaChecked.value = false;
  }
};

const recordedVideo = ref(null);
const recordedBlob = ref(null);
let recordingStream = null;
let recorder = null;
let chunks = [];
const startRecording = async () => {
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (previewVideo.value) previewVideo.value.srcObject = recordingStream;

    chunks = [];
    recorder = new MediaRecorder(recordingStream, { mimeType: "video/webm" });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      recordedBlob.value = new Blob(chunks, { type: "video/webm" });
      const videoURL = URL.createObjectURL(recordedBlob.value);
      localStorage.setItem("interviewRecordingUrl", videoURL);
      if (previewVideo.value) {
        previewVideo.value.srcObject = null;
        previewVideo.value.src = videoURL;
        previewVideo.value.controls = true;
        previewVideo.value.play();
      }
    };
    recorder.start();
    alert("녹화를 시작합니다다");
  } catch (err) {
    console.error("🎥 녹화 시작 실패:", err);
    alert("녹화 시작 중 오류가 발생했습니다.");
  }
};
const stopRecording = () => {
  if (recorder && recorder.state === "recording") {
    recorder.stop();
    if (recordingStream) {
      recordingStream.getTracks().forEach((track) => track.stop());
    }
    alert("녹화 종료됨");
  }
};

let recognition;
const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
let currentUtteance = null;

onMounted(async () => {
  try {
    const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    if (previewVideo.value) {
      previewVideo.value.srcObject = videoOnlyStream;
    }
  } catch (err) {
    console.error("previewVideo 카메라 연결 실패:", err);
  }
  if (typeof window !== "undefined") {
    speakStartMessage();

    await nextTick();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
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
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  if (synth?.speaking) synth.cancel();
  const utterance = new SpeechSynthesisUtterance(currentAIMessage.value);
  utterance.lang = "ko-KR";
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  setTimeout(() => synth?.speak(utterance), 100);
};

const handleBeforeUnload = (event) => {
  if (start.value && !finished.value) {
    event.preventDefault();
    event.returnValue = "면접이 진행 중입니다. 페이지를 나가시겠습니까?";
  }
};

const speakCurrentMessage = () => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  clearInterval(timer.value);
  remainingTime.value = 90;
  currentUtteance = new SpeechSynthesisUtterance(currentAIMessage.value);
  currentUtteance.lang = "ko-KR";
  currentUtteance.rate = 0.85;
  currentUtteance.pitch = 1.0;
  currentUtteance.onend = () => startTimer();
  synth?.speak(currentUtteance);
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
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (userVideo.value) {
      userVideo.value.srcObject = recordingStream;
    }
    chunks = [];
    recorder = new MediaRecorder(recordingStream, { mimeType: "video/webm" });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      recordedBlob.value = new Blob(chunks, { type: "video/webm" });
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
    alert("면접 정보를 찾을 수 없습니다. 처음으로 돌아갑니다.");
    router.push("/ai-interview");
    return;
  }
  start.value = true;
  await startRecordingAuto();

  showWarning.value = false;
  speakStartMessage();

  // 첫 번째 질문을 고정으로 설정
  interviewSequence.value = 1; // 1번은 자기소개 질문
  currentAIMessage.value = "안녕하세요 자기소개 부탁드립니다.";

  const utterance = new SpeechSynthesisUtterance(
      "AI 모의 면접이 곧 시작됩니다. 면접 질문이 화면에 표시되며, 자동으로 음성으로 읽어드립니다."
  );
  utterance.lang = "ko-KR";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.onend = () => showStartMessage();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
};



const onAnswerComplete = async () => {
  isGenerating.value = true;

  clearInterval(timer.value);
  if (recognition && recognizing.value) recognition.stop();

  // if (!sttLog.value.trim()) {
  //   alert("음성 인식 결과가 없습니다.");
  //   isGenerating.value = false;
  //   return;
  // }

  const finalAnswer = (sttLog.value + " " + textAnswer.value).trim();

  if (!finalAnswer) {
    alert("답변 내용이 없습니다. 음성 또는 텍스트로 답변을 입력해주세요.");
    isGenerating.value = false;
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
    currentAIMessage.value = res.interviewQuestion;
    
    // localStorage에 interviewId 저장 (결과 페이지에서 사용)
    localStorage.setItem("currentInterviewId", String(res.interviewId));

    sttLog.value = "";
    textAnswer.value = "";
    isGenerating.value = false;
    remainingTime.value = 90;
    startTimer();
    replayQuestion();

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
      alert("다음 질문을 불러오지 못했습니다.");
      isGenerating.value = false;
      return;
    }

    currentQuestionId.value = questionRes.interviewQAId;
    currentAIMessage.value = questionRes.interviewQuestion;
    sttLog.value = "";
    textAnswer.value = "";
    speakCurrentMessage();

    isGenerating.value = false;
  }
  interviewSequence.value = interviewSequence.value + 1;

}


onBeforeUnmount(() => {
  if (
      typeof window !== "undefined" &&
      window.speechSynthesis &&
      window.speechSynthesis.speaking
  ) {
    window.speechSynthesis.cancel();
  }
  localStorage.removeItem("interviewInfo");
  clearInterval(timer.value);
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

onBeforeRouteLeave((to, from, next) => {
  console.log("인터뷰 끝남 여부 : " + isEnded.value);
  if (start.value && !finished.value) {
    if (interviewSequence.value !== 6) {
      const answer = window.confirm(
          "면접이 진행 중입니다. 페이지를 나가시겠습니까?"
      );
      answer ? next() : next(false);
    } else {
      next();
    }
  } else {
    next();
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
  padding: "3vh 20px",
  maxWidth: "100%",
  margin: "0 auto",
  minHeight: "100vh",
  maxHeight: "100vh",
  background: "linear-gradient(180deg, #ffffff 0%, #f0f9ff 40%, #e0f2fe 100%)",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const interviewStartWrapperStyle = {
  maxWidth: "1200px",
  width: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  animation: "fadeIn 0.8s ease-out",
  alignItems: "center",
  position: "relative",
  zIndex: 1,
  gap: "2vh"
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
  position: "fixed",
  fontSize: "clamp(80px, 12vw, 140px)",
  fontWeight: "900",
  color: "rgba(200, 230, 255, 0.25)",
  whiteSpace: "nowrap",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
  zIndex: 0,
  letterSpacing: "0.05em",
  opacity: 1,
  transition: "opacity 0.5s ease"
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
  maxWidth: "1200px",
  height: "65vh",
  background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  border: "3px solid rgba(59, 130, 246, 0.2)"
};

const mainVideoStyle = {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const smallPreviewStyle = {
  position: "absolute",
  top: "20px",
  right: "20px",
  width: "180px",
  height: "135px",
  borderRadius: "12px",
  overflow: "hidden",
  border: "3px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
  background: "#000"
};

const smallVideoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const topLeftBadgeStyle = {
  position: "absolute",
  top: "20px",
  left: "20px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 16px",
  background: "rgba(0, 0, 0, 0.6)",
  borderRadius: "20px",
  color: "white",
  fontSize: "14px",
  fontWeight: "600",
  backdropFilter: "blur(10px)"
};

const videoOverlayStyle = {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(30, 41, 59, 0.95)",
  color: "white",
  backdropFilter: "blur(10px)"
};

const overlayTextStyle = {
  marginTop: "24px",
  fontSize: "20px",
  fontWeight: "600",
  textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
  letterSpacing: "0.3px",
  opacity: 0.95
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

// 면접 진행 화면 스타일
const interviewActiveContainerStyle = {
  padding: "0",
  margin: "0",
  maxWidth: "100%",
  background: "linear-gradient(180deg, #ffffff 0%, #f0f9ff 40%, #e0f2fe 100%)",
  height: "100vh",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center"
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
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: "#3f51b5",
  opacity: 0.8,
  animation: "dot-blink 1.4s infinite both"
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

// 카메라 자리에 들어갈 이미지 스타일
const interviewerImageInCameraStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "24px"
};

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
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  background: "rgba(59, 130, 246, 0.05)",
  borderRadius: "10px",
  border: "1px solid rgba(59, 130, 246, 0.1)"
};

const sttPreviewTextStyle = {
  fontSize: "14px",
  color: "#475569",
  fontWeight: "400",
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
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


</script>

<style scoped>
.scroll-top-btn {
  animation: fadeInUp 0.3s ease-out;
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
