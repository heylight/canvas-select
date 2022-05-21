import { createUuid } from '../bridge'
import EventBus from '../EventBus'

export default class Shape {
    public label: string = ''
    public coor: any[] = []
    public strokeStyle: string = ''
    public fillStyle: string = ''
    public type: number // 形状
    public active: boolean = false
    public creating: boolean = false
    public dragging: boolean = false
    public index: number
    public uuid: string = createUuid()
    constructor(index: number, label: string, strokeStyle: string, fillStyle: string, uuid: string) {
        debugger
        this.index = index;
        this.label = label;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
        if (uuid) this.uuid = uuid
    }
}
