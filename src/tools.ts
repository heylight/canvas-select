export function createUuid(): string {
  const s: any[] = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    const m = Math.floor(Math.random() * 0x10);
    s[i] = hexDigits.slice(m, m + 1);
  }
  s[14] = "4";
  const n = (s[19] & 0x3) | 0x8;
  s[19] = hexDigits.slice(n, n + 1);
  s[8] = s[13] = s[18] = s[23] = "-";
  const uuid = s.join("");
  return uuid;
}

/**
 * 判断图形是否符合嵌套关系, 业务需求：只需要判断shape2是否在shape1内部即可
 * (目前只支持 矩形 多边形的判断)
 * @param shape1 参数1
 * @param shape2 参数2
 * @reutrn Boolean 符合条件返回true 否则返回false
 */

export function isNested(shape1: any, shape2: any): boolean {
  if (shape1.type === 1 && shape2.type === 1) {
    // 矩形和矩形的判断逻辑
    const [[x1, y1], [x2, y2]] = shape1.coor;
    const [[x3, y3], [x4, y4]] = shape2.coor;

    // if (x1 >= x3 && y1 >= y3 && x2 <= x4 && y2 <= y4) {
    //   return true; // shape1 嵌套在 shape2 内部
    // } else
    if (x1 <= x3 && y1 <= y3 && x2 >= x4 && y2 >= y4) {
      return true; // shape2 嵌套在 shape1 内部
    } else {
      return false; // 两个矩形没有嵌套关系
    }
  } else if (shape1.type === 1 && shape2.type === 2) {
    // 矩形和多边形的判断逻辑
    const [[x1, y1], [x2, y2]] = shape1.coor;
    const vertices = shape2.coor;

    for (let i = 0; i < vertices.length; i++) {
      const [x, y] = vertices[i];
      if (x < x1 || x > x2 || y < y1 || y > y2) {
        return false; // 多边形的顶点在矩形外部，不嵌套
      }
    }

    return true; // 所有顶点都在矩形内部，嵌套关系成立
  } else if (shape1.type === 2 && shape2.type === 1) {
    // 多边形和矩形的判断逻辑
    const [[x1, y1], [x2, y2]] = shape2.coor;
    const vertices = shape1.coor;

    for (let i = 0; i < vertices.length; i++) {
      const [x, y] = vertices[i];
      if (x < x1 || x > x2 || y < y1 || y > y2) {
        return true; // 多边形的顶点在矩形外部，嵌套关系成立
      }
    }

    return false; // 所有顶点都在矩形内部，不嵌套
  } else if (shape1.type === 2 && shape2.type === 2) {
    // 多边形和多边形的判断逻辑
    const vertices1 = shape1.coor;
    const vertices2 = shape2.coor;

    // for (let i = 0; i < vertices1.length; i++) {
    //   const [x, y] = vertices1[i];
    //   if (!isPointInPolygon(x, y, vertices2)) {
    //     return false; // 多边形1的顶点不都在多边形2内部，不嵌套
    //   }
    // }

    for (let i = 0; i < vertices2.length; i++) {
      const [x, y] = vertices2[i];
      if (!isPointInPolygon(x, y, vertices1)) {
        return false; // 多边形2的顶点不都在多边形1内部，不嵌套
      }
    }

    return true; // 两个多边形的顶点都在对方内部，嵌套关系成立
  }
}

function isPointInPolygon(x: number, y: number, vertices: any) {
  let inside = false;
  const n = vertices.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = vertices[i];
    const [xj, yj] = vertices[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}
