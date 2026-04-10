const isDev = process.env.NODE_ENV === "development";

export const mfConfig = {
  name: "html_container",
  remotes: {
    vueAccountApp: isDev 
      ? 'vueAccountApp@http://localhost:3000/remoteEntry.js'
      : `vueAccountApp@${process.env.VUE_ACCOUNT_APP}/remoteEntry.js`,
    navigationBarApp: isDev
      ? 'navigationBarApp@http://localhost:3005/remoteEntry.js'
      : `navigationBarApp@${process.env.REACT_NAVIGATION_APP}/remoteEntry.js`,
    vueAiInterviewApp: isDev
      ? 'vueAiInterviewApp@http://localhost:3002/remoteEntry.js'
      : `vueAiInterviewApp@${process.env.VUE_AI_INTERVIEW_APP}/remoteEntry.js`,
    svelteKitReviewApp: 'promise import("http://localhost:5174/remoteEntry.js")',
    myPageApp: isDev
      ? 'myPageApp@http://localhost:3020/remoteEntry.js'
      : `myPageApp@${process.env.REACT_MYPAGE_APP}/remoteEntry.js`,
    ptnWordApp: isDev
      ? 'ptnWordApp@http://localhost:3006/remoteEntry.js'
      : `ptnWordApp@${process.env.REACT_PTN_WORD_APP}/remoteEntry.js`
  },
  shared: {
    react: { singleton: true, requiredVersion: "^18.2.0", eager: true },
    "react-dom": { singleton: true, requiredVersion: "^18.2.0", eager: true },
    "react-router-dom": { singleton: true, requiredVersion: "^6.28.0", eager: true },
    '@jobspoon/app-state': { singleton: true, eager: true },
    '@jobspoon/theme-bridge': { singleton: true, eager: true },
  },
};