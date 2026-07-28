<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatCopper, useGameStore, type InventoryItem } from '../stores/game';
import PmIcon from '../components/PmIcon.vue';
import { tagToneClass } from '../utils/tagAppearance';

const game = useGameStore();
const p = game.protagonist;

const cookingLevels = ['烧火工', '守灶童', '灶台学徒', '行炉工', '持勺匠', '灶台师傅', '首席灶师', '灶火宗师'];
const currentCookingTitle = computed(() => `${p.cookingLevel}级 · ${cookingLevels[p.cookingLevel - 1] ?? cookingLevels[0]}`);
const cookingProgressText = computed(() => {
  if (p.cookingLevel >= 8) return '已达灶火宗师';
  return `${p.cookingExp}/${p.cookingExpMax} 次`;
});

const energyValue = computed(() => Math.max(0, Math.floor(Number(game.energy.value) || 0)));
const energyMax = computed(() => Math.max(1, Math.floor(Number(game.energy.max) || 100)));
const energyPercent = computed(() => `${Math.max(0, Math.min(100, (energyValue.value / energyMax.value) * 100))}%`);
const satchelItems = computed(() => game.satchel.filter(item => item.qty > 0));
const satchelItemKinds = computed(() => satchelItems.value.length);
const satchelItemCount = computed(() => satchelItems.value.reduce((total, item) => total + Math.max(0, item.qty), 0));
const organizingItemIds = ref<Set<string>>(new Set());
const organizingAll = ref(false);
const protagonistTemporaryStates = computed(() =>
  game.flattenTemporaryStates().filter(state => state.targetType === '主角'),
);

function stockUnit(item: InventoryItem) {
  return game.inventoryStockUnitForItem(item);
}

function portionUnit(item: InventoryItem) {
  return game.inventoryPortionUnitForItem(item);
}

function portionText(item: InventoryItem) {
  const portions = Math.max(1, Math.floor(Number(item.portionsPerUnit) || 1));
  const remaining = Math.max(0, Math.min(portions, Math.floor(Number(item.remainingPortions ?? portions) || 0)));
  return `${remaining}/${portions}${portionUnit(item)}`;
}

async function organizeToStorage(item: InventoryItem) {
  if (organizingItemIds.value.has(item.id)) return;
  organizingItemIds.value = new Set([...organizingItemIds.value, item.id]);
  try {
    const result = await game.executePseudoZeroAction(
      {
        type: 'INVENTORY_MOVE_TO_STORAGE',
        itemId: item.id,
        qty: item.qty,
      },
      {
        type: 'INVENTORY_MOVE_TO_STORAGE',
        title: '整理入库',
        logText: `整理入库 · ${item.name} ×${item.qty}`,
        queueDraft: true,
      },
    );
    if (!result.ok) game.pushLog('提示', result.message);
  } finally {
    const next = new Set(organizingItemIds.value);
    next.delete(item.id);
    organizingItemIds.value = next;
  }
}

async function organizeAllToStorage() {
  if (organizingAll.value || satchelItems.value.length === 0) return;
  organizingAll.value = true;
  const targets = satchelItems.value.map(item => item.id);
  try {
    for (const itemId of targets) {
      const item = game.satchel.find(entry => entry.id === itemId);
      if (!item?.qty) continue;
      await organizeToStorage(item);
    }
  } finally {
    organizingAll.value = false;
  }
}

function trainCooking() {
  game.appendDraft('我在炉台旁练习基础火候、刀工和手感，想把厨艺磨得更稳一些。');
  game.pushLog('提示', '厨艺练习已加入行动框。');
}
</script>

<template>
  <section id="page-protagonist" class="page pm-paper">
    <header class="pm-paper-head">
      <div>
        <h2 class="h-title">
          <PmIcon name="heart" :size="22" />
          主角档案
        </h2>
        <div class="sub">酒馆主人 · 厨艺等级 · 当前状态</div>
      </div>
    </header>

    <div class="pm-paper-body hero-layout">
      <section class="hero-card">
        <div class="hero-sigil">
          <PmIcon name="tavern" :size="34" />
        </div>
        <div>
          <h3>{{ p.name }}</h3>
          <div class="pm-dim">{{ game.tavernName }} · {{ p.title }} · {{ p.located }}</div>
          <div class="hero-facts">
            <span><b>当前状态</b>{{ p.mood }}</span>
            <span><b>一句话穿着</b>{{ p.outfit || '衣着暂未记录。' }}</span>
          </div>
          <div v-if="protagonistTemporaryStates.length" class="temp-states">
            <span
              v-for="state in protagonistTemporaryStates"
              :key="`protagonist-${state.名称}-${state.描述}`"
              class="temp-chip"
              :title="state.描述"
            >
              {{ state.名称 }} · {{ state.剩余回合 }}回合
            </span>
          </div>
          <p v-if="p.bio">{{ p.bio }}</p>
        </div>
      </section>

      <section class="stat-grid">
        <article class="stat-card">
          <span>生命</span>
          <strong>{{ p.hp }}/{{ p.hpMax }}</strong>
          <em>{{ game.lifePhase(p.hp, p.hpMax) }}</em>
          <span class="pm-bar hp"><i :style="{ width: `${(p.hp / p.hpMax) * 100}%` }"></i></span>
        </article>
        <article class="stat-card">
          <span>精力</span>
          <strong>{{ energyValue }}/{{ energyMax }}</strong>
          <em>{{ game.energyPhase(energyValue, energyMax) }}</em>
          <span class="pm-bar energy"><i :style="{ width: energyPercent }"></i></span>
        </article>
        <article class="stat-card wide">
          <span>厨艺</span>
          <strong>{{ currentCookingTitle }}</strong>
          <em>{{ cookingProgressText }}</em>
          <em>下级所需 {{ p.cookingExpMax }} 次</em>
          <span class="pm-bar affection"><i :style="{ width: `${(p.cookingExp / p.cookingExpMax) * 100}%` }"></i></span>
          <button class="pm-btn sm dark" @click="trainCooking">
            <PmIcon name="fire" :size="13" /> 练习
          </button>
        </article>
      </section>

      <section class="satchel-card">
        <header class="satchel-head">
          <div>
            <h3><PmIcon name="ledger" :size="16" /> 随身行囊</h3>
            <p>主角当前随身携带的物品。</p>
          </div>
          <div class="satchel-head-actions">
            <span>{{ satchelItemKinds }} 种 · {{ satchelItemCount }} 件</span>
            <button
              v-if="satchelItems.length"
              class="pm-btn sm"
              :disabled="organizingAll"
              @click="organizeAllToStorage"
            >
              <PmIcon name="home" :size="13" />
              {{ organizingAll ? '整理中' : '全部整理入库' }}
            </button>
          </div>
        </header>

        <div v-if="satchelItems.length" class="satchel-list">
          <article v-for="item in satchelItems" :key="item.id">
            <div class="satchel-item-head">
              <div>
                <strong>{{ item.name }}</strong>
                <small>{{ item.category }}</small>
              </div>
              <span>×{{ item.qty }}{{ stockUnit(item) }}</span>
            </div>
            <div v-if="item.tags.length" class="satchel-tags">
              <span v-for="tag in item.tags" :key="tag" class="pm-tag" :class="tagToneClass(tag)">{{ tag }}</span>
            </div>
            <div class="satchel-meta">
              <span><small>当前份数</small><b>{{ portionText(item) }}</b></span>
              <span><small>整件价格</small><b>{{ formatCopper(item.priceCopper) }}</b></span>
            </div>
            <p v-if="item.desc">{{ item.desc }}</p>
            <button
              class="satchel-store-btn"
              :disabled="organizingItemIds.has(item.id) || organizingAll"
              @click="organizeToStorage(item)"
            >
              <PmIcon name="home" :size="13" />
              {{ organizingItemIds.has(item.id) ? '整理中' : '整理入库' }}
            </button>
          </article>
        </div>
        <div v-else class="pm-empty compact">行囊里暂时没有物品。</div>

        <footer class="satchel-foot">
          <small>个人行囊完整显示于主角档案，酒馆库房位于物资页。</small>
        </footer>
      </section>
    </div>
  </section>
</template>

<style scoped>
.hero-layout {
  display: grid;
  gap: 14px;
}
.hero-card {
  display: grid;
  grid-template-columns: 82px 1fr;
  gap: 14px;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(110, 80, 34, 0.42);
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(255, 245, 215, 0.76), rgba(212, 186, 136, 0.48));
}
.hero-sigil {
  width: 82px;
  height: 82px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  border: 1px solid rgba(110, 80, 34, 0.5);
  background: radial-gradient(circle at 35% 25%, rgba(255, 245, 215, 0.55), transparent 68%), linear-gradient(180deg, #8b6330, #2a1c11);
  color: var(--pm-parch-bright);
}
.hero-card h3 {
  margin: 0 0 4px;
  color: var(--pm-ink);
  font-family: var(--pm-font-display);
  font-size: calc(22px * var(--pm-text-scale));
}
.hero-card p {
  margin: 8px 0 0;
  color: var(--pm-ink-soft);
  line-height: 1.7;
}
.hero-facts {
  display: grid;
  gap: 5px;
  margin-top: 10px;
}
.hero-facts span {
  display: grid;
  grid-template-columns: 82px 1fr;
  gap: 8px;
  color: var(--pm-ink-soft);
  font-size: calc(12px * var(--pm-text-scale));
  line-height: 1.55;
}
.hero-facts b {
  color: var(--pm-ink-dim);
  font-family: var(--pm-font-display);
  font-size: calc(11px * var(--pm-text-scale));
}
.temp-states {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.temp-chip {
  max-width: 100%;
  padding: 4px 8px;
  border: 1px solid rgba(158, 111, 35, 0.44);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(242, 214, 132, 0.72), rgba(173, 126, 50, 0.45));
  color: #4a2f12;
  font-size: calc(11px * var(--pm-text-scale));
  font-family: var(--pm-font-display);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.stat-card {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(110, 80, 34, 0.38);
  border-radius: 4px;
  background: rgba(255, 245, 215, 0.55);
}
.stat-card span:first-child {
  color: var(--pm-ink-dim);
  font-family: var(--pm-font-display);
  font-weight: 700;
}
.stat-card strong {
  color: var(--pm-ink);
  font-size: calc(18px * var(--pm-text-scale));
}
.stat-card em {
  color: var(--pm-ink-dim);
  font-style: normal;
  font-size: calc(12px * var(--pm-text-scale));
}
.satchel-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid rgba(110, 80, 34, 0.38);
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(255, 245, 215, 0.72), rgba(212, 186, 136, 0.46));
}
.satchel-head,
.satchel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.satchel-head h3 {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--pm-ink);
  font-family: var(--pm-font-display);
  font-size: calc(15px * var(--pm-text-scale));
}
.satchel-head p,
.satchel-foot small {
  margin: 3px 0 0;
  color: var(--pm-ink-dim);
  font-size: calc(12px * var(--pm-text-scale));
}
.satchel-head > span {
  color: var(--pm-gold-dim);
  font-weight: 700;
  white-space: nowrap;
}
.satchel-head-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.satchel-head-actions > span {
  color: var(--pm-gold-dim);
  font-weight: 700;
  white-space: nowrap;
}
.satchel-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 8px;
}
.satchel-list article {
  display: grid;
  align-content: start;
  gap: 8px;
  min-height: 154px;
  padding: 10px;
  border: 1px solid rgba(110, 80, 34, 0.34);
  border-radius: 4px;
  background: rgba(255, 249, 229, 0.58);
  color: var(--pm-ink);
  text-align: left;
}
.satchel-item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.satchel-item-head > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.satchel-list strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.satchel-list small {
  color: var(--pm-ink-dim);
  font-size: calc(10px * var(--pm-text-scale));
}
.satchel-item-head > span {
  color: var(--pm-ink-dim);
  font-size: calc(12px * var(--pm-text-scale));
  font-weight: 700;
  white-space: nowrap;
}
.satchel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 20px;
}
.satchel-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px dashed rgba(110, 80, 34, 0.3);
  border-bottom: 1px dashed rgba(110, 80, 34, 0.3);
}
.satchel-meta > span {
  display: grid;
  gap: 2px;
  padding: 6px 4px;
}
.satchel-meta > span + span {
  border-left: 1px solid rgba(110, 80, 34, 0.24);
}
.satchel-meta b {
  color: var(--pm-ink);
  font-size: calc(12px * var(--pm-text-scale));
}
.satchel-list article > p {
  margin: 0;
  color: var(--pm-ink-dim);
  font-size: calc(11px * var(--pm-text-scale));
  line-height: 1.45;
}
.satchel-store-btn {
  align-self: end;
  min-height: 30px;
  border: 1px solid rgba(119, 82, 27, 0.5);
  border-radius: 4px;
  background: linear-gradient(180deg, #f8e5ad, #c99742);
  color: #3d2810;
  font-family: var(--pm-font-display);
  font-weight: 700;
  cursor: pointer;
}
.satchel-store-btn:disabled {
  cursor: wait;
  opacity: 0.55;
}
@media (max-width: 860px) {
  .hero-card,
  .stat-grid,
  .satchel-head,
  .satchel-foot {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
  .satchel-head-actions {
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .satchel-list {
    grid-template-columns: 1fr;
  }
}
</style>
