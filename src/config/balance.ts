/**
 * バランスに関わる数値はすべてここに集約する(コード内に直書きしない)。
 * 単位: 距離 = px、時間 = ms(明記がある場合を除く)、角度 = 度。
 */

// ---------------------------------------------------------------------------
// マップ・ワールド
// ---------------------------------------------------------------------------
export const WORLD = {
  /** 1タイルの一辺(px) */
  tileSize: 64,
} as const;

// ---------------------------------------------------------------------------
// プレイヤー
// ---------------------------------------------------------------------------
export const PLAYER = {
  hp: 100,
  /** 移動速度(px/s) */
  speed: 200,
  /** 当たり判定の半径(px) */
  radius: 14,
  /** 非戦闘この時間で自動回復開始 */
  regenDelayMs: 5000,
  /** 自動回復量(HP/s) */
  regenPerSec: 10,
} as const;

// ---------------------------------------------------------------------------
// 操作(仮想スティック)
// ---------------------------------------------------------------------------
export const CONTROLS = {
  /** スティックの可動半径(px)。ノブがこの距離までしか離れない */
  stickRadius: 64,
  /** ノブの半径(px) */
  knobRadius: 30,
  /** この比率未満の傾きは入力なし扱い(0〜1) */
  deadzone: 0.12,
  /**
   * 左スティック: 指が可動半径を超えたらベースが指を追いかける(フローティング)。
   * 遠くまで指を動かしても入力が途切れないようにするため。
   */
  leftStickFollows: true,
  /** 右スティック: 照準方向が狂うのでベースは動かさない */
  rightStickFollows: false,
  /** 左スティックの傾き量で移動速度を変える(false なら常に全速) */
  analogMoveSpeed: true,
  /** 画面のこの比率より左をタップしたら左スティック、右なら右スティック */
  leftZoneRatio: 0.5,
  /** タップ判定: この時間以内に離す */
  tapMaxMs: 180,
  /** タップ判定: 指の移動量がこの距離以内 */
  tapMaxMove: 14,
  /** 照準線の最大長(px)。壁に当たればそこで止まる */
  aimLineLength: 420,
  /** 右スティックを離した後も照準線を残す時間 */
  aimLineLingerMs: 120,
  /** 画面下端からスティック配置目安までの余白(px)。固定表示ではなく初期ガイド用 */
  stickGuideBottomMargin: 110,
  stickGuideSideMargin: 130,
} as const;

// ---------------------------------------------------------------------------
// カメラ
// ---------------------------------------------------------------------------
export const CAMERA = {
  /** 追従の補間係数(0〜1、大きいほど機敏) */
  lerp: 0.14,
  /** 照準方向へカメラを先行させる距離(px) */
  aimLead: 48,
  /** 移動方向へカメラを先行させる距離(px) */
  moveLead: 24,
} as const;

// ---------------------------------------------------------------------------
// ステルス(茂み)
// ---------------------------------------------------------------------------
export const STEALTH = {
  /** 茂み内の自機の透明度 */
  bushAlpha: 0.45,
  /** 透明化・復帰にかける時間 */
  bushFadeMs: 140,
} as const;

// ---------------------------------------------------------------------------
// ラン
// ---------------------------------------------------------------------------
export const RAID = {
  /** 1ランの制限時間 */
  durationMs: 3 * 60 * 1000,
  /** 残りこの時間で警告 */
  warningAtMs: 30 * 1000,
  /** 脱出ゾーン滞在で成功までの時間 */
  extractHoldMs: 3000,
} as const;

// ---------------------------------------------------------------------------
// 武器(§6 初期値)。M2 以降で使用
// ---------------------------------------------------------------------------
export type WeaponId = 'ar_rhino' | 'smg_hornet' | 'sg_bulldog' | 'dmr_heron';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  damage: number;
  /** 1発あたりのペレット数(ショットガン用) */
  pellets: number;
  /** 連射数/秒 */
  fireRate: number;
  magazine: number;
  reloadMs: number;
  /** 1発ずつリロードする(ショットガン) */
  reloadPerShell: boolean;
  range: number;
  /** 拡散角(度): 初期→最大 */
  spreadMin: number;
  spreadMax: number;
  /** 1発ごとの拡散増加(度) */
  spreadPerShot: number;
  /** 射撃をやめた時の収束速度(度/s) */
  spreadRecovery: number;
  /** 装備中の移動速度倍率 */
  moveSpeedMul: number;
  /** 発砲で全敵に位置が知られる */
  revealsOnFire: boolean;
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  ar_rhino: {
    id: 'ar_rhino',
    name: 'AR ライノ',
    damage: 12,
    pellets: 1,
    fireRate: 8,
    magazine: 30,
    reloadMs: 1800,
    reloadPerShell: false,
    range: 550,
    spreadMin: 2,
    spreadMax: 8,
    spreadPerShot: 0.9,
    spreadRecovery: 18,
    moveSpeedMul: 1.0,
    revealsOnFire: false,
  },
  smg_hornet: {
    id: 'smg_hornet',
    name: 'SMG ホーネット',
    damage: 7,
    pellets: 1,
    fireRate: 13,
    magazine: 35,
    reloadMs: 1500,
    reloadPerShell: false,
    range: 380,
    spreadMin: 4,
    spreadMax: 12,
    spreadPerShot: 0.8,
    spreadRecovery: 24,
    moveSpeedMul: 1.1,
    revealsOnFire: false,
  },
  sg_bulldog: {
    id: 'sg_bulldog',
    name: 'SG ブルドッグ',
    damage: 5,
    pellets: 8,
    fireRate: 1.2,
    magazine: 6,
    reloadMs: 2500,
    reloadPerShell: true,
    range: 260,
    spreadMin: 12,
    spreadMax: 12,
    spreadPerShot: 0,
    spreadRecovery: 0,
    moveSpeedMul: 1.0,
    revealsOnFire: false,
  },
  dmr_heron: {
    id: 'dmr_heron',
    name: 'DMR ヘロン',
    damage: 45,
    pellets: 1,
    fireRate: 2,
    magazine: 10,
    reloadMs: 2000,
    reloadPerShell: false,
    range: 800,
    spreadMin: 0.5,
    spreadMax: 0.5,
    spreadPerShot: 0,
    spreadRecovery: 0,
    moveSpeedMul: 1.0,
    revealsOnFire: true,
  },
};

/** 初期装備 */
export const DEFAULT_WEAPON: WeaponId = 'ar_rhino';
