# canvas-select

一个用于图片标注的 javascript 库，基于 canvas，简单轻量，支持矩形、多边形、点、折线、圆形标注、网格标注。

[![NPM version](https://img.shields.io/npm/v/canvas-select.svg?style=flat)](https://npmjs.org/package/canvas-select)
[![NPM downloads](http://img.shields.io/npm/dm/canvas-select.svg?style=flat)](https://npmjs.org/package/canvas-select)

查看示例 👉 [demo](https://codepen.io/heylight/pen/VwbQLje)

![图例](https://cdn.jsdelivr.net/npm/@heylight/cdn@%5E1/img/demo.png)

## ✨ 特性 (Features)

- **多种标注类型**：支持矩形、多边形、点、折线、圆形及网格标注。
- **交互友好**：支持拖拽画布、缩放画布、拖动形状。
- **灵活编辑**：支持控制点编辑，方便调整标注细节。
- **样式自定义**：支持全局样式设置及单个形状的个性化样式设置。
- **标签管理**：支持为标注添加和编辑标签。
- **跨平台兼容**：良好支持桌面端和移动端设备。
- **唯一标识**：每个形状拥有唯一的 UUID，若未提供则自动生成。

## 🚀 安装 (Installation)

您可以通过以下任一方式将 `canvas-select` 集成到您的项目中：

### 通过 CDN (UMD)

直接在 HTML 文件中引入：

```html
<script src="https://unpkg.com/canvas-select@^2/lib/canvas-select.min.js"></script>
```

### 通过 npm/yarn

```bash
npm install canvas-select --save
# 或者
yarn add canvas-select
```

## 🛠️ 使用方法 (Usage)

### 1. HTML 结构

在您的 HTML 文件中准备一个 `<canvas>` 元素：

```html
<canvas class="container"></canvas>
```

### 2. 初始化实例

确保在 DOM 加载完成后初始化 `CanvasSelect` 实例。

```javascript
// 等待挂载节点就绪
const instance = new CanvasSelect(".container", "/path/to/your/image.jpg");

// 或者先创建实例，后设置图片
// const instance = new CanvasSelect('.container');
// instance.setImage('/path/to/your/image.jpg');
```

### 3. 加载标注数据 (可选)

如果您有已存在的标注数据，可以使用 `setData` 方法加载：

```javascript
const initialData = [
  {
    label: "rectangle",
    labelFillStyle: "#f00",
    textFillStyle: "#fff",
    coor: [
      [184, 183],
      [275, 238],
    ], // 必需
    type: 1, // 必需 (1: 矩形)
  },
  {
    label: "polygon",
    coor: [
      [135, 291],
      [129, 319],
      [146, 346],
      [174, 365],
      [214, 362],
      [196, 337],
      [161, 288],
    ], // 必需
    type: 2, // 必需 (2: 多边形)
  },
  {
    label: "dot",
    coor: [345, 406], // 必需
    type: 3, // 必需 (3: 点)
  },
  {
    label: "line",
    coor: [
      [470, 155],
      [490, 230],
      [493, 298],
    ], // 必需
    type: 4, // 必需 (4: 折线)
  },
  {
    label: "circle",
    coor: [369, 197], // 必需
    radius: 38, // 必需
    type: 5, // 必需 (5: 圆形)
  },
  {
    label: "网格",
    coor: [
      [419, 40],
      [539, 101],
    ],
    type: 6, // (6: 网格)
    row: 3,
    col: 2,
    selected: [4],
  },
];
instance.setData(initialData);
```

### 4. 创建新的标注

通过设置 `instance.createType` 属性来指定要创建的标注类型：

- `0`: 不创建 (默认值，此时为画布拖拽模式)
- `1`: 创建矩形
- `2`: 创建多边形
- `3`: 创建点
- `4`: 创建折线
- `5`: 创建圆形
- `6`: 创建网格

```javascript
instance.createType = 1; // 准备创建矩形
```

**操作指南：**

- **矩形**：按住鼠标左键拖动完成创建。
- **多边形/折线**：鼠标左键单击添加点，再次点击起始点闭合（多边形）或双击完成创建。按 `Escape` 键退出创建，按 `Backspace` 键删除上一个点。
- **点**：鼠标左键单击完成创建。
- **圆**：按住鼠标左键拖动，确定圆心和半径后松开完成创建。
- **网格**：鼠标右键点击目标区域，在弹出的提示框中输入行列数。双击网格单元格进行选中/取消选中。

### 5. 画布与形状交互

- **拖动画布**：按住鼠标右键并拖动。
- **拖动形状**：拖动选中的形状。
- **缩放画布**：使用鼠标滚轮进行缩放 (可通过 `scrollZoom` 属性控制是否启用)。
- **删除形状**：选中一个形状后，按 `Backspace` 键删除。

### 6. 事件监听

监听实例事件以获取标注过程中的信息：

```javascript
instance.on("select", (selectedShapeInfo) => {
  console.log("选中了形状:", selectedShapeInfo);
  // 可以修改选中形状的属性，例如：
  // selectedShapeInfo.label = "新标签";
  // selectedShapeInfo.fillStyle = "#00ff00"; // 修改填充色
  // 修改后需要调用 update 方法更新视图
  // instance.update();
});

instance.on("updated", (allShapesData) => {
  console.log("画布数据已更新:", allShapesData);
  // allShapesData 即为 instance.dataset 的内容
});
```

## ⚠️ 注意事项 (Important Notes)

1. **Canvas 样式**：不要在 `<canvas>` 标签上直接设置 `style` 属性来定义宽高，推荐使用 CSS 类或通过 JavaScript 设置其 `width` 和 `height` 属性。
2. **框架集成**：如果您在 Vue, React, Angular 等框架中使用本库，请确保在组件的生命周期钩子函数（例如 `mounted` 或 `useEffect`）中，即 DOM 元素实际可用之后，再创建 `CanvasSelect` 实例。

## 📚 API 参考 (API Reference)

对实例属性的任何修改，都需要调用 `instance.update()` 方法来更新画布视图。

### 实例属性 (Instance Properties)

| 属性名称                |   类型    |          默认值          | 单个形状属性修改 | 说明                                                                        |
| ----------------------- | :-------: | :----------------------: | :--------------: | :-------------------------------------------------------------------------- |
| `createType`            | `number`  |           `0`            |                  | `0` 不创建 (拖拽)，`1` 矩形，`2` 多边形，`3` 点，`4` 折线，`5` 圆，`6` 网格 |
| `lock`                  | `boolean` |         `false`          |                  | 锁定画布，禁止所有交互                                                      |
| `readonly`              | `boolean` |         `false`          |                  | 仅查看模式，禁止编辑                                                        |
| `scrollZoom`            | `boolean` |          `true`          |                  | 是否允许鼠标滚轮缩放画布                                                    |
| `showCross`            | `boolean` |          `false`          |                  | 是否展示十字坐标线                                                             |
| `MIN_WIDTH`             | `number`  |           `10`           |                  | 矩形最小宽度                                                                |
| `MIN_HEIGHT`            | `number`  |           `10`           |                  | 矩形最小高度                                                                |
| `MIN_RADIUS`            | `number`  |           `5`            |                  | 圆形最小半径                                                                |
| `strokeStyle`           | `string`  |          `#0f0`          |       支持       | 形状边框颜色                                                                |
| `lineWidth`             | `number`  |           `1`            |       支持       | 形状边框宽度                                                                |
| `fillStyle`             | `string`  |  `rgba(0, 0, 255,0.1)`   |       支持       | 形状填充颜色                                                                |
| `activeStrokeStyle`     | `string`  |          `#f00`          |                  | 选中形状的边框颜色                                                          |
| `activeFillStyle`       | `string`  |          `#f00`          |                  | 选中形状的填充颜色 (通常与 `activeStrokeStyle` 一致以高亮显示)              |
| `ctrlStrokeStyle`       | `string`  |          `#000`          |                  | 控制点边框颜色                                                              |
| `ctrlFillStyle`         | `string`  |          `#fff`          |                  | 控制点填充颜色                                                              |
| `ctrlRadius`            | `number`  |           `3`            |                  | 控制点半径                                                                  |
| `hide`                  | `boolean` |         `false`          |       支持       | 是否在画布中隐藏指定标注                                                    |
| `label`                 | `string`  |           `无`           |       支持       | 标签名称                                                                    |
| `hideLabel`             | `boolean` |         `false`          |       支持       | 是否隐藏标签名称                                                            |
| `labelUp`               | `boolean` |         `false`          |       支持       | 标签是否显示在形状上方                                                      |
| `labelFillStyle`        | `string`  |          `#fff`          |       支持       | 标签背景填充颜色                                                            |
| `labelFont`             | `string`  |    `10px sans-serif`     |       支持       | 标签字体样式                                                                |
| `textFillStyle`         | `string`  |          `#000`          |       支持       | 标签文字颜色                                                                |
| `labelMaxLen`           | `number`  |           `10`           |                  | 标签字符最大显示数量，超出部分将用 `...` 表示                               |
| `alpha`                 | `boolean` |          `true`          |                  | 设置为 `false` 可以帮助浏览器进行内部优化 (例如，如果不需要透明度)          |
| `focusMode`             | `boolean` |         `false`          |                  | 专注模式，开启后只有活动状态的标注会完整显示，其他标注可能半透明或隐藏      |
| `gridMenuEnable`        | `boolean` |          `true`          |                  | 网格标注时是否启用右键 `prompt` 输入框，可关闭以使用自定义右键菜单          |
| `gridSelectedFillStyle` | `string`  | `rgba(255, 255, 0, 0.6)` |       支持       | 网格标注中选中单元格的填充颜色                                              |
| `crossStroke`           | `string`  | `#ff0`                   |                          | 十字标尺颜色                                            |

### 实例方法 (Instance Methods)

| 方法名称                  |      参数类型      |                    说明                     |
| ------------------------- | :----------------: | :-----------------------------------------: |
| `setImage(url)`           |      `string`      |             添加或切换背景图片              |
| `setData(data)`           |   `Array<Shape>`   |      加载初始标注数据，会覆盖现有数据       |
| `setScale(zoomIn)`        |     `boolean`      |      `true` 放大画布，`false` 缩小画布      |
| `fitZoom()`               |       `void`       | 适配图片到画布使其完整可见 (类似 `contain`) |
| `update()`                |       `void`       |   更新画布，修改实例属性后必须调用此方法    |
| `deleteByIndex(index)`    |      `number`      |            根据索引删除指定形状             |
| `deleteByUuid(uuid)`      |      `string`      |           根据 UUID 删除指定形状            |
| `setFocusMode(enable)`    |     `boolean`      |             设置或取消专注模式              |
| `on(eventName, callback)` | `string, Function` |                监听实例事件                 |
| `resize()`                |       `void`       |  当 Canvas 尺寸变化时，调用此方法重新计算   |
| `destroy()`               |       `void`       |             销毁实例，释放资源              |

### 事件 (Events)

| 事件名称  |        回调参数         |                                 说明                                  |
| --------- | :---------------------: | :-------------------------------------------------------------------: |
| `select`  |   `info` (选中的数据)   |                       当用户选择一个标注时触发                        |
| `add`     |   `info` (添加的数据)   |                   当一个新的标注被添加到画布时触发                    |
| `delete`  |   `info` (删除的数据)   |                    当一个标注从画布上被删除时触发                     |
| `updated` | `result` (全部标注结果) | 当画布内容更新后触发 (例如，创建、删除、修改标注或调用 `update()` 后) |
| `load`    | `img` (图片元素或链接)  |                        背景图片加载完成时触发                         |
| `warn`    |    `msg` (警告信息)     |                  当发生非严重错误或有警告信息时触发                   |

## 温馨提示 (Tips)

本项目的开源协议旨在促进技术共享与协作创新。您可以在遵守协议基本要求（包含版权声明）的前提下，自由地进行二次开发和商业应用。我们相信开放的生态能为社区带来更大价值。
