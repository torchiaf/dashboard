<script>
import Vue from 'vue';
import draggable from 'vuedraggable';
import { Card } from '@components/Card';
import { _VIEW } from '@shell/config/query-params';
import { clone } from '@shell/utils/object';
import { BOOT_ORDER_TYPE } from '../../../mixins/harvester-vm';

export default {
  components: {
    draggable,
    Card
  },

  props: {
    value: {
      type:    Array,
      default: () => {
        return [];
      }
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
      <Card
        v-for="(row, index) in bootOrders"
        :key="index"
        :show-highlight-border="false"
      >
        <template #body>
          <span>{{ row }}</span>
        </template>

        <template #actions>
          <span></span>
        </template>
      </Card>
    </div>
    <div class="devices">
      <draggable v-model="ordered" :disabled="isView" group="rows" class="list-group" @end="orderedDragEnd">
        <transition-group :id="'ordered'">
          <div v-for="(row, index) in ordered" :key="index">
            <Card
              :show-highlight-border="false"
            >
              <template #title>
                <div class="card-title-slot">
                  <h4
                    v-clean-html="row.type + ' / ' + row.name"
                    class="text-default-text"
                  />
                  <div v-if="!isView" class="buttons actions">
                    <div class="buttons-container mr-15">
                      <button :disabled="index === 0" class="btn btn-sm role-primary" @click.prevent="swap(index, index -1)">
                        <i class="icon icon-lg icon-chevron-up"></i>
                      </button>

                      <button :disabled="index === ordered.length - 1" class="btn btn-sm role-primary" @click.prevent="swap(index, index + 1)">
                        <i class="icon icon-lg icon-chevron-down"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </template>

              <template #body>
                <span>{{ row.bootOrder }}</span>
              </template>

              <template #actions>
                <span></span>
              </template>
            </Card>
          </div>
        </transition-group>
      </draggable>

      <hr>
      <hr>

      <draggable v-model="unordered" :disabled="isView" group="rows" class="list-group" @end="unorderedDragEnd">
        <transition-group :id="'unordered'" tag="div">
          <div v-for="(row, index) in unordered" :key="index">
            <Card
              :show-highlight-border="false"
            >
              <template #title>
                <div class="card-title-slot">
                  <h4
                    v-clean-html="row.type + ' / ' + row.name"
                    class="text-default-text"
                  />
                </div>
              </template>

              <template #body>
                <span></span>
              </template>

              <template #actions>
                <span></span>
              </template>
            </Card>
          </div>
        </transition-group>
      </draggable>
    </div>
  </div>
</template>

<style lang='scss' scoped>
  .container {
    display: flex;
    flex-direction: row;

    .boot-order {
      .card-container {
        width: 60px;
      }
    }

    .devices {
      width: inherit;

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
