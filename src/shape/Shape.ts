import { createUuid } from "../tools"

interface ShapeProp {
    type: number
    [key: string]: any
}
export default class Shape {
    /** 标签 */
    public label: string = ''
    /** 是否隐藏标签 */
    public hideLabel: boolean
    /** 坐标 */
    public coor: any[] = []
    /** 边线颜色 */
    public strokeStyle: string
    /** 填充颜色 */
    public fillStyle: string
    /** 边线宽度 */
    public lineWidth: number
    /** 标签填充颜色 */
    public labelFillStyle: string
    /** 标签文字颜色 */
    public textFillStyle: string
    /** 标签文字字体 */
    public labelFont: string
    /** 1 矩形，2 多边形，3 点，4 折线，5 圆 */
    public type: number // 形状
    /** 当前是否处于活动状态 */
    public active: boolean = false
    /** 当前是否处于创建状态 */
    public creating: boolean = false
    /** 当前是否处于拖拽状态 */
    public dragging: boolean = false
    /** 索引 */
    public index: number
    /** 唯一标识 */
    public uuid: string = createUuid()
    constructor(item: ShapeProp, index: number) {
        this.index = index
        Object.assign(this, item)
    }
}
