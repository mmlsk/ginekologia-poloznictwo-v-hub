import test from 'node:test';
import assert from 'node:assert/strict';
import logic from '../js/logic.js';

const {
  esc, norm, b64EncodeUtf8, b64DecodeUtf8,
  calcNaegele, calcBishop, calcApgar, calcOgttPregnancy, calcRmi,
  parseQuestionsInput, diagnoseQuestionsInput, buildBackupPayload, parseBackupCode, matchQuestionJump, parseMarkdown, scoreExam
} = logic;

test('UTF-8 base64 round-trip preserves Polish diacritics', () => {
  const sample = JSON.stringify({ note: 'Zażółć gęślą jaźń · PTGiP', arr: [1, 2] });
  assert.deepEqual(JSON.parse(b64DecodeUtf8(b64EncodeUtf8(sample))), JSON.parse(sample));
});

test('calcNaegele computes EDD, gestational age, and cycle length shift accurately', () => {
  const res28 = calcNaegele('2026-01-01', 28, '2026-05-21');
  assert.equal(res28.eddIso, '2026-10-08');
  assert.equal(res28.gaWeeks, 20);
  assert.equal(res28.gaDays, 0);
  assert.equal(res28.trimester, 2);

  const res32 = calcNaegele('2026-01-01', 32, '2026-05-21');
  assert.equal(res32.eddIso, '2026-10-12');
  assert.equal(res32.gaWeeks, 19);
  assert.equal(res32.gaDays, 3);
  assert.equal(calcNaegele('invalid-date'), null);
});

test('calcBishop classifies immature, intermediate, and favorable cervix', () => {
  const low = calcBishop({ dilation: 0, effacement: 1, station: 0, consistency: 0, position: 0 });
  assert.equal(low.score, 1);
  assert.equal(low.favorable, false);

  const high = calcBishop({ dilation: 2, effacement: 2, station: 2, consistency: 2, position: 1 });
  assert.equal(high.score, 9);
  assert.equal(high.favorable, true);
  assert.equal(high.level, 'high');
});

test('calcApgar classifies good, moderate, and severe asphyxia ranges', () => {
  assert.equal(calcApgar({ appearance: 2, pulse: 2, grimace: 2, activity: 2, respiration: 2 }).level, 'ok');
  assert.equal(calcApgar({ appearance: 1, pulse: 2, grimace: 1, activity: 1, respiration: 1 }).level, 'warn');
  assert.equal(calcApgar({ appearance: 0, pulse: 1, grimace: 0, activity: 1, respiration: 0 }).level, 'crit');
});

test('calcOgttPregnancy applies PTGiP/IADPSG thresholds for normal, GDM, and overt diabetes', () => {
  const normal = calcOgttPregnancy({ fasting: 86, h1: 148, h2: 120 });
  assert.equal(normal.gdm, false);
  assert.equal(normal.overtDiabetes, false);

  const gdm = calcOgttPregnancy({ fasting: 94, h1: 165, h2: 140 });
  assert.equal(gdm.gdm, true);
  assert.equal(gdm.overtDiabetes, false);

  const overt = calcOgttPregnancy({ fasting: 130, h1: 210, h2: 205 });
  assert.equal(overt.overtDiabetes, true);
  assert.equal(overt.level, 'crit');
});

test('calcRmi computes U * M * CA-125 and classifies risk tiers', () => {
  const low = calcRmi({ ultrasoundFeatures: 1, postmenopausal: false, ca125: 18 });
  assert.equal(low.rmi, 18);
  assert.equal(low.riskLevel, 'low');

  const high = calcRmi({ ultrasoundFeatures: 3, postmenopausal: true, ca125: 45 });
  assert.equal(high.rmi, 405);
  assert.equal(high.riskLevel, 'high');
});

test('parseQuestionsInput remaps answer key when option letters are skipped', () => {
  const text = `
1. Lek pierwszego rzutu w napadzie rzucawki to:
A. Diazepam
C. Siarczan magnezu (MgSO4)
D. Fenytoina
Klucz: C
`;
  const [q] = parseQuestionsInput(text, 'zaklad', '2', { banks: { zaklad: { n: 'Zakład' } } });
  assert.deepEqual(q.opts, ['Diazepam', 'Siarczan magnezu (MgSO4)', 'Fenytoina']);
  assert.deepEqual(q.keys, [1]);
});

test('parseQuestionsInput sanitizes JSON mods, ids, and out-of-range keys', () => {
  const payload = JSON.stringify([{
    id: '<script>alert(1)</script>',
    stem: 'Pytanie testowe',
    opts: ['Tak', 'Nie'],
    keys: [99, 1],
    mods: ['<img src=x onerror=alert(1)>', '1'],
    bank: 'injected'
  }]);
  const [q] = parseQuestionsInput(payload, 'custom', '1', {
    banks: { custom: { n: 'Własne' } },
    modById: { '1': { at: 'nagle-ob' } }
  });
  assert.ok(!q.id.includes('<'));
  assert.deepEqual(q.mods, ['1']);
  assert.deepEqual(q.keys, [1]);
  assert.equal(q.bank, 'custom');
  assert.equal(esc('<a&"b">'), '&lt;a&amp;&quot;b&quot;&gt;');
  assert.equal(norm('Łożysko'), 'lozysko');
});

test('parseMarkdown preserves blank lines inside fenced code blocks and escapes HTML', () => {
  const md = [
    '# Nagłówek <script>x</script>',
    '',
    '```txt',
    'MgSO4 4-6 g i.v.',
    '',
    'Wlew 1-2 g/h',
    '```',
    '',
    'Paragraf z **pogrubieniem**.'
  ].join('\n');
  const html = parseMarkdown(md);
  assert.ok(!html.includes('<script>'));
  assert.match(html, /<pre><code class="lang-txt">MgSO4 4-6 g i\.v\.\n\nWlew 1-2 g\/h<\/code><\/pre>/);
});

test('scoreExam handles multi-key answers, unanswered items, and 60% pass mark', () => {
  const list = [
    { id: 'q1', keys: [0], pm: '1' },
    { id: 'q2', keys: [1, 2], pm: '1' },
    { id: 'q3', keys: [0], pm: '2' },
    { id: 'q4', keys: [3], pm: '2' },
    { id: 'q5', keys: [0], pm: '5' }
  ];
  const ans = {
    q1: new Set([0]),
    q2: new Set([1, 2]),
    q3: new Set([0]),
    q4: new Set([1])
  };
  const res = scoreExam(list, ans);
  assert.equal(res.score, 3);
  assert.equal(res.total, 5);
  assert.equal(res.pct, 60);
  assert.equal(res.passed, true);
  assert.deepEqual(res.wrongQIds, ['q4', 'q5']);
});

test('diagnoseQuestionsInput reports empty input, invalid JSON, missing fields, and missing options', () => {
  assert.match(diagnoseQuestionsInput('   '), /Wklej/i);
  assert.match(diagnoseQuestionsInput('[{"stem": "x"'), /składnia JSON/i);
  assert.match(diagnoseQuestionsInput('[{"opts": ["A", "B"]}]'), /stem|question/);
  assert.match(diagnoseQuestionsInput('1. Brak opcji tutaj'), /co najmniej 2 wariantów/i);
  assert.match(diagnoseQuestionsInput('A. Opcja 1\nB. Opcja 2'), /brakuje treści pytania/i);
});

test('parseBackupCode distinguishes empty, bad base64, bad JSON, wrong schema, and restores valid backup', () => {
  const defaults = { visited: {}, last: null, done: {}, ans: {}, bm: {}, examHistory: [], patientCases: {}, osceCases: {} };
  assert.match(parseBackupCode('', defaults).error, /Wklej kod/i);
  assert.match(parseBackupCode('!!!nie-base64!!!', defaults).error, /Base64/i);
  assert.match(parseBackupCode(b64EncodeUtf8('{nie-json'), defaults).error, /JSON/i);
  assert.match(parseBackupCode(b64EncodeUtf8('{"foo":1}'), defaults).error, /GinPol Hub/i);

  const valid = b64EncodeUtf8(JSON.stringify({ visited: { 'nagle-ob': 1 }, last: 'nagle-ob', examHistory: [{ pct: 85 }] }));
  const res = parseBackupCode(`  ${valid.slice(0, 12)}\n${valid.slice(12)}  `, defaults);
  assert.equal(res.ok, true);
  assert.deepEqual(res.state.visited, { 'nagle-ob': 1 });
  assert.equal(res.state.last, 'nagle-ob');
  assert.equal(res.state.examHistory.length, 1);
  assert.equal(res.extras, null);
});

test('parseBackupCode supports v2 extended payload with safe extras and top-level _extras', () => {
  const defaults = { visited: {}, last: null, done: {}, ans: {}, bm: {}, examHistory: [], patientCases: {}, osceCases: {} };
  const extras = {
    notes: [{ id: 'n1', title: 'KTG', body: 'Późne deceleracje' }],
    scratch: 'Brudnopis dyżurowy',
    customQ: [{ id: 'cq-1', stem: 'Pytanie', opts: ['A', 'B'], keys: [0] }],
    calc: { lmp: '2026-01-01', cycle: 28 },
    ctg: { solved: ['ctg1'] },
    imaging: { solved: ['usg1'] }
  };

  const payload = buildBackupPayload({ visited: { 'nagle-ob': 1 }, done: { 'nagle-ob': 1 } }, extras);
  const res = parseBackupCode(b64EncodeUtf8(JSON.stringify(payload)), defaults);
  assert.equal(res.ok, true);
  assert.deepEqual(res.state.visited, { 'nagle-ob': 1 });
  assert.deepEqual(res.state.done, { 'nagle-ob': 1 });
  assert.deepEqual(res.extras, extras);

  const v2Short = b64EncodeUtf8(JSON.stringify({
    v: 2,
    state: { bm: { gp0005: 1 } },
    extras: {
      notes: 'invalid-not-array',
      scratch: 'ok',
      customQ: { bad: true },
      calc: ['not-obj'],
      ctg: { score: 4 },
      imaging: null,
      injectedKey: 'drop-me'
    }
  }));
  const resSanitized = parseBackupCode(v2Short, defaults);
  assert.equal(resSanitized.ok, true);
  assert.deepEqual(resSanitized.state.bm, { gp0005: 1 });
  assert.deepEqual(resSanitized.extras, { scratch: 'ok', ctg: { score: 4 } });

  const topLevelExtras = b64EncodeUtf8(JSON.stringify({
    visited: { fizjologia: 1 },
    _extras: { scratch: 'notatka', imaging: { seen: 2 }, unknown: 123 }
  }));
  const resTop = parseBackupCode(topLevelExtras, defaults);
  assert.equal(resTop.ok, true);
  assert.deepEqual(resTop.state.visited, { fizjologia: 1 });
  assert.equal('_extras' in resTop.state, false);
  assert.deepEqual(resTop.extras, { scratch: 'notatka', imaging: { seen: 2 } });

  const badWrapped = b64EncodeUtf8(JSON.stringify({ version: 2, state: { foo: 1 } }));
  assert.match(parseBackupCode(badWrapped, defaults).error, /GinPol Hub/i);
});

test('matchQuestionJump resolves exact IDs, leading #, pure numbers, suffixes, and substrings', () => {
  const questions = [
    { id: 'nagle-ob-q1', stem: 'Q1' },
    { id: 'fizjo-q2', stem: 'Q2' },
    { id: 'q0003', stem: 'Q3' },
    { id: 'gp0005', stem: 'Q5' },
    { id: 'patologia-q7', stem: 'Q7' }
  ];

  assert.equal(matchQuestionJump('gp0005', questions)?.id, 'gp0005');
  assert.equal(matchQuestionJump('#gp0005', questions)?.id, 'gp0005');
  assert.equal(matchQuestionJump('  GP0005 ', questions)?.id, 'gp0005');
  assert.equal(matchQuestionJump('nagle-ob-q1', questions)?.id, 'nagle-ob-q1');
  assert.equal(matchQuestionJump('5', questions)?.id, 'gp0005');
  assert.equal(matchQuestionJump('#5', questions)?.id, 'gp0005');
  assert.equal(matchQuestionJump('005', questions)?.id, 'gp0005');
  assert.equal(matchQuestionJump('3', questions)?.id, 'q0003');
  assert.equal(matchQuestionJump('7', questions)?.id, 'patologia-q7');
  assert.equal(matchQuestionJump('4', questions)?.id, 'gp0005');
  assert.equal(matchQuestionJump('fizjo', questions)?.id, 'fizjo-q2');

  assert.equal(matchQuestionJump('nie-istnieje', questions), null);
  assert.equal(matchQuestionJump('0', questions), null);
  assert.equal(matchQuestionJump('999', questions), null);
  assert.equal(matchQuestionJump('   ', questions), null);
  assert.equal(matchQuestionJump('gp0005', []), null);
});
