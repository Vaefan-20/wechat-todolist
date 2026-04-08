import { loadTodos, saveTodos } from '../../utils/storage'
import { joinDue, splitDue } from '../../utils/due'
import type { Todo, TodoPriority } from '../../utils/types'

const PRIORITY_VALUES: TodoPriority[] = ['high', 'medium', 'low']

const CATEGORIES = [
  { id: 'work', name: '工作' },
  { id: 'life', name: '生活' },
  { id: 'study', name: '学习' },
] as const

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function toneForPriorityIndex(i: number): TodoPriority {
  return PRIORITY_VALUES[Math.min(Math.max(i, 0), 2)] ?? 'medium'
}

Page({
  data: {
    isEdit: false,
    todoId: '',
    title: '',
    titleLen: 0,
    description: '',
    descLen: 0,
    priorityLabels: ['高优先级', '中优先级', '低优先级'],
    priorityIndex: 1,
    priorityTone: 'medium' as TodoPriority,
    categories: [...CATEGORIES],
    categoryIndex: 0,
    dueDatePart: '',
    dueTimePart: '00:00',
  },

  onLoad(query: Record<string, string | undefined>) {
    const id = query.id ? decodeURIComponent(query.id) : ''
    console.log('页面加载，id:', id)
    if (id) {
      const todos = loadTodos()
      console.log('编辑模式，加载待办:', todos.length, '条')
      const todo = todos.find((t) => t.id === id)
      if (!todo) {
        console.error('待办不存在:', id)
        wx.showToast({ title: '待办不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }
      console.log('找到待办:', todo)
      const catIdx = Math.max(
        0,
        CATEGORIES.findIndex((c) => c.id === todo.categoryId),
      )
      const pIdx = PRIORITY_VALUES.indexOf(todo.priority)
      const pi = pIdx >= 0 ? pIdx : 1
      const desc = todo.note || ''
      const { date, time } = splitDue(todo.dueDate)
      this.setData({
        isEdit: true,
        todoId: id,
        title: todo.title,
        titleLen: todo.title.length,
        description: desc,
        descLen: desc.length,
        categoryIndex: catIdx,
        priorityIndex: pi,
        priorityTone: toneForPriorityIndex(pi),
        dueDatePart: date,
        dueTimePart: time,
      })
    }
  },

  onTitleInput(e: WechatMiniprogram.Input) {
    const v = e.detail.value
    this.setData({ title: v, titleLen: v.length })
  },

  onDescriptionInput(e: WechatMiniprogram.TextareaInput) {
    const v = e.detail.value
    this.setData({ description: v, descLen: v.length })
  },

  onPriorityChange(e: WechatMiniprogram.PickerChange) {
    const idx = Number(e.detail.value)
    if (!Number.isNaN(idx)) {
      this.setData({
        priorityIndex: idx,
        priorityTone: toneForPriorityIndex(idx),
      })
    }
  },

  onCategoryTap(e: WechatMiniprogram.TouchEvent) {
    const idx = Number(e.currentTarget.dataset.index)
    if (!Number.isNaN(idx)) {
      this.setData({ categoryIndex: idx })
    }
  },

  onDueDatePartChange(e: WechatMiniprogram.PickerChange) {
    const v = e.detail.value
    const dateStr = typeof v === 'string' ? v : ''
    if (!dateStr) {
      return
    }
    const { dueTimePart } = this.data
    this.setData({
      dueDatePart: dateStr,
      dueTimePart: dueTimePart || '00:00',
    })
  },

  onDueTimePartChange(e: WechatMiniprogram.PickerChange) {
    const v = e.detail.value
    const timeStr = typeof v === 'string' ? v : '00:00'
    this.setData({ dueTimePart: timeStr })
  },

  onClearDueDate() {
    this.setData({ dueDatePart: '', dueTimePart: '00:00' })
  },

  onConfirm() {
    const title = this.data.title.trim()
    if (!title) {
      wx.showToast({ title: '请填写标题', icon: 'none' })
      return
    }
    const {
      categories,
      categoryIndex,
      priorityIndex,
      isEdit,
      todoId,
      description,
      dueDatePart,
      dueTimePart,
    } = this.data
    const cat = categories[categoryIndex]
    if (!cat) {
      wx.showToast({ title: '请选择分类', icon: 'none' })
      return
    }
    const priority = PRIORITY_VALUES[Math.min(priorityIndex, 2)] ?? 'medium'
    const todos = loadTodos()
    const now = Date.now()
    const noteTrim = description.trim()
    const due = joinDue(dueDatePart, dueTimePart)

    if (isEdit && todoId) {
      const next = todos.map((t) =>
        t.id === todoId
          ? {
              ...t,
              title,
              note: noteTrim || undefined,
              categoryId: cat.id,
              priority,
              dueDate: due,
            }
          : t,
      )
      console.log('编辑待办，保存:', next.length, '条')
      saveTodos(next)
    } else {
      const item: Todo = {
        id: newId(),
        title,
        done: false,
        categoryId: cat.id,
        createdAt: now,
        note: noteTrim || undefined,
        priority,
        dueDate: due,
      }
      console.log('新增待办，添加前:', todos.length, '条', '新增:', item)
      saveTodos([item, ...todos])
    }
    wx.navigateBack()
  },
})
