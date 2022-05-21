export default class EventBus {
    public _eventTree: Record<string, any> = {}
    /**
   * 注册事件
   * @param eventName 事件名称
   * @param cb 回调方法
   */
    on(eventName: string, cb: Function) {
        const fns = this._eventTree[eventName];
        if (Array.isArray(fns)) {
            fns.push(cb);
        } else {
            this._eventTree[eventName] = [cb];
        }
    }

    /**
     * 触发事件
     * @param eventName 事件名称
     * @param payload 传递参数
     */
    emit(eventName: string, ...payload: any) {
        const fns = this._eventTree[eventName];
        if (Array.isArray(fns)) {
            fns.forEach((fn) => fn(...payload));
        }
    }

    /**
     * 注销事件
     * @param eventName 事件名称
     * @param cb 传递参数
     */
    off(eventName: string, cb: Function) {
        const fns = this._eventTree[eventName];
        const index = fns.find((fn: Function) => fn === cb);
        if (Array.isArray(fns) && index) {
            fns.splice(index, 1);
        }
    }
}
