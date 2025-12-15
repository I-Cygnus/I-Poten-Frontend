<script lang="ts">
	type Member = {
		name: string;
		role?: string;
		photo: string;
		github?: string;
		email?: string;
		linkedin?: string;
	};

	const DEFAULT_TEAM: Member[] = [
		{
			name: '임운철',
			role: 'MFE, SEO, PL',
			photo: '/images/team/duck.jpg',
			github: 'https://github.com/unchul',
			email: 'unchul87@gmail.com'
		},
		{
			name: '최현수',
			role: 'AI-Interview, CI/CD',
			photo: '/images/team/war.gif',
			github: 'https://github.com/username2',
			email: 'kim@example.com'
		},
		{
			name: '배틀코더',
			role: 'Admin',
			photo: '/images/team/bomb.webp',
			github: 'https://github.com/puppy1012',
			email: 'puppy1012@naver.com'
		},
		{
			name: '정은선',
			role: 'MyPage',
			photo: '/images/team/sun.jpg',
			github: 'https://github.com/yeolmu96',
			email: 'jeonges924@gmail.com'
		},
		{
			name: '박태준',
			role: 'StudyRoom',
			photo: '/images/team/jun.jpg',
			github: 'https://github.com/Roto90-BackEnd',
			email: 'slalala90@gmail.com'
		},
		{
			name: '김정민',
			role: 'SpoonWord',
			photo: '/images/team/min.jpg',
			github: 'https://github.com/Mur-pixel',
			email: 'broaden550@gmail.com'
		},
		{
			name: '김지한',
			role: 'Flutter Mobile',
			photo: '/images/team/han.png',
			github: 'https://github.com/username7',
			email: 'mun@example.com'
		}
	];

	const DEFAULT_LEGACY: Member[] = [
		{ name: '최병준', photo: '/images/legacy/1.jpg' },
		{ name: '김현우', photo: '/images/legacy/2.jpg' },
		{ name: '오민수', photo: '/images/legacy/3.jpg' },
		{ name: '왕환민', photo: '/images/legacy/4.jpg' },
		{ name: '양의정', photo: '/images/legacy/5.jpg' }
	];

	/* 공헌자: PM 1 + 수석 디자이너 1 (총 2명) */
	const DEFAULT_CONTRIBUTORS: Member[] = [
		{
			name: 'P M',
			role: 'eddi',
			photo: '/images/contrib/sanghoonlee.jpg',
			github: 'https://github.com/example'
		},
		{
			name: '디자이너',
			role: '참  새',
			photo: '/images/contrib/sparrow_png.png',
			linkedin: 'https://www.linkedin.com/in/example'
		}
	];

	export let team: Member[] = DEFAULT_TEAM;
	export let legacy: Member[] = DEFAULT_LEGACY;
	export let contributors: Member[] = DEFAULT_CONTRIBUTORS;

	const mailto = (email?: string) => (email ? `mailto:${email}` : undefined);

	let flipped = new Set<number>();
	const toggleFlip = (i: number) => {
		const next = new Set(flipped);
		next.has(i) ? next.delete(i) : next.add(i);
		flipped = next;
	};
</script>

<section class="about">
	<section class="hero">
		<div class="hero__inner">
			<h1>About <span>JobSpoon</span></h1>
			<p class="subtitle">AI 인터뷰 · 면접 스터디 · 스푼워드 · 마이페이지 레벨 시스템</p>

			<!-- 버튼 스타일의 목차(퀵링크) -->
			<nav class="quicklinks" aria-label="About Us quick links">
				<a class="quickbtn" href="#features"><span>무엇을 할 수 있나요?</span></a>
				<a class="quickbtn" href="#ai-interview"><span>AI 인터뷰</span></a>
				<a class="quickbtn" href="#study"><span>면접 스터디</span></a>
				<a class="quickbtn" href="#spoonword"><span>스푼워드</span></a>
				<a class="quickbtn" href="#mypage"><span>마이페이지 & 레벨</span></a>
				<a class="quickbtn" href="#team"><span>팀 소개</span></a>
				<a class="quickbtn" href="#legacy"><span>JobStick</span></a>
				<a class="quickbtn" href="#contributors"><span>공헌자</span></a>
			</nav>
		</div>
	</section>

	<section id="features" class="section">
		<h2>잡스푼에서 할 수 있는 것들</h2>
		<div class="cards">
			<article class="card">
				<h3>AI 인터뷰</h3>
				<p>직무·언어 선택 → 실전 답변 → 자동 채점/피드백.</p>
			</article>
			<article class="card">
				<h3>면접 스터디</h3>
				<p>모집/참석, 온·오프라인 운영, 출석/과제/피드백 관리.</p>
			</article>
			<article class="card">
				<h3>스푼워드</h3>
				<p>용어 저장·단어장·퀴즈/시험·반복학습으로 약점 보완.</p>
			</article>
			<article class="card">
				<h3>마이페이지</h3>
				<p>활동 지표 집계 → 성실도/레벨 업으로 동기 부여.</p>
			</article>
		</div>
	</section>

	<section id="ai-interview" class="section">
		<h2>AI 인터뷰는 이렇게 진행돼요</h2>
		<ol class="steps">
			<li><strong>세션 구성:</strong> 직무/경력/키워드·언어 선택 → 질문 세트 생성</li>
			<li><strong>응답 방식:</strong> 음성/텍스트, 시간 제한(예: 1~2분), 재응답 옵션</li>
			<li><strong>평가/피드백:</strong> 명확성·논리·심화·키워드 적합도 기반 점수와 개선 팁</li>
			<li><strong>리뷰/재학습:</strong> 오답노트·모범답안·추가 연습</li>
			<li><strong>공유/기록:</strong> 스터디 공유, 마이페이지 누적 추적</li>
		</ol>
	</section>

	<!-- ✅ 복구: 면접 스터디 섹션 -->
	<section id="study" class="section">
		<h2>면접 스터디: 모집하고, 참석하고, 성장하세요</h2>
		<div class="grid2">
			<div>
				<h3>모집</h3>
				<ul class="bullets">
					<li>모집글: 주제·진행·일정·정원</li>
					<li>온/오프라인·하이브리드, 출석 체크/과제</li>
					<li>AI 질문 뱅크로 질문 자동 생성</li>
				</ul>
			</div>
			<div>
				<h3>참석</h3>
				<ul class="bullets">
					<li>캘린더/알림, 실시간 타이머/스피치 가이드</li>
					<li>발표 → 피드백 → 리트라이 루프</li>
					<li>참석률/기여도 자동 집계(마이페이지 연동)</li>
				</ul>
			</div>
		</div>
	</section>
	<!-- ✅ 복구 끝 -->

	<section id="spoonword" class="section">
		<h2>스푼워드: 나만의 단어장으로 약점 공략</h2>
		<div class="grid2">
			<div>
				<h3>수집</h3>
				<p>키워드 검색 → 설명/예시/연관질문을 카드로 저장, 태그로 분류</p>
			</div>
			<div>
				<h3>학습/시험</h3>
				<p>플래시카드·객관식·서술형, SRS(간격 반복)로 자동 복습 주기</p>
			</div>
		</div>
	</section>

	<section id="mypage" class="section">
		<h2>마이페이지 & 성실도/레벨 시스템</h2>
		<div class="kpis">
			<div class="kpi"><span class="num">128</span><span class="label">작성 글</span></div>
			<div class="kpi"><span class="num">23회</span><span class="label">AI 인터뷰</span></div>
			<div class="kpi"><span class="num">86점</span><span class="label">최근 인터뷰</span></div>
			<div class="kpi"><span class="num">92%</span><span class="label">참석률</span></div>
			<div class="kpi"><span class="num">41회</span><span class="label">단어 시험</span></div>
		</div>
		<p class="muted">
			* 위 값은 예시입니다. 실제로는 활동 데이터로 가중치/누적 계산 후 성실도와 레벨을 산출합니다.
		</p>
	</section>

	<section id="team" class="section">
		<h2>Team JobSpoon</h2>
		<div class="team">
			{#each team as m, i}
				<button
					class="flipcard"
					class:is-flipped={flipped.has(i)}
					aria-label={`${m.name} 정보 보기`}
					aria-pressed={flipped.has(i)}
					on:click={() => toggleFlip(i)}
				>
					<div class="flipcard__inner">
						<div
							class="flipcard__content"
							style={`--counter:${flipped.has(i) ? '-180deg' : '0deg'}`}
						>
							{#if flipped.has(i)}
								<div class="back">
									<strong>{m.name}</strong>
									{#if m.github}<a class="link" href={m.github} target="_blank" rel="noreferrer"
											>GitHub</a
										>{/if}
									{#if m.linkedin}<a class="link" href={m.linkedin} target="_blank" rel="noreferrer"
											>LinkedIn</a
										>{/if}
									{#if m.email}<a class="link" href={mailto(m.email)}>이메일</a>{/if}
								</div>
							{:else}
								<div class="front">
									<img src={m.photo} alt={`${m.name} 사진`} loading="lazy" draggable="false" />
									<div class="caption">
										<strong>{m.name}</strong>
										{#if m.role}<span class="role">{m.role}</span>{/if}
									</div>
								</div>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	</section>

	<section id="legacy" class="section">
		<h2>JobStick의 유산</h2>
		<p>
			잡스푼은 <strong>잡스틱(JobStick)</strong>의 정신을 계승합니다. 함께해 주신 멤버들을
			기억합니다.
		</p>
		<div class="legacy">
			{#each legacy as m}
				<figure class="legacycard">
					<div class="legacycard__media">
						<img src={m.photo} alt={`${m.name} 사진`} loading="lazy" draggable="false" />
					</div>
					<figcaption>{m.name}</figcaption>
				</figure>
			{/each}
		</div>
	</section>

	<section id="contributors" class="section">
		<h2>프로젝트 완성에 크게 공헌해 주신 분</h2>
		<div class="contributors">
			{#each contributors as m}
				<figure class="contribcard">
					<div class="contribcard__media">
						<img src={m.photo} alt={`${m.name} 사진`} loading="lazy" draggable="false" />
					</div>
					<figcaption>
						<strong>{m.name}</strong>
						{#if m.role}<span>{m.role}</span>{/if}
					</figcaption>
				</figure>
			{/each}
		</div>
	</section>
</section>

<style>
	/* ===== Theme ===== */
	.about {
		--bg: #0f1115;
		--panel: #151922;
		--ink: #eaeaea;
		--ink-dim: #a0a0a0;
		--line: #2b2f41;
		--brand: #5b8cff;
		color: var(--ink);
		background: var(--bg);
		padding-bottom: 220px;
		user-select: none;
		-webkit-user-select: none;
	}
	:global([data-theme='light']) :global(.about) {
		--bg: #fff;
		--panel: #f7f8fa;
		--ink: #111;
		--ink-dim: #666;
		--line: #d1d5db;
		--brand: #1d4ed8;
	}

	/* ===== Hero / Quicklinks ===== */
	.hero {
		padding: 72px 20px 48px;
		border-bottom: 1px solid var(--line);
		background: linear-gradient(180deg, rgba(108, 124, 255, 0.12), transparent);
	}
	.hero__inner {
		max-width: 1100px;
		margin: 0 auto;
		text-align: center;
	}
	.hero h1 {
		font-size: 36px;
		margin: 0 0 10px;
		letter-spacing: -0.02em;
	}
	/* ▶ “JobSpoon” 색상 지정 */
	.hero h1 span {
		color: #01b0f1 !important;
	}

	.subtitle {
		color: var(--ink-dim);
		margin: 0 0 20px;
	}

	.quicklinks {
		display: flex;
		flex-wrap: wrap;
		gap: 30px; /* 1.5배 ↑ */
		justify-content: center;
	}
	.quickbtn {
		position: relative;
		display: inline-block;
		padding: 10px 14px;
		border-radius: 999px;
		border: 1px solid var(--line);
		color: var(--ink);
		text-decoration: none;
		background: var(--panel);
		overflow: hidden;
		transition:
			border-color 0.25s ease,
			transform 0.12s ease;
	}
	.quickbtn:hover {
		transform: translateY(-1px);
		border-color: color-mix(in srgb, var(--brand) 60%, var(--line));
	}
	.quickbtn::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			color-mix(in srgb, var(--brand) 22%, transparent),
			color-mix(in srgb, var(--brand) 55%, transparent)
		);
		transform: translateX(-100%);
		transition: transform 0.35s ease;
		z-index: 0;
	}
	.quickbtn:hover::before {
		transform: translateX(0);
	}
	.quickbtn > span {
		position: relative;
		z-index: 1;
	}

	/* ===== Sections (설명 간 간격 2배) ===== */
	.section {
		max-width: 1100px;
		margin: 160px auto;
		padding: 0 20px;
	} /* 80 → 160 */
	.section h2 {
		font-size: 24px;
		margin: 0 0 20px;
	}
	.section p {
		color: var(--ink-dim);
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 28px;
	}
	.card {
		background: var(--panel);
		border-radius: 14px;
		box-shadow: inset 0 0 0 1px var(--line);
		padding: 20px;
	}
	.steps {
		margin: 0;
		padding-left: 28px;
		color: var(--ink-dim);
	}
	.grid2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 36px;
	}
	.bullets {
		margin: 0;
		padding-left: 22px;
		color: var(--ink-dim);
	}
	.bullets li {
		margin: 10px 0;
	}

	/* ===== KPIs ===== */
	.kpis {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 20px;
		margin-top: 16px;
	}
	.kpi {
		background: var(--panel);
		border-radius: 14px;
		box-shadow:
			inset 0 0 0 1.5px var(--line),
			0 2px 8px rgba(0, 0, 0, 0.12);
		padding: 24px 16px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
	}
	.kpi .num {
		font-size: 20px;
		font-weight: 700;
	}
	.kpi .label {
		color: var(--ink-dim);
		font-size: 12px;
	}
	.muted {
		color: var(--ink-dim);
		font-size: 13px;
		margin-top: 10px;
	}

	/* ===== Team ===== */
	.team {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 24px;
	}
	.flipcard {
		border: 0;
		padding: 0;
		background: none;
		perspective: 1000px;
		isolation: isolate;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.flipcard:hover,
	.flipcard:focus-visible {
		transform: translateY(-6px);
	}
	.flipcard__inner {
		position: relative;
		width: 100%;
		aspect-ratio: 3/4;
		transform-style: preserve-3d;
		border-radius: 12px;
		overflow: hidden;
		background: transparent;
		box-shadow: inset 0 0 0 1px var(--line);
		transition:
			transform 0.6s ease,
			box-shadow 0.25s ease;
	}
	.flipcard.is-flipped .flipcard__inner {
		transform: rotateY(180deg);
		box-shadow:
			inset 0 0 0 1px var(--line),
			0 10px 24px rgba(0, 0, 0, 0.24),
			0 0 0 2px rgba(91, 140, 255, 0.45);
	}
	.flipcard__content {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transform-style: preserve-3d;
		transition: transform 0.6s ease;
	}
	.front,
	.back {
		position: absolute;
		inset: 0;
	}
	.front img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.caption {
		position: absolute;
		left: 8px;
		right: 8px;
		bottom: 8px;
		padding: 12px;
		border-radius: 10px;
		background: linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.78),
			rgba(0, 0, 0, 0.55) 40%,
			transparent 80%
		);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
	}
	.caption strong {
		color: #fff;
		font-weight: 800;
		font-size: 16px;
		line-height: 1.15;
		display: block;
	}
	/* ▶ 역할은 무조건 다음 줄로 */
	.caption .role {
		display: block;
		margin-top: 4px;
		white-space: normal;
		color: #e5e7eb;
		font-size: 13px;
		line-height: 1.2;
		opacity: 0.95;
	}

	.back {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		background: color-mix(in srgb, var(--bg) 85%, var(--panel) 15%);
		box-shadow: inset 0 0 0 2px var(--brand);
	}
	.link {
		color: var(--brand);
		text-decoration: none;
		font-size: 14px;
	}
	.link:hover {
		text-decoration: underline;
	}

	/* ===== Legacy ===== */
	.legacy {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 24px;
		filter: saturate(0.9) contrast(0.97);
	}
	.legacycard {
		margin: 0;
		border-radius: 12px;
		overflow: hidden;
		background: var(--panel);
		box-shadow: inset 0 0 0 1px var(--line);
	}
	.legacycard__media {
		position: relative;
		width: 100%;
		aspect-ratio: 3/4;
		overflow: hidden;
	}
	.legacycard__media > img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		-webkit-user-drag: none;
		user-drag: none;
	}
	.legacycard figcaption {
		padding: 8px;
		text-align: center;
		color: var(--ink-dim);
		font-size: 12px;
	}

	/* ===== Contributors (크기는 이전 그대로, 캡션 배경만 추가 구분) ===== */
	.contributors {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 24px;
	}
	.contribcard {
		margin: 0;
		border-radius: 12px;
		overflow: hidden;
		background: var(--panel);
		box-shadow: inset 0 0 0 1px var(--line);
	}
	.contribcard__media {
		position: relative;
		width: 100%;
		aspect-ratio: 3/4;
		overflow: hidden;
	}
	.contribcard__media > img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	/* ▶ 이름 영역 배경/구분선 추가 */
	.contribcard figcaption {
		padding: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		background: color-mix(in srgb, var(--panel) 85%, var(--brand) 15%); /* 은은한 틴트 */
		border-top: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
	}
	:global([data-theme='light']) :global(.about) .contribcard figcaption {
		background: color-mix(in srgb, var(--panel) 90%, var(--brand) 12%);
	}
	.contribcard figcaption > strong {
		font-size: 17px;
	}
	.contribcard figcaption > span {
		font-size: 13px;
		color: var(--ink-dim);
	}

	/* ===== Responsive ===== */
	@media (max-width: 1100px) {
		.cards {
			grid-template-columns: repeat(2, 1fr);
			gap: 24px;
		}
		.team {
			grid-template-columns: repeat(4, 1fr);
			gap: 20px;
		}
		.legacy {
			grid-template-columns: repeat(4, 1fr);
			gap: 20px;
		}
		.contributors {
			grid-template-columns: repeat(3, 1fr);
			gap: 24px;
		}
		.kpis {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	@media (max-width: 640px) {
		.cards {
			grid-template-columns: 1fr;
			gap: 20px;
		}
		.team {
			grid-template-columns: repeat(2, 1fr);
			gap: 16px;
		}
		.legacy {
			grid-template-columns: repeat(2, 1fr);
			gap: 16px;
		}
		.contributors {
			grid-template-columns: repeat(2, 1fr);
			gap: 20px;
		}
		.grid2 {
			grid-template-columns: 1fr;
			gap: 24px;
		}
		.kpis {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* 마지막 섹션과 푸터 사이 여백 */
	.section:last-of-type {
		margin-bottom: 160px;
	}
</style>
