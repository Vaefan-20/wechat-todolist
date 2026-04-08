import { STORAGE_CATEGORIES, STORAGE_TODOS } from './constants'
import { migrateLegacyDue } from './due'
import type { Category, Todo, TodoPriority } from './types'

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: '工作' },
  { id: 'life', name: '生活' },
  { id: 'study', name: '学习' },
]

export function ensureDefaultData(): void {
  try {
    const cats = wx.getStorageSync(STORAGE_CATEGORIES)
    if (!cats || !Array.isArray(cats) || cats.length === 0) {
      wx.setStorageSync(STORAGE_CATEGORIES, DEFAULT_CATEGORIES)
    }
    const todos = wx.getStorageSync(STORAGE_TODOS)
    if (!todos || !Array.isArray(todos)) {
      wx.setStorageSync(STORAGE_TODOS, [])
    }
  } catch (error) {
    console.error('初始化默认数据失败:', error)
    wx.setStorageSync(STORAGE_CATEGORIES, DEFAULT_CATEGORIES)
    wx.setStorageSync(STORAGE_TODOS, [])
  }
}

export function loadCategories(): Category[] {
  const v = wx.getStorageSync(STORAGE_CATEGORIES) as Category[] | undefined
  if (!v || !Array.isArray(v)) {
    return [...DEFAULT_CATEGORIES]
  }
  return v
}

function normalizePriority(v: unknown): TodoPriority {
  if (v === 'high' || v === 'low' || v === 'medium') {
    return v
  }
  return 'medium'
}

export function normalizeTodo(raw: WechatMiniprogram.IAnyObject): Todo {
  let due: string | undefined =
    typeof raw.dueDate === 'string' && raw.dueDate.length > 0
      ? raw.dueDate.trim()
      : undefined
  if (due) {
    due = migrateLegacyDue(due)
  }
  return {
    id: String(raw.id),
    title: typeof raw.title === 'string' ? raw.title : '',
    done: Boolean(raw.done),
    categoryId:
      typeof raw.categoryId === 'string' && raw.categoryId.length > 0
        ? raw.categoryId
        : 'work',
    createdAt:
      typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    note:
      typeof raw.note === 'string' && raw.note.length > 0
        ? raw.note
        : undefined,
    priority: normalizePriority(raw.priority),
    dueDate: due,
  }
}

export function loadTodos(): Todo[] {
  try {
    const v = wx.getStorageSync(STORAGE_TODOS)
    console.log('loadTodos 原始数据:', v)
    if (!v || !Array.isArray(v)) {
      return []
    }
    const todos = v.map((row) => normalizeTodo(row))
    console.log('loadTodos 规范化后:', todos)
    return todos
  } catch (error) {
    console.error('加载待办事项失败:', error)
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    wx.setStorageSync(STORAGE_TODOS, todos)
    console.log('保存待办事项成功:', todos.length, '条')
  } catch (error) {
    console.error('保存待办事项失败:', error)
  }
}
