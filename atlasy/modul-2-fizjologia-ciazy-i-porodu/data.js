/* Dane merytoryczne dla Atlasu 2: Fizjologia ciąży, porodu i KTG [4][5] */

const TRIMESTERS = {
  t1: {
    title: 'I trymestr (0 – 13+6 t.c.) — organogeneza i adaptacja hormonalna',
    badge: 'β-hCG → progesteron ciałka żółtego',
    cards: [
      {
        h: 'Układ krążenia i krew',
        c: 'r',
        items: [
          'Rozszerzenie naczyń obwodowych (progesteron, NO, relaksyna) → ↓ obwodowego oporu naczyniowego (SVR) i fizjologiczny spadek RR.',
          'Początek wzrostu rzutu serca (CO) i objętości osocza; tętno spoczynkowe wzrasta o ok. 10–15/min.',
          'Stan fizjologicznej nadkrzepliwości (↑ fibrynogenu i czynników VII, VIII, X; ↓ białka S) — zwiększone ryzyko ŻChZZ już od I trymestru.'
        ]
      },
      {
        h: 'Układ oddechowy i nerki',
        c: 'b',
        items: [
          'Progesteron stymuluje ośrodek oddechowy → ↑ objętości oddechowej (TV o ~30–40%) przy niemal stałej częstości oddechów.',
          'Fizjologiczna, skompensowana zasadowica oddechowa: ↓ PaCO₂ (28–32 mmHg), co ułatwia dyfuzję CO₂ z płodu przez łożysko.',
          'Wzrost przepływu nerkowego i GFR o ~40–50% → fizjologicznie niższe stężenie kreatyniny (~0,4–0,7 mg/dl) i mocznika.'
        ]
      },
      {
        h: 'Układ pokarmowy i metabolizm',
        c: 'a',
        items: [
          'Nudności i wymioty (szczyt ok. 8–10. t.c. zgodnie ze szczytem β-hCG); relaksacja dolnego zwieracza przełyku (zgaga).',
          'Zwolniona perystaltyka jelit (progesteron) → zaparcia; zastój żółci → predyspozycja do kamicy.',
          'Wrażliwość na insulinę w I trymestrze jest jeszcze zachowana lub lekko zwiększona (ryzyko hipoglikemii na czczo).'
        ]
      }
    ]
  },
  t2: {
    title: 'II trymestr (14+0 – 27+6 t.c.) — szczyt adaptacji hemodynamicznej',
    badge: 'Łożysko przejmuje produkcję hormonów',
    cards: [
      {
        h: 'Hemodylucja i układ krążenia',
        c: 'r',
        items: [
          'Objętość osocza rośnie o ~40–50%, a masa erytrocytów tylko o ~20–30% → <b>niedokrwistość fizjologiczna z rozcieńczenia</b> (norma Hb ≥11 g/dl w I i III trym., ≥10,5 g/dl w II trym.).',
          'Nadir ciśnienia tętniczego przypada na ok. 20–24. t.c. (spadek skurczowego o ~5–10 mmHg, rozkurczowego o ~10–15 mmHg).',
          'Od ok. 20. t.c. pojawia się ryzyko <b>zespołu ucisku żyły głównej dolnej</b> w pozycji na wznak.'
        ]
      },
      {
        h: 'Metabolizm węglowodanów (GDM)',
        c: 'a',
        items: [
          'Narastające stężenie laktogenu łożyskowego (hPL), kortyzolu i progesteronu wywołuje fizjologiczną <b>insulinooporność</b> — cel: zapewnienie glukozy płodowi.',
          'Między <b>24. a 28. t.c.</b> każda ciężarna bez wcześniej rozpoznanej cukrzycy wykonuje doustny test obciążenia glukozą <b>OGTT 75 g</b> (normy: na czczo &lt;92, po 1 h &lt;180, po 2 h &lt;153 mg/dl).'
        ]
      },
      {
        h: 'Układ moczowy i mięśniowo-szkieletowy',
        c: 'g',
        items: [
          'Fizjologiczne poszerzenie moczowodów i UKM (częściej po stronie prawej z powodu dekstrotorsji macicy i progesteronu) → ryzyko bezobjawowego bakteriomoczu i odmiedniczkowego zapalenia nerek.',
          'Dno macicy w 20–22. t.c. osiąga wysokość pępka; pierwsze ruchy płodu (wieloródki ~16–18. t.c., pierworódki ~18–20. t.c.).'
        ]
      }
    ]
  },
  t3: {
    title: 'III trymestr (28+0 – 40+6 t.c.) — wzrost płodu i przygotowanie do porodu',
    badge: 'Szczyt CO, dojrzewanie płuc i szyjki',
    cards: [
      {
        h: 'Krążenie i układ oddechowy',
        c: 'r',
        items: [
          'Rzut serca (CO) osiąga szczyt (+30–50% względem stanu przed ciążą); ciśnienie tętnicze stopniowo wraca do wartości sprzed ciąży.',
          'Uniesienie przepony o ok. 4 cm → ↓ czynnościowej pojemności zalegającej (FRC o ~20%) przy zachowanej pojemności życiowej (VC) — stąd szybsza desaturacja w bezdechu i znieczuleniu!',
          'Łagodna leukocytoza fizjologiczna (do 14–16 G/l, w porodzie nawet 20–25 G/l) bez infekcji.'
        ]
      },
      {
        h: 'Układ krzepnięcia i immunologia',
        c: 'v',
        items: [
          'Fibrynogen wzrasta do <b>4–6 g/l</b> (ochrona przed krwotokiem okołoporodowym, ale najwyższe ryzyko zakrzepicy przypada na III trymestr i pierwsze 6 tyg. połogu).',
          'Aktywny transport przeciwciał IgG przez łożysko (szczególnie po 28. t.c.) → szczepienie ciężarnej (krztusiec Tdap 27–36. t.c., RSV 32–36. t.c., grypa) chroni noworodka.'
        ]
      },
      {
        h: 'Macica i przygotowanie do porodu',
        c: 'b',
        items: [
          '36. t.c.: dno macicy najwyżej (pod łukami żebrowymi); w 38–40. t.c. lekko się obniża po wstawieniu główki do wchodu miednicy.',
          'Nieregularne skurcze przepowiadające Braxtona–Hicksa nie powodują skracania ani rozwierania szyjki macicy.'
        ]
      }
    ]
  }
};

const MZ_SCHEDULE = [
  ['Do 10. t.c.', 'Grupa krwi i Rh, p/ciała odpornościowe, morfologia, badanie ogólne moczu, glukoza na czczo, TSH, VDRL (kiła), HIV, HCV, HBsAg (lub w III trym.), toksoplazmoza IgG/IgM, różyczka IgG/IgM, cytologia (jeśli brak w ost. 6 mies.)', 'Wczesna ocena ryzyka (w tym cukrzycy przedciążowej i niedoczynności tarczycy).'],
  ['11+0 – 13+6 t.c.', '<b>USG I trymestru (genetyczne)</b>: CRL, NT (przezierność karkowa), kość nosowa, FHR + <b>test złożony</b> (PAPP-A + wolna β-hCG) oraz ocena ryzyka preeklampsji (FMF).', 'Najdokładniejsze ustalenie wieku ciążowego (CRL) oraz kwalifikacja do ASA 150 mg w profilaktyce PE przed 16. t.c.'],
  ['15 – 20. t.c.', 'Morfologia krwi, badanie ogólne moczu, pomiar RR i masy ciała.', 'Kontrola niedokrwistości i bezobjawowego bakteriomoczu.'],
  ['18+0 – 22+0 t.c.', '<b>USG II trymestru (połówkowe / anatomiczne)</b>: szczegółowa ocena anatomii płodu, łożyska, ilości płynu owodniowego, ew. długości szyjki (CL).', 'Wykrywanie wad strukturalnych, ocena położenia łożyska i ryzyka porodu przedwczesnego.'],
  ['21 – 26. t.c.', '<b>OGTT 75 g (24–28. t.c.)</b>, badanie ogólne moczu, przeciwciała anty-D u kobiet RhD(-), toksoplazmoza IgM (u seronegatywnych).', 'Rozpoznanie cukrzycy ciążowej (GDM): ≥1 wynik nieprawidłowy (≥92 / ≥180 / ≥153 mg/dl).'],
  ['27 – 32. t.c.', '<b>USG III trymestru (28–32. t.c.)</b> (wzrost płodu, FGR/makrosomia, położenie, AFI, łożysko), morfologia, mocz, p/ciała anty-D; <b>immunoglobulina anty-D 300 µg i.m. w 28–30. t.c.</b> u RhD(-) bez p/ciał; szczepienie Tdap (27–36. t.c.).', 'Kluczowa profilaktyka konfliktu serologicznego i krztuśca u noworodka.'],
  ['33 – 37. t.c.', '<b>Posiew w kierunku GBS (35–37. t.c.)</b> (wymaz z pochwy i odbytu), HBsAg, HIV, VDRL (u grup ryzyka / wg standardu), HCV (w grupie ryzyka), morfologia, mocz, ocena ruchów płodu.', 'Dodatni GBS = śródporodowa profilaktyka antybiotykowa (penicylina G lub ampicylina i.v. min. 4 h przed porodem).'],
  ['38 – 39. t.c.', 'Morfologia, mocz, ocena położenia płodu (chwyty Leopolda), pomiar RR, edukacja co do objawów porodu.', 'Kwalifikacja do drogi porodu; przy położeniu miednicowym rozważenie obrotu zewnętrznego (ECV ok. 36–37. t.c.).'],
  ['Po 40. t.c.', 'KTG i USG z oceną AFI/MVP; skierowanie do szpitala po 41. t.c. (indukcja porodu zwykle w 41+0 – 41+6 t.c. wg PTGiP).', 'Zapobieganie powikłaniom ciąży przenoszonej (niewydolność łożyska, małowodzie, MAS).']
];

const LEOPOLD_DATA = {
  1: {
    name: 'I chwyt Leopolda — wysokość dna i część płodu w dnie',
    hands: 'Obie dłonie położone płasko na dnie macicy (badający stoi przodem do twarzy ciężarnej).',
    answers: '<b>Co ustalamy?</b> (1) Wysokość dna macicy (szacunkowy wiek ciążowy) oraz (2) jaka duża część płodu znajduje się w dnie macicy.',
    findings: [
      '<b>Pośladki w dnie</b> (96% ciąż donoszonych — położenie podłużne główkowe): część duża, miękka, nieregularna, mniej ruchoma.',
      '<b>Główka w dnie</b> (położenie miednicowe): część twarda, okrągła, gładka, wyraźnie balotująca.'
    ],
    pearl: 'Wysokość dna: 20–22. t.c. na poziomie pępka, 36. t.c. pod łukami żebrowymi, 40. t.c. ~2 palce poniżej wyrostka mieczykowatego (po obniżeniu dna).'
  },
  2: {
    name: 'II chwyt Leopolda — ustawienie płodu (grzbiet vs części drobne)',
    hands: 'Dłonie zsuwa się z dna na boczne ściany macicy na wysokości pępka; jedna ręka stabilizuje, druga delikatnie palpuję przeciwną stronę.',
    answers: '<b>Co ustalamy?</b> Położenie płodu (podłużne vs poprzeczne) oraz <b>ustawienie</b> (po której stronie jest grzbiet — I ustawienie lewe, II ustawienie prawe).',
    findings: [
      '<b>Grzbiet płodu:</b> gładka, twarda, wypukła i ciągła powierzchnia — po tej stronie najlepiej wysłuchać czynność serca płodu (FHR)!',
      '<b>Części drobne (kończyny):</b> liczne drobne, nieregularne, ruchome wyniosłości.'
    ],
    pearl: 'Najczęstsze w terminie jest I ustawienie (grzbiet po stronie lewej — LOA), dlatego głowicę KTG/słuchawkę przykłada się zwykle w lewym dolnym kwadrancie.'
  },
  3: {
    name: 'III chwyt Leopolda (Pawlika) — część przodująca i ruchomość',
    hands: 'Kciuk i palce prawej dłoni obejmują dolny odcinek macicy tuż nad spojeniem łonowym.',
    answers: '<b>Co ustalamy?</b> Jaka część płodu przoduje do wchodu miednicy oraz czy jest jeszcze ruchoma (balotująca) nad wchodem.',
    findings: [
      '<b>Główka przodująca:</b> twarda, kulista, wyraźnie oddzielona bruzdą szyjną.',
      'Jeśli część przodująca daje się delikatnie poruszać na boki („balotuje”), <b>nie jest jeszcze ustalona</b> we wchodzie miednicy.'
    ],
    pearl: 'Chwyt III potwierdza wynik chwytu I i pozwala szybko wykluczyć położenie poprzeczne (nad spojeniem pusto!).'
  },
  4: {
    name: 'IV chwyt Leopolda — stosunek części przodującej do wchodu miednicy',
    hands: 'Badający odwraca się <b>twarzą do stóp pacjentki</b> i opuszkami palców obu rąk zagłębia się między częścią przodującą a brzegiem spojenia łonowego.',
    answers: '<b>Co ustalamy?</b> Stopień wstawienia (ustalenia) części przodującej we wchodzie miednicy oraz przygięcie/odgięcie główki (wyniosłość czołowa).',
    findings: [
      '<b>Palce schodzą się pod główką:</b> główka ruchoma nad wchodem miednicy.',
      '<b>Palce rozchodzą się (nie można objąć dolnego bieguna):</b> główka ustalona we wchodzie miednicy.',
      'W położeniu główkowym przygiętym wyniosłość czołowa jest wyczuwalna po tej samej stronie co części drobne.'
    ],
    pearl: 'Pułapka OSCE: w chwycie IV jako jedynym badający stoi <b>tyłem do twarzy ciężarnej</b> (patrzy w kierunku jej stóp)!'
  }
};

const BISHOP_PARAMS = [
  { id: 'dil', label: 'Rozwarcie szyjki macicy', opts: ['Zamknięta', '1–2 cm', '3–4 cm', '≥ 5 cm'] },
  { id: 'eff', label: 'Skrócenie (zgładzenie) szyjki', opts: ['0–30%', '40–50%', '60–70%', '≥ 80%'] },
  { id: 'sta', label: 'Punkt prowadzący (wysokość w miednicy)', opts: ['-3', '-2', '-1 / 0', '+1 / +2'] },
  { id: 'con', label: 'Konsystencja szyjki', opts: ['Twarda', 'Średnia', 'Miękka'] },
  { id: 'pos', label: 'Ustawienie szyjki w osi pochwy', opts: ['Ku tyłowi', 'Pośrednie', 'W osi (ku przodowi)'] }
];

const FIGO_TABLE = [
  ['Częstość podstawowa (FHR)', '110 – 160 /min', 'Brak pojedynczej cechy patologicznej, ale niespełnione wszystkie kryteria normy (np. FHR &gt;160 lub 100–109 bez innych zmian)', '&lt; 100 /min (ciężka bradykardia)'],
  ['Zmienność (oscylacje)', '5 – 25 /min (prawidłowa)', 'Zmienność &lt;5 /min przez 40–50 min lub &gt;25 /min przez &gt;30 min (jako izolowana cecha)', 'Zmienność &lt;5 /min &gt;50 min, zmienność &gt;25 /min &gt;30 min lub <b>zapis sinusoidalny &gt;30 min</b>'],
  ['Deceleracje', 'Brak powtarzalnych deceleracji (dopuszczalne pojedyncze sporadyczne)', 'Powtarzalne deceleracje zmienne bez cech atypowych lub pojedyncza dłuższa deceleracja', '<b>Powtarzalne deceleracje późne</b> lub <b>przedłużone &gt;3 min</b> (&gt;5 min = ostra hipoksja!), ew. ciężkie zmienne z utratą zmienności'],
  ['Interpretacja i postępowanie (FIGO 2015)', '<span class="sev g">PRAWIDŁOWY</span> Brak cech niedotlenienia. Standardowy nadzór.', '<span class="sev a">PODEJRZANY</span> Niskie prawdopodobieństwo kwasicy. Usuń odwracalne przyczyny (lewy bok, płyny, zatrzymaj oksytocynę) i monitoruj ściśle.', '<span class="sev r">PATOLOGICZNY</span> Wysokie ryzyko kwasicy płodu. Natychmiastowa korekcja przyczyn (odstaw oksytocynę, tokoliza w tachysystole) — jeśli brak szybkiej poprawy, <b>pilne zakończenie porodu!</b>']
];

const CTG_PATTERNS = {
  normal: {
    name: 'Zapis prawidłowy (FIGO 2015)',
    sev: 'g',
    sevLabel: 'Prawidłowy',
    desc: 'FHR podstawowa ~140/min, prawidłowa zmienność 10–15/min, obecne akceleracje (+15/min przez ≥15 s), brak deceleracji. Prawidłowa czynność skurczowa (3 skurcze / 10 min).',
    action: 'Brak niedotlenienia płodu — kontynuacja standardowego prowadzenia porodu.',
    fhrPath: 'M 40,78 L 58,74 74,82 90,75 108,80 124,72 142,52 162,48 182,54 200,76 220,82 238,74 256,79 274,73 292,81 312,75 332,50 352,46 372,55 390,77 410,81 428,74 446,79 464,73 482,80 500,76 520,79 540,74 560,78',
    tocoPath: 'M 40,218 L 110,218 Q 160,164 210,218 L 300,218 Q 350,164 400,218 L 490,218 Q 530,174 560,218',
    markers: [{ x: 162, y: 38, t: 'Akceleracja' }, { x: 352, y: 36, t: 'Akceleracja' }]
  },
  early: {
    name: 'Deceleracje wczesne (ucisk główki)',
    sev: 'g',
    sevLabel: 'Fizjologiczny odruch błędny',
    desc: 'Łagodne, symetryczne spadki FHR będące „lustrzanym odbiciem” skurczu macicy — nadir deceleracji pokrywa się dokładnie ze szczytem skurczu. Zachowana prawidłowa zmienność.',
    action: 'Wynikają z fizjologicznego ucisku główki płodu w kanale rodnym (odruch z nerwu błędnego). Nie świadczą o hipoksji.',
    fhrPath: 'M 40,76 L 62,72 84,78 106,74 126,86 144,102 160,114 176,102 194,86 212,75 236,80 260,73 284,78 308,75 326,88 344,104 360,114 376,104 394,88 414,76 440,80 468,74 496,79 528,75 560,77',
    tocoPath: 'M 40,218 L 110,218 Q 160,160 210,218 L 310,218 Q 360,160 410,218 L 560,218',
    markers: [{ x: 160, y: 128, t: 'Nadir = szczyt skurczu' }, { x: 360, y: 128, t: 'Lustrzane odbicie' }]
  },
  late: {
    name: 'Deceleracje późne (niewydolność łożyskowa)',
    sev: 'r',
    sevLabel: 'Patologiczny — hipoksja!',
    desc: 'Powtarzalne, łagodne spadki FHR zaczynające się po szczycie skurczu macicy — nadir opóźniony o >20 s względem szczytu skurczu, powrót po zakończeniu skurczu. Często z obniżoną zmiennością.',
    action: 'Oznaczają hipoksję z niewydolności maciczno-łożyskowej! Natychmiast: lewy bok, wstrzymaj oksytocynę, płyny i.v.; przy braku poprawy pilne zakończenie porodu.',
    fhrPath: 'M 40,78 L 70,77 100,79 135,78 165,84 185,102 205,120 225,112 248,92 270,80 305,79 340,78 365,86 385,104 405,122 425,110 448,90 472,79 515,78 560,79',
    tocoPath: 'M 40,218 L 110,218 Q 160,160 210,218 L 310,218 Q 360,160 410,218 L 560,218',
    markers: [{ x: 205, y: 134, t: 'Nadir PO szczycie skurczu' }, { x: 405, y: 134, t: 'Opóźnienie >20 s' }]
  },
  variable: {
    name: 'Deceleracje zmienne (ucisk pępowiny)',
    sev: 'a',
    sevLabel: 'Podejrzany / Patologiczny',
    desc: 'Gwałtowne spadki FHR w kształcie litery „V” lub „W” (czas spadku <30 s), zmienne w czasie względem skurczów macicy. Typowe przy małowodziu lub owinięciu pępowiny.',
    action: 'Zmiana pozycji matki (odciążenie pępowiny), wykluczenie wypadnięcia pępowiny badaniem wewnętrznym! Powtarzalne głębokie z utratą zmienności = zapis patologiczny.',
    fhrPath: 'M 40,76 L 70,79 98,74 118,76 130,136 144,75 170,80 202,74 232,78 262,75 280,144 294,106 306,138 320,74 352,79 384,73 416,77 450,74 462,130 476,75 516,79 560,76',
    tocoPath: 'M 40,218 L 110,218 Q 160,162 210,218 L 310,218 Q 360,162 410,218 L 560,218',
    markers: [{ x: 130, y: 150, t: 'Ostry spadek V (<30 s)' }, { x: 294, y: 156, t: 'Kształt W — ucisk pępowiny' }]
  },
  sinusoidal: {
    name: 'Zapis sinusoidalny (>30 min)',
    sev: 'r',
    sevLabel: 'Patologiczny — alarm!',
    desc: 'Gładka, regularna fala sinusoidalna (częstotliwość 2–5 cykli/min, amplituda 5–15/min) bez prawidłowej zmienności krótkoterminowej i bez akceleracji.',
    action: 'Ciężka niedokrwistość płodu (konflikt serologiczny, krwotok matczyno-płodowy, vasa praevia) lub głęboka kwasica/hipoksja → pilne rozwiązanie ciąży!',
    fhrPath: 'M 40,84 C 62,64 84,64 106,84 C 128,104 150,104 172,84 C 194,64 216,64 238,84 C 260,104 282,104 304,84 C 326,64 348,64 370,84 C 392,104 414,104 436,84 C 458,64 480,64 502,84 C 524,104 546,104 560,84',
    tocoPath: 'M 40,218 L 120,218 Q 170,174 220,218 L 330,218 Q 380,174 430,218 L 560,218',
    markers: [{ x: 238, y: 54, t: 'Gładka sinusoida 2–5 cykli/min' }, { x: 436, y: 118, t: 'Brak zmienności krótkoterminowej' }]
  }
};

const GAP = [
  [
    'Początek fazy aktywnej I okresu porodu',
    'Klasyczna krzywa Friedmana (starsze testy): faza aktywna zaczyna się od 3–4 cm rozwarcia szyjki (oczekiwany postęp ≥1 cm/h u pierworódki).',
    'WHO 2018 / ACOG / PTGiP: faza aktywna rozpoczyna się od <b>5–6 cm rozwarcia</b>. Przed 5–6 cm nie rozpoznaje się braku postępu porodu (unika się przedwczesnych cięć cesarskich!).'
  ],
  [
    'Klasyfikacja KTG i rola akceleracji',
    'Starsze systemy (np. dawna skala Fischera) wymagały obecności akceleracji do uznania zapisu za prawidłowy.',
    'FIGO 2015: 3-stopniowy podział (Prawidłowy / Podejrzany / Patologiczny). W czasie porodu brak akceleracji przy prawidłowej FHR (110–160), zmienności (5–25) i braku deceleracji NIE czyni zapisu patologicznym.'
  ],
  [
    'Rutynowe nacięcie krocza (epizjotomia), lewatywa i golenie',
    'Historyczna praktyka położnicza (częsta w dawnych opisach): rutynowa epizjotomia u pierworódek, wlewka doodbytnicza i zakaz picia podczas porodu.',
    'Standard Organizacyjny Opieki Okołoporodowej (MZ): ZAKAZ rutynowej epizjotomii (tylko ze wskazań medycznych), brak rutynowej wlewki/golenia, prawo do pozycji wertykalnych, picia klarownych płynów i kontaktu „skóra do skóry” przez 2 h.'
  ],
  [
    'Próg dojrzałości szyjki w skali Bishopa',
    'W części skryptów za szyjkę w pełni dojrzałą podaje się ≥8 pkt (a 6–7 pkt jako strefę pośrednią).',
    'PTGiP / ACOG w praktyce klinicznej: szyjka <b>&lt;6 pkt</b> wymaga preindukcji (cewnik Foleya lub prostaglandyny PGE2/mizoprostol), natomiast przy <b>≥6–8 pkt</b> można rozpocząć indukcję oksytocyną / amniotomią.'
  ],
  [
    'Wskazania do przerwania karmienia piersią w zapaleniu piersi (mastitis)',
    'Błędne obiegowe przekonanie: ropne/bakteryjne zapalenie piersi z gorączką i antybiotykiem wymaga odstawienia dziecka od piersi.',
    'PTGiP / WHO / ABM: w zapaleniu piersi <b>NALEŻY KONTYNUOWAĆ karmienie i opróżnianie piersi</b> (zastój nasila infekcję!); bezpieczne antybiotyki przeciwgronkowcowe (kloksacylina, cefadroksyl, amoksycylina z klawulanianem) są zgodne z laktacją.'
  ]
];

const TOPICS = {
  opieka: 'Fizjologia i badania MZ',
  porod: 'Okresy porodu',
  leopold: 'Chwyty Leopolda',
  bishop: 'Skala Bishopa',
  ktg: 'KTG (FIGO 2015)'
};

const Q = [
  {
    n: 1,
    t: 'opieka',
    c: 'src',
    s: 'Moduł [4] · Standard MZ / PTGiP',
    stem: '28-letnia ciężarna z grupą krwi A RhD(-) (ojciec dziecka RhD+, brak przeciwciał anty-D) zgłasza się na wizytę w 28. tygodniu ciąży fizjologicznej. W 25. t.c. wykonano OGTT 75 g (wyniki prawidłowe). Które działanie profilaktyczne jest OBOWIĄZKOWE na tym etapie według Standardu MZ i rekomendacji PTGiP?',
    o: [
      'Podanie profilaktycznej dawki immunoglobuliny anty-D (300 µg i.m.) w 28–30. t.c. po potwierdzeniu braku przeciwciał anty-D',
      'Pobranie wymazu w kierunku GBS w 28. t.c. i wdrożenie antybiotykoterapii doustnej w razie dodatniego wyniku',
      'Powtórzenie testu złożonego (PAPP-A i wolna β-hCG) w ramach USG III trymestru',
      'Odstąpienie od immunoglobuliny anty-D aż do porodu, ponieważ nie wystąpiło krwawienie'
    ],
    k: 0,
    why: 'Zgodnie ze Standardem Organizacyjnym Opieki Okołoporodowej MZ każda ciężarna RhD(-) bez przeciwciał anty-D otrzymuje śródciążową profilaktykę konfliktu serologicznego (immunoglobulina anty-D 300 µg i.m.) między 28. a 30. t.c., a kolejną dawkę do 72 h po porodzie, jeśli noworodek jest RhD(+). Wymaz GBS pobiera się dopiero w 35–37. t.c. (i leczy śródporodowo, nie w 28. t.c. p.o.!).',
    tip: 'Zapamiętaj 3 okna kalendarza MZ: 11–13+6 USG I trym., 24–28 OGTT 75 g, 28–30 anty-D, 35–37 GBS.'
  },
  {
    n: 2,
    t: 'leopold',
    c: 'src',
    s: 'Moduł [5] · Badanie położnicze',
    stem: 'Podczas badania ciężarnej w 38. t.c. położnik odwraca się twarzą w stronę stóp pacjentki i zagłębia opuszki palców obu dłoni między częścią przodującą a brzegiem spojenia łonowego, aby ocenić stopień wstawienia główki we wchód miednicy. Który chwyt Leopolda wykonuje i co oznacza rozchodzenie się palców badającego?',
    o: [
      'IV chwyt Leopolda — rozchodzenie się palców oznacza, że główka jest już ustalona we wchodzie miednicy',
      'III chwyt Leopolda (Pawlika) — rozchodzenie się palców oznacza, że główka balotuje wysoko nad wchodem',
      'II chwyt Leopolda — pozwala wyłącznie określić, po której stronie znajduje się grzbiet płodu',
      'I chwyt Leopolda — służy do pomiaru wysokości dna macicy w centymetrach'
    ],
    k: 0,
    why: 'IV chwyt Leopolda jako jedyny wykonuje się stojąc tyłem do twarzy ciężarnej (twarzą do jej stóp). Ocenia stosunek części przodującej do wchodu miednicy: jeśli palce obu dłoni schodzą się pod główką — główka jest ruchoma nad wchodem; jeśli palce rozchodzą się i nie mogą objąć dolnego bieguna — główka jest ustalona we wchodzie miednicy.',
    tip: 'I = dno, II = grzbiet (ustawienie), III = przodowanie/balotowanie (1 ręka), IV = wstawienie we wchód (twarzą do stóp).'
  },
  {
    n: 3,
    t: 'bishop',
    c: 'src',
    s: 'Moduł [5] · Indukcja porodu',
    stem: 'U pierworódki w 41+2 t.c. zakwalifikowanej do indukcji porodu stwierdzono: szyjka zamknięta (0 pkt), skrócona w 20% (0 pkt), twarda (0 pkt), skierowana ku tyłowi (0 pkt), punkt prowadzący -2 (1 pkt). Łączny wynik w skali Bishopa wynosi 1 pkt. Jakie postępowanie jest właściwe?',
    o: [
      'Preindukcja (dojrzewanie) szyjki macicy — np. mechaniczna cewnikiem Foleya lub farmakologiczna prostaglandynami (PGE2 / mizoprostol)',
      'Natychmiastowa amniotomia i wlew oksytocyny w dużych dawkach jako jedyna metoda',
      'Rozpoznanie w pełni dojrzałej szyjki macicy i skierowanie bezpośrednio na salę porodową do parcia',
      'Pilne cięcie cesarskie ze względu na wynik Bishopa poniżej 4 punktów'
    ],
    k: 0,
    why: 'Skala Bishopa <6 pkt (tutaj 1 pkt) oznacza szyjkę niedojrzałą. Bezpośrednie podanie oksytocyny przy zamkniętej, twardej i nieskróconej szyjce wiąże się z wysokim ryzykiem niepowodzenia indukcji i cięcia cesarskiego — najpierw stosuje się preindukcję (cewnik Foleya/balon Cooka lub prostaglandyny).',
    tip: 'Bishop <6 pkt → preindukcja (Foley / prostaglandyny); Bishop ≥6–8 pkt → indukcja (oksytocyna / amniotomia).',
    gap: {
      pool: 'Część starszych testów podaje ≥8 pkt jako jedyny próg dojrzałości szyjki.',
      now: 'PTGiP/ACOG: przy <6 pkt wskazana preindukcja; przy ≥6–8 pkt można wdrożyć oksytocynę lub amniotomię.'
    }
  },
  {
    n: 4,
    t: 'ktg',
    c: 'src',
    s: 'Moduł [5] · KTG FIGO 2015',
    stem: 'W I okresie porodu u ciężarnej otrzymującej wlew oksytocyny zapis KTG wykazuje: FHR podstawowa 148/min, zmienność 3/min przez 55 minut oraz powtarzalne deceleracje rozpoczynające się po szczycie każdego skurczu macicy (nadir opóźniony o 30 s). Jak należy sklasyfikować zapis wg FIGO 2015 i co zrobić w PIERWSZEJ kolejności?',
    o: [
      'Zapis patologiczny (deceleracje późne + zawężona zmienność >50 min) — natychmiast wstrzymać oksytocynę, ułożyć na lewym boku, nawodnić i przygotować do pilnego zakończenia porodu w razie braku szybkiej poprawy',
      'Zapis prawidłowy z deceleracjami wczesnymi z ucisku główki — kontynuować wlew oksytocyny bez zmian',
      'Zapis podejrzany — wystarczy powtórzyć KTG za 2 godziny bez zatrzymywania oksytocyny',
      'Zapis sinusoidalny — świadczy wyłącznie o śnie fizjologicznym płodu'
    ],
    k: 0,
    why: 'Powtarzalne deceleracje późne (opóźnione względem szczytu skurczu — obraz niewydolności maciczno-łożyskowej) oraz zmienność <5/min utrzymująca się >50 min to jednoznaczne kryteria zapisu PATOLOGICZNEGO wg FIGO 2015 (wysokie ryzyko kwasicy płodu). Pierwszy krok to natychmiastowa resuscytacja wewnątrzmaciczna (odstawienie oksytocyny, lewy bok, płyny i.v., ew. tokoliza przy tachysystole) i gotowość do pilnego ukończenia porodu.',
    tip: 'Późne deceleracje = Placenta (niewydolność łożyska); Zmienne = Cord (pępowina); Wczesne = Head (ucisk główki).'
  },
  {
    n: 5,
    t: 'porod',
    c: 'inf',
    s: 'Moduł [5] · III okres porodu i połóg',
    stem: 'Położnica w 10. dobie po porodzie siłami natury zgłasza się z gorączką 38,8 °C, dreszczami oraz bolesnym, zaczerwienionym, klinowatym stwardnieniem w górno-zewnętrznym kwadrancie prawej piersi. Macica jest dobrze obkurczona, niebolesna, odchody połogowe jasne (lochia alba), bez nieprzyjemnego zapachu. Jakie rozpoznanie i postępowanie są PRAWIDŁOWE?',
    o: [
      'Zapalenie piersi (mastitis) — włączyć antybiotyk przeciwgronkowcowy bezpieczny w laktacji (np. kloksacylina/cefadroksyl), NLPZ oraz KONTYNUOWAĆ regularne karmienie i opróżnianie piersi',
      'Zapalenie błony śluzowej macicy (endometritis) — natychmiastowe wyłyżeczkowanie jamy macicy',
      'Zapalenie piersi — bezwzględne przerwanie karmienia piersią i farmakologiczne zahamowanie laktacji kabergoliną',
      'Fizjologiczny nawał pokarmu typowy dla 10. doby połogu — nie wymaga leczenia farmakologicznego'
    ],
    k: 0,
    why: 'Jednostronne, klinowate zaczerwienienie i bolesność piersi z wysoką gorączką w 2.–4. tygodniu połogu to typowy obraz bakteryjnego zapalenia piersi (najczęściej Staphylococcus aureus). Fizjologiczny nawał pokarmu jest obustronny, pojawia się w 2.–5. dobie i przebiega bez wysokiej gorączki. Leczenie obejmuje antybiotyk przeciwgronkowcowy, NLPZ (ibuprofen) oraz KONTYNUACJĘ efektywnego opróżniania piersi (karmienie/odciąganie), ponieważ przerwanie karmienia nasila zastój i sprzyja powstaniu ropnia.',
    tip: 'Nawał (2–5. doba, obustronny, bez wysokiej gorączki) vs Mastitis (jednostronny klin, gorączka >38,5 °C — NIE przerywaj karmienia!).',
    gap: {
      pool: 'W części dawnych opracowań zapalenie piersi i antybiotykoterapia bywały mylnie podawane jako wskazanie do odstawienia od piersi.',
      now: 'PTGiP / WHO / ABM: kontynuacja karmienia z chorej piersi jest kluczowym elementem leczenia mastitis.'
    }
  }
];

const SOURCES = [
  ['Rozporządzenie Ministra Zdrowia — Standard Organizacyjny Opieki Okołoporodowej', 'Dz.U. z późn. zm. (kalendarz badań, prowadzenie porodu i połogu)'],
  ['FIGO Consensus Guidelines on Intrapartum Fetal Monitoring (2015)', 'Cardiotocography classification & clinical action'],
  ['PTGiP — Rekomendacje dotyczące indukcji porodu, profilaktyki konfliktu serologicznego i diagnostyki GDM', 'Polskie Towarzystwo Ginekologów i Położników'],
  ['WHO Recommendations: Intrapartum care for a positive childbirth experience (2018)', 'Definicja fazy aktywnej porodu od 5 cm rozwarcia'],
  ['Williams Obstetrics / Położnictwo i Ginekologia (Bręborowicz)', 'Fizjologia ciąży, mechanizm porodu, chwyty Leopolda i połóg']
];
