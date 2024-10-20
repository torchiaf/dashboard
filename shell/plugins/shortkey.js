import Vue from 'vue';
import ShortKey from 'vue-shortkey';

vueApp.use(ShortKey, { prevent: ['input', 'textarea', 'select'] });
