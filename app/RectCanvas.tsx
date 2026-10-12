"use client";

import { useEffect, useRef } from "react";
import type { Rectangle } from "./types";

type Props = {
  rectangles: Rectangle[];
  width?: number;
  height?: number;
};

const PADDING_RATIO = 0.15;

export default function RectCanvas({
  rectangles,
  width = 640,
  height = 440,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Determine data bounds across all rectangles, then pad them.
    const xs = rectangles.flatMap((r) => [r.bottom_left.x, r.top_right.x]);
    const ys = rectangles.flatMap((r) => [r.bottom_left.y, r.top_right.y]);
    const minX = Math.min(...xs, 0);
    const maxX = Math.max(...xs, 0);
    const minY = Math.min(...ys, 0);
    const maxY = Math.max(...ys, 0);

    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const padX = spanX * PADDING_RATIO;
    const padY = spanY * PADDING_RATIO;

    const viewMinX = minX - padX;
    const viewMaxX = maxX + padX;
    const viewMinY = minY - padY;
    const viewMaxY = maxY + padY;

    const toCanvas = (x: number, y: number) => ({
      x: ((x - viewMinX) / (viewMaxX - viewMinX)) * width,
      // Flip y: data y grows up, canvas y grows down.
      y: height - ((y - viewMinY) / (viewMaxY - viewMinY)) * height,
    });

    ctx.clearRect(0, 0, width, height);

    // Grid lines at every integer step.
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 1;
    for (let gx = Math.ceil(viewMinX); gx <= Math.floor(viewMaxX); gx++) {
      const { x } = toCanvas(gx, 0);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let gy = Math.ceil(viewMinY); gy <= Math.floor(viewMaxY); gy++) {
      const { y } = toCanvas(0, gy);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes through the origin.
    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 1.5;
    const origin = toCanvas(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();

    // Axis tick labels at every integer step.
    ctx.fillStyle = "#666666";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let gx = Math.ceil(viewMinX); gx <= Math.floor(viewMaxX); gx++) {
      if (gx === 0) continue;
      const { x } = toCanvas(gx, 0);
      ctx.fillText(String(gx), x, origin.y + 4);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let gy = Math.ceil(viewMinY); gy <= Math.floor(viewMaxY); gy++) {
      if (gy === 0) continue;
      const { y } = toCanvas(0, gy);
      ctx.fillText(String(gy), origin.x - 6, y);
    }

    // The rectangles.
    for (const rect of rectangles) {
      const bl = toCanvas(rect.bottom_left.x, rect.bottom_left.y);
      const tr = toCanvas(rect.top_right.x, rect.top_right.y);
      const rx = Math.min(bl.x, tr.x);
      const ry = Math.min(bl.y, tr.y);
      const rw = Math.abs(tr.x - bl.x);
      const rh = Math.abs(tr.y - bl.y);

      ctx.fillStyle = rect.color;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = rect.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(rx, ry, rw, rh);
    }
  }, [rectangles, width, height]);

  return <canvas ref={canvasRef} />;
}
