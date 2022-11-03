<script>
import { StringList } from '@components/StringList';

export default {
  components: { StringList },
  props:      {
    name: {
      type:     String,
      required: true
    },

    units: {
      type:    String,
      default: ''
    },

    used: {
      type:    Object,
      default: null
    },

    reserved: {
      type:    Object,
      default: null
    }
  },
  data() {
    return { items: ['test'] };
  },
  computed: {
    colorStops() {
      return {
        0: '--success', 30: '--warning', 70: '--error'
      };
    }
  },
  methods: {
    onChange(items) {
      this.items = [...items];
    },
    maxDecimalPlaces(n) {
      return Math.round(n * 100) / 100;
    },

    strokes(primary, secondary) {
      return {
        primaryStrokeColor:           this.rgba(primary, 1),
        primaryStrokeGradientColor:   this.rgba(secondary, 1),
        secondaryStrokeColor:         this.rgba(primary, 0.1),
        secondaryStrokeGradientColor: this.rgba(secondary, 0.1)
      };
    },

    rgba(variable, opacity) {
      return `rgba(var(${ variable }), ${ opacity })`;
    },

    percentage(resource) {
      if (resource.total === 0) {
        return 0;
      }

      return `${ (resource.useful / resource.total * 100).toFixed(2) }%`;
    }
  }
};
</script>

<template>
  <StringList
    :items="items"
    :case-sensitive="false"
    :placeholder="'Type new string'"
    :readonly="false"
    :actions-position="'left'"
    @change="onChange($event)"
  />
</template>

<style lang="scss" scoped>
  .hardware-resource-gauge {
    $spacing: 10px;
    $large-spacing: $spacing * 1.5;

    position: relative;
    display: flex;
    flex-direction: column;

    .hw-gauge:not(:first-of-type) {
      margin-top: 20px;
    }

    .values {
      font-size: 12px;
      padding-left: 10px;
    }
  }
</style>
