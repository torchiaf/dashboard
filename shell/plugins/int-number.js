import { createApp } from 'vue';
const vueApp = createApp({});

export default vueApp.directive('intNumber', {
  mounted(el) {
    el.addEventListener('keypress', (e) => {
      e = e || window.event;
      const charcode = typeof e.charCode === 'number' ? e.charCode : e.keyCode;
      const re = /\d/;

      if (!re.test(String.fromCharCode(charcode)) && charcode > 9 && !e.ctrlKey) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
      }
    });
  }
});
