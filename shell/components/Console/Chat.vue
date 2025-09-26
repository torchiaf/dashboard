<script>
export default {
  name: 'Chat',

  props: {
    active: {
      type:     Boolean,
      required: true,
    },

    afterOpen: {
      type:    Function,
      default: null,
    },

    activated: {
      type:    Function,
      default: null,
    },

    deactivated: {
      type:    Function,
      default: null,
    },

    beforeClose: {
      type:    Function,
      default: null,
    }
  },

  watch: {
    active(val) {
      if ( val && this.activated) {
        this.activated.apply(this);
      } else if ( !val && this.deactivated ) {
        this.deactivated.apply(this);
      }
    }
  },

  mounted() {
    if ( this.afterOpen ) {
      this.afterOpen.apply(this);
    }
  },

  beforeUnmount() {
    if ( this.beforeClose ) {
      this.beforeClose.apply(this);
    }
  }
};
</script>

<template>
  <div class="mt-20">
    CIAO
  </div>
</template>
