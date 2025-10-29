import { get, isEmpty } from '@shell/utils/object';
import { generateRandomAlphaString } from '@shell/utils/string';

interface Context {
  tag: string;
  path?: string;
  value?: any;
  hookable?: boolean;
  description?: string;
  icon?: string;
  store?: any;
}

interface UIContextAPI {
  add: (context: any) => Promise<any>;
  remove: (id: any) => Promise<any>;
}

/**
 * Builds a minimal UI context store from the given store.
 * @param store The store to build the UI context store from.
 * @returns The built UI context store.
 */
function buildUIContextAPI(store: any) {
  if (!store || typeof store.dispatch !== 'function') {
    return null;
  }

  return {
    add:    (context: any) => store.dispatch('ui-context/add', context),
    remove: (id: any) => store.dispatch('ui-context/remove', id),
  };
}

/**
 * Cache the UI context API from the given binding and vnode.
 * @param binding The binding object containing the context and instance.
 * @param vnode The vnode object representing the component.
 * @returns The built UI context API or null if it couldn't be created.
 */
function cacheUIContextStore(binding: { value: Context, instance: any }, vnode: any) {
  const explicitStore = binding.value?.store;
  const instanceStore = binding.instance?.$store || binding.instance?.store;
  const appStore = vnode?.appContext?.config?.globalProperties?.$store;

  if (!cachedUIContextStore) {
    cachedUIContextStore = buildUIContextAPI(explicitStore || instanceStore || appStore);
  }
}

/**
 * Cache a minimal ui-context API (shared across directives)
 *
 * This is necessary to access the store when the directive is unmounted and the store reference from the component is already gone
 * The cache will allow the directive to remove the context properly.
 */
let cachedUIContextStore: UIContextAPI | null = null;
/**
 * Maps UI context elements to their unique IDs.
 *
 * WeakMap allows entries to vanish automatically when elements are removed (no manual memory management)
 */
const uiContextIds = new WeakMap<Element, string | number>();

/**
 * Validates the context object.
 * @param context The context object to validate.
 * @returns True if the context is valid, false otherwise.
 */
function isValid(context: Context ): context is Context {
  return (
    context !== null &&
    typeof context === 'object' &&
    (
      (context.path === undefined && context.value === undefined) || // both undefined is allowed
      (typeof context.path === 'string' && context.path?.length > 0 && context.value === undefined) || // path defined, value undefined
      (context.value !== undefined && context.path === undefined) // value defined, path undefined
    ) &&
    typeof context.tag === 'string' && context.tag?.length > 0 &&
    (typeof context.description === 'string' || context.description === undefined)
  );
}

/** UI Context Directive
 *
 * Usage:
 *   <div v-ui-context="{ tag: 'example-tag', path: 'some.path.in.component', description: 'An example context' }"></div>
 *   or
 *   <div v-ui-context="{ tag: 'example-tag', value: 'Direct Value', description: 'An example context with direct value' }"></div>
 *   or
 *   <div v-ui-context="{ tag: 'example-tag', description: 'An example context with text content' }">Text Content Value</div>
 *
 * The directive will register the context on mount and unregister it before unmounting.
 *
 * The context object must have a 'tag' and either a 'path' or a 'value'.
 * If both 'path' and 'value' are undefined, the element's textContent will be used as the value.
 *
 * !IMPORTANT:
 *   The value object will be reactive only when using 'path'.
 *   Using 'value' or textContent will not be reactive.
 *
*/
export default {
  async mounted(el: any, binding: { value: Context, instance: any }, vnode: any) {
    const context: Context = binding.value;

    if (!context || isEmpty(context)) {
      return;
    }

    if (!isValid(context)) {
      // eslint-disable-next-line no-console
      console.warn(`[ui-context] invalid value: ${ JSON.stringify({ tag: (context as Context).tag, description: (context as Context).description }) }`);

      return;
    }

    if (context.path === undefined && context.value === undefined) {
      // path and value undefined, use textContent as value
      context.value = el.textContent;
    } else if (context.value === undefined) {
      // Use context.value directly if provided, otherwise resolve it from the component instance using context.path
      const value = get(binding.instance, context.path);

      if (value === undefined) {
        // eslint-disable-next-line no-console
        console.warn(`[ui-context] path "${ context.path }" is undefined on the component instance`);

        return;
      }

      context.value = value;
    }

    delete context.path;

    if (context.hookable) {
      const hookId = generateRandomAlphaString(12);

      el.setAttribute('ux-context-hook-id', hookId);
      (context as any).hookId = hookId;
    }

    cacheUIContextStore(binding, vnode);

    if (cachedUIContextStore) {
      delete context.store;

      const id = await cachedUIContextStore.add(context);

      uiContextIds.set(el, id);
    }
  },

  async beforeUnmount(el: any, binding: { value: Context, instance: any }, vnode: any) {
    cacheUIContextStore(binding, vnode);

    const id = uiContextIds.get(el);

    if (cachedUIContextStore && id) {
      try {
        await cachedUIContextStore.remove(id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`[ui-context] failed to remove context id "${ id }"`);
      }
    }

    uiContextIds.delete(el);
  }
};
