# canvas-select 标注插件

用于 AI 平台图片标注，视频帧标注等。

![图例](example.png)

## 1、使用

- 设置 instance.createType 指定需要创建形状类型。

- 创建矩形时，按住鼠标左键拖动完成创建。

- 创建多边形时，鼠标左键单击添加点，双击闭合完成创建，`Escape`退出创建，`Backspace`退一步删除选择点。

- 按住鼠标右键拖动画布。

- 鼠标滚轮缩放画布。

- 选中形状，`Backspace`删除

支持 UMD 模块规范

```html
<script src="path/to/canvas-select.min.js"></script>
```

```
npm i canvas-select
```

```html
<canvas width="500" height="500" class="container"></canvas>
```

```js
// 构造函数CanvasSelect 参数1表示canvas dom节点，参数2表示需要标注的图片链接
const instance = new CanvasSelect(".container", "/one.jpg");

let option = [
  {
    label: "你好", // label (非必填)
    type: 1, // 矩形 （必填）
    coor: [
      // 矩形坐标，由2个点表示 (必填)
      [10, 10],
      [100, 100],
    ],
  },
  {
    label: "世界",
    type: 2, // 多边形 （必填）
    coor: [
      // 多边形坐标，由3个以上点表示 (必填)
      [30, 150],
      [120, 100],
      [50, 200],
    ],
  },
  {
    label: "",
    type: 2, // 多边形
    coor: [
      [230, 150],
      [320, 100],
      [250, 200],
    ],
  },
];
instance.on("load", () => {
  // 图片加载完成时候加载数据
  instance.setData(option);
});
// 0 不创建(默认)，1创建矩形，2创建多边形
instance.createType = 1;
instance.on("select", (info) => {
  console.log("select", info);
  // 可对选中对参数info进行修改
  // 例如：info.label="hello"
  // 然后调用instance.update()更新视图
});
```

## 2、实例属性

| 属性名称          |  类型   |       默认值        |                    说明                     |
| ----------------- | :-----: | :-----------------: | :-----------------------------------------: |
| createType        | boolean |          0          |     0 不创建，1 创建矩形，2 创建多边形      |
| lock              | boolean |        false        |                是否锁定画布                 |
| MIN_WIDTH         | number  |         10          |                最小矩形宽度                 |
| MIN_HEIGHT        | number  |         10          |                最小矩形高度                 |
| strokeStyle       | string  |   rgb(0, 0, 255)    |                形状边线颜色                 |
| fillStyle         | string  | rgba(0, 0, 255,0.1) |                形状填充颜色                 |
| activeStrokeStyle | string  |        #f00         |             选中的形状边线颜色              |
| activeFillStyle   | string  |        #f00         |             选中的形状填充颜色              |
| ctrlStrokeStyle   | string  |        #000         |               控制点边线颜色                |
| ctrlFillStyle     | string  |        #fff         |               控制点填充颜色                |
| ctrlRadius        | number  |          3          |                 控制点半径                  |
| labelFillStyle    | string  |        #fff         |               label 填充颜色                |
| labelFont         | string  |   12px serif #000   |               label 文字样式                |
| labelMaxLen       | number  |          5          | label 字符最大显示个数，超出字符将用...表示 |

## 3、实例方法

| 方法名称      | 参数类型 |                 说明                  |
| ------------- | :------: | :-----------------------------------: |
| setData       |  Array   |             加载初始数据              |
| setScale      | boolean  |     true 放大画布，false 缩小画布     |
| fitZoom       |    无    |      适配图片到画布 （contain）       |
| update        |    无    | 更新画布， 修改实例属性后要执行此方法 |
| deleteByIndex |  number  |           根据索引删除形状            |

## 4、事件

| 事件名称 | 回调参数 |        说明        |
| -------- | :------: | :----------------: |
| select   |   info   |   当前选中的数据   |
| add      |   info   |   当前添加的数据   |
| resize   |   info   | 当前正在缩放的数据 |
| load     |    无    |    图片加载完成    |
| update   |    无    |   画布(数据)更新   |
| error    |  error   |      错误信息      |
