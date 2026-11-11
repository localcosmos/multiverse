<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { TaxonWithImage, TaxonRelationship } from "localcosmos-client";
import ImageCard from "@/components/ui/ImageCard.vue";
import TaxonName from "@/components/ui/TaxonName.vue";
import GlossarizedText from "@/components/text/GlossarizedText.vue";

// ── Types ──────────────────────────────────────────────────────────────────

type SimpleRelationship = {
  relatedTaxon: TaxonWithImage;
  description: string;
};

type RelationshipRole = {
  name: string;
  relationships: TaxonRelationship[];
};

type HubEntry =
  | { kind: "simple"; relationships: SimpleRelationship[] }
  | {
      kind: "complex";
      contextTaxonAsRole1: RelationshipRole;
      contextTaxonAsRole2: RelationshipRole;
    };

const props = defineProps<{
  contextTaxon: TaxonWithImage;
  item: HubEntry;
}>();

// ── Container measurement ──────────────────────────────────────────────────

const containerEl = ref<HTMLElement | null>(null);
const containerWidth = ref(0);
let ro: ResizeObserver | null = null;

onMounted(() => {
  if (containerEl.value) {
    containerWidth.value = containerEl.value.offsetWidth;
    ro = new ResizeObserver(([entry]) => {
      containerWidth.value = entry.contentRect.width;
    });
    ro.observe(containerEl.value);
  }
});

onUnmounted(() => ro?.disconnect());

// ── Layout constants ───────────────────────────────────────────────────────

const CARD_W = 130;
const CARD_H = 175;
const MIN_RADIAL = 480;

// ── Layout computed ────────────────────────────────────────────────────────

const isRadial = computed(() => containerWidth.value >= MIN_RADIAL);

const radius = computed(() =>
  Math.max(
    120,
    Math.min(containerWidth.value * 0.32, containerWidth.value / 2 - CARD_W / 2 - 16),
  ),
);

const cx = computed(() => containerWidth.value / 2);
const containerHeight = computed(() => radius.value * 2 + CARD_H + 48);
const cy = computed(() => containerHeight.value / 2);

// ── Node computation ───────────────────────────────────────────────────────

type HubNode = {
  key: string;
  taxon: TaxonWithImage;
  description?: string;
  angle: number; // radians
};

type RoleLabel = {
  text: string;
  angle: number; // base angle of the group (for positioning)
};

/** Distribute N angles around a base angle with a bounded arc spread. */
function spreadAngles(baseAngle: number, n: number): number[] {
  if (n === 0) return [];
  if (n === 1) return [baseAngle];
  const spreadDeg = Math.min(130, (n - 1) * 50);
  const spreadRad = (spreadDeg * Math.PI) / 180;
  return Array.from(
    { length: n },
    (_, i) => baseAngle - spreadRad / 2 + (spreadRad / (n - 1)) * i,
  );
}

const nodes = computed<HubNode[]>(() => {
  const { item } = props;

  if (item.kind === "simple") {
    const n = item.relationships.length;
    return item.relationships.map((rel, i) => ({
      key: rel.relatedTaxon.nameUuid,
      taxon: rel.relatedTaxon,
      description: rel.description,
      // Start from top (-π/2) and go clockwise
      angle: -Math.PI / 2 + (2 * Math.PI * i) / n,
    }));
  }

  const result: HubNode[] = [];

  // Left group: contextTaxon is the relatedTaxon → the "other" is rel.taxon
  const leftAngles = spreadAngles(Math.PI, item.contextTaxonAsRole2.relationships.length);
  item.contextTaxonAsRole2.relationships.forEach((rel, i) => {
    result.push({
      key: rel.taxon.nameUuid,
      taxon: rel.taxon,
      description: rel.description,
      angle: leftAngles[i],
    });
  });

  // Right group: contextTaxon is the taxon → the "other" is rel.relatedTaxon
  const rightAngles = spreadAngles(0, item.contextTaxonAsRole1.relationships.length);
  item.contextTaxonAsRole1.relationships.forEach((rel, i) => {
    result.push({
      key: rel.relatedTaxon.nameUuid,
      taxon: rel.relatedTaxon,
      description: rel.description,
      angle: rightAngles[i],
    });
  });

  return result;
});

/** Role labels shown in SVG for complex entries. */
const roleLabels = computed<RoleLabel[]>(() => {
  const { item } = props;
  if (item.kind !== "complex") return [];
  const labels: RoleLabel[] = [];
  if (item.contextTaxonAsRole2.relationships.length > 0)
    labels.push({ text: item.contextTaxonAsRole1.name, angle: Math.PI });
  if (item.contextTaxonAsRole1.relationships.length > 0)
    labels.push({ text: item.contextTaxonAsRole2.name, angle: 0 });
  return labels;
});

// ── Position helpers ───────────────────────────────────────────────────────

function pos(angle: number, r?: number) {
  const rr = r ?? radius.value;
  return {
    x: cx.value + rr * Math.cos(angle),
    y: cy.value + rr * Math.sin(angle),
  };
}

function cardStyle(angle: number) {
  const { x, y } = pos(angle);
  return {
    left: `${x - CARD_W / 2}px`,
    top: `${y - CARD_H / 2}px`,
    width: `${CARD_W}px`,
  };
}

const centerStyle = computed(() => ({
  left: `${cx.value - CARD_W / 2}px`,
  top: `${cy.value - CARD_H / 2}px`,
  width: `${CARD_W}px`,
}));

function labelPos(angle: number) {
  const r = radius.value + CARD_H / 2 + 4;
  return pos(angle, r);
}

function labelAnchor(angle: number) {
  // cosine > 0 → right side, < 0 → left side, ≈ 0 → middle
  const cos = Math.cos(angle);
  if (cos > 0.2) return "start";
  if (cos < -0.2) return "end";
  return "middle";
}
</script>

<template>
  <div ref="containerEl" class="hub">
    <template v-if="containerWidth > 0">

      <!-- ── Radial layout ─────────────────────────────────────────── -->
      <template v-if="isRadial">
        <div class="hub__canvas" :style="{ height: `${containerHeight}px` }">

          <!-- Connection lines + role labels -->
          <svg
            class="hub__svg"
            :width="containerWidth"
            :height="containerHeight"
            aria-hidden="true"
          >
            <line
              v-for="node in nodes"
              :key="node.key + '-line'"
              :x1="cx"
              :y1="cy"
              :x2="pos(node.angle).x"
              :y2="pos(node.angle).y"
              class="hub__line"
            />
            <text
              v-for="label in roleLabels"
              :key="label.text"
              :x="labelPos(label.angle).x"
              :y="labelPos(label.angle).y"
              :text-anchor="labelAnchor(label.angle)"
              dominant-baseline="middle"
              class="hub__role-label"
            >
              {{ label.text }}
            </text>
          </svg>

          <!-- Center: context taxon -->
          <div class="hub__node hub__node--center" :style="centerStyle">
            <ImageCard :image="contextTaxon.image" class="highlighted-card">
              <template #no-image>
                <div class="hub__no-image">
                  <i>{{ contextTaxon.taxonLatname }}</i>
                </div>
              </template>
              <TaxonName
                :taxon-latname="contextTaxon.taxonLatname"
                :taxon-author="contextTaxon.taxonAuthor"
                :hide-scientific-name="true"
              />
            </ImageCard>
          </div>

          <!-- Related nodes -->
          <div
            v-for="node in nodes"
            :key="node.key"
            class="hub__node"
            :style="cardStyle(node.angle)"
          >
            <ImageCard :image="node.taxon.image">
              <template #no-image>
                <div class="hub__no-image">
                  <i>{{ node.taxon.taxonLatname }}</i>
                </div>
              </template>
              <TaxonName
                :taxon-latname="node.taxon.taxonLatname"
                :taxon-author="node.taxon.taxonAuthor"
                :hide-scientific-name="true"
              />
            </ImageCard>
          </div>

        </div>
      </template>

      <!-- ── Mobile fallback: grid list ───────────────────────────── -->
      <template v-else>
        <div class="hub__list">
          <ImageCard :image="contextTaxon.image" class="highlighted-card">
            <template #no-image>
              <div class="hub__no-image">
                <i>{{ contextTaxon.taxonLatname }}</i>
              </div>
            </template>
            <TaxonName
              :taxon-latname="contextTaxon.taxonLatname"
              :taxon-author="contextTaxon.taxonAuthor"
            />
          </ImageCard>
          <ImageCard
            v-for="node in nodes"
            :key="node.key"
            :image="node.taxon.image"
          >
            <template #no-image>
              <div class="hub__no-image">
                <i>{{ node.taxon.taxonLatname }}</i>
              </div>
            </template>
            <TaxonName
              :taxon-latname="node.taxon.taxonLatname"
              :taxon-author="node.taxon.taxonAuthor"
            />
            <div v-if="node.description" class="font-size-md relationship-description">
              <GlossarizedText :htmlText="node.description" />
            </div>
          </ImageCard>
        </div>
      </template>

    </template>
  </div>
</template>

<style scoped>
.hub {
  width: 100%;
}

/* ── Radial canvas ───────────────────────────────────────────────────────── */

.hub__canvas {
  position: relative;
  width: 100%;
}

.hub__svg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.hub__line {
  stroke: rgb(150, 150, 150);
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}

.hub__role-label {
  font-size: 11px;
  font-weight: 600;
  fill: rgb(150, 150, 150);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hub__node {
  position: absolute;
}

/* ── Shared ──────────────────────────────────────────────────────────────── */

.hub__no-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: center;
  padding: 4px;
}

/* ── Mobile list ─────────────────────────────────────────────────────────── */

.hub__list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--size-xl);
}
</style>
