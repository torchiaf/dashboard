import { mount } from '@vue/test-utils';
import ButtonDropdown from '@shell/components/ButtonDropdown.vue';

describe('component: ButtonDropdown.vue', () => {
  const wrapper = mount(ButtonDropdown, {
    propsData: {
      buttonLabel:     'Test',
      closeOnSelect:   false,
      dropdownOptions: [
        {
          label: 'opt1',
          value: 'opt1'
        },
        {
          label: 'opt2',
          value: 'opt2'
        },
      ],
      value: 'opt1',
      size:  'sm'
    }
  });

  it('show label', () => {
    const label = wrapper.find(`[data-testid="dropdown-button-label"]`);

    expect(label.element.textContent).toContain('Test');
  });

  it('emit input', async() => {
    const select = await wrapper.find(`[data-testid="dropdown-button-select"]`);

    await select.trigger('click');
    await wrapper.trigger('keydown.down');
    await wrapper.trigger('keydown.enter');

    await wrapper.vm.$nextTick();

    const rr = wrapper.emitted('click-action');

    const ff = await wrapper.find('.vs__search');

    debugger;

    expect(wrapper.emitted('click-action')).toHaveLength(1);
  });
});
