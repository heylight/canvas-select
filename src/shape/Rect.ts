import Shape from './Shape';

export default class Rect extends Shape {
  public type = 1
  /** 旋转角度（弧度） */
  public rotation: number = 0
  /** 是否显示旋转控制点 */
  public showRotation: boolean | undefined
  constructor(item: any, index: number, base: any) {
    super(item, index)
    this.fillStyle = item.fillStyle ?? base.fillStyle
    this.strokeStyle = item.strokeStyle ?? base.strokeStyle
  }
  get ctrlsData() {
    const [[x0, y0], [x1, y1]] = this.coor;
    const centerX = (x0 + x1) / 2;
    const centerY = (y0 + y1) / 2;
    const width = x1 - x0;
    const height = y1 - y0;

    // 基础控制点（8个边角和中点控制点）
    const baseCtrls = [
      [x0, y0],
      [x0 + width / 2, y0],
      [x1, y0],
      [x1, y0 + height / 2],
      [x1, y1],
      [x0 + width / 2, y1],
      [x0, y1],
      [x0, y0 + height / 2]
    ];

    // 如果需要显示旋转控制点，则添加到控制点数组中
    if (this.showRotation) {
      baseCtrls.push([centerX, y0 - 20, 'green']);
    }

    // 如果矩形没有旋转，直接返回控制点
    if (this.rotation === 0) {
      return baseCtrls;
    }

    // 应用旋转变换到所有控制点
    return baseCtrls.map(([x, y]) => {
      // 将点转换为相对于中心点的坐标
      const dx = x - centerX;
      const dy = y - centerY;

      // 应用旋转
      const rotatedX = dx * Math.cos(this.rotation) - dy * Math.sin(this.rotation);
      const rotatedY = dx * Math.sin(this.rotation) + dy * Math.cos(this.rotation);

      // 转换回绝对坐标
      return [rotatedX + centerX, rotatedY + centerY];
    });
  }

  /** 获取矩形的中心点 */
  get center(): [number, number] {
    const [[x0, y0], [x1, y1]] = this.coor;
    return [(x0 + x1) / 2, (y0 + y1) / 2];
  }
}
