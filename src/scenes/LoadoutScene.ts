import Phaser from 'phaser';
import { DEFAULT_WEAPON, WEAPONS, type WeaponId } from '../config/balance';

export interface RaidStartData {
  weapon: WeaponId;
}

/**
 * ロードアウト選択。M1 では初期武器のみ(M4 で 4 種選択に拡張)。
 */
export class LoadoutScene extends Phaser.Scene {
  constructor() {
    super('Loadout');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0b0d10');

    this.add
      .text(width / 2, height * 0.22, 'LOADOUT', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#e6edf3',
      })
      .setOrigin(0.5);

    const w = WEAPONS[DEFAULT_WEAPON];
    this.add
      .rectangle(width / 2, height * 0.46, 320, 84, 0x1b1f26)
      .setStrokeStyle(2, 0xf2b532);
    this.add
      .text(width / 2, height * 0.46 - 12, w.name, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: '#f2b532',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.46 + 18, `DMG ${w.damage}  RPS ${w.fireRate}  MAG ${w.magazine}`, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#9aa4b2',
      })
      .setOrigin(0.5);

    const btn = this.add
      .rectangle(width / 2, height * 0.76, 240, 60, 0xf2b532)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(width / 2, height * 0.76, '出撃', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#0b0d10',
      })
      .setOrigin(0.5);

    btn.once(Phaser.Input.Events.POINTER_DOWN, () => {
      const data: RaidStartData = { weapon: DEFAULT_WEAPON };
      this.scene.start('Raid', data);
    });
  }
}
