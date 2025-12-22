<script lang="ts">
  import { onMount } from 'svelte';
  import { css } from '@emotion/css';

  // --- types
  type Review = {
    id: string;
    rating: 1 | 2 | 3 | 4 | 5;
    text: string;
    date: string;
    author?: string;
  };

  // --- props (runes)
  const { storageKey = 'review-widget:v1' } = $props<{ storageKey?: string }>();

  // --- state (runes)
  let rating = $state<0 | 1 | 2 | 3 | 4 | 5>(0);
  let hover = $state(0);
  let text = $state('');
  let submitting = $state(false);
  let reviews = $state<Review[]>([]);

  // --- derived (runes)
  const total = $derived(reviews.length);
  const avg = $derived(total ? +(reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : 0);

  // ⛳ NOTE: 복잡한 계산은 $derived.by(fn) 사용 (지금 에러의 원인)
  const counts = $derived.by<number[]>(() => {
    const c = [0, 0, 0, 0, 0, 0] as number[]; // index = rating
    for (const r of reviews) c[r.rating] += 1;
    return c;
  });

  // --- effects
  onMount(() => {
    try {
      const raw = typeof window !== 'undefined' && localStorage.getItem(storageKey);
      if (raw) {
        const parsed: Review[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          reviews = parsed.filter((r) => r && r.rating >= 1 && r.rating <= 5);
        }
      }
    } catch (e) {
      console.warn('[Review] localStorage load skipped:', e);
    }
  });

  function saveLocal() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reviews));
    } catch (e) {
      console.warn('[Review] localStorage save skipped:', e);
    }
  }

  async function handleSubmit() {
    if (!rating) return;
    submitting = true;

    const newReview: Review = {
      id: crypto.randomUUID(),
      rating: rating as 1 | 2 | 3 | 4 | 5,
      text: text.trim(),
      date: new Date().toISOString(),
      author: '익명'
    };

    reviews = [...reviews, newReview];
    saveLocal();

    // reset
    submitting = false;
    rating = 0; hover = 0; text = '';
  }

  function starFillPercent(index: number, value: number) {
    const diff = value - (index - 1);
    if (diff >= 1) return 100;
    if (diff <= 0) return 0;
    return Math.round(diff * 100);
  }
  function setRating(n: number) {
    if (n >= 1 && n <= 5) rating = n as 1 | 2 | 3 | 4 | 5;
  }
  function handleRadioKeys(e: KeyboardEvent, i: number) {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowUp') {
      e.preventDefault(); setRating(Math.min(5, (rating || 0) + 1 || i + 1));
    } else if (k === 'ArrowLeft' || k === 'ArrowDown') {
      e.preventDefault(); setRating(Math.max(1, (rating || 0) - 1 || i - 1));
    } else if (k === 'Home') {
      e.preventDefault(); setRating(1);
    } else if (k === 'End') {
      e.preventDefault(); setRating(5);
    } else if (k === ' ' || k === 'Enter') {
      e.preventDefault(); setRating(i);
    }
  }

  // --- Emotion 스타일 (스코프 클래스)
  const root = css`
    /* theme via ancestor [data-theme] */
    [data-theme='light'] & {
      --bg: #ffffff;
      --card: #f7f8fa;
      --muted: #666;
      --text: #111;
      --accent: #1d4ed8;
      --accent-weak: #c7d2fe;
      --bar-bg: #e5e7eb;
      --border: #d1d5db;
      --input-bg: #fff;
      --star-muted: #d4d4d8;
      color-scheme: light;
    }
    [data-theme='dark'] & {
      --bg: #0f1115;
      --card: #151922;
      --muted: #a0a0a0;
      --text: #eaeaea;
      --accent: #5b8cff;
      --accent-weak: #2a3f7a;
      --bar-bg: #2a2a2a;
      --border: #333;
      --input-bg: #121212;
      --star-muted: #3a3a3a;
      color-scheme: dark;
    }

    color: var(--text);
    background: transparent;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    max-width: 880px; margin: 0 auto; padding: 16px;

    .title { font-size: 20px; font-weight: 600; margin: 8px 0 16px; }

    .summary {
      display: grid; grid-template-columns: 220px 1fr; gap: 16px; align-items: center;
      background: var(--card); border-radius: 14px; padding: 16px;
      box-shadow: 0 6px 18px rgba(0,0,0,.25);
    }
    .avg-box { text-align: center; }
    .avg-score { font-size: 56px; font-weight: 700; line-height: 1; }
    .total { margin-top: 6px; font-size: 13px; color: var(--muted); }

    .bars { display: flex; flex-direction: column; gap: 8px; }
    .bar-row { display: grid; grid-template-columns: 16px 1fr 48px; gap: 10px; align-items: center; }
    .bar-row .label { color: var(--muted); font-size: 12px; }
    .bar { height: 10px; background: var(--bar-bg); border-radius: 999px; overflow: hidden; }
    .bar .fill { height: 100%; background: linear-gradient(90deg, var(--accent) 0%, #7aa7ff 100%); }
    .bar-row .count { color: var(--muted); font-size: 12px; text-align: right; }

    .stars { display: inline-flex; gap: 2px; margin-top: 8px; }
    .stars.large .star { width: 28px; height: 28px; }
    .stars.small .star-wrap { width: 16px; height: 16px; }
    .star-wrap { position: relative; width: 20px; height: 20px; }
    .star { width: 100%; height: 100%; display: block; }
    .star .bg { fill: var(--star-muted); }
    .star .fg { fill: var(--accent); }
    .clip { position: absolute; inset: 0; overflow: hidden; }

    .editor { margin-top: 18px; background: var(--card); border-radius: 14px; padding: 14px; box-shadow: 0 6px 18px rgba(0,0,0,.25); }
    .rating-input { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .rate-btn { background: transparent; border: none; padding: 0; cursor: pointer; }
    .rate-btn:focus-visible { outline: 2px solid var(--accent); border-radius: 6px; }
    .rate-hint { margin-left: 8px; color: var(--muted); font-size: 13px; }

    .text-input {
      width: 100%; resize: vertical;
      border: 1px solid var(--border); background: var(--input-bg); color: var(--text);
      border-radius: 10px; padding: 10px 12px; margin-top: 4px; outline: none;
    }
    .text-input:focus { border-color: var(--accent); }

    .actions { display: flex; gap: 10px; align-items: center; justify-content: flex-end; margin-top: 10px; }
    .actions .char { color: var(--muted); font-size: 12px; }
    .submit { background: var(--accent); color: #fff; border: none; border-radius: 10px; padding: 8px 14px; font-weight: 600; cursor: pointer; }
    .submit:disabled { opacity: .6; cursor: not-allowed; }

    .review-list { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; }
    .review-item {
      display: grid; grid-template-columns: 40px 1fr; gap: 12px;
      background: var(--card); border-radius: 14px; padding: 12px; box-shadow: 0 6px 18px rgba(0,0,0,.25);
    }
    .avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--bar-bg); display: grid; place-items: center; font-weight: 700; color: var(--text);
    }
    .content .meta { display: flex; gap: 6px; align-items: center; color: var(--muted); font-size: 12px; margin-bottom: 4px; }
    .content .text { margin-top: 6px; white-space: pre-wrap; word-break: break-word; color: var(--text); }

    @media (max-width: 640px) {
      .summary { grid-template-columns: 1fr; }
      .avg-box { order: 1; }
    }
  `;
</script>

<section class={root}>
  <h2 class="title">평점 및 리뷰</h2>

  <div class="summary">
    <div class="avg-box">
      <div class="avg-score">{avg.toFixed(1)}</div>
      <div class="stars large" aria-label="평균 별점">
        {#each [1, 2, 3, 4, 5] as i}
          {@const pct = starFillPercent(i, avg)}
          <svg class="star" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <defs>
              <mask id={`mask-avg-${i}`} maskUnits="userSpaceOnUse">
                <rect x="0" y="0" width={24 * (pct / 100)} height="24" fill="white" />
              </mask>
            </defs>
            <path class="bg" d="M12 2l3.09 6.26 6.9.99-5 4.87 1.18 6.88L12 17.77 5.83 21l1.18-6.88-5-4.87 6.9-.99L12 2z" />
            <path class="fg" d="M12 2l3.09 6.26 6.9.99-5 4.87 1.18 6.88L12 17.77 5.83 21l1.18-6.88-5-4.87 6.9-.99L12 2z" mask={`url(#mask-avg-${i})`} />
          </svg>
        {/each}
      </div>
      <div class="total">{total.toLocaleString()}개 리뷰</div>
    </div>

    <div class="bars">
      {#each [5, 4, 3, 2, 1] as s}
        <div class="bar-row">
          <span class="label">{s}</span>
          <div class="bar">
            <div class="fill" style={`width:${total ? ((counts[s] / total) * 100).toFixed(1) : 0}%`}></div>
          </div>
          <span class="count">{counts[s] || 0}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Svelte 5: onsubmit / onmouseenter ... (on:xxx는 deprecated) -->
 <form class="editor" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <div class="rating-input" role="radiogroup" aria-label="별점 선택" aria-describedby="rating-hint">
      {#each [1, 2, 3, 4, 5] as i}
        <button
          type="button"
          class="rate-btn"
          role="radio"
          aria-checked={(rating || hover) === i}
          aria-label={`${i}점`}
          tabindex={rating ? (rating === i ? 0 : -1) : i === 1 ? 0 : -1}
          onmouseenter={() => (hover = i)}
          onmouseleave={() => (hover = 0)}
          onclick={() => setRating(i)}
          onkeydown={(e) => handleRadioKeys(e, i)}
        >
          <div class="star-wrap">
            <svg class="star" viewBox="0 0 24 24">
              <path class="bg" d="M12 2l3.09 6.26 6.9.99-5 4.87 1.18 6.88L12 17.77 5.83 21l1.18-6.88-5-4.87 6.9-.99L12 2z" />
            </svg>
            <div class="clip" style={`width:${(hover || rating) >= i ? 100 : 0}%`}>
              <svg class="star" viewBox="0 0 24 24">
                <path class="fg" d="M12 2l3.09 6.26 6.9.99-5 4.87 1.18 6.88L12 17.77 5.83 21l1.18-6.88-5-4.87 6.9-.99L12 2z" />
              </svg>
            </div>
          </div>
        </button>
      {/each}
      <span class="rate-hint">{rating ? `${rating}점` : '별을 눌러 점수를 선택하세요'}</span>
    </div>

    <textarea
      bind:value={text}
      placeholder="간단한 한 줄 평을 남겨주세요 (선택)"
      maxlength="300"
      rows="3"
      class="text-input"
    ></textarea>

    <div class="actions">
      <span class="char">{text.length}/300</span>
      <button class="submit" type="submit" disabled={!rating || submitting}>
        {submitting ? '등록 중...' : '리뷰 남기기'}
      </button>
    </div>
  </form>

  <ul class="review-list">
    {#each [...reviews].reverse() as r (r.id)}
      <li class="review-item">
        <div class="avatar" aria-hidden="true">{(r.author ?? '익명').charAt(0)}</div>
        <div class="content">
          <div class="meta">
            <span class="name">{r.author ?? '익명'}</span>
            <span class="dot">·</span>
            <span class="date">{new Date(r.date).toLocaleDateString()}</span>
          </div>
          <div class="stars small" aria-label={`개별 별점: ${r.rating}점`}>
            {#each [1, 2, 3, 4, 5] as i}
              <div class="star-wrap">
                <svg class="star" viewBox="0 0 24 24"><path class="bg" d="M12 2l3.09 6.26 6.9.99-5 4.87 1.18 6.88L12 17.77 5.83 21l1.18-6.88-5-4.87 6.9-.99L12 2z" /></svg>
                <div class="clip" style={`width:${i <= r.rating ? 100 : 0}%`}>
                  <svg class="star" viewBox="0 0 24 24"><path class="fg" d="M12 2l3.09 6.26 6.9.99-5 4.87 1.18 6.88L12 17.77 5.83 21l1.18-6.88-5-4.87 6.9-.99L12 2z" /></svg>
                </div>
              </div>
            {/each}
          </div>
          {#if r.text}<p class="text">{r.text}</p>{/if}
        </div>
      </li>
    {/each}
  </ul>
</section>
