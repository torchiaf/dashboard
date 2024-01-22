<script>
import { _VIEW } from '@shell/config/query-params';
import BootOrder from '../../components/BootOrder';

export default {
  name: 'VirtualMachineDeviceBootOrder',

  components: { BootOrder },

  props: {
    bootOrders: {
      type:    Array,
      default: () => {
        return [];
      }
    },

    bootOrder: {
      type:    Number,
      default: null,
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
    index() {
      return this.bootOrder !== null ? this.bootOrder - 1 : 0;
    },
    count() {
      return Math.max(...this.bootOrders.map(o => o.bootOrder));
    },
    tooltipContent() {
      if (this.bootOrders.length === 0) {
        return '';
      }

      const title = this.t('harvester.virtualMachine.bootOrder.details');

      const bootOrders = this.bootOrders.sort((a, b) => a.bootOrder || 0 - b.bootOrder || 0);

      return [
        ...bootOrders
          .filter(f => f.type === 'disk')
          .reduce((acc, x) => `${ acc } &nbsp&nbsp&nbsp${ x.name }:  <b>${ x.bootOrder }</b><br>`, 'Disks:<br>'),
        ...bootOrders
          .filter(f => f.type === 'interface')
          .reduce((acc, x) => `${ acc } &nbsp&nbsp&nbsp${ x.name }:  <b>${ x.bootOrder }</b><br>`, 'Networks:<br>')
      ].reduce((acc, r) => `${ acc }${ r }`, `${ title }&nbsp&nbsp&nbsp<br><br>`) || '';
    },
  },

  methods: {
    onInputIndex(step) {
      const elem = this.bootOrders.find(o => o.bootOrder === this.bootOrder);

      let neu = this.index + step + 1;

      while (!this.bootOrders.find(o => o.bootOrder === neu)) {
        neu = neu + step;
      }

      const emit = {
        ...elem,
        neu,
      };

      this.$emit('input', emit);
    }
  }
};
</script>

<template>
  <BootOrder
    :index="index"
    :count="count"
    :mode="mode"
    :tooltip="{content: tooltipContent, placement: 'right'}"
    @input="onInputIndex"
  />
</template>
