# canvas-select 标注插件

>用于AI平台图片标注，视频帧标注等。

## 使用
为了提高绘制性能，使用该插件需要对标注图片与canvas进行定位布局。

1. 等待图片img标签加载(onload)完成,获取图片的实际width,height，

2. 设置canvas的width,height与图片相同，

3. 将canvas标签定位到图片正上方，

4. 实例化插件。

可对instance.canvas监听事件，根据使用场景进一步扩展方法。
```
npm i canvas-select
```
```html
<canvas width="500" height="500" class="container"></canvas>
```
```js
   const instance = new CanvasSelect(".container");
  // 实例对象属性可自定义
  // instance.MIN_WIDTH = 10 // 框选最小宽度
  // instance.MIN_HEIGHT = 10 // 框选最小高度
  // instance.CTRL_R = 5 // 控制点半径
  // instance.activeStrokeStyle = '#f00'
  // instance.activeFillStyle = 'rgba(255, 0, 0,0.1)'
  // instance.strokeStyle = 'rgba(0, 0, 255)'
  // instance.fillStyle = 'rgba(0, 0, 255,0.1)'
  let option=[
      {
        label: "你好", // label (非必填)
        type: 1, // 矩形 （必填）
        coor: [  // 矩形坐标，由2个点表示 (必填)
          [10, 10],
          [100, 100],
        ],
      },
      {
        label: "世界",
        type: 2, // 多边形
        coor: [ // 多边形坐标，由3个点以上表示 (必填)
          [30, 150],
          [120, 100],
          [50, 200],
        ],
      },
      ,
      {
        type: 2, // 多边形
        coor: [
          [230, 150],
          [320, 100],
          [250, 200],
        ],
      },
    ]
    instance.setData(option);
    // 0 不创建，1创建矩形，2创建多边形
    instance.createType = 1
    // 选中
    instance.on("select", (info) => {
      console.log("select", info);
      // 可对选中对参数info进行修改
      // 调用instance.update()更新视图
    });
    // 添加
    instance.on("add", (info) => {
      console.log("add", info);
    });
    // data更新
    instance.on("update", function () {
      console.log("update");
    });
    // resize
    instance.on("resize", function (info) {
      console.log("resize", info);
    });
```
