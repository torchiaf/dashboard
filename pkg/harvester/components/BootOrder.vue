<script>
import { _VIEW } from '@shell/config/query-params';

export default {
  name: 'BootOrder',

  props: {
    index: {
      type:    Number,
      default: 0,
    },

    count: {
      type:    Number,
      default: 1,
    },

    mode: {
      type:     String,
      required: true
    },

    tooltip: {
      type:    Object,
      default: null
    }
  },

  computed: {
    isView() {
      return this.mode === _VIEW;
    },
  },

  methods: {
    update(step) {
      this.$emit('input', step);
    }
  }
};
</script>

<template>
  <div class="boot-order">
    <div v-if="!isView" class="buttons-container mr-15">
      <button :disabled="index === 0" class="btn btn-sm role-primary" @click.prevent="update(-1)">
        <i class="icon icon-lg icon-chevron-up"></i>
      </button>

      <button :disabled="index === count - 1" class="btn btn-sm role-primary" @click.prevent="update(1)">
        <i class="icon icon-lg icon-chevron-down"></i>
      </button>
    </div>

    <div
      v-clean-tooltip="tooltip"
      class="text-muted"
    >
      bootOrder: {{ index + 1 }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .boot-order {
    display: flex;
    align-items: center;
  }
</style>
