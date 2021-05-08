export interface BaseShape {
    label?: string
    type: number // 形状
    active: boolean
    creating?: boolean
    dragging?: boolean
    index: number,
    uuid: string
  }
export type Point = [number, number]
