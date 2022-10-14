<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { BOTTOM, CENTER, LEFT, RIGHT } from '~/shell/utils/position';

interface Data {
  drag: Drag;
}

type Zone = null | typeof CENTER | typeof RIGHT | typeof BOTTOM | typeof LEFT;

export interface Drag {
  active: boolean;
  zone: Zone;
}

export default Vue.extend({
  data(): Data {
    return {
      drag:   {
        active: false,
        zone:   CENTER,
      },
    };
  },

  computed: {

    ...mapState('wm', ['userPin']),

    pin: {
      get(): Zone {
        return this.userPin;
      },

      set(pin: Zone) {
        if (pin === CENTER) {
          return;
        }
        window.localStorage.setItem('wm-pin', pin as string);
        this.$store.commit('wm/setUserPin', pin);
      },
    },

  },

  methods: {

    onDragStart() {
      this.drag.active = true;
    },

    onDragOver(zone: Zone) {
      this.drag.zone = zone;
    },

    onDragEnd() {
      this.pin = this.drag.zone;
      this.drag = {
        active: false,
        zone:   CENTER,
      };
    },

  }
});
</script>

<template>
  <div>
    <span
      v-if="drag.active && drag.zone != pin"
      class="pin-effect-area"
      :class="drag.zone"
    />
    <span
      v-if="drag.active"
      class="drag-area center"
      @dragover="onDragOver('center')"
    />
    <span
      v-if="drag.active"
      class="drag-area right"
      @dragover="onDragOver('right')"
    />
    <span
      v-if="drag.active"
      class="drag-area bottom"
      @dragover="onDragOver('bottom')"
    />
    <span
      v-if="drag.active"
      class="drag-area left"
      @dragover="onDragOver('left')"
    />
  </div>
</template>

<style lang='scss' scoped>

  .pin-effect-area {
    position: absolute;
    z-index: 1000;
    width: 0;
    height: 0;
    border-style: hidden;

    &.right {
      top: 55px;
      right: 0;
      width: 300px;
      transition: width .5s ease;
      height: 100%;
      background-image: linear-gradient(to right, rgba(220, 222, 231, 0), rgba(220, 222, 231, 0.9));
      border-left: 1px;
      border-style: hidden hidden hidden dashed;
    }

    &.left {
      top: 55px;
      left: 0;
      width: 300px;
      transition: width .5s ease;
      height: 100%;
      background-image: linear-gradient(to left, rgba(220, 222, 231, 0), rgba(220, 222, 231, 0.9));
      border-right: 1px;
      border-style: hidden dashed hidden hidden;
    }

    &.bottom {
      bottom: 0;
      height: 250px;
      transition: height .5s ease;
      width: 100%;
      background-image: linear-gradient(to top, rgba(220, 222, 231, 0.9), rgba(220, 222, 231, 0));
      border-top: 1px;
      border-style: dashed hidden hidden hidden;
    }

    &.center {
      width: 0;
      height: 0;
    }
  }

  .drag-area {
    position: absolute;
    z-index: 999;
    width: 0;
    height: 0;
    opacity: 0;

    &.center {
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      z-index: 998;
      // debug
      // opacity: 1;
      // background-color: yellowgreen;
    }

    &.right {
      top: 55px;
      right: 0;
      width: 300px;
      height: 100%;

      // debug
      // opacity: 1;
      // background-color: blue;
    }

    &.left {
      top: 55px;
      left: 0;
      width: 300px;
      height: 100%;

      // debug
      // opacity: 1;
      // background-color: red;
    }

    &.bottom {
      bottom: 0;
      height: 250px;
      width: 100%;

      // debug
      // opacity: 1;
      // background-color: green;
    }
  }
</style>
