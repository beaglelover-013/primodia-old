<script setup lang="ts">
import { computed, ref } from 'vue';
import PmIcon from '../components/PmIcon.vue';
import creatorBoardImage from '../assets/primordia-creator-board-v2.png?url';
import titleBoardImage from '../assets/primordia-title-board-v2.png?url';

type PreviewScreen = 'title' | 'creator';

interface OpeningChoice {
  id: string;
  title: string;
  heroine: string;
  race: string;
  time: string;
  summary: string;
  image: string;
  imageLabel: string;
}

const screen = ref<PreviewScreen>('title');
const selectedOpeningId = ref('fox-applicant');

// Add the user's final portrait URLs or imported local asset URLs to `image`.
const openings: OpeningChoice[] = [
  {
    id: 'fox-applicant',
    title: '清晨的求职者',
    heroine: '橘柒',
    race: '狐族',
    time: '解冻月 · 清晨',
    summary: '她推开尚未营业的酒馆门，询问门口那句“招人”是否还算数。',
    image: '',
    imageLabel: '橘柒',
  },
  {
    id: 'sheep-brewer',
    title: '酿造师来访',
    heroine: '绵暖',
    race: '羊族',
    time: '解冻月 · 正午',
    summary: '紧张的公会学徒刚准备自我介绍，就被门外的融雪风吹乱了开场。',
    image: '',
    imageLabel: '绵暖',
  },
  {
    id: 'deer-traveler',
    title: '远路旅人',
    heroine: '翠萱',
    race: '鹿族',
    time: '解冻月 · 傍晚',
    summary: '背着沉重帆布包的采药人走进炉火明亮的前厅，询问客房价格。',
    image: '',
    imageLabel: '翠萱',
  },
  {
    id: 'rabbit-twins',
    title: '莲家双子',
    heroine: '莲洵与莲沁',
    race: '兔族',
    time: '解冻月 · 午后',
    summary: '性格截然相反的双子一前一后进门，让安静的前厅立刻热闹起来。',
    image: '',
    imageLabel: '莲家双子',
  },
  {
    id: 'solo-cook',
    title: '独自经营',
    heroine: '不指定女主',
    race: '自由开局',
    time: '解冻月 · 清晨',
    summary: '没有预设相遇。‹user›从睡梦中醒来，独自迎接铁壶酒馆的新一天。',
    image: '',
    imageLabel: '酒馆场景',
  },
];

const selectedOpening = computed(
  () => openings.find(item => item.id === selectedOpeningId.value) ?? openings[0],
);
</script>

<template>
  <section
    class="illustrated-stage"
    :class="`screen-${screen}`"
    :style="{ backgroundImage: `url(${screen === 'title' ? titleBoardImage : creatorBoardImage})` }"
  >
    <Transition name="page-turn" mode="out-in">
      <div v-if="screen === 'title'" key="title" class="title-page">
        <div class="title-copy">
          <div class="maker">BEAGLE · PRESENTS</div>
          <div class="ornament"><span></span><b>◆</b><span></span></div>
          <h1>酒馆纪事</h1>
          <h2>普里莫迪亚</h2>
          <p>炉火、旅人，以及尚未写下的明天</p>
        </div>

        <button class="art-hitbox start-hitbox" type="button" @click="screen = 'creator'">
          <span>开始游戏</span>
          <small>开启新的纪事</small>
        </button>

        <div class="title-tools">
          <button type="button" aria-label="旅途档案" title="旅途档案">
            <PmIcon name="scroll" :size="22" />
          </button>
          <button type="button" aria-label="设置" title="设置">
            <PmIcon name="gear" :size="22" />
          </button>
        </div>

        <footer>
          <span>PRIMORDIA CHRONICLE</span>
          <span>UI ART DIRECTION · 03</span>
        </footer>
      </div>

      <div v-else key="creator" class="creator-page">
        <button class="back-control" type="button" aria-label="返回标题界面" title="返回" @click="screen = 'title'">
          ‹
        </button>

        <header class="creator-title">
          <span>OPENING CHAPTER</span>
          <h2>选择你的开场</h2>
        </header>

        <main class="opening-browser">
          <div class="opening-intro">
            <span class="number-seal">壹</span>
            <div>
              <small>五段相遇，五种故事的起点</small>
              <h3>今晨，谁会推开酒馆的门？</h3>
            </div>
          </div>

          <div class="opening-choice-grid" aria-label="开场白选择">
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
                <span v-else class="portrait-placeholder">
                  <i></i>
                  <strong>{{ item.imageLabel }}</strong>
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

          <p class="mobile-summary">{{ selectedOpening.summary }}</p>
        </main>

        <aside class="opening-detail">
          <span class="detail-kicker">SELECTED OPENING</span>
          <h3>{{ selectedOpening.heroine }}</h3>
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

        <nav class="opening-steps" aria-label="开局流程">
          <span class="active">01 · 选择开场</span>
          <span>02 · 查看女主</span>
          <span>03 · 开始纪事</span>
        </nav>

        <button class="art-hitbox confirm-hitbox" type="button">
          <i class="mobile-button-skin" :style="{ backgroundImage: `url(${titleBoardImage})` }"></i>
          <span>使用这个开场</span>
          <PmIcon name="scroll" :size="18" />
        </button>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.illustrated-stage {
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
  background-size: 1080px 720px;
  background-repeat: no-repeat;
  box-shadow:
    0 0 0 3px #a16826,
    0 0 0 6px #3c210e,
    0 22px 70px rgba(20, 9, 3, 0.58);
  isolation: isolate;
  font-family: "Noto Serif SC", "Songti SC", SimSun, serif;
}

.illustrated-stage,
.illustrated-stage * {
  box-sizing: border-box;
}

button {
  font: inherit;
}

button:focus-visible {
  outline: 3px solid #fff0b1;
  outline-offset: 3px;
}

.title-page,
.creator-page {
  position: relative;
  width: 1080px;
  height: 720px;
}

.title-copy {
  position: absolute;
  left: 204px;
  top: 142px;
  width: 672px;
  color: #f4dfaa;
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
  color: var(--gold-light);
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
  color: var(--gold-light);
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

.art-hitbox {
  position: absolute;
  border: 0;
  border-radius: 0;
  color: #f5e2b5;
  background: transparent;
  cursor: pointer;
  text-shadow:
    0 2px #112519,
    0 3px 5px rgba(0, 0, 0, 0.42);
  transition:
    filter 160ms ease,
    transform 160ms ease;
}

.art-hitbox::after {
  content: '';
  position: absolute;
  inset: 10px 15px;
  border: 1px solid transparent;
  pointer-events: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.art-hitbox:hover {
  filter: brightness(1.18);
  transform: translateY(-2px);
}

.art-hitbox:hover::after {
  border-color: rgba(255, 224, 143, 0.45);
  box-shadow: inset 0 0 18px rgba(246, 203, 102, 0.12);
}

.art-hitbox:active {
  filter: brightness(0.94);
  transform: translateY(2px);
}

.start-hitbox {
  left: 304px;
  top: 477px;
  display: grid;
  place-content: center;
  width: 470px;
  height: 104px;
}

.start-hitbox span {
  font-size: 25px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-indent: 0.12em;
}

.start-hitbox small {
  margin-top: 5px;
  color: #bfae81;
  font-size: 10px;
  letter-spacing: 0.16em;
}

.title-tools {
  position: absolute;
  left: 772px;
  top: 592px;
  display: flex;
  gap: 26px;
}

.title-tools button {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  padding: 0;
  color: #5c3a1d;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition:
    color 140ms ease,
    transform 140ms ease;
}

.title-tools button:hover {
  color: #1c402c;
  transform: translateY(-2px) rotate(-2deg);
}

.title-page footer {
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

.back-control {
  position: absolute;
  left: 38px;
  top: 34px;
  z-index: 3;
  width: 42px;
  height: 42px;
  padding: 0 0 5px;
  color: #f5d990;
  border: 1px solid #bd8739;
  border-radius: 50%;
  background: rgba(53, 29, 13, 0.82);
  box-shadow:
    inset 0 0 0 3px #6f431d,
    0 3px 5px rgba(31, 13, 3, 0.45);
  cursor: pointer;
  font-size: 33px;
  line-height: 1;
}

.back-control:hover {
  color: #fff3bf;
  background: #264b35;
}

.creator-title {
  position: absolute;
  left: 326px;
  top: 76px;
  z-index: 2;
  width: 205px;
  color: #f0d7a1;
  text-align: center;
  text-shadow: 0 2px 3px #37190a;
}

.creator-title span {
  display: block;
  color: #c69955;
  font-family: Georgia, serif;
  font-size: 8px;
  letter-spacing: 0.16em;
}

.creator-title h2 {
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

.opening-intro h3 {
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
  background: rgba(247, 222, 172, 0.78);
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
  width: 90px;
  height: 210px;
  object-fit: cover;
  object-position: center top;
}

.portrait-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: end center;
  padding-bottom: 17px;
  color: #6a4223;
  background:
    radial-gradient(circle at 50% 28%, rgba(255, 241, 193, 0.7), transparent 45%),
    linear-gradient(160deg, #d8bd83, #a87a42);
}

.portrait-placeholder i {
  position: absolute;
  left: 25px;
  top: 39px;
  width: 40px;
  height: 46px;
  border-radius: 48% 48% 40% 40%;
  background: rgba(65, 53, 38, 0.45);
  box-shadow:
    0 43px 0 17px rgba(65, 53, 38, 0.45),
    0 79px 0 28px rgba(65, 53, 38, 0.45);
}

.portrait-placeholder strong {
  position: relative;
  z-index: 1;
  font-size: 12px;
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

.mobile-summary {
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

.opening-detail h3 {
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

.confirm-hitbox {
  left: 711px;
  top: 553px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 314px;
  height: 77px;
  isolation: isolate;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.mobile-button-skin {
  display: none;
}

.page-turn-enter-active,
.page-turn-leave-active {
  transition:
    opacity 260ms ease,
    transform 260ms ease,
    filter 260ms ease;
}

.page-turn-enter-from {
  opacity: 0;
  filter: brightness(1.25);
  transform: scale(1.012);
}

.page-turn-leave-to {
  opacity: 0;
  filter: brightness(0.82);
  transform: scale(0.99);
}

@media (max-width: 760px) {
  .illustrated-stage {
    width: 390px;
    height: 760px;
    border-radius: 0;
    background-size: 1140px 760px;
  }

  .title-page,
  .creator-page {
    width: 390px;
    height: 760px;
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

  .start-hitbox {
    left: 38px;
    top: 505px;
    width: 314px;
    height: 96px;
  }

  .title-tools {
    left: 117px;
    top: 626px;
  }

  .title-page footer {
    left: 18px;
    right: 18px;
    font-size: 7px;
  }

  .screen-creator {
    background-position: 31% center;
  }

  .back-control {
    left: 16px;
    top: 18px;
  }

  .creator-title {
    left: 93px;
    top: 78px;
  }

  .opening-browser {
    left: 35px;
    top: 136px;
    width: 320px;
  }

  .opening-intro h3 {
    font-size: 15px;
  }

  .opening-choice-grid {
    display: flex;
    gap: 10px;
    width: 320px;
    padding: 3px 3px 8px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
  }

  .opening-choice {
    grid-template-rows: 238px 74px;
    width: 218px;
    height: 312px;
    flex: 0 0 218px;
    scroll-snap-align: center;
  }

  .portrait-slot img {
    width: 206px;
    height: 232px;
  }

  .portrait-placeholder i {
    left: 83px;
    top: 44px;
  }

  .choice-copy strong {
    font-size: 15px;
  }

  .mobile-summary {
    display: block;
    width: 306px;
    margin: 9px auto 0;
    color: #795938;
    font-size: 9px;
    line-height: 1.55;
    text-align: center;
  }

  .opening-detail {
    display: none;
  }

  .opening-steps {
    left: 34px;
    top: 594px;
    grid-template-columns: repeat(3, 107px);
    height: 54px;
  }

  .opening-steps span {
    font-size: 9px;
  }

  .confirm-hitbox {
    left: 46px;
    top: 658px;
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
    background-size: 683px 455px;
    background-repeat: no-repeat;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-turn-enter-active,
  .page-turn-leave-active,
  .art-hitbox,
  .title-tools button,
  .opening-choice {
    transition: none;
  }
}
</style>
