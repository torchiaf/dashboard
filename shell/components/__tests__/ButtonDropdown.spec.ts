import { mount } from '@vue/test-utils';
import ButtonDropdown from '@shell/components/ButtonDropdown.vue';

describe('component: ButtonDropdown.vue', () => {
  const buttonLabel = 'Show Label';

  const wrapper = mount(ButtonDropdown, { propsData: { buttonLabel } });

  it('show label', () => {
    const buttonDropdown = wrapper.find(`[data-testid="button-dropdown-select"]`);

    expect(buttonDropdown.element.textContent).toContain(buttonLabel);
  });

  it('is disabled', async() => {
    await wrapper.setProps({ disabled: true });

    const buttonDropdown = wrapper.find(`[data-testid="button-dropdown-select"]`);

    expect(buttonDropdown.element.classList).toContain('disabled');
  });

  it('show options', async() => {
    const wrapper = mount(ButtonDropdown, {
      propsData: {
        buttonLabel:     'test-button',
        dropdownOptions: [
          {
            label: 'test',
            value: 'test'
          },
          {
            label: 'test-1',
            value: 'test-1'
          }
        ],
        size:  'sm',
        mocks: { $store: { getters: { 'i18n/t': jest.fn() } } },
      },
    });

    const select = wrapper.find(`[data-testid="button-dropdown-select"]`);

    debugger;

    select.find('button').trigger('click');
    await wrapper.trigger('keydown.down');
    await wrapper.trigger('keydown.enter');

    expect(wrapper.emitted('click-action')).toHaveLength(1);
  });
});
