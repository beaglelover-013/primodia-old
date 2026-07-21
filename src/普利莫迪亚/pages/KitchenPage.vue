<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useGameStore, formatCopper, type CraftMode, type InventoryItem, type RecipeEntry } from '../stores/game';
import PmIcon from '../components/PmIcon.vue';
import { tagToneClass } from '../utils/tagAppearance';

const game = useGameStore();
const cauldronImage = new URL('../assets/kitchen-cauldron.png', import.meta.url).href;

interface SlotEntry {
  itemId: string;
  qty: number;
}

type KitchenShelf = '食材' | '调料' | '其他' | '产品' | '配方';

const slots = ref<SlotEntry[]>([]);
const slotLogIds = ref<string[]>([]);
const craftMode = ref<CraftMode>('cooking');
const selectedServeGuestId = ref('');
const activeShelf = ref<KitchenShelf>('产品');
const copiesByRecipe = reactive<Record<string, number>>({});
const shortageRecipeId = ref<string | null>(null);
const isPotHot = ref(false);

const craftModeLabels: Record<CraftMode, string> = {
  cooking: '做菜',
  sauce: '做酱',
  drink: '做饮品',
  brew: '酿酒',
};

const seasonings = computed(() => game.inventory.filter(item => item.category === '调料'));
const ingredients = computed(() => game.inventory.filter(item => item.category === '食材'));
const others = computed(() => game.inventory.filter(item => item.category === '日用品' || item.category === '杂物'));
const products = computed(() => game.inventory.filter(item => item.category === '成品' || item.category === '酒水'));
const basketSummary = computed(() => summarizeSlots(slots.value));
const basketCost = computed(() =>
  slots.value.reduce((total, slot) => {
    const item = findItem(slot.itemId);
    return total + game.basePriceForPortion(item) * slot.qty;
  }, 0),
);
const serveTotal = computed(() =>
  game.salePriceFromBase(slots.value.reduce((total, slot) => {
    const item = findItem(slot.itemId);
    return total + game.basePriceForPortion(item) * slot.qty;
  }, 0)),
);
const serveSelection = computed(() => selectedCraftItems());
const canServeSelection = computed(() =>
  serveSelection.value.length > 0 && serveSelection.value.every(item => ['食材', '调料', '成品', '酒水'].includes(item.category)),
);
const serveHasRawItems = computed(() => serveSelection.value.some(item => item.category === '食材' || item.category === '调料'));
const serveGuests = computed(() => game.orderableGuestGroups());
const selectedServeGuest = computed(() => serveGuests.value.find(group => group.id === selectedServeGuestId.value));
const canCraft = computed(() => slots.value.length > 0);
const shownRecipes = computed(() => game.recipes.slice(0, 8));

watch(
  serveGuests,
  guests => {
    if (!guests.length) {
      selectedServeGuestId.value = '';
      return;
    }
    if (!guests.some(group => group.id === selectedServeGuestId.value)) {
      selectedServeGuestId.value = guests[0]?.id ?? '';
    }
  },
  { immediate: true },
);

watch(
  () => game.inventory.map(item => `${item.id}:${item.qty}:${item.remainingPortions ?? ''}`).join('|'),
  () => {
    slots.value = slots.value
      .map(slot => {
        const item = findItem(slot.itemId);
        if (!item || item.qty <= 0) return null;
        return { ...slot, qty: Math.min(slot.qty, game.availablePortionsForItem(item)) };
      })
      .filter((slot): slot is SlotEntry => slot !== null);
    if (slots.value.length === 0) clearSlotLogs();
  },
);

function findItem(id: string) {
  return game.inventory.find(item => item.id === id);
}

function stockUnit(item: InventoryItem) {
  return game.inventoryStockUnitForItem(item);
}

function portionUnit(item: InventoryItem) {
  return game.inventoryPortionUnitForItem(item);
}

function availablePortions(item: InventoryItem) {
  return game.availablePortionsForItem(item);
}

function formatPortionCost(item: InventoryItem) {
  const value = game.basePriceForPortion(item);
  return `${Number.isInteger(value) ? value : Number(value.toFixed(2))}铜/${portionUnit(item)}`;
}

function formatAccountingCost(value: number) {
  return `${Number.isInteger(value) ? value : Number(value.toFixed(2))}铜`;
}

function portionText(item: InventoryItem) {
  const portions = Math.max(1, Math.floor(Number(item.portionsPerUnit) || 1));
  const remaining = Math.max(0, Math.min(portions, Math.floor(Number(item.remainingPortions ?? portions) || 0)));
  if (portions <= 1) return '';
  return `${remaining}/${portions}${portionUnit(item)}`;
}

function portionPercent(item: InventoryItem) {
  const portions = Math.max(1, Math.floor(Number(item.portionsPerUnit) || 1));
  const remaining = Math.max(0, Math.min(portions, Math.floor(Number(item.remainingPortions ?? portions) || 0)));
  return Math.round((remaining / portions) * 100);
}

function summarizeSlots(nextSlots: SlotEntry[]) {
  return nextSlots
    .map(slot => {
      const item = findItem(slot.itemId);
      return item ? `${item.name}×${slot.qty}${portionUnit(item)}` : '';
    })
    .filter(Boolean)
    .join('、');
}

function slotText(slot: SlotEntry) {
  const item = findItem(slot.itemId);
  return item ? `${item.name}×${slot.qty}${portionUnit(item)}` : '';
}

function addToPot(item: InventoryItem) {
  if (item.qty <= 0) {
    game.pushLog('提示', `${item.name} 已无库存。`);
    return;
  }
  const existed = slots.value.find(slot => slot.itemId === item.id);
  if (existed) {
    if (existed.qty < availablePortions(item)) existed.qty += 1;
  } else {
    slots.value.push({ itemId: item.id, qty: 1 });
  }
  isPotHot.value = true;
  window.setTimeout(() => {
    isPotHot.value = false;
  }, 280);
  slotLogIds.value.push(game.pushLog('提示', `${item.name} 已放入锅底。`));
}

function onDragStart(event: DragEvent, item: InventoryItem) {
  event.dataTransfer?.setData('text/plain', item.id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
}

function onPotDrop(event: DragEvent) {
  const id = event.dataTransfer?.getData('text/plain');
  const item = id ? findItem(id) : null;
  if (item) addToPot(item);
}

function decSlot(index: number) {
  const slot = slots.value[index];
  if (!slot) return;
  slot.qty -= 1;
  if (slot.qty <= 0) slots.value.splice(index, 1);
  if (slots.value.length === 0) clearSlotLogs();
}

function clearSlotLogs() {
  game.removeLogs(slotLogIds.value);
  slotLogIds.value = [];
}

function clearSlots() {
  slots.value = [];
  clearSlotLogs();
}

function selectedCraftItems() {
  return slots.value
    .map(slot => {
      const item = findItem(slot.itemId);
      if (!item) return null;
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        qty: slot.qty,
        tags: item.tags,
        priceCopper: game.basePriceForPortion(item),
        portionsPerUnit: item.portionsPerUnit,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

async function recordCraftAction(mode: CraftMode) {
  if (!basketSummary.value) return;
  craftMode.value = mode;
  const summaryBeforeAction = basketSummary.value;
  const result = await game.executePseudoZeroAction({
    type: 'COOK_DISH',
    mode,
    items: selectedCraftItems(),
  }, {
    type: 'COOK_DISH',
    title: craftModeLabels[mode],
    inputText: `玩家用这些材料${craftModeLabels[mode]}：${summaryBeforeAction}。`,
    aiHint: '请按对应生成引擎叙述制作过程, 并输出 <craft_result> 隐藏数据块供前端入库。',
    logText: `${craftModeLabels[mode]} · ${summaryBeforeAction}`,
    preserveLocalState: true,
  });
  if (result.ok) clearSlots();
}

async function serveItems() {
  if (!basketSummary.value) return;
  if (!canServeSelection.value) {
    game.pushLog('提示', '本次选择里有不能上桌的杂物。食材、调料、成品和酒水可以上菜。');
    return;
  }
  if (serveGuests.value.length > 0 && !selectedServeGuest.value) {
    game.pushLog('提示', '请选择要上菜的客人或桌。');
    return;
  }
  const summaryBeforeAction = basketSummary.value;
  const totalBeforeAction = serveTotal.value;
  const guest = selectedServeGuest.value;
  const targetText = guest ? `给「${guest.label}」` : '普通上菜';
  const rawServeHint = serveHasRawItems.value
    ? '本次包含食材或调料，请按冷盘、佐食、直接可入口的食材、客人要求的原料或小份试吃来叙述，不要假装已经额外烹饪。'
    : '';
  const result = await game.executePseudoZeroAction({
    type: 'SERVE_DISH',
    items: selectedCraftItems(),
    guestId: guest?.id,
  }, {
    type: 'SERVE_DISH',
    title: '上菜',
    aiHint: guest
      ? `玩家把本次上菜送到「${guest.label}」。那桌是${guest.guests || '未记录客人'}，之前点了「${guest.order || '未记录点单'}」。${rawServeHint}请叙述上菜与客人反应，不要重新计算价格，不要改变库存、随身钱袋或钱匣。`
      : `${rawServeHint}请叙述上菜、客人反应和酒馆气氛，不要重新计算价格，不要改变库存、随身钱袋或钱匣。`,
    logText: `上菜 · ${targetText} · ${summaryBeforeAction} · ${formatCopper(totalBeforeAction)}`,
    preserveLocalState: true,
  });
  if (result.ok) clearSlots();
}

function canSaveRecipe(item: InventoryItem) {
  return Boolean(item.recipeSource?.ingredients?.length) && ['成品', '酒水', '调料'].includes(item.category);
}

function recipeButtonText(item: InventoryItem) {
  if (!canSaveRecipe(item)) return '缺少材料记录';
  return game.isRecipeSavedForItem(item) ? '已保存' : '保存配方';
}

function saveRecipe(item: InventoryItem) {
  if (!canSaveRecipe(item)) {
    game.pushLog('提示', `「${item.name}」缺少材料记录，不能保存为配方。`);
    return;
  }
  game.saveRecipeFromInventoryItem(item.id);
}

function copiesFor(recipe: RecipeEntry) {
  return Math.max(1, Math.floor(Number(copiesByRecipe[recipe.id]) || 1));
}

function shortageFor(recipe: RecipeEntry) {
  return game.recipeShortages(recipe, copiesFor(recipe));
}

function craftRecipe(recipe: RecipeEntry) {
  const result = game.craftRecipe(recipe.id, copiesFor(recipe));
  shortageRecipeId.value = result.ok ? null : recipe.id;
}

function itemTone(item: InventoryItem) {
  if (item.category === '调料') return 'seasoning';
  if (item.category === '食材') return 'ingredient';
  if (item.category === '成品' || item.category === '酒水') return 'product';
  return 'other';
}
</script>

<template>
  <section id="page-kitchen" class="page pm-paper kitchen-page">
    <header class="pm-paper-head kitchen-head">
      <div>
        <h2 class="h-title">
          <PmIcon name="pot" :size="22" />
          厨房炉台
        </h2>
        <div class="sub">只取库房材料 · 点击或拖入锅底 · 制作、调饮、酿造与上菜</div>
      </div>
      <button class="pm-btn sm ghost" @click="game.reloadCurrentFloorMvu()">
        <PmIcon name="refresh" :size="12" /> 重读变量
      </button>
    </header>

    <div class="pm-paper-body kitchen-layout">
      <section class="spice-rack">
        <header>
          <h3><PmIcon name="flourish" :size="15" /> 调料架</h3>
          <span class="pm-tag dim">{{ seasonings.length }} 项</span>
        </header>
        <div v-if="seasonings.length" class="rack-scroll">
          <button
            v-for="item in seasonings"
            :key="item.id"
            class="kitchen-item seasoning"
            draggable="true"
            @click="addToPot(item)"
            @dragstart="onDragStart($event, item)"
          >
            <strong>{{ item.name }}</strong>
            <span>×{{ item.qty }}{{ stockUnit(item) }}</span>
          </button>
        </div>
        <div v-else class="pm-empty compact">库房里没有调料。</div>
      </section>

      <div class="kitchen-main">
        <aside class="pantry">
          <section class="pantry-panel ingredients">
            <header>
              <h3><PmIcon name="farm" :size="15" /> 食材区</h3>
              <span class="pm-tag dim">{{ ingredients.length }} 项</span>
            </header>
            <div v-if="ingredients.length" class="item-grid">
              <article
                v-for="item in ingredients"
                :key="item.id"
                class="ingredient-card"
                draggable="true"
                @click="addToPot(item)"
                @dragstart="onDragStart($event, item)"
              >
                <div class="card-top">
                  <strong>{{ item.name }}</strong>
                  <span class="pm-num">×{{ item.qty }}{{ stockUnit(item) }}</span>
                </div>
                <div v-if="item.tags.length" class="tag-row">
                  <span v-for="tag in item.tags" :key="tag" class="pm-tag" :class="tagToneClass(tag)">{{ tag }}</span>
                </div>
                <div v-if="portionText(item)" class="portion-meter">
                  <div class="portion-head">
                    <span>当前{{ stockUnit(item) }}</span>
                    <strong>{{ portionText(item) }}</strong>
                  </div>
                  <span class="portion-bar"><i :style="{ width: `${portionPercent(item)}%` }"></i></span>
                </div>
                <small>{{ formatPortionCost(item) }}</small>
              </article>
            </div>
            <div v-else class="pm-empty compact">库房里没有食材。</div>
          </section>

          <section class="pantry-panel other">
            <header>
              <h3><PmIcon name="gift" :size="15" /> 其他区</h3>
              <span class="pm-tag dim">{{ others.length }} 项</span>
            </header>
            <div v-if="others.length" class="other-list">
              <button
                v-for="item in others"
                :key="item.id"
                class="kitchen-item other"
                draggable="true"
                @click="addToPot(item)"
                @dragstart="onDragStart($event, item)"
              >
                <strong>{{ item.name }}</strong>
                <span>{{ item.category }} · ×{{ item.qty }}{{ stockUnit(item) }}</span>
              </button>
            </div>
            <div v-else class="pm-empty compact">没有日用品或杂物。</div>
          </section>
        </aside>

        <section
          class="pot-station"
          :class="{ hot: isPotHot }"
          @dragover.prevent
          @drop.prevent="onPotDrop"
        >
          <div class="pot-visual">
            <img class="cauldron-art" :src="cauldronImage" alt="" draggable="false" />
          </div>

          <header class="pot-head">
            <div>
              <h3>锅底</h3>
              <p>{{ basketSummary ? `本次准备：${basketSummary}` : '把库房材料拖进来，或点击任意物品加入。' }}</p>
            </div>
            <button class="pm-btn sm ghost" :disabled="slots.length === 0" @click="clearSlots">清空</button>
          </header>

          <div class="selected-box">
            <div v-if="slots.length === 0" class="pm-empty compact">锅底还是空的。</div>
            <div v-for="(slot, index) in slots" v-else :key="slot.itemId" class="selected-line">
              <span>{{ slotText(slot) }}</span>
              <button title="减少一个用量单位" @click="decSlot(index)"><PmIcon name="minus" :size="12" /></button>
            </div>
          </div>

          <div class="cook-preview">
            <span>将写入</span>
            <p>{{ basketSummary ? `用这些材料${craftModeLabels[craftMode]}「${basketSummary}」。` : '选择物品后会生成一句行动记录。' }}</p>
            <small v-if="basketSummary">本次材料成本 {{ formatAccountingCost(basketCost) }}</small>
          </div>

          <div v-if="serveGuests.length" class="serve-target">
            <span>上菜对象</span>
            <div class="serve-target-list">
              <button
                v-for="guest in serveGuests"
                :key="guest.id"
                type="button"
                class="serve-target-option"
                :class="{ active: selectedServeGuestId === guest.id }"
                @click="selectedServeGuestId = guest.id"
              >
                <strong>{{ guest.label }}</strong>
                <small>{{ guest.order || guest.guests || '等待上菜' }}</small>
              </button>
            </div>
            <p v-if="selectedServeGuest" class="serve-target-detail">
              {{ selectedServeGuest.guests }}
              <template v-if="selectedServeGuest.order"> · 点单: {{ selectedServeGuest.order }}</template>
            </p>
          </div>

          <div class="bench-actions">
            <button class="pm-btn dark" :class="{ ghost: craftMode !== 'cooking' }" :disabled="!canCraft" @click="recordCraftAction('cooking')">
              <PmIcon name="fire" :size="13" /> 做菜
            </button>
            <button class="pm-btn dark" :class="{ ghost: craftMode !== 'sauce' }" :disabled="!canCraft" @click="recordCraftAction('sauce')">
              <PmIcon name="pot" :size="13" /> 做酱
            </button>
            <button class="pm-btn dark" :class="{ ghost: craftMode !== 'drink' }" :disabled="!canCraft" @click="recordCraftAction('drink')">
              <PmIcon name="coin" :size="13" /> 做饮品
            </button>
            <button class="pm-btn dark" :class="{ ghost: craftMode !== 'brew' }" :disabled="!canCraft" @click="recordCraftAction('brew')">
              <PmIcon name="flourish" :size="13" /> 酿酒
            </button>
            <button class="pm-btn dark" :disabled="!canServeSelection || (serveGuests.length > 0 && !selectedServeGuestId)" @click="serveItems">
              <PmIcon name="check" :size="13" /> 上菜 {{ formatCopper(serveTotal) }}
            </button>
          </div>
        </section>

        <aside class="product-side">
          <div class="side-tabs">
            <button :class="{ active: activeShelf === '产品' }" @click="activeShelf = '产品'">产品</button>
            <button :class="{ active: activeShelf === '配方' }" @click="activeShelf = '配方'">配方</button>
          </div>

          <section v-if="activeShelf === '产品'" class="product-panel">
            <header>
              <h3><PmIcon name="ledger" :size="15" /> 产品区</h3>
              <span class="pm-tag dim">{{ products.length }} 项</span>
            </header>
            <div v-if="products.length" class="product-list">
              <article
                v-for="item in products"
                :key="item.id"
                class="product-card"
                :class="itemTone(item)"
                draggable="true"
                @dragstart="onDragStart($event, item)"
              >
                <div class="card-top">
                  <strong>{{ item.name }}</strong>
                  <span class="pm-num">×{{ item.qty }}{{ stockUnit(item) }}</span>
                </div>
                <div v-if="item.tags.length || item.quality" class="tag-row">
                  <span v-if="item.quality" class="pm-tag gold">{{ item.quality }}</span>
                  <span v-for="tag in item.tags" :key="tag" class="pm-tag" :class="tagToneClass(tag)">{{ tag }}</span>
                </div>
                <p v-if="item.desc">{{ item.desc }}</p>
                <div class="product-actions">
                  <button @click="addToPot(item)">入锅</button>
                  <button :disabled="!canSaveRecipe(item)" :class="{ saved: game.isRecipeSavedForItem(item) }" @click="saveRecipe(item)">
                    {{ recipeButtonText(item) }}
                  </button>
                </div>
              </article>
            </div>
            <div v-else class="pm-empty compact">库房里没有成品或酒水。</div>
          </section>

          <section v-else class="recipe-panel">
            <header>
              <h3><PmIcon name="ledger" :size="15" /> 配方小页</h3>
              <span class="pm-tag dim">{{ game.recipes.length }} 条</span>
            </header>
            <div v-if="shownRecipes.length" class="recipe-list">
              <article v-for="recipe in shownRecipes" :key="recipe.id" class="mini-recipe">
                <div class="card-top">
                  <strong>{{ recipe.name }}</strong>
                  <span class="pm-tag">{{ craftModeLabels[recipe.mode] }}</span>
                </div>
                <p>{{ recipe.outputName }} · 每次 {{ recipe.yieldQty }} 份</p>
                <div v-if="shortageRecipeId === recipe.id && shortageFor(recipe).length" class="shortage-box">
                  <span v-for="entry in shortageFor(recipe)" :key="entry.ingredient.name">
                    {{ entry.ingredient.name }} 缺 {{ entry.missing }} 份
                  </span>
                </div>
                <footer class="recipe-actions">
                  <input v-model.number="copiesByRecipe[recipe.id]" type="number" min="1" max="99" placeholder="1" />
                  <button @click="craftRecipe(recipe)">复做</button>
                </footer>
              </article>
            </div>
            <div v-else class="pm-empty compact">还没有保存配方。</div>
          </section>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kitchen-layout {
  display: grid;
  gap: 12px;
}
.kitchen-head .sub {
  max-width: 760px;
}
.spice-rack,
.pantry-panel,
.pot-station,
.product-panel,
.recipe-panel {
  border: 1px solid rgba(110, 80, 34, 0.42);
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(255, 245, 215, 0.72), rgba(205, 174, 122, 0.46));
  box-shadow: inset 0 1px 0 rgba(255, 245, 215, 0.55);
}
.spice-rack {
  padding: 10px;
}
.spice-rack header,
.pantry-panel header,
.product-panel header,
.recipe-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.spice-rack h3,
.pantry-panel h3,
.product-panel h3,
.recipe-panel h3,
.pot-head h3 {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--pm-ink);
  font-size: calc(15px * var(--pm-text-scale));
}
.rack-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.kitchen-main {
  display: grid;
  grid-template-columns: minmax(210px, 0.72fr) minmax(360px, 1.12fr) minmax(250px, 0.78fr);
  gap: 12px;
  align-items: start;
}
.pantry {
  display: grid;
  gap: 12px;
}
.pantry-panel {
  padding: 10px;
}
.item-grid,
.product-list,
.recipe-list {
  display: grid;
  gap: 8px;
}
.item-grid {
  grid-template-columns: repeat(auto-fill, minmax(142px, 1fr));
}
.ingredient-card,
.product-card,
.mini-recipe,
.kitchen-item {
  border: 1px solid rgba(110, 80, 34, 0.36);
  border-radius: 4px;
  background: rgba(255, 249, 229, 0.58);
  color: var(--pm-ink);
  text-align: left;
}
.ingredient-card,
.product-card,
.mini-recipe {
  display: grid;
  gap: 7px;
  padding: 9px;
}
.ingredient-card,
.product-card,
.kitchen-item {
  cursor: grab;
}
.ingredient-card:hover,
.product-card:hover,
.kitchen-item:hover {
  border-color: rgba(167, 121, 45, 0.86);
  background: rgba(255, 247, 222, 0.86);
}
.kitchen-item {
  display: grid;
  gap: 3px;
  min-width: 128px;
  padding: 8px 10px;
}
.kitchen-item span,
.ingredient-card small,
.product-card p,
.mini-recipe p {
  margin: 0;
  color: var(--pm-ink-dim);
  font-size: calc(11px * var(--pm-text-scale));
}
.other-list {
  display: grid;
  gap: 7px;
}
.card-top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 8px;
}
.card-top strong {
  min-width: 0;
  color: var(--pm-ink);
  font-size: calc(13px * var(--pm-text-scale));
}
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}
.portion-meter {
  display: grid;
  gap: 4px;
  padding: 6px;
  border: 1px solid rgba(110, 80, 34, 0.26);
  border-radius: 4px;
  background: rgba(255, 252, 238, 0.42);
}
.portion-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--pm-ink-dim);
  font-size: calc(10.5px * var(--pm-text-scale));
  font-weight: 700;
}
.portion-head strong {
  color: var(--pm-gold-dim);
}
.portion-bar {
  height: 6px;
  overflow: hidden;
  border: 1px solid rgba(110, 80, 34, 0.32);
  border-radius: 999px;
  background: rgba(110, 80, 34, 0.16);
}
.portion-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6f8b4c, #c7a85a);
}
.pot-station {
  position: sticky;
  top: 12px;
  display: grid;
  gap: 10px;
  padding: 12px;
  background:
    radial-gradient(circle at 50% 24%, rgba(224, 104, 43, 0.17), transparent 27%),
    linear-gradient(180deg, rgba(255, 245, 215, 0.78), rgba(191, 149, 84, 0.52));
}
.pot-station.hot {
  border-color: rgba(184, 83, 31, 0.82);
}
.pot-visual {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 190px;
  isolation: isolate;
}
.pot-visual::before {
  position: absolute;
  left: 50%;
  bottom: 15px;
  width: min(310px, 78%);
  height: 36px;
  border: 1px solid rgba(90, 61, 31, 0.26);
  border-radius: 999px;
  background:
    radial-gradient(ellipse at center, rgba(206, 99, 30, 0.24), transparent 38%),
    radial-gradient(ellipse at center, rgba(61, 42, 25, 0.34), rgba(61, 42, 25, 0.08) 62%, transparent 72%);
  transform: translateX(-50%);
  content: '';
  z-index: 0;
}
.cauldron-art {
  position: relative;
  z-index: 1;
  display: block;
  width: min(290px, 82%);
  height: auto;
  pointer-events: none;
  user-select: none;
  filter:
    drop-shadow(0 16px 20px rgba(43, 28, 15, 0.28))
    drop-shadow(0 0 18px rgba(190, 99, 32, 0.12));
}
.pot-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.pot-head p {
  margin: 3px 0 0;
  color: var(--pm-ink-dim);
  font-size: calc(12px * var(--pm-text-scale));
}
.selected-box {
  display: grid;
  gap: 6px;
  min-height: 94px;
  padding: 10px;
  border: 1px dashed rgba(110, 80, 34, 0.45);
  border-radius: 4px;
  background: rgba(255, 245, 215, 0.46);
}
.selected-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.28);
  color: var(--pm-ink);
  font-weight: 700;
}
.selected-line button {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid rgba(110, 80, 34, 0.45);
  border-radius: 4px;
  background: linear-gradient(180deg, #ead19a, #bd8e43);
  color: var(--pm-ink);
}
.bench-actions,
.product-actions,
.recipe-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.cook-preview,
.serve-target {
  display: grid;
  gap: 5px;
  padding: 9px;
  border: 1px solid rgba(110, 80, 34, 0.28);
  border-radius: 4px;
  background: rgba(255, 252, 238, 0.45);
}
.cook-preview span,
.serve-target > span {
  color: var(--pm-ink-dim);
  font-size: calc(11px * var(--pm-text-scale));
  font-weight: 700;
}
.cook-preview p,
.serve-target-detail {
  margin: 0;
  color: var(--pm-ink);
  font-size: calc(12px * var(--pm-text-scale));
}
.cook-preview small {
  color: var(--pm-gold-dim);
  font-weight: 700;
}
.serve-target-list {
  display: grid;
  gap: 5px;
  max-height: 128px;
  overflow-y: auto;
}
.serve-target-option {
  display: grid;
  gap: 2px;
  padding: 6px 8px;
  border: 1px solid rgba(131, 92, 34, 0.3);
  border-radius: 4px;
  background: rgba(255, 248, 225, 0.64);
  color: var(--pm-ink);
  text-align: left;
}
.serve-target-option.active {
  border-color: rgba(167, 121, 45, 0.9);
  background: var(--pm-grad-gold);
}
.serve-target-option small {
  color: var(--pm-ink-dim);
}
.product-side {
  display: grid;
  gap: 8px;
}
.side-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(110, 80, 34, 0.42);
  border-radius: 6px;
  background: rgba(255, 245, 215, 0.48);
}
.side-tabs button {
  min-height: 30px;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--pm-ink-soft);
  font-weight: 700;
}
.side-tabs button.active {
  color: var(--pm-ink);
  border-color: rgba(110, 80, 34, 0.56);
  background: var(--pm-grad-gold);
}
.product-panel,
.recipe-panel {
  padding: 10px;
}
.product-actions button,
.recipe-actions button {
  min-height: 28px;
  flex: 1;
  border: 1px solid rgba(131, 92, 34, 0.5);
  border-radius: 4px;
  background: rgba(255, 246, 218, 0.66);
  color: var(--pm-ink);
  font-size: calc(11px * var(--pm-text-scale));
  font-weight: 700;
}
.product-actions button.saved {
  color: var(--pm-status-good-text);
  background: var(--pm-status-good-bg);
  border-color: var(--pm-status-good-border);
}
.product-actions button:disabled {
  color: var(--pm-ink-faint);
  background: rgba(255, 255, 255, 0.22);
  cursor: not-allowed;
}
.recipe-actions {
  display: grid;
  grid-template-columns: 68px 1fr;
}
.recipe-actions input {
  width: 100%;
  min-width: 0;
  height: 28px;
  text-align: center;
  color: var(--pm-ink);
  border: 1px solid rgba(131, 92, 34, 0.45);
  border-radius: 4px;
  background: rgba(255, 252, 238, 0.78);
}
.shortage-box {
  display: grid;
  gap: 3px;
  padding: 7px;
  border: 1px solid var(--pm-status-bad-border);
  border-radius: 4px;
  color: var(--pm-status-bad-text);
  background: var(--pm-status-bad-bg);
  font-size: calc(11px * var(--pm-text-scale));
}
@media (max-width: 980px) {
  .kitchen-main {
    grid-template-columns: 1fr;
  }
  .pot-station {
    position: static;
  }
}
@media (max-width: 760px) {
  .kitchen-page {
    overflow-x: hidden;
  }
  .kitchen-head {
    align-items: flex-start;
  }
  .kitchen-head .head-actions,
  .kitchen-head .pm-btn {
    width: 100%;
  }
  .spice-rack,
  .pantry-panel,
  .pot-station,
  .product-panel,
  .recipe-panel {
    padding: 9px;
  }
  .spice-rack header,
  .pantry-panel header,
  .product-panel header,
  .recipe-panel header,
  .pot-head {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .rack-scroll {
    margin: 0 -9px;
    padding: 0 9px 6px;
    scroll-snap-type: x proximity;
  }
  .rack-scroll .kitchen-item {
    min-width: 136px;
    scroll-snap-align: start;
  }
  .kitchen-main {
    display: flex;
    flex-direction: column;
  }
  .pot-station {
    order: -1;
  }
  .pot-visual {
    min-height: 164px;
  }
  .cauldron-art {
    width: min(250px, 86%);
  }
  .item-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .ingredient-card,
  .product-card,
  .mini-recipe {
    gap: 6px;
    padding: 8px;
  }
  .card-top {
    display: grid;
    gap: 3px;
  }
  .card-top strong {
    overflow-wrap: anywhere;
  }
  .selected-line {
    align-items: flex-start;
  }
  .selected-line span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .serve-target-list {
    max-height: 160px;
  }
  .bench-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .bench-actions .pm-btn {
    width: 100%;
    min-width: 0;
    justify-content: center;
  }
  .product-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 620px) {
  .item-grid {
    grid-template-columns: 1fr;
  }
  .bench-actions .pm-btn {
    flex: 1 1 132px;
  }
}
@media (max-width: 420px) {
  .kitchen-layout {
    gap: 9px;
  }
  .spice-rack h3,
  .pantry-panel h3,
  .product-panel h3,
  .recipe-panel h3,
  .pot-head h3 {
    font-size: calc(14px * var(--pm-text-scale));
  }
  .pot-visual {
    min-height: 142px;
  }
  .cauldron-art {
    width: min(218px, 88%);
  }
  .bench-actions,
  .product-actions,
  .recipe-actions {
    grid-template-columns: 1fr;
  }
  .recipe-actions input {
    height: 32px;
  }
  .side-tabs button,
  .product-actions button,
  .recipe-actions button {
    min-height: 34px;
  }
}
</style>
