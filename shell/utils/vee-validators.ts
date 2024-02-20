import { validate } from 'vee-validate';

export interface VeeTokenRule {
  id: string;
}

export async function veeTokenValidateUtil(
  value: any,
  rule: any,
  getters: any
): Promise<any> {
  // here
  const params = {
    value: value[rule.path],
    getters,
  };

  // console.log( value, rule);

  const res = await validate(params, rule.rules);

  return res;
}
