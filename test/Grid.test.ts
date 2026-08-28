import { describe, it, expect } from 'vitest';
import Grid from '../src/shape/Grid';

const base = { fillStyle: '#fff', strokeStyle: '#000' };

describe('Grid', () => {
  it('type 固定为 6，row/col 默认为 1', () => {
    const grid = new Grid({ coor: [[0, 0], [10, 10]] }, 0, base);
    expect(grid.type).toBe(6);
    expect(grid.row).toBe(1);
    expect(grid.col).toBe(1);
    expect(grid.selected).toEqual([]);
  });

  it('row/col 非正数时应回落到默认值 1', () => {
    const grid = new Grid({ coor: [[0, 0], [10, 10]], row: 0, col: -3 }, 0, base);
    expect(grid.row).toBe(1);
    expect(grid.col).toBe(1);
  });

  it('selected 非数组时应重置为空数组', () => {
    const grid = new Grid(
      { coor: [[0, 0], [10, 10]], selected: 'bad' as any },
      0,
      base,
    );
    expect(grid.selected).toEqual([]);
  });

  it('selected 为数组时应原样保留', () => {
    const grid = new Grid(
      { coor: [[0, 0], [10, 10]], row: 2, col: 2, selected: [0, 3] },
      0,
      base,
    );
    expect(grid.selected).toEqual([0, 3]);
  });

  it('ctrlsData 应返回 8 个边角与中点控制点', () => {
    const grid = new Grid({ coor: [[0, 0], [100, 50]] }, 0, base);
    expect(grid.ctrlsData).toEqual([
      [0, 0], [50, 0], [100, 0], [100, 25],
      [100, 50], [50, 50], [0, 50], [0, 25],
    ]);
  });

  it('gridRects 数量应为 row * col', () => {
    const grid = new Grid({ coor: [[0, 0], [100, 100]], row: 3, col: 4 }, 0, base);
    expect(grid.gridRects).toHaveLength(12);
  });

  it('gridRects 应按行优先顺序切分且索引连续', () => {
    const grid = new Grid({ coor: [[0, 0], [100, 100]], row: 2, col: 2 }, 0, base);
    const rects = grid.gridRects;
    expect(rects.map((r) => r.index)).toEqual([0, 1, 2, 3]);
    expect(rects[0].coor).toEqual([[0, 0], [50, 50]]);
    expect(rects[1].coor).toEqual([[50, 0], [100, 50]]);
    expect(rects[2].coor).toEqual([[0, 50], [50, 100]]);
    expect(rects[3].coor).toEqual([[50, 50], [100, 100]]);
  });

  it('gridRects 应继承网格自身的样式与状态', () => {
    const grid = new Grid(
      { coor: [[0, 0], [10, 10]], lineWidth: 3, active: true },
      0,
      base,
    );
    const [rect] = grid.gridRects;
    expect(rect.strokeStyle).toBe('#000');
    expect(rect.fillStyle).toBe('#fff');
    expect(rect.lineWidth).toBe(3);
    expect(rect.active).toBe(true);
  });

  it('1x1 网格的单元格应等于整体范围', () => {
    const grid = new Grid({ coor: [[10, 20], [30, 40]] }, 0, base);
    const rects = grid.gridRects;
    expect(rects).toHaveLength(1);
    expect(rects[0].coor).toEqual([[10, 20], [30, 40]]);
  });
});
