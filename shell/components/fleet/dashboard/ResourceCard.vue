<script>
import FleetSummaryGraph from '@shell/components/formatter/FleetSummaryGraph';

export default {

  name: 'FleetDashboardResourceCard',

  emits: ['click'],

  components: { FleetSummaryGraph },

  props: {
    value: {
      type:     Object,
      required: true
    },

    selected: {
      type:    Boolean,
      default: true
    }
  },

  methods: {
    onClick(value) {
      const tagName = value?.srcElement?.tagName;

      if (tagName === 'A' || tagName === 'BUTTON') {
        return;
      }

      this.$emit('click');
    },
  }
};
</script>

<template>
  <div
    class="panel"
    :class="{
      ['selected']: selected
    }"
    @click="onClick"
  >
    <div class="title">
      <i
        class="icon-lg"
        :class="value.fleetIcon"
      />
      <router-link
        :to="value.detailLocation"
      >
        {{ value.nameDisplay }}
      </router-link>
    </div>
    <div class="body">
      <div class="resource-details">
        <span>{{ t('fleet.dashboard.resources') }}</span>
        <FleetSummaryGraph
          class="summary"
          :row="value"
          :show-count="false"
        />
      </div>
      <div class="resource-count">
        COUNTER
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .panel {
    border: 1px solid var(--modal-border);
    border-radius: 10px;
    padding: 10px;

    &.selected {
      border: 2px solid var(--primary);
    }

    .title {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 10px;
      font-size: medium;
    }

    .body {
      .resource-details {
        display: flex;
        align-items: center;
        gap: 5px;

        .summary {
          padding-top: 2px;
        }
      }

      .resource-count {
        margin-top: 5px;
      }
    }
  }
</style>
