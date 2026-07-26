<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PmIcon from '../components/PmIcon.vue';
import creatorBoardImage from '../assets/primordia-creator-board-v2.png?url';
import titleBoardImage from '../assets/primordia-title-board-v2.png?url';
import { useGameStore } from '../stores/game';
import {
  buildDeerOpeningPreset,
  buildFixedOpeningPreset,
  buildSheepOpeningPreset,
  buildSoloCookOpeningPreset,
  buildTwinsOpeningPreset,
} from '../services/openingWorkshop';

const emit = defineEmits<{
  created: [];
}>();

const game = useGameStore();
const worldbooks = ref<string[]>([]);
const worldbookName = ref('');
const selectedOpeningId = ref('fox-applicant');
const loading = ref('');
const notice = ref('');
const error = ref('');
const displayedProtagonistName = computed(() => game.currentHostPersonaName() || game.protagonist.name || '克斯');
const displayedTavernName = computed(() => game.tavernName || '铁壶酒馆');

const openings = computed(() => [
  {
    id: 'fox-applicant',
    title: '清晨的求职者',
    heroine: '橘柒',
    race: '狐族',
    time: '解冻月 · 清晨',
    image: 'https://files.catbox.moe/0ld4p2.png',
    summary: `清晨的${displayedTavernName.value}还没正式营业，橘柒推门进来，问门口那句“招人”还算不算数。`,
  },
  {
    id: 'sheep-brewer',
    title: '酿造师来访',
    heroine: '绵暖',
    race: '羊族',
    time: '解冻月 · 正午',
    image: 'https://files.catbox.moe/j42erz.png',
    summary: `酿造师公会学徒绵暖来到${displayedTavernName.value}，刚要自我介绍就被融雪风吹乱了开场。`,
  },
  {
    id: 'deer-traveler',
    title: '远路旅人',
    heroine: '翠萱',
    race: '鹿族',
    time: '解冻月 · 傍晚',
    image: 'https://files.catbox.moe/t2r08i.png',
    summary: `走了远路的鹿族旅人翠萱背着大帆布背包推开${displayedTavernName.value}的门，询问客房价格。`,
  },
  {
    id: 'rabbit-twins',
    title: '莲家双子上门',
    heroine: '莲洵与莲沁',
    race: '兔族',
    time: '解冻月 · 午后',
    image: 'https://i.postimg.cc/mZ1YBg4j/lian-jia-shuang-zi.png',
    summary: `兔族双子推开${displayedTavernName.value}的门：姐姐莲洵连珠炮地问吃住，妹妹莲沁安静地站在半步后。`,
  },
  {
    id: 'solo-cook',
    title: '独自经营',
    heroine: '不指定女主',
    race: '自由开局',
    time: '解冻月 · 清晨',
    image: '',
    summary: `没有预设相遇。${displayedProtagonistName.value}从睡梦中醒来，独自迎接${displayedTavernName.value}的新一天。`,
  },
]);

const selectedOpening = computed(
  () => openings.value.find(item => item.id === selectedOpeningId.value) ?? openings.value[0],
);

function refreshWorldbooks() {
  worldbooks.value = game.availableOpeningWorldbooks();
  worldbookName.value = worldbookName.value || game.defaultOpeningWorldbookName() || worldbooks.value[0] || '';
}

async function chooseOpening(id: string) {
  error.value = '';
  notice.value = '';
  if (!worldbookName.value) {
    error.value = '请先选择要写入的世界书。';
    return;
  }

  const openingLabels: Record<string, string> = {
    'fox-applicant': '橘柒开场',
    'sheep-brewer': '绵暖开场',
    'deer-traveler': '翠萱开场',
    'rabbit-twins': '莲家双子开场',
    'solo-cook': '单人开局',
  };
  loading.value = `正在创建${openingLabels[id] ?? '开场'}`;
  try {
    const { draft, bundle } =
      id === 'sheep-brewer'
        ? buildSheepOpeningPreset(worldbookName.value)
        : id === 'deer-traveler'
          ? buildDeerOpeningPreset(worldbookName.value)
          : id === 'rabbit-twins'
            ? buildTwinsOpeningPreset(worldbookName.value)
            : id === 'solo-cook'
              ? buildSoloCookOpeningPreset(worldbookName.value)
              : buildFixedOpeningPreset(worldbookName.value);
    await game.confirmOpeningWorkshop(draft, bundle);
    notice.value = `${openingLabels[id] ?? '开场'}已创建，正在进入编年录。`;
    window.setTimeout(() => emit('created'), 420);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '开场创建失败。';
  } finally {
    loading.value = '';
  }
}

onMounted(refreshWorldbooks);
</script>

<template>
  <section
    id="page-opening"
    class="opening-stage"
    :style="{ backgroundImage: `url(${creatorBoardImage})` }"
    aria-label="开局创建页面"
  >
    <header class="opening-title">
      <span>OPENING CHAPTER</span>
      <h1>选择你的开场</h1>
    </header>

    <main class="opening-browser">
      <div class="opening-intro">
        <span class="number-seal">壹</span>
        <div>
          <small>五段相遇，五种故事的起点</small>
          <h2>今晨，谁会推开酒馆的门？</h2>
        </div>
      </div>

      <div class="opening-choice-grid" aria-label="开场选择">
        <button
          v-for="item in openings"
          :key="item.id"
          class="opening-choice"
          :class="{ selected: selectedOpeningId === item.id }"
          :aria-pressed="selectedOpeningId === item.id"
          type="button"
          @click="selectedOpeningId = item.id"
        >
          <span class="portrait-slot">
            <img v-if="item.image" :src="item.image" :alt="item.heroine" />
            <span
              v-else
              class="portrait-placeholder"
              :style="{ backgroundImage: `url(${titleBoardImage})` }"
            >
              <span class="solo-emblem"><PmIcon name="tavern" :size="28" /></span>
              <strong>无预设相遇</strong>
            </span>
            <span class="choice-gem"></span>
          </span>
          <span class="choice-copy">
            <small>{{ item.race }}</small>
            <strong>{{ item.heroine }}</strong>
            <span>{{ item.title }}</span>
          </span>
        </button>
      </div>

      <article class="mobile-selected-opening">
        <div class="mobile-feature-image">
          <img
            v-if="selectedOpening.image"
            :src="selectedOpening.image"
            :alt="selectedOpening.heroine"
          />
          <span
            v-else
            class="mobile-solo-image"
            :style="{ backgroundImage: `url(${titleBoardImage})` }"
          >
            <PmIcon name="tavern" :size="32" />
          </span>
        </div>
        <div class="mobile-feature-copy">
          <small>SELECTED OPENING</small>
          <h3>{{ selectedOpening.heroine }}</h3>
          <strong>{{ selectedOpening.title }}</strong>
          <dl>
            <div>
              <dt>种族</dt>
              <dd>{{ selectedOpening.race }}</dd>
            </div>
            <div>
              <dt>时间</dt>
              <dd>{{ selectedOpening.time }}</dd>
            </div>
          </dl>
          <p>{{ selectedOpening.summary }}</p>
        </div>
      </article>
    </main>

    <aside class="opening-detail">
      <span class="detail-kicker">SELECTED OPENING</span>
      <h2>{{ selectedOpening.heroine }}</h2>
      <p class="detail-title">{{ selectedOpening.title }}</p>
      <div class="detail-rule"></div>
      <dl>
        <div>
          <dt>种族</dt>
          <dd>{{ selectedOpening.race }}</dd>
        </div>
        <div>
          <dt>时间</dt>
          <dd>{{ selectedOpening.time }}</dd>
        </div>
      </dl>
      <p class="detail-summary">{{ selectedOpening.summary }}</p>
      <span class="selection-state"><i></i> 已选中</span>
    </aside>

    <div class="worldbook-control">
      <label for="opening-worldbook">写入世界书</label>
      <select id="opening-worldbook" v-model="worldbookName" :disabled="!!loading">
        <option value="">请选择世界书</option>
        <option v-for="name in worldbooks" :key="name" :value="name">{{ name }}</option>
      </select>
      <button
        type="button"
        :disabled="!!loading"
        aria-label="刷新世界书列表"
        title="刷新世界书列表"
        @click="refreshWorldbooks"
      >
        <PmIcon name="gear" :size="16" />
      </button>
    </div>

    <p class="opening-status" :class="{ bad: error, good: notice }" aria-live="polite">
      {{ error || notice || loading || '选择后将创建第 1 层正文，并写入对应的初始化变量。' }}
    </p>

    <nav class="opening-steps" aria-label="当前开局流程">
      <span class="active">01 · 选择开场</span>
      <span>02 · 确认人物</span>
      <span>03 · 开始纪事</span>
    </nav>

    <button
      class="confirm-button"
      type="button"
      :disabled="!!loading || !worldbookName"
      @click="chooseOpening(selectedOpening.id)"
    >
      <i class="mobile-button-skin" :style="{ backgroundImage: `url(${titleBoardImage})` }"></i>
      <span>{{ loading || '使用这个开场' }}</span>
      <PmIcon name="scroll" :size="18" />
    </button>
  </section>
</template>

<style scoped>
.opening-stage {
  --ink: #4b2b16;
  --ink-soft: #80603c;
  --green: #173e2b;
  --gold: #c5892f;
  --gold-light: #f1c86f;
  position: relative;
  width: 1080px;
  height: 720px;
  overflow: hidden;
  border: 2px solid #41220e;
  border-radius: 6px;
  color: var(--ink);
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

.opening-stage,
.opening-stage * {
  box-sizing: border-box;
}

button,
select {
  font: inherit;
}

button:focus-visible,
select:focus-visible {
  outline: 3px solid #fff0b1;
  outline-offset: 3px;
}

.opening-title {
  position: absolute;
  left: 326px;
  top: 76px;
  width: 205px;
  color: #f0d7a1;
  text-align: center;
  text-shadow: 0 2px 3px #37190a;
}

.opening-title span {
  display: block;
  color: #c69955;
  font-family: Georgia, serif;
  font-size: 8px;
  letter-spacing: 0.16em;
}

.opening-title h1 {
  margin: 4px 0 0;
  font-size: 18px;
}

.opening-browser {
  position: absolute;
  left: 151px;
  top: 128px;
  width: 550px;
}

.opening-intro {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 13px;
}

.number-seal {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  color: #f4dba1;
  border-radius: 50%;
  background: #713426;
  box-shadow:
    inset 0 0 0 2px #9e4b32,
    inset 0 0 0 4px #572418,
    0 2px 3px rgba(63, 28, 9, 0.35);
  font-size: 13px;
}

.opening-intro small {
  color: #9b7042;
  font-size: 8px;
}

.opening-intro h2 {
  margin: 2px 0 0;
  font-size: 17px;
}

.opening-choice-grid {
  display: grid;
  grid-template-columns: repeat(5, 102px);
  gap: 8px;
}

.opening-choice {
  position: relative;
  display: grid;
  grid-template-rows: 216px 76px;
  width: 102px;
  height: 292px;
  padding: 0;
  overflow: hidden;
  color: var(--ink);
  border: 1px solid #9f7039;
  border-radius: 2px;
  background: rgba(247, 222, 172, 0.84);
  box-shadow:
    inset 0 0 0 2px rgba(255, 242, 198, 0.6),
    0 3px 5px rgba(74, 37, 12, 0.24);
  cursor: pointer;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;
}

.opening-choice:hover {
  z-index: 2;
  transform: translateY(-3px);
  border-color: #c18a3a;
  box-shadow:
    inset 0 0 0 2px rgba(255, 242, 198, 0.72),
    0 8px 12px rgba(74, 37, 12, 0.32);
}

.opening-choice.selected {
  color: #f2ddb0;
  border-color: #d7a64b;
  background: #1b4631;
  box-shadow:
    inset 0 0 0 2px #0d2d1e,
    inset 0 0 0 4px rgba(218, 169, 76, 0.42),
    0 5px 9px rgba(60, 29, 8, 0.35);
}

.portrait-slot {
  position: relative;
  display: block;
  margin: 5px 5px 0;
  overflow: hidden;
  border: 1px solid #a97a40;
  background: #d8b97c;
  box-shadow: inset 0 0 0 2px rgba(255, 237, 186, 0.55);
}

.portrait-slot img {
  display: block;
  width: 90px;
  height: 210px;
  object-fit: cover;
  object-position: center top;
}

.portrait-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 10px;
  color: #f4dda7;
  background-color: #253e2d;
  background-position: 51% 42%;
  background-size: 350px 233px;
  text-align: center;
  text-shadow: 0 2px 4px #182014;
}

.portrait-placeholder::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(20, 48, 33, 0.56);
}

.portrait-placeholder strong,
.solo-emblem {
  position: relative;
  z-index: 1;
}

.portrait-placeholder strong {
  font-size: 10px;
}

.solo-emblem {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  margin: auto;
  border: 1px solid #d8a94f;
  border-radius: 50%;
  background: rgba(28, 61, 42, 0.88);
}

.choice-gem {
  position: absolute;
  right: 7px;
  top: 7px;
  width: 9px;
  height: 9px;
  border: 1px solid rgba(109, 74, 30, 0.7);
  background: rgba(255, 239, 184, 0.62);
  transform: rotate(45deg);
}

.opening-choice.selected .choice-gem {
  border-color: #ffe19a;
  background: #df9e36;
  box-shadow: 0 0 7px rgba(236, 179, 65, 0.78);
}

.choice-copy {
  display: grid;
  align-content: center;
  gap: 3px;
  padding: 5px 4px;
  text-align: center;
}

.choice-copy small {
  color: #9a7349;
  font-size: 8px;
}

.choice-copy strong {
  overflow-wrap: anywhere;
  font-size: 13px;
}

.choice-copy > span {
  color: #85613e;
  font-size: 8px;
}

.opening-choice.selected .choice-copy small,
.opening-choice.selected .choice-copy > span {
  color: #c9b98e;
}

.mobile-selected-opening {
  display: none;
}

.opening-detail {
  position: absolute;
  left: 761px;
  top: 136px;
  width: 205px;
  color: #5a351d;
  text-align: center;
}

.detail-kicker {
  color: #987043;
  font-family: Georgia, serif;
  font-size: 8px;
  letter-spacing: 0.14em;
}

.opening-detail h2 {
  margin: 11px 0 0;
  font-size: 23px;
}

.detail-title {
  margin: 6px 0 0;
  color: #8e653d;
  font-size: 11px;
}

.detail-rule {
  width: 72px;
  height: 1px;
  margin: 17px auto;
  background: #c39a61;
}

.opening-detail dl {
  margin: 0;
  font-size: 10px;
}

.opening-detail dl div {
  display: flex;
  justify-content: space-between;
  padding: 7px 14px;
  border-bottom: 1px solid rgba(151, 102, 49, 0.2);
}

.opening-detail dt {
  color: #8e6941;
}

.opening-detail dd {
  margin: 0;
  font-weight: 700;
}

.detail-summary {
  margin: 18px 13px 0;
  color: #76563a;
  font-size: 10px;
  line-height: 1.75;
}

.selection-state {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  color: #356343;
  font-size: 9px;
  font-weight: 700;
}

.selection-state i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4d8b5d;
  box-shadow: 0 0 5px rgba(61, 121, 76, 0.55);
}

.worldbook-control {
  position: absolute;
  left: 153px;
  top: 446px;
  display: grid;
  grid-template-columns: 78px 330px 32px;
  align-items: center;
  gap: 8px;
  width: 472px;
  height: 42px;
  color: #6f4a28;
  font-size: 10px;
}

.worldbook-control label {
  font-weight: 700;
}

.worldbook-control select {
  width: 330px;
  height: 32px;
  padding: 0 30px 0 10px;
  color: #57361e;
  border: 1px solid #9d6b32;
  border-radius: 3px;
  background: rgba(248, 226, 180, 0.92);
  box-shadow:
    inset 0 0 0 2px rgba(255, 244, 210, 0.55),
    0 2px 3px rgba(76, 40, 13, 0.18);
}

.worldbook-control button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: #f0d89c;
  border: 1px solid #ad7731;
  border-radius: 50%;
  background: #294b36;
  cursor: pointer;
}

.worldbook-control button:hover:not(:disabled) {
  color: #fff0b2;
  transform: rotate(18deg);
}

.opening-status {
  position: absolute;
  left: 153px;
  top: 494px;
  width: 500px;
  margin: 0;
  color: #80603c;
  font-size: 9px;
}

.opening-status.good {
  color: #356343;
}

.opening-status.bad {
  color: #8a3429;
}

.opening-steps {
  position: absolute;
  left: 132px;
  top: 557px;
  display: grid;
  grid-template-columns: repeat(3, 168px);
  height: 69px;
}

.opening-steps span {
  display: grid;
  place-items: center;
  color: #65401f;
  font-size: 12px;
  font-weight: 700;
  text-shadow: 0 1px rgba(255, 241, 194, 0.65);
}

.opening-steps span:nth-child(2) {
  color: #f1dba3;
  text-shadow: 0 2px #173121;
}

.confirm-button {
  position: absolute;
  left: 711px;
  top: 553px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 314px;
  height: 77px;
  padding: 0;
  color: #f5e2b5;
  border: 0;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  isolation: isolate;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-shadow:
    0 2px #112519,
    0 3px 5px rgba(0, 0, 0, 0.42);
  transition:
    filter 160ms ease,
    transform 160ms ease;
}

.confirm-button::after {
  content: '';
  position: absolute;
  inset: 10px 15px;
  border: 1px solid transparent;
  pointer-events: none;
}

.confirm-button:hover:not(:disabled) {
  filter: brightness(1.18);
  transform: translateY(-2px);
}

.confirm-button:hover:not(:disabled)::after {
  border-color: rgba(255, 224, 143, 0.45);
  box-shadow: inset 0 0 18px rgba(246, 203, 102, 0.12);
}

.confirm-button:active:not(:disabled) {
  transform: translateY(2px);
}

.confirm-button:disabled,
.worldbook-control button:disabled,
.worldbook-control select:disabled {
  cursor: not-allowed;
  filter: grayscale(0.8) brightness(0.76);
}

.mobile-button-skin {
  display: none;
}

@media (max-width: 760px) {
  .opening-stage {
    width: 390px;
    height: 760px;
    border-radius: 0;
    background-position: 31% center;
    background-size: 1140px 760px;
  }

  .opening-title {
    left: 93px;
    top: 78px;
  }

  .opening-browser {
    left: 35px;
    top: 136px;
    width: 320px;
  }

  .opening-intro {
    margin-bottom: 9px;
  }

  .opening-intro h2 {
    font-size: 15px;
  }

  .opening-choice-grid {
    display: grid;
    grid-template-columns: repeat(5, 58px);
    gap: 7px;
    width: 320px;
    padding: 0;
    overflow: visible;
  }

  .opening-choice {
    grid-template-rows: 66px 34px;
    width: 58px;
    height: 100px;
  }

  .portrait-slot {
    margin: 3px 3px 0;
  }

  .portrait-slot img {
    width: 50px;
    height: 62px;
  }

  .portrait-placeholder {
    gap: 0;
    background-size: 260px 173px;
  }

  .portrait-placeholder strong {
    display: none;
  }

  .solo-emblem {
    width: 28px;
    height: 28px;
  }

  .solo-emblem :deep(svg) {
    width: 16px;
    height: 16px;
  }

  .choice-gem {
    right: 5px;
    top: 5px;
    width: 7px;
    height: 7px;
  }

  .choice-copy {
    gap: 0;
    padding: 2px;
  }

  .choice-copy small,
  .choice-copy > span {
    display: none;
  }

  .choice-copy strong {
    font-size: 9px;
    line-height: 1.25;
  }

  .mobile-selected-opening {
    display: grid;
    grid-template-columns: 128px 1fr;
    gap: 10px;
    width: 320px;
    height: 224px;
    margin-top: 10px;
    padding: 6px;
    overflow: hidden;
    border: 1px solid #9f7039;
    border-radius: 2px;
    background: rgba(248, 226, 180, 0.9);
    box-shadow:
      inset 0 0 0 2px rgba(255, 244, 211, 0.62),
      0 4px 8px rgba(74, 37, 12, 0.26);
  }

  .mobile-feature-image {
    width: 128px;
    height: 210px;
    overflow: hidden;
    border: 1px solid #a97a40;
    background: #d8b97c;
    box-shadow: inset 0 0 0 2px rgba(255, 237, 186, 0.55);
  }

  .mobile-feature-image img {
    display: block;
    width: 126px;
    height: 208px;
    object-fit: cover;
    object-position: center top;
  }

  .mobile-solo-image {
    display: grid;
    place-items: center;
    width: 126px;
    height: 208px;
    color: #f2dba3;
    background-color: #23412f;
    background-position: center;
    background-size: 360px 240px;
    text-shadow: 0 2px 3px #251207;
  }

  .mobile-feature-copy {
    min-width: 0;
    padding: 6px 5px 4px;
    color: #5a351d;
  }

  .mobile-feature-copy > small {
    color: #987043;
    font-family: Georgia, serif;
    font-size: 7px;
    letter-spacing: 0.12em;
  }

  .mobile-feature-copy h3 {
    margin: 6px 0 2px;
    font-size: 18px;
    line-height: 1.25;
  }

  .mobile-feature-copy > strong {
    color: #8e653d;
    font-size: 9px;
  }

  .mobile-feature-copy dl {
    margin: 10px 0 0;
    font-size: 8px;
  }

  .mobile-feature-copy dl div {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    padding: 4px 0;
    border-bottom: 1px solid rgba(151, 102, 49, 0.22);
  }

  .mobile-feature-copy dt {
    color: #9a7047;
  }

  .mobile-feature-copy dd {
    margin: 0;
    font-weight: 700;
    text-align: right;
  }

  .mobile-feature-copy p {
    display: -webkit-box;
    margin: 9px 0 0;
    overflow: hidden;
    color: #76563a;
    font-size: 8px;
    line-height: 1.6;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
  }

  .opening-detail {
    display: none;
  }

  .worldbook-control {
    left: 35px;
    top: 520px;
    grid-template-columns: 70px 207px 32px;
    gap: 5px;
    width: 320px;
  }

  .worldbook-control select {
    width: 207px;
  }

  .worldbook-control label {
    color: #f1d89f;
    text-shadow: 0 2px 3px #351909;
  }

  .opening-status {
    left: 42px;
    top: 563px;
    width: 306px;
    height: 24px;
    overflow: hidden;
    color: #f0d9a3;
    line-height: 1.55;
    text-align: center;
    text-shadow: 0 2px 3px #351909;
  }

  .opening-steps {
    display: none;
  }

  .confirm-button {
    left: 46px;
    top: 635px;
    width: 298px;
    height: 66px;
    font-size: 15px;
  }

  .mobile-button-skin {
    position: absolute;
    inset: 0;
    z-index: -1;
    display: block;
    background-position: -192px -297px;
    background-repeat: no-repeat;
    background-size: 683px 455px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .opening-choice,
  .confirm-button,
  .worldbook-control button {
    transition: none;
  }
}
</style>
