import Phaser from 'phaser';
import { generateTextures } from '../world/Textures';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    generateTextures(this);
    this.scene.start('Menu');
  }
}
