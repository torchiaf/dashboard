<script>
import { STATES } from '@shell/plugins/dashboard-store/resource-class';
import { BadgeState } from '@components/BadgeState';

export default {
  name:       'ForceDirectedTreeChart',
  components: { BadgeState },
  props:      {
    data: {
      type:     [Array, Object],
      required: true
    },
    fdcConfig: {
      type:     Object,
      required: true
    }
  },

};
</script>

<template>
  <div />
</template>

<style lang="scss">
.chart-container {
  display: flex;
  background-color: var(--body-bg);
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--border-radius);
  min-height: 100px;

  .loading-container {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius);
    background-color: var(--body-bg);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    i {
      font-size: 24px;
    }
  }

  #tree {
    width: 70%;
    height: fit-content;

    svg {
      margin-top: 3px;
    }

    .link {
      stroke: var(--darker);
    }

    .node {
      cursor: pointer;

      &.active {
        .node-hover-layer {
          display: block;
        }
      }

      &.bundle.active > circle {
        transform: scale(1.35);
      }

      &.bundledeployment.active > circle {
        transform: scale(1.6);
      }

      &.node-default-fill > circle {
        transform: scale(1.2);
        fill: var(--muted);
      }

      &.node-success > circle {
        fill: var(--success);
      }
      &.node-info > circle {
        fill: var(--info);
      }
      &.node-warning > circle {
        fill: var(--warning);
      }
      &.node-error > circle {
        fill: var(--error);
      }

      .node-hover-layer {
        stroke: var(--body-bg);
        stroke-width: 2;
        display: none;
      }
    }
  }

  .more-info-container {
    width: 30%;
    position: relative;
    border-left: 1px solid var(--border);
    background-color: var(--body-bg);
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    overflow: hidden;

    .more-info {
      position: absolute;
      top: 0;
      left: 0;
      right:0;
      bottom:0;
      width: 100%;
      padding: 20px;
      border-top-right-radius: var(--border-radius);
      border-bottom-right-radius: var(--border-radius);
      overflow-y: auto;

      table {
        td {
          vertical-align: top;
          padding-bottom: 10px;

          &.align-middle {
            vertical-align: middle;
          }
        }

        .more-info-item-label {
          color: var(--darker);
          margin-right: 8px;
        }

        .single-error {
          color: var(--error);
        }

        p {
          line-height: 1.5em;
        }
      }
    }
  }
}
</style>
