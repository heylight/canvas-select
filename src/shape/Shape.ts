import { createUuid } from '../bridge'

export default class Shape {
    public label: string = ''
    public coor: any[] = []
    public strokeStyle
    public fillStyle
    public labelFillStyle
    public textFillStyle: string
    public labelFont
    public type: number // 形状
    public active: boolean = false
    public creating: boolean = false
    public dragging: boolean = false
    public index: number
    public uuid: string = createUuid()
    constructor(index: number, label = '', style: Record<string, any>, uuid: string) {
        const { strokeStyle, fillStyle, labelFillStyle, textFillStyle, labelFont } = style
        this.index = index;
        if (label) this.label = label;
        if (strokeStyle) this.strokeStyle = strokeStyle;
        if (fillStyle) this.fillStyle = fillStyle;
        if (labelFillStyle) this.labelFillStyle = labelFillStyle;
        if (labelFont) this.labelFont = labelFont;
        if (textFillStyle) this.textFillStyle = textFillStyle;
        if (uuid) this.uuid = uuid
    }
}
