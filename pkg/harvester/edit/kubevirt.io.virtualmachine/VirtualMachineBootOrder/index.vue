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
      bootOrders: ordered.map(r => r.bootOrder),
      hideLast:   false
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
      this.hideLast = false;
    },

    unorderedDragEnd(v) {
      if (v.to.id === 'ordered') {
        this.bootOrders = [
          ...this.bootOrders,
          this.getNextBootOrder()
        ].sort();
      }
      this.hideLast = false;
    },

    onMove(v) {
      if (v.from.id === 'ordered' && v.to.id === 'unordered') {
        this.hideLast = true;
      } else {
        this.hideLast = false;
      }
    },

    swapUnordered() {
      this.bootOrders = [
        ...this.bootOrders,
        this.getNextBootOrder()
      ].sort();

      this.ordered.push(this.unordered[0]);
      this.unordered.splice(0, 1);
    },

    swapUnorderedAll() {
      this.unordered.forEach(() => {
        this.bootOrders = [
          ...this.bootOrders,
          this.getNextBootOrder()
        ].sort();
      });
      this.ordered.push(...this.unordered);
      this.unordered = [];
    },

    swapOrdered() {
      this.bootOrders.pop();

      this.unordered.push(this.ordered[this.ordered.length - 1]);
      this.ordered.splice(this.ordered.length - 1, 1);
    },

    swapOrderedAll() {
      this.unordered.push(...this.ordered);
      this.ordered = [];
      this.bootOrders = [];
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
        <span v-if="!(hideLast && index === bootOrders.length - 1)">{{ pos }}</span>
      </div>
    </div>
    <div class="devices">
      <draggable
        :id="'ordered'"
        v-model="ordered"
        :disabled="isView"
        group="rows"
        class="list-group ordered"
        :move="onMove"
        @end="orderedDragEnd"
      >
        <div v-for="(row, index) in ordered" :key="index">
          <BootOrderCard
            class="card"
            :value="row"
            :showButtons="false"
            :mode="mode"
            @input="swap(index, index + $event)"
          />
        </div>
      </draggable>

      <div class="buttons actions">
        <div class="buttons-container mr-15">
          <button :disabled="unordered.length === 0" class="btn btn-sm role-primary" @click.prevent="swapUnorderedAll">
            <i class="icon icon-lg icon-chevron-beginning"></i>
          </button>

          <button :disabled="unordered.length === 0" class="btn btn-sm role-primary" @click.prevent="swapUnordered">
            <i class="icon icon-lg icon-chevron-up"></i>
          </button>

          <button :disabled="ordered.length === 0" class="btn btn-sm role-primary" @click.prevent="swapOrdered">
            <i class="icon icon-lg icon-chevron-down"></i>
          </button>

          <button :disabled="ordered.length === 0" class="btn btn-sm role-primary" @click.prevent="swapOrderedAll">
            <i class="icon icon-lg icon-chevron-end"></i>
          </button>
        </div>
      </div>

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

    <div>
      <div v-for="(row, index) in ordered" :key="index" class="buttons actions">
        <div v-if="!(hideLast && index === bootOrders.length - 1)" class="buttons-container mr-15">
          <button :disabled="index === 0" class="btn btn-sm role-primary" @click.prevent="swap(index, index - 1)">
            <i class="icon icon-lg icon-chevron-up"></i>
          </button>

          <button :disabled="index === ordered.length - 1" class="btn btn-sm role-primary" @click.prevent="swap(index, index + 1)">
            <i class="icon icon-lg icon-chevron-down"></i>
          </button>
        </div>
      </div>
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
              max-width: 500px;

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

.icon-chevron-beginning, .icon-chevron-end {
transform: rotate(90deg);
}

.actions {
  min-height: 60px;
  margin-bottom: 5px;
}

.buttons-container {
  height: 30px;
  display: flex;
  .btn {
    margin-top: 5px;
    margin-left: 5px;
  }
}

.card-container {
  min-height: 130px;
}

.unordered {
  margin-top: 10px;
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
