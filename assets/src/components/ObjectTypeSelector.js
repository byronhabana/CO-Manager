const template =`
<div class="type-selector u-2/12 u-mr-lg">
  <div class="dropdown">
    <div class="u-fs u-semibold">
      {{label}}
    </div>
    <button
      class="c-txt__input c-txt__input--select u-mt-xs"
      id="type-select"
      @click="isMenuHidden = !isMenuHidden">
      {{selectedOption ? selectedOption.key : '-'}}
    </button>
    <div class="menu-container u-1/5">
      <ul :aria-hidden="isMenuHidden"
        class="c-menu c-menu--down u-2/2">
        <li
          v-for="option in options"
          :key="option.key"
          class="c-menu__item"
          @click="onSelectedItem(option)">
          {{option.key}}
        </li>
      </ul>
    </div>
  </div>
  </div>
</div>`;

export default {
  template,
  props: ['label', 'options', 'selectedOption'],
  data() {
    return {
      isMenuHidden: true,
    };
  },
  methods: {
    onSelectedItem(option) {
      this.isMenuHidden = true;
      this.$emit('select-type', option);
    }
  },
  created() {
    const self = this;
    window.addEventListener('click', e => {
      if (!self.$el.children[0].contains(e.target)){
        self.isMenuHidden = true;
      }
    });
  }
};

