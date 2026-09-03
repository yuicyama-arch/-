# SCRAP RAID(仮題)

見下ろし型ツインスティック PvE 脱出シューター。スマホブラウザ(横持ち)向け。

## 公開URL(スマホで開く)

https://yuicyama-arch.github.io/-/

`main` に push すると GitHub Actions が自動でビルドし GitHub Pages に配信します。
初回のみ、リポジトリの **Settings → Pages → Source を「GitHub Actions」** に設定してください。

## 開発

```sh
npm install
npm run dev      # http://<PCのIP>:5173 をスマホで開く(同じWi‑Fi)
npm run build    # 型チェック + dist/ 生成
```

## 進行状況

- [x] M1 操作の土台: 横持ちレイアウト、左スティック移動、右スティック照準+照準線、壁衝突、茂み透明化
- [ ] M2 撃ち味の初版
- [ ] M3 コアループ完成
- [ ] M4 拡充
- [ ] M5 メタ進行
- [ ] M6 ポリッシュ

仕様は [CLAUDE.md](./CLAUDE.md) を参照。バランス数値は `src/config/balance.ts`、マップは `src/data/map01.json`(`node tools/genmap.mjs` で再生成)。
