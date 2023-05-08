# canvas-select

一个用于图片标注的 javascript 库，基于 canvas，简单轻量，支持矩形、多边形、点、折线、圆形标注。

> A lightweight image annotation javascript library that supports rectangles, polygons, points, polylines, circles, and re-editing, making image annotation easier.

[![NPM version](https://img.shields.io/npm/v/canvas-select.svg?style=flat)](https://npmjs.org/package/canvas-select)
[![NPM downloads](http://img.shields.io/npm/dm/canvas-select.svg?style=flat)](https://npmjs.org/package/canvas-select)

查看示例 👉 [demo](https://codepen.io/heylight/pen/VwbQLje)

![图例](https://cdn.jsdelivr.net/npm/@heylight/cdn@%5E1/img/demo.png)

## 简介

- 支持矩形标注、多边形标注、点标注、折线标注、圆形标注。

- 支持拖拽、缩放。

- 支持控制点编辑。

- 支持全局样式设置，单个形状样式设置。

- 支持添加、编辑标签。

- 支持桌面端和移动端。

- 每个形状有唯一 uuid，没有则自动生成。

## 使用

- 设置 instance.createType 指定需要创建形状类型，不创建时需要设置为 0。

- 创建矩形时，按住鼠标左键拖动完成创建。

- 创建多边形或折线时，鼠标左键单击添加点，双击完成创建，`Escape`退出创建，`Backspace`退一步删除选择点。

- 创建点时，鼠标左键点击完成创建。

- 创建圆时，按住鼠标左键拖动完成创建。

- 按住鼠标右键拖动画布。

- 鼠标滚轮缩放画布。

- 选中形状，`Backspace`删除。

- 通过 `instance.dataset`或者监听`updated`事件回调参数查看标注结果。

支持 UMD 模块规范

```html
<script src="https://unpkg.com/canvas-select@^2/lib/canvas-select.min.js"></script>
```

```bash
npm install canvas-select --save
```

```html
<canvas class="container"></canvas>
```

```ts
// 构造器
// 第一个参数为css选择器或者HTMLCanvasElement
// 第二个参数为图片链接
const instance = new CanvasSelect(".container", "/one.jpg");
// or
// const instance = new CanvasSelect('.container');
// instance.setImage('/one.jpg');

let option = [
  {
    label: "rectangle",
    labelFillStyle: "#f00",
    textFillStyle: "#fff",
    coor: [
      [184, 183],
      [275, 238],
    ], // required
    type: 1, // required
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
    ], // required
    type: 2, // required
  },
  {
    label: "dot",
    coor: [345, 406], // required
    type: 3, // required
  },
  {
    label: "line",
    coor: [
      [470, 155],
      [490, 230],
      [493, 298],
    ], // required
    type: 4, // required
  },
  {
    label: "circle",
    coor: [369, 197], // required
    radius: 38, // required
    type: 5, // required
  },
];
// 加载数据
instance.setData(option);
// 0 不创建(默认)，1创建矩形，2创建多边形，3点标注，4折线标注，5圆形标注
instance.createType = 1;
instance.on("select", (info) => {
  console.log("select", info);
  // 可对选中对参数info进行修改
  // 修改标签：info.label="hello"
  // 单个形状修改填充颜色：info.fillStyle="#0f0"
  // 然后调用instance.update()更新视图
});
```

## 实例属性

对任意属性的修改都需要调用`instance.update()`更新视图

| 属性名称          |  类型   |       默认值        | 单个形状属性修改 |                           说明                           |
| ----------------- | :-----: | :-----------------: | :--------------: | :------------------------------------------------------: |
| createType        | boolean |          0          |                  | 0 不创建(拖拽)，1 创建矩形，2 多边形，3 点，4 折线，5 圆 |
| lock              | boolean |        false        |                  |                         锁定画布                         |
| scrollZoom        | boolean |        true         |                  |                         滚动缩放                         |
| MIN_WIDTH         | number  |         10          |                  |                       最小矩形宽度                       |
| MIN_HEIGHT        | number  |         10          |                  |                       最小矩形高度                       |
| MIN_RADIUS        | number  |          5          |                  |                       最小圆形半径                       |
| strokeStyle       | string  |        #0f0         |       支持       |                       形状边线颜色                       |
| lineWidth         | number  |          1          |       支持       |                       形状边线宽度                       |
| fillStyle         | string  | rgba(0, 0, 255,0.1) |       支持       |                       形状填充颜色                       |
| activeStrokeStyle | string  |        #f00         |                  |                    选中的形状边线颜色                    |
| activeFillStyle   | string  |        #f00         |                  |                    选中的形状填充颜色                    |
| ctrlStrokeStyle   | string  |        #000         |                  |                      控制点边线颜色                      |
| ctrlFillStyle     | string  |        #fff         |                  |                      控制点填充颜色                      |
| ctrlRadius        | number  |          3          |                  |                        控制点半径                        |
| hide              | boolean |        false        |       支持       |                 是否在画布中显示指定标注                 |
| label             | string  |         无          |                  |                         标签名称                         |
| hideLabel         | string  |        false        |       支持       |                     是否隐藏标签名称                     |
| labelFillStyle    | string  |        #fff         |       支持       |                      label 填充颜色                      |
| labelFont         | string  |   10px sans-serif   |       支持       |                        label 字体                        |
| textFillStyle     | string  |        #000         |       支持       |                      label 文字颜色                      |
| labelMaxLen       | number  |         10          |                  |       label 字符最大显示个数，超出字符将用...表示        |
| alpha             | boolean |        true         |                  |         设置为 false 可以帮助浏览器进行内部优化          |
| focusMode         | boolean |        false        |                  |     专注模式，开启后只有活动状态的标签会显示到画布中     |

## 实例方法

| 方法名称      |    参数类型     |                 说明                  |
| ------------- | :-------------: | :-----------------------------------: |
| setImage      |     string      |             添加/切换图片             |
| setData       | Array\<Shape\>  |             加载初始数据              |
| setScale      |     boolean     |     true 放大画布，false 缩小画布     |
| fitZoom       |       无        |      适配图片到画布 （contain）       |
| update        |       无        | 更新画布， 修改实例属性后要执行此方法 |
| deleteByIndex |     number      |           根据索引删除形状            |
| setFocusMode  |     boolean     |             设置专注模式              |
| on            | string,function |               监听事件                |
| resize        |       无        |           重新设置画布大小            |
| destroy       |       无        |               销毁实例                |

## 事件

| 事件名称 |      回调参数       |     说明     |
| -------- | :-----------------: | :----------: |
| select   |   info 选中的数据   |   选择标注   |
| add      |   info 添加的数据   |     添加     |
| delete   |   info 删除的数据   |     删除     |
| updated  | result 全部标注结果 |   画布更新   |
| load     |    img 图片链接     | 图片加载完成 |
| warn     |    msg 警告信息     |     警告     |
