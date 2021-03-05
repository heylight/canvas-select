# mark-image 图片标注插件

基于 canvas 进行图片标注，独立 umd 模块，轻量(13kb)不依赖第三方库

## 功能

1. 鼠标左键拖动开始标注
2. 滚轮缩放标注画布
3. 鼠标右键移动拖动画布
4. 选中标注框，方向键位移

![](https://heylight.github.io/images/demo.png)

## 引入

```html
<script src="mark-image.min.js"></script>
<script>
  var markImage = new MarkImage({
    el: ".container",
    imageSrc: "./test1.jpg",
  });
</script>
```

or

```
npm i mark-image
```

```js
import MarkImage from "mark-image";
// ...
```

## 使用

```javascript
const markImage = new MarkImage({
  el: ".container", // 挂载节点 等同document.querySelector()参数 （必填）
  imageSrc: "./source.jpg", // 引入需要标注的图片 (必填)
  data: [
    // 初始化默认的标注位置
    [461, 348, 573, 467],
    [922, 351, 1019, 469],
    [683, 51, 792, 162],
    [31, 663, 187, 799],
    [656, 677, 797, 812],
    [41, 139, 173, 244],
    [842, 682, 991, 846],
  ],
  lock: false, // 是否禁用标注
  label: {
    show: true,
    stroke: "#000",
    fill: "#fac031",
  },
  pixel: {
    // 标注像素
    show: true,
    fill: "rgba(0,0,0,0.6)",
  },
  limitSize: {
    // 最小标注尺寸
    minWidth: 10,
    minHeight: 10,
  },
  activeRect: {
    // 活动选框样式
    stroke: "#67C23A",
    lineDash: [4, 2],
    lineDashOffset: 2,
  },
  rect: {
    // 已选标注框样式
    fill: "rgba(247,200,4,0.2)",
    stroke: "rgba(247,200,4,1)",
  },
  onload() {}, // 图片加载完成
  onselect(index, coor) {
    // 输出当前选中的标注矩形，参数 index为索引,coor为坐标
    console.log(index, coor);
  },
  onresult(list) {
    // 输出标注的矩形列表，也可以直接通过markImage.dataset获取
    console.log(list);
  },
});
```

### 方法

```js
// 适配图片到画布中，推荐插件初次实例化之后执行此方法
markImage.fitting();
// 放大
markImage.zoomIn();
// 缩小
markImage.zoomOut();
// 删除
markImage.remove(index);
```
