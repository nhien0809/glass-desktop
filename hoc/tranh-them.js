/*
 * Tranh kiểm tra thêm (tranh 11–28). Vẽ bằng SVG với các hàm vẽ của trang (svg, T, A, P, cup, r)
 * mà phần "Tranh kiểm tra" trong hoc/index.html truyền vào. hard: true = câu khó (trả lời câu dài, nhiều mẫu).
 */
window.TRANH_THEM = function (h) {
  "use strict";
  var svg = h.svg, T = h.T, A = h.A, P = h.P, cup = h.cup;
  var B8 = "Bài 8", B9 = "Bài 9", B10 = "Bài 10", B11 = "Bài 11";
  var ground = '<line class="ln" x1="16" y1="176" x2="304" y2="176"/>';

  /* ---------- Small drawings ---------- */
  function book(x, y) { // centre
    return '<rect class="c1" x="' + (x - 12) + '" y="' + (y - 9) + '" width="24" height="18" rx="2"/>' +
      '<line class="thin" x1="' + x + '" y1="' + (y - 9) + '" x2="' + x + '" y2="' + (y + 9) + '"/>';
  }
  function choco(x, y) {
    var o = '<rect class="wd" x="' + (x - 13) + '" y="' + (y - 8) + '" width="26" height="16" rx="2"/>';
    o += '<line class="thin" x1="' + (x - 4) + '" y1="' + (y - 8) + '" x2="' + (x - 4) + '" y2="' + (y + 8) + '"/>';
    o += '<line class="thin" x1="' + (x + 5) + '" y1="' + (y - 8) + '" x2="' + (x + 5) + '" y2="' + (y + 8) + '"/>';
    return o + '<line class="thin" x1="' + (x - 13) + '" y1="' + y + '" x2="' + (x + 13) + '" y2="' + y + '"/>';
  }
  function flower(x, y) { // y = top of the bunch
    return '<path class="c3" d="M' + (x - 8) + ',' + (y + 12) + ' L' + (x + 8) + ',' + (y + 12) + ' L' + x + ',' + (y + 34) + ' Z"/>' +
      '<circle class="c2" cx="' + (x - 6) + '" cy="' + (y + 8) + '" r="6"/><circle class="yl" cx="' + (x + 6) + '" cy="' + (y + 7) + '" r="6"/><circle class="rd" cx="' + x + '" cy="' + y + '" r="6"/>';
  }
  function ok(x, y, s) { s = s || 1; return '<polyline class="ok" points="' + (x - 10 * s) + ',' + y + ' ' + (x - 3 * s) + ',' + (y + 8 * s) + ' ' + (x + 11 * s) + ',' + (y - 9 * s) + '"/>'; }
  function ng(x, y, s) {
    s = s || 1; var d = 9 * s;
    return '<line class="ng" x1="' + (x - d) + '" y1="' + (y - d) + '" x2="' + (x + d) + '" y2="' + (y + d) + '"/><line class="ng" x1="' + (x + d) + '" y1="' + (y - d) + '" x2="' + (x - d) + '" y2="' + (y + d) + '"/>';
  }
  function car(x, y) { // x,y = left bottom of the body
    return '<path class="c2" d="M' + x + ',' + y + ' L' + x + ',' + (y - 12) + ' L' + (x + 8) + ',' + (y - 12) + ' L' + (x + 14) + ',' + (y - 22) + ' L' + (x + 34) + ',' + (y - 22) + ' L' + (x + 40) + ',' + (y - 12) + ' L' + (x + 48) + ',' + (y - 12) + ' L' + (x + 48) + ',' + y + ' Z"/>' +
      '<rect class="sky" x="' + (x + 16) + '" y="' + (y - 19) + '" width="16" height="7"/>' +
      '<circle class="dkf" cx="' + (x + 11) + '" cy="' + y + '" r="5"/><circle class="dkf" cx="' + (x + 37) + '" cy="' + y + '" r="5"/>';
  }
  function waves(x, y) {
    return '<path class="wv" d="M' + x + ',' + y + ' q5,-6 10,0 t10,0 t10,0 M' + x + ',' + (y + 10) + ' q5,-6 10,0 t10,0 t10,0"/>';
  }
  function house(x, y, w, hh, label) { // x,y = left bottom
    var o = '<path class="rd" d="M' + (x - 8) + ',' + (y - hh) + ' L' + (x + w / 2) + ',' + (y - hh - 34) + ' L' + (x + w + 8) + ',' + (y - hh) + ' Z"/>';
    o += '<rect class="pnl" x="' + x + '" y="' + (y - hh) + '" width="' + w + '" height="' + hh + '"/>';
    if (label) o += T(x + w / 2, y - hh - 10, label, "txd tm sm tb");
    return o;
  }
  function shop(x, y, w, hh, label) {
    return '<rect class="pnl" x="' + x + '" y="' + (y - hh) + '" width="' + w + '" height="' + hh + '"/>' +
      '<rect class="c3" x="' + (x - 4) + '" y="' + (y - hh - 14) + '" width="' + (w + 8) + '" height="16" rx="3"/>' +
      T(x + w / 2, y - hh - 2, label, "txd tm sm tb") +
      '<rect class="sky" x="' + (x + 8) + '" y="' + (y - hh + 12) + '" width="' + (w - 16) + '" height="' + (hh / 2 - 10) + '"/>' +
      '<rect class="dkf" x="' + (x + w / 2 - 9) + '" y="' + (y - 26) + '" width="18" height="26"/>';
  }
  function bottle(x, y) { // centre bottom
    return '<rect class="c3" x="' + (x - 7) + '" y="' + (y - 26) + '" width="14" height="26" rx="3"/>' +
      '<rect class="c3" x="' + (x - 3) + '" y="' + (y - 34) + '" width="6" height="9"/>' +
      '<rect class="wh" x="' + (x - 7) + '" y="' + (y - 18) + '" width="14" height="8"/>';
  }
  function bubble(x, y, w, hh, tailX, tailY, inner) { // x,y = left top
    return '<path class="wh" d="M' + (x + 10) + ',' + y + ' H' + (x + w - 10) + ' Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + 10) +
      ' V' + (y + hh - 10) + ' Q' + (x + w) + ',' + (y + hh) + ' ' + (x + w - 10) + ',' + (y + hh) +
      ' H' + (Math.min(Math.max(tailX, x + 18), x + w - 18) + 6) + ' L' + tailX + ',' + tailY + ' L' + (Math.min(Math.max(tailX, x + 18), x + w - 18) - 6) + ',' + (y + hh) +
      ' H' + (x + 10) + ' Q' + x + ',' + (y + hh) + ' ' + x + ',' + (y + hh - 10) + ' V' + (y + 10) + ' Q' + x + ',' + y + ' ' + (x + 10) + ',' + y + ' Z"/>' + (inner || "");
  }
  function film(x, y) { // centre
    var o = '<rect class="dkf" x="' + (x - 18) + '" y="' + (y - 13) + '" width="36" height="26" rx="2"/><rect class="sky" x="' + (x - 11) + '" y="' + (y - 8) + '" width="22" height="16"/>';
    for (var i = 0; i < 4; i++) {
      o += '<rect class="wh" x="' + (x - 16) + '" y="' + (y - 11 + i * 6) + '" width="3" height="3"/><rect class="wh" x="' + (x + 13) + '" y="' + (y - 11 + i * 6) + '" width="3" height="3"/>';
    }
    return o;
  }
  function mountainPic(x, y, w, hh) {
    return '<rect class="wd" x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="3"/><rect class="sky" x="' + (x + 4) + '" y="' + (y + 4) + '" width="' + (w - 8) + '" height="' + (hh - 8) + '"/>' +
      '<path class="tr" d="M' + (x + 4) + ',' + (y + hh - 4) + ' L' + (x + w * 0.38) + ',' + (y + hh * 0.3) + ' L' + (x + w * 0.6) + ',' + (y + hh * 0.6) + ' L' + (x + w * 0.75) + ',' + (y + hh * 0.42) + ' L' + (x + w - 4) + ',' + (y + hh - 4) + ' Z"/>';
  }
  function camera(x, y) {
    return '<rect class="dkf" x="' + (x - 15) + '" y="' + (y - 9) + '" width="30" height="20" rx="3"/><rect class="dkf" x="' + (x - 6) + '" y="' + (y - 13) + '" width="12" height="5"/>' +
      '<circle class="wh" cx="' + x + '" cy="' + (y + 1) + '" r="6"/><circle class="sky" cx="' + x + '" cy="' + (y + 1) + '" r="3"/>';
  }
  function guitar(x, y) { // x = centre, y = top of the neck
    return '<rect class="wd" x="' + (x - 3) + '" y="' + y + '" width="6" height="40"/><rect class="wd" x="' + (x - 5) + '" y="' + (y - 7) + '" width="10" height="9" rx="2"/>' +
      '<circle class="wd" cx="' + x + '" cy="' + (y + 46) + '" r="11"/><circle class="wd" cx="' + x + '" cy="' + (y + 64) + '" r="15"/><circle class="dkf" cx="' + x + '" cy="' + (y + 54) + '" r="3.5"/>';
  }
  function signal(x, y) { // x,y = top of the pole
    return '<line class="ln" x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + 34) + '"/>' +
      '<rect class="dkf" x="' + (x - 17) + '" y="' + (y - 11) + '" width="34" height="13" rx="6"/>' +
      '<circle class="c3" cx="' + (x - 10) + '" cy="' + (y - 4.5) + '" r="3.5"/><circle class="yl" cx="' + x + '" cy="' + (y - 4.5) + '" r="3.5"/><circle class="rd" cx="' + (x + 10) + '" cy="' + (y - 4.5) + '" r="3.5"/>';
  }

  var S = {};

  /* 11 · Bài 8 · Gia đình */
  S.t11 = svg("Gia đình tôi: bố, mẹ, anh trai, tôi và hai em gái",
    T(160, 24, "わたしの　かぞく", "tm tb lgx") + ground +
    P(38, 172, 122, { c: "c1" }) + P(88, 172, 112, { hair: "long", c: "c2" }) +
    P(138, 172, 108, { c: "c3" }) + P(186, 172, 96, { c: "c1" }) +
    P(234, 172, 80, { hair: "long", c: "c2", big: true }) + P(282, 172, 70, { hair: "long", c: "c3", big: true }) +
    [[38, "ちち"], [88, "はは"], [138, "あに"], [186, "わたし"], [234, "いもうと"], [282, "いもうと"]].map(function (l) { return T(l[0], 189, l[1], "tm sm tb"); }).join(""));

  /* 12 · Bài 8 · Ai tặng ai (khó) */
  S.t12 = svg("Tanaka tặng sách cho Lan; Lan cho tôi sô cô la; tôi tặng hoa cho Tanaka",
    ground + P(50, 172, 92, { c: "c1", label: "たなかさん" }) + P(160, 172, 92, { c: "c3", label: "わたし" }) + P(270, 172, 92, { hair: "long", c: "c2", label: "ランさん" }) +
    '<path class="ln" d="M50,66 L50,30 L270,30"/>' + A(270, 30, 270, 66) + '<rect class="pnl" x="140" y="14" width="40" height="32" rx="6"/>' + book(160, 30) +
    A(248, 96, 186, 96) + '<rect class="pnl" x="198" y="80" width="38" height="30" rx="6"/>' + choco(217, 95) +
    A(134, 96, 72, 96) + '<rect class="pnl" x="84" y="66" width="38" height="46" rx="6"/>' + flower(103, 72));

  /* 13 · Bài 8 · Tả người */
  S.t13 = svg("Ken cao, tóc ngắn; Yumi thấp, tóc dài, mắt to",
    ground + P(100, 172, 150, { c: "c1", label: "ケンさん" }) + P(220, 172, 96, { hair: "long", big: true, c: "c2", label: "ユミさん" }));

  /* 14 · Bài 8 · Sống cùng ai */
  S.t14 = svg("Ngôi nhà: tôi sống cùng hai bạn cùng phòng",
    house(40, 176, 240, 110, "") + T(160, 56, "わたしの　うち", "txd tm tb") +
    P(92, 164, 76, { c: "c3", label: "" }) + P(160, 164, 76, { c: "c1", label: "" }) + P(228, 164, 76, { hair: "long", c: "c2", label: "" }) +
    T(92, 188, "ルームメイト", "tm sm tb") + T(160, 188, "わたし", "tm sm tb") + T(228, 188, "ルームメイト", "tm sm tb"));

  /* 15 · Bài 9 · Sở thích chụp ảnh */
  var cal = '<rect class="pnl" x="150" y="98" width="156" height="86" rx="6"/>' + T(228, 114, "1かげつ", "tm tb");
  for (var rw = 0; rw < 4; rw++) for (var cl = 0; cl < 7; cl++) {
    var cx = 162 + cl * 22, cy = 128 + rw * 14, mark = (rw === 1 && cl === 5) || (rw === 3 && cl === 5);
    cal += mark ? '<circle class="yl" cx="' + cx + '" cy="' + cy + '" r="6"/><path class="tr" d="M' + (cx - 4) + ',' + (cy + 3) + ' L' + cx + ',' + (cy - 4) + ' L' + (cx + 4) + ',' + (cy + 3) + ' Z"/>'
      : '<circle class="gr" cx="' + cx + '" cy="' + cy + '" r="1.6"/>';
  }
  S.t15 = svg("Người này thích chụp ảnh núi; một tháng đi núi 2 lần",
    ground + P(72, 172, 118, { c: "c3", arms: "out", label: "ハンさん" }) + camera(72, 112) +
    mountainPic(150, 18, 70, 64) + mountainPic(232, 18, 70, 64) + cal);

  /* 16 · Bài 9 · Bảng khả năng (khó) */
  var tb = '<rect class="pnl" x="10" y="14" width="300" height="172" rx="8"/>' +
    '<line class="thin" x1="10" y1="70" x2="310" y2="70"/><line class="thin" x1="10" y1="128" x2="310" y2="128"/>' +
    '<line class="thin" x1="110" y1="14" x2="110" y2="186"/><line class="thin" x1="177" y1="14" x2="177" y2="186"/><line class="thin" x1="243" y1="14" x2="243" y2="186"/>' +
    waves(129, 38) + T(143, 64, "およぐ", "tm sm") +
    T(210, 46, "漢字", "tm tb lgx") + T(210, 64, "よむ", "tm sm") +
    car(252, 50) + T(276, 64, "うんてん", "tm sm") +
    P(44, 120, 42, { c: "c2", hair: "long" }) + T(80, 104, "リン", "tm tb") +
    P(44, 178, 42, { c: "c1" }) + T(80, 162, "トム", "tm tb") +
    ok(143, 98) + ng(210, 99) + ok(276, 98) +
    ng(143, 157) + ok(210, 156) + ng(276, 157);
  S.t16 = svg("Bảng: Rin bơi được, không đọc được chữ Hán, lái xe được; Tom không bơi được, đọc được chữ Hán, không lái xe được", tb);

  /* 17 · Bài 9 · Mức độ thường xuyên */
  var bar = function (y, n, label) {
    var o = "";
    for (var i = 0; i < 7; i++) o += '<rect class="' + (i < n ? "c1" : "pnl") + '" x="' + (110 + i * 22) + '" y="' + (y - 9) + '" width="18" height="18" rx="4"/>';
    return o + T(274, y + 5, label, "tb");
  };
  S.t17 = svg("Một tuần: cà phê 7 ngày, phim 1 ngày, rượu 0 ngày",
    T(160, 20, "いっしゅうかん", "tm tb") +
    cup(52, 52) + bar(50, 7, "7にち") +
    film(52, 112) + bar(112, 1, "1にち") +
    bottle(52, 182) + bar(166, 0, "0にち"));

  /* 18 · Bài 9 · Đi xe buýt (khó) */
  S.t18 = svg("Đi xe buýt số 3, xuống ở bến trước bảo tàng mỹ thuật",
    '<rect class="road" x="0" y="160" width="320" height="22"/>' +
    '<rect class="c1" x="14" y="104" width="118" height="56" rx="8"/>' +
    [0, 1, 2, 3].map(function (i) { return '<rect class="sky" x="' + (22 + i * 26) + '" y="112" width="20" height="18" rx="2"/>'; }).join("") +
    '<rect class="yl" x="98" y="136" width="28" height="18" rx="3"/>' + T(112, 150, "3", "txd tm tb") +
    '<circle class="dkf" cx="38" cy="160" r="9"/><circle class="dkf" cx="108" cy="160" r="9"/>' +
    A(140, 128, 180, 128) +
    '<line class="ln" x1="196" y1="96" x2="196" y2="160"/><circle class="wh" cx="196" cy="86" r="13"/>' + T(196, 90, "バス", "txd tm sm tb") +
    '<path class="gr" d="M220,72 L266,44 L312,72 Z"/><rect class="pnl" x="224" y="72" width="84" height="88"/>' +
    [0, 1, 2, 3].map(function (i) { return '<rect class="gr" x="' + (232 + i * 20) + '" y="80" width="8" height="72"/>'; }).join("") +
    T(266, 34, "びじゅつかん", "tm sm tb") + T(196, 196, "びじゅつかんまえ", "tm sm tb"));

  /* 19 · Bài 10 · Ở hồ bơi (khó) */
  function sign(x, inner, label) {
    return '<line class="ln" x1="' + x + '" y1="76" x2="' + x + '" y2="128"/><circle class="wh" cx="' + x + '" cy="54" r="26"/>' + inner +
      '<circle class="ng" cx="' + x + '" cy="54" r="26"/><line class="ng" x1="' + (x - 18) + '" y1="36" x2="' + (x + 18) + '" y2="72"/>' + T(x, 92, label, "tm sm tb");
  }
  var runner = '<circle class="sk" cx="90" cy="38" r="5"/><path class="ln" d="M90,43 L86,56 M86,56 L78,66 M86,56 L94,64 L92,72 M89,47 L80,50 M89,47 L98,44"/>';
  var burger = '<path class="wd" d="M218,52 A14,10 0 0 1 246,52 Z"/><rect class="c3" x="217" y="52" width="30" height="4"/><rect class="dkf" x="218" y="56" width="28" height="5" rx="2"/><path class="wd" d="M218,61 H246 A14,6 0 0 1 218,61 Z"/>';
  S.t19 = svg("Hồ bơi: biển cấm chạy và cấm ăn uống",
    T(160, 20, "プール", "tm tb lgx") +
    '<rect class="wt" x="0" y="132" width="320" height="68"/>' + waves(30, 152) + waves(140, 166) + waves(240, 150) +
    sign(90, runner, "はしる") + sign(232, burger, "たべもの"));

  /* 20 · Bài 10 · Vườn thú */
  var monkey = '<ellipse class="wd" cx="62" cy="138" rx="20" ry="26"/><circle class="wd" cx="40" cy="96" r="7"/><circle class="wd" cx="84" cy="96" r="7"/><circle class="wd" cx="62" cy="98" r="20"/>' +
    '<ellipse class="sk" cx="62" cy="104" rx="13" ry="11"/><circle class="ey" cx="56" cy="100" r="2"/><circle class="ey" cx="68" cy="100" r="2"/><path class="mo" d="M58,108 q4,3 8,0"/>' +
    '<path class="yl" d="M84,118 q16,4 14,-16 q-4,14 -16,10 Z"/><line class="arO" x1="74" y1="130" x2="86" y2="120"/><line class="ar" x1="74" y1="130" x2="86" y2="120"/>';
  var birds = '<path class="ln" d="M130,46 q8,-10 16,0 q8,-10 16,0"/><path class="ln" d="M170,30 q6,-8 12,0 q6,-8 12,0"/><path class="ln" d="M196,58 q5,-7 10,0 q5,-7 10,0"/>';
  var panda = '<ellipse class="wh" cx="262" cy="150" rx="38" ry="20"/><ellipse class="dkf" cx="270" cy="162" rx="12" ry="8"/><ellipse class="dkf" cx="290" cy="156" rx="9" ry="8"/>' +
    '<circle class="dkf" cx="214" cy="126" r="7"/><circle class="dkf" cx="238" cy="126" r="7"/><circle class="wh" cx="226" cy="142" r="20"/>' +
    '<ellipse class="dkf" cx="218" cy="141" rx="5" ry="6"/><ellipse class="dkf" cx="234" cy="141" rx="5" ry="6"/><path class="hand" d="M216,142 h4 M232,142 h4"/><circle class="ey" cx="226" cy="150" r="2"/>' +
    T(250, 112, "Zzz", "tb lgx");
  S.t20 = svg("Vườn thú: con khỉ đang ăn chuối, chim đang bay, gấu trúc đang ngủ",
    T(160, 20, "どうぶつえん", "tm tb lgx") + ground + monkey + birds + panda +
    T(62, 192, "サル", "tm sm tb") + T(172, 80, "とり", "tm sm tb") + T(262, 192, "パンダ", "tm sm tb"));

  /* 21 · Bài 10 · Việc chưa làm */
  var list = [["しゅくだい", true], ["そうじ", true], ["てがみ", false]];
  S.t21 = svg("Danh sách việc: bài tập xong, dọn dẹp xong, viết thư chưa xong",
    '<rect class="wd" x="84" y="16" width="152" height="176" rx="8"/><rect class="wh" x="94" y="30" width="132" height="154" rx="4"/>' +
    '<rect class="gr" x="138" y="10" width="44" height="14" rx="4"/>' + T(160, 52, "きょう", "txd tm tb") +
    list.map(function (it, i) {
      var y = 84 + i * 36;
      return '<rect class="pnl" x="106" y="' + (y - 11) + '" width="20" height="20" rx="3"/>' + (it[1] ? ok(116, y - 1, 0.8) : "") + T(136, y + 5, it[0], "txd tb");
    }).join(""));

  /* 22 · Bài 10 · Đi mua rồi về */
  S.t22 = svg("Người này đi ra cửa hàng tiện lợi mua nước rồi quay về nhà",
    ground + house(14, 176, 92, 92, "うち") + '<rect class="dkf" x="48" y="140" width="24" height="36"/>' +
    P(92, 176, 74, { c: "c1" }) +
    shop(212, 176, 94, 80, "コンビニ") +
    A(122, 104, 196, 104) + A(196, 150, 122, 150) + bottle(160, 96) + T(160, 168, "？", "tm tb lgx"));

  /* 23 · Bài 10 · Thay đổi */
  S.t23 = svg("Mười năm trước là đứa trẻ thấp; bây giờ cao lớn và là bác sĩ",
    '<rect class="pnl" x="8" y="10" width="140" height="180" rx="8"/><rect class="pnl" x="172" y="10" width="140" height="180" rx="8"/>' +
    T(78, 32, "10ねんまえ", "tm tb") + T(242, 32, "いま", "tm tb") +
    '<line class="ln" x1="20" y1="168" x2="136" y2="168"/><line class="ln" x1="184" y1="168" x2="300" y2="168"/>' +
    P(78, 168, 66, { c: "c3", big: true }) + P(242, 168, 122, { c: "wh" }) +
    '<path class="ln" d="M232,92 q10,26 20,0"/><circle class="gr" cx="242" cy="118" r="4"/>' + T(242, 184, "いしゃ", "tm sm tb") +
    A(150, 100, 170, 100));

  /* 24 · Bài 10 · Bản đồ (khó) */
  S.t24 = svg("Bản đồ: ra khỏi ga đi thẳng, qua đèn giao thông, rẽ trái ở góc thứ hai là bệnh viện",
    '<rect class="grass" x="0" y="0" width="320" height="200"/>' +
    '<rect class="road" x="150" y="0" width="28" height="170"/><rect class="road" x="0" y="104" width="320" height="24"/><rect class="road" x="0" y="40" width="320" height="24"/>' +
    signal(196, 140) + T(214, 160, "しんごう", "sm tb") +
    '<rect class="pnl" x="56" y="6" width="70" height="30" rx="4"/><rect class="rd" x="84" y="12" width="14" height="4"/><rect class="rd" x="89" y="7" width="4" height="14"/>' + T(91, 33, "びょういん", "txd tm sm tb") +
    '<rect class="wh" x="126" y="172" width="76" height="26" rx="4"/>' + T(164, 191, "駅", "txd tm tb lgx") +
    T(232, 124, "1", "tm tb") + T(232, 60, "2", "tm tb") +
    '<path class="rt" d="M164,168 L164,52 L104,52"/><path class="rth" d="M112,46 L102,52 L112,58"/>');

  /* 25 · Bài 11 · Khi nào (khó) */
  var flag = '<rect class="c3" x="196" y="54" width="22" height="44"/><rect class="wh" x="218" y="54" width="22" height="44"/><rect class="rd" x="240" y="54" width="22" height="44"/><line class="ln" x1="196" y1="54" x2="196" y2="128"/>';
  var hat = '<ellipse class="wd" cx="262" cy="160" rx="34" ry="8"/><path class="wd" d="M240,160 Q240,128 262,128 Q284,128 284,160 Z"/><rect class="rd" x="241" y="148" width="42" height="6"/>';
  S.t25 = svg("Khi là học sinh cấp 2 bắt đầu chơi guitar; khi đi Ý đã mua cái mũ này",
    '<rect class="pnl" x="8" y="10" width="146" height="180" rx="8"/><rect class="pnl" x="166" y="10" width="146" height="180" rx="8"/>' +
    T(81, 32, "ちゅうがくせい", "tm sm tb") + T(239, 32, "イタリア", "tm sm tb") +
    P(56, 176, 96, { c: "c1" }) + guitar(110, 82) + flag + hat);

  /* 26 · Bài 11 · Thích / không thích */
  var cat = '<path class="gr" d="M52,70 L60,46 L74,64 Z"/><path class="gr" d="M108,70 L100,46 L86,64 Z"/><circle class="gr" cx="80" cy="88" r="30"/>' +
    '<circle class="ey" cx="70" cy="84" r="3"/><circle class="ey" cx="90" cy="84" r="3"/><path class="mo" d="M74,96 q6,5 12,0"/>' +
    '<path class="thin" d="M50,92 l16,2 M50,100 l16,-2 M110,92 l-16,2 M110,100 l-16,-2"/>' +
    '<path class="rd" d="M80,150 C60,134 64,120 74,122 C78,123 80,127 80,130 C80,127 82,123 86,122 C96,120 100,134 80,150 Z"/>';
  var dog = '<circle class="wd" cx="240" cy="88" r="30"/><ellipse class="dkf" cx="212" cy="88" rx="9" ry="20"/><ellipse class="dkf" cx="268" cy="88" rx="9" ry="20"/>' +
    '<circle class="ey" cx="230" cy="82" r="3"/><circle class="ey" cx="250" cy="82" r="3"/><ellipse class="dkf" cx="240" cy="96" rx="6" ry="4"/><path class="mo" d="M234,104 q6,4 12,0"/>' +
    ng(240, 140, 1.4);
  S.t26 = svg("Tôi thích mèo nhưng không thích chó", T(80, 186, "ねこ", "tm tb") + T(240, 186, "いぬ", "tm tb") + cat + dog);

  /* 27 · Bài 11 · Nói chuyện với bạn (khó) */
  S.t27 = svg("Hai người bạn: một người rủ đi xem phim, người kia trả lời",
    ground + P(70, 172, 104, { c: "c1", label: "わたし" }) + P(250, 172, 104, { hair: "long", c: "c2", label: "ともだち" }) +
    bubble(10, 14, 130, 50, 64, 80, film(52, 39) + T(98, 46, "？", "txd tm tb lgx")) +
    bubble(180, 14, 130, 50, 254, 80, T(245, 46, "◯ ／ ✕", "txd tm tb")));

  /* 28 · Bài 11 · Cuối tuần (khó) */
  var broom = '<line class="hd" x1="48" y1="66" x2="70" y2="124"/><path class="yl" d="M58,122 L84,112 L96,148 L72,156 Z"/>';
  var bag = '<path class="ln" d="M146,92 q14,-26 28,0"/><rect class="c2" x="136" y="92" width="48" height="56" rx="4"/>' + bottle(152, 104) + '<circle class="rd" cx="170" cy="98" r="7"/>';
  var pot = '<rect class="gr" x="230" y="110" width="58" height="38" rx="6"/><rect class="dkf" x="226" y="104" width="66" height="8" rx="3"/><rect class="dkf" x="252" y="96" width="14" height="8" rx="3"/>' +
    '<path class="thin" d="M246,90 q-4,-8 0,-16 M260,88 q-4,-8 0,-16 M274,90 q-4,-8 0,-16"/>';
  S.t28 = svg("Cuối tuần: dọn dẹp, đi mua sắm, nấu ăn",
    T(160, 24, "せんしゅうの　しゅうまつ", "tm tb") +
    [64, 160, 258].map(function (cx) { return '<circle class="pnl" cx="' + cx + '" cy="112" r="45"/>'; }).join("") + broom + bag + pot);

  /* ---------- Questions ---------- */
  var Q = [
    { id: "t11", lesson: "8", qs: [
      { q: "この　ひとの　かぞくは　なんにんですか。", qvi: "Gia đình người này có mấy người?", pat: "～人 です", words: "ろくにん (6 người)",
        a: "６にん　かぞくです。", alt: "かぞくは　６にんです。", avi: "Gia đình có 6 người.",
        g: [[B8 + " · mục 8", "N が（～人）います", "Đếm người: ひとり、ふたり、さんにん、よにん、ごにん、ろくにん…"]] },
      { q: "きょうだいが　いますか。なんにん　いますか。", qvi: "Bạn có anh chị em không? Có mấy người?", pat: "N（người）が（～人）います", words: "あに、いもうと、ひとり、ふたり",
        a: "はい、あにが　ひとりと　いもうとが　ふたり　います。", avi: "Có, tôi có một anh trai và hai em gái.",
        g: [[B8 + " · mục 8", "N（người）が（～人）います", "Số người đặt ngay trước います: あにが ひとり います. Nối hai người bằng と."]] }] },
    { id: "t12", lesson: "8", hard: true, qs: [
      { q: "たなかさんは　ランさんに　なにを　あげましたか。", qvi: "Tanaka đã tặng Lan cái gì?", pat: "S は N1 に N2 を あげます", words: "ほん (sách)",
        a: "ほんを　あげました。", alt: "たなかさんは　ランさんに　ほんを　あげました。", avi: "Tanaka đã tặng Lan quyển sách.",
        g: [[B8 + " · mục 5", "（người）に（vật）を あげます", "Người cho là chủ ngữ, người nhận đi với に."]] },
      { q: "ランさんは　わたしに　なにを　くれましたか。", qvi: "Lan đã cho tôi cái gì?", pat: "N1 が 私に N2 を くれます", words: "チョコレート",
        a: "チョコレートを　くれました。", avi: "Lan đã cho tôi sô cô la.",
        g: [[B8 + " · mục 7", "N1 が 私に N2 を くれます", "Người khác cho “tôi” → くれます, không dùng あげます."]] },
      { q: "たなかさんは　だれに　はなを　もらいましたか。", qvi: "Tanaka đã nhận hoa từ ai?", pat: "N1（người）に N2 を もらいます", words: "わたし",
        a: "わたしに　はなを　もらいました。", alt: "わたしから　はなを　もらいました。", avi: "Tanaka đã nhận hoa từ tôi.",
        g: [[B8 + " · mục 6", "（người）に（vật）を もらいます", "Nhìn từ phía người nhận (たなかさん). Người cho (わたし) đi với に hoặc から."]] }] },
    { id: "t13", lesson: "8", qs: [
      { q: "ケンさんは　どんな　ひとですか。", qvi: "Ken là người như thế nào?", pat: "N1 は N2 が A ／ イAくて、～", words: "せ、たかい、かみ、みじかい",
        a: "ケンさんは　せが　たかくて、かみが　みじかいです。", avi: "Ken cao và tóc ngắn.",
        g: [[B8 + " · mục 3", "N1 は N2 が A です", "せが たかい, かみが みじかい: tả bộ phận của người."], [B8 + " · mục 4", "イA くて、～", "たかい → たかくて để nối với đặc điểm tiếp theo."]] },
      { q: "ユミさんは　どんな　ひとですか。", qvi: "Yumi là người như thế nào?", pat: "N1 は N2 が A ／ イAくて、～", words: "かみ、ながい、め、おおきい",
        a: "ユミさんは　かみが　ながくて、めが　おおきいです。", alt: "ユミさんは　めが　おおきくて、かわいいです。", avi: "Yumi tóc dài và mắt to.",
        g: [[B8 + " · mục 4", "イA くて、～", "ながい → ながくて, おおきい → おおきくて."]] }] },
    { id: "t14", lesson: "8", qs: [
      { q: "この　ひとは　だれと　すんで　いますか。", qvi: "Người này đang sống cùng ai?", pat: "Vて います ／（～人）で", words: "ルームメイト、すみます、さんにん",
        a: "ルームメイトと　３にんで　すんで　います。", avi: "Người này sống cùng bạn cùng phòng, tất cả 3 người.",
        g: [[B8 + " · mục 1", "Vて います", "すみます → すんで います: trạng thái đang sống ở đâu, với ai."], [B8 + " · mục 9", "（～人）で", "３にんで: tổng số người cùng làm việc đó, tính cả mình."]] }] },
    { id: "t15", lesson: "9", qs: [
      { q: "ハンさんの　しゅみは　なんですか。", qvi: "Sở thích của Han là gì?", pat: "しゅみは Vる ことです", words: "しゃしん、とります (chụp)",
        a: "しゃしんを　とる　ことです。", alt: "ハンさんの　しゅみは　やまの　しゃしんを　とる　ことです。", avi: "Sở thích của Han là chụp ảnh.",
        g: [[B9 + " · mục 1", "趣味は Vる ことです", "とります → thể từ điển とる + ことです."]] },
      { q: "ハンさんは　１かげつに　なんかい　やまへ　いきますか。", qvi: "Một tháng Han đi núi mấy lần?", pat: "［khoảng thời gian］に ［số lần］", words: "１かげつ、～かい",
        a: "１かげつに　２かい　いきます。", avi: "Một tháng đi 2 lần.",
        g: [[B9 + " · mục 4", "［～か月…］に ［～回…］", "Đếm số dấu trên lịch tháng: 2 lần."]] }] },
    { id: "t16", lesson: "9", hard: true, qs: [
      { q: "リンさんは　かんじを　よむ　ことが　できますか。", qvi: "Rin có đọc được chữ Hán không?", pat: "Vる ことが できます／できません", words: "かんじ、よみます",
        a: "いいえ、できません。", alt: "いいえ、かんじを　よむ　ことが　できません。", avi: "Không, Rin không đọc được.",
        g: [[B9 + " · mục 2", "N／Vる ことが できます", "Phủ định: ～ことが できません."]] },
      { q: "リンさんは　なにが　できますか。", qvi: "Rin làm được những gì?", pat: "Vる ことが できます", words: "およぎます、くるま、うんてんします",
        a: "およぐ　ことと　くるまを　うんてんする　ことが　できます。", alt: "すいえいと　うんてんが　できます。", avi: "Rin bơi được và lái xe được.",
        g: [[B9 + " · mục 2", "N／Vる ことが できます", "Hai việc: Vる ことと Vる ことが できます."]] },
      { q: "トムさんは　なにが　できて、なにが　できませんか。", qvi: "Tom làm được gì và không làm được gì?", pat: "～が できますが、～は できません", words: "かんじ、よみます、およぎます、うんてんします",
        a: "かんじを　よむ　ことが　できますが、およぐ　ことと　うんてんする　ことは　できません。", avi: "Tom đọc được chữ Hán nhưng không bơi và không lái xe được.",
        g: [[B9 + " · mục 2", "Vる ことが できます", "Nối hai vế trái ngược bằng が (nhưng)."], [B11 + " · mục 3", "N1 は ～が、N2 は ～", "Ở vế phủ định đổi が thành は (ことは できません) để nhấn sự đối lập."]] }] },
    { id: "t17", lesson: "9", qs: [
      { q: "この　ひとは　コーヒーを　よく　のみますか。", qvi: "Người này có hay uống cà phê không?", pat: "いつも／よく／ときどき", words: "まいにち、いつも",
        a: "はい、まいにち　のみます。", alt: "はい、いつも　のみます。", avi: "Có, ngày nào cũng uống.",
        g: [[B9 + " · mục 5", "いつも／よく／ときどき／あまり／全然", "7 ngày/tuần → いつも, まいにち."]] },
      { q: "えいがを　よく　みますか。", qvi: "Người này có hay xem phim không?", pat: "あまり ＋ Vません", words: "あまり",
        a: "いいえ、あまり　みません。", alt: "いっしゅうかんに　１かい　みます。", avi: "Không, không xem nhiều lắm.",
        g: [[B9 + " · mục 5", "あまり ＋ Vません", "Ít khi → あまり + động từ phủ định."]] },
      { q: "おさけを　のみますか。", qvi: "Người này có uống rượu không?", pat: "全然 ＋ Vません", words: "ぜんぜん",
        a: "いいえ、ぜんぜん　のみません。", avi: "Không, hoàn toàn không uống.",
        g: [[B9 + " · mục 5", "全然 ＋ Vません", "0 lần → ぜんぜん + động từ phủ định."]] }] },
    { id: "t18", lesson: "9", hard: true, qs: [
      { q: "どうやって　びじゅつかんへ　いきますか。", qvi: "Đi đến bảo tàng mỹ thuật bằng cách nào?", pat: "どうやって ／ Vて、V", words: "３ばん、バス、のります、びじゅつかんまえ、おります",
        a: "３ばんの　バスに　のって、びじゅつかんまえで　おります。", avi: "Đi xe buýt số 3, rồi xuống ở bến trước bảo tàng.",
        g: [[B9 + " · mục 6", "どうやって", "Hỏi cách đi; trả lời bằng chuỗi hành động."], [B9 + " · mục 3", "V1て、V2", "のります → のって. Lên xe: バスに のります; xuống ở đâu: ～で おります."]] }] },
    { id: "t19", lesson: "10", hard: true, qs: [
      { q: "プールで　はしっても　いいですか。", qvi: "Ở hồ bơi chạy có được không?", pat: "Vない ＋ でください", words: "はしります → はしらない",
        a: "いいえ、はしらないで　ください。", avi: "Không, xin đừng chạy.",
        g: [[B10 + " · mục 1", "Vない ＋ でください", "はしります → はしらない → はしらないで ください."], [B10 + " · mục 2", "Vて ＋ もいいですか", "はしります → はしって もいいですか (xin phép)."]] },
      { q: "プールの　ひとは　なんと　いいますか。ふたつ　いって　ください。", qvi: "Nhân viên hồ bơi nói gì? Hãy nói hai câu.", pat: "Vない ＋ でください", words: "はしります、たべもの、たべます",
        a: "はしらないで　ください。ここで　たべものを　たべないで　ください。", avi: "Xin đừng chạy. Xin đừng ăn đồ ăn ở đây.",
        g: [[B10 + " · mục 1", "Vない ＋ でください", "たべます (nhóm 2) → たべない → たべないで ください."]] }] },
    { id: "t20", lesson: "10", qs: [
      { q: "サルは　なにを　して　いますか。", qvi: "Con khỉ đang làm gì?", pat: "Vて います", words: "バナナ、たべます",
        a: "バナナを　たべて　います。", avi: "Con khỉ đang ăn chuối.",
        g: [[B10 + " · mục 3", "N が Vて います", "Tả việc đang xảy ra trước mắt."]] },
      { q: "なにが　とんで　いますか。", qvi: "Con gì đang bay?", pat: "N が Vて います", words: "とり、とびます",
        a: "とりが　とんで　います。", avi: "Những con chim đang bay.",
        g: [[B10 + " · mục 3", "N が Vて います", "Hỏi なにが → trả lời bằng ～が: とりが とんで います. とびます → とんで."]] },
      { q: "パンダは　なにを　して　いますか。", qvi: "Gấu trúc đang làm gì?", pat: "Vて います", words: "ねます (ngủ)",
        a: "ねて　います。", alt: "パンダは　ねて　います。", avi: "Gấu trúc đang ngủ.",
        g: [[B10 + " · mục 3", "N が Vて います", "ねます (nhóm 2) → ねて います."]] }] },
    { id: "t21", lesson: "10", qs: [
      { q: "もう　しゅくだいを　しましたか。", qvi: "Bạn đã làm bài tập chưa?", pat: "もう Vました", words: "もう (đã… rồi)",
        a: "はい、もう　しました。", avi: "Rồi, tôi đã làm rồi.",
        g: [[B10 + " · mục 4", "まだ Vて いません", "Việc đã xong → はい、もう Vました."]] },
      { q: "もう　てがみを　かきましたか。", qvi: "Bạn đã viết thư chưa?", pat: "まだ Vて いません", words: "まだ、かきます → かいて",
        a: "いいえ、まだ　かいて　いません。", avi: "Chưa, tôi vẫn chưa viết.",
        g: [[B10 + " · mục 4", "まだ Vて いません", "Chưa làm: まだ + Vて いません (không nói まだ かきません)."]] }] },
    { id: "t22", lesson: "10", qs: [
      { q: "でかける　とき、この　ひとは　なんと　いいますか。", qvi: "Khi ra ngoài, người này nói gì?", pat: "Vて きます", words: "ちょっと、コンビニ、ジュース、かいます",
        a: "ちょっと　コンビニで　ジュースを　かって　きます。", avi: "Tôi ra cửa hàng tiện lợi mua nước rồi về ngay.",
        g: [[B10 + " · mục 5", "Vて きます", "Đi làm việc gì rồi quay lại: かいます → かって きます. Nơi mua dùng で."]] }] },
    { id: "t23", lesson: "10", qs: [
      { q: "この　ひとは　なにに　なりましたか。", qvi: "Người này đã trở thành gì?", pat: "N に なります", words: "いしゃ (bác sĩ)",
        a: "いしゃに　なりました。", avi: "Người này đã trở thành bác sĩ.",
        g: [[B10 + " · mục 8", "N に なります", "Danh từ + に なります."]] },
      { q: "せは　どう　なりましたか。", qvi: "Chiều cao đã thay đổi thế nào?", pat: "イA く なります", words: "せ、たかい",
        a: "せが　たかく　なりました。", avi: "Đã cao lên.",
        g: [[B10 + " · mục 8", "イA く なります", "たかい → たかく なりました."]] }] },
    { id: "t24", lesson: "10", hard: true, qs: [
      { q: "えきから　びょういんまで　どうやって　いきますか。", qvi: "Từ ga đến bệnh viện đi thế nào?", pat: "N（nơi chốn）を V ／ Vて、Vてください", words: "でます、まっすぐ、しんごう、わたります、ふたつめ、かど、ひだり、まがります",
        a: "えきを　でて、まっすぐ　いって、ふたつめの　かどを　ひだりに　まがって　ください。", alt: "まっすぐ　いって、しんごうを　わたって、ふたつめの　かどを　ひだりへ　まがって　ください。", avi: "Ra khỏi ga, đi thẳng, rẽ trái ở góc thứ hai.",
        g: [[B10 + " · mục 9", "N（địa điểm）を Vます", "えきを でます, かどを まがります: nơi rời khỏi hoặc đi qua dùng を."], ["Từ mới bài 10", "～つ目", "ふたつめの かど = góc thứ hai. Hướng rẽ: ひだりに／ひだりへ."]] },
      { q: "ひとつめの　こうさてんに　なにが　ありますか。", qvi: "Ở ngã tư thứ nhất có cái gì?", pat: "N に N が あります", words: "しんごう (đèn giao thông)",
        a: "しんごうが　あります。", avi: "Có đèn giao thông.",
        g: [["Ôn tập", "N（nơi chốn）に N が あります", "Nói vật ở đâu: ～に ～が あります."]] }] },
    { id: "t25", lesson: "11", hard: true, qs: [
      { q: "いつ　ギターを　はじめましたか。", qvi: "Bạn bắt đầu chơi guitar từ khi nào?", pat: "N の とき", words: "ちゅうがくせい、はじめます",
        a: "ちゅうがくせいの　とき、はじめました。", avi: "Tôi bắt đầu khi là học sinh cấp 2.",
        g: [[B11 + " · mục 4", "N の とき", "Danh từ + の + とき: ちゅうがくせいの とき."]] },
      { q: "この　ぼうしは　いつ　かいましたか。", qvi: "Cái mũ này mua khi nào?", pat: "Vた とき", words: "イタリア、いきます → いった",
        a: "イタリアへ　いった　とき、かいました。", avi: "Tôi mua khi đi Ý.",
        g: [[B11 + " · mục 4", "Vた とき", "Việc mua xảy ra ở Ý, sau khi đã đến nơi → いった とき (thể た, chia giống thể て)."]] }] },
    { id: "t26", lesson: "11", qs: [
      { q: "ねこと　いぬが　すきですか。", qvi: "Bạn có thích mèo và chó không?", pat: "N1 は ～が、N2 は ～", words: "すき、すきじゃありません",
        a: "ねこは　すきですが、いぬは　すきじゃ　ありません。", avi: "Tôi thích mèo nhưng không thích chó.",
        g: [[B11 + " · mục 3", "N1 は ～が、N2 は ～", "So sánh hai thứ: đổi が thành は ở cả hai vế (ねこは…, いぬは…)."]] }] },
    { id: "t27", lesson: "11", hard: true, qs: [
      { q: "「いっしょに　えいがを　みませんか。」を　ともだちことばで　いって　ください。", qvi: "Nói câu “Cùng đi xem phim không?” bằng văn nói với bạn bè.", pat: "Vない？（rủ rê）", words: "みます → みない",
        a: "いっしょに　えいがを　みない？", avi: "Đi xem phim với tớ không?",
        g: [[B11 + " · mục 6", "友達言葉：～ない？", "Rủ rê thân mật: Vませんか → Vない？ (lên giọng)."]] },
      { q: "ともだちは　「はい、みます。」と　いいたいです。ともだちことばで　いって　ください。", qvi: "Bạn muốn trả lời “Vâng, đi xem”. Nói bằng văn nói thân mật.", pat: "うん、V る", words: "うん、みる",
        a: "うん、みる。", alt: "うん、いいよ。", avi: "Ừ, xem chứ.",
        g: [[B11 + " · mục 6", "友達言葉", "はい → うん, みます → みる (thể từ điển)."]] },
      { q: "「いいえ、みません。」は　ともだちことばで　なんですか。", qvi: "“Không, không xem” nói thân mật thế nào?", pat: "ううん、Vない", words: "ううん、みない",
        a: "ううん、みない。", alt: "ごめん、ちょっと…。", avi: "Không, tớ không xem đâu.",
        g: [[B11 + " · mục 6", "友達言葉", "いいえ → ううん, みません → みない."]] }] },
    { id: "t28", lesson: "11", hard: true, qs: [
      { q: "せんしゅうの　しゅうまつ、なにを　しましたか。", qvi: "Cuối tuần trước bạn đã làm gì?", pat: "Vたり、Vたり しました", words: "そうじ、かいもの、いきます、りょうり、つくります",
        a: "そうじを　したり、かいものに　いったり　しました。", alt: "そうじを　したり、りょうりを　つくったり　しました。", avi: "Tôi lúc thì dọn dẹp, lúc thì đi mua sắm.",
        g: [[B11 + " · mục 2", "Vたり、Vたり します", "Chuyện đã qua → chia thì ở します cuối: ～たり しました. いきます → いったり, つくります → つくったり."]] }] },
  ];

  return { S: S, Q: Q };
};
