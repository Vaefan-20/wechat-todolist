Component({
  properties: {
    categories: {
      type: Array,
      value: [],
    },
    activeId: {
      type: String,
      value: 'all',
      observer(newVal) {
        console.log('activeId 变化:', newVal)
      },
    },
  },
  methods: {
    onSelect(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id as string | undefined
      console.log('category-filter onSelect, id:', id)
      if (!id) {
        return
      }
      this.triggerEvent('change', { id })
    },
  },
})
