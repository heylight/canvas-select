export interface GridHelperOptions {
  /** 是否启用网格辅助线 */
  enabled: boolean;
  /** 网格大小（像素） */
  size: number;
  /** 网格线颜色 */
  color?: string;
  /** 网格线宽度 */
  lineWidth?: number;
  /** 是否显示像素值标尺 */
  showRuler?: boolean;
  /** 标尺背景颜色 */
  rulerBgColor?: string;
  /** 标尺文字颜色 */
  rulerTextColor?: string;
  /** 标尺字体 */
  rulerFont?: string;
  /** 标尺高度/宽度 */
  rulerSize?: number;
}

export default class GridHelper {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: GridHelperOptions;
  private canvasSelect: any; // CanvasSelect 实例

  constructor(canvas: HTMLCanvasElement, options: GridHelperOptions, canvasSelect: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvasSelect = canvasSelect;
    
    // 默认配置
    const defaultOptions = {
      enabled: false,
      size: 50,
      color: 'rgba(0, 0, 0, 0.2)',
      lineWidth: 1,
      showRuler: true,
      rulerBgColor: 'rgba(255, 255, 255, 0.9)',
      rulerTextColor: '#333',
      rulerFont: '10px Arial',
      rulerSize: 20
    };
    
    this.options = { ...defaultOptions, ...options };
  }

  /**
   * 设置网格配置
   */
  setOptions(options: Partial<GridHelperOptions>) {
    this.options = { ...this.options, ...options };
  }

  /**
   * 绘制网格辅助线
   * @param origin 原点坐标 [x, y]
   * @param scale 缩放比例
   */
  draw(origin: [number, number], scale: number) {
    if (!this.options.enabled) return;

    const [originX, originY] = origin;
    const { size, color, lineWidth, showRuler } = this.options;
    
    this.ctx.save();
    
    // 绘制网格线
    this.drawGrid(originX, originY, scale, size, color!, lineWidth!);
    
    // 绘制标尺
    if (showRuler) {
      this.drawRuler(originX, originY, scale, size);
    }
    
    this.ctx.restore();
  }

  /**
   * 绘制网格线
   */
  private drawGrid(originX: number, originY: number, scale: number, size: number, color: string, lineWidth: number) {
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    
    // 计算图片在画布上的实际尺寸和位置
    const imageWidth = this.canvasSelect.IMAGE_WIDTH;
    const imageHeight = this.canvasSelect.IMAGE_HEIGHT;
    
    if (!imageWidth || !imageHeight) return;
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.globalAlpha = 0.3;
    
    // 计算网格在当前缩放下的实际大小
    const gridSize = size * scale;
    
    // 绘制垂直线（包含负值区域）
    const startX = Math.floor(-originX / gridSize) * gridSize + originX;
    for (let x = startX; x <= canvasWidth; x += gridSize) {
      const realPixel = Math.round((x - originX) / scale);
      
      // 在图片区域内使用正常透明度
      if (x >= originX && x <= originX + imageWidth) {
        this.ctx.globalAlpha = 0.5;
      } else {
        // 负值区域和超出图片的区域使用较淡的网格线
        this.ctx.globalAlpha = 0.2;
      }
      
      // 绘制完整的垂直线（从顶部到底部）
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, canvasHeight);
      this.ctx.stroke();
    }
    
    // 绘制水平线（包含负值区域）
    const startY = Math.floor(-originY / gridSize) * gridSize + originY;
    for (let y = startY; y <= canvasHeight; y += gridSize) {
      
      // 在图片区域内使用正常透明度
      if (y >= originY && y <= originY + imageHeight) {
        this.ctx.globalAlpha = 0.5;
      } else {
        // 负值区域和超出图片的区域使用较淡的网格线
        this.ctx.globalAlpha = 0.2;
      }
      
      // 绘制完整的水平线（从左边到右边）
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(canvasWidth, y);
      this.ctx.stroke();
      
    }
    
    this.ctx.globalAlpha = 1;
  }

  /**
   * 绘制标尺
   */
  private drawRuler(originX: number, originY: number, scale: number, gridSize: number) {
    const { rulerBgColor, rulerTextColor, rulerFont, rulerSize } = this.options;
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    
    const imageWidth = this.canvasSelect.IMAGE_WIDTH;
    const imageHeight = this.canvasSelect.IMAGE_HEIGHT;
    const imageOriginWidth = this.canvasSelect.IMAGE_ORIGIN_WIDTH;
    const imageOriginHeight = this.canvasSelect.IMAGE_ORIGIN_HEIGHT;
    
    if (!imageWidth || !imageHeight || !imageOriginWidth || !imageOriginHeight) return;
    
    this.ctx.font = rulerFont!;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const actualGridSize = gridSize * scale;
    
    // 根据缩放比例动态计算标尺刻度显示间隔
    // 当缩放比例较小时，增加间隔以避免文字重叠
    const textDisplayInterval = this.calculateTextDisplayInterval(scale, gridSize);
    
    // 绘制顶部标尺（水平） - 始终显示，不受图片位置影响
    // 扩展标尺背景到整个画布宽度
    this.ctx.fillStyle = rulerBgColor!;
    this.ctx.fillRect(0, 0, canvasWidth, rulerSize!);
    
    // 标尺刻度和数字
    this.ctx.fillStyle = rulerTextColor!;
    this.ctx.strokeStyle = rulerTextColor!;
    this.ctx.lineWidth = 1;
    
    // 计算起始位置，包含负值区域
    const startX = Math.floor(-originX / actualGridSize) * actualGridSize + originX;
    
    for (let x = startX; x <= canvasWidth; x += actualGridSize) {
      // 计算真实像素位置（包含负值）
      const realPixel = Math.round((x - originX) / scale);
      
      // 绘制刻度线
      this.ctx.beginPath();
      this.ctx.moveTo(x, rulerSize! - 5);
      this.ctx.lineTo(x, rulerSize!);
      this.ctx.stroke();
      
      // 根据计算的间隔显示文字，避免重叠
      if (realPixel % textDisplayInterval === 0) {
        // 绘制像素值（包含负值和超出图片范围的正值）
        this.ctx.fillText(realPixel.toString(), x, rulerSize! / 2);
      }
    }
    
    // 绘制左侧标尺（垂直） - 始终显示，不受图片位置影响
    // 扩展标尺背景到整个画布高度
    this.ctx.fillStyle = rulerBgColor!;
    this.ctx.fillRect(0, 0, rulerSize!, canvasHeight);
    
    // 标尺刻度和数字
    this.ctx.fillStyle = rulerTextColor!;
    this.ctx.strokeStyle = rulerTextColor!;
    this.ctx.lineWidth = 1;
    
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // 计算起始位置，包含负值区域
    const startY = Math.floor(-originY / actualGridSize) * actualGridSize + originY;
    
    for (let y = startY; y <= canvasHeight; y += actualGridSize) {
      // 计算真实像素位置（包含负值）
      const realPixel = Math.round((y - originY) / scale);
      
      // 绘制刻度线
      this.ctx.beginPath();
      this.ctx.moveTo(rulerSize! - 5, y);
      this.ctx.lineTo(rulerSize!, y);
      this.ctx.stroke();
      
      // 根据计算的间隔显示文字，避免重叠
      if (realPixel % textDisplayInterval === 0) {
        // 绘制像素值（旋转90度，包含负值）
        this.ctx.save();
        this.ctx.translate(rulerSize! / 2, y);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText(realPixel.toString(), 0, 0);
        this.ctx.restore();
      }
    }
    
    this.ctx.restore();
    
    // 绘制左上角的原点标识 - 始终显示
    this.ctx.fillStyle = rulerBgColor!;
    this.ctx.fillRect(0, 0, rulerSize!, rulerSize!);
    
    this.ctx.fillStyle = rulerTextColor!;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('px', rulerSize! / 2, rulerSize! / 2);
  }

  /**
   * 获取鼠标位置对应的真实像素坐标
   */
  getPixelPosition(mouseX: number, mouseY: number, originX: number, originY: number, scale: number): [number, number] {
    const pixelX = Math.round((mouseX - originX) / scale);
    const pixelY = Math.round((mouseY - originY) / scale);
    return [pixelX, pixelY];
  }

  /**
   * 根据缩放比例计算标尺文字显示间隔
   * 当缩放比例较小时，增加间隔以避免文字重叠
   */
  private calculateTextDisplayInterval(scale: number, gridSize: number): number {
    // 估算文字宽度（像素值的平均字符数 * 每个字符的宽度）
    const avgDigits = 3; // 假设平均3位数字
    
    // 从rulerFont中提取字体大小
    const { rulerFont } = this.options;
    let fontSize = 10; // 默认字体大小
    
    if (rulerFont) {
      // 从字体字符串中提取字体大小（如"10px Arial"中的10）
      const fontSizeMatch = rulerFont.match(/(\d+)px/);
      if (fontSizeMatch && fontSizeMatch[1]) {
        fontSize = parseInt(fontSizeMatch[1], 10);
      }
    }
    
    // 根据字体大小估算字符宽度（一般字符宽度约为字体大小的0.6倍）
    const charWidth = fontSize * 0.6;
    const textWidth = avgDigits * charWidth;
    
    // 计算当前缩放下网格的实际大小
    const actualGridSize = gridSize * scale;
    
    // 如果网格实际大小小于文字宽度的1.5倍，则需要增加间隔
    if (actualGridSize < textWidth * 1.5) {
      // 计算需要跳过多少个刻度才能避免重叠
      // 向上取整以确保足够的间距
      return Math.ceil(textWidth * 1.5 / actualGridSize);
    }
    
    // 默认显示每个刻度的文字
    return 1;
  }

}
