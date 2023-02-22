# canvas-select

一个用于图片标注的javascript库，基于canvas，简单轻量，支持矩形、多边形、点、折线、圆形标注。

[![NPM version](https://img.shields.io/npm/v/canvas-select.svg?style=flat)](https://npmjs.org/package/canvas-select)
[![NPM downloads](http://img.shields.io/npm/dm/canvas-select.svg?style=flat)](https://npmjs.org/package/canvas-select)

查看示例[demo](https://codepen.io/heylight/pen/VwbQLje)

![图例](https://cdn.jsdelivr.net/npm/@heylight/cdn@%5E1/img/demo.png)

## 简介

- 支持矩形标注、多边形标注、点标注、折线标注、圆形标注。

- 支持拖拽、缩放。

- 支持控制点编辑。

- 支持全局样式设置，单个形状样式设置。

- 支持添加、编辑标签。

- 每个形状有唯一 uuid，没有则自动生成。

## 1、使用

- 设置 instance.createType 指定需要创建形状类型。

- 创建矩形时，按住鼠标左键拖动完成创建。

- 创建多边形时，鼠标左键单击添加点，双击闭合完成创建，`Escape`退出创建，`Backspace`退一步删除选择点。

- 按住鼠标右键拖动画布。

- 鼠标滚轮缩放画布。

- 选中形状，`Backspace`删除。

- `通过 instance.dataset 查看标注结果`。

支持 UMD 模块规范

```html
<script src="https://unpkg.com/canvas-select@^2/lib/canvas-select.min.js"></script>
```

```bash
npm i canvas-select --save
```

注意: 画布尺寸不要使用css或者style定义

```html
<canvas width="500" height="500" class="container"></canvas>
```

```js
// 构造函数CanvasSelect 参数1表示canvas dom节点，可选参数2表示需要标注的图片链接
const instance = new CanvasSelect('.container', '/one.jpg');
// or
// const instance = new CanvasSelect('.container');
// instance.setImage('/one.jpg')

let option = [
  {
    label: '矩形标注', // label (非必填)
    type: 1, // 矩形 （必填）
    coor: [
      // 矩形坐标，由2个点表示 (必填)
      [10, 10],
      [100, 100],
    ],
  },
  {
    label: '多边形标注',
    type: 2, // 多边形 （必填）
    coor: [
      // 多边形坐标，由3个以上点表示 (必填)
      [30, 150],
      [120, 100],
      [50, 200],
    ],
  },
  {
    label: '点标注',
    type: 3, // 点标注 （必填）
    coor: [800, 800],
  },
  {
    label: '折线标注',
    type: 4, // 折线标注 （必填）
    coor: [
      // 由2个以上点表示 (必填)
      [30, 150],
      [120, 100],
      [50, 200],
    ],
  },
    {
    label: '圆形标注',
    type: 5, // 折线标注 （必填）
    coor: [800, 800],
    radius:50
  },
];
// 加载数据
instance.setData(option);
// 0 不创建(默认)，1创建矩形，2创建多边形，3点标注，4折线标注，5圆形标注
instance.createType = 1;
instance.on('select', (info) => {
  console.log('select', info);
  // 可对选中对参数info进行修改
  // 修改标签：info.label="hello"
  // 单个形状修改填充颜色：info.fillStyle="#0f0"
  // 然后调用instance.update()更新视图
});
```

## 2、实例属性

对任意属性的修改都需要调用`instance.update()`更新视图

| 属性名称          |  类型   |       默认值        | 单个形状属性修改 |                     说明                     |
| ----------------- | :-----: | :-----------------: | :--------------: | :------------------------------------------: |
| createType        | boolean |          0          |                  | 0 不创建，1 创建矩形，2 多边形，3 点，4 折线，5圆 |
| lock              | boolean |        false        |                  |                 锁定画布                 |
| scrollZoom        | boolean |        true         |                  |                 滚动缩放                 |
| MIN_WIDTH         | number  |         10          |                  |                 最小矩形宽度                 |
| MIN_HEIGHT        | number  |         10          |                  |                 最小矩形高度                 |
| MIN_RADIUS        | number  |         5           |                  |                 最小圆形半径               |
| strokeStyle       | string  |       #0f0          |       支持       |                 形状边线颜色                 |
| fillStyle         | string  | rgba(0, 0, 255,0.1) |       支持       |                 形状填充颜色                 |
| activeStrokeStyle | string  |        #f00         |                  |              选中的形状边线颜色              |
| activeFillStyle   | string  |        #f00         |                  |              选中的形状填充颜色              |
| ctrlStrokeStyle   | string  |        #000         |                  |                控制点边线颜色                |
| ctrlFillStyle     | string  |        #fff         |                  |                控制点填充颜色                |
| ctrlRadius        | number  |          3          |                  |                  控制点半径                  |
| labelFillStyle    | string  |        #fff         |       支持       |                label 填充颜色                |
| labelFont         | string  |   10px sans-serif   |       支持       |                label  字体               |
| textFillStyle     | string  |        #000         |       支持       |                label 文字颜色                |
| labelMaxLen       | number  |          5          |                  | label 字符最大显示个数，超出字符将用...表示  |
| alpha             | boolean  |        true          |                |     设置为false可以帮助浏览器进行内部优化    |

## 3、实例方法

| 方法名称      | 参数类型 |                 说明                  |
| ------------- | :------: | :-----------------------------------: |
| setImage      |  string  |             添加/切换图片             |
| setData       |  Array   |             加载初始数据              |
| setScale      | boolean  |     true 放大画布，false 缩小画布     |
| fitZoom       |    无    |      适配图片到画布 （contain）       |
| update        |    无    | 更新画布， 修改实例属性后要执行此方法 |
| deleteByIndex |  number  |           根据索引删除形状            |

## 4、事件

| 事件名称 | 回调参数 |        说明        |
| -------- | :------: | :----------------: |
| select   |   info   |     选中的数据   |
| add      |   info   |     添加的数据   |
| delete   |   info   |     删除的数据   |
| updated  |  result  |   所有标注的结果     |
| load     |  imgSrc  |    图片加载完成    |
| error    |  error   |      错误信息      |
