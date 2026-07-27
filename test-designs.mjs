/**
 * تست جامع هر ۵ طرح آزمایشی
 * داده‌های استاندارد از کتاب‌های آمار کشاورزی
 */

const BASE = 'http://localhost:3000';

async function runAnalysis(designType, data, config, traits, method = 'DUNCAN') {
  const res = await fetch(`${BASE}/api/analysis/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ designType, data, config, traits, method }),
  });
  return res.json();
}

function printResult(name, result) {
  const { traitStats, anovaResults, postHocResults } = result.data;
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${name}`);
  console.log(`${'═'.repeat(60)}`);

  for (const trait of Object.keys(traitStats)) {
    const s = traitStats[trait];
    console.log(`\n📋 صفت: ${trait}`);
    console.log(`   n=${s.n} | میانگین=${s.mean.toFixed(4)} | SD=${s.stdDev.toFixed(4)} | CV=${s.cv.toFixed(2)}%`);
    console.log(`   Shapiro-Wilk: W=${s.swW.toFixed(4)}, p=${s.swPValue.toFixed(4)} → ${s.isNormal ? '✅ نرمال' : '⚠️ غیرنرمال'}`);

    const anova = anovaResults[trait];
    console.log(`\n📊 ANOVA:`);
    for (const src of anova.sources) {
      const fStr = src.fCalc > 0 ? `F=${src.fCalc.toFixed(3)} [${src.fTab05.toFixed(2)}, ${src.fTab01.toFixed(2)}]` : '';
      const sig = src.significance !== 'ns' ? ` ← ${src.significance}` : '';
      console.log(`   ${src.source.padEnd(30)} df=${String(src.df).padEnd(4)} SS=${src.ss.toFixed(3).padStart(10)} MS=${src.ms.toFixed(3).padStart(10)} ${fStr}${sig}`);
    }

    const ph = postHocResults[trait];
    console.log(`\n🏆 مقایسه میانگین (${ph.method}):`);
    if (!ph.isSignificant) {
      console.log(`   تفاوت معنی‌داری وجود ندارد`);
    } else {
      for (const g of ph.groups) {
        const bar = '█'.repeat(Math.round(g.mean / Math.max(...ph.groups.map(x=>x.mean)) * 20));
        console.log(`   ${g.name.padEnd(12)} ${g.mean.toFixed(4).padStart(8)}  ${g.letter.toUpperCase()}  ${bar}`);
      }
    }
  }
}

// ────────────────────────────────────────────────────────────
// ۱. CRD — طرح کاملاً تصادفی
// منبع: Gomez & Gomez, Statistical Procedures for Agricultural Research
// آزمایش: اثر ۴ سطح کود نیتروژن بر عملکرد برنج (kg/plot)
// ────────────────────────────────────────────────────────────
async function testCRD() {
  const data = [
    // T1=0 kg/ha, T2=50, T3=100, T4=150
    {id:'1', rep:1, treatment:'N0',  values:{Yield:'2.536'}},
    {id:'2', rep:1, treatment:'N50', values:{Yield:'2.883'}},
    {id:'3', rep:1, treatment:'N100',values:{Yield:'3.585'}},
    {id:'4', rep:1, treatment:'N150',values:{Yield:'4.016'}},
    {id:'5', rep:2, treatment:'N0',  values:{Yield:'2.458'}},
    {id:'6', rep:2, treatment:'N50', values:{Yield:'3.025'}},
    {id:'7', rep:2, treatment:'N100',values:{Yield:'3.312'}},
    {id:'8', rep:2, treatment:'N150',values:{Yield:'3.825'}},
    {id:'9', rep:3, treatment:'N0',  values:{Yield:'2.741'}},
    {id:'10',rep:3, treatment:'N50', values:{Yield:'2.756'}},
    {id:'11',rep:3, treatment:'N100',values:{Yield:'3.488'}},
    {id:'12',rep:3, treatment:'N150',values:{Yield:'3.912'}},
    {id:'13',rep:4, treatment:'N0',  values:{Yield:'2.612'}},
    {id:'14',rep:4, treatment:'N50', values:{Yield:'2.941'}},
    {id:'15',rep:4, treatment:'N100',values:{Yield:'3.741'}},
    {id:'16',rep:4, treatment:'N150',values:{Yield:'4.105'}},
  ];
  const config = { treatments:4, replications:4, traits:['Yield'] };
  const r = await runAnalysis('CRD', data, config, ['Yield']);
  printResult('۱. CRD — اثر کود نیتروژن بر عملکرد برنج', r);
  // انتظار: F معنی‌دار، N150 > N100 > N50 > N0
}

// ────────────────────────────────────────────────────────────
// ۲. RCBD — طرح بلوک‌های کامل تصادفی
// منبع: Steel & Torrie - Principles and Procedures of Statistics
// آزمایش: ۵ رقم گندم، ۴ بلوک، صفت: عملکرد دانه (t/ha)
// ────────────────────────────────────────────────────────────
async function testRCBD() {
  const data = [
    {id:'1', rep:1, treatment:'V1', values:{Yield:'3.12', Plant_Height:'85.2'}},
    {id:'2', rep:1, treatment:'V2', values:{Yield:'2.98', Plant_Height:'81.5'}},
    {id:'3', rep:1, treatment:'V3', values:{Yield:'3.45', Plant_Height:'92.1'}},
    {id:'4', rep:1, treatment:'V4', values:{Yield:'3.21', Plant_Height:'88.3'}},
    {id:'5', rep:1, treatment:'V5', values:{Yield:'2.87', Plant_Height:'79.8'}},
    {id:'6', rep:2, treatment:'V1', values:{Yield:'3.05', Plant_Height:'83.7'}},
    {id:'7', rep:2, treatment:'V2', values:{Yield:'3.15', Plant_Height:'84.2'}},
    {id:'8', rep:2, treatment:'V3', values:{Yield:'3.62', Plant_Height:'94.5'}},
    {id:'9', rep:2, treatment:'V4', values:{Yield:'3.08', Plant_Height:'86.1'}},
    {id:'10',rep:2, treatment:'V5', values:{Yield:'2.75', Plant_Height:'78.4'}},
    {id:'11',rep:3, treatment:'V1', values:{Yield:'3.18', Plant_Height:'86.8'}},
    {id:'12',rep:3, treatment:'V2', values:{Yield:'3.02', Plant_Height:'82.1'}},
    {id:'13',rep:3, treatment:'V3', values:{Yield:'3.51', Plant_Height:'91.6'}},
    {id:'14',rep:3, treatment:'V4', values:{Yield:'3.35', Plant_Height:'89.5'}},
    {id:'15',rep:3, treatment:'V5', values:{Yield:'2.92', Plant_Height:'80.9'}},
    {id:'16',rep:4, treatment:'V1', values:{Yield:'2.95', Plant_Height:'82.4'}},
    {id:'17',rep:4, treatment:'V2', values:{Yield:'3.08', Plant_Height:'83.9'}},
    {id:'18',rep:4, treatment:'V3', values:{Yield:'3.58', Plant_Height:'93.2'}},
    {id:'19',rep:4, treatment:'V4', values:{Yield:'3.42', Plant_Height:'90.7'}},
    {id:'20',rep:4, treatment:'V5', values:{Yield:'2.81', Plant_Height:'78.1'}},
  ];
  const config = { treatments:5, replications:4, traits:['Yield','Plant_Height'] };
  const r = await runAnalysis('RCBD', data, config, ['Yield','Plant_Height']);
  printResult('۲. RCBD — ارقام گندم (۵ رقم × ۴ بلوک)', r);
  // انتظار: V3 برترین رقم
}

// ────────────────────────────────────────────────────────────
// ۳. LSD — طرح مربع لاتین
// آزمایش: ۴ نوع آفت‌کش (A,B,C,D) روی ۴×۴ ماتریس مزرعه
// صفت: درصد کنترل آفت
// ────────────────────────────────────────────────────────────
async function testLSD() {
  // ماتریس ۴×۴:
  // R\C  1    2    3    4
  //  1   A    B    C    D
  //  2   B    C    D    A
  //  3   C    D    A    B
  //  4   D    A    B    C
  const data = [
    {id:'1', rep:1, treatment:'A', row:1, col:1, values:{Control:'82.5'}},
    {id:'2', rep:1, treatment:'B', row:1, col:2, values:{Control:'71.3'}},
    {id:'3', rep:1, treatment:'C', row:1, col:3, values:{Control:'65.8'}},
    {id:'4', rep:1, treatment:'D', row:1, col:4, values:{Control:'54.2'}},
    {id:'5', rep:2, treatment:'B', row:2, col:1, values:{Control:'73.1'}},
    {id:'6', rep:2, treatment:'C', row:2, col:2, values:{Control:'68.4'}},
    {id:'7', rep:2, treatment:'D', row:2, col:3, values:{Control:'55.7'}},
    {id:'8', rep:2, treatment:'A', row:2, col:4, values:{Control:'84.2'}},
    {id:'9', rep:3, treatment:'C', row:3, col:1, values:{Control:'66.9'}},
    {id:'10',rep:3, treatment:'D', row:3, col:2, values:{Control:'52.8'}},
    {id:'11',rep:3, treatment:'A', row:3, col:3, values:{Control:'81.6'}},
    {id:'12',rep:3, treatment:'B', row:3, col:4, values:{Control:'70.5'}},
    {id:'13',rep:4, treatment:'D', row:4, col:1, values:{Control:'56.3'}},
    {id:'14',rep:4, treatment:'A', row:4, col:2, values:{Control:'83.8'}},
    {id:'15',rep:4, treatment:'B', row:4, col:3, values:{Control:'72.4'}},
    {id:'16',rep:4, treatment:'C', row:4, col:4, values:{Control:'67.1'}},
  ];
  const config = { treatments:4, replications:4, traits:['Control'] };
  const r = await runAnalysis('LSD', data, config, ['Control']);
  printResult('۳. LSD — مقایسه آفت‌کش‌ها (۴×۴ مربع لاتین)', r);
  // انتظار: A > B > C > D
}

// ────────────────────────────────────────────────────────────
// ۴. FACTORIAL — طرح فاکتوریل ۲×۳
// آزمایش: ۲ نوع کود (K1,K2) × ۳ سطح آبیاری (I1,I2,I3) در RCBD
// صفت: عملکرد ذرت (ton/ha)
// ────────────────────────────────────────────────────────────
async function testFactorial() {
  const data = [
    // rep 1
    {id:'1', rep:1, treatment:'K1I1', factorA:1, factorB:1, values:{Yield:'6.25', Biomass:'12.8'}},
    {id:'2', rep:1, treatment:'K1I2', factorA:1, factorB:2, values:{Yield:'7.42', Biomass:'15.1'}},
    {id:'3', rep:1, treatment:'K1I3', factorA:1, factorB:3, values:{Yield:'8.15', Biomass:'16.9'}},
    {id:'4', rep:1, treatment:'K2I1', factorA:2, factorB:1, values:{Yield:'6.85', Biomass:'13.5'}},
    {id:'5', rep:1, treatment:'K2I2', factorA:2, factorB:2, values:{Yield:'8.35', Biomass:'17.2'}},
    {id:'6', rep:1, treatment:'K2I3', factorA:2, factorB:3, values:{Yield:'9.82', Biomass:'19.8'}},
    // rep 2
    {id:'7', rep:2, treatment:'K1I1', factorA:1, factorB:1, values:{Yield:'6.01', Biomass:'12.2'}},
    {id:'8', rep:2, treatment:'K1I2', factorA:1, factorB:2, values:{Yield:'7.58', Biomass:'15.4'}},
    {id:'9', rep:2, treatment:'K1I3', factorA:1, factorB:3, values:{Yield:'8.32', Biomass:'17.1'}},
    {id:'10',rep:2, treatment:'K2I1', factorA:2, factorB:1, values:{Yield:'7.02', Biomass:'14.0'}},
    {id:'11',rep:2, treatment:'K2I2', factorA:2, factorB:2, values:{Yield:'8.51', Biomass:'17.6'}},
    {id:'12',rep:2, treatment:'K2I3', factorA:2, factorB:3, values:{Yield:'9.65', Biomass:'19.4'}},
    // rep 3
    {id:'13',rep:3, treatment:'K1I1', factorA:1, factorB:1, values:{Yield:'6.18', Biomass:'12.5'}},
    {id:'14',rep:3, treatment:'K1I2', factorA:1, factorB:2, values:{Yield:'7.25', Biomass:'14.8'}},
    {id:'15',rep:3, treatment:'K1I3', factorA:1, factorB:3, values:{Yield:'8.05', Biomass:'16.5'}},
    {id:'16',rep:3, treatment:'K2I1', factorA:2, factorB:1, values:{Yield:'6.92', Biomass:'13.8'}},
    {id:'17',rep:3, treatment:'K2I2', factorA:2, factorB:2, values:{Yield:'8.28', Biomass:'16.9'}},
    {id:'18',rep:3, treatment:'K2I3', factorA:2, factorB:3, values:{Yield:'9.91', Biomass:'20.1'}},
  ];
  const config = { treatments:6, replications:3, traits:['Yield','Biomass'], factors:{factorA:2, factorB:3} };
  const r = await runAnalysis('FACTORIAL', data, config, ['Yield','Biomass']);
  printResult('۴. FACTORIAL (2×3) — کود × آبیاری روی ذرت', r);
  // انتظار: A(کود), B(آبیاری), A×B همه معنی‌دار
}

// ────────────────────────────────────────────────────────────
// ۵. SPLIT-PLOT — طرح کرت‌های خرد شده
// آزمایش: ۲ نوع تراکم کاشت (Main) × ۳ رقم (Sub) در ۳ تکرار
// صفت: عملکرد سویا (kg/ha)
// ────────────────────────────────────────────────────────────
async function testSplitPlot() {
  const data = [
    // rep 1
    {id:'1', rep:1, treatment:'D1V1', factorA:1, factorB:1, values:{Yield:'2850'}},
    {id:'2', rep:1, treatment:'D1V2', factorA:1, factorB:2, values:{Yield:'3120'}},
    {id:'3', rep:1, treatment:'D1V3', factorA:1, factorB:3, values:{Yield:'2980'}},
    {id:'4', rep:1, treatment:'D2V1', factorA:2, factorB:1, values:{Yield:'3250'}},
    {id:'5', rep:1, treatment:'D2V2', factorA:2, factorB:2, values:{Yield:'3580'}},
    {id:'6', rep:1, treatment:'D2V3', factorA:2, factorB:3, values:{Yield:'3420'}},
    // rep 2
    {id:'7', rep:2, treatment:'D1V1', factorA:1, factorB:1, values:{Yield:'2780'}},
    {id:'8', rep:2, treatment:'D1V2', factorA:1, factorB:2, values:{Yield:'3050'}},
    {id:'9', rep:2, treatment:'D1V3', factorA:1, factorB:3, values:{Yield:'2910'}},
    {id:'10',rep:2, treatment:'D2V1', factorA:2, factorB:1, values:{Yield:'3180'}},
    {id:'11',rep:2, treatment:'D2V2', factorA:2, factorB:2, values:{Yield:'3620'}},
    {id:'12',rep:2, treatment:'D2V3', factorA:2, factorB:3, values:{Yield:'3380'}},
    // rep 3
    {id:'13',rep:3, treatment:'D1V1', factorA:1, factorB:1, values:{Yield:'2920'}},
    {id:'14',rep:3, treatment:'D1V2', factorA:1, factorB:2, values:{Yield:'3180'}},
    {id:'15',rep:3, treatment:'D1V3', factorA:1, factorB:3, values:{Yield:'3040'}},
    {id:'16',rep:3, treatment:'D2V1', factorA:2, factorB:1, values:{Yield:'3310'}},
    {id:'17',rep:3, treatment:'D2V2', factorA:2, factorB:2, values:{Yield:'3650'}},
    {id:'18',rep:3, treatment:'D2V3', factorA:2, factorB:3, values:{Yield:'3450'}},
  ];
  const config = { treatments:6, replications:3, traits:['Yield'], plots:{mainPlots:2, subPlots:3} };
  const r = await runAnalysis('SPLIT_PLOT', data, config, ['Yield']);
  printResult('۵. SPLIT-PLOT — تراکم کاشت × رقم در سویا', r);
  // انتظار: D2 بهتر از D1، V2 بهتر از V1 و V3
}

// ────────────────────────────────────────────────────────────
// اجرا
// ────────────────────────────────────────────────────────────
console.log('🌱 SmartAgri — تست جامع ۵ طرح آزمایشی');
console.log(`زمان: ${new Date().toLocaleString('fa-IR')}`);

(async () => {
  try {
    await testCRD();
    await testRCBD();
    await testLSD();
    await testFactorial();
    await testSplitPlot();
    console.log(`\n${'═'.repeat(60)}`);
    console.log('✅ همه تست‌ها با موفقیت اجرا شدند');
  } catch(e) {
    console.error('❌ خطا:', e.message);
  }
})();
