export default class EventBus {
    protected _eventTree: Record<string, any> = {}
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
        if (Array.isArray(fns)) {
            const index = fns.findIndex((fn: Function) => fn === cb);
            if (index > -1) {
                fns.splice(index, 1);
                // 如果数组为空，删除事件名键
                if (fns.length === 0) {
                    delete this._eventTree[eventName];
                }
            }
        }
    }

    /**
     * 清除所有事件监听器
     */
    clearAllListeners() {
        this._eventTree = {};
    }

    /**
     * 清除指定事件名的所有监听器
     * @param eventName 事件名称
     */
    clearEventListeners(eventName: string) {
        delete this._eventTree[eventName];
    }
}
