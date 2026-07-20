<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore, type InventoryItem } from '../stores/game';
import PmIcon from '../components/PmIcon.vue';

const game = useGameStore();

const linenTotals = computed(() => ({
  total: game.linenStock.reduce((sum, entry) => sum + entry.total, 0),
  clean: game.linenStock.reduce((sum, entry) => sum + entry.clean, 0),
  dirty: game.linenStock.reduce((sum, entry) => sum + entry.dirty, 0),
  drying: game.linenStock.reduce((sum, entry) => sum + entry.drying, 0),
}));

const stableFeedTotal = computed(() => inventoryTotal(game.stable.feedStock));
const livestockFeedTotal = computed(() => inventoryTotal(game.livestock.feedStock));

function inventoryTotal(items: InventoryItem[]) {
  return items.reduce((sum, item) => sum + Math.max(0, Math.floor(Number(item.qty) || 0)), 0);
}

function linenTotal(entry: { total: number; clean: number; dirty: number; drying: number }) {
  return Math.max(entry.total, entry.clean + entry.dirty + entry.drying, 1);
}

function linenWidth(value: number, total: number) {
  return `${Math.max(0, Math.min(100, Math.round((value / Math.max(1, total)) * 100)))}%`;
}

function dryingProgress(status: string) {
  if (status === '已干可收') return 100;
  if (status === '基本干了') return 76;
  if (status === '半干') return 48;
  return 18;
}

function feedLabel(item: InventoryItem) {
  return `${item.name} × ${item.qty}${item.unit || ''}`;
}
</script>

<template>
  <section id="page-logistics" class="page pm-paper">
    <header class="pm-paper-head">
      <div>
        <h2 class="h-title">
          <PmIcon name="ledger" :size="22" />
          后勤与圈舍
        </h2>
        <div class="sub">布草 · 晾晒 · 厩舍 · 禽畜 · 饲料</div>
      </div>
      <button class="pm-btn sm ghost" @click="game.loadFromMvu({ force: true })">
        <PmIcon name="refresh" :size="12" /> 重读变量
      </button>
    </header>

    <div class="pm-paper-body logistics-page">
      <section class="overview-strip">
        <article>
          <span>布草总数</span>
          <strong>{{ linenTotals.total }}</strong>
          <small>干净 {{ linenTotals.clean }} · 待洗 {{ linenTotals.dirty }} · 晾晒 {{ linenTotals.drying }}</small>
        </article>
        <article>
          <span>晾晒批次</span>
          <strong>{{ game.dryingBatches.length }}</strong>
          <small>已干可收 {{ game.dailyLogisticsSummary.dryReady }} · 半干以上 {{ game.dailyLogisticsSummary.dryingHalfOrBetter }}</small>
        </article>
        <article>
          <span>厩舍容量</span>
          <strong>{{ game.stable.currentCount }}/{{ game.stable.capacity }}</strong>
          <small>{{ game.stable.condition }}{{ game.stable.style ? ` · ${game.stable.style}` : '' }}</small>
        </article>
        <article>
          <span>禽畜群数</span>
          <strong>{{ game.livestock.animals.length }}</strong>
          <small>{{ game.livestock.condition }}{{ game.livestock.style ? ` · ${game.livestock.style}` : '' }}</small>
        </article>
      </section>

      <section class="logistics-panel full">
        <header>
          <div>
            <h3><PmIcon name="ledger" :size="15" /> 布草库存</h3>
            <p>读取变量：布草库存。</p>
          </div>
          <span class="pm-tag dim">{{ game.linenStock.length }} 类</span>
        </header>
        <div v-if="game.linenStock.length" class="linen-list">
          <article v-for="entry in game.linenStock" :key="entry.name" class="linen-row" :class="{ low: entry.clean <= 1 }">
            <div class="linen-head">
              <strong>{{ entry.name }}</strong>
              <span>总数 {{ entry.total }}</span>
            </div>
            <div class="linen-bar">
              <i class="clean" :style="{ width: linenWidth(entry.clean, linenTotal(entry)) }"></i>
              <i class="dirty" :style="{ width: linenWidth(entry.dirty, linenTotal(entry)) }"></i>
              <i class="drying" :style="{ width: linenWidth(entry.drying, linenTotal(entry)) }"></i>
            </div>
            <div class="linen-meta">
              <span>干净可用 {{ entry.clean }}</span>
              <span>脏污待洗 {{ entry.dirty }}</span>
              <span>晾晒中 {{ entry.drying }}</span>
            </div>
          </article>
        </div>
        <div v-else class="pm-empty compact">当前变量里没有布草库存记录。</div>
      </section>

      <section class="logistics-grid">
        <article class="logistics-panel">
          <header>
            <div>
              <h3><PmIcon name="candle" :size="15" /> 晾晒</h3>
              <p>读取变量：晾晒.晾晒中。</p>
            </div>
            <span class="pm-tag dim">{{ game.dryingBatches.length }} 批</span>
          </header>
          <div v-if="game.dryingBatches.length" class="drying-list">
            <div v-for="batch in game.dryingBatches" :key="batch.id" class="drying-card" :class="{ ready: batch.status === '已干可收' }">
              <div class="drying-head">
                <strong>{{ batch.item }}</strong>
                <span class="pm-tag" :class="batch.status === '已干可收' ? 'good' : 'dim'">{{ batch.status }}</span>
              </div>
              <span class="drying-bar"><i :style="{ width: `${dryingProgress(batch.status)}%` }"></i></span>
              <div class="linen-meta">
                <span v-if="batch.position">位置 {{ batch.position }}</span>
                <span v-if="batch.expectedDryDay">预计第 {{ batch.expectedDryDay }} 日</span>
                <span v-if="batch.source">来源 {{ batch.source }}</span>
              </div>
              <p v-if="batch.dirtyReason || batch.note">{{ batch.dirtyReason || batch.note }}</p>
            </div>
          </div>
          <div v-else class="pm-empty compact">当前变量里没有晾晒批次。</div>
        </article>

        <article class="logistics-panel">
          <header>
            <div>
              <h3><PmIcon name="pin" :size="15" /> 厩舍</h3>
              <p>读取变量：厩舍。</p>
            </div>
            <span class="pm-tag" :class="game.stable.condition === '停用' ? 'warn' : 'dim'">{{ game.stable.condition }}</span>
          </header>
          <dl class="state-list">
            <div><dt>状态</dt><dd>{{ game.stable.condition }}</dd></div>
            <div><dt>风格</dt><dd>{{ game.stable.style || '未记录' }}</dd></div>
            <div><dt>容量</dt><dd>{{ game.stable.currentCount }}/{{ game.stable.capacity }}</dd></div>
          </dl>
          <p class="panel-desc">{{ game.stable.description || '当前变量没有厩舍描述。' }}</p>
          <div v-if="game.stable.vehicles.length" class="unit-list">
            <div v-for="vehicle in game.stable.vehicles" :key="vehicle.id" class="unit-card">
              <strong>{{ vehicle.name }}</strong>
              <div class="tag-row">
                <span class="pm-tag gold">{{ vehicle.type || '载具' }}</span>
                <span v-if="vehicle.breed" class="pm-tag">{{ vehicle.breed }}</span>
                <span v-if="vehicle.owner" class="pm-tag dim">{{ vehicle.owner }}</span>
              </div>
              <p>{{ vehicle.health || vehicle.feedNeed || vehicle.note || '状态未记录。' }}</p>
              <small v-if="vehicle.expectedStay">预计停留 {{ vehicle.expectedStay }}</small>
            </div>
          </div>
          <div v-else class="pm-empty compact">厩舍当前没有载具记录。</div>
          <div class="feed-box">
            <strong>饲料储备 · {{ stableFeedTotal }}</strong>
            <span v-if="game.stable.feedStock.length">{{ game.stable.feedStock.map(feedLabel).join('、') }}</span>
            <span v-else>没有饲料储备记录。</span>
          </div>
        </article>

        <article class="logistics-panel">
          <header>
            <div>
              <h3><PmIcon name="farm" :size="15" /> 禽畜圈养</h3>
              <p>读取变量：禽畜圈养。</p>
            </div>
            <span class="pm-tag" :class="game.livestock.condition === '停用' ? 'warn' : 'dim'">{{ game.livestock.condition }}</span>
          </header>
          <dl class="state-list">
            <div><dt>圈舍状态</dt><dd>{{ game.livestock.condition }}</dd></div>
            <div><dt>圈舍风格</dt><dd>{{ game.livestock.style || '未记录' }}</dd></div>
            <div><dt>禽畜群数</dt><dd>{{ game.livestock.animals.length }}</dd></div>
          </dl>
          <p class="panel-desc">{{ game.livestock.description || '当前变量没有圈舍描述。' }}</p>
          <div v-if="game.livestock.animals.length" class="unit-list">
            <div v-for="animal in game.livestock.animals" :key="animal.id" class="unit-card">
              <div class="unit-head">
                <strong>{{ animal.name }}</strong>
                <span class="pm-num">× {{ animal.qty }}</span>
              </div>
              <div class="tag-row">
                <span class="pm-tag gold">{{ animal.type }}</span>
                <span v-if="animal.growthStage" class="pm-tag">{{ animal.growthStage }}</span>
                <span v-if="animal.breed" class="pm-tag dim">{{ animal.breed }}</span>
              </div>
              <p>{{ animal.product || '未记录产出' }} · {{ animal.productCycle || '周期未记录' }}</p>
              <small>{{ animal.health || animal.feedNeed || animal.note || '状态未记录。' }}</small>
            </div>
          </div>
          <div v-else class="pm-empty compact">圈舍当前没有禽畜记录。</div>
          <div class="feed-box">
            <strong>饲料储备 · {{ livestockFeedTotal }}</strong>
            <span v-if="game.livestock.feedStock.length">{{ game.livestock.feedStock.map(feedLabel).join('、') }}</span>
            <span v-else>没有饲料储备记录。</span>
          </div>
        </article>

        <article class="logistics-panel">
          <header>
            <div>
              <h3><PmIcon name="pot" :size="15" /> 库存预警</h3>
              <p>按当前库房份数、批次和单位计算。</p>
            </div>
            <span class="pm-tag" :class="game.dailyLogisticsSummary.lowSupplies.length ? 'warn' : 'good'">
              {{ game.dailyLogisticsSummary.lowSupplies.length }} 项
            </span>
          </header>
          <div v-if="game.dailyLogisticsSummary.lowSupplies.length" class="warning-list">
            <span v-for="item in game.dailyLogisticsSummary.lowSupplies" :key="`${item.category}-${item.name}`">
              {{ item.name }}只剩 {{ item.available }}{{ item.portionUnit }}
              <template v-if="item.batchCount > 1">（{{ item.batchCount }}批，共{{ item.totalQty }}{{ item.unit }}）</template>
            </span>
          </div>
          <div v-else class="pm-empty compact">当前没有低位库存预警。</div>
        </article>
      </section>
    </div>
  </section>
</template>

<style scoped>
.logistics-page {
  display: grid;
  gap: 12px;
}
.overview-strip,
.logistics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.overview-strip article,
.logistics-panel {
  border: 1px solid rgba(110, 80, 34, 0.34);
  border-radius: 6px;
  background: rgba(255, 245, 215, 0.5);
}
.overview-strip article {
  display: grid;
  gap: 4px;
  padding: 10px;
}
.overview-strip span,
.overview-strip small,
.panel-desc,
.unit-card p,
.unit-card small,
.feed-box span {
  color: var(--pm-ink-dim);
  font-size: calc(11px * var(--pm-text-scale));
  line-height: 1.45;
}
.overview-strip strong {
  color: var(--pm-ink);
  font-size: calc(20px * var(--pm-text-scale));
}
.logistics-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.logistics-panel {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 12px;
}
.logistics-panel.full {
  grid-column: 1 / -1;
}
.logistics-panel header,
.linen-head,
.drying-head,
.unit-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: start;
}
.logistics-panel h3,
.logistics-panel p,
.state-list,
.panel-desc {
  margin: 0;
}
.logistics-panel h3 {
  color: var(--pm-ink);
  font-family: var(--pm-font-display);
  font-size: calc(15px * var(--pm-text-scale));
}
.logistics-panel header p {
  margin-top: 3px;
  color: var(--pm-ink-dim);
  font-size: calc(11px * var(--pm-text-scale));
}
.linen-list,
.drying-list,
.unit-list,
.warning-list {
  display: grid;
  gap: 8px;
}
.linen-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.linen-row,
.drying-card,
.unit-card,
.feed-box,
.warning-list span {
  display: grid;
  gap: 6px;
  padding: 9px;
  border: 1px solid rgba(110, 80, 34, 0.28);
  border-radius: 5px;
  background: rgba(255, 252, 238, 0.42);
}
.linen-row.low {
  border-color: rgba(140, 58, 39, 0.56);
  background: rgba(255, 230, 210, 0.42);
}
.linen-head,
.drying-head,
.unit-head {
  color: var(--pm-ink);
}
.linen-head span {
  color: var(--pm-ink-dim);
  font-size: calc(10.5px * var(--pm-text-scale));
}
.linen-bar,
.drying-bar {
  display: flex;
  height: 8px;
  overflow: hidden;
  border: 1px solid rgba(110, 80, 34, 0.28);
  border-radius: 999px;
  background: rgba(110, 80, 34, 0.16);
}
.linen-bar i,
.drying-bar i {
  display: block;
  height: 100%;
}
.linen-bar .clean {
  background: #6f8b4c;
}
.linen-bar .dirty {
  background: #9b6a45;
}
.linen-bar .drying {
  background: #6f8aa6;
}
.drying-bar i {
  border-radius: inherit;
  background: linear-gradient(90deg, #58718a, #b9d1dc, #7f9a55);
}
.drying-card.ready {
  border-color: rgba(79, 119, 59, 0.58);
  background: rgba(233, 244, 210, 0.44);
}
.linen-meta,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.linen-meta span {
  padding: 2px 7px;
  border: 1px solid rgba(131, 92, 34, 0.28);
  border-radius: 999px;
  background: rgba(255, 252, 238, 0.42);
  color: var(--pm-ink-dim);
  font-size: calc(10.5px * var(--pm-text-scale));
}
.state-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.state-list div {
  display: grid;
  gap: 3px;
  padding: 8px;
  border: 1px solid rgba(110, 80, 34, 0.22);
  border-radius: 4px;
  background: rgba(255, 252, 238, 0.36);
}
.state-list dt {
  color: var(--pm-ink-dim);
  font-size: calc(10.5px * var(--pm-text-scale));
}
.state-list dd {
  margin: 0;
  color: var(--pm-ink);
  font-weight: 700;
}
.feed-box strong,
.unit-card strong {
  color: var(--pm-ink);
}
@media (max-width: 900px) {
  .overview-strip,
  .logistics-grid,
  .linen-list {
    grid-template-columns: 1fr;
  }
  .state-list {
    grid-template-columns: 1fr;
  }
}
</style>
