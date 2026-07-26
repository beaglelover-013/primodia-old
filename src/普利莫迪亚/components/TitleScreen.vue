<script setup lang="ts">
import titleBoardImage from '../assets/primordia-title-board-v2.png?url';

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
    <div class="illustrated-title" :style="{ backgroundImage: `url(${titleBoardImage})` }">
      <div class="title-copy">
        <div class="maker">BEAGLE · PRESENTS</div>
        <div class="ornament"><span></span><b>◆</b><span></span></div>
        <h1>酒馆纪事</h1>
        <h2>普里莫迪亚</h2>
        <p>炉火、旅人，以及尚未写下的明天</p>
      </div>

      <button
        class="start-button"
        type="button"
        :disabled="loading"
        @click="emit('start')"
      >
        <span>{{ loading ? '正在翻阅纪事' : '开始游戏' }}</span>
        <small>{{ status || (loading ? '正在读取当前聊天楼层' : '开启新的纪事') }}</small>
      </button>

      <footer>
        <span>PRIMORDIA CHRONICLE</span>
        <span>© BEAGLE</span>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.title-screen {
  display: grid;
  place-items: center;
  padding: 28px;
  color: #f4dfaa;
  background: var(--pm-app-bg);
}

.illustrated-title {
  position: relative;
  width: 1080px;
  height: 720px;
  overflow: hidden;
  border: 2px solid #41220e;
  border-radius: 6px;
  background-color: #6c3513;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 1080px 720px;
  box-shadow:
    0 0 0 3px #a16826,
    0 0 0 6px #3c210e,
    0 22px 70px rgba(20, 9, 3, 0.58);
  isolation: isolate;
  font-family: "Noto Serif SC", "Songti SC", SimSun, serif;
}

.illustrated-title,
.illustrated-title * {
  box-sizing: border-box;
}

.title-copy {
  position: absolute;
  left: 204px;
  top: 142px;
  width: 672px;
  text-align: center;
  text-shadow:
    0 2px #0d2016,
    0 4px 8px rgba(4, 12, 8, 0.55);
}

.maker {
  color: #c8aa6b;
  font-family: Georgia, serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
}

.ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 14px 0 11px;
  color: #f1c86f;
}

.ornament span {
  width: 72px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #d4a853);
}

.ornament span:last-child {
  transform: rotate(180deg);
}

.ornament b {
  font-size: 11px;
}

.title-copy h1 {
  margin: 0;
  color: #f8e9c1;
  font-size: 52px;
  font-weight: 900;
  line-height: 1;
}

.title-copy h2 {
  margin: 12px 0 0;
  color: #f1c86f;
  font-size: 28px;
  line-height: 1;
  letter-spacing: 0.2em;
  text-indent: 0.2em;
}

.title-copy p {
  margin: 28px 0 0;
  color: #d0c29d;
  font-size: 13px;
  letter-spacing: 0.08em;
}

.start-button {
  position: absolute;
  left: 304px;
  top: 477px;
  display: grid;
  place-content: center;
  width: 470px;
  height: 104px;
  padding: 0;
  color: #f5e2b5;
  border: 0;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  text-shadow:
    0 2px #112519,
    0 3px 5px rgba(0, 0, 0, 0.42);
  transition:
    filter 160ms ease,
    transform 160ms ease;
}

.start-button::after {
  content: '';
  position: absolute;
  inset: 10px 15px;
  border: 1px solid transparent;
  pointer-events: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.start-button:hover:not(:disabled) {
  filter: brightness(1.18);
  transform: translateY(-2px);
}

.start-button:hover:not(:disabled)::after {
  border-color: rgba(255, 224, 143, 0.45);
  box-shadow: inset 0 0 18px rgba(246, 203, 102, 0.12);
}

.start-button:active:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(2px);
}

.start-button:disabled {
  cursor: wait;
  filter: saturate(0.72);
}

.start-button:focus-visible {
  outline: 3px solid #fff0b1;
  outline-offset: 3px;
}

.start-button span {
  font-size: 25px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-indent: 0.12em;
}

.start-button small {
  width: 390px;
  margin-top: 5px;
  overflow: hidden;
  color: #bfae81;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

footer {
  position: absolute;
  left: 32px;
  right: 32px;
  bottom: 18px;
  display: flex;
  justify-content: space-between;
  color: rgba(255, 225, 169, 0.62);
  font-family: Georgia, serif;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-shadow: 0 1px 2px #261104;
}

@media (max-width: 760px) {
  .title-screen {
    padding: 0;
  }

  .illustrated-title {
    width: 390px;
    height: 760px;
    border-radius: 0;
    background-size: 1140px 760px;
  }

  .title-copy {
    left: 24px;
    top: 176px;
    width: 342px;
  }

  .title-copy h1 {
    font-size: 42px;
  }

  .title-copy h2 {
    font-size: 22px;
  }

  .start-button {
    left: 38px;
    top: 505px;
    width: 314px;
    height: 96px;
  }

  .start-button span {
    font-size: 21px;
  }

  .start-button small {
    width: 270px;
  }

  footer {
    left: 18px;
    right: 18px;
    font-size: 7px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .start-button {
    transition: none;
  }
}
</style>
