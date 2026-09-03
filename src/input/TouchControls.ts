import Phaser from 'phaser';
import { CONTROLS } from '../config/balance';
import { VirtualStick } from './VirtualStick';

/**
 * ゲームロジックが読むだけの入力スナップショット。
 * 将来サーバー権威化する場合はこの構造体を送る想定。
 */
export interface ControlState {
  moveX: number;
  moveY: number;
  /** 0〜1 */
  moveMag: number;
  /** 右スティックがデッドゾーンを超えて傾いている */
  aiming: boolean;
  aimX: number;
  aimY: number;
  /** 右スティックを押している(射撃トリガー、M2 で使用) */
  firing: boolean;
  /** このフレームで右スティックがタップされた(オートエイム、M4 で使用) */
  aimTap: boolean;
}

/**
 * 画面左半分=移動スティック、右半分=照準スティック。
 * デスクトップ確認用に WASD/矢印キーも移動として受け付ける。
 */
export class TouchControls {
  readonly left = new VirtualStick({ followBase: CONTROLS.leftStickFollows });
  readonly right = new VirtualStick({ followBase: CONTROLS.rightStickFollows });

  readonly state: ControlState = {
    moveX: 0,
    moveY: 0,
    moveMag: 0,
    aiming: false,
    aimX: 1,
    aimY: 0,
    firing: false,
    aimTap: false,
  };

  private keys?: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };

  constructor(private readonly scene: Phaser.Scene) {
    // 同時タッチ: 左右スティック + 予備
    scene.input.addPointer(3);

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onUp, this);
    scene.input.on(Phaser.Input.Events.GAME_OUT, this.onGameOut, this);

    if (scene.input.keyboard) {
      const K = Phaser.Input.Keyboard.KeyCodes;
      this.keys = scene.input.keyboard.addKeys({
        up: K.UP,
        down: K.DOWN,
        left: K.LEFT,
        right: K.RIGHT,
        w: K.W,
        a: K.A,
        s: K.S,
        d: K.D,
      }) as NonNullable<typeof this.keys>;
    }

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    const now = performance.now();
    const isLeft = pointer.x < this.scene.scale.width * CONTROLS.leftZoneRatio;
    const stick = isLeft ? this.left : this.right;
    if (!stick.held) stick.claim(pointer, now);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    const now = performance.now();
    if (this.left.pointer === pointer) this.left.release(now);
    if (this.right.pointer === pointer) this.right.release(now);
  }

  private onGameOut(): void {
    const now = performance.now();
    this.left.release(now);
    this.right.release(now);
  }

  update(): void {
    this.left.update();
    this.right.update();

    const s = this.state;

    // --- 移動 ---
    let mx = this.left.dirX * this.left.magnitude;
    let my = this.left.dirY * this.left.magnitude;
    if (!this.left.held && this.keys) {
      const k = this.keys;
      const kx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
      const ky = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);
      if (kx !== 0 || ky !== 0) {
        const len = Math.hypot(kx, ky);
        mx = kx / len;
        my = ky / len;
      }
    }
    const mag = Math.min(1, Math.hypot(mx, my));
    if (mag > 0) {
      s.moveX = mx / mag;
      s.moveY = my / mag;
      s.moveMag = CONTROLS.analogMoveSpeed ? mag : 1;
    } else {
      s.moveX = s.moveY = 0;
      s.moveMag = 0;
    }

    // --- 照準 ---
    s.aiming = this.right.active;
    if (s.aiming) {
      s.aimX = this.right.dirX;
      s.aimY = this.right.dirY;
    }
    s.firing = this.right.active;
    s.aimTap = this.right.consumeTap();
    this.left.consumeTap();
  }

  destroy(): void {
    const input = this.scene.input;
    input.off(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    input.off(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onUp, this);
    input.off(Phaser.Input.Events.GAME_OUT, this.onGameOut, this);
  }
}
