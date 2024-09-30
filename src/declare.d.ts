// 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday
declare type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

declare type RemoveDate<T> = Omit<T, 'deletedAt' | 'updatedAt' | 'createdAt'>
declare type RemoveId<T> = Omit<T, 'id'>
declare interface ResBody<T> {
  data: T
}

declare interface ResList<T> {
  list: T
  count: number
}

declare type FormMode = 'add' | 'edit' | 'view' | 'none'
