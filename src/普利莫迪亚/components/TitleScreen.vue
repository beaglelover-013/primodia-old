<script setup lang="ts">
import PmIcon from './PmIcon.vue';

withDefaults(defineProps<{
  loading?: boolean;
  status?: string;
}>(), {
  loading: false,
  status: '',
});

const emit = defineEmits<{
  start: [];
}>();
</script>

<template>
  <section class="title-screen" aria-label="酒馆纪事_普里莫迪亚 标题界面">
    <div class="title-frame">
      <div class="title-rail left"></div>
      <div class="title-rail right"></div>
      <div class="title-candle c1"><span></span></div>
      <div class="title-candle c2"><span></span></div>

      <div class="title-board">
        <div class="title-board-top">
          <span><PmIcon name="candle" :size="15" /> 共栖历 1303</span>
          <span>作者 beagle</span>
        </div>

        <div class="title-emblem" aria-hidden="true">
          <PmIcon name="tavern" :size="42" />
        </div>

        <p class="title-kicker">Primordia Tavern Chronicle</p>
        <h1>酒馆纪事_普里莫迪亚</h1>
        <p class="title-subtitle">
          在融雪、炉火和账本之间，打开今日的第一扇门。
        </p>

        <div class="title-actions">
          <button class="title-start" type="button" :disabled="loading" @click="emit('start')">
            <PmIcon name="ledger" :size="18" />
            <span>{{ loading ? '检测楼层中' : '开始游戏' }}</span>
          </button>
          <p class="title-status">{{ status || '会根据当前聊天楼层进入开局创建或继续游戏。' }}</p>
        </div>

        <div class="title-meta">
          <span><PmIcon name="map" :size="14" /> 普利莫迪亚编年录</span>
          <span><PmIcon name="gear" :size="14" /> 酒馆助手前端</span>
          <span>© beagle</span>
        </div>
      </div>

      <div class="title-side-card">
        <p>今日登记</p>
        <strong>铁壶酒馆</strong>
        <span>柜台已擦亮，炉膛待点燃，第一条故事线正在门外等候。</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.title-screen {
  display: grid;
  place-items: center;
  padding: 28px;
  background: var(--pm-app-bg);
  color: var(--pm-dark-text);
}

.title-frame {
  position: relative;
  width: 1120px;
  height: 720px;
  overflow: hidden;
  border: 1px solid var(--pm-edge);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(16, 10, 5, 0.88), rgba(22, 14, 7, 0.35) 34%, rgba(16, 10, 5, 0.92)),
    radial-gradient(circle at 50% 28%, rgba(255, 209, 120, 0.14), transparent 320px),
    linear-gradient(180deg, #21150c, #100905);
  box-shadow: var(--pm-shadow-deep), inset 0 0 0 1px rgba(255, 234, 171, 0.08);
}

.title-frame::before {
  content: '';
  position: absolute;
  inset: 18px;
  border: 1px solid rgba(220, 177, 93, 0.22);
  border-radius: 6px;
  pointer-events: none;
}

.title-frame::after {
  content: '';
  position: absolute;
  left: 42px;
  right: 42px;
  bottom: 40px;
  height: 132px;
  border-radius: 4px;
  background:
    repeating-linear-gradient(0deg, rgba(255, 235, 176, 0.025) 0 1px, transparent 1px 18px),
    linear-gradient(180deg, rgba(75, 48, 24, 0.15), rgba(0, 0, 0, 0.48));
  transform: perspective(580px) rotateX(58deg);
  transform-origin: bottom;
}

.title-rail {
  position: absolute;
  top: 40px;
  bottom: 38px;
  width: 10px;
  border-radius: 999px;
  background: linear-gradient(180deg, #d7b369, #60401d 48%, #241207);
  box-shadow: inset 0 1px 0 rgba(255, 247, 204, 0.6), 0 0 28px rgba(0, 0, 0, 0.45);
}

.title-rail.left {
  left: 38px;
}

.title-rail.right {
  right: 38px;
}

.title-board {
  position: absolute;
  left: 128px;
  top: 70px;
  width: 704px;
  height: 548px;
  padding: 34px 42px;
  border: 1px solid rgba(122, 82, 34, 0.72);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 248, 220, 0.7), rgba(255, 248, 220, 0)),
    var(--pm-grad-parchment);
  box-shadow: var(--pm-shadow-paper), 0 30px 80px -34px rgba(0, 0, 0, 0.9);
  color: var(--pm-ink);
}

.title-board::before,
.title-board::after {
  content: '';
  position: absolute;
  left: 34px;
  right: 34px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(112, 75, 26, 0.55), transparent);
}

.title-board::before {
  top: 88px;
}

.title-board::after {
  bottom: 84px;
}

.title-board-top,
.title-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  font-family: var(--pm-font-display);
  font-size: 12px;
  color: var(--pm-ink-fade);
}

.title-board-top span,
.title-meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.title-emblem {
  display: grid;
  place-items: center;
  width: 82px;
  height: 82px;
  margin: 54px auto 18px;
  border: 1px solid rgba(117, 78, 29, 0.55);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 242, 198, 0.86), rgba(204, 158, 75, 0.24) 66%, rgba(99, 57, 20, 0.16)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0));
  color: var(--pm-gold-mud);
  box-shadow: inset 0 1px 0 rgba(255, 250, 220, 0.75), 0 10px 22px rgba(83, 50, 18, 0.22);
}

.title-kicker {
  margin: 0 0 10px;
  text-align: center;
  font-family: var(--pm-font-display);
  font-size: 13px;
  letter-spacing: 0.24em;
  color: var(--pm-ink-fade);
  text-transform: uppercase;
}

.title-board h1 {
  margin: 0;
  text-align: center;
  font-family: var(--pm-font-display);
  font-size: 46px;
  font-weight: 800;
  color: var(--pm-ink);
  text-shadow: 0 1px 0 rgba(255, 247, 214, 0.75);
}

.title-subtitle {
  width: 496px;
  margin: 18px auto 0;
  text-align: center;
  color: var(--pm-ink-soft);
  line-height: 1.9;
  font-size: 15px;
}

.title-actions {
  display: grid;
  justify-items: center;
  gap: 12px;
  margin-top: 38px;
}

.title-start {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 212px;
  height: 48px;
  overflow: hidden;
  border: 1px solid rgba(88, 59, 23, 0.72);
  border-radius: 5px;
  background: linear-gradient(180deg, #f3dca2, #d4ad66 60%, #9b7034);
  color: var(--pm-text-on-gold);
  font-family: var(--pm-font-display);
  font-weight: 800;
  letter-spacing: 0.12em;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 250, 223, 0.75), 0 10px 22px rgba(78, 47, 16, 0.28);
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.title-start::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 0 34%, rgba(255, 252, 229, 0.42) 48%, transparent 63%);
  transform: translateX(-240px);
  transition: transform 520ms ease;
}

.title-start:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: inset 0 1px 0 rgba(255, 250, 223, 0.86), 0 16px 28px rgba(78, 47, 16, 0.34);
}

.title-start:hover:not(:disabled)::after {
  transform: translateX(240px);
}

.title-start:disabled {
  cursor: wait;
  filter: saturate(0.65);
}

.title-status {
  margin: 0;
  color: var(--pm-ink-fade);
  font-size: 13px;
}

.title-meta {
  position: absolute;
  left: 42px;
  right: 42px;
  bottom: 30px;
}

.title-side-card {
  position: absolute;
  right: 104px;
  top: 180px;
  width: 214px;
  height: 312px;
  padding: 22px;
  border: 1px solid var(--pm-dark-panel-border);
  border-radius: 6px;
  background: var(--pm-dark-panel);
  box-shadow: var(--pm-shadow-deep);
}

.title-side-card p {
  margin: 0 0 12px;
  font-family: var(--pm-font-display);
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--pm-gold-bright);
}

.title-side-card strong {
  display: block;
  margin-bottom: 14px;
  font-family: var(--pm-font-display);
  font-size: 24px;
  color: var(--pm-dark-text);
}

.title-side-card span {
  color: var(--pm-dark-muted);
  line-height: 1.9;
  font-size: 14px;
}

.title-candle {
  position: absolute;
  width: 30px;
  height: 74px;
  border-radius: 4px 4px 8px 8px;
  background: linear-gradient(180deg, #f0dcb3, #b78958);
  box-shadow: inset 0 0 12px rgba(87, 47, 18, 0.28), 0 0 34px rgba(245, 181, 92, 0.2);
}

.title-candle span {
  position: absolute;
  left: 10px;
  top: -22px;
  width: 10px;
  height: 24px;
  border-radius: 50% 50% 45% 45%;
  background: radial-gradient(circle at 50% 72%, #fff6c7, #e59a36 58%, rgba(229, 154, 54, 0));
  transform-origin: bottom;
  animation: title-flame 2200ms ease-in-out infinite;
}

.title-candle.c1 {
  left: 82px;
  bottom: 86px;
}

.title-candle.c2 {
  right: 72px;
  bottom: 78px;
  transform: scale(0.82);
}

@keyframes title-flame {
  0%,
  100% {
    transform: rotate(-2deg) scaleY(1);
  }
  50% {
    transform: rotate(3deg) scaleY(1.12);
  }
}

@media (max-width: 760px) {
  .title-screen {
    padding: 12px;
  }

  .title-frame {
    width: 356px;
    height: 680px;
  }

  .title-board {
    left: 20px;
    top: 28px;
    width: 314px;
    height: 548px;
    padding: 22px 18px;
  }

  .title-board h1 {
    font-size: 30px;
  }

  .title-subtitle {
    width: 250px;
  }

  .title-board-top,
  .title-meta {
    font-size: 10px;
  }

  .title-side-card,
  .title-rail,
  .title-candle {
    display: none;
  }
}
</style>
