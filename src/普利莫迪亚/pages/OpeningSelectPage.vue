<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PmIcon from '../components/PmIcon.vue';
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
const loading = ref('');
const notice = ref('');
const error = ref('');
const displayedProtagonistName = computed(() => game.currentHostPersonaName() || game.protagonist.name || '克斯');
const displayedTavernName = computed(() => game.tavernName || '铁壶酒馆');

const creationSteps = [
  { icon: 'people', title: '主角登记', text: '姓名、种族、出身、外观与第一天的状态。' },
  { icon: 'tavern', title: '酒馆档案', text: '招牌、位置、资金、库房、区域和经营风格。' },
  { icon: 'ledger', title: '开场楼层', text: '把正文、选项和初始化变量写入聊天楼层。' },
];

const openings = computed(() => [
  {
    id: 'fox-applicant',
    title: '橘柒来应聘',
    badge: '推荐',
    icon: 'people',
    summary: `清晨的${displayedTavernName.value}还没正式营业，橘柒推门进来，问门口那句“招人”还算不算数。`,
    details: [displayedProtagonistName.value, displayedTavernName.value, '橘柒'],
  },
  {
    id: 'sheep-brewer',
    title: '绵暖来访',
    badge: '酿造',
    icon: 'farm',
    summary: `解冻月正午，酿造师公会学徒绵暖来到${displayedTavernName.value}，刚要自我介绍就被融雪风吹乱了开场。`,
    details: [displayedProtagonistName.value, '绵暖', '酿造师公会'],
  },
  {
    id: 'deer-traveler',
    title: '翠萱来投宿',
    badge: '旅人',
    icon: 'map',
    summary: `解冻月的傍晚，走了远路的鹿族旅人翠萱背着大帆布背包推开${displayedTavernName.value}的门，询问客房价格。`,
    details: ['翠萱', '傍晚', '客房'],
  },
  {
    id: 'rabbit-twins',
    title: '莲家双子上门',
    badge: '热闹',
    icon: 'heart',
    summary: `兔族双子推开${displayedTavernName.value}的门：姐姐莲洵连珠炮地问吃住，妹妹莲沁安静地站在半步后。`,
    details: ['莲洵', '莲沁', '午后'],
  },
  {
    id: 'solo-cook',
    title: '单人开局',
    badge: '经营',
    icon: 'pot',
    summary: `没有女主相遇。${displayedProtagonistName.value}从睡梦中醒来，迎接${displayedTavernName.value}的新一天。`,
    details: [displayedProtagonistName.value, '厨房', '清晨'],
  },
]);

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
    notice.value = `${openingLabels[id] ?? '开场'}已创建，已经进入编年录。`;
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
  <section id="page-opening" class="opening-create-page" aria-label="开局创建页面">
    <div class="opening-shell">
      <aside class="opening-ledger">
        <div class="ledger-mark">
          <PmIcon name="ledger" :size="34" />
        </div>
        <p class="overline">Opening Desk</p>
        <h1>开局创建</h1>
        <p class="ledger-copy">
          这里先放置缺省创建流程。后续可以继续扩展人物登记、酒馆设定、模块选择与自定义开场。
        </p>

        <label class="worldbook-picker">
          <span>写入世界书</span>
          <select v-model="worldbookName" class="pm-input">
            <option value="">请选择</option>
            <option v-for="name in worldbooks" :key="name" :value="name">{{ name }}</option>
          </select>
        </label>

        <div class="step-list">
          <article v-for="(step, index) in creationSteps" :key="step.title" class="step-item">
            <span class="step-index">{{ index + 1 }}</span>
            <PmIcon :name="step.icon" :size="17" />
            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.text }}</p>
            </div>
          </article>
        </div>
      </aside>

      <main class="opening-main">
        <header class="opening-head">
          <div>
            <p>酒馆纪事_普里莫迪亚</p>
            <h2>{{ displayedTavernName }} · 第一页登记</h2>
          </div>
          <button class="refresh-btn" type="button" :disabled="!!loading" title="刷新世界书列表" @click="refreshWorldbooks">
            <PmIcon name="gear" :size="16" />
          </button>
        </header>

        <div class="status-strip" :class="{ bad: error, good: notice }">
          <PmIcon :name="error ? 'x' : notice ? 'plus' : 'candle'" :size="16" />
          <span>{{ error || notice || loading || '选择一个缺省开场，即可生成第 1 层正文和初始化变量。' }}</span>
        </div>

        <div class="opening-grid">
          <article v-for="item in openings" :key="item.id" class="opening-card">
            <div class="card-top">
              <span>{{ item.badge }}</span>
              <PmIcon :name="item.icon" :size="18" />
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <div class="detail-row">
              <span v-for="detail in item.details" :key="detail">{{ detail }}</span>
            </div>
            <button class="pm-btn" :disabled="!!loading" type="button" @click="chooseOpening(item.id)">
              使用这个开场
            </button>
          </article>
        </div>
      </main>
    </div>
  </section>
</template>

<style scoped>
.opening-create-page {
  display: grid;
  place-items: center;
  color: var(--pm-ink);
}

.opening-shell {
  display: grid;
  grid-template-columns: 328px 748px;
  gap: 18px;
  width: 1120px;
  height: 720px;
  padding: 18px;
  overflow: hidden;
  border: 1px solid var(--pm-edge);
  border-radius: 8px;
  background:
    radial-gradient(circle at 22% 10%, rgba(255, 223, 151, 0.14), transparent 260px),
    linear-gradient(180deg, rgba(53, 35, 18, 0.95), rgba(17, 10, 5, 0.98));
  box-shadow: var(--pm-shadow-deep), inset 0 0 0 1px rgba(255, 242, 198, 0.08);
}

.opening-ledger,
.opening-main {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(155, 113, 54, 0.48);
  border-radius: 7px;
  box-shadow: var(--pm-shadow-paper);
}

.opening-ledger {
  padding: 26px 24px;
  background: var(--pm-grad-parchment);
}

.opening-ledger::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(114, 78, 32, 0.55), transparent);
}

.ledger-mark {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  margin-bottom: 22px;
  border: 1px solid rgba(117, 78, 29, 0.52);
  border-radius: 50%;
  background: rgba(255, 247, 220, 0.56);
  color: var(--pm-gold-mud);
}

.overline,
.opening-head p {
  margin: 0 0 8px;
  font-family: var(--pm-font-display);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--pm-ink-fade);
  text-transform: uppercase;
}

.opening-ledger h1 {
  margin: 0 0 14px;
  font-family: var(--pm-font-display);
  font-size: 34px;
}

.ledger-copy {
  margin: 0 0 22px;
  color: var(--pm-ink-soft);
  line-height: 1.85;
  font-size: 14px;
}

.worldbook-picker {
  display: grid;
  gap: 8px;
  margin-bottom: 24px;
  color: var(--pm-ink-fade);
  font-size: 13px;
}

.worldbook-picker select {
  width: 258px;
}

.step-list {
  display: grid;
  gap: 10px;
}

.step-item {
  display: grid;
  grid-template-columns: 26px 22px 1fr;
  gap: 9px;
  align-items: start;
  padding: 10px;
  border: 1px solid rgba(111, 78, 37, 0.2);
  border-radius: 6px;
  background: rgba(255, 248, 225, 0.42);
}

.step-index {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--pm-dark-panel-solid);
  color: var(--pm-gold-bright);
  font-family: var(--pm-font-num);
  font-size: 11px;
}

.step-item strong {
  display: block;
  margin-bottom: 3px;
  color: var(--pm-ink);
  font-size: 14px;
}

.step-item p {
  margin: 0;
  color: var(--pm-ink-fade);
  font-size: 12px;
  line-height: 1.55;
}

.opening-main {
  padding: 22px;
  background:
    linear-gradient(180deg, rgba(255, 247, 220, 0.74), rgba(255, 247, 220, 0.08)),
    var(--pm-grad-parchment);
}

.opening-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(111, 78, 37, 0.22);
}

.opening-head h2 {
  margin: 0;
  font-family: var(--pm-font-display);
  font-size: 25px;
}

.refresh-btn {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(101, 70, 30, 0.46);
  border-radius: 5px;
  background: rgba(255, 248, 225, 0.65);
  color: var(--pm-ink);
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-1px) rotate(12deg);
  background: rgba(255, 248, 225, 0.95);
}

.status-strip {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 38px;
  margin-bottom: 14px;
  padding: 0 12px;
  border: 1px solid var(--pm-line-soft);
  border-radius: 6px;
  background: rgba(255, 248, 225, 0.58);
  color: var(--pm-ink-soft);
  font-size: 13px;
}

.status-strip.good {
  border-color: rgba(90, 132, 76, 0.45);
  color: #355a2d;
}

.status-strip.bad {
  border-color: rgba(147, 67, 55, 0.45);
  color: #7a3027;
}

.opening-grid {
  display: grid;
  grid-template-columns: 222px 222px 222px;
  gap: 12px;
  height: 518px;
  overflow: auto;
  padding-right: 8px;
}

.opening-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 246px;
  padding: 14px;
  border: 1px solid rgba(124, 83, 32, 0.35);
  border-radius: 7px;
  background:
    linear-gradient(135deg, rgba(255, 251, 231, 0.54), transparent 42%),
    rgba(255, 248, 225, 0.58);
  box-shadow: 0 8px 18px -14px rgba(51, 29, 10, 0.62);
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.opening-card:hover {
  transform: translateY(-2px);
  border-color: rgba(158, 106, 38, 0.65);
  box-shadow: 0 14px 26px -18px rgba(51, 29, 10, 0.8);
}

.card-top,
.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.card-top {
  justify-content: space-between;
  color: var(--pm-ink-fade);
}

.card-top span {
  padding: 3px 8px;
  border: 1px solid rgba(111, 78, 37, 0.22);
  border-radius: 999px;
  background: rgba(255, 248, 225, 0.64);
  color: var(--pm-gold-mud);
  font-size: 11px;
}

.opening-card h3 {
  margin: 0;
  font-family: var(--pm-font-display);
  font-size: 18px;
}

.opening-card p {
  flex: 1;
  margin: 0;
  color: var(--pm-ink-soft);
  font-size: 13px;
  line-height: 1.6;
}

.detail-row span {
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(42, 28, 15, 0.08);
  color: var(--pm-ink-fade);
  font-size: 11px;
}

.opening-card .pm-btn {
  height: 34px;
  padding: 0 12px;
}

@media (max-width: 760px) {
  .opening-shell {
    grid-template-columns: 324px;
    width: 356px;
    height: 680px;
    padding: 12px;
    overflow: auto;
  }

  .opening-ledger {
    height: 360px;
    padding: 20px 18px;
  }

  .opening-main {
    height: 600px;
    padding: 18px;
  }

  .worldbook-picker select {
    width: 270px;
  }

  .opening-grid {
    grid-template-columns: 272px;
    height: 446px;
  }

  .opening-card {
    height: 236px;
  }
}
</style>
