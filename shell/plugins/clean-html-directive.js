import { createApp } from 'vue';
const vueApp = createApp({});
import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'code',
  'li',
  'a',
  'p',
  'b',
  'br',
  'ul',
  'pre',
  'span',
  'div',
  'i',
  'em',
  'strong',
];

export const purifyHTML = value => DOMPurify.sanitize(value, { ALLOWED_TAGS });

export const cleanHtmlDirective = {
  mounted(el, binding) {
    el.innerHTML = purifyHTML(binding.value);
  },
  updated(el, binding) {
    el.innerHTML = purifyHTML(binding.value);
  },
  unmounted(el) {
    el.innerHTML = '';
  }
};

vueApp.directive('clean-html', cleanHtmlDirective);
