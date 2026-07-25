<script setup lang="ts">
import { computed, ref } from 'vue';
import PmIcon from '../components/PmIcon.vue';
import { formatCopper, useGameStore, type BusinessAgreement, type TavernMaintenanceEntry, type TavernStateFormula } from '../stores/game';

const game = useGameStore();
type Section = 'library' | 'maintenance' | 'agreements' | 'records';
const section = ref<Section>('library');
const showAgreementEventEditor = false;

const tabs: Array<{ id: Section; label: string }> = [
  { id: 'library', label: '状态库' },
  { id: 'maintenance', label: '当前维持' },
  { id: 'agreements', label: '长期约定' },
  { id: 'records', label: '经营流水' },
];

const activeMaintenance = computed(() => game.tavernMaintenance.filter(item => item.enabled));
const formulaById = computed(() => new Map(game.tavernStateFormulas.map(item => [item.id, item])));
const regionOptions = computed(() => game.regions.map(region => region.name));

function maintenanceFor(formula: TavernStateFormula) {
  return game.tavernMaintenance.find(item => item.formulaId === formula.id);
}

function requirementText(formula: TavernStateFormula) {
  if (!formula.requirements.length) return '待绑定维护物品';
  return formula.requirements.map(item => `${item.name} ×${item.qty}`).join('、');
}

function maintenanceDuration(formula?: TavernStateFormula) {
  return Math.max(1, Math.floor(Number(formula?.durationTurns) || 2));
}

function maintenanceCadenceText(formula: TavernStateFormula) {
  const duration = maintenanceDuration(formula);
  return duration <= 1 ? '每回合补充' : `每${duration}回合补充`;
}

function maintenanceNextText(entry: TavernMaintenanceEntry) {
  if (entry.status === 'shortage') return '补充暂停';
  const remaining = Math.floor(Number(entry.remainingTurns) || 0);
  if (remaining > 0) return `约${remaining}回合后补充`;
  return '下次结算补充';
}

function agreementKind(agreement: BusinessAgreement) {
  return ({ wage: '员工工资', rent: '房客房费', delivery: '定期送货', sideBusiness: '副业收支' } as const)[agreement.kind];
}

function agreementCadenceText(agreement: BusinessAgreement) {
  return agreement.cadence === 'weekly' ? '每周一次' : '每日一次';
}

function moneyText(value: number) {
  if (!value) return '无资金变化';
  return `${value > 0 ? '收入' : '支出'} ${formatCopper(Math.abs(value))}`;
}

function inventoryText(agreement: BusinessAgreement) {
  if (!agreement.inventoryChanges.length) return '';
  return agreement.inventoryChanges.map(item => `${item.name} ${item.qty > 0 ? '+' : ''}${item.qty}`).join('、');
}

function eventRuleFor(agreement: BusinessAgreement) {
  return agreement.eventRule ?? {
    enabled: false,
    prompt: '',
    triggerTime: '07:00',
    scene: 'tavern' as const,
    missedPolicy: 'past' as const,
  };
}

function recordDate(daySerial: number) {
  const adjusted = Math.max(0, Math.floor(daySerial) - 1);
  const year = Math.floor(adjusted / 360);
  const withinYear = adjusted % 360;
  const monthIndex = Math.floor(withinYear / 30);
  const day = (withinYear % 30) + 1;
  return `${year}年 · ${game.months[monthIndex] ?? '未知月'} · 第${day}日`;
}
</script>

<template>
  <section id="page-operations" class="page pm-paper">
    <header class="pm-paper-head">
      <div>
        <h2 class="h-title"><PmIcon name="ledger" :size="22" /> 经营附录</h2>
        <div class="sub">解锁状态 · 维持消耗 · 每日约定 · 收支记录</div>
      </div>
      <div class="operation-summary">
        <span>已解锁 <strong>{{ game.tavernStateFormulas.length }}</strong></span>
        <span>维持中 <strong>{{ activeMaintenance.length }}</strong></span>
        <span>约定 <strong>{{ game.businessAgreements.filter(item => item.enabled).length }}</strong></span>
        <button class="pm-btn sm ghost" type="button" @click="game.refreshCapturedFormatsFromLatestMessage('tavernState')">
          <PmIcon name="refresh" :size="12" /> 刷新状态
        </button>
        <button class="pm-btn sm ghost" type="button" @click="game.refreshCapturedFormatsFromLatestMessage('businessAgreement')">
          <PmIcon name="refresh" :size="12" /> 刷新经营约定
        </button>
      </div>
    </header>

    <div class="pm-paper-body operations-body">
      <nav class="operations-tabs" aria-label="经营附录分类">
        <button v-for="tab in tabs" :key="tab.id" :class="{ active: section === tab.id }" @click="section = tab.id">
          {{ tab.label }}
        </button>
      </nav>

      <section v-if="section === 'library'" class="entry-list">
        <div v-if="!game.tavernStateFormulas.length" class="pm-empty">
          还没有解锁经营状态。把库房物品用于酒馆区域，并在故事中形成可持续效果后，会自动收录在这里。
        </div>
        <article v-for="formula in game.tavernStateFormulas" :key="formula.id" class="operation-entry" :class="{ unresolved: formula.regionResolved === false || !formula.requirements.length }">
          <header>
            <div>
              <h3>{{ formula.name }}</h3>
              <span class="pm-tag gold">{{ formula.targetRegion }}</span>
              <span v-if="formula.regionResolved === false || !formula.requirements.length" class="pm-tag warn">待确认</span>
            </div>
            <button
              class="maintenance-toggle"
              :class="{ active: maintenanceFor(formula)?.enabled, disabled: !formula.requirements.length }"
              type="button"
              :disabled="!formula.requirements.length"
              :title="maintenanceFor(formula)?.enabled ? '维持中' : '未启用'"
              :aria-label="maintenanceFor(formula)?.enabled ? '停止维持' : '开始维持'"
              @click="game.setMaintenanceEnabled(maintenanceFor(formula)?.id ?? '', !maintenanceFor(formula)?.enabled)"
            >
              <PmIcon :name="maintenanceFor(formula)?.enabled ? 'candle' : 'x'" :size="15" />
            </button>
          </header>
          <p>{{ formula.description }}</p>
          <div class="region-control">
            <span>{{ formula.originalTargetRegion ? `AI写作：${formula.originalTargetRegion}` : '归属区域' }}</span>
            <select :value="formula.targetRegion" @change="game.setTavernStateFormulaRegion(formula.id, ($event.target as HTMLSelectElement).value)">
              <option v-if="!regionOptions.includes(formula.targetRegion)" :value="formula.targetRegion">{{ formula.targetRegion }}</option>
              <option v-for="region in regionOptions" :key="region" :value="region">{{ region }}</option>
            </select>
          </div>
          <div class="entry-meta"><span>{{ maintenanceCadenceText(formula) }}</span><strong>{{ requirementText(formula) }}</strong></div>
          <div v-if="formula.guestResponseHint" class="guest-hint">客人感受：{{ formula.guestResponseHint }}</div>
          <footer><button class="pm-link danger" @click="game.deleteTavernStateFormula(formula.id)">删除记录</button></footer>
        </article>
      </section>

      <section v-else-if="section === 'maintenance'" class="entry-list">
        <div v-if="!activeMaintenance.length" class="pm-empty">当前没有主动维持的酒馆状态。</div>
        <article v-for="entry in activeMaintenance" :key="entry.id" class="operation-entry" :class="entry.status">
          <header>
            <div><h3>{{ formulaById.get(entry.formulaId)?.name ?? '失效记录' }}</h3><span class="pm-tag">{{ formulaById.get(entry.formulaId)?.targetRegion }}</span></div>
            <span class="status-text">{{ entry.status === 'shortage' ? '物资不足' : '正常维持' }}</span>
          </header>
          <p>{{ formulaById.get(entry.formulaId)?.description }}</p>
          <div class="entry-meta"><span>{{ maintenanceNextText(entry) }}</span><strong>{{ formulaById.get(entry.formulaId) ? requirementText(formulaById.get(entry.formulaId)!) : '未知' }}</strong></div>
          <div v-if="entry.pauseReason" class="shortage-note">{{ entry.pauseReason }}</div>
          <footer><button class="pm-btn sm ghost" @click="game.setMaintenanceEnabled(entry.id, false)">停止维持</button></footer>
        </article>
      </section>

      <section v-else-if="section === 'agreements'" class="entry-list">
        <div v-if="!game.businessAgreements.length" class="pm-empty">还没有长期约定。故事中明确谈妥工资、房费、送货或副业收支后，会记录在这里。</div>
        <article v-for="agreement in game.businessAgreements" :key="agreement.id" class="operation-entry" :class="{ disabled: !agreement.enabled }">
          <header>
            <div><h3>{{ agreement.name }}</h3><span class="pm-tag gold">{{ agreementKind(agreement) }}</span></div>
            <label class="agreement-toggle" :class="{ off: !agreement.enabled }">
              <input type="checkbox" :checked="agreement.enabled" @change="game.setBusinessAgreementEnabled(agreement.id, ($event.target as HTMLInputElement).checked)" />
              <span class="toggle-dot"></span>
              <span>{{ agreement.enabled ? '执行中' : '已暂停' }}</span>
            </label>
          </header>
          <p>{{ agreement.reminder }}</p>
          <div class="agreement-grid">
            <span><small>约定对象</small><strong>{{ agreement.counterparty }}</strong></span>
            <span><small>周期</small><strong>{{ agreementCadenceText(agreement) }}</strong></span>
            <span><small>钱匣</small><strong>{{ moneyText(agreement.cashboxDeltaCopper) }}</strong></span>
            <span v-if="inventoryText(agreement)"><small>库房</small><strong>{{ inventoryText(agreement) }}</strong></span>
          </div>
          <div v-if="showAgreementEventEditor" class="agreement-event-editor" :class="{ off: !eventRuleFor(agreement).enabled }">
            <header>
              <strong>剧情提示</strong>
              <label class="switch-line">
                <input
                  type="checkbox"
                  :checked="eventRuleFor(agreement).enabled"
                  @change="game.updateBusinessAgreementEventRule(agreement.id, { enabled: ($event.target as HTMLInputElement).checked })"
                />
                <span>{{ eventRuleFor(agreement).enabled ? '会发送' : '不发送' }}</span>
              </label>
            </header>
            <div class="event-fields">
              <label>
                <small>触发时间</small>
                <input
                  type="time"
                  :value="eventRuleFor(agreement).triggerTime"
                  @change="game.updateBusinessAgreementEventRule(agreement.id, { triggerTime: ($event.target as HTMLInputElement).value })"
                />
              </label>
              <label>
                <small>场景</small>
                <select
                  :value="eventRuleFor(agreement).scene"
                  @change="game.updateBusinessAgreementEventRule(agreement.id, { scene: ($event.target as HTMLSelectElement).value as 'any' | 'tavern' })"
                >
                  <option value="tavern">酒馆内</option>
                  <option value="any">不限场景</option>
                </select>
              </label>
              <label>
                <small>错过后</small>
                <select
                  :value="eventRuleFor(agreement).missedPolicy"
                  @change="game.updateBusinessAgreementEventRule(agreement.id, { missedPolicy: ($event.target as HTMLSelectElement).value as 'past' | 'silent' | 'defer' })"
                >
                  <option value="past">按已发生承接</option>
                  <option value="silent">静默结算</option>
                  <option value="defer">延迟到可触发</option>
                </select>
              </label>
            </div>
            <textarea
              rows="2"
              placeholder="例如：屠户巴克今天清晨来酒馆送肉了。"
              :value="eventRuleFor(agreement).prompt"
              @change="game.updateBusinessAgreementEventRule(agreement.id, { prompt: ($event.target as HTMLTextAreaElement).value })"
            ></textarea>
          </div>
          <footer><button class="pm-link danger" @click="game.deleteBusinessAgreement(agreement.id)">删除约定</button></footer>
        </article>
      </section>

      <section v-else class="record-list">
        <div v-if="!game.businessSettlementRecords.length" class="pm-empty">还没有经营流水。</div>
        <article v-for="record in game.businessSettlementRecords" :key="record.id" class="record-line" :class="record.status">
          <span class="record-mark"><PmIcon :name="record.status === 'success' ? 'check' : 'x'" :size="13" /></span>
          <div><strong>{{ record.text }}</strong><small>{{ recordDate(record.daySerial) }} · 回合 {{ record.turn }}</small></div>
          <div class="record-values">
            <span v-if="record.moneyDeltaCopper">{{ record.moneyDeltaCopper > 0 ? '+' : '-' }}{{ formatCopper(Math.abs(record.moneyDeltaCopper)) }}</span>
            <span v-for="change in record.inventoryChanges" :key="`${change.name}-${change.qty}`">{{ change.name }} {{ change.qty > 0 ? '+' : '' }}{{ change.qty }}</span>
          </div>
        </article>
      </section>
    </div>
  </section>
</template>

<style scoped>
.operations-body { display: grid; gap: 12px; }
.operation-summary { display: flex; flex-wrap: wrap; gap: 8px; }
.operation-summary span { padding: 6px 9px; border: 1px solid rgba(110,80,34,.35); border-radius: 4px; color: var(--pm-ink-dim); }
.operations-tabs { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); border-bottom: 1px solid rgba(110,80,34,.35); }
.operations-tabs button { min-height: 42px; border: 0; border-bottom: 3px solid transparent; background: transparent; color: var(--pm-ink-dim); font-weight: 700; }
.operations-tabs button.active { border-bottom-color: var(--pm-gold); color: var(--pm-ink); background: rgba(202,153,55,.12); }
.entry-list { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
.operation-entry { display: grid; gap: 9px; padding: 13px; border: 1px solid rgba(110,80,34,.38); border-radius: 4px; background: rgba(255,247,222,.42); }
.operation-entry header, .operation-entry header > div, .operation-entry footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.operation-entry header > div { justify-content: flex-start; flex-wrap: wrap; }
.operation-entry h3, .operation-entry p { margin: 0; }
.operation-entry h3 { font-size: calc(17px * var(--pm-text-scale)); }
.operation-entry p { color: var(--pm-ink-soft); line-height: 1.55; }
.operation-entry.shortage { border-color: var(--pm-status-bad-border); }
.operation-entry.unresolved { border-style: dashed; background: rgba(255,247,222,.3); }
.operation-entry.disabled { opacity: .7; }
.switch-line { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; color: var(--pm-ink-dim); }
.switch-line.disabled { opacity: .58; }
.maintenance-toggle {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border: 1px solid rgba(110,80,34,.3);
  border-radius: 6px;
  background: rgba(255,252,239,.45);
  color: rgba(110,80,34,.58);
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.45);
  transition: border-color .16s ease, background .16s ease, color .16s ease, transform .16s ease;
}
.maintenance-toggle.active {
  border-color: rgba(167,121,45,.58);
  background: rgba(202,153,55,.18);
  color: #7b4f15;
}
.maintenance-toggle:not(:disabled):hover {
  border-color: rgba(167,121,45,.72);
  background: rgba(202,153,55,.24);
  color: #6b4210;
  transform: translateY(-1px);
}
.maintenance-toggle:focus-visible {
  outline: 2px solid rgba(202,153,55,.32);
  outline-offset: 2px;
}
.maintenance-toggle.disabled,
.maintenance-toggle:disabled {
  opacity: .42;
  cursor: not-allowed;
  transform: none;
}
.agreement-toggle { display: inline-flex; align-items: center; gap: 7px; min-height: 28px; padding: 4px 9px; border: 1px solid rgba(167,121,45,.46); border-radius: 4px; background: rgba(202,153,55,.13); color: var(--pm-ink); font-size: calc(12px * var(--pm-text-scale)); font-weight: 700; white-space: nowrap; cursor: pointer; }
.agreement-toggle input { position: absolute; opacity: 0; pointer-events: none; }
.agreement-toggle .toggle-dot { width: 8px; height: 8px; border-radius: 50%; background: #2f7b42; box-shadow: 0 0 0 3px rgba(47,123,66,.12); }
.agreement-toggle.off { border-color: rgba(110,80,34,.26); background: rgba(255,255,255,.16); color: var(--pm-ink-dim); }
.agreement-toggle.off .toggle-dot { background: rgba(110,80,34,.44); box-shadow: none; }
.agreement-toggle:focus-within { outline: 2px solid rgba(202,153,55,.28); outline-offset: 2px; }
.pm-tag.warn { border-color: rgba(180,95,34,.55); color: #8a4a1d; background: rgba(238,164,86,.18); }
.region-control { display: grid; grid-template-columns: auto minmax(150px, 240px); align-items: center; justify-content: space-between; gap: 10px; }
.region-control span { color: var(--pm-ink-dim); }
.region-control select { width: 100%; min-height: 34px; border: 1px solid rgba(110,80,34,.38); border-radius: 4px; background: rgba(255,252,239,.72); color: var(--pm-ink); padding: 0 8px; }
.entry-meta, .guest-hint, .shortage-note { padding: 7px 9px; background: rgba(255,255,255,.22); border-left: 3px solid rgba(167,121,45,.55); }
.entry-meta { display: flex; justify-content: space-between; gap: 10px; }
.entry-meta span, .agreement-grid small { color: var(--pm-ink-dim); }
.guest-hint { color: var(--pm-ink-soft); }
.shortage-note, .status-text { color: var(--pm-status-bad-text); }
.agreement-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 7px; }
.agreement-grid > span { display: grid; gap: 3px; padding: 7px 9px; border: 1px solid rgba(110,80,34,.24); }
.agreement-event-editor { display: grid; gap: 8px; padding: 9px; border: 1px solid rgba(110,80,34,.24); border-radius: 4px; background: rgba(255,255,255,.18); }
.agreement-event-editor.off { opacity: .72; }
.agreement-event-editor header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.event-fields { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 7px; }
.event-fields label { display: grid; gap: 4px; min-width: 0; }
.event-fields small { color: var(--pm-ink-dim); }
.event-fields input,
.event-fields select,
.agreement-event-editor textarea {
  width: 100%;
  min-height: 34px;
  border: 1px solid rgba(110,80,34,.34);
  border-radius: 4px;
  background: rgba(255,252,239,.72);
  color: var(--pm-ink);
  padding: 6px 8px;
}
.agreement-event-editor textarea { resize: vertical; line-height: 1.45; }
.record-list { display: grid; gap: 6px; }
.record-line { display: grid; grid-template-columns: 30px minmax(0,1fr) auto; gap: 10px; align-items: center; padding: 9px 10px; border-bottom: 1px solid rgba(110,80,34,.28); }
.record-line.skipped { color: var(--pm-status-bad-text); }
.record-line > div { display: grid; gap: 3px; }
.record-line small { color: var(--pm-ink-dim); }
.record-values { display: flex !important; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
.record-values span { padding: 3px 6px; border: 1px solid rgba(110,80,34,.3); border-radius: 4px; }
@media (max-width: 860px) {
  .entry-list { grid-template-columns: 1fr; }
  .operations-tabs { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .region-control { grid-template-columns: 1fr; }
  .record-line { grid-template-columns: 26px minmax(0,1fr); }
  .record-values { grid-column: 2; justify-content: flex-start; }
  .event-fields { grid-template-columns: 1fr; }
}
</style>
