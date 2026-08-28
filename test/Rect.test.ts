import { describe, it, expect } from 'vitest';
import Rect from '../src/shape/Rect';

const base = {
  lineWidth: 2,
  fillStyle: '#00000030',
  strokeStyle: '#f00',
  showRotation: false,
};

describe('Rect', () => {
  it('type 固定为 1，rotation 默认为 0', () => {
    const rect = new Rect({ coor: [[0, 0], [10, 10]] }, 0, base);
    expect(rect.type).toBe(1);
    expect(rect.rotation).toBe(0);
  });

  it('样式缺省时应回落到 base 配置', () => {
    const rect = new Rect({ coor: [[0, 0], [10, 10]] }, 0, base);
    expect(rect.lineWidth).toBe(2);
    expect(rect.fillStyle).toBe('#00000030');
    expect(rect.strokeStyle).toBe('#f00');
  });

  it('自身样式应优先于 base 配置', () => {
    const rect = new Rect(
      { coor: [[0, 0], [10, 10]], lineWidth: 8, strokeStyle: '#0f0' },
      0,
      base,
    );
    expect(rect.lineWidth).toBe(8);
    expect(rect.strokeStyle).toBe('#0f0');
    expect(rect.fillStyle).toBe('#00000030');
  });

  it('样式为 0 等假值时应保留自身值而非回落（?? 语义）', () => {
    const rect = new Rect({ coor: [[0, 0], [10, 10]], lineWidth: 0 }, 0, base);
    expect(rect.lineWidth).toBe(0);
  });

  it('center 应返回矩形中心点', () => {
    const rect = new Rect({ coor: [[10, 20], [30, 60]] }, 0, base);
    expect(rect.center).toEqual([20, 40]);
  });

  it('未旋转时 ctrlsData 应返回 8 个边角与中点控制点', () => {
    const rect = new Rect({ coor: [[0, 0], [100, 50]] }, 0, base);
    expect(rect.ctrlsData).toEqual([
      [0, 0],
      [50, 0],
      [100, 0],
      [100, 25],
      [100, 50],
      [50, 50],
      [0, 50],
      [0, 25],
    ]);
  });

  it('showRotation 为 true 时应追加位于顶边上方 20px 的旋转控制点', () => {
    const rect = new Rect(
      { coor: [[0, 0], [100, 50]], showRotation: true },
      0,
      base,
    );
    const ctrls = rect.ctrlsData;
    expect(ctrls).toHaveLength(9);
    expect(ctrls[8]).toEqual([50, -20, 'green']);
  });

  it('已知行为：rotation 无法通过构造参数传入（类字段初始化会覆盖）', () => {
    const rect = new Rect(
      { coor: [[0, 0], [100, 50]], rotation: Math.PI / 2 },
      0,
      base,
    );
    expect(rect.rotation).toBe(0);
  });

  it('旋转 90° 时控制点应绕中心点旋转', () => {
    const rect = new Rect({ coor: [[0, 0], [100, 50]] }, 0, base);
    rect.rotation = Math.PI / 2;
    const ctrls = rect.ctrlsData;
    expect(ctrls).toHaveLength(8);
    // 左上角 (0,0) 绕中心 (50,25) 旋转 90° 后应落到 (75,-25)
    expect(ctrls[0][0]).toBeCloseTo(75, 10);
    expect(ctrls[0][1]).toBeCloseTo(-25, 10);
  });

  it('旋转 360° 后控制点应回到原位', () => {
    const rect = new Rect({ coor: [[0, 0], [100, 50]] }, 0, base);
    rect.rotation = Math.PI * 2;
    const rotated = rect.ctrlsData;
    const expected = [
      [0, 0], [50, 0], [100, 0], [100, 25],
      [100, 50], [50, 50], [0, 50], [0, 25],
    ];
    rotated.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(expected[i][0], 10);
      expect(y).toBeCloseTo(expected[i][1], 10);
    });
  });

  it('旋转时 center 不变', () => {
    const rect = new Rect({ coor: [[0, 0], [100, 50]] }, 0, base);
    rect.rotation = Math.PI / 3;
    expect(rect.center).toEqual([50, 25]);
  });

  it('已知行为：旋转状态下旋转控制点会丢失 green 标记', () => {
    const rect = new Rect(
      { coor: [[0, 0], [100, 50]], showRotation: true },
      0,
      base,
    );
    rect.rotation = Math.PI / 2;
    const ctrls = rect.ctrlsData;
    expect(ctrls).toHaveLength(9);
    expect(ctrls[8]).toHaveLength(2);
  });
});
