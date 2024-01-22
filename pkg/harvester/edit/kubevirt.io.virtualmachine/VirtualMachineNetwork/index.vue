<script>
import draggable from 'vuedraggable';
import InfoBox from '@shell/components/InfoBox';
import Base from './base';

import { NETWORK_ATTACHMENT } from '@shell/config/types';
import { HCI as HCI_ANNOTATIONS } from '../../../config/labels-annotations';
import { sortBy } from '@shell/utils/sort';
import { clone } from '@shell/utils/object';
import { randomStr } from '@shell/utils/string';
import { removeObject } from '@shell/utils/array';
import { _VIEW } from '@shell/config/query-params';
import VirtualMachineDeviceBootOrder from '../VirtualMachineDeviceBootOrder';

export default {
  components: {
    draggable,
    InfoBox,
    Base,
    VirtualMachineDeviceBootOrder,
  },

  props: {
    mode: {
      type:    String,
      default: 'create'
    },

    value: {
      type:    Array,
      default: () => {
        return [];
      }
    },

    isSingle: {
      type:    Boolean,
      default: true
    },

    bootOrders: {
      type:    Array,
      default: () => {
        return [];
      }
    }
  },

  data() {
    return {
      rows:    this.addKeyId(clone(this.value)),
      nameIdx: 1
    };
  },

  computed: {
    isView() {
      return this.mode === _VIEW;
    },

    networkOption() {
      const choices = this.$store.getters['harvester/all'](NETWORK_ATTACHMENT).filter((row) => {
        return !row.metadata?.annotations?.[HCI_ANNOTATIONS.STORAGE_NETWORK];
      });

      const out = sortBy(
        choices.map((N) => {
          const label = N.isNotReady ? `${ N.id } (${ this.t('generic.notReady') })` : N.id;

          return {
            label,
            value:    N.id,
            disabled: N.isNotReady,
          };
        }),
        'label'
      );

      return out;
    },
  },

  watch: {
    value: {
      handler(neu) {
        this.rows = neu;
      },
      deep:      true,
      immediate: true
    },
  },

  methods: {
    add(type) {
      const name = this.generateName();

      const neu = {
        index:       this.rows.length,
        name,
        networkName: '',
        model:       'virtio',
        type:        'bridge',
        newCreateId: randomStr(10),
        rowKeyId:    randomStr(10),
        bootOrder:   this.generateBootOrder(this.rows.length),
      };

      this.rows.push(neu);
      this.update();
    },

    remove(vol) {
      removeObject(this.rows, vol);
      this.update();
    },

    addKeyId(row) {
      return row.map((R) => {
        return {
          ...R,
          rowKeyId: randomStr(10)
        };
      });
    },

    generateName() {
      let name = '';
      let hasUsed = true;

      while (hasUsed) {
        name = `nic-${ this.nameIdx }`;
        hasUsed = this.rows.find( O => O.name === name);
        this.nameIdx++;
      }

      return name;
    },

    generateBootOrder(pos) {
      const bootOrders = this.bootOrders?.map(o => o.bootOrder) || [];

      if (bootOrders) {
        return Math.max(...bootOrders) + 1 || pos;
      }
    },

    onInputBootOrder(value) {
      this.$emit('boot-order', value);
    },

    drag(v) {
      const oldElem = this.bootOrders.find(o => o.bootOrder === this.rows[v.oldIndex].bootOrder);
      const neuElem = this.bootOrders.find(o => o.bootOrder === this.rows[v.newIndex].bootOrder);

      const emit = {
        ...oldElem,
        neu: neuElem.bootOrder,
      };

      this.onInputBootOrder(emit);

      this.update(true);
    },

    update(sort = false) {
      let rows = [...this.rows];

      if (sort) {
        if (rows?.length) {
          rows = this.rows.sort((a, b) => a.bootOrder - b.bootOrder);
        }
      }
      this.$emit('input', rows);
    }
  }
};
</script>

<template>
  <div>
    <draggable v-model="rows" :disabled="isView" @end="drag">
      <transition-group>
        <div v-for="(row, i) in rows" :key="i">
          <InfoBox class="infoBox">
            <button v-if="!isView" type="button" class="role-link remove-vol" @click="remove(row)">
              <i class="icon icon-x" />
            </button>

            <h3> {{ t('harvester.virtualMachine.network.title') }} </h3>

            <Base
              :key="rows[i].rowKeyId"
              v-model="rows[i]"
              class="mb-20"
              :rows="rows"
              :mode="mode"
              :is-single="isSingle"
              :network-option="networkOption"
              @update="update"
            />

            <VirtualMachineDeviceBootOrder
              :mode="mode"
              :boot-orders="bootOrders"
              :boot-order="rows[i].bootOrder"
              @input="onInputBootOrder"
            />
          </InfoBox>
        </div>
      </transition-group>
    </draggable>
    <button v-if="!isView" type="button" class="btn btn-sm bg-primary" @click="add">
      {{ t('harvester.virtualMachine.network.addNetwork') }}
    </button>
  </div>
</template>

<style lang='scss' scoped>
.infoBox{
  position: relative;
}

.remove-vol {
  position: absolute;
  top: 10px;
  right: 16px;
  padding:0px;
  max-height: 28px;
  min-height: 28px;
}
</style>
