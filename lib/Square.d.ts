import { Shape } from "./Shape";
declare type Dot = [number, number];
declare type Coordinate = [Dot, Dot];
export declare class Square extends Shape {
    data: [Dot, Dot];
    ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D, coor: Coordinate);
    get width(): number;
    get height(): number;
    get ctrlsData(): number[][];
    draw(): void;
}
export {};
