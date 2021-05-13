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

export interface Style {
  strokeStyle: string
  fillStyle: string
}
export interface Label {
  font: string
  height: string
  textMaxLen: number
  fillStyle: string
}

export interface Ctrl {
  strokeStyle: string
  fillStyle: string
  r: number
}
