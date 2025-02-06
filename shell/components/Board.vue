<template>
    <div class="board" ref="board">
      <Machine
        v-for="m in machines"
        :ref="setItemRef"
        :key="m.title"
        :label="m.label"
        :name="m.name"
        :top="m.top"
        :left="m.left"
        :status="m.status"
        :in="m.in"
        :out="m.out"
        :collapsed="bundle && bundle.collapsed"
        :details=m.details
        @collapse="collapse($event)"
      ></Machine>
      <div
        ref="bundleGroup"
        class="group"
      >
      </div>
    </div>
  </template>
  
  <script>
  import { FlowchartConnector } from "@jsplumb/connector-flowchart";
  import Machine from "./Machine.vue";
  
  export default {
    name: "Board",
    data() {
      return {
        itemRefs: [],
        bundle: null,
        connected: false,
      };
    },
    props: {
      machines: Array,
    },
    components: {
      Machine,
    },
    methods: {
      collapse(value) {
        if (value) {
          console.log('EXPAND', this.bundle)
          this.jsPlumbInstance.expandGroup(this.bundle)
        } else {
          console.log('COLLAPSE', this.bundle)
          this.jsPlumbInstance.collapseGroup(this.bundle)
        }
      },

      setItemRef(el) {
        if (el) {
          this.itemRefs.push(el);
        }
      },
      connect(instance, source, target, anchors, endpoints = ["Rectangle", "Blank"], overlays = [{ type: "Arrow", options: { location: 1 } }],) {
        instance.connect({
          source,
          target,
          anchors,
          endpoints,
          connector: {
            type: FlowchartConnector.type,
            options: {
              cornerRadius: 5,
            },
          },
          overlays,
        });
      },
    },
    beforeUpdate() {
      this.itemRefs = [];
    },
    async mounted() {
      const jsPlumbBrowserUI = await import("@jsplumb/browser-ui");
      this.jsPlumbInstance = jsPlumbBrowserUI.newInstance({
        container: this.$refs.board,
        elementsDraggable: true,
      });
      this.jsPlumbInstance.importDefaults({
        connectionsDetachable: false,
      });

      this.connect(
        this.jsPlumbInstance,
        this.itemRefs[0].getElementRef(),
        this.itemRefs[1].getElementRef(),
        [this.itemRefs[0].out, this.itemRefs[1].in],
        ["Dot", "Blank"],
        [{ type: "Diamond", options: { location: 1 } }]
      );

      this.bundle = this.jsPlumbInstance.addGroup({
        el: this.$refs['bundleGroup'],
        id: "aGroup",
        collapsed: false,
        ghost: true,
        anchor:"Right",
        proxied: false,
        droppable: false
      });

      this.jsPlumbInstance.addToGroup(this.bundle, this.itemRefs[3].getElementRef())
      this.jsPlumbInstance.addToGroup(this.bundle, this.itemRefs[2].getElementRef())
      this.jsPlumbInstance.addToGroup(this.bundle, this.itemRefs[4].getElementRef())

      // this.jsPlumbInstance.collapseGroup(aGroup)

      const deployments = [this.itemRefs[2], this.itemRefs[3], this.itemRefs[4]];

      deployments.forEach((target, index, array) => {
        if (target) {
          this.connect(
            this.jsPlumbInstance,
            this.itemRefs[1].getElementRef(),
            target.getElementRef(),
            [this.itemRefs[1].out, target.in]
          );
        }
      });

    },
  };
  </script>
  
  <style scoped>
  .board {
    position: relative;
  }
  </style>