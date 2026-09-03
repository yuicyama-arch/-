import Phaser from 'phaser';
import { CONTROLS } from '../config/balance';

export interface StickOptions {
  /** 指が可動半径を超えたらベースが追従する */
  followBase: boolean;
}

/**
 * 1本の仮想スティックの状態(ロジックのみ。描画は Hud 側)。
 * pointerdown で claim し、update で毎フレーム位置を読む(イベント待ちより遅延が少ない)。
 */
export class VirtualStick {
  /** 掴んでいるポインタ。null なら非アクティブ */
  pointer: Phaser.Input.Pointer | null = null;

  baseX = 0;
  baseY = 0;
  knobX = 0;
  knobY = 0;

  /** 正規化済みの入力方向(傾き 0 なら 0,0) */
  dirX = 0;
  dirY = 0;
  /** 傾き量 0〜1(デッドゾーン適用後) */
  magnitude = 0;
  /** デッドゾーンを超えて傾いている */
  get active(): boolean {
    return this.pointer !== null && this.magnitude > 0;
  }
  get held(): boolean {
    return this.pointer !== null;
  }

  private downTime = 0;
  private downX = 0;
  private downY = 0;
  private maxMove = 0;

  /** 直前の update で「タップ」として離された */
  tapped = false;

  constructor(private readonly opts: StickOptions) {}

  claim(pointer: Phaser.Input.Pointer, now: number): void {
    this.pointer = pointer;
    this.baseX = this.knobX = this.downX = pointer.x;
    this.baseY = this.knobY = this.downY = pointer.y;
    this.downTime = now;
    this.maxMove = 0;
    this.dirX = this.dirY = 0;
    this.magnitude = 0;
    this.tapped = false;
  }

  release(now: number): void {
    if (!this.pointer) return;
    const dt = now - this.downTime;
    this.tapped = dt <= CONTROLS.tapMaxMs && this.maxMove <= CONTROLS.tapMaxMove;
    this.pointer = null;
    this.dirX = this.dirY = 0;
    this.magnitude = 0;
  }

  /** 毎フレーム呼ぶ。tapped フラグはこの呼び出しの直前に release された時だけ true */
  update(): void {
    const p = this.pointer;
    if (!p) return;
    if (!p.isDown) {
      // pointerup を取りこぼした場合の保険
      this.release(performance.now());
      return;
    }

    const px = p.x;
    const py = p.y;
    this.maxMove = Math.max(this.maxMove, Math.hypot(px - this.downX, py - this.downY));

    let dx = px - this.baseX;
    let dy = py - this.baseY;
    let dist = Math.hypot(dx, dy);
    const R = CONTROLS.stickRadius;

    if (dist > R) {
      if (this.opts.followBase) {
        // ベースを指の方へ引きずる(ノブは常に縁)
        const over = dist - R;
        this.baseX += (dx / dist) * over;
        this.baseY += (dy / dist) * over;
        dx = px - this.baseX;
        dy = py - this.baseY;
        dist = R;
      } else {
        dx = (dx / dist) * R;
        dy = (dy / dist) * R;
        dist = R;
      }
    }

    this.knobX = this.baseX + dx;
    this.knobY = this.baseY + dy;

    const raw = dist / R;
    if (raw < CONTROLS.deadzone) {
      this.dirX = this.dirY = 0;
      this.magnitude = 0;
    } else {
      this.dirX = dx / dist;
      this.dirY = dy / dist;
      this.magnitude = Math.min(1, (raw - CONTROLS.deadzone) / (1 - CONTROLS.deadzone));
    }
  }

  /** フレーム末に呼んで単発フラグを消す */
  consumeTap(): boolean {
    const t = this.tapped;
    this.tapped = false;
    return t;
  }
}
