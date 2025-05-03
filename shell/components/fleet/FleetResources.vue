<script>
import SortableTable from '@shell/components/SortableTable';

export default {
  name: 'FleetResources',

  components: { SortableTable },

  props: {
    value: {
      type:     Object,
      required: true,
    },
    clusterId: {
      type:     String,
      required: false,
      default:  null,
    },
    search: {
      type:    Boolean,
      default: true
    },
  },

  computed: {
    computedResources() {
      const resources = this.value.resourcesStatuses;

      if (this.clusterId) {
        return resources.filter((r) => r.clusterId === this.clusterId);
      }

      return resources;
    },

    resourceHeaders() {
      const out = [
        {
          name:      'state',
          value:     'state',
          label:     'State',
          sort:      'stateSort',
          formatter: 'BadgeStateFormatter',
          width:     100,
        },
        {
          name:      'name',
          value:     'name',
          sort:      'name',
          label:     'Name',
          formatter: 'LinkDetail',
        },
        {
          name:  'kind',
          value: 'kind',
          sort:  'kind',
          label: 'Kind',
        },
        {
          name:  'namespace',
          value: 'namespace',
          sort:  'namespace',
          label: 'Namespace',
        },
        {
          name:  'apiVersion',
          value: 'apiVersion',
          sort:  'apiVersion',
          label: 'API Version',
        },
      ];

      if (!this.clusterId) {
        out.splice(3, 0, {
          name:  'cluster',
          value: 'clusterName',
          sort:  ['clusterName', 'stateSort'],
          label: 'Cluster',
        });
      }

      return out;
    },
  }
};
</script>

<template>
  <SortableTable
    :rows="computedResources"
    :headers="resourceHeaders"
    :table-actions="false"
    :row-actions="false"
    :search="search"
    key-field="tableKey"
    default-sort-by="state"
    :paged="true"
  >
    <template
      v-for="(_, slot) of $slots"
      v-slot:[slot]="scope"
      :key="slot"
    >
      <slot
        :name="slot"
        v-bind="scope"
      />
    </template>
  </SortableTable>
</template>
