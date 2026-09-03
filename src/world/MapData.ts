import { WORLD } from '../config/balance';

export type TileKind = 'wall' | 'floor' | 'bush' | 'crate' | 'milcrate' | 'extract' | 'spawn';

export interface RawMap {
  version: number;
  name: string;
  width: number;
  height: number;
  legend: Record<string, TileKind>;
  rows: string[];
}

export interface TilePos {
  tx: number;
  ty: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * JSON のマップ定義を読み、ゲームロジックが使いやすい形に変換する。
 * 描画(Phaser)には依存しない。
 */
export class MapData {
  readonly width: number;
  readonly height: number;
  readonly tileSize = WORLD.tileSize;
  readonly widthPx: number;
  readonly heightPx: number;

  /** タイル種別の 2D 配列 [ty][tx] */
  readonly tiles: TileKind[][];
  readonly spawn: TilePos;
  readonly extracts: TilePos[] = [];
  readonly crates: TilePos[] = [];
  readonly milcrates: TilePos[] = [];
  readonly bushes: TilePos[] = [];

  constructor(raw: RawMap) {
    this.width = raw.width;
    this.height = raw.height;
    this.widthPx = this.width * this.tileSize;
    this.heightPx = this.height * this.tileSize;

    let spawn: TilePos | null = null;
    this.tiles = raw.rows.map((row, ty) => {
      if (row.length !== raw.width) {
        throw new Error(`map row ${ty} has length ${row.length}, expected ${raw.width}`);
      }
      return [...row].map((ch, tx) => {
        const kind = raw.legend[ch];
        if (!kind) throw new Error(`unknown map char '${ch}' at ${tx},${ty}`);
        switch (kind) {
          case 'spawn':
            spawn = { tx, ty };
            return 'floor';
          case 'extract':
            this.extracts.push({ tx, ty });
            return 'floor';
          case 'crate':
            this.crates.push({ tx, ty });
            return 'floor';
          case 'milcrate':
            this.milcrates.push({ tx, ty });
            return 'floor';
          case 'bush':
            this.bushes.push({ tx, ty });
            return 'bush';
          default:
            return kind;
        }
      });
    });
    if (!spawn) throw new Error('map has no spawn point');
    this.spawn = spawn;
  }

  isWall(tx: number, ty: number): boolean {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return true;
    return this.tiles[ty][tx] === 'wall';
  }

  isBushAt(x: number, y: number): boolean {
    const tx = Math.floor(x / this.tileSize);
    const ty = Math.floor(y / this.tileSize);
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return false;
    return this.tiles[ty][tx] === 'bush';
  }

  tileCenter(p: TilePos): { x: number; y: number } {
    return {
      x: (p.tx + 0.5) * this.tileSize,
      y: (p.ty + 0.5) * this.tileSize,
    };
  }

  /**
   * 壁タイルを横方向に連結した矩形にまとめる(物理ボディ数を減らすため)。
   */
  wallRects(): Rect[] {
    const rects: Rect[] = [];
    const ts = this.tileSize;
    for (let ty = 0; ty < this.height; ty++) {
      let runStart = -1;
      for (let tx = 0; tx <= this.width; tx++) {
        const wall = tx < this.width && this.tiles[ty][tx] === 'wall';
        if (wall && runStart < 0) runStart = tx;
        if (!wall && runStart >= 0) {
          rects.push({ x: runStart * ts, y: ty * ts, w: (tx - runStart) * ts, h: ts });
          runStart = -1;
        }
      }
    }
    return rects;
  }

  /**
   * 壁に当たるまでレイを飛ばし、到達点を返す(DDA)。照準線の描画用。
   * dx, dy は正規化済みの方向。
   */
  raycastWall(x: number, y: number, dx: number, dy: number, maxDist: number): { x: number; y: number; hit: boolean } {
    const ts = this.tileSize;
    let tx = Math.floor(x / ts);
    let ty = Math.floor(y / ts);
    if (this.isWall(tx, ty)) return { x, y, hit: true };

    const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    const stepY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
    const tDeltaX = stepX !== 0 ? Math.abs(ts / dx) : Infinity;
    const tDeltaY = stepY !== 0 ? Math.abs(ts / dy) : Infinity;
    let tMaxX = stepX > 0 ? ((tx + 1) * ts - x) / dx : stepX < 0 ? (tx * ts - x) / dx : Infinity;
    let tMaxY = stepY > 0 ? ((ty + 1) * ts - y) / dy : stepY < 0 ? (ty * ts - y) / dy : Infinity;

    let t = 0;
    for (let i = 0; i < 256; i++) {
      if (tMaxX < tMaxY) {
        t = tMaxX;
        tMaxX += tDeltaX;
        tx += stepX;
      } else {
        t = tMaxY;
        tMaxY += tDeltaY;
        ty += stepY;
      }
      if (t >= maxDist) break;
      if (this.isWall(tx, ty)) {
        return { x: x + dx * t, y: y + dy * t, hit: true };
      }
    }
    return { x: x + dx * maxDist, y: y + dy * maxDist, hit: false };
  }
}
