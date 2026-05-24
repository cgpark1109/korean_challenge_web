// -*- coding: utf-8 -*-
/**
 * Learn Korean - Hangul consonant / vowel / word / stage data
 */
const HangulData = {
  vowels: [
    { id: 'v_a', char: '\u314F', roman: 'a', sound: "Like 'a' in father" },
    { id: 'v_ya', char: '\u3151', roman: 'ya', sound: "Like 'ya' in yard" },
    { id: 'v_eo', char: '\u3153', roman: 'eo', sound: "Like 'u' in fun" },
    { id: 'v_yeo', char: '\u3155', roman: 'yeo', sound: "Like 'yu' in yummy" },
    { id: 'v_o', char: '\u3157', roman: 'o', sound: "Like 'o' in go" },
    { id: 'v_yo', char: '\u315B', roman: 'yo', sound: "Like 'yo' in yoga" },
    { id: 'v_u', char: '\u315C', roman: 'u', sound: "Like 'oo' in food" },
    { id: 'v_yu', char: '\u3160', roman: 'yu', sound: "Like 'you'" },
    { id: 'v_eu', char: '\u3161', roman: 'eu', sound: "Like 'u' in put (no lip rounding)" },
    { id: 'v_i', char: '\u3163', roman: 'i', sound: "Like 'ee' in see" },
  ],

  consonants: [
    { id: 'c_g', char: '\u3131', roman: 'g/k', sound: "Like 'g' in go (start) or 'k' (end)" },
    { id: 'c_n', char: '\u3134', roman: 'n', sound: "Like 'n' in no" },
    { id: 'c_d', char: '\u3137', roman: 'd/t', sound: "Like 'd' in do (start) or 't' (end)" },
    { id: 'c_r', char: '\u3139', roman: 'r/l', sound: "Between 'r' and 'l'" },
    { id: 'c_m', char: '\u3141', roman: 'm', sound: "Like 'm' in mom" },
    { id: 'c_b', char: '\u3142', roman: 'b/p', sound: "Like 'b' in boy (start) or 'p' (end)" },
    { id: 'c_s', char: '\u3145', roman: 's', sound: "Like 's' in sun" },
    { id: 'c_ng', char: '\u3147', roman: '-/ng', sound: "Silent (start) or 'ng' in sing (end)" },
    { id: 'c_j', char: '\u3148', roman: 'j', sound: "Like 'j' in joy" },
    { id: 'c_ch', char: '\u314A', roman: 'ch', sound: "Like 'ch' in church" },
    { id: 'c_k', char: '\u314B', roman: 'k', sound: "Like 'k' in key (aspirated)" },
    { id: 'c_t', char: '\u314C', roman: 't', sound: "Like 't' in top (aspirated)" },
    { id: 'c_p', char: '\u314D', roman: 'p', sound: "Like 'p' in pot (aspirated)" },
    { id: 'c_h', char: '\u314E', roman: 'h', sound: "Like 'h' in hat" },
    { id: 'c_gg', char: '\u3132', roman: 'kk', sound: "Tense 'k' (no puff of air)" },
    { id: 'c_dd', char: '\u3138', roman: 'tt', sound: "Tense 't' (no puff of air)" },
    { id: 'c_bb', char: '\u3143', roman: 'pp', sound: "Tense 'p' (no puff of air)" },
    { id: 'c_ss', char: '\u3146', roman: 'ss', sound: "Tense 's' (stronger hiss)" },
    { id: 'c_jj', char: '\u3149', roman: 'jj', sound: "Tense 'j' (no puff of air)" },
  ],

  words: [
    { id: 'w_mom',    char: '엄마',      roman: 'eomma',          meaning: 'Mom / Mother' },
    { id: 'w_dad',    char: '아빠',      roman: 'appa',           meaning: 'Dad / Father' },
    { id: 'w_water',  char: '물',        roman: 'mul',            meaning: 'Water' },
    { id: 'w_rice',   char: '밥',        roman: 'bap',            meaning: 'Rice / Meal' },
    { id: 'w_home',   char: '집',        roman: 'jip',            meaning: 'Home / House' },
    { id: 'w_school', char: '학교',      roman: 'hakgyo',         meaning: 'School' },
    { id: 'w_friend', char: '친구',      roman: 'chingu',         meaning: 'Friend' },
    { id: 'w_love',   char: '사랑',      roman: 'sarang',         meaning: 'Love' },
    { id: 'w_hello',  char: '안녕하세요', roman: 'annyeonghaseyo', meaning: 'Hello (formal)' },
    { id: 'w_thanks', char: '감사합니다', roman: 'gamsahamnida',   meaning: 'Thank you (formal)' },
    { id: 'w_yes',    char: '네',        roman: 'ne',             meaning: 'Yes' },
    { id: 'w_no',     char: '아니요',    roman: 'aniyo',          meaning: 'No' },
    { id: 'w_food',   char: '음식',      roman: 'eumsik',         meaning: 'Food' },
    { id: 'w_person', char: '사람',      roman: 'saram',          meaning: 'Person' },
    { id: 'w_today',  char: '오늘',      roman: 'oneul',          meaning: 'Today' },
    { id: 'w_korean', char: '한국어',    roman: 'hangugeo',       meaning: 'Korean language' },
    { id: 'w_what',   char: '뭐',        roman: 'mwo',            meaning: 'What' },
    { id: 'w_where',  char: '어디',      roman: 'eodi',           meaning: 'Where' },
    { id: 'w_when',   char: '언제',      roman: 'eonje',          meaning: 'When' },
    { id: 'w_how',    char: '어떻게',    roman: 'eotteoke',       meaning: 'How' },
  ],

  syllables: [
    { id: 's_ga', char: '\uAC00', roman: 'ga', sound: '\u3131 + \u314F' },
    { id: 's_na', char: '\uB098', roman: 'na', sound: '\u3134 + \u314F' },
    { id: 's_da', char: '\uB2E4', roman: 'da', sound: '\u3137 + \u314F' },
    { id: 's_ma', char: '\uB9C8', roman: 'ma', sound: '\u3141 + \u314F' },
    { id: 's_ba', char: '\uBC14', roman: 'ba', sound: '\u3142 + \u314F' },
    { id: 's_sa', char: '\uC0AC', roman: 'sa', sound: '\u3145 + \u314F' },
    { id: 's_a', char: '\uC544', roman: 'a', sound: '\u3147 + \u314F' },
    { id: 's_ja', char: '\uC790', roman: 'ja', sound: '\u3148 + \u314F' },
    { id: 's_ha', char: '\uD558', roman: 'ha', sound: '\u314E + \u314F' },
    { id: 's_go', char: '\uACE0', roman: 'go', sound: '\u3131 + \u3157' },
    { id: 's_no', char: '\uB178', roman: 'no', sound: '\u3134 + \u3157' },
    { id: 's_o', char: '\uC624', roman: 'o', sound: '\u3147 + \u3157' },
    { id: 's_gu', char: '\uAD6C', roman: 'gu', sound: '\u3131 + \u315C' },
    { id: 's_mu', char: '\uBB34', roman: 'mu', sound: '\u3141 + \u315C' },
    { id: 's_su', char: '\uC218', roman: 'su', sound: '\u3145 + \u315C' },
  ],

  stages: [
    { id: 1, title: 'Consonants I', type: 'consonant', items: () => HangulData.consonants.slice(0, 7) },
    { id: 2, title: 'Consonants II', type: 'consonant', items: () => HangulData.consonants.slice(7) },
    { id: 3, title: 'Vowels', type: 'vowel', items: () => HangulData.vowels },
    { id: 4, title: 'Syllables', type: 'syllable', items: () => HangulData.syllables.slice(0, 10) },
    { id: 5, title: 'Words I', type: 'word', items: () => HangulData.words.slice(0, 8) },
    { id: 6, title: 'Words II', type: 'word', items: () => HangulData.words.slice(8) },
    { id: 7, title: 'Stroke Writing', type: 'stroke', items: () => HangulData.syllables.slice(0, 5) },
    { id: 8, title: 'Final Quiz', type: 'quiz', items: () => [...HangulData.syllables, ...HangulData.words.slice(0, 5)] },
  ],

  getLabel(item) {
    if (!item) return '';
    if (item.meaning) return item.meaning;
    if (item.sound) return item.sound;
    return item.roman || item.char;
  },

  getHint(item) {
    if (!item) return '';
    if (item.meaning) return `${item.roman} \u00B7 ${item.meaning}`;
    if (item.sound) return `${item.roman} \u00B7 ${item.sound}`;
    return item.roman || '';
  },

  getStage(id) {
    const stage = HangulData.stages.find((s) => s.id === Number(id));
    if (!stage) return { ...HangulData.stages[0], items: HangulData.stages[0].items() };
    return { ...stage, items: stage.items() };
  },

  getRandomQuizOptions(correct, pool, count = 4) {
    const others = pool.filter((item) => item.char !== correct.char);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const options = [correct, ...shuffled.slice(0, count - 1)];
    return options.sort(() => Math.random() - 0.5);
  },

  starsFromScore(score, maxScore) {
    const ratio = maxScore > 0 ? score / maxScore : 0;
    if (ratio >= 0.9) return 3;
    if (ratio >= 0.6) return 2;
    if (ratio >= 0.3) return 1;
    return 0;
  },
};

if (typeof module !== 'undefined') module.exports = HangulData;
