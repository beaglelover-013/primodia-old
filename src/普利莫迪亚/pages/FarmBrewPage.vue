<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useGameStore, type BrewBarrel, type FarmPlot, type InventoryItem } from '../stores/game';
import PmIcon from '../components/PmIcon.vue';

const game = useGameStore();

const currentDay = computed(() => game.calendar.year * 12 * 30 + game.calendar.monthIndex * 30 + game.calendar.day);
const seedPicker = reactive({
  open: false,
  plot: null as FarmPlot | null,
});
const pendingEarlyTapId = ref('');
const brewPortionsPerBottle = 4;

const seedItems = computed(() =>
  game.inventory.filter(item => item.qty > 0),
);

watch(
  () => game.farmPlots.map(plot => plot.id).join('|'),
  () => {
    if (seedPicker.plot && !game.farmPlots.some(plot => plot.id === seedPicker.plot?.id)) {
      seedPicker.open = false;
      seedPicker.plot = null;
    }
  },
);

function cropFromSeed(seedName: string) {
  return seedName.replace(/种子|籽|小包|一袋|一把/g, '').trim() || seedName;
}

function dayLabel(dayNumber?: number) {
  if (!dayNumber) return '未记录';
  const year = Math.floor((dayNumber - 1) / 360);
  const rem = (dayNumber - 1) % 360;
  const month = Math.floor(rem / 30);
  const day = (rem % 30) + 1;
  return `${year}年 ${game.months[month] ?? `${month + 1}月`} ${day}日`;
}

function stageHint(stage: number) {
  return ['空畦', '初芽', '抽枝', '抽穗', '将熟', '成熟'][Math.min(stage, 5)] ?? '生长中';
}

function plotLabel(plot: FarmPlot) {
  return plot.label || (plot.id.startsWith('f-') && /^\d+$/.test(plot.id.slice(2)) ? `第${plot.id.slice(2)}号田畦` : '这块田畦');
}

function openSeedPicker(plot: FarmPlot) {
  seedPicker.plot = plot;
  seedPicker.open = true;
}

function plantPlot(seed: InventoryItem) {
  if (!seedPicker.plot || seed.qty <= 0) return;
  const plot = seedPicker.plot;
  const crop = cropFromSeed(seed.name);
  game.appendDraft(`我在「${plotLabel(plot)}」播下「${seed.name}」，准备把它养成「${crop}」。请根据当前日期、天气、田畦条件和种植材料，在变量中写入播种日、成熟日、阶段、预计产出与材料消耗。`, { type: 'FARM_PLANT' });
  game.pushLog('提示', `播种行动 · ${crop} 已加入行动框，等待 AI 写入变量。`);
  seedPicker.open = false;
}

function removePlot(plot: FarmPlot) {
  game.appendDraft(`我撤去「${plotLabel(plot)}」的「${plot.crop}」，整理土面和工具。请在变量中删除或清空这块田畦。`, { type: 'FARM_REMOVE' });
  game.pushLog('提示', `撤去田畦行动 · ${plot.crop} 已加入行动框，等待 AI 写入变量。`);
}

function harvestPlot(plot: FarmPlot) {
  if (plot.stage < plot.stageMax) return;
  const crop = plot.crop;
  game.appendDraft(`我收成「${plotLabel(plot)}」的「${crop}」，分拣后送入库房。请根据田畦变量、天气与成熟状态，在变量中写入实际收获数量、批次标签、入库物品，并清空或更新田畦。`, { type: 'FARM_HARVEST' });
  game.pushLog('提示', `收成行动 · ${crop} 已加入行动框，等待 AI 写入变量。`);
}

function brewProgress(barrel: BrewBarrel) {
  const total = Math.max(1, barrel.matureDay - barrel.startedDay);
  const passed = Math.min(total, Math.max(0, currentDay.value - barrel.startedDay));
  return Math.round((passed / total) * 100);
}

function brewDaysLeft(barrel: BrewBarrel) {
  return Math.max(0, barrel.matureDay - currentDay.value);
}

function tapButtonText(barrel: BrewBarrel) {
  if (brewDaysLeft(barrel) === 0) return '开桶灌装';
  return pendingEarlyTapId.value === barrel.id ? '确认提前灌装' : '提前开桶灌装';
}

function tapBrew(barrel: BrewBarrel) {
  const daysLeft = brewDaysLeft(barrel);
  if (daysLeft > 0 && pendingEarlyTapId.value !== barrel.id) {
    pendingEarlyTapId.value = barrel.id;
    game.pushLog('提示', `${barrel.name} 还需要 ${daysLeft} 日才成熟。再次点击“确认提前灌装”才会提前开桶。`);
    return;
  }

  const bottles = daysLeft > 0 ? 4 : 8;
  const quality = daysLeft > 0 ? '提前开桶，风味偏薄' : barrel.expected.replace('预期: ', '');
  const result = game.dispatchAction({
    type: 'BREW_TAP',
    barrelId: barrel.id,
    bottles,
    portionsPerBottle: brewPortionsPerBottle,
    quality,
    priceCopper: 0,
  });
  if (!result.ok) {
    game.pushLog('提示', result.message);
    return;
  }
  pendingEarlyTapId.value = '';
  game.appendDraft(`我开启酒窖里的「${barrel.name}」桶，灌装约${bottles}瓶，每瓶可倒${brewPortionsPerBottle}份。当前判断：${quality}。（前端已结算：酒水已入库，酒桶已移除。）`, { type: 'BREW_TAP' });
  game.pushLog('提示', `开桶灌装 · ${barrel.name} 已结算并加入行动框。`);
}

</script>

<template>
  <section id="page-farm" class="page pm-paper">
    <header class="pm-paper-head">
      <div>
        <h2 class="h-title">
          <PmIcon name="farm" :size="22" />
          农田与酒窖
        </h2>
        <div class="sub">田畦种植 · 桶中熟成 · 收成与灌装</div>
      </div>
    </header>

    <div class="pm-paper-body">
      <div class="pm-divider">— 农田 · 田畦展示 —</div>
      <div class="farm-actions">
        <span class="pm-dim">这里读取变量显示田畦。</span>
      </div>

      <div class="farm-grid pm-grid auto-sm">
        <article v-for="plot in game.farmPlots" :key="plot.id" class="farm-plot pm-card">
          <div class="plot-h">
            <span class="plot-name">{{ plot.label || plot.crop }}</span>
            <span class="pm-tag dim">{{ plot.season }}</span>
          </div>
          <div v-if="plot.label && plot.crop && plot.label !== plot.crop" class="plot-crop pm-dim">{{ plot.crop }}</div>
          <div class="plot-stage">
            <span v-for="i in plot.stageMax" :key="i" class="stage-dot" :class="{ done: i <= plot.stage }"></span>
          </div>
          <div class="plot-stage-name pm-num">{{ stageHint(plot.stage) }} · {{ plot.stage }}/{{ plot.stageMax }}</div>
          <div v-if="plot.batchTags?.length" class="plot-tags">
            <span v-for="tag in plot.batchTags" :key="tag" class="pm-tag">{{ tag }}</span>
          </div>
          <div class="plot-exp pm-dim">{{ plot.expectedHarvest }}</div>
          <div v-if="plot.stage > 0" class="plot-dates">
            <span>播种 {{ dayLabel(plot.plantedDay) }}</span>
            <span>成熟 {{ dayLabel(plot.matureDay) }}</span>
          </div>
          <div class="plot-acts">
            <button v-if="plot.stage === 0" class="pm-btn sm" @click="openSeedPicker(plot)">
              <PmIcon name="plus" :size="11" /> 选择材料
            </button>
            <button v-if="plot.stage === 0" class="pm-btn sm ghost" @click="removePlot(plot)">
              <PmIcon name="x" :size="11" /> 删除
            </button>
            <button v-else-if="plot.stage >= plot.stageMax" class="pm-btn sm dark" @click="harvestPlot(plot)">
              <PmIcon name="check" :size="11" /> 收成
            </button>
            <button v-else class="pm-btn sm ghost" disabled>
              <PmIcon name="hourglass" :size="11" /> 等待成熟
            </button>
          </div>
        </article>
      </div>

      <div class="pm-divider">— 酒窖 · 桶中熟成 —</div>
      <div class="brew-actions">
        <span class="pm-dim">饮品、酱料和发酵物可以占用桶位；未成熟的酒桶需要二次确认才能提前灌装。</span>
        <span class="pm-tag dim">当前 {{ game.brews.length }} 桶</span>
      </div>

      <div class="brew-grid pm-grid auto">
        <article v-for="barrel in game.brews" :key="barrel.id" class="brew-card pm-card">
          <div class="brew-h">
            <span class="brew-name">{{ barrel.name }}</span>
            <span class="pm-tag dim">{{ barrel.expected }}</span>
          </div>
          <div class="brew-bar">
            <span class="pm-bar"><i :style="{ width: `${brewProgress(barrel)}%` }"></i></span>
            <span class="pm-num pct">{{ brewProgress(barrel) }}%</span>
          </div>
          <div class="brew-meta">
            <span class="pm-tag gold">{{ barrel.brewType ?? '酒水' }}</span>
            <span class="pm-tag">开始 {{ dayLabel(barrel.startedDay) }}</span>
            <span class="pm-tag">收获 {{ dayLabel(barrel.matureDay) }}</span>
            <span class="pm-tag">{{ barrel.filling }}</span>
            <span class="pm-tag dim">
              {{ brewDaysLeft(barrel) === 0 ? 8 : 4 }}瓶 · 每瓶{{ brewPortionsPerBottle }}份
            </span>
            <span class="pm-tag" :class="brewDaysLeft(barrel) === 0 ? 'good' : 'warn'">
              {{ brewDaysLeft(barrel) === 0 ? '已可开桶' : `尚需 ${brewDaysLeft(barrel)} 日` }}
            </span>
          </div>
          <div v-if="pendingEarlyTapId === barrel.id && brewDaysLeft(barrel) > 0" class="early-warning">
            这桶还没成熟。确认后会提前灌装，产量和风味按偏薄处理。
          </div>
          <div class="brew-acts">
            <button class="pm-btn sm" :class="{ danger: pendingEarlyTapId === barrel.id && brewDaysLeft(barrel) > 0 }" @click="tapBrew(barrel)">
              <PmIcon name="coin" :size="11" /> {{ tapButtonText(barrel) }}
            </button>
          </div>
        </article>
      </div>

    </div>

    <Teleport to="body">
      <div v-if="seedPicker.open" class="pm-modal-mask" @click.self="seedPicker.open = false">
        <div class="pm-modal">
          <header class="pm-modal-head">
            <h3><PmIcon name="farm" :size="16" /> 选择种植材料 · {{ seedPicker.plot ? plotLabel(seedPicker.plot) : '田畦' }}</h3>
            <button class="pm-link" @click="seedPicker.open = false"><PmIcon name="x" :size="16" /></button>
          </header>
          <div class="pm-modal-body">
            <div v-if="seedItems.length" class="seed-list">
              <button v-for="seed in seedItems" :key="seed.id" class="seed-card" @click="plantPlot(seed)">
                <strong>{{ seed.name }}</strong>
                <span class="pm-num">× {{ seed.qty }}</span>
                <small>{{ seed.desc }}</small>
              </button>
            </div>
            <div v-else class="pm-empty">库房里没有可用物品。</div>
          </div>
          <footer class="pm-modal-foot">
            <button class="pm-btn ghost" @click="seedPicker.open = false">取消</button>
          </footer>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.farm-actions,
.brew-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 6px 0 10px;
}
.farm-plot,
.brew-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.plot-h,
.brew-h {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}
.plot-name,
.brew-name {
  color: var(--pm-ink);
  font-family: var(--pm-font-display);
  font-size: calc(14px * var(--pm-text-scale));
}
.plot-stage {
  display: flex;
  gap: 4px;
}
.stage-dot {
  width: 14px;
  height: 14px;
  border: 1px solid rgba(110, 80, 34, 0.5);
  border-radius: 50%;
  background: rgba(110, 80, 34, 0.25);
}
.stage-dot.done {
  border-color: #34532b;
  background: linear-gradient(180deg, #b8c98b, #5c8a52);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}
.plot-stage-name,
.brew-bar .pct {
  color: var(--pm-ink-soft);
  font-size: calc(11.5px * var(--pm-text-scale));
}
.plot-exp {
  font-size: calc(11px * var(--pm-text-scale));
}
.plot-tags,
.brew-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.plot-dates {
  display: grid;
  gap: 2px;
  color: var(--pm-ink-dim);
  font-size: calc(10.5px * var(--pm-text-scale));
}
.plot-acts,
.brew-acts {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}
.brew-bar {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}
.early-warning {
  padding: 7px 8px;
  border: 1px solid rgba(153, 83, 37, 0.42);
  border-radius: 4px;
  background: rgba(255, 231, 190, 0.55);
  color: #7b3f22;
  font-size: calc(11px * var(--pm-text-scale));
  line-height: 1.45;
}
.seed-list {
  display: grid;
  gap: 8px;
}
.seed-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;
  padding: 10px;
  border: 1px solid rgba(110, 80, 34, 0.45);
  border-radius: 4px;
  background: rgba(255, 248, 226, 0.62);
  color: var(--pm-ink);
  text-align: left;
}
.seed-card:hover {
  border-color: rgba(130, 84, 31, 0.9);
  background: linear-gradient(180deg, rgba(246, 222, 159, 0.78), rgba(209, 166, 82, 0.48));
}
.seed-card small {
  grid-column: 1 / -1;
  color: var(--pm-ink-dim);
  line-height: 1.45;
}
@media (max-width: 760px) {
  .farm-actions,
  .brew-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
