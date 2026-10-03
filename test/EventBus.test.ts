import { describe, it, expect, vi } from 'vitest';
import EventBus from '../src/EventBus';

describe('EventBus', () => {
  it('on/emit 应触发已注册的回调', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('add', fn);
    bus.emit('add');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('emit 应把全部参数原样透传给回调', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('select', fn);
    bus.emit('select', { type: 1 }, 'extra', 42);
    expect(fn).toHaveBeenCalledWith({ type: 1 }, 'extra', 42);
  });

  it('同一事件注册多个回调应按注册顺序全部执行', () => {
    const bus = new EventBus();
    const order: number[] = [];
    bus.on('load', () => order.push(1));
    bus.on('load', () => order.push(2));
    bus.on('load', () => order.push(3));
    bus.emit('load');
    expect(order).toEqual([1, 2, 3]);
  });

  it('emit 未注册的事件不应抛错', () => {
    const bus = new EventBus();
    expect(() => bus.emit('nothing')).not.toThrow();
  });

  it('off 应移除指定回调，其余回调不受影响', () => {
    const bus = new EventBus();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('updated', a);
    bus.on('updated', b);
    bus.off('updated', a);
    bus.emit('updated');
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('off 移除后再次 emit 不应重新触发（回归：off 失效问题）', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('delete', fn);
    bus.emit('delete');
    bus.off('delete', fn);
    bus.emit('delete');
    bus.emit('delete');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('同一回调重复注册两次，off 一次应只移除一个', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('warn', fn);
    bus.on('warn', fn);
    bus.off('warn', fn);
    bus.emit('warn');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('off 未注册的事件或未注册的回调不应抛错', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    expect(() => bus.off('none', fn)).not.toThrow();
    bus.on('exist', vi.fn());
    expect(() => bus.off('exist', fn)).not.toThrow();
  });

  it('不同事件名之间应相互隔离', () => {
    const bus = new EventBus();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('add', a);
    bus.on('delete', b);
    bus.emit('add');
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).not.toHaveBeenCalled();
  });

  it('不同实例之间事件不应串扰', () => {
    const bus1 = new EventBus();
    const bus2 = new EventBus();
    const fn = vi.fn();
    bus1.on('add', fn);
    bus2.emit('add');
    expect(fn).not.toHaveBeenCalled();
  });
});
