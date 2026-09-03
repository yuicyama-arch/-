// マップ生成スクリプト(手作業で配置した矩形プリミティブから JSON を出力)
// 使い方: node tools/genmap.mjs > src/data/map01.json
//
// 凡例: '#' 壁  '.' 床  ',' 茂み  'c' 木箱  'C' 軍用箱  'E' 脱出ゾーン  'P' 初期位置
const W = 40;
const H = 40;
const g = Array.from({ length: H }, () => Array(W).fill('.'));

const rect = (x, y, w, h, ch) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch;
};
// 中が空の建物(壁1枚)。doors: [x,y] の壁を床にして入口を作る
const building = (x, y, w, h, doors = []) => {
  rect(x, y, w, h, '#');
  rect(x + 1, y + 1, w - 2, h - 2, '.');
  for (const [dx, dy] of doors) g[dy][dx] = '.';
};
const bush = (x, y, w, h) => rect(x, y, w, h, ',');

// 外周
rect(0, 0, W, 1, '#');
rect(0, H - 1, W, 1, '#');
rect(0, 0, 1, H, '#');
rect(W - 1, 0, 1, H, '#');

// ---- 外周エリア(敵薄・報酬小) ----
bush(3, 2, 2, 2);
bush(32, 2, 3, 2);
bush(3, 25, 3, 2);
bush(3, 33, 2, 2);
bush(34, 16, 3, 2);
bush(31, 22, 4, 3);
g[23][30] = ','; g[23][34] = ',';
bush(19, 29, 3, 3);
g[30][18] = ','; g[30][22] = ',';

// 縦長の壁(遮蔽)
rect(14, 2, 2, 5, '#');
// 小屋
building(3, 7, 6, 5, [[6, 11]]);
g[10][5] = 'c';
building(13, 10, 5, 5, [[13, 12]]);
g[12][15] = 'c';
building(3, 17, 4, 5, [[4, 17]]);
building(33, 9, 4, 6, [[33, 12]]);
g[11][35] = 'c';
building(11, 28, 4, 4, [[12, 31]]);
building(11, 33, 6, 5, [[16, 35]]);
g[35][13] = 'c';
building(31, 33, 4, 5, [[31, 35]]);
building(31, 26, 5, 5, [[33, 30]]);
g[28][33] = 'c';
// L字の遮蔽
rect(26, 4, 4, 1, '#');
rect(26, 4, 1, 4, '#');
rect(29, 4, 1, 4, '#');

// ---- 中央エリア(敵濃・報酬大) ----
bush(18, 6, 5, 3);
g[6][19] = '.'; g[6][22] = '.'; g[8][18] = '.'; g[8][22] = '.';
building(20, 13, 11, 4, [[25, 13], [20, 15]]);
building(21, 16, 6, 5, [[26, 18], [23, 20]]);
g[18][23] = 'C';
building(14, 22, 11, 5, [[14, 24], [24, 24], [18, 26], [21, 26]]);
g[24][17] = 'C';
bush(15, 18, 4, 3);
g[18][15] = '.'; g[20][15] = '.'; g[18][18] = '.'; g[20][18] = '.';
bush(29, 10, 2, 2);

// 木箱(散在)
g[5][6] = 'c'; g[6][34] = 'c'; g[19][32] = 'c'; g[23][7] = 'c'; g[33][23] = 'c';

// 脱出ゾーン(2箇所)
g[2][22] = 'E';
g[35][37] = 'E';

// 初期位置
g[37][2] = 'P';

const rows = g.map((r) => r.join(''));
const out = {
  version: 1,
  name: 'map01',
  width: W,
  height: H,
  legend: {
    '#': 'wall',
    '.': 'floor',
    ',': 'bush',
    c: 'crate',
    C: 'milcrate',
    E: 'extract',
    P: 'spawn',
  },
  rows,
};
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
