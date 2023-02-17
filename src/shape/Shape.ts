import { createUuid } from '../bridge'
import EventBus from '../EventBus'

export default class Shape {
    public label: string = ''
    public coor: any[] = []
    public strokeStyle: string = ''
    public fillStyle: string = ''
    public labelFillStyle: string = ''
    public textFillStyle: string = ''
    public labelFont: string = ''
    public type: number // 形状
    public active: boolean = false
    public creating: boolean = false
    public dragging: boolean = false
    public index: number
    public uuid: string = createUuid()
    constructor(index: number, label: string, style: Record<string, any>, uuid: string) {
        const { strokeStyle, fillStyle, labelFillStyle, labelFont } = style
        this.index = index;
        this.label = label;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
        this.labelFillStyle = labelFillStyle;
        this.labelFont = labelFont;
        if (uuid) this.uuid = uuid
    }
}
