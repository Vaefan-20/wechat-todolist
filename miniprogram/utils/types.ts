export interface Category {
  id: string
  name: string
}

export type TodoPriority = 'high' | 'medium' | 'low'

export interface Todo {
  id: string
  title: string
  done: boolean
  categoryId: string
  createdAt: number
  note?: string
  priority: TodoPriority
  /** 截止时间 YYYY-MM-DD HH:mm，可选 */
  dueDate?: string
}
