import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { LoadoutScene } from './scenes/LoadoutScene';
import { MenuScene } from './scenes/MenuScene';
import { RaidScene } from './scenes/RaidScene';
import { ResultScene } from './scenes/ResultScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b0d10',
  // 端末の画面サイズにそのまま合わせる(横持ち前提)
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
    autoCenter: Phaser.Scale.NO_CENTER,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
    powerPreference: 'high-performance',
  },
  fps: {
    target: 60,
    smoothStep: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  input: {
    activePointers: 4,
  },
  scene: [BootScene, MenuScene, LoadoutScene, RaidScene, ResultScene],
};

new Phaser.Game(config);
