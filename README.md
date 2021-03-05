# canvas-select 标注插件

```html
<body>
  <div class="container"></div>
</body>
<script src="../lib/canvas-select.min.js"></script>
<script>
  const canvasSelect = new CanvasSelect(".container");
  canvasSelect.setData([
    {
      name: "火车",
      coor: [
        [10, 10],
        [100, 100],
      ],
    },
    {
      name: "房屋",
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
    // window.target.name="新label"
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
