import { loadTodos, saveTodos } from '../../utils/storage'
import type { Todo } from '../../utils/types'

const CATEGORY_LABEL: Record<string, string> = {
  work: '工作',
  life: '生活',
  study: '学习',
}

interface DisplayRow extends Todo {
  categoryName: string
}

Page({
  data: {
    tabs: [
      { id: 'all', name: '全部' },
      { id: 'work', name: '工作' },
      { id: 'life', name: '生活' },
      { id: 'study', name: '学习' },
    ],
    selectedCategoryId: 'all',
    displayRows: [] as DisplayRow[],
    emptyHint: '暂无待办，点击右下角 [+] 新增。',
    searchKeyword: '',
    filteredRows: [] as DisplayRow[],
  },

  onShow() {
    console.log('页面显示，开始刷新')
    this.refresh()
  },

  refresh() {
    try {
      const todos = loadTodos()
      console.log('加载待办事项:', todos.length, '条', todos)
      const selected = this.data.selectedCategoryId
      console.log('选中的分类:', selected)
      const filtered =
        selected === 'all' ? todos : todos.filter((t) => t.categoryId === selected)
      console.log('筛选后:', filtered.length, '条', filtered)
      const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt)
      const displayRows: DisplayRow[] = sorted.map((t) => ({
        ...t,
        categoryName: CATEGORY_LABEL[t.categoryId] || '',
      }))
      console.log('显示行:', displayRows.length, '条', displayRows)
      
      const searchKeyword = this.data.searchKeyword
      const finalRows = searchKeyword
        ? displayRows.filter((r) =>
            r.title.toLowerCase().includes(searchKeyword.toLowerCase())
          )
        : displayRows
      
      const emptyHint = selected === 'all'
        ? searchKeyword
          ? '未找到匹配的待办事项'
          : '暂无待办，点击右下角 [+] 新增。'
        : '该分类下暂无待办，点击右下角 [+] 新增。'
      
      this.setData({
        displayRows: finalRows,
        emptyHint,
      })
    } catch (error) {
      console.error('刷新待办列表失败:', error)
    }
  },

  onTabTap(e: WechatMiniprogram.TouchEvent | WechatMiniprogram.CustomEvent) {
    let id: string | undefined
    if ('detail' in e && e.detail) {
      id = e.detail.id as string | undefined
    } else {
      id = e.currentTarget?.dataset?.id as string | undefined
    }
    console.log('onTabTap 触发, id:', id)
    if (!id) {
      return
    }
    console.log('设置 selectedCategoryId:', id)
    this.setData({ selectedCategoryId: id }, () => {
      console.log('selectedCategoryId 已更新，开始刷新')
      this.refresh()
    })
  },

  onToggleTodo(e: WechatMiniprogram.CustomEvent<{ id: string }>) {
    const id = e.detail.id
    const todos = loadTodos()
    const next = todos.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t,
    )
    saveTodos(next)
    this.refresh()
  },

  onDeleteTodo(e: WechatMiniprogram.CustomEvent<{ id: string }>) {
    const id = e.detail.id
    const todos = loadTodos().filter((t) => t.id !== id)
    saveTodos(todos)
    this.refresh()
  },

  onEditTodo(e: WechatMiniprogram.CustomEvent<{ id: string }>) {
    const id = e.detail.id
    wx.navigateTo({
      url: `/pages/add/add?id=${encodeURIComponent(id)}`,
    })
  },

  onAdd() {
    wx.navigateTo({
      url: '/pages/add/add',
    })
  },

  onSearchInput(e: WechatMiniprogram.Input) {
    const keyword = e.detail.value || ''
    this.setData({ searchKeyword: keyword }, () => this.refresh())
  },

  onDragStart(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset
    this.setData({ dragStartIndex: Number(index) })
  },

  onDragMove(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset
    this.setData({ dragOverIndex: Number(index) })
  },

  onDragEnd(e: WechatMiniprogram.TouchEvent) {
    const { dragStartIndex, dragOverIndex } = this.data
    if (dragStartIndex === undefined || dragOverIndex === undefined || dragStartIndex === dragOverIndex) {
      this.setData({ dragStartIndex: undefined, dragOverIndex: undefined })
      return
    }

    const todos = loadTodos()
    const selected = this.data.selectedCategoryId
    const filtered =
      selected === 'all' ? todos : todos.filter((t) => t.categoryId === selected)
    const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt)
    
    const newTodos = [...sorted]
    const [movedItem] = newTodos.splice(dragStartIndex, 1)
    
    let targetIndex = dragOverIndex
    if (dragStartIndex < dragOverIndex) {
      targetIndex = dragOverIndex - 1
    }
    newTodos.splice(targetIndex, 0, movedItem)
    
    const remainingTodos = todos.filter((t) => !filtered.includes(t))
    const finalTodos = [...remainingTodos, ...newTodos]
    
    saveTodos(finalTodos)
    this.setData({ dragStartIndex: undefined, dragOverIndex: undefined })
    this.refresh()
  },

  onClearSearch() {
    this.setData({ searchKeyword: '' }, () => this.refresh())
  },
})
