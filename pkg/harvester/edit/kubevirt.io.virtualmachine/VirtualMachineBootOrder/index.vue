<script>
import Vue from 'vue';
import draggable from 'vuedraggable';
import BootOrderCard from '../../../components/BootOrderCard';
import { _VIEW } from '@shell/config/query-params';
import { clone } from '@shell/utils/object';
import { BOOT_ORDER_TYPE } from '../../../mixins/harvester-vm';

export default {
  components: {
    draggable,
    BootOrderCard
  },

  props: {
    value: {
      type:    Array,
      default: () => {
        return [];
      }
    },

    mode: {
      type:     String,
      required: true
    },
  },

  data() {
    const ordered = this.value.filter(f => f.bootOrder).sort((a, b) => a.bootOrder - b.bootOrder);
    const unordered = this.value.filter(f => !f.bootOrder);

    return {
      ordered,
      unordered,
      bootOrders: ordered.map(r => r.bootOrder)
    };
  },

  computed: {
    isView() {
      return this.mode === _VIEW;
    },
  },

  watch: {
    bootOrders: {
      handler() {
        this.update();
      },
    },
  },

  methods: {
    findElem(elem) {
      return this.value.find(f => f.type === elem.type &&
        ((f.index !== undefined && f.index === elem.index) ||
        (f.id !== undefined && f.id === elem.id))
      );
    },

    updateRows(bootOrderGetter) {
      return (r, index) => {
        const el = this.findElem(r);

        el.bootOrder = bootOrderGetter(index);

        return el;
      };
    },

    getNextBootOrder() {
      let bootOrder = 1;

      while (this.bootOrders.includes(bootOrder)) {
        bootOrder++;
      }

      return bootOrder;
    },

    swap(index1, index2) {
      const ordered = clone(this.ordered);

      const temp = ordered[index1];

      ordered[index1] = ordered[index2];
      ordered[index2] = temp;

      Vue.set(this, 'ordered', ordered);

      this.update();
    },

    orderedDragEnd(v) {
      if (v.to.id === 'unordered') {
        this.bootOrders.pop();
      } else {
        this.update();
      }
    },

    unorderedDragEnd(v) {
      if (v.to.id === 'ordered') {
        this.bootOrders = [
          ...this.bootOrders,
          this.getNextBootOrder()
        ].sort();
      }
    },

    update() {
      const rows = [
        ...this.ordered.map(this.updateRows(i => this.bootOrders[i])),
        ...this.unordered.map(this.updateRows(() => undefined))
      ];

      const diskRows = rows.filter(f => f.type === BOOT_ORDER_TYPE.DISK);
      const networkRows = rows.filter(f => f.type === BOOT_ORDER_TYPE.INTERFACE);

      this.$emit('input', {
        diskRows,
        networkRows
      });
    },
  }
};
</script>

<template>
  <div class="container">
    <div class="boot-order">
      <div
        v-for="(pos, index) in bootOrders"
        :key="index"
        class="position-container"
      >
        <span>{{ pos }}</span>
      </div>
    </div>
    <div class="devices">
      <draggable
        :id="'ordered'"
        v-model="ordered"
        :disabled="isView"
        group="rows"
        class="list-group ordered"
        @end="orderedDragEnd"
      >
        <div v-for="(row, index) in ordered" :key="index">
          <BootOrderCard
            class="card"
            :value="row"
            :index="index"
            :count="ordered.length"
            :mode="mode"
            @input="swap(index, index + $event)"
          />
        </div>
      </draggable>

      <draggable
        :id="'unordered'"
        v-model="unordered"
        :disabled="isView"
        group="rows"
        class="list-group unordered"
        @end="unorderedDragEnd"
      >
        <div v-for="(row, index) in unordered" :key="index">
          <BootOrderCard
            class="card"
            :value="row"
            :showButtons="false"
            :mode="mode"
          />
        </div>
      </draggable>
    </div>
  </div>
</template>

<style lang='scss' scoped>
  .container {
    display: flex;
    flex-direction: row;

    .boot-order {
      .position-container {
        min-height: 60px;
        width: 30px;
        margin-bottom: 5px;
        display: flex;
        align-items: center;
      }
    }

    .devices {
      width: inherit;

      .card {
        margin-bottom: 5px;
      }

      .card-title-slot {
        display: flex;
        flex-direction: row;
        width: 100%;

        .actions {
          margin-left: auto;
        }
      }
    }
  }

.card-container {
  min-height: 130px;
}

.unordered {
  margin-top: 50px;
}

.list-group:empty,
.list-group > div:empty {
    padding:1rem;
    text-align:center;
}

.list-group:empty:before,
.list-group > div:empty:before {
    content: 'Drop files here';
}
</style>
