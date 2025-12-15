<template>
  <div :style="overlayStyle">
    <div :style="spinnerContainerStyle">
      <div :style="spinnerStyle"></div>
      <p :style="textStyle">면접 결과를 분석 중입니다...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoadingSpinner",
  setup() {
    const overlayStyle = {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      zIndex: "9999",
      backdropFilter: "blur(6px)",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    };

    const spinnerContainerStyle = {
      background: "#ffffff",
      padding: "2.5rem 3.5rem",
      borderRadius: "20px",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25)",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem",
    };

    const spinnerStyle = {
      width: "60px",
      height: "60px",
      border: "6px solid rgba(243, 243, 243, 0.7)",
      borderTop: "6px solid #4f46e5",
      borderRadius: "50%",
      animation: "spin 0.6s linear infinite",
      boxShadow: "0 0 20px rgba(79, 70, 229, 0.6)",
    };

    const textStyle = {
      margin: "0",
      color: "#111827",
      fontSize: "1.2rem",
      fontWeight: "600",
      fontFamily: `"Inter", "Noto Sans KR", sans-serif`,
    };

    return { overlayStyle, spinnerContainerStyle, spinnerStyle, textStyle };
  },
};
</script>

<style>
/* 인라인 스타일로는 keyframes를 정의할 수 없기 때문에 여기에 한 번만 정의해야 함 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
