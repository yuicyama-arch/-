import Phaser from 'phaser';
import { PLAYER, STEALTH } from '../config/balance';
import type { ControlState } from '../input/TouchControls';
import { TEX } from '../world/Textures';

/**
 * プレイヤー。移動・向き・茂みステルスを扱う。
 * 物理は Arcade の円ボディ(壁の角を滑らかに抜けるため)。
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  /** 向き(ラジアン)。照準中は照準方向、それ以外は移動方向 */
  facing = 0;
  /** 茂みに隠れている */
  hidden = false;
  hp = PLAYER.hp;

  private fadeTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEX.player);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const r = PLAYER.radius;
    this.body.setCircle(r, this.width / 2 - r, this.height / 2 - r);
    this.body.setCollideWorldBounds(true);
    this.setDepth(10);
  }

  /** 入力を速度と向きに反映する */
  applyControls(c: ControlState): void {
    const speed = PLAYER.speed * c.moveMag;
    this.body.setVelocity(c.moveX * speed, c.moveY * speed);

    if (c.aiming) {
      this.facing = Math.atan2(c.aimY, c.aimX);
    } else if (c.moveMag > 0) {
      this.facing = Math.atan2(c.moveY, c.moveX);
    }
    this.setRotation(this.facing);
  }

  /** 茂み判定の結果を受け取り、透明度を切り替える */
  setHidden(hidden: boolean): void {
    if (hidden === this.hidden) return;
    this.hidden = hidden;
    this.fadeTween?.stop();
    this.fadeTween = this.scene.tweens.add({
      targets: this,
      alpha: hidden ? STEALTH.bushAlpha : 1,
      duration: STEALTH.bushFadeMs,
      ease: 'Quad.easeOut',
    });
  }
}
