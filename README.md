# canvas-select 标注插件

使用 canvas 图形标注

## 快捷键

`shift`+`Backspace` 删除选中矩形

`shift`+`ArrowDown` 下移选中矩形

`shift`+`ArrowUp` 上移选中矩形

`shift`+`ArrowLeft` 左移选中矩形

`shift`+`ArrowRight` 右移选中矩形

## 使用

```html
<body>
  <div class="container"></div>
</body>
<script src="../lib/canvas-select.min.js"></script>
<script>
  const canvasSelect = new CanvasSelect(".container");
  canvasSelect.setData([
    {
      label: "火车",
      coor: [
        [10, 10],
        [100, 100],
      ],
    },
    {
      label: "房屋",
      coor: [
        [20, 20],
        [300, 80],
      ],
    },
  ]);
  canvasSelect.on("delete", function (info) {
    console.log("delete", info);
  });
  canvasSelect.on("select", function (info) {
    console.log("select", info);
    // 添加label
    // window.target = info;
    // window.target.label="新label"
    // canvasSelect.update()
  });
  canvasSelect.on("error", function (info) {
    console.log("error", info);
  });
  canvasSelect.on("update", function (info) {
    console.log("update", info);
  });
</script>
```
