import { describe, it, expect } from 'vitest';
import Polygon from '../src/shape/Polygon';
import Line from '../src/shape/Line';
import Dot from '../src/shape/Dot';

const base = { fillStyle: '#fff', strokeStyle: '#000' };

describe('Polygon', () => {
  it('type 固定为 2，样式应回落到 base 配置', () => {
    const polygon = new Polygon({ coor: [] }, 0, base);
    expect(polygon.type).toBe(2);
    expect(polygon.fillStyle).toBe('#fff');
    expect(polygon.strokeStyle).toBe('#000');
  });

  it('顶点多于 2 个时 ctrlsData 应返回全部顶点', () => {
    const coor = [[0, 0], [10, 0], [10, 10]];
    const polygon = new Polygon({ coor }, 0, base);
    expect(polygon.ctrlsData).toEqual(coor);
  });

  it('顶点不足 3 个时 ctrlsData 应为空（无法构成多边形）', () => {
    expect(new Polygon({ coor: [[0, 0], [10, 0]] }, 0, base).ctrlsData).toEqual([]);
    expect(new Polygon({ coor: [[0, 0]] }, 0, base).ctrlsData).toEqual([]);
    expect(new Polygon({ coor: [] }, 0, base).ctrlsData).toEqual([]);
  });
});

describe('Line', () => {
  it('type 固定为 4，只回落 strokeStyle', () => {
    const line = new Line({ coor: [] }, 0, base);
    expect(line.type).toBe(4);
    expect(line.strokeStyle).toBe('#000');
    expect(line.fillStyle).toBeUndefined();
  });

  it('顶点多于 1 个时 ctrlsData 应返回全部顶点', () => {
    const coor = [[0, 0], [10, 10]];
    const line = new Line({ coor }, 0, base);
    expect(line.ctrlsData).toEqual(coor);
  });

  it('顶点不足 2 个时 ctrlsData 应为空（无法构成线段）', () => {
    expect(new Line({ coor: [[0, 0]] }, 0, base).ctrlsData).toEqual([]);
    expect(new Line({ coor: [] }, 0, base).ctrlsData).toEqual([]);
  });
});

describe('Dot', () => {
  it('type 固定为 3，样式应回落到 base 配置', () => {
    const dot = new Dot({ coor: [5, 5] }, 2, base);
    expect(dot.type).toBe(3);
    expect(dot.index).toBe(2);
    expect(dot.coor).toEqual([5, 5]);
    expect(dot.fillStyle).toBe('#fff');
    expect(dot.strokeStyle).toBe('#000');
  });
});
