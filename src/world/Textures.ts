import Phaser from 'phaser';
import { PLAYER, WORLD } from '../config/balance';

/**
 * v1 のプレースホルダー用テクスチャを図形から生成する。
 * 後で画像アセットに差し替える時はここのキー名を維持したまま load.image に置き換える。
 */
export const TEX = {
  tiles: 'tiles',
  player: 'player',
  knob: 'stick_knob',
  base: 'stick_base',
} as const;

/** タイルセット内のインデックス */
export const TILE_INDEX = {
  floorA: 0,
  floorB: 1,
  wall: 2,
  bush: 3,
} as const;

export function generateTextures(scene: Phaser.Scene): void {
  const ts = WORLD.tileSize;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  // --- タイルセット(横一列) ---
  // 床A
  g.fillStyle(0x2a2f36);
  g.fillRect(ts * TILE_INDEX.floorA, 0, ts, ts);
  g.fillStyle(0x2e343c);
  g.fillRect(ts * TILE_INDEX.floorA + 6, 6, 10, 10);
  g.fillRect(ts * TILE_INDEX.floorA + 40, 36, 8, 8);
  // 床B(わずかに明暗差をつけて移動が分かるようにする)
  g.fillStyle(0x272c32);
  g.fillRect(ts * TILE_INDEX.floorB, 0, ts, ts);
  g.fillStyle(0x2c3138);
  g.fillRect(ts * TILE_INDEX.floorB + 30, 12, 8, 8);
  g.fillRect(ts * TILE_INDEX.floorB + 12, 44, 12, 6);
  // 壁
  g.fillStyle(0x596273);
  g.fillRect(ts * TILE_INDEX.wall, 0, ts, ts);
  g.fillStyle(0x6f7a8d);
  g.fillRect(ts * TILE_INDEX.wall + 2, 2, ts - 4, ts - 4);
  g.fillStyle(0x4a5262);
  g.fillRect(ts * TILE_INDEX.wall + 2, ts - 10, ts - 4, 8);
  // 茂み(床の上に葉の塊)
  g.fillStyle(0x2a2f36);
  g.fillRect(ts * TILE_INDEX.bush, 0, ts, ts);
  g.fillStyle(0x1f5a35);
  g.fillCircle(ts * TILE_INDEX.bush + 22, 24, 20);
  g.fillCircle(ts * TILE_INDEX.bush + 44, 30, 18);
  g.fillCircle(ts * TILE_INDEX.bush + 30, 44, 18);
  g.fillStyle(0x2f7a48);
  g.fillCircle(ts * TILE_INDEX.bush + 20, 22, 11);
  g.fillCircle(ts * TILE_INDEX.bush + 42, 28, 9);
  g.fillCircle(ts * TILE_INDEX.bush + 30, 42, 9);
  g.generateTexture(TEX.tiles, ts * 4, ts);
  g.clear();

  // --- プレイヤー(右向き基準。先端の三角で向きが分かる) ---
  const pr = PLAYER.radius;
  const size = pr * 2 + 8;
  const c = size / 2;
  g.fillStyle(0x0f1216, 0.6);
  g.fillCircle(c + 1, c + 2, pr + 1);
  g.fillStyle(0xf2b532);
  g.fillCircle(c, c, pr);
  g.fillStyle(0x1b1f26);
  g.fillTriangle(c + pr + 3, c, c + 2, c - 7, c + 2, c + 7);
  g.fillStyle(0xffe08a);
  g.fillCircle(c - 3, c - 3, pr * 0.35);
  g.generateTexture(TEX.player, size, size);
  g.clear();

  // --- スティック ---
  g.fillStyle(0xffffff, 0.08);
  g.fillCircle(80, 80, 78);
  g.lineStyle(2, 0xffffff, 0.35);
  g.strokeCircle(80, 80, 78);
  g.generateTexture(TEX.base, 160, 160);
  g.clear();

  g.fillStyle(0xffffff, 0.55);
  g.fillCircle(40, 40, 38);
  g.lineStyle(2, 0xffffff, 0.9);
  g.strokeCircle(40, 40, 38);
  g.generateTexture(TEX.knob, 80, 80);
  g.destroy();
}
