import { describe, it, expect } from 'vitest';
import Circle from '../src/shape/Circle';

const base = { fillStyle: '#fff', strokeStyle: '#000' };

describe('Circle', () => {
  it('type 固定为 5，radius 默认为 0', () => {
    const circle = new Circle({ coor: [0, 0] }, 0, base);
    expect(circle.type).toBe(5);
    expect(circle.radius).toBe(0);
  });

  it('应读取传入的 radius', () => {
    const circle = new Circle({ coor: [0, 0], radius: 25 }, 0, base);
    expect(circle.radius).toBe(25);
  });

  it('样式缺省时应回落到 base 配置', () => {
    const circle = new Circle({ coor: [0, 0] }, 0, base);
    expect(circle.fillStyle).toBe('#fff');
    expect(circle.strokeStyle).toBe('#000');
  });

  it('ctrlsData 应返回上右下左 4 个控制点', () => {
    const circle = new Circle({ coor: [100, 100], radius: 10 }, 0, base);
    expect(circle.ctrlsData).toEqual([
      [100, 90],
      [110, 100],
      [100, 110],
      [90, 100],
    ]);
  });

  it('radius 为 0 时 4 个控制点应重合于圆心', () => {
    const circle = new Circle({ coor: [50, 50] }, 0, base);
    expect(circle.ctrlsData).toEqual([
      [50, 50], [50, 50], [50, 50], [50, 50],
    ]);
  });
});
