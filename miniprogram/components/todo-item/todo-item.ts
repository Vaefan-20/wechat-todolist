type TouchHost = WechatMiniprogram.Component.Instance<
  WechatMiniprogram.IAnyObject,
  WechatMiniprogram.IAnyObject,
  WechatMiniprogram.IAnyObject,
  WechatMiniprogram.IAnyObject
> & {
  _deletePx: number
  _startX: number
  _startY: number
  _baseOffset: number
  _lockedVertical: boolean
  _isDragging: boolean
}

const SWIPE_DELETE_RPX = 160

/** 列表第二行展示：YYYY-MM-DD HH:mm */
function formatDueDisplay(raw: string): string {
  const s = raw.trim()
  if (!s) {
    return ''
  }
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) {
    return s
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return `${s} 00:00`
  }
  return s
}

Component({
  properties: {
    todo: {
      type: Object,
      value: {},
    },
    categoryName: {
      type: String,
      value: '',
    },
  },
  data: {
    offset: 0,
    dueDisplay: '',
    animating: false,
  },
  observers: {
    todo(todo: WechatMiniprogram.IAnyObject) {
      const raw = typeof todo?.dueDate === 'string' ? todo.dueDate : ''
      this.setData({
        dueDisplay: formatDueDisplay(raw),
      })
    },
  },
  lifetimes: {
    attached() {
      const host = this as unknown as TouchHost
      try {
        const w = wx.getSystemInfoSync().windowWidth
        host._deletePx = (SWIPE_DELETE_RPX / 750) * w
      } catch {
        host._deletePx = (SWIPE_DELETE_RPX / 750) * 375
      }
      host._startX = 0
      host._startY = 0
      host._baseOffset = 0
      host._lockedVertical = false
    },
  },
  methods: {
    onTouchStart(e: WechatMiniprogram.TouchEvent) {
      const host = this as unknown as TouchHost
      host._startX = e.touches[0].clientX
      host._startY = e.touches[0].clientY
      host._baseOffset = this.data.offset
      host._lockedVertical = false
      this.setData({ animating: false })
    },
    onTouchMove(e: WechatMiniprogram.TouchEvent) {
      const host = this as unknown as TouchHost
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      const dx = x - host._startX
      const dy = y - host._startY
      if (!host._lockedVertical) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
          host._lockedVertical = true
          return
        }
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          host._lockedVertical = false
        }
      }
      if (host._lockedVertical) {
        return
      }
      let next = host._baseOffset + dx
      if (next > 0) {
        next = 0
      }
      if (next < -host._deletePx) {
        next = -host._deletePx
      }
      this.setData({ offset: next })
    },
    onTouchEnd() {
      const host = this as unknown as TouchHost
      if (host._lockedVertical) {
        host._lockedVertical = false
        return
      }
      const { offset } = this.data
      const threshold = -host._deletePx / 2
      const snap = offset < threshold ? -host._deletePx : 0
      this.setData({ offset: snap, animating: true })
    },
    onToggle() {
      const todo = this.properties.todo as WechatMiniprogram.IAnyObject
      if (!todo?.id) {
        return
      }
      this.triggerEvent('toggle', { id: todo.id as string })
    },
    onEdit() {
      const todo = this.properties.todo as WechatMiniprogram.IAnyObject
      if (!todo?.id) {
        return
      }
      this.triggerEvent('edit', { id: todo.id as string })
    },
    onDeleteTap() {
      const todo = this.properties.todo as WechatMiniprogram.IAnyObject
      if (!todo?.id) {
        return
      }
      this.triggerEvent('remove', { id: todo.id as string })
    },
    onDrag() {
      const todo = this.properties.todo as WechatMiniprogram.IAnyObject
      if (!todo?.id) {
        return
      }
      this.triggerEvent('drag', { id: todo.id as string })
    },
  },
})
