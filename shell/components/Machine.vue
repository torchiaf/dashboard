<template>
  <div
    ref="box"
    class="machine"
    v-bind:style="{ top: top + 'px', left: left + 'px' }"
    v-bind:class="[status]"
  >
    <div class="header">
      <h2>{{ label }}</h2>
      <button
        v-if="label === 'Bundle'"
        type="button"
        class="role-link btn btn-sm remove"
        @click="$emit('collapse', collapsed)"
      >
        <i v-if="collapsed" class="icon icon-lg icon-chevron-down" />
        <i v-if="!collapsed" class="icon icon-lg icon-chevron-up" />
      </button>
    </div>

    <span class="badge">
      <BadgeState
        :color="details.stateColor === 'text-error' || details.stateColor === 'text-warning' ? 'bg-warning': 'bg-success'"
        :label="details.stateColor === 'text-error' || details.stateColor === 'text-warning' ? 'Not Ready' : 'Ready'"
      />
    </span>

    <p class="name">{{ name }}</p>
  </div>
</template>
  
<script>
  import { BadgeState } from '@components/BadgeState';

  export default {
    components: {
      BadgeState
    },
    name: "Machine",
    props: {
      label: String,
      name: String,
      top: Number,
      left: Number,
      status: String,
      in: String,
      out: String,
      collapsed: Boolean,
      details: Object
    },
    methods: {
      getElementRef() {
        return this.$refs.box;
      },
    },
  };
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>

  .header {
    display: flex;
    justify-content: space-between;
  }

  .jtk-group-collapsed [data-jtk-managed] {
    display:none;
  }

  .machine.up {
    border-color: rgb(112, 173, 71);
  }
  
  .machine.down {
    border-color: rgba(255, 51, 51, 0.5);
  }
  
  .machine.warning {
    border-color: rgba(255, 228, 107, 0.5);
  }
  
  .machine {
    position: absolute;
    border: 1px solid var(--link);
    border-radius: 5px;
    min-width: 150px;
    min-height: 50px;
  }
  
  .machine .header {
    h2 {
      text-align: center;
      line-height: 1em;
      color: rgb(78, 197, 241);
      padding: 10px
    }

    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 1em;
  }

  .name {
    padding: 10px;
  }

  .badge {
    padding: 10px;
  }

  </style>
  