import Phaser from 'phaser';

export interface ResultData {
  reason: 'exit' | 'extracted' | 'dead' | 'timeout';
  elapsedMs: number;
}

/**
 * リザルト。M1 では退出理由と経過時間のみ(M3 で物資・撃破数を追加)。
 */
export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create(data: ResultData): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0b0d10');

    const sec = Math.floor((data.elapsedMs ?? 0) / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');

    this.add
      .text(width / 2, height * 0.3, 'RESULT', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#e6edf3',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.48, `TIME ${mm}:${ss}`, {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#9aa4b2',
      })
      .setOrigin(0.5);

    const tap = this.add
      .text(width / 2, height * 0.72, 'TAP: 再出撃', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: '#f2b532',
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: tap, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => this.scene.start('Loadout'));
  }
}
