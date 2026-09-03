import Phaser from 'phaser';
import { CONTROLS } from '../config/balance';
import type { TouchControls } from '../input/TouchControls';
import type { VirtualStick } from '../input/VirtualStick';
import { TEX } from '../world/Textures';

/**
 * 画面固定の UI(スティック描画、ガイド、FPS)。
 * カメラに影響されないよう scrollFactor 0。
 */
export class Hud {
  private leftBase: Phaser.GameObjects.Image;
  private leftKnob: Phaser.GameObjects.Image;
  private rightBase: Phaser.GameObjects.Image;
  private rightKnob: Phaser.GameObjects.Image;
  private leftGuide: Phaser.GameObjects.Image;
  private rightGuide: Phaser.GameObjects.Image;
  private fpsText: Phaser.GameObjects.Text;
  private hintText: Phaser.GameObjects.Text;
  private hintShownUntil: number;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly controls: TouchControls,
  ) {
    const mk = (key: string, scale: number, alpha: number) =>
      scene.add.image(0, 0, key).setScrollFactor(0).setDepth(1000).setScale(scale).setAlpha(alpha).setVisible(false);

    const baseScale = (CONTROLS.stickRadius + CONTROLS.knobRadius * 0.5) / 78;
    const knobScale = CONTROLS.knobRadius / 38;

    // 指を置く目安(押していない時だけ薄く表示)
    this.leftGuide = mk(TEX.base, baseScale, 0.35).setVisible(true);
    this.rightGuide = mk(TEX.base, baseScale, 0.35).setVisible(true);

    this.leftBase = mk(TEX.base, baseScale, 1);
    this.leftKnob = mk(TEX.knob, knobScale, 1);
    this.rightBase = mk(TEX.base, baseScale, 1);
    this.rightKnob = mk(TEX.knob, knobScale, 1);

    this.fpsText = scene.add
      .text(8, 6, '', { fontFamily: 'monospace', fontSize: '12px', color: '#9aa4b2' })
      .setScrollFactor(0)
      .setDepth(1000);

    this.hintText = scene.add
      .text(0, 0, '左: 移動   右: ドラッグで照準', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: '#e6edf3',
        backgroundColor: '#00000066',
        padding: { x: 12, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setOrigin(0.5, 0);
    this.hintShownUntil = scene.time.now + 4000;

    this.layout();
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
    });
  }

  private layout(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    this.leftGuide.setPosition(CONTROLS.stickGuideSideMargin, h - CONTROLS.stickGuideBottomMargin);
    this.rightGuide.setPosition(w - CONTROLS.stickGuideSideMargin, h - CONTROLS.stickGuideBottomMargin);
    this.hintText.setPosition(w / 2, 10);
  }

  private drawStick(stick: VirtualStick, base: Phaser.GameObjects.Image, knob: Phaser.GameObjects.Image, guide: Phaser.GameObjects.Image): void {
    if (stick.held) {
      base.setVisible(true).setPosition(stick.baseX, stick.baseY);
      knob.setVisible(true).setPosition(stick.knobX, stick.knobY);
      guide.setVisible(false);
    } else {
      base.setVisible(false);
      knob.setVisible(false);
      guide.setVisible(true);
    }
  }

  update(time: number): void {
    this.drawStick(this.controls.left, this.leftBase, this.leftKnob, this.leftGuide);
    this.drawStick(this.controls.right, this.rightBase, this.rightKnob, this.rightGuide);
    this.fpsText.setText(`${Math.round(this.scene.game.loop.actualFps)} fps`);
    if (this.hintText.visible && time > this.hintShownUntil) {
      this.scene.tweens.add({ targets: this.hintText, alpha: 0, duration: 400, onComplete: () => this.hintText.setVisible(false) });
    }
  }
}
