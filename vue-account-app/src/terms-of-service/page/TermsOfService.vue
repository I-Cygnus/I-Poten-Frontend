<template>
  <div :style="containerStyle">
    <div :style="headerStyle">
      <h1 :style="h1Style">I-Poten 개인회원 이용약관</h1>
      <div :style="metaInfoStyle">
        <p :style="metaPStyle"><strong>시행일:</strong> 2025.01.14</p>
        <p :style="metaPStyle"><strong>회사명:</strong> I-Cygnus</p>
        <p :style="metaPStyle"><strong>서비스명:</strong> I-Poten (포텐워드, 포텐노트, 포텐퀴즈, 포텐북, AI 인터뷰 등)</p>
      </div>
    </div>

    <div :style="contentStyle">
      <section :style="sectionStyle">
        <h2 :style="h2Style">제1조 (목적)</h2>
        <p :style="pStyle">① 이 약관은 회사가 제공하는 서비스의 이용과 관련하여 회사와 개인회원(이하 "회원") 간의 권리·의무 및 책임사항, 유료서비스 이용, 환불, 금지행위 및 제재, 분쟁해결 등 기본 사항을 규정함을 목적으로 합니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제2조 (용어의 정의)</h2>
        <p :style="pStyle">① 이 약관에서 사용하는 용어의 뜻은 다음과 같습니다.</p>
        <ol :style="olStyle">
          <li :style="liStyle">"회원"이란 이 약관에 동의하고 서비스에 가입하여 회사가 제공하는 서비스를 이용하는 분을 말합니다.</li>
          <li :style="liStyle">"유료서비스"란 회원이 회사에 대가를 지급하고 이용하는 서비스 또는 콘텐츠를 말합니다(크레딧 기반 AI 인터뷰, 유료 포텐북 등).</li>
          <li :style="liStyle">"크레딧(Credit)"이란 AI 인터뷰 등 회사가 정한 유료서비스 이용을 위해 구매·충전·지급되는 결제 단위를 말합니다.</li>
          <li :style="liStyle">"유료 크레딧"이란 결제하여 충전한 크레딧을 말합니다.</li>
          <li :style="liStyle">"무료 크레딧(보너스 크레딧)"이란 프로모션·이벤트·보너스 등으로 무상 제공되는 크레딧을 말합니다.</li>
          <li :style="liStyle">"이용기록"이란 회원의 검색·열람·클릭·필터/정렬·체류시간·오류로그·학습상태 변경·퀴즈 풀이 결과·포텐북 열람 이력 등 서비스 이용 과정에서 생성되는 기록을 말합니다.</li>
          <li :style="liStyle">"회사 콘텐츠"란 서비스 내 회사가 제공하거나 편집·구성한 텍스트, 이미지, UI, 데이터베이스, 문제·해설, 포텐북 콘텐츠, 리포트 등 일체의 콘텐츠를 말합니다.</li>
        </ol>
        <p :style="pStyle">② 이 약관에서 정하지 아니한 용어는 관계 법령 및 서비스 내 안내 또는 운영정책에서 정하는 바에 따릅니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제3조 (약관의 효력 및 변경)</h2>
        <p :style="pStyle">① 이 약관은 회원이 동의하고 서비스에 가입하거나 서비스를 이용하는 시점부터 효력이 발생합니다.</p>
        <p :style="pStyle">② 회사는 관계 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있습니다.</p>
        <p :style="pStyle">③ 회사가 약관을 변경하는 경우 회사는 적용일자 및 주요 변경 내용을 적용일 전까지 서비스 내 공지 또는 기타 방법으로 안내합니다.</p>
        <p :style="pStyle">④ 회원이 변경 약관의 적용일 이후에도 서비스를 계속 이용하시는 경우 변경 약관에 동의하신 것으로 봅니다.</p>
        <p :style="pStyle">⑤ 회원이 변경 약관에 동의하지 않으시는 경우, 회원은 서비스 이용을 중단하고 회원 탈퇴를 요청하실 수 있습니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제4조 (서비스의 내용)</h2>
        <p :style="pStyle">① 회사는 취업 준비생 및 구직자를 위한 다양한 서비스를 제공합니다. 주요 서비스는 다음 각 호와 같습니다.</p>
        
        <div :style="serviceItemStyle">
          <h3 :style="h3Style">1. AI 모의 면접(AI 인터뷰) 서비스</h3>
          <p :style="pStyle">사용자가 이력서, 포트폴리오, 경력 등의 정보를 제공하면 해당 정보를 토대로 AI가 실제 면접과 유사한 질문을 진행합니다. 사용자는 AI의 질문에 답변하며, 면접이 완료되면 AI가 답변을 분석하여 평가 결과를 생성합니다. 이 평가 결과는 리포트 형태로 제공되며, 회원은 추후 이메일 등을 통해 면접 리포트를 받아볼 수 있습니다.</p>
        </div>

        <div :style="serviceItemStyle">
          <h3 :style="h3Style">2. 포텐워드(PotenWord)</h3>
          <p :style="pStyle">포텐워드는 취업 준비와 실무 학습 과정에서 자주 마주치는 IT 개발 용어를 검색하고, 용어별로 핵심 개념과 연결 지식을 확인할 수 있도록 돕는 서비스입니다. 회원은 관심 키워드를 검색해 빠르게 정의를 확인하고, 관련 용어를 따라가며 학습 흐름을 만들 수 있습니다. 또한 검색·열람 등 이용 기록은 서비스 품질 개선, 오류 분석, 인기 용어 통계 산출 및 개인화 기능 제공을 위해 집계 형태로 활용될 수 있습니다.</p>
        </div>

        <div :style="serviceItemStyle">
          <h3 :style="h3Style">3. 포텐노트(PotenNote)</h3>
          <p :style="pStyle">포텐노트는 중요한 용어와 개념을 나만의 방식으로 기록하고 다시 복습할 수 있는 개인 학습 노트 서비스입니다. 회원은 학습 중 이해가 부족했던 용어를 저장한 뒤, 학습 상태를 표시해 진행률과 완료율을 체계적으로 관리할 수 있습니다. 노트 작성·수정·열람 및 학습 상태 변경과 같은 이용 기록은 기능 개선과 학습 경험 최적화를 위해 분석될 수 있습니다.</p>
        </div>

        <div :style="serviceItemStyle">
          <h3 :style="h3Style">4. 포텐퀴즈(PotenQuiz)</h3>
          <p :style="pStyle">회원의 직무 지식 및 면접 대비를 돕기 위한 퀴즈 기능을 제공합니다. 다양한 분야의 문제를 풀면서 지식을 점검할 수 있고, 퀴즈 결과에 따라 정답률 등의 통계가 제공됩니다. 회원은 반복 도전을 통해 자신의 약점을 보완할 수 있으며, 틀린 문제는 오답노트에 자동으로 기록되어 추후 복습에 활용할 수 있습니다. 퀴즈 풀이/정답 여부/재도전/소요 시간 등 이용 기록은 학습 통계 제공, 문항 품질 개선, 부정 이용 방지 및 개인화 추천을 위해 활용될 수 있습니다.</p>
        </div>

        <div :style="serviceItemStyle">
          <h3 :style="h3Style">5. 포텐북(PotenBook)</h3>
          <p :style="pStyle">취업 및 면접 관련 지식과 정보를 제공하는 디지털 콘텐츠 라이브러리입니다. 회원은 다양한 취업 노하우, 면접 가이드, 기업 정보 등을 포텐북을 통해 열람할 수 있습니다. 포텐북 콘텐츠 중 일부는 무료로 제공되며, 전문적인 자료나 고급 정보 등이 포함된 일부 콘텐츠는 유료로 제공될 수 있습니다. 또한 이용자가 열람한 포텐북 콘텐츠(최근 본 북, 열람 이력 등)는 이어보기 제공, 개인화 추천, 콘텐츠 품질 개선을 위해 기록·활용될 수 있습니다.</p>
        </div>

        <p :style="pStyle">② 회사는 운영상 필요에 따라 서비스의 전부 또는 일부를 추가·변경·종료할 수 있으며, 그 절차는 제12조에 따릅니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제7조 (이용자 연령 및 법정대리인 동의)</h2>
        <p :style="pStyle">① 서비스는 전 연령대의 이용자에게 열려 있으며, 원칙적으로 회원 가입 및 서비스 이용에 연령 제한은 없습니다.</p>
        <p :style="pStyle">② 만 14세 미만의 아동이 회원으로 가입하고자 하는 경우에는 법정대리인의 동의를 받으셔야 합니다.</p>
        <p :style="pStyle">③ 미성년자인 회원이 유료서비스를 이용하여 결제하는 경우에도 법정대리인의 동의가 필요할 수 있으며, 법정대리인의 동의 없이 미성년자가 유료 결제를 한 경우 해당 미성년자 또는 법정대리인이 그 계약을 취소할 수 있습니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제8조 (개인정보 수집 및 이용에 관한 개요)</h2>
        <p :style="pStyle">① 회사는 회원의 개인정보 및 서비스 이용 데이터를 안전하게 관리하며, 수집된 정보를 다음 각 호의 목적을 위하여 활용할 수 있습니다.</p>
        <ol :style="olStyle">
          <li :style="liStyle">회원 식별 및 서비스 제공, 계정 관리</li>
          <li :style="liStyle">개인화 추천, 맞춤형 학습/퀴즈 구성, 콘텐츠 안내</li>
          <li :style="liStyle">서비스 품질 개선, 오류 분석, 통계 산출, 보안 및 부정 이용 방지</li>
          <li :style="liStyle">AI 인터뷰 리포트 제공 및 AI 기능 개선(연구·개발 목적 포함)</li>
        </ol>

        <p :style="pStyle">② 회사는 다음 각 호의 정보를 수집·이용할 수 있습니다.</p>
        <div :style="infoCollectionStyle">
          <h4 :style="h4Style">1. 회원가입 및 프로필 정보</h4>
          <ul :style="ulStyle">
            <li :style="liStyle">이메일 주소 등 계정 정보</li>
            <li :style="liStyle">회원이 선택적으로 제공하시는 이력서/경력/포트폴리오 정보</li>
            <li :style="liStyle">관심 분야(예: 관심 직무, 관심 기술, 학습 목표 등)</li>
          </ul>

          <h4 :style="h4Style">2. AI 인터뷰 응답 데이터</h4>
          <ul :style="ulStyle">
            <li :style="liStyle">AI 모의 면접 답변 내용</li>
            <li :style="liStyle">AI 분석 결과 및 면접 리포트</li>
          </ul>

          <h4 :style="h4Style">3. 포텐워드 이용 데이터</h4>
          <ul :style="ulStyle">
            <li :style="liStyle">저장한 용어</li>
            <li :style="liStyle">검색·열람한 용어 및 관련 이용기록</li>
          </ul>

          <h4 :style="h4Style">4. 퀴즈 활동 데이터</h4>
          <ul :style="ulStyle">
            <li :style="liStyle">도전 횟수, 문제별 정답 여부, 점수/정답률</li>
            <li :style="liStyle">재도전 횟수, 소요 시간</li>
            <li :style="liStyle">오답노트 기록 및 복습 이력</li>
          </ul>

          <h4 :style="h4Style">5. 포텐북 열람 기록</h4>
          <ul :style="ulStyle">
            <li :style="liStyle">열람한 콘텐츠, 최근 본 북, 열람 이력</li>
          </ul>

          <h4 :style="h4Style">6. 기타 이용 로그 및 기기 정보</h4>
          <ul :style="ulStyle">
            <li :style="liStyle">접속 IP, 브라우저/기기 종류, 접속 시간, 쿠키, 오류 로그 등</li>
            <li :style="liStyle">검색/열람/클릭/필터·정렬 사용/체류 시간/오류 로그 등 이용기록</li>
          </ul>
        </div>

        <p :style="pStyle">③ 회사는 서비스 개선 및 안정적 운영을 위해 제②항의 이용기록을 분석할 수 있으며, 가능한 범위에서 집계 또는 비식별화된 형태로 수행할 수 있습니다.</p>
        <p :style="pStyle">④ 개인정보 처리와 관련된 구체적인 사항(수집 항목, 보유기간, 국외 이전, 위탁, 이용자 권리 행사 등)은 회사의 개인정보처리방침에 따릅니다.</p>
        <p :style="pStyle">⑤ 회사는 AI 인터뷰 제공을 위해 외부 AI 서비스(OpenAI API 등)를 이용할 수 있으며, 이 과정에서 회원이 입력하신 정보 및 답변 일부가 해당 서비스로 전송될 수 있습니다. 국외 이전 등 상세 사항은 개인정보처리방침에 따릅니다.</p>
        <p :style="pStyle">⑥ <strong>개인정보 보관 및 파기:</strong> 개인정보는 수집 및 이용 목적이 달성된 후 지체 없이 파기됩니다. 단, 관계 법령에 따라 보존할 필요가 있는 경우에는 해당 법령에서 정한 기간 동안 보관합니다.</p>
        <p :style="pStyle">⑦ <strong>사용자 권리:</strong> 회원은 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제를 요청할 수 있으며, 회사는 관계 법령에 따라 이를 처리합니다. 개인정보 삭제 요청 시 회원 탈퇴 절차를 통해 진행하실 수 있습니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제9조 (금지행위 및 제재)</h2>
        <p :style="pStyle">① 회원은 서비스 이용과 관련하여 다음 각 호의 행위를 하여서는 아니 됩니다.</p>
        <ol :style="olStyle">
          <li :style="liStyle">불법 또는 부당한 행위</li>
          <li :style="liStyle">부적절한 콘텐츠의 게시 또는 전송(해당 기능 제공 시)</li>
          <li :style="liStyle">저작권 등 지식재산권 침해(회사 또는 타인의 저작물·콘텐츠를 무단 복제, 무단 배포, 상업적 이용 등)</li>
          <li :style="liStyle">서비스 운영 방해(해킹, 악성코드 유포, 비정상 트래픽 유발, 타인 계정 무단 접근 등)</li>
          <li :style="liStyle">무단 광고 및 상업 행위(회사 승인 없는 홍보, 스팸 발송, 영업/판매 행위 등)</li>
          <li :style="liStyle">기타 약관 또는 회사 정책 위반 행위(사칭, 허위 정보 등록 등)</li>
        </ol>

        <p :style="pStyle">② 회사는 회원이 제①항을 위반한 경우 다음 각 호의 조치를 할 수 있습니다.</p>
        <ol :style="olStyle">
          <li :style="liStyle">게시물/콘텐츠 삭제 또는 접근 제한</li>
          <li :style="liStyle">서비스 이용 일시 정지</li>
          <li :style="liStyle">회원자격 해지(강제 탈퇴)</li>
        </ol>

        <p :style="pStyle">③ 제②항의 조치 과정에서 회원이 보유한 크레딧 또는 이용권 등의 권리는 소멸될 수 있으며, 약관 위반으로 인한 이용 제한에 대하여 회사는 보상 또는 환불을 제공하지 않을 수 있습니다.</p>
        <p :style="pStyle">④ 회원의 위법 또는 약관 위반 행위로 회사 또는 제3자에게 손해가 발생한 경우, 해당 회원은 민형사상 책임을 부담하셔야 합니다.</p>
        <p :style="pStyle">⑤ 회사는 필요한 경우 위반 행위를 관계 당국에 신고하거나 법적 조치를 취할 수 있습니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제10조 (AI 결과물 고지 및 면책)</h2>
        <p :style="pStyle">① 회사는 AI 기반 기능(예: AI 모의 면접 질문 생성, 답변 분석, 피드백 및 리포트 생성 등)을 제공할 수 있습니다.</p>
        <p :style="pStyle">② AI 결과물은 자동 생성된 정보로서 부정확, 누락, 편향, 최신성 부족 등의 한계가 있을 수 있으며, 회사는 그 정확성, 완전성, 특정 목적 적합성, 무오류성을 보증하지 않습니다.</p>
        <p :style="pStyle">③ 회원은 AI 결과물을 외부 제출 또는 의사결정에 활용하시는 경우 사실관계 확인 및 표현의 적법성, 저작권/권리침해 여부를 스스로 점검하셔야 합니다.</p>
        <p :style="pStyle">④ 회원의 AI 입력 정보 또는 AI 결과물의 사용으로 인해 발생한 손해에 대하여, 회사의 고의 또는 중대한 과실이 없는 한 회사는 책임을 부담하지 않습니다.</p>
        <p :style="pStyle">⑤ 회사는 서비스 품질 향상 및 안전한 운영을 위해 AI 기능의 일부를 변경, 제한, 중단할 수 있으며, 필요 시 사전 또는 사후에 공지할 수 있습니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제11조 (콘텐츠 저작권 및 정책의 적용)</h2>
        <p :style="pStyle">① 회사 콘텐츠에 관한 저작권 및 지식재산권은 회사 또는 정당한 권리자에게 귀속됩니다.</p>
        <p :style="pStyle">② 회원은 서비스 이용 범위에서 회사 콘텐츠를 열람·사용하실 수 있으나, 회사의 사전 서면 동의 없이 다음 각 호의 행위를 하여서는 아니 됩니다.</p>
        <ol :style="olStyle">
          <li :style="liStyle">복제, 배포, 전송, 공중송신, 전시</li>
          <li :style="liStyle">2차적 저작물 작성</li>
          <li :style="liStyle">상업적 이용</li>
        </ol>
        <p :style="pStyle">③ 회원이 서비스 내 업로드하거나 작성하는 콘텐츠(이력서, 포트폴리오, 면접 답변, 노트 등)는 제3자의 권리를 침해하지 않아야 하며, 분쟁 발생 시 회원은 자신의 책임과 비용으로 이를 해결하고 회사에 발생한 손해를 배상하셔야 합니다.</p>
        <p :style="pStyle">④ 회사는 저작권 침해 신고가 접수되거나 합리적으로 권리 침해가 의심되는 경우 관계 법령 및 운영정책에 따라 해당 콘텐츠의 게시 제한, 삭제, 접근 차단 등의 조치를 취할 수 있습니다.</p>
        <p :style="pStyle">⑤ 본 조에서 정하지 아니한 저작권 및 콘텐츠 이용의 상세 기준, 신고/조치 절차 등은 회사가 별도로 정한 저작권 정책(콘텐츠 이용 정책)에 따릅니다.</p>
        <p :style="pStyle">⑥ 회사는 운영상 필요에 따라 저작권 정책의 내용을 변경할 수 있으며, 변경 사항은 서비스 공지 등을 통해 안내할 수 있습니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제12조 (서비스 제공, 변경 및 중단)</h2>
        <p :style="pStyle">① 회사는 서비스의 전부 또는 일부를 연중무휴로 제공하는 것을 원칙으로 합니다. 다만 다음 각 호의 사유가 있는 경우 서비스의 전부 또는 일부를 일시적으로 중단하거나 제한할 수 있습니다.</p>
        <ol :style="olStyle">
          <li :style="liStyle">시스템 점검, 유지보수, 서버/네트워크 장애</li>
          <li :style="liStyle">정전, 통신사 장애, 클라우드/외부 서비스 장애 등 불가항력</li>
          <li :style="liStyle">보안상 필요(해킹 의심, 이상 트래픽, 취약점 대응 등)</li>
          <li :style="liStyle">기타 회사가 합리적으로 필요한 경우</li>
        </ol>
        <p :style="pStyle">② 회사는 운영상 필요에 따라 서비스의 기능, UI, 정책, 제공 방식 등을 변경할 수 있습니다.</p>
        <p :style="pStyle">③ 제②항의 변경이 회원에게 중대한 영향을 미치는 경우 회사는 합리적인 범위에서 사전 공지합니다. 다만 긴급한 보안 조치 등 부득이한 사유가 있는 경우 사후 공지할 수 있습니다.</p>
        <p :style="pStyle">④ 회사가 유료서비스의 제공을 중단하거나 중요한 변경을 하는 경우, 회원에게 미치는 영향 및 필요 시 환불/보상 여부는 관계 법령 및 회사의 운영정책에 따라 처리됩니다.</p>
        <p :style="pStyle">⑤ 본 조에 따른 중단 또는 변경으로 회원에게 손해가 발생하더라도 회사의 고의 또는 중대한 과실이 없는 한 회사는 책임을 부담하지 않습니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제13조 (공지 및 통지)</h2>
        <p :style="pStyle">① 회사는 이 약관에 따른 공지 또는 통지를 서비스 내 공지사항, 팝업, 푸시 알림, 이메일 등 회사가 정한 방법으로 할 수 있습니다.</p>
        <p :style="pStyle">② 회원에게 개별 통지가 필요한 경우 회사는 회원이 등록한 이메일 주소 등 연락처로 통지할 수 있습니다.</p>
        <p :style="pStyle">③ 회원이 연락처 정보를 최신으로 유지하지 않아 발생한 불이익에 대하여 회사는 책임을 부담하지 않습니다.</p>
        <p :style="pStyle">④ 회사가 공지사항 게시 방식으로 통지한 경우 특별한 사정이 없는 한 게시 시점에 통지가 이루어진 것으로 봅니다.</p>
      </section>

      <section :style="sectionStyle">
        <h2 :style="h2Style">제14조 (분쟁해결, 준거법 및 관할)</h2>
        <p :style="pStyle">① 회사와 회원은 서비스 이용과 관련하여 분쟁이 발생한 경우 원만한 해결을 위해 성실히 협의합니다.</p>
        <p :style="pStyle">② 협의로 해결되지 아니하는 경우 회사와 회원은 관계 법령에 따라 분쟁 해결 절차(소비자 관련 분쟁조정 등)를 이용할 수 있습니다.</p>
        <p :style="pStyle">③ 이 약관 및 서비스 이용에 관한 분쟁에 대해서는 대한민국 법령을 준거법으로 합니다.</p>
        <p :style="pStyle">④ 이 약관 및 서비스 이용과 관련하여 소송이 제기되는 경우 관할 법원은 민사소송법 등 관계 법령에 따릅니다.</p>
        <p :style="pStyle">⑤ 회사는 필요 시 "회사 본점 소재지 관할 법원"을 1심 전속관할로 정할 수 있습니다.</p>
      </section>

      <section :style="contactSectionStyle">
        <h2 :style="h2Style">제15조 (문의 및 고객센터)</h2>
        <p :style="pStyle">① 서비스 이용 및 개인정보 처리와 관련하여 문의사항이 있으신 경우 다음의 연락처로 문의하실 수 있습니다.</p>
        <div :style="contactInfoStyle">
          <div :style="contactItemStyle">
            <span :style="contactLabelStyle">이메일</span>
            <a href="mailto:iptoensupport@gmail.com" :style="contactValueStyle">iptoensupport@gmail.com</a>
          </div>
          <div :style="contactItemStyle">
            <span :style="contactLabelStyle">회사명</span>
            <span :style="contactValueStyle">I-Cygnus</span>
          </div>
          <div :style="contactItemStyle">
            <span :style="contactLabelStyle">서비스명</span>
            <span :style="contactValueStyle">I-Poten</span>
          </div>
        </div>
        <p :style="pStyle">② 회사는 회원의 문의에 대하여 신속하고 성실하게 답변하도록 노력합니다.</p>
      </section>

      <section :style="appendixStyle">
        <h2 :style="appendixH2Style">부칙</h2>
        <p :style="pStyle">① 이 약관은 2026년 2월 1일부터 시행합니다.</p>
        <p :style="pStyle">② 본 약관 시행 이전에 가입한 회원에 대해서도 본 약관이 적용됩니다.</p>
      </section>
    </div>

    <div :style="footerStyle">
      <button @click="goBack" :style="btnBackStyle">뒤로 가기</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, onUnmounted } from 'vue';

const router = useRouter();

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const isMobile = computed(() => windowWidth.value <= 640);
const onResize = () => { windowWidth.value = window.innerWidth; };
onMounted(() => { window.addEventListener('resize', onResize); });
onUnmounted(() => { window.removeEventListener('resize', onResize); });

const goBack = () => {
  router.back();
};

const containerStyle = computed(() => ({
  maxWidth: '1100px',
  margin: '0 auto',
  padding: isMobile.value ? '40px 16px' : '80px 40px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", Roboto, "Helvetica Neue", Arial, sans-serif',
  lineHeight: '1.8',
  color: '#2c3e50',
  background: 'linear-gradient(to bottom, #f5f7fa 0%, #ffffff 100%)',
  minHeight: '100vh',
}));

const headerStyle = computed(() => ({
  textAlign: 'center' as const,
  marginBottom: isMobile.value ? '36px' : '64px',
  padding: isMobile.value ? '32px 20px' : '48px 40px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: isMobile.value ? '14px' : '20px',
  boxShadow: '0 12px 48px rgba(102, 126, 234, 0.35)',
  position: 'relative' as const,
  overflow: 'hidden' as const,
}));

const h1Style = computed(() => ({
  fontSize: isMobile.value ? '26px' : '40px',
  fontWeight: '800',
  color: '#ffffff',
  marginBottom: isMobile.value ? '20px' : '28px',
  letterSpacing: '-0.8px',
  position: 'relative' as const,
  zIndex: 1,
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  wordBreak: 'keep-all' as const,
}));

const metaInfoStyle = {
  fontSize: '15px',
  color: 'rgba(255, 255, 255, 0.98)',
  background: 'rgba(255, 255, 255, 0.18)',
  padding: '24px 28px',
  borderRadius: '14px',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  position: 'relative' as const,
  zIndex: 1,
  maxWidth: '600px',
  margin: '0 auto',
};

const metaPStyle = {
  margin: '12px 0',
  fontWeight: '500',
  lineHeight: '1.6',
};

const contentStyle = {
  marginBottom: '48px',
};

const sectionStyle = computed(() => ({
  marginBottom: '36px',
  padding: isMobile.value ? '24px 18px' : '40px 44px',
  background: '#ffffff',
  borderRadius: isMobile.value ? '14px' : '18px',
  boxShadow: '0 3px 16px rgba(0, 0, 0, 0.07)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const h2Style = computed(() => ({
  fontSize: isMobile.value ? '21px' : '28px',
  fontWeight: '700',
  color: '#1a1a2e',
  marginBottom: isMobile.value ? '20px' : '28px',
  paddingBottom: '18px',
  borderBottom: '3px solid #667eea',
  letterSpacing: '-0.5px',
  wordBreak: 'keep-all' as const,
}));

const h3Style = {
  fontSize: '21px',
  fontWeight: '600',
  color: '#667eea',
  marginTop: '0',
  marginBottom: '16px',
  letterSpacing: '-0.3px',
};

const h4Style = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#2c3e50',
  marginTop: '22px',
  marginBottom: '14px',
  paddingLeft: '16px',
  borderLeft: '4px solid #667eea',
  letterSpacing: '-0.2px',
};

const pStyle = {
  marginBottom: '20px',
  color: '#495057',
  lineHeight: '2',
  fontSize: '16px',
  wordBreak: 'keep-all' as const,
  letterSpacing: '-0.2px',
};

const olStyle = {
  marginLeft: '28px',
  marginBottom: '20px',
  paddingLeft: '8px',
};

const ulStyle = {
  marginLeft: '24px',
  marginBottom: '20px',
  listStyleType: 'disc' as const,
};

const liStyle = {
  marginBottom: '16px',
  paddingLeft: '12px',
  color: '#495057',
  lineHeight: '1.9',
  fontSize: '16px',
  wordBreak: 'keep-all' as const,
  letterSpacing: '-0.2px',
};

const serviceItemStyle = computed(() => ({
  margin: '28px 0',
  padding: isMobile.value ? '20px 16px' : '28px 32px',
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  borderLeft: '6px solid #667eea',
  borderRadius: '14px',
  boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease',
}));

const infoCollectionStyle = computed(() => ({
  margin: '28px 0',
  padding: isMobile.value ? '20px 16px' : '32px',
  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
  borderRadius: '14px',
  border: '2px solid #e9ecef',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
}));

const contactSectionStyle = computed(() => ({
  marginBottom: '36px',
  padding: isMobile.value ? '24px 18px' : '40px 44px',
  background: 'linear-gradient(135deg, #f0f4ff 0%, #e3f2fd 100%)',
  borderRadius: isMobile.value ? '14px' : '18px',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
  border: '2px solid #667eea',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const contactInfoStyle = {
  margin: '28px 0',
  padding: '32px',
  background: 'white',
  borderRadius: '14px',
  boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
};

const contactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '18px 0',
  borderBottom: '1px solid #e9ecef',
};

const contactLabelStyle = {
  fontWeight: '600',
  color: '#495057',
  minWidth: '110px',
  fontSize: '16px',
};

const contactValueStyle = {
  color: '#667eea',
  fontWeight: '500',
  fontSize: '16px',
  textDecoration: 'none',
};

const appendixStyle = computed(() => ({
  marginBottom: '36px',
  padding: isMobile.value ? '24px 18px' : '40px 44px',
  background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
  borderRadius: isMobile.value ? '14px' : '18px',
  boxShadow: '0 3px 16px rgba(76, 175, 80, 0.15)',
  borderLeft: '6px solid #4caf50',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const appendixH2Style = computed(() => ({
  fontSize: isMobile.value ? '21px' : '28px',
  fontWeight: '700',
  color: '#1a1a2e',
  marginBottom: isMobile.value ? '20px' : '28px',
  paddingBottom: '18px',
  borderBottom: '3px solid #4caf50',
  letterSpacing: '-0.5px',
}));

const footerStyle = {
  textAlign: 'center' as const,
  padding: '48px 0 24px',
};

const btnBackStyle = {
  padding: '16px 56px',
  fontSize: '17px',
  fontWeight: '600',
  color: 'white',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  borderRadius: '32px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
  letterSpacing: '-0.2px',
};
</script>
