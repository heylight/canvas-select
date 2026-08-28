import { describe, it, expect } from 'vitest';
import Brush from '../src/shape/Brush';
import Eraser from '../src/shape/Eraser';

describe('Brush', () => {
  const base = { brushSize: 10, brushStokeStyle: '#f00' };

  it('type 固定为 7，样式缺省时回落到 base 配置', () => {
    const brush = new Brush({ coor: [] }, 0, base);
    expect(brush.type).toBe(7);
    expect(brush.brushSize).toBe(10);
    expect(brush.brushStokeStyle).toBe('#f00');
  });

  it('自身配置应优先于 base 配置', () => {
    const brush = new Brush(
      { coor: [], brushSize: 30, brushStokeStyle: '#0f0' },
      0,
      base,
    );
    expect(brush.brushSize).toBe(30);
    expect(brush.brushStokeStyle).toBe('#0f0');
  });

  it('应原样保留笔迹坐标点', () => {
    const coor = [[0, 0], [1, 1], [2, 3]] as any;
    const brush = new Brush({ coor }, 1, base);
    expect(brush.coor).toEqual(coor);
    expect(brush.index).toBe(1);
  });
});

describe('Eraser', () => {
  const base = { eraserSize: 20 };

  it('type 固定为 8，尺寸缺省时回落到 base 配置', () => {
    const eraser = new Eraser({ coor: [] }, 0, base);
    expect(eraser.type).toBe(8);
    expect(eraser.eraserSize).toBe(20);
  });

  it('自身尺寸应优先于 base 配置', () => {
    const eraser = new Eraser({ coor: [], eraserSize: 5 }, 0, base);
    expect(eraser.eraserSize).toBe(5);
  });

  it('应原样保留擦除轨迹坐标点', () => {
    const coor = [[10, 10], [20, 20]] as any;
    const eraser = new Eraser({ coor }, 2, base);
    expect(eraser.coor).toEqual(coor);
    expect(eraser.index).toBe(2);
  });
});
