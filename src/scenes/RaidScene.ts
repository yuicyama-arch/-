import Phaser from 'phaser';
import { CAMERA, CONTROLS, WORLD } from '../config/balance';
import mapJson from '../data/map01.json';
import { Player } from '../entities/Player';
import { TouchControls } from '../input/TouchControls';
import { Hud } from '../ui/Hud';
import { MapData, type RawMap } from '../world/MapData';
import { TEX, TILE_INDEX } from '../world/Textures';
import type { RaidStartData } from './LoadoutScene';
import type { ResultData } from './ResultScene';

export class RaidScene extends Phaser.Scene {
  private map!: MapData;
  private player!: Player;
  private controls!: TouchControls;
  private hud!: Hud;
  private aimLine!: Phaser.GameObjects.Graphics;
  private aimLineHideAt = 0;
  private startedAt = 0;

  constructor() {
    super('Raid');
  }

  create(_data: RaidStartData): void {
    this.startedAt = this.time.now;
    this.cameras.main.setBackgroundColor('#0b0d10');

    this.map = new MapData(mapJson as RawMap);
    this.buildTilemap();
    const walls = this.buildWalls();

    this.physics.world.setBounds(0, 0, this.map.widthPx, this.map.heightPx);
    const spawn = this.map.tileCenter(this.map.spawn);
    this.player = new Player(this, spawn.x, spawn.y);
    this.physics.add.collider(this.player, walls);

    this.aimLine = this.add.graphics().setDepth(9);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.map.widthPx, this.map.heightPx);
    cam.startFollow(this.player, true, CAMERA.lerp, CAMERA.lerp);
    cam.setRoundPixels(true);

    this.controls = new TouchControls(this);
    this.hud = new Hud(this, this.controls);

    // 開発用: 左上の小さな退出ボタン(M3 でポーズ/リザルト導線に置き換え)
    this.addExitButton();
  }

  private buildTilemap(): void {
    const ts = WORLD.tileSize;
    const data: number[][] = this.map.tiles.map((row, ty) =>
      row.map((kind, tx) => {
        switch (kind) {
          case 'wall':
            return TILE_INDEX.wall;
          case 'bush':
            return TILE_INDEX.bush;
          default:
            return (tx + ty) % 2 === 0 ? TILE_INDEX.floorA : TILE_INDEX.floorB;
        }
      }),
    );
    const tilemap = this.make.tilemap({ data, tileWidth: ts, tileHeight: ts });
    const tileset = tilemap.addTilesetImage(TEX.tiles, TEX.tiles, ts, ts, 0, 0);
    if (!tileset) throw new Error('tileset missing');
    tilemap.createLayer(0, tileset, 0, 0)?.setDepth(0);
  }

  /** 壁タイルを横に連結した矩形ごとに静的ボディを作る(見た目はタイルマップ側) */
  private buildWalls(): Phaser.Physics.Arcade.StaticGroup {
    const walls = this.physics.add.staticGroup();
    for (const r of this.map.wallRects()) {
      const zone = this.add.zone(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h);
      walls.add(zone);
    }
    return walls;
  }

  private addExitButton(): void {
    const btn = this.add
      .text(this.scale.width - 10, 8, '✕', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#9aa4b2',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 4 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1001)
      .setInteractive();
    // 右スティックと競合しないよう、ボタン上の pointerdown は伝播を止める
    btn.on(Phaser.Input.Events.POINTER_DOWN, (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
      const data: ResultData = { reason: 'exit', elapsedMs: this.time.now - this.startedAt };
      this.scene.start('Result', data);
    });
    this.scale.on(Phaser.Scale.Events.RESIZE, () => btn.setPosition(this.scale.width - 10, 8));
  }

  update(time: number): void {
    this.controls.update();
    const c = this.controls.state;

    this.player.applyControls(c);
    this.player.setHidden(this.map.isBushAt(this.player.x, this.player.y));

    this.updateCameraLead(c);
    this.drawAimLine(time, c);
    this.hud.update(time);
  }

  /** 照準・移動方向に少しカメラを先行させて見通しを良くする */
  private updateCameraLead(c: { aiming: boolean; aimX: number; aimY: number; moveX: number; moveY: number; moveMag: number }): void {
    const cam = this.cameras.main;
    let ox = 0;
    let oy = 0;
    if (c.aiming) {
      ox += c.aimX * CAMERA.aimLead;
      oy += c.aimY * CAMERA.aimLead;
    }
    ox += c.moveX * c.moveMag * CAMERA.moveLead;
    oy += c.moveY * c.moveMag * CAMERA.moveLead;
    cam.setFollowOffset(-ox, -oy);
  }

  private drawAimLine(time: number, c: { aiming: boolean; aimX: number; aimY: number }): void {
    const g = this.aimLine;
    if (c.aiming) {
      this.aimLineHideAt = time + CONTROLS.aimLineLingerMs;
    }
    if (time > this.aimLineHideAt) {
      g.clear();
      return;
    }

    const px = this.player.x;
    const py = this.player.y;
    const hit = this.map.raycastWall(px, py, c.aimX, c.aimY, CONTROLS.aimLineLength);

    g.clear();
    g.lineStyle(2, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(px, py);
    g.lineTo(hit.x, hit.y);
    g.strokePath();
    if (hit.hit) {
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(hit.x, hit.y, 3);
    }
  }
}
