<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue';
import closedSignImage from '../assets/desk-ui/surface/business-sign-closed-new.png?url';
import openSignImage from '../assets/desk-ui/surface/business-sign-open-new.png?url';

const props = withDefaults(
  defineProps<{
    open: boolean;
    size?: number;
  }>(),
  { size: 32 },
);

const flipping = ref(false);
let animationTimer = 0;

watch(
  () => props.open,
  async () => {
    flipping.value = false;
    await nextTick();
    flipping.value = true;
    window.clearTimeout(animationTimer);
    animationTimer = window.setTimeout(() => {
      flipping.value = false;
    }, 780);
  },
);

onUnmounted(() => window.clearTimeout(animationTimer));
</script>

<template>
  <span
    class="business-sign-icon"
    :class="{ open, closed: !open, flipping }"
    :style="{ '--sign-height': `${size}px` }"
    aria-hidden="true"
  >
    <span class="sign-flipper">
      <span class="sign-face sign-open">
        <img :src="openSignImage" alt="" />
        <b>营业</b>
      </span>
      <span class="sign-face sign-closed">
        <img :src="closedSignImage" alt="" />
        <b>歇业</b>
      </span>
    </span>
  </span>
</template>

<style scoped>
.business-sign-icon {
  --sign-height: 32px;
  display: inline-block;
  flex: 0 0 auto;
  width: calc(var(--sign-height) * 1.48);
  height: var(--sign-height);
  perspective: 180px;
  transform-origin: 50% 12%;
}
.sign-flipper {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: 50% 17%;
}
.open .sign-flipper {
  transform: rotateY(0deg);
}
.closed .sign-flipper {
  transform: rotateY(180deg);
}
.sign-face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  filter:
    drop-shadow(0 2px 2px rgba(37, 20, 8, 0.5))
    drop-shadow(0 0 8px rgba(224, 168, 65, 0.12));
  backface-visibility: hidden;
  user-select: none;
  pointer-events: none;
}
.sign-face img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.sign-face b {
  position: relative;
  margin-top: 4%;
  color: #f8d88a;
  font-family: var(--pm-font-display);
  font-size: calc(var(--sign-height) * 0.2);
  font-weight: 800;
  letter-spacing: 0.18em;
  text-shadow: 0 1px 2px #2c1607, 0 0 4px rgba(224, 168, 65, 0.45);
}
.sign-closed {
  transform: rotateY(180deg);
}
.flipping.open .sign-flipper {
  animation: sign-turn-open 740ms cubic-bezier(0.2, 0.78, 0.25, 1) both;
}
.flipping.closed .sign-flipper {
  animation: sign-turn-closed 740ms cubic-bezier(0.2, 0.78, 0.25, 1) both;
}
button:hover .business-sign-icon.open:not(.flipping) {
  animation: sign-sway 1.9s ease-in-out infinite;
}
button:hover .business-sign-icon.closed:not(.flipping) {
  animation: sign-sway-reverse 1.9s ease-in-out infinite;
}
@keyframes sign-turn-open {
  0% { transform: rotateY(180deg) rotateZ(0deg); }
  52% { transform: rotateY(348deg) rotateZ(-5deg); }
  72% { transform: rotateY(365deg) rotateZ(3deg); }
  87% { transform: rotateY(358deg) rotateZ(-1deg); }
  100% { transform: rotateY(360deg) rotateZ(0deg); }
}
@keyframes sign-turn-closed {
  0% { transform: rotateY(0deg) rotateZ(0deg); }
  52% { transform: rotateY(192deg) rotateZ(5deg); }
  72% { transform: rotateY(175deg) rotateZ(-3deg); }
  87% { transform: rotateY(182deg) rotateZ(1deg); }
  100% { transform: rotateY(180deg) rotateZ(0deg); }
}
@keyframes sign-sway {
  0%, 100% { transform: rotateZ(0deg); }
  38% { transform: rotateZ(2.5deg); }
  72% { transform: rotateZ(-1.8deg); }
}
@keyframes sign-sway-reverse {
  0%, 100% { transform: rotateZ(0deg); }
  38% { transform: rotateZ(-2.5deg); }
  72% { transform: rotateZ(1.8deg); }
}
@media (prefers-reduced-motion: reduce) {
  .flipping .sign-flipper,
  button:hover .business-sign-icon {
    animation: none;
  }
}
</style>
