/* Feraiz hesaplayıcı (Hanefî; ders notundaki kurallar).
   coz({anahtar: sayı, ...}) → {satirlar, mahrec, tur, ...} */
const VARISLER = [
  // anahtar, Arapça, Türkçe, en çok
  ['zevc', 'زوج', 'Koca', 1], ['zevce', 'زوجة', 'Karı', 4],
  ['eb', 'أب', 'Baba', 1], ['cedd', 'جد', 'Dede (babanın babası)', 1],
  ['um', 'أم', 'Anne', 1], ['ceddeU', 'أم الأم', 'Anneanne', 1], ['ceddeB', 'أم الأب', 'Babaanne', 1],
  ['ceddeUU', 'أم أم الأم', 'Anneannenin annesi', 1], ['ceddeUB', 'أم أم الأب', 'Babaannenin annesi', 1], ['ceddeBB', 'أم أب الأب', 'Dedenin annesi', 1], ['ceddeUUU', 'أم أم أم الأم', 'Anneannenin anneannesi', 1],
  ['ibn', 'ابن', 'Oğul', 20], ['bint', 'بنت', 'Kız', 20],
  ['ibnIbn', 'ابن ابن', 'Oğlun oğlu', 20], ['bintIbn', 'بنت ابن', 'Oğlun kızı', 20],
  ['ibn3', 'ابن ابن الابن', 'Oğlun oğlunun oğlu', 20], ['bint3', 'بنت ابن الابن', 'Oğlun oğlunun kızı', 20],
  ['ibn4', 'ابن ابن ابن الابن', 'Oğlun oğlunun oğlunun oğlu', 20], ['bint4', 'بنت ابن ابن الابن', 'Oğlun oğlunun oğlunun kızı', 20],
  ['ahS', 'أخ ش', 'Öz erkek kardeş', 20], ['uhtS', 'أخت ش', 'Öz kız kardeş', 20],
  ['ahB', 'أخ لأب', 'Baba bir erkek kardeş', 20], ['uhtB', 'أخت لأب', 'Baba bir kız kardeş', 20],
  ['ahU', 'أخ لأم', 'Anne bir erkek kardeş', 20], ['uhtU', 'أخت لأم', 'Anne bir kız kardeş', 20],
  ['ibnAhS', 'ابن أخ ش', 'Öz erkek kardeşin oğlu', 20], ['ibnAhB', 'ابن أخ لأب', 'Baba bir erkek kardeşin oğlu', 20],
  ['amS', 'عم ش', 'Öz amca', 20], ['amB', 'عم لأب', 'Baba bir amca', 20],
  ['ibnAmS', 'ابن عم ش', 'Öz amcanın oğlu', 20], ['ibnAmB', 'ابن عم لأب', 'Baba bir amcanın oğlu', 20],
  // zevi'l-erhâm (önceki beş sınıftan biri varken «لا»)
  ['ebUm', 'أب الأم', 'Annenin babası (fasid dede)', 1], ['ceddeF', 'أم أب الأم', 'Fasid nene', 1],
  ['bintBint', 'بنت البنت', 'Kızın kızı', 20], ['ibnBint', 'ابن البنت', 'Kızın oğlu', 20],
];
const ZEVI = ['ebUm', 'ceddeF', 'bintBint', 'ibnBint'];
// nene: [anahtar, derece, baba tarafından mı, dede üzerinden mi]
const NENE = [['ceddeU', 1, false], ['ceddeB', 1, true], ['ceddeUU', 2, false], ['ceddeUB', 2, true], ['ceddeBB', 2, true, true], ['ceddeUUU', 3, false]];
const VAR = Object.fromEntries(VARISLER.map(([k, a, t, m]) => [k, {k, a, t, m}]));
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const lcm = (a, b) => a / gcd(a, b) * b;
// Bir öncelik sırası: asabe binefsihi (uhtS/uhtB maa'l-gayr, öz/baba bir erkek kardeş yerinde)
const ASABE_SIRA = ['ibn', 'ibnIbn', 'ibn3', 'ibn4', 'eb', 'cedd', 'ahS', 'uhtS*', 'ahB', 'uhtB*', 'ibnAhS', 'ibnAhB', 'amS', 'amB', 'ibnAmS', 'ibnAmB'];

function coz(g) {
  const n = k => g[k] || 0, var_ = k => n(k) > 0;
  const ERK = ['ibn', 'ibnIbn', 'ibn3', 'ibn4'], KIZ = ['bint', 'bintIbn', 'bint3', 'bint4'];
  const furuErkek = ERK.some(var_);
  const furu = furuErkek || KIZ.some(var_);
  const kardes = n('ahS') + n('uhtS') + n('ahB') + n('uhtB') + n('ahU') + n('uhtU');
  const R = {};   // anahtar → {hal, f:[pay, payda] | null, asabe:bool, m:'م'|null, neden}
  const set = (k, o) => { if (var_(k)) R[k] = Object.assign({f: null, asabe: false, m: null, neden: ''}, o); };
  const mahcub = (k, neden) => set(k, {hal: 'م', m: 'م', neden});

  // ---- eşler
  set('zevc', furu ? {hal: '1/4', f: [1, 4], neden: 'Ölenin fürûu var: koca 1/4 alır.'} : {hal: '1/2', f: [1, 2], neden: 'Ölenin fürûu yok: koca 1/2 alır.'});
  set('zevce', furu ? {hal: '1/8', f: [1, 8], neden: 'Ölenin fürûu var: karı 1/8 alır.'} : {hal: '1/4', f: [1, 4], neden: 'Ölenin fürûu yok: karı 1/4 alır.'});
  // ---- baba, dede
  const babaHal = who => furuErkek ? {hal: '1/6', f: [1, 6], neden: `Erkek fürû var: ${who} yalnız 1/6 alır.`}
    : furu ? {hal: '1/6+ع', f: [1, 6], asabe: true, neden: `Yalnız kız fürû var: ${who} 1/6 ve kalanı alır.`}
    : {hal: 'ع', asabe: true, neden: `Fürû yok: ${who} asabe olarak kalanı alır.`};
  set('eb', babaHal('baba'));
  if (var_('eb')) mahcub('cedd', 'Dede baba ile mahcub olur.'); else set('cedd', babaHal('dede'));
  // ---- anne
  const omeriyye = var_('eb') && (var_('zevc') || var_('zevce')) && !furu && kardes < 2;
  if (furu || kardes >= 2) set('um', {hal: '1/6', f: [1, 6], neden: furu ? 'Ölenin fürûu var: anne 1/6 alır.' : 'Birden fazla kardeş var (mahcub olsalar da): anne 1/6 alır.'});
  else if (omeriyye) set('um', {hal: '1/3 الباقي', f: var_('zevc') ? [1, 6] : [1, 4], omer: true, neden: 'Ömeriyye: anne, baba ve eşle beraber; eşin payından kalanın 1/3’ünü alır.'});
  else set('um', {hal: '1/3', f: [1, 3], neden: 'Fürû ve birden fazla kardeş yok: anne 1/3 alır.'});
  // ---- neneler (Hanefî): anne hepsini, baba baba tarafındakileri, dede kendi üzerinden gelenleri, yakın nene uzak neneyi hacbeder
  {
    const var_n = NENE.filter(([k]) => var_(k));
    const uygun = [];
    var_n.forEach(([k, d, bt, dd]) => {
      if (var_('um')) mahcub(k, 'Anne bütün neneleri hacbeder.');
      else if (bt && var_('eb')) mahcub(k, 'Baba, baba tarafındaki neneleri hacbeder.');
      else if (dd && var_('cedd')) mahcub(k, 'Dede, kendisi vasıtasıyla ölüye ulaşan neneyi hacbeder.');
      else uygun.push([k, d]);
    });
    const en = Math.min(...uygun.map(x => x[1]));
    const yakin = uygun.filter(x => x[1] === en);
    uygun.forEach(([k, d]) => { if (d > en) mahcub(k, 'Yakın nene uzak neneyi hacbeder.'); });
    yakin.forEach(([k]) => set(k, {hal: '1/6', f: [1, 6], grup: 'cedde', neden: yakin.length > 1 ? 'Aynı derecedeki neneler 1/6’yı paylaşır.' : 'Hacbeden yok: nene 1/6 alır.'}));
  }
  // ---- fürû (oğul, kız ve aşağısı; ibnü'l-mübârek dahil)
  {
    const Lm = ERK.findIndex(var_);   // en yakın erkek fürûnun derecesi (0 = oğul)
    let alinan = 0;                   // 0: yok, 1: 1/2 alındı, 2: 2/3 doldu
    const DAD = ['Kız', 'Oğlun kızı', 'Oğlun oğlunun kızı', 'Dördüncü derece kız'];
    for (let L = 0; L < 4; L++) {
      const e = ERK[L], k = KIZ[L];
      if (Lm >= 0 && L > Lm) { mahcub(e, `${VAR[e].t}, daha yakın erkek fürû ile mahcub olur.`); mahcub(k, `${VAR[k].t}, daha yakın erkek fürû ile mahcub olur.`); continue; }
      if (L === Lm) {
        set(e, {hal: 'ع', asabe: true, neden: `${VAR[e].t} asabedir.`});
        set(k, {hal: 'ع', asabe: true, neden: `${VAR[k].t}, kendi derecesindeki erkekle asabe bi-gayrihi olur.`});
        continue;
      }
      if (!var_(k)) continue;
      if (alinan === 2) {
        if (Lm > L) set(k, {hal: 'ع', asabe: true, mubarek: true, neden: `Normalde mahcub olan ${VAR[k].t.toLowerCase()}, aşağıdaki erkek fürû (ibnü’l-mübârek) ile asabe bi-gayrihi olur.`});
        else mahcub(k, `Üsttekiler 2/3’ü tamamladığı için ${VAR[k].t.toLowerCase()} mahcub olur.`);
      } else if (alinan === 1) { set(k, {hal: '1/6', f: [1, 6], neden: `Üstte tek kız 1/2 aldığı için ${VAR[k].t.toLowerCase()} 1/6 alır (tekmiletü’s-sülüseyn).`}); alinan = 2; }
      else if (n(k) === 1) { set(k, {hal: '1/2', f: [1, 2], neden: `Tek ${VAR[k].t.toLowerCase()} 1/2 alır.`}); alinan = 1; }
      else { set(k, {hal: '2/3', f: [2, 3], neden: `Birden fazla ${VAR[k].t.toLowerCase()} 2/3 alır.`}); alinan = 2; }
    }
  }
  // ---- kardeşler
  const usulErkek = var_('eb') || var_('cedd');
  const kizFuru = KIZ.some(k => var_(k) && R[k] && !R[k].m);
  const kHacb = furuErkek ? 'erkek fürû' : var_('eb') ? 'baba' : var_('cedd') ? 'dede' : null;
  if (kHacb) ['ahS', 'uhtS', 'ahB', 'uhtB'].forEach(k => mahcub(k, `Öz ve baba bir kardeşler ${kHacb} ile mahcub olur.`));
  else {
    set('ahS', {hal: 'ع', asabe: true, neden: 'Öz erkek kardeş asabedir.'});
    if (var_('ahS')) set('uhtS', {hal: 'ع', asabe: true, neden: 'Öz kız kardeş, öz erkek kardeşle asabe bi-gayrihi olur.'});
    else if (kizFuru) set('uhtS', {hal: 'ع', asabe: true, maa: true, neden: 'Öz kız kardeş, kız/oğlun kızı ile asabe maa’l-gayr olur.'});
    else set('uhtS', n('uhtS') === 1 ? {hal: '1/2', f: [1, 2], neden: 'Tek öz kız kardeş 1/2 alır.'} : {hal: '2/3', f: [2, 3], neden: 'Birden fazla öz kız kardeş 2/3 alır.'});
    const uhtSmaa = R.uhtS && R.uhtS.maa;
    if (var_('ahS')) { mahcub('ahB', 'Baba bir erkek kardeş öz erkek kardeş ile mahcub olur.'); mahcub('uhtB', 'Baba bir kız kardeş öz erkek kardeş ile mahcub olur.'); }
    else if (uhtSmaa) { mahcub('ahB', 'Asabe maa’l-gayr olan öz kız kardeş, öz erkek kardeş gibidir.'); mahcub('uhtB', 'Asabe maa’l-gayr olan öz kız kardeş baba bir kız kardeşi hacbeder.'); }
    else {
      set('ahB', {hal: 'ع', asabe: true, neden: 'Baba bir erkek kardeş asabedir.'});
      if (var_('ahB')) set('uhtB', {hal: 'ع', asabe: true, neden: 'Baba bir kız kardeş, baba bir erkek kardeşle asabe bi-gayrihi olur.'});
      else if (kizFuru) set('uhtB', {hal: 'ع', asabe: true, maa: true, neden: 'Baba bir kız kardeş, kız/oğlun kızı ile asabe maa’l-gayr olur.'});
      else if (n('uhtS') >= 2) mahcub('uhtB', 'Birden fazla öz kız kardeş varken baba bir kız kardeş mahcub olur.');
      else if (n('uhtS') === 1) set('uhtB', {hal: '1/6', f: [1, 6], neden: 'Bir öz kız kardeşle baba bir kız kardeş 1/6 alır (tekmiletü’s-sülüseyn).'});
      else set('uhtB', n('uhtB') === 1 ? {hal: '1/2', f: [1, 2], neden: 'Tek baba bir kız kardeş 1/2 alır.'} : {hal: '2/3', f: [2, 3], neden: 'Birden fazla baba bir kız kardeş 2/3 alır.'});
    }
  }
  // anne bir kardeşler
  const uHacb = furu ? 'ölenin fürûu' : usulErkek ? (var_('eb') ? 'baba' : 'dede') : null;
  const nU = n('ahU') + n('uhtU');
  ['ahU', 'uhtU'].forEach(k => uHacb ? mahcub(k, `Anne bir kardeşler ${uHacb} ile mahcub olur.`)
    : set(k, nU === 1 ? {hal: '1/6', f: [1, 6], neden: 'Tek anne bir kardeş 1/6 alır.'} : {hal: '1/3', f: [1, 3], grup: 'umKardes', neden: 'Birden fazla anne bir kardeş 1/3’ü eşit paylaşır.'}));
  // ---- asabe zinciri: en öndeki asabe dışındakiler mahcub
  let onde = null;
  for (const a of ASABE_SIRA) {
    const k = a.replace('*', '');
    if (!R[k] || R[k].m) continue;
    if (a.endsWith('*') && !R[k].maa) continue;
    if (!a.endsWith('*') && !R[k].asabe) continue;
    if (['bint', 'bintIbn', 'bint3', 'bint4', 'uhtS', 'uhtB'].includes(k) && !a.endsWith('*')) continue;
    onde = k; break;
  }
  ['ibnAhS', 'ibnAhB', 'amS', 'amB', 'ibnAmS', 'ibnAmB'].forEach(k => {
    if (!var_(k)) return;
    if (onde && onde !== k) mahcub(k, `${VAR[k].t}, ${R[onde] ? VAR[onde].t.toLowerCase() : ''} varken asabe olamaz (cihet/derece/kuvvet).`);
    else set(k, {hal: 'ع', asabe: true, neden: `${VAR[k].t} asabedir.`});
  });
  if (onde) {
    const ilk = ASABE_SIRA.findIndex(a => a.replace('*', '') === onde);
    ASABE_SIRA.slice(ilk + 1).forEach(a => { const k = a.replace('*', ''); if (R[k] && R[k].asabe && !R[k].m && k !== onde && !KIZ.includes(k) && !ERK.includes(k)) {
      const es = {ibn: 'bint', ibnIbn: 'bintIbn', ibn3: 'bint3', ibn4: 'bint4', ahS: 'uhtS', ahB: 'uhtB'};
      if (es[onde] === k) return;
      mahcub(k, `${VAR[k].t}, ${VAR[onde].t.toLowerCase()} varken asabe olamaz.`);
    } });
  }
  // ---- zevi'l-erhâm
  const digerVar = Object.keys(R).some(k => !ZEVI.includes(k) && !['zevc', 'zevce'].includes(k) && !R[k].m);
  ZEVI.forEach(k => { if (!var_(k)) return; if (digerVar) set(k, {hal: 'لا', m: 'لا', neden: `${VAR[k].t} zevi’l-erhâmdandır; ashâb-ı ferâiz veya asabe varken pay almaz.`}); else set(k, {hal: '?', destek: false, neden: 'Bu mesele zevi’l-erhâm hesabı gerektirir.'}); });
  // ---- satırlar (aynı varis türü tek satır)
  const sira = VARISLER.map(v => v[0]).filter(var_);
  const satir = sira.map(k => ({k, a: VAR[k].a + (n(k) > 1 ? ` (${n(k)})` : ''), say: n(k), ...R[k]}));
  const pay = satir.filter(s => s.f);
  // ortak gruplar: 1/3 anne bir kardeşler, 1/6 neneler → payı bir kez say
  const grupF = {};
  pay.forEach(s => { const gk = s.grup || s.k; if (!grupF[gk]) grupF[gk] = {f: s.f, uyeler: []}; grupF[gk].uyeler.push(s); });
  let M = Object.values(grupF).reduce((a, g) => lcm(a, g.f[1]), 1);
  const asabeler = satir.filter(s => s.asabe && !s.m);
  let S = 0; const gs = {};
  Object.entries(grupF).forEach(([gk, g]) => { gs[gk] = g.f[0] * M / g.f[1]; S += gs[gk]; });
  let tur, son = {}, M2 = M, adim = {};
  // ilk sütun: sihâm (grup birleşik)
  const ilk = {};
  Object.entries(grupF).forEach(([gk, g]) => { g.uyeler.forEach((s, i) => { ilk[s.k] = i === 0 ? gs[gk] : '^'; }); });
  if (asabeler.length) {
    const kal = M - S;
    tur = kal > 0 ? 'âdile' : kal === 0 ? 'âdile' : 'avliye';
    if (kal < 0) { M2 = S; }
    // asabe payı: 1/6+ع olanın asabe kısmı da kalan
    asabeler.forEach((s, i) => {
      const k = Math.max(kal, 0);
      if (s.f) ilk[s.k] = `${ilk[s.k]}+${k}`; else ilk[s.k] = i === 0 ? k : '^';
    });
    adim.kalan = Math.max(kal, 0);
  } else if (S > M) { tur = 'avliye'; M2 = S; }
  else if (S === M) tur = 'âdile';
  else tur = 'reddiye';
  // ---- son durum: her grubun (mahreç M2 içindeki) sihâmı
  const grupSon = {};   // gk → {s: sihâm, uyeler, rus: kişi sayısı (erkek 2)}
  const ERKEK2 = [...ERK, 'ahS', 'ahB'];
  const ikiliGrup = asabeler.some(x => ERKEK2.includes(x.k)) && asabeler.some(x => KIZ.includes(x.k) || x.k === 'uhtS' || x.k === 'uhtB');
  const rus = s => s.say * (ikiliGrup && s.asabe && ERKEK2.includes(s.k) ? 2 : 1);
  Object.entries(grupF).forEach(([gk, g]) => { grupSon[gk] = {s: gs[gk], uyeler: g.uyeler.filter(u => !u.asabe)}; });
  let red = null;
  if (tur === 'reddiye') {
    const es = satir.find(s => s.k === 'zevc' || s.k === 'zevce');
    const digerG = Object.entries(grupF).filter(([gk, g]) => !g.uyeler.some(u => u === es));
    const dS = digerG.map(([gk]) => gs[gk]);
    const gg = dS.reduce((a, b) => gcd(a, b), 0);
    const oran = dS.map(x => x / gg), K = oran.reduce((a, b) => a + b, 0);
    if (!es) { M2 = K; digerG.forEach(([gk], i) => grupSon[gk].s = oran[i]); red = {kisim: digerG.length === 1 ? 1 : 2}; }
    else {
      const d = es.f[1], kal = d - es.f[0];
      if (digerG.length === 1) { M2 = d; grupSon[es.k].s = es.f[0]; grupSon[digerG[0][0]].s = kal; red = {kisim: 3}; }
      else {
        const t = gcd(kal, K), c1 = K / t, c2 = kal / t;   // M2 = d*K/t
        M2 = d * c1; grupSon[es.k].s = es.f[0] * c1; digerG.forEach(([gk], i) => grupSon[gk].s = oran[i] * c2);
        red = {kisim: 4, kesf: oran, K, zev: d, kalan: kal};
      }
    }
  }
  // asabe grubu
  if (asabeler.length) {
    const kal = M2 - Object.values(grupSon).reduce((t, g) => t + g.s, 0) + asabeler.filter(s => s.f).reduce((t, s) => t + 0, 0);
    // 1/6+ع: baba/dede fard grubundan + kalan
    const kalan = Math.max(M2 - Object.values(grupSon).reduce((t, g) => t + g.s, 0), 0);
    const babaF = asabeler.find(s => s.f);
    if (babaF) { grupSon[babaF.k].s += kalan; grupSon[babaF.k].uyeler = [babaF]; }
    else grupSon.asabe = {s: kalan, uyeler: asabeler};
  }
  // red/avl sonrası (tashihten önce) sütun değerleri
  satir.forEach(s => s.s2 = s.m ? '-' : null);
  Object.values(grupSon).forEach(g => g.uyeler.forEach((s, i) => { s.s2 = i === 0 ? g.s : '^'; }));
  satir.forEach(s => { if (s.s2 === null) s.s2 = '-'; if (s.s2 === 0) s.s2 = '-'; });
  // ---- tashih (inkisar)
  let cuz = 1;
  Object.values(grupSon).forEach(g => {
    const kisi = g.uyeler.reduce((t, s) => t + rus(s), 0);
    if (kisi > 1 && g.s > 0) cuz = lcm(cuz, kisi / gcd(g.s, kisi));
  });
  const M3 = M2 * cuz;
  // anlatım için: farz grupları ve tashih öncesi gruplar
  const farz = Object.values(grupF).map(g => ({ad: g.uyeler.map(u => u.a).join(' + '), hal: g.uyeler[0].hal, f: g.f, s: g.f[0] * M / g.f[1]}));
  const grup = Object.values(grupSon).filter(g => g.uyeler.length).map(g => ({ad: g.uyeler.map(u => u.a).join(' + '), s: g.s, kisi: g.uyeler.reduce((t, u) => t + rus(u), 0), ikili: g.uyeler.some(u => rus(u) > u.say)}));
  // kişi başı
  satir.forEach(s => { s.sonS = null; s.kisiBasi = null; });
  Object.values(grupSon).forEach(g => {
    const kisi = g.uyeler.reduce((t, s) => t + rus(s), 0);
    const tek = kisi ? g.s * cuz / kisi : 0;
    g.uyeler.forEach((s, i) => { s.sonS = tek * rus(s); s.kisiBasi = tek * (rus(s) / s.say); });
  });
  satir.forEach(s => { if (s.m || s.sonS === 0) { s.sonS = '-'; s.kisiBasi = 0; } if (s.m) ilk[s.k] = '-'; });
  const destek = !satir.some(s => s.destek === false);
  Object.keys(ilk).forEach(k => { if (typeof ilk[k] === 'string' && /\+0$/.test(ilk[k])) ilk[k] = +ilk[k].slice(0, -2); if (ilk[k] === 0) ilk[k] = '-'; });
  // ilk sütundaki "^" (birleşik) değerleri düzelt
  satir.forEach(s => s.ilk = ilk[s.k] ?? '-');
  return {destek, farz, grup, asabeAd: asabeler.map(x => x.a).join(' + '), satir, mahrec: M, toplam: S, tur, avl: (tur === 'avliye') ? M2 : null, red, mahrec2: M2, cuz, mahrec3: M3, omeriyye};
}
// Arapça varis adlarını hesaplayıcı anahtarlarına çevirir
const ESLE = {
  'زوج': 'zevc', 'زوجة': 'zevce', 'أب': 'eb', 'جد': 'cedd', 'أب الأب': 'cedd', 'أب أب': 'cedd', 'أم': 'um',
  'أم الأم': 'ceddeU', 'أم أم': 'ceddeU', 'جدة': 'ceddeU', 'أم الأب': 'ceddeB', 'أم لأب': 'ceddeB', 'أم أب': 'ceddeB',
  'أم أم الأم': 'ceddeUU', 'أم أم الأب': 'ceddeUB', 'أم أب الأب': 'ceddeBB', 'أم أم أم الأم': 'ceddeUUU', 'أم أم أم': 'ceddeUU', 'أم أب أب': 'ceddeBB',
  'أم أب الأم': 'ceddeF', 'أب الأم': 'ebUm',
  'ابن': 'ibn', 'بنت': 'bint', 'ابن الابن': 'ibnIbn', 'ابن ابن': 'ibnIbn', 'بنت الابن': 'bintIbn', 'بنت ابن': 'bintIbn',
  'ابن ابن الابن': 'ibn3', 'بنت ابن الابن': 'bint3', 'ابن ابن ابن الابن': 'ibn4', 'بنت ابن ابن الابن': 'bint4',
  'بنت البنت': 'bintBint', 'بنت بنت': 'bintBint', 'ابن البنت': 'ibnBint', 'ابن بنت': 'ibnBint',
  'أخ ش': 'ahS', 'أخت ش': 'uhtS', 'أخت': 'uhtS', 'أخ لأب': 'ahB', 'أخت لأب': 'uhtB', 'أخ لأم': 'ahU', 'أخت لأم': 'uhtU',
  'ابن أخ ش': 'ibnAhS', 'ابن أخ لأب': 'ibnAhB', 'عم': 'amS', 'عم ش': 'amS', 'عم لأب': 'amB', 'ابن عم': 'ibnAmS', 'ابن عم ش': 'ibnAmS', 'ابن عم لأب': 'ibnAmB',
};
function cevir(metin) {
  const g = {}, bilinmeyen = [];
  metin.split('،').map(x => x.trim()).filter(Boolean).forEach(p => {
    const m = p.match(/^(.+?)\s*(?:\((\d+)\))?$/); const ad = m[1].trim(), n = +(m[2] || 1);
    const k = ESLE[ad]; if (!k) bilinmeyen.push(ad); else g[k] = (g[k] || 0) + n;
  });
  return {g, bilinmeyen};
}


if (typeof module !== 'undefined') module.exports = {coz, VARISLER, VAR, cevir, ESLE};
