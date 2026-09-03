import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0b0d10');

    this.add
      .text(width / 2, height * 0.36, 'SCRAP RAID', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#f2b532',
      })
      .setOrigin(0.5);

    const tap = this.add
      .text(width / 2, height * 0.62, 'TAP TO START', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: '#e6edf3',
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: tap, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.add
      .text(width / 2, height - 24, 'M1: 操作の土台(移動 / 照準 / 壁 / 茂み)', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        color: '#9aa4b2',
      })
      .setOrigin(0.5);

    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      // Android Chrome 等で全画面にする(iOS Safari は非対応なので失敗は無視)
      if (this.scale.fullscreen.available && !this.scale.isFullscreen) {
        try {
          this.scale.startFullscreen();
        } catch {
          /* noop */
        }
      }
      this.scene.start('Loadout');
    });
  }
}
