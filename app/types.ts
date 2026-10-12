export type Point = { x: number; y: number };

export type Rectangle = {
  bottom_left: Point;
  top_right: Point;
  color: string;
};
