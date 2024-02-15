// DEMO-21-02 rules definition and legacy porting

import { extend as veeExtend, setInteractionMode } from 'vee-validate';
import * as veeRules from 'vee-validate/dist/rules';
import formRulesGenerator from '@shell/utils/validators/formRules/index';
import CustomValidators from '@shell/utils/custom-validators';

// setInteractionMode('test', (ctx) => {
//   console.log(ctx);

//   return {
//     on:       ['input'],
//     debounce: 2000
//   };
// });

export function extend(rule) {
  const veeRule = (veeRules || [])[rule];

  veeExtend(rule, {
    ...veeRule,
    params:  ['message'],
    message: '{message}'
  });
}

export function create(rule, args) {
  veeExtend(rule, {
    params:  ['message'],
    message: '{message}',
    ...args,
  });
}

extend('required');

/**
 * Define new rules using the new pattern
 */
create('test-new-validator', {
  validate: (value) => {
    return !!value;
  },
  computesRequired: true,
});

/**
 * Extend DefaultValidators rules using the old pattern
 */
Object.keys(formRulesGenerator(null, { key: 'value' })).forEach((rule) => {
  // ToDo extend default rules here
});

/**
 * Extend CustomValidators rules using the old pattern
 */
Object.keys(CustomValidators).forEach((rule) => {
  create(rule, {
    params:   ['getters'], // Could be used in validate() API ?
    validate: (value, params) => {
      const errors = [];

      // params.path is 'spec' in this case
      const _value = params?.path ? value.value[params.path] : value.value;

      if (_value !== undefined) {
        CustomValidators[rule](_value, { 'i18n/t': () => 'dummy' }, errors);
      }

      return !errors.length;
    },

    message: (_, params) => {
      const errors = [];

      // params.path is 'spec' in this case
      const _value = params._value_.value;

      if (_value !== undefined) {
        CustomValidators[rule](_value, params._value_.getters, errors);
      }

      return errors;
    },

    computesRequired: true,
  });
});

/**
 * Custom Rules TODO
 */
