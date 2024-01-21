<script>
import { _VIEW } from '@shell/config/query-params';

export default {
  name: 'BootOrder',

  props: {
    value: {
      type:     Array,
      required: true,
    },

    index: {
      type:     Number,
      required: true,
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
    changeSort(idx, type) {
      // true: down, false: up
      this.value.splice(type ? idx : idx - 1, 1, ...this.value.splice(type ? idx + 1 : idx, 1, this.value[type ? idx : idx - 1]));
      this.update();
    },
    update() {
      this.$emit('input', this.value);
    }
  }
};
</script>

<template>
  <div class="boot-order">
    <div v-if="!isView" class="buttons-container mr-15">
      <button :disabled="index === 0" class="btn btn-sm role-primary" @click.prevent="changeSort(index, false)">
        <i class="icon icon-lg icon-chevron-up"></i>
      </button>

      <button :disabled="index === value.length - 1" class="btn btn-sm role-primary" @click.prevent="changeSort(index, true)">
        <i class="icon icon-lg icon-chevron-down"></i>
      </button>
    </div>

    <div class="text-muted">
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
