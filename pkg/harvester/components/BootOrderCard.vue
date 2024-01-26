<script>
import { _VIEW } from '@shell/config/query-params';

export default {
  name: 'BootOrderCard',

  props: {
    value: {
      type:     Object,
      required: true
    },

    index: {
      type:    Number,
      default: 0
    },

    count: {
      type:    Number,
      default: 0
    },

    showButtons: {
      type:    Boolean,
      default: true
    },

    mode: {
      type:     String,
      required: true
    },
  },

  computed: {
    isView() {
      return this.mode === _VIEW;
    },
  },

  methods: {
    swap(dir) {
      this.$emit('input', dir);
    },
  }
};
</script>

<template>
  <div
    class="boot-order-card"
  >
    <div class="content">
      <div class="body">
        <span>{{ value.type + ' / ' + value.name }}</span>
      </div>
      <div class="description">
      </div>
    </div>
    <div v-if="!isView && showButtons" class="buttons actions">
      <div class="buttons-container mr-15">
        <button :disabled="index === 0" class="btn btn-sm role-primary" @click.prevent="swap(-1)">
          <i class="icon icon-lg icon-chevron-up"></i>
        </button>

        <button :disabled="index === count - 1" class="btn btn-sm role-primary" @click.prevent="swap(1)">
          <i class="icon icon-lg icon-chevron-down"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .boot-order-card {
    display: grid;
    grid-template-columns: auto 300px;
    min-height: 60px;
    border: 1px solid var(--tabbed-border);
    box-shadow: 0 0 10px var(--shadow);
    border-radius: var(--border-radius);

    .content {
      display: flex;
      flex-direction: column;
      gap: 15px;
      flex-grow: 1;
      .body {
          max-width: 500px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0 0 5px 0;
      }
      .description {
        max-width: 550px;
        word-wrap: break-word;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .actions {
      display: flex;
      .btn {
        margin-left: 5px;
      }
    }
  }
</style>
