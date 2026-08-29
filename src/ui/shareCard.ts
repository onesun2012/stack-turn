import type { Block } from '../game/session';
import { CONFIG } from '../game/config';
import { layerHue } from '../render/blockFactory';

export const CARD_W = 750;
export const CARD_H = 1334;

/** 部署地址印在卡片上，传播时自带入口；换自定义域名改这里 */
const GAME_URL = 'onesun2012.github.io/stack-turn';

const FONT = 'system-ui, "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif';

export interface ShareData {
  layers: number;
  maxCombo: number;
  isNewBest: boolean;
  tower: Block[];
}

const ISO_COS = Math.cos(Math.PI / 6);
const ISO_SIN = 0.5;

interface Pt { x: number; y: number }

/** 世界坐标 → 等轴测投影（世界 y 向上，屏幕 y 向下） */
function iso(x: number, y: number, z: number): Pt {
  return { x: (x - z) * ISO_COS, y: (x + z) * ISO_SIN - y };
}

type Tuple = [number, number];

function poly(ctx: CanvasRenderingContext2D, pts: Tuple[], fill: string): void {
  ctx.beginPath();
  ctx.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]![0], pts[i]![1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function blockCorners(b: Block, h: number): Pt[] {
  const pts: Pt[] = [];
  for (const dy of [-h / 2, h / 2])
    for (const dx of [-b.width / 2, b.width / 2])
      for (const dz of [-b.depth / 2, b.depth / 2])
        pts.push(iso(b.x + dx, b.y + dy, b.z + dz));
  return pts;
}

function drawBlock(
  ctx: CanvasRenderingContext2D, b: Block, layer: number,
  s: number, offX: number, offY: number,
): void {
  const h = CONFIG.BLOCK_HEIGHT;
  const hue = layerHue(layer);
  const P = (x: number, y: number, z: number): Tuple => {
    const p = iso(x, y, z);
    return [p.x * s + offX, p.y * s + offY];
  };
  const t = b.y + h / 2, bo = b.y - h / 2;
  const x0 = b.x - b.width / 2, x1 = b.x + b.width / 2;
  const z0 = b.z - b.depth / 2, z1 = b.z + b.depth / 2;

  poly(ctx, [P(x0, t, z0), P(x1, t, z0), P(x1, t, z1), P(x0, t, z1)], `hsl(${hue}, 55%, 62%)`); // 顶
  poly(ctx, [P(x1, t, z0), P(x1, t, z1), P(x1, bo, z1), P(x1, bo, z0)], `hsl(${hue}, 55%, 46%)`); // 右
  poly(ctx, [P(x0, t, z1), P(x1, t, z1), P(x1, bo, z1), P(x0, bo, z1)], `hsl(${hue}, 55%, 38%)`); // 左
}

/** 先算包围盒定缩放，再自底向上绘制（画家算法） */
function drawTower(
  ctx: CanvasRenderingContext2D, tower: Block[],
  cx: number, bottomY: number, maxW: number, maxH: number,
): void {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const b of tower) {
    for (const p of blockCorners(b, CONFIG.BLOCK_HEIGHT)) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
  }
  const s = Math.min(maxW / (maxX - minX), maxH / (maxY - minY), 30);
  const offX = cx - ((minX + maxX) / 2) * s;
  const offY = bottomY - maxY * s;

  // 地面柔光
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath();
  ctx.ellipse(cx, bottomY + 14, 200, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < tower.length; i++) {
    drawBlock(ctx, tower[i]!, i, s, offX, offY);
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function renderShareCard(canvas: HTMLCanvasElement, data: ShareData): void {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cx = CARD_W / 2;

  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
  bg.addColorStop(0, '#262640');
  bg.addColorStop(1, '#14141f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#9a9ab0';
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText('叠 转 · S T A C K  T U R N', cx, 130);

  // 大数字 + 单位
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 170px ${FONT}`;
  const numStr = String(data.layers);
  const nw = ctx.measureText(numStr).width;
  ctx.fillText(numStr, cx, 330);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9a9ab0';
  ctx.font = `400 40px ${FONT}`;
  ctx.fillText('层', cx + nw / 2 + 16, 330);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#ffd76e';
  ctx.font = `600 32px ${FONT}`;
  ctx.fillText(`最高连击 ×${data.maxCombo}`, cx, 436);

  if (data.isNewBest) {
    const text = '新纪录！';
    ctx.font = `700 30px ${FONT}`;
    const w = ctx.measureText(text).width + 64;
    roundRectPath(ctx, cx - w / 2, 487, w, 58, 29);
    ctx.fillStyle = 'rgba(255, 215, 110, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#ffd76e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffd76e';
    ctx.fillText(text, cx, 526);
  }

  drawTower(ctx, data.tower, cx, 1200, 600, 560);

  ctx.fillStyle = '#6a6a80';
  ctx.font = `400 24px ${FONT}`;
  ctx.fillText(GAME_URL, cx, 1272);
}