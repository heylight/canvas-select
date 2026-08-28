import { describe, it, expect } from 'vitest';
import Shape from '../src/shape/Shape';

describe('Shape 基类', () => {
  it('应写入 index 并保留默认状态', () => {
    const shape = new Shape({ type: 1 }, 3);
    expect(shape.index).toBe(3);
    expect(shape.type).toBe(1);
    expect(shape.label).toBe('');
    expect(shape.coor).toEqual([]);
    expect(shape.active).toBe(false);
    expect(shape.creating).toBe(false);
    expect(shape.dragging).toBe(false);
  });

  it('应把传入对象的属性全部合并到实例上', () => {
    const shape = new Shape(
      { type: 2, label: '车辆', coor: [[0, 0], [10, 10]], hide: true },
      0,
    );
    expect(shape.label).toBe('车辆');
    expect(shape.coor).toEqual([[0, 0], [10, 10]]);
    expect(shape.hide).toBe(true);
  });

  it('应为每个实例生成唯一 uuid', () => {
    const a = new Shape({ type: 1 }, 0);
    const b = new Shape({ type: 1 }, 1);
    expect(a.uuid).toBeTruthy();
    expect(a.uuid).not.toBe(b.uuid);
  });

  it('传入的 uuid 应覆盖自动生成的值', () => {
    const shape = new Shape({ type: 1, uuid: 'fixed-uuid' }, 0);
    expect(shape.uuid).toBe('fixed-uuid');
  });
});
