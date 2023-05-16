<script>
import * as monaco from 'monaco-editor';

export default {
  name:  'Monaco',
  props: {},
  data() {
    const value = /* set from `myEditor.getModel()`: */ `function hello() {
        alert('Hello world!');
    }`;

    const myEditor = monaco.editor.create(
      document.getElementById('container'),
      {
        value,
        language:        'javascript',
        automaticLayout: true,
      }
    );

    return {};
  },
};
</script>

<template>
  <div
    id="container"
    style="height: 100%"
  >
    {{ test }}
  </div>
</template>
