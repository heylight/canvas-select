# canvas-select

> A lightweight image annotation javascript library that supports rectangles, polygons, points, polylines, circles, and re-editing, making image annotation easier.

> It's include zoom with panning.
> You can also pass shortcut key to delete annotate data.

[![NPM version](https://img.shields.io/npm/v/canvas-select.svg?style=flat)](https://npmjs.org/package/canvas-select)
[![NPM downloads](http://img.shields.io/npm/dm/canvas-select.svg?style=flat)](https://npmjs.org/package/canvas-select)

[demo](https://codepen.io/heylight/pen/VwbQLje)

!(https://cdn.jsdelivr.net/npm/@heylight/cdn@%5E1/img/demo.png)

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
interface CanvasSelectProps {
  el: string | HTMLCanvasElement; // css选择器或者HTMLCanvasElement
  src: string; // 图片链接
}
const instance = new CanvasSelect(".container", "/one.jpg");

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

instance.setData(option);

instance.createType = 1;
instance.on("select", (info) => {
  console.log("select", info);
});
```

## Update

Call update method`instance.update()`for updating annotation list

## Delete Annotate Data

For deleting annotate data with shortcut you need to pass key code in `instance.RemoveSelectionOnKey="Backspace"`.
