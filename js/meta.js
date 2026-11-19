/* Metadane hubu: moduły kursu, atlasy, grupy, pułapki, kalendarz MZ, leki OB, KTG/USG, Bethesda i OSCE */
window.HUB_META = (function () {
  'use strict';

  const GROUPS = {
    A: { name: 'Stany nagłe w położnictwie i ginekologii', short: 'Stany nagłe OB/GYN', color: 'var(--red)', soft: 'var(--red-l)' },
    B: { name: 'Położnictwo fizjologiczne i patologia ciąży', short: 'Położnictwo', color: 'var(--amber)', soft: 'var(--amber-l)' },
    C: { name: 'Ginekologia endokrynologiczna, rozród i zakażenia', short: 'Ginekologia i rozród', color: 'var(--blue)', soft: 'var(--blue-l)' },
    D: { name: 'Ginekologia onkologiczna i patologia szyjki', short: 'Onkologia ginekologiczna', color: 'var(--violet)', soft: 'var(--violet-l)' }
  };

  /* 12 modułów kursu V roku. at = id zbudowanego atlasu lub null (planowany), a = kotwica sekcji */
  const MODS = [
    { id: '1',  g: 'A', n: 'Krwotok poporodowy (PPH) i patologia łożyska',      at: 'nagle-ob',   a: 'pph',           d: 'Zasada 4T, atonia, łożysko przodujące, przedwczesne oddzielenie, TXA' },
    { id: '2',  g: 'A', n: 'Stan przedrzucawkowy, rzucawka i HELLP',            at: 'nagle-ob',   a: 'preeklampsja',  d: 'Kryteria PE, siarczan magnezu MgSO4, labetalol, rozwiązanie ciąży' },
    { id: '3',  g: 'A', n: 'Ciąża ektopowa i ostry brzuch ginekologiczny',      at: 'nagle-ob',   a: 'ektopowa',      d: 'Ciąża pozamaciczna, metotreksat vs laparoskopia, skręt przydatków' },
    { id: '4',  g: 'B', n: 'Fizjologia ciąży i opieka okołoporodowa (MZ)',      at: 'fizjologia', a: 'opieka',        d: 'Zmiany adaptacyjne, standard MZ, badania I–III trymestru, profilaktyka' },
    { id: '5',  g: 'B', n: 'Poród fizjologiczny, KTG (FIGO) i połóg',           at: 'fizjologia', a: 'porod',         d: 'Okresy porodu, chwyty Leopolda, skala Bishopa, zapis KTG, połóg' },
    { id: '6',  g: 'B', n: 'Cukrzyca ciążowa (GDM), cholestaza i nadciśnienie', at: null,         a: 'gdm',           d: 'OGTT 75g wg PTGiP/IADPSG, kwasy żółciowe, nadciśnienie przewlekłe' },
    { id: '7',  g: 'B', n: 'Poród przedwczesny, PROM i konflikt serologiczny',  at: null,         a: 'preterm',       d: 'Sterydoterapia prenatalna, neuroprotekcja MgSO4, tokoliza, anty-D' },
    { id: '8',  g: 'C', n: 'Endokrynologia ginekologiczna, PCOS i AUB',         at: null,         a: 'pcos',          d: 'Kryteria rotterdamskie, klasyfikacja PALM-COEIN, hiperprolaktynemia, POI' },
    { id: '9',  g: 'C', n: 'Endometrioza, mięśniaki macicy i PID',              at: null,         a: 'endometrioza',  d: 'Diagnostyka bólu miednicy, mięśniaki FIGO, zapalenie przydatków' },
    { id: '10', g: 'C', n: 'Antykoncepcja, menopauza (MHT) i uroginekologia',   at: null,         a: 'antykoncepcja', d: 'Kryteria WHO MEC, hormonalna terapia menopauzalna, nietrzymanie moczu' },
    { id: '11', g: 'D', n: 'Profilaktyka HPV, cytologia i rak szyjki macicy',   at: null,         a: 'szyjka',        d: 'System Bethesda, test HR-HPV, kolposkopia, CIN, FIGO szyjki' },
    { id: '12', g: 'D', n: 'Rak endometrium, guzy jajnika i choroby trofoblastu', at: null,       a: 'endometrium',   d: 'Krwawienie pomenopauzalne, IOTA/RMI, zaśniad groniasty i GTN' }
  ];

  /* 2 zbudowane atlasy pokazowe */
  const ATLASES = [
    {
      id: 'nagle-ob',
      dir: 'modul-1-stany-nagle-poloznicze',
      t: 'Stany nagłe w położnictwie i ginekologii',
      tag: '[1][2][3]',
      mods: ['1', '2', '3'],
      d: 'Krwotok poporodowy (4T), łożysko przodujące i przedwczesne oddzielenie, rzucawka, HELLP, ciąża ektopowa i skręt przydatków.',
      secs: [
        ['przeglad', 'Przegląd'],
        ['pph', '[1] Krwotok PPH'],
        ['lozysko', '[1] Łożysko'],
        ['preeklampsja', '[2] Rzucawka i HELLP'],
        ['ektopowa', '[3] Ciąża ektopowa'],
        ['skret', '[3] Skręt przydatków'],
        ['dawki', 'Dawki ratunkowe'],
        ['zadania', 'Zadania testowe'],
        ['klucz', 'Klucz vs PTGiP'],
        ['pulapki', 'Pułapki']
      ]
    },
    {
      id: 'fizjologia',
      dir: 'modul-2-fizjologia-ciazy-i-porodu',
      t: 'Fizjologia ciąży, porodu i KTG',
      tag: '[4][5]',
      mods: ['4', '5'],
      d: 'Opieka okołoporodowa MZ, badania w trymestrach, mechanizm porodu, chwyty Leopolda, skala Bishopa, zapis KTG (FIGO) i połóg.',
      secs: [
        ['opieka', '[4] Opieka i trymestry'],
        ['badania', '[4] Badania MZ'],
        ['porod', '[5] Okresy porodu'],
        ['leopold', '[5] Chwyty Leopolda'],
        ['bishop', '[5] Skala Bishopa'],
        ['ktg', '[5] Zapis KTG (FIGO)'],
        ['polog', '[5] Połóg i laktacja'],
        ['zadania', 'Zadania testowe'],
        ['klucz', 'Klucz vs PTGiP'],
        ['pulapki', 'Pułapki']
      ]
    }
  ];

  /* 12 kluczowych pułapek międzymodułowych OB/GYN (przyłóżkowe i testowe) */
  const TRAPS = [
    {
      id: 't1', category: 'bedside',
      t: 'Badanie przez pochwę w łożysku przodującym',
      mods: ['1', '4'],
      eq: 'Bezbolesne, jasnoczerwone krwawienie w II/III trymestrze',
      out: 'BEZWZGLĘDNY ZAKAZ badania dwuręcznego przez pochwę przed USG!',
      tip: 'Palpacja szyjki przez pochwę może sprowokować masywny, śmiertelny krwotok z zatok łożyskowych. Zawsze najpierw wykonaj USG przezbrzuszne/przezpochwowe (ostrożnie, bez ucisku szyjki).'
    },
    {
      id: 't2', category: 'bedside',
      t: 'MgSO4 — jedyny lek przeciwdrgawkowy w rzucawce',
      mods: ['2', '5'],
      eq: 'Napad drgawek w ciąży / połogu lub ciężki stan przedrzucawkowy',
      out: 'Siarczan magnezu (4–6 g i.v. bolus, potem 1–2 g/h), NIE diazepam',
      tip: 'Monitoruj diurezę (≥30 ml/h), odruchy kolanowe i oddech (≥12/min). Odtrutka przy zatruciu MgSO4: 10% glukonian wapnia 1 g (10 ml) powoli i.v.'
    },
    {
      id: 't3', category: 'bedside',
      t: 'Kwas traneksamowy (TXA) w oknie 3 godzin w PPH',
      mods: ['1', '5'],
      eq: 'Krwotok poporodowy (>500 ml po SN lub >1000 ml po CC)',
      out: 'TXA 1 g i.v. w ciągu 3 godzin od porodu + algorytm 4T (Atonia = 70%)',
      tip: 'Według badania WOMAN podanie TXA po >3 h od porodu nie przynosi już korzyści. Drugą dawkę 1 g podaj przy utrzymującym się krwawieniu po 30 min lub nawrocie w ciągu 24 h.'
    },
    {
      id: 't4', category: 'bedside',
      t: 'Ból podbrzusza u kobiety w wieku rozrodczym = β-hCG',
      mods: ['3', '9'],
      eq: 'Jednostronny ból podbrzusza + opóźnienie miesiączki / plamienie',
      out: 'Każda kobieta w wieku rozrodczym ma ciążę ektopową do czasu wykluczenia!',
      tip: 'Pęknięta ciąża pozamaciczna może przebiegać bez wyraźnego opóźnienia miesiączki i szybko prowadzić do wstrząsu krwotocznego. Zawsze oznacz β-hCG i wykonaj USG TV.'
    },
    {
      id: 't5', category: 'bedside',
      t: 'Przepływ w Dopplerze NIE wyklucza skrętu przydatków',
      mods: ['3', '12'],
      eq: 'Nagły, ostry ból miednicy + nudności/wymioty + torbiel/guz jajnika',
      out: 'Rozpoznanie skrętu jest KLINICZNE — prawidłowy Doppler nie wyklucza skrętu',
      tip: 'Podwójne unaczynienie jajnika (t. jajnikowa i gałąź jajnikowa t. macicznej) może utrzymywać sygnał tętniczy mimo niedokrwienia żylnego. Pilna laparoskopia ratuje jajnik!'
    },
    {
      id: 't6', category: 'test',
      t: 'Zakaz ACE-I i ARB w nadciśnieniu w ciąży',
      mods: ['2', '6', '4'],
      eq: 'Nadciśnienie tętnicze przewlekłe u kobiety planującej ciążę lub ciężarnej',
      out: 'Odstaw natychmiast ACE-I / ARB / statyny → metyldopa, labetalol lub nifedypina XR',
      tip: 'Inhibitory ACE i sartany działają fetotoksycznie (dysgenezja nerek płodu, małowodzie, hipoplazja płuc, zniekształcenia czaszki).'
    },
    {
      id: 't7', category: 'test',
      t: 'Profilaktyka konfliktu RhD (anty-D) — kiedy i komu?',
      mods: ['7', '3', '4'],
      eq: 'Ciężarna RhD(-) bez przeciwciał anty-D (pośredni Coombs ujemny)',
      out: '300 µg anty-D w 28–30 Hbd oraz do 72 h po porodzie dziecka RhD(+), poronieniu lub ektopowej',
      tip: 'Jeśli pacjentka ma już wytworzone przeciwciała anty-D (immunizacja obecna), podanie immunoglobuliny anty-D jest bezcelowe — wymaga monitorowania PSV-MCA płodu!'
    },
    {
      id: 't8', category: 'bedside',
      t: 'Zapis KTG sinusoidalny — ciężka niedokrwistość płodu',
      mods: ['5', '7', '1'],
      eq: 'Gładka, regularna fala sinusoidalna 3–5 cykli/min przez >30 min bez zmienności krótkoterminowej',
      out: 'Stan nagły (kategoria patologiczna FIGO) → natychmiastowe rozwiązanie ciąży',
      tip: 'Typowe przyczyny: ciężka niedokrwistość w konflikcie serologicznym, krwotok matczyno-płodowy lub pęknięcie naczyń przodujących (vasa previa).'
    },
    {
      id: 't9', category: 'test',
      t: 'Kryteria GDM w OGTT 75 g (PTGiP / IADPSG)',
      mods: ['6', '4'],
      eq: 'OGTT 75 g w 24–26 Hbd: na czczo ≥92 | po 1h ≥180 | po 2h ≥153 mg/dl',
      out: 'Wystarczy JEDNA nieprawidłowa wartość do rozpoznania GDM (nie dwie!)',
      tip: 'Uwaga na cukrzycę jawną w ciąży (DIP): glikemia na czczo ≥126 mg/dl lub w 2h OGTT ≥200 mg/dl — nie rozpoznajemy wtedy zwykłego GDM, tylko cukrzycę jawną!'
    },
    {
      id: 't10', category: 'bedside',
      t: 'Cholestaza ciążowa — próg kwasów żółciowych',
      mods: ['6', '5'],
      eq: 'Silny świąd dłoni i stóp w III trymestrze bez osutki pierwotnej + wzrost kwasów żółciowych',
      out: 'Stężenie kwasów żółciowych ≥100 µmol/l = skokowe ryzyko nagłego zgonu wewnątrzmacicznego (IUFD)',
      tip: 'Leczenie: kwas ursodeoksycholowy (UDCA) łagodzi świąd i obniża transaminazy; przy kwasach żółciowych ≥100 µmol/l zaleca się zakończenie ciąży w ok. 36+0 Hbd (PTGiP/RCOG).'
    },
    {
      id: 't11', category: 'test',
      t: 'Krwawienie pomenopauzalne = wyklucz raka endometrium',
      mods: ['12', '10', '8'],
      eq: 'Każde krwawienie z dróg rodnych po menopauzie (niezależnie od objętości)',
      out: 'USG TV z pomiarem endometrium + weryfikacja histopatologiczna przy grubości >4 mm',
      tip: 'Choć najczęstszą przyczyną jest atrofia błony śluzowej, w ~10% przypadków rozpoznaje się raka endometrium. Sama cytologia szyjki NIE wyklucza raka trzonu macicy!'
    },
    {
      id: 't12', category: 'test',
      t: 'Złożona antykoncepcja (CHC) — kategoria WHO MEC 4',
      mods: ['10', '8'],
      eq: 'Migrena z aurą, palenie ≥15 pap./d w wieku ≥35 lat, przebyta ŻChZZ, <21 dni połogu',
      out: 'BEZWZGLĘDNE przeciwwskazanie do estrogenów (WHO MEC 4) — rozważ metody bezestrogenowe',
      tip: 'W połogu u kobiet karmiących i niekarmiących przez pierwsze 21 dni CHC są przeciwwskazane z uwagi na szczyt ryzyka żylnej choroby zakrzepowo-zatorowej.'
    }
  ];

  const CONF = {
    src: { n: 'Klucz z puli', short: 'z puli', c: 'var(--green)', l: 'var(--green-l)', d: 'Klucz oznaczony w przykładowej puli zaliczeniowej' },
    inf: { n: 'Klucz wnioskowany', short: 'wnioskowany', c: 'var(--amber)', l: 'var(--amber-l)', d: 'Odpowiedź wywnioskowana z wykładu i wytycznych PTGiP/FIGO' },
    unk: { n: 'Klucz sporny', short: 'sporny', c: 'var(--red)', l: 'var(--red-l)', d: 'Rozbieżność między historycznym kluczem testowym a aktualnymi rekomendacjami' },
    did: { n: 'Dydaktyczne', short: 'dydaktyczne', c: 'var(--violet)', l: 'var(--violet-l)', d: 'Zadanie dydaktyczne utrwalające algorytmy kliniczne' },
    own: { n: 'Autorskie', short: 'autorskie', c: 'var(--blue)', l: 'var(--blue-l)', d: 'Zadanie autorskie wg standardu MZ / PTGiP / FIGO' }
  };

  const BANKS = {
    zaklad:   { id: 'zaklad',   n: 'Przykładowa pula zakładowa', short: 'Pula zakładowa', icon: 'ZAK', desc: 'Dydaktyczna reprezentacja typowych pytań kolokwialnych i egzaminacyjnych z jawnym oznaczeniem rozbieżności (klucz vs PTGiP)' },
    modulowa: { id: 'modulowa', n: 'Baza modułowa i atlasy',     short: 'Baza modułowa',  icon: 'MOD', desc: 'Pytania powiązane z 12 modułami V roku i interaktywnymi atlasami klinicznymi' },
    lek:      { id: 'lek',      n: 'Baza pytań LEK',             short: 'LEK',            icon: 'LEK', desc: 'Pytania w formacie Lekarskiego Egzaminu Końcowego z położnictwa i ginekologii' },
    pes:      { id: 'pes',      n: 'Baza pytań PES',             short: 'PES',            icon: 'PES', desc: 'Trudniejsze przypadki kliniczne z poziomu Państwowego Egzaminu Specjalizacyjnego' },
    ptgip:    { id: 'ptgip',    n: 'Wytyczne PTGiP / FIGO',      short: 'PTGiP / FIGO',   icon: 'PTG', desc: 'Pytania weryfikujące aktualne progi liczbowe, dawki i algorytmy PTGiP, FIGO i MZ' },
    custom:   { id: 'custom',   n: 'Dodane pytania (Własne)',    short: 'Własne',         icon: 'USR', desc: 'Pytania zaimportowane lub utworzone przez użytkownika lokalnie w przeglądarce' }
  };

  /* Wikilinks — kierunkowe powiązania merytoryczne dla wszystkich 12 modułów */
  const WIKILINKS = {
    '1': [
      { target: '2', atlas: 'nagle-ob', sec: 'preeklampsja', label: 'Przedwczesne oddzielenie łożyska w ciężkiej preeklampsji', type: 'trap', concept: 'Nadciśnienie w ciąży i zespół HELLP są głównym czynnikiem ryzyka odklejenia łożyska i wtórnego DIC.' },
      { target: '5', atlas: 'fizjologia', sec: 'ktg', label: 'Vasa previa i sinusoidalne KTG w krwotoku płodowym', type: 'trap', concept: 'Krwawienie po pęknięciu pęcherza płodowego z gwałtowną bradykardią lub zapisem sinusoidalnym wymaga natychmiastowego CC.' },
      { target: '7', atlas: null, sec: 'preterm', label: 'Konflikt RhD po krwawieniu z łożyska w II/III trymestrze', type: 'diag', concept: 'Każde krwawienie śródciążowe u ciężarnej RhD(-) wymaga podania immunoglobuliny anty-D i testu Kleihauera-Betkego.' },
      { target: '4', atlas: 'fizjologia', sec: 'badania', label: 'Lokalizacja łożyska w USG połówkowym (18–22 Hbd)', type: 'diag', concept: 'Nisko schodzące lub przodujące łożysko w II trymestrze wymaga kontroli USG w 32 Hbd oraz oceny ryzyka PAS (blizna po CC).' }
    ],
    '2': [
      { target: '1', atlas: 'nagle-ob', sec: 'lozysko', label: 'HELLP i ciężkie nadciśnienie ➔ oddzielenie łożyska i DIC', type: 'trap', concept: 'Koagulopatia ze zużycia w HELLP drastycznie nasila ryzyko krwotoku poporodowego (PPH).' },
      { target: '6', atlas: null, sec: 'gdm', label: 'Nadciśnienie przewlekłe nałożone ze stanem przedrzucawkowym', type: 'diag', concept: 'Różnicowanie NT przewlekłego (<20 Hbd), ciążowego i preeklampsji; profilaktyka ASA 150 mg od <16 Hbd.' },
      { target: '4', atlas: 'fizjologia', sec: 'badania', label: 'Przesiew I trymestru (FMF) i ASA 150 mg nocą', type: 'diag', concept: 'Ocena ryzyka wczesnej PE (MAP, UtA-PI, PlGF/PAPP-A) pozwala wdrożyć kwas acetylosalicylowy 150 mg przed 16 Hbd.' },
      { target: '7', atlas: null, sec: 'preterm', label: 'Jatrogenny poród przedwczesny w ciężkiej PE — sterydy i MgSO4', type: 'diag', concept: 'Przed rozwiązaniem ciąży <34 Hbd w ciężkiej PE włącz betametazon (dojrzewanie płuc) i MgSO4 (profilaktyka rzucawki + neuroprotekcja).' }
    ],
    '3': [
      { target: '9', atlas: null, sec: 'endometrioza', label: 'Przebyte PID (Chlamydia) jako główny czynnik ryzyka ciąży ektopowej', type: 'diag', concept: 'Pozapalne zrosty i uszkodzenie rzęsek jajowodu wielokrotnie podnoszą ryzyko implantacji jajowodowej.' },
      { target: '7', atlas: null, sec: 'preterm', label: 'Profilaktyka anty-D po ciąży ektopowej u matki RhD(-)', type: 'trap', concept: 'Każda ciąża pozamaciczna (leczona MTX lub operacyjnie) u kobiety RhD(-) wymaga podania immunoglobuliny anty-D.' },
      { target: '12', atlas: null, sec: 'endometrium', label: 'Różnicowanie skrętu przydatków z torbielą skórzastą / guzem jajnika', type: 'diag', concept: 'Torbiele o średnicy ≥5 cm (zwłaszcza potworniak dojrzały) najczęściej ulegają skrętowi.' },
      { target: '1', atlas: 'nagle-ob', sec: 'pph', label: 'Wstrząs krwotoczny w pękniętej ciąży ektopowej', type: 'trap', concept: 'Resuscytacja płynowa, krzyżówka krwi i pilna laparoskopia/laparotomia bez czekania na kolejne oznaczenie β-hCG.' }
    ],
    '4': [
      { target: '5', atlas: 'fizjologia', sec: 'porod', label: 'Przejście z opieki przedporodowej do kwalifikacji porodowej (38–41 Hbd)', type: 'diag', concept: 'Posiew GBS (35–37 Hbd), ocena położenia płodu i KTG po 40 Hbd łączą opiekę ambulatoryjną z salą porodową.' },
      { target: '6', atlas: null, sec: 'gdm', label: 'Badanie OGTT 75 g (24–26 Hbd) w standardzie MZ', type: 'diag', concept: 'Powszechny skrining cukrzycy ciążowej u wszystkich ciężarnych bez wcześniejszej cukrzycy.' },
      { target: '7', atlas: null, sec: 'preterm', label: 'Profilaktyka konfliktu RhD w 28–30 Hbd w kalendarzu MZ', type: 'diag', concept: 'Rutynowe podanie 300 µg anty-D ciężarnym RhD(-) bez przeciwciał ogranicza alloimmunizację o >98%.' },
      { target: '11', atlas: null, sec: 'szyjka', label: 'Cytologia przesiewowa na pierwszej wizycie w ciąży (<10 Hbd)', type: 'diag', concept: 'Jeśli ciężarna nie miała badania cytologicznego w ostatnich 6 mies., pobiera się je na 1. wizycie.' }
    ],
    '5': [
      { target: '1', atlas: 'nagle-ob', sec: 'pph', label: 'Aktywne prowadzenie III okresu porodu (AMTSL) a prewencja PPH', type: 'diag', concept: 'Profilaktyczna oksytocyna po urodzeniu przedniego barku/dziecka redukuje ryzyko krwotoku poporodowego o ~50%.' },
      { target: '2', atlas: 'nagle-ob', sec: 'preeklampsja', label: 'Rzucawka poporodowa i nadciśnienie w połogu', type: 'trap', concept: 'Nawet 1/3 przypadków rzucawki występuje PO porodzie (do 48 h, czasem później) — nie przerywaj monitorowania RR i MgSO4 przez 24 h!' },
      { target: '7', atlas: null, sec: 'preterm', label: 'Profilaktyka śródporodowa GBS (penicylina G i.v.)', type: 'diag', concept: 'Dodatni posiew GBS lub czynniki ryzyka wymagają podania antybiotyku min. 4 godziny przed urodzeniem dziecka.' },
      { target: '10', atlas: null, sec: 'antykoncepcja', label: 'Antykoncepcja w połogu i laktacji (WHO MEC 4 dla CHC <21 d.)', type: 'trap', concept: 'Zakaz estrogenów w pierwszych 21 dniach połogu (ŻChZZ); bezpieczne są metody czysto progestagenowe i IUD.' }
    ],
    '6': [
      { target: '2', atlas: 'nagle-ob', sec: 'preeklampsja', label: 'GDM i NT przewlekłe jako czynniki ryzyka stanu przedrzucawkowego', type: 'diag', concept: 'Insulinooporność i uszkodzenie śródbłonka zwiększają częstość preeklampsji i wielowodzia.' },
      { target: '5', atlas: 'fizjologia', sec: 'porod', label: 'Makrosomia w GDM a dystocja barkowa i wskazania do CC', type: 'trap', concept: 'Szacowana masa płodu >4250–4500 g u matki z cukrzycą zwiększa ryzyko dystocji barkowej (rozważ elektywne CC wg PTGiP).' },
      { target: '4', atlas: 'fizjologia', sec: 'badania', label: 'OGTT kontrolny 6–12 tygodni po porodzie po GDM', type: 'diag', concept: 'Przebyta GDM niesie wysokie ryzyko cukrzycy typu 2 — obowiązkowy test obciążenia glukozą po połogu.' }
    ],
    '7': [
      { target: '2', atlas: 'nagle-ob', sec: 'preeklampsja', label: 'Neuroprotekcja płodu MgSO4 (<32 Hbd) — schemat analogiczny do PE', type: 'diag', concept: 'Siarczan magnezu podany matce przed porodem <32 Hbd zmniejsza ryzyko mózgowego porażenia dziecięcego.' },
      { target: '5', atlas: 'fizjologia', sec: 'ktg', label: 'Ocena KTG u płodu przedwczesnego i w zapaleniu błon płodowych (chorioamnionitis)', type: 'diag', concept: 'Tachykardia płodu >160/min z gorączką matki w pPROM to sygnał zakażenia wewnątrzmacicznego i wskazanie do rozwiązania.' },
      { target: '1', atlas: 'nagle-ob', sec: 'lozysko', label: 'Przeciwwskazania do tokolizy (odklejenie łożyska, krwotok, zakażenie)', type: 'trap', concept: 'Tokoliza (atozyban/nifedypina) służy wyłącznie zyskaniu 48 h na sterydoterapię i transport in utero — nigdy przy zagrożeniu płodu lub odklejeniu łożyska!' }
    ],
    '8': [
      { target: '12', atlas: null, sec: 'endometrium', label: 'Brak owulacji w PCOS ➔ hiperplazja i rak endometrium', type: 'trap', concept: 'Przewlekła stymulacja estrogenowa bez równoważenia progesteronem wymaga ochrony endometrium (progestageny / CHC / LNG-IUS).' },
      { target: '6', atlas: null, sec: 'gdm', label: 'PCOS i insulinooporność ➔ podwyższone ryzyko GDM w ciąży', type: 'diag', concept: 'U ciężarnych z PCOS wykonuje się wczesne badanie OGTT 75 g już na pierwszej wizycie w I trymestrze.' },
      { target: '10', atlas: null, sec: 'antykoncepcja', label: 'Złożona antykoncepcja i profilaktyka osteoporozy w POI', type: 'diag', concept: 'Przedwczesna niewydolność jajników (POI <40 r.ż.) wymaga substytucji estrogenowo-progestagenowej co najmniej do wieku naturalnej menopauzy.' }
    ],
    '9': [
      { target: '3', atlas: 'nagle-ob', sec: 'ektopowa', label: 'PID jako czynnik ryzyka ciąży pozamacicznej i ropnia jajowodowo-jajnikowego', type: 'trap', concept: 'Niepełne leczenie Chlamydia trachomatis / Neisseria gonorrhoeae prowadzi do niepłodności jajowodowej i ciąży ektopowej.' },
      { target: '8', atlas: null, sec: 'pcos', label: 'Mięśniaki podśluzówkowe (FIGO 0–2) jako przyczyna AUB-L', type: 'diag', concept: 'Klasyfikacja PALM-COEIN (L = Leiomyoma) porządkuje diagnostykę obfitych krwawień miesiączkowych.' },
      { target: '12', atlas: null, sec: 'endometrium', label: 'Torbiel endometrialna (endometrioma) w diagnostyce różnicowej guza jajnika', type: 'diag', concept: 'Obraz „mlecznego szkła” (ground-glass) w USG TV wg IOTA; umiarkowanie podwyższone CA-125 bywa fałszywie dodatnie w endometriozie!' }
    ],
    '10': [
      { target: '12', atlas: null, sec: 'endometrium', label: 'MHT bez progestagenu u kobiety z zachowaną macicą = rak endometrium', type: 'trap', concept: 'Kobieta z macicą MUSI otrzymywać wstawkę progestagenową do estrogenoterapii; same estrogeny (ET) wyłącznie po histerektomii!' },
      { target: '8', atlas: null, sec: 'pcos', label: 'Hormonalna terapia w PCOS i AUB (LNG-IUS, CHC)', type: 'diag', concept: 'Wkładka z lewonorgestrelem (LNG-IUS) jest najskuteczniejszą farmakologiczną metodą redukcji obfitych krwawień miesiączkowych.' },
      { target: '5', atlas: 'fizjologia', sec: 'polog', label: 'Antykoncepcja poporodowa i uroginekologia po porodzie drogami natury', type: 'diag', concept: 'Ochrona dna miednicy, fizjoterapia uroginekologiczna i bezpieczna antykoncepcja w okresie laktacji.' }
    ],
    '11': [
      { target: '12', atlas: null, sec: 'endometrium', label: 'Komórki gruczołowe AGC w cytologii — wyklucz patologię kanału szyjki i endometrium', type: 'trap', concept: 'Wynik AGC wymaga kolposkopii z łyżeczkowaniem kanału szyjki, a u kobiet ≥35 r.ż. lub z krwawieniem także biopsji endometrium.' },
      { target: '4', atlas: 'fizjologia', sec: 'badania', label: 'Postępowanie przy nieprawidłowej cytologii (HSIL) w ciąży', type: 'diag', concept: 'Kolposkopia i celowana biopsja w ciąży są bezpieczne; zakaz łyżeczkowania kanału szyjki (ECC) w ciąży!' }
    ],
    '12': [
      { target: '10', atlas: null, sec: 'antykoncepcja', label: 'Krwawienie po menopauzie vs MHT i atrofia endometrium', type: 'trap', concept: 'Każde nieplanowe krwawienie pomenopauzalne wymaga wykluczenia raka endometrium w USG TV i biopsji.' },
      { target: '3', atlas: 'nagle-ob', sec: 'ektopowa', label: 'Zaśniad groniasty a ciąża ektopowa — skrajnie wysokie β-hCG i obraz „zamieci śnieżnej”', type: 'diag', concept: 'W zaśniadzie całkowitym β-hCG często >100 000 mIU/ml, macica większa niż wynika z Hbd, obustronne torbiele tekaluteinowe.' },
      { target: '8', atlas: null, sec: 'pcos', label: 'Otyłość, cukrzyca i brak owulacji — czynniki ryzyka raka endometrium typu I', type: 'diag', concept: 'Niezrównoważony hiperestrogenizm (PCOS, otyłość) napędza rozrost atypowy i raka endometrioidalnego.' }
    ]
  };

  /* 6 kluczowych luk semantycznych (mosty myślowe i najczęstsze błędy egzaminacyjne OB/GYN) */
  const SEMANTIC_GAPS = [
    {
      id: 'gap-1',
      from: '1', to: '4',
      fromName: 'Krwotok / Łożysko [1]',
      toName: 'Opieka okołoporodowa [4]',
      title: 'Łożysko przodujące vs przedwczesne oddzielenie łożyska',
      clinicalReason: 'Łożysko przodujące powoduje bezbolesne, jasnoczerwone krwawienie przy miękkiej, niebolesnej macicy i zazwyczaj prawidłowym tętnie płodu. Przedwczesne oddzielenie (abruptio placentae) objawia się nagłym bólem brzucha, deskowato twardą macicą (hipertonia), ciemnoczerwonym krwawieniem (często niewspółmiernym do wstrząsu — krwawienie utajone!) i gwałtowną bradykardią płodu.',
      examTrap: 'Wykonanie badania palpacyjnego przez pochwę przy nieznanej lokalizacji łożyska u ciężarnej krwawiącej w II/III trymestrze — grozi rozerwaniem zatok naczyniowych i krwotokiem śmiertelnym. Najpierw ZAWSZE USG!',
      mods: ['1', '4', '5']
    },
    {
      id: 'gap-2',
      from: '2', to: '7',
      fromName: 'Preeklampsja i HELLP [2]',
      toName: 'Poród przedwczesny [7]',
      title: 'Siarczan magnezu (MgSO4): podwójna rola i śmiertelna pułapka toksyczności',
      clinicalReason: 'MgSO4 jest lekiem z wyboru zarówno w profilaktyce i leczeniu drgawek rzucawkowych (bolus 4–6 g i.v. w 15–20 min, wlew 1–2 g/h), jak i w neuroprotekcji płodu przy zagrażającym porodzie <32 Hbd. Wydala się wyłącznie przez nerki — skąpomocz (<30 ml/h) w ciężkiej PE/HELLP błyskawicznie prowadzi do hipermagnezemii.',
      examTrap: 'Podanie diazepamu zamiast MgSO4 jako leku 1. rzutu w rzucawce lub przeoczenie kolejności objawów toksyczności MgSO4: zniesienie odruchu kolanowego → spadek częstości oddechów <12/min → zatrzymanie krążenia. Antidotum: 10% glukonian wapnia 1 g i.v.',
      mods: ['2', '7', '5']
    },
    {
      id: 'gap-3',
      from: '3', to: '7',
      fromName: 'Ciąża ektopowa [3]',
      toName: 'Konflikt serologiczny [7]',
      title: 'Immunizacja RhD po ciąży ektopowej i poronieniu w I trymestrze',
      clinicalReason: 'Antygen D na erytrocytach płodu pojawia się już ok. 6. tygodnia ciąży. Krwawienie do jamy otrzewnej w ciąży pozamacicznej, poronienie samoistne/zabiegowe oraz krwawienia I trymestru mogą spowodować przeciek erytrocytów płodowych do krążenia matki RhD(-).',
      examTrap: 'Zapomnienie o podaniu immunoglobuliny anty-D po laparoskopii ciąży ektopowej lub po metotreksacie u pacjentki RhD(-). Konsekwencją jest konflikt serologiczny i choroba hemolityczna płodu w kolejnej ciąży!',
      mods: ['3', '7', '4']
    },
    {
      id: 'gap-4',
      from: '6', to: '5',
      fromName: 'GDM i Cholestaza [6]',
      toName: 'Poród i KTG [5]',
      title: 'Próg kwasów żółciowych w cholestazie i kryteria OGTT w GDM',
      clinicalReason: 'W cholestazie ciążowej (ICP) kwasy żółciowe przenikają przez łożysko i zaburzają przewodnictwo kardiomiocytów płodu, mogąc wywołać nagłe zatrzymanie krążenia płodu (IUFD) nawet przy prawidłowym wcześniejszym KTG. W GDM hiperglikemia matki stymuluje hiperinsulinizm płodu i makrosomię.',
      examTrap: 'Rozpoznanie GDM dopiero przy 2 nieprawidłowych wynikach OGTT (stare kryteria!) — wg PTGiP/IADPSG wystarczy JEDNA wartość ≥92 / ≥180 / ≥153 mg/dl. W cholestazie stężenie kwasów żółciowych ≥100 µmol/l nakazuje rozwiązanie ok. 36 Hbd!',
      mods: ['6', '5', '4']
    },
    {
      id: 'gap-5',
      from: '8', to: '12',
      fromName: 'PCOS i AUB [8]',
      toName: 'Rak endometrium [12]',
      title: 'Przewlekły brak owulacji ➔ hiperplazja atypowa i rak endometrium',
      clinicalReason: 'W zespole PCOS i otyłości dochodzi do ciągłej stymulacji endometrium przez estrogeny (w tym obwodową aromatyzację androgenów w tkance tłuszczowej) bez fizjologicznego równoważenia progesteronem ciałka żółtego. Prowadzi to do rozrostu endometrium z atypią i raka endometrioidalnego typu I.',
      examTrap: 'Zlecenie samej cytologii szyjki macicy u 56-letniej pacjentki z krwawieniem pomenopauzalnym lub u otyłej pacjentki z PCOS i krwawieniami międzymiesiączkowymi. Cytologia NIE bada jamy macicy — konieczne jest USG TV i biopsja endometrium!',
      mods: ['8', '12', '10']
    },
    {
      id: 'gap-6',
      from: '11', to: '4',
      fromName: 'Cytologia / HPV [11]',
      toName: 'Ciąża fizjologiczna [4]',
      title: 'Nieprawidłowy wynik cytologii (HSIL) w ciąży — co wolno, a czego nie wolno?',
      clinicalReason: 'Ciąża nie przyspiesza progresji CIN do raka inwazyjnego, ale wymaga bezpiecznego wykluczenia inwazji. Kolposkopia oraz celowana biopsja wycinkowa tarczy szyjki są w ciąży w pełni dozwolone i bezpieczne.',
      examTrap: 'Zlecenie łyżeczkowania kanału szyjki macicy (ECC) lub rutynowej konizacji u ciężarnej z CIN 2/3 (HSIL). ECC jest w ciąży BEZWZGLĘDNIE PRZECIWWSKAZANE! Leczenie CIN 2/3 (LEEP/konizację) odracza się do 6–8 tygodni po porodzie, o ile kolposkopia wykluczyła raka inwazyjnego.',
      mods: ['11', '4']
    }
  ];

  /* 6 zespołów objawowych OB/GYN (Symptom Explorer) */
  const SYMPTOM_CLUSTERS = [
    {
      id: 's1',
      name: 'Krwawienie w II / III trymestrze ciąży',
      icon: 'KRW',
      tag: 'Stany nagłe położnicze',
      mods: ['1', '5', '7'],
      redFlags: [
        'Bezbolesne, jasnoczerwone krwawienie + miękka macica ➔ łożysko przodujące [1]',
        'Nagły silny ból + deskowato twarda macica + bradykardia płodu ➔ przedwczesne oddzielenie łożyska [1]',
        'Krwawienie tuż po odpłynięciu płynu owodniowego + gwałtowna bradykardia/sinusoidalne KTG ➔ vasa previa [1][5]',
        'Nagły ból w bliźnie po CC + zatrzymanie czynności skurczowej + utrata części przodującej ➔ pęknięcie macicy [1][5]'
      ],
      keyRule: 'ZANIM wykonasz badanie przez pochwę u krwawiącej ciężarnej w II/III trymestrze: ZAWSZE wyklucz łożysko przodujące w USG! Równocześnie zabezpiecz 2 szerokie wkłucia i.v., grupę krwi, krzyżówkę i KTG.',
      branches: [
        { mod: '1', name: 'Łożysko przodujące (Placenta praevia)', clue: 'Bezbolesne jasnoczerwone krwawienie, macica miękka, brak tachysystole; rozpoznanie w USG', atlas: 'nagle-ob', sec: 'lozysko', linkText: 'Łożysko przodujące i PAS' },
        { mod: '1', name: 'Przedwczesne oddzielenie łożyska (Abruptio)', clue: 'Silny ciągły ból brzucha, wzmożone napięcie macicy, wstrząs często większy niż widoczna utrata krwi, ryzyko DIC', atlas: 'nagle-ob', sec: 'lozysko', linkText: 'Algorytm odklejenia łożyska' },
        { mod: '5', name: 'Vasa previa (naczynia przodujące)', clue: 'Krwawienie płodowe po pęknięciu błon płodowych — błyskawiczna hipowolemia i bradykardia płodu, natychmiastowe CC', atlas: 'fizjologia', sec: 'ktg', linkText: 'Zapis KTG w stanach nagłych' },
        { mod: '7', name: 'Rozpoczynający się poród przedwczesny / skracanie szyjki', clue: 'Skąpe plamienie śluzowo-krwiste (czop śluzowy) z regularnymi skurczami przed 37 Hbd', atlas: null, sec: 'preterm', linkText: 'Postępowanie w porodzie przedwczesnym' }
      ],
      trap: {
        type: 'bedside',
        badge: 'Zagrożenie życia / Błąd krytyczny',
        title: 'Badanie dwuręczne przez pochwę przed USG',
        desc: 'Włożenie palca do kanału szyjki przy łożysku przodującym może wywołać masywny, trudny do opanowania krwotok z zatok łożyskowych w ciągu sekund.'
      },
      examTip: 'Pytania LEK/PES: Bezbolesne krwawienie = łożysko przodujące; bolesne + twarda macica = przedwczesne oddzielenie; krwawienie po amniotomii + bradykardia płodu = vasa previa.'
    },
    {
      id: 's2',
      name: 'Ostry ból podbrzusza u kobiety w wieku rozrodczym',
      icon: 'BÓL',
      tag: 'Ostry brzuch ginekologiczny',
      mods: ['3', '9', '12'],
      redFlags: [
        'Dodatni test ciążowy / β-hCG + pusta jama macicy + płyn w zatoce Douglasa ➔ pęknięta ciąża ektopowa [3]',
        'Nagły, przeszywający ból jednostronny + wymioty + torbiel ≥5 cm ➔ skręt przydatków [3][12]',
        'Gorączka + ropne upławy + bolesność szyjki przy poruszaniu (objaw żyrandola) ➔ ostre PID / ropień TOA [9]',
        'Nagły ból w połowie cyklu bez niestabilności + niewielki płyn w zatoce Douglasa ➔ pęknięcie torbieli ciałka żółtego [3]'
      ],
      keyRule: 'Pierwsze badanie u każdej kobiety w wieku rozrodczym z bólem podbrzusza to test ciążowy / ilościowe β-hCG oraz USG przezpochwowe (TV).',
      branches: [
        { mod: '3', name: 'Ciąża ektopowa (pozamaciczna)', clue: 'Ból jednostronny, plamienie, β-hCG (+), brak pęcherzyka w jamie macicy powyżej strefy dyskryminacyjnej (1500–3500 mIU/ml)', atlas: 'nagle-ob', sec: 'ektopowa', linkText: 'Ciąża ektopowa: MTX vs laparoskopia' },
        { mod: '3', name: 'Skręt przydatków (Torsio adnexorum)', clue: 'Nagły silny ból, nudności/wymioty, obrzęknięty jajnik w USG; prawidłowy Doppler NIE wyklucza skrętu!', atlas: 'nagle-ob', sec: 'skret', linkText: 'Algorytm skrętu przydatków' },
        { mod: '9', name: 'Zapalenie narządów miednicy mniejszej (PID)', clue: 'Bolesność przy poruszaniu szyjką, tkliwość przydatków, gorączka, CRP; antybiotykoterapia empiryczna (ceftriakson + doksycyklina + metronidazol)', atlas: null, sec: 'endometrioza', linkText: 'Rozpoznanie i leczenie PID' },
        { mod: '12', name: 'Pęknięcie lub krwotok do torbieli jajnika', clue: 'Nagły ból w fazie lutealnej, β-hCG ujemne; przy stabilności hemodynamicznej obserwacja, przy wstrząsie laparoskopia', atlas: null, sec: 'endometrium', linkText: 'Ocena guzów i torbieli jajnika' }
      ],
      trap: {
        type: 'bedside',
        badge: 'Zagrożenie życia / Błąd krytyczny',
        title: 'Odesłanie pacjentki z bólem podbrzusza bez oznaczenia β-hCG',
        desc: 'Nawet przy deklarowanej „ostatniej miesiączce w terminie” (która mogła być krwawieniem z doczesnej!) pominięcie β-hCG grozi przeoczeniem pękającej ciąży jajowodowej.'
      },
      examTip: 'Objaw żyrandola (ból przy poruszaniu szyjką) = PID; nagły ból + wymioty + masa przydatków + β-hCG(-) = skręt; β-hCG(+) + płyn w jamie brzusznej = pęknięta ciąża ektopowa.'
    },
    {
      id: 's3',
      name: 'Nadciśnienie, ból głowy i ból w nadbrzuszu w ciąży',
      icon: 'NT',
      tag: 'Preeklampsja, rzucawka i HELLP',
      mods: ['2', '6', '1'],
      redFlags: [
        'RR ≥160/110 mmHg, silny ból głowy, zaburzenia widzenia (mroczki) ➔ ciężki stan przedrzucawkowy (zagrażająca rzucawka) [2]',
        'Ból w prawym podżebrzu/nadbrzuszu + PLT <100 tys. + AST/ALT >2×GGN + hemoliza ➔ zespół HELLP [2]',
        'Napad drgawek toniczno-klonicznych w ciąży lub połogu ➔ rzucawka (Eclampsia) [2]',
        'Ból brzucha + twarda macica u ciężarnej z NT ➔ przedwczesne oddzielenie łożyska [1][2]'
      ],
      keyRule: 'U ciężarnej ≥20 Hbd z bólami w prawym nadbrzuszu i nudnościami ZAWSZE oznacz morfologię (PLT), AST/ALT, LDH i białko w moczu — ból podżebrowy to objaw rozciągania torebki Glissona w HELLP!',
      branches: [
        { mod: '2', name: 'Stan przedrzucawkowy (PE) z cechami ciężkości', clue: 'RR ≥140/90 po 20 Hbd + białkomocz lub uszkodzenie narządowe (PLT <100k, Cr >1.1, AST/ALT 2×, obrzęk płuc, objawy OUN)', atlas: 'nagle-ob', sec: 'preeklampsja', linkText: 'Kryteria PE i protokół MgSO4' },
        { mod: '2', name: 'Zespół HELLP', clue: 'Hemoliza (schistocyty, LDH >600), podwyższone enzymy wątrobowe, małopłytkowość <100 tys./µl — może przebiegać bez białkomoczu i z umiarkowanym RR!', atlas: 'nagle-ob', sec: 'preeklampsja', linkText: 'Rozpoznanie i rozwiązanie w HELLP' },
        { mod: '6', name: 'Nadciśnienie przewlekłe lub ciążowe', clue: 'Przewlekłe <20 Hbd, ciążowe ≥20 Hbd bez uszkodzeń narządowych; leczenie: metyldopa, labetalol, nifedypina XR', atlas: null, sec: 'gdm', linkText: 'Klasyfikacja nadciśnienia w ciąży' }
      ],
      trap: {
        type: 'bedside',
        badge: 'Zagrożenie życia / Błąd krytyczny',
        title: 'Zbagatelizowanie bólu w nadbrzuszu jako „zgagi ciążowej”',
        desc: 'Ból w prawym podżebrzu w III trymestrze może zwiastować zespół HELLP i krwiak podtorebkowy wątroby z ryzykiem śmiertelnego pęknięcia wątroby.'
      },
      examTip: 'Definitywnym leczeniem preeklampsji i HELLP jest zakończenie ciąży (poród łożyska). W ciąży ≥37 Hbd (lub ≥34 Hbd z cechami ciężkości / w każdym tygodniu w rzucawce i HELLP) — rozwiązuj!'
    },
    {
      id: 's4',
      name: 'Świąd skóry i zaburzenia metaboliczne w III trymestrze',
      icon: 'ICP',
      tag: 'Cholestaza, GDM i AFLP',
      mods: ['6', '2', '5'],
      redFlags: [
        'Silny świąd dłoni i podeszw stóp nasilający się nocą + brak pierwotnej wysypki ➔ cholestaza ciężarnych (ICP) [6]',
        'Kwasy żółciowe w surowicy ≥100 µmol/l ➔ wysokie ryzyko nagłego zgonu wewnątrzmacicznego (IUFD) [6]',
        'Nudności, wymioty, żółtaczka, hipoglikemia i koagulopatia w III trymestrze ➔ ostre stłuszczenie wątroby ciężarnych (AFLP) [6][2]',
        'Wielowodzie + EFW >90. centyla ➔ niekontrolowana cukrzyca ciążowa (GDM) [6]'
      ],
      keyRule: 'Świąd dłoni i stóp w II/III trymestrze bez wykwitów skórnych (poza przeczosami) = pilnie oznacz całkowite kwasy żółciowe (TBA) i AST/ALT.',
      branches: [
        { mod: '6', name: 'Wewnątrzwątrobowa cholestaza ciężarnych (ICP)', clue: 'Kwasy żółciowe ≥10 µmol/l (ciężka ≥40, b. ciężka ≥100 µmol/l); leczenie UDCA + planowe zakończenie ciąży', atlas: null, sec: 'gdm', linkText: 'Progi kwasów żółciowych w ICP' },
        { mod: '2', name: 'Ostre stłuszczenie wątroby ciężarnych (AFLP)', clue: 'Kryteria Swansea: hipoglikemia, hiperurykemia, leukocytoza, wzrost INR/APTT, encefalopatia — pilne rozwiązanie ciąży!', atlas: 'nagle-ob', sec: 'preeklampsja', linkText: 'Różnicowanie HELLP vs AFLP' },
        { mod: '6', name: 'Cukrzyca ciążowa (GDM)', clue: 'OGTT 75 g: ≥92 / ≥180 / ≥153 mg/dl; dieta + samokontrola glikemii (na czczo <90, 1h po posiłku <140 mg/dl), przy braku wyrównania insulina', atlas: null, sec: 'gdm', linkText: 'Kryteria GDM wg PTGiP' }
      ],
      trap: {
        type: 'test',
        badge: 'Pułapka egzaminacyjna',
        title: 'Prawidłowe KTG nie wyklucza nagłego zgonu płodu w ciężkiej cholestazie',
        desc: 'W cholestazie z kwasami żółciowymi ≥100 µmol/l zgon płodu jest nagły (arytmia wywołana kwasami żółciowymi), dlatego decyzja o terminie porodu zależy od maksymalnego stężenia TBA, a nie od pojedynczego dobrego KTG.'
      },
      examTip: 'Świąd w rozstępach brzucha z grudkami pokrzywkowymi (oszczędzający pępek) to łagodne PUPPP — nie mylić z cholestazą (dłonie/stopy bez osutki)!'
    },
    {
      id: 's5',
      name: 'Nieprawidłowe krwawienia z macicy (AUB) i krwawienie pomenopauzalne',
      icon: 'AUB',
      tag: 'PALM-COEIN i onkologia trzonu',
      mods: ['8', '9', '12', '10'],
      redFlags: [
        'Krwawienie po menopauzie + endometrium >4 mm w USG TV ➔ pilna weryfikacja histopatologiczna (rak endometrium) [12]',
        'Krwawienie kontaktowe po stosunku ➔ wyklucz raka szyjki macicy (wzrokowo we wzierniku + cytologia/kolposkopia) [11]',
        'Obfite krwawienia + powiększona, guzowata macica ➔ mięśniaki podśluzówkowe/śródścienne (AUB-L) [9]',
        'Rzadkie, nieregularne krwawienia od pokwitania + hiperandrogenizm ➔ PCOS / brak owulacji (AUB-O) [8]'
      ],
      keyRule: 'U każdej pacjentki z AUB w wieku rozrodczym najpierw wyklucz ciążę (β-hCG), potem zastosuj system PALM-COEIN. Po menopauzie priorytetem #1 jest wykluczenie raka endometrium.',
      branches: [
        { mod: '12', name: 'Rak endometrium / hiperplazja atypowa', clue: 'Krwawienie pomenopauzalne, otyłość, cukrzyca, brak owulacji; USG TV + biopsja aspiracyjna (Pipelle) lub histeroskopia', atlas: null, sec: 'endometrium', linkText: 'Diagnostyka raka endometrium' },
        { mod: '9', name: 'Mięśniaki macicy (AUB-L) i adenomioza (AUB-A)', clue: 'Klasyfikacja FIGO 0–8; mięśniaki podśluzówkowe (0–2) powodują największe krwotoki miesiączkowe', atlas: null, sec: 'endometrioza', linkText: 'Mięśniaki FIGO i adenomioza' },
        { mod: '8', name: 'Zaburzenia owulacji (AUB-O / PCOS)', clue: 'Kryteria rotterdamskie (2 z 3: oligo-/anovulacja, hiperandrogenizm, PCOM w USG po wykluczeniu innych przyczyn)', atlas: null, sec: 'pcos', linkText: 'Kryteria PCOS i PALM-COEIN' },
        { mod: '11', name: 'Patologia szyjki macicy', clue: 'Krwawienie kontaktowe (po stosunku) zawsze wymaga badania we wzierniku przed jakąkolwiek terapią hormonalną', atlas: null, sec: 'szyjka', linkText: 'Diagnostyka raka szyjki' }
      ],
      trap: {
        type: 'test',
        badge: 'Pułapka testowa',
        title: 'Terapia progestagenami bez badania we wzierniku i bez USG',
        desc: 'Włączenie leków hormonalnych w ciemno przy krwawieniu kontaktowym lub pomenopauzalnym maskuje objawy raka szyjki lub endometrium i opóźnia rozpoznanie.'
      },
      examTip: 'PALM (strukturalne): Polyp, Adenomyosis, Leiomyoma, Malignancy/hyperplasia. COEIN (niestrukturalne): Coagulopathy, Ovulatory, Endometrial, Iatrogenic, Not yet classified.'
    },
    {
      id: 's6',
      name: 'Wtórny brak miesiączki i guz przydatków',
      icon: 'CYK',
      tag: 'Endokrynologia i onkologia jajnika',
      mods: ['8', '12', '3', '10'],
      redFlags: [
        'Brak miesiączki >3 mies. u kobiety w wieku rozrodczym ➔ ZAWSZE najpierw test ciążowy (β-hCG)! [4][8]',
        'FSH >25–40 IU/l dwukrotnie w wieku <40 lat + niski estradiol ➔ przedwczesna niewydolność jajników (POI) [8][10]',
        'Guz przydatków z cechami M wg IOTA (lity nieregularny, wodobrzusze, ≥4 wyrośla brodawkowate, silny Doppler) ➔ podejrzenie raka jajnika [12]',
        'Wtórny brak miesiączki + mlekotok + bóle głowy ➔ hiperprolaktynemia / gruczolak przysadki (PRL, TSH, MRI) [8]'
      ],
      keyRule: 'Algorytm wtórnego braku miesiączki: 1) β-hCG → 2) TSH i prolaktyna (PRL) → 3) FSH, LH, estradiol (E2) i test progesteronowy.',
      branches: [
        { mod: '8', name: 'Hiperprolaktynemia i hipogonadyzm hipogonadotropowy', clue: 'Niskie FSH/LH/E2 (stres, niedowaga, intensywny sport — triada sportsmenek) lub wysoka PRL (leki p/psychotyczne, prolaktynoma — bromokryptyna/kabergolina)', atlas: null, sec: 'pcos', linkText: 'Diagnostyka amenorrhoea' },
        { mod: '8', name: 'Przedwczesna niewydolność jajników (POI)', clue: 'Hipergonadotropowy hipogonadyzm <40 r.ż. (wysokie FSH, niskie E2); konieczna substytucja hormonalna dla ochrony kości i serca', atlas: null, sec: 'pcos', linkText: 'Kryteria POI i leczenie' },
        { mod: '12', name: 'Guzy jajnika — kryteria IOTA i wskaźnik RMI', clue: 'RMI = U × M × CA-125; RMI ≥200 lub cechy M w IOTA ➔ skierowanie do ośrodka ginekologii onkologicznej', atlas: null, sec: 'endometrium', linkText: 'Reguły IOTA i kalkulator RMI' }
      ],
      trap: {
        type: 'test',
        badge: 'Pułapka egzaminacyjna',
        title: 'CA-125 NIE jest badaniem przesiewowym raka jajnika u kobiet bez objawów',
        desc: 'CA-125 jest nieswoiste — rośnie w endometriozie, mięśniakach, ciąży, PID i w trakcie miesiączki. U młodych kobiet z guzem jajnika należy też oznaczyć markery zarodkowe (AFP, β-hCG, LDH).'
      },
      examTip: 'Zespół Ashermana (zrosty wewnątrzmaciczne po łyżeczkowaniu): prawidłowe FSH/LH/E2, ale brak krwawienia nawet po teście estrogenowo-progesteronowym!'
    }
  ];

  /* ---------- KALENDARZ BADAŃ W CIĄŻY WG STANDARDU ORGANIZACYJNEGO MZ / PTGiP ---------- */
  const PREGNANCY_CALENDAR = [
    {
      id: 'wizyta-1',
      trimester: 1,
      period: '< 10 Hbd',
      title: 'Pierwsza wizyta i potwierdzenie ciąży',
      badge: 'Kluczowy bilans otwarcia',
      mandatoryTests: [
        'Grupa krwi i czynnik RhD oraz przeciwciała odpornościowe do antygenów krwinek czerwonych (pośredni test antyglobulinowy)',
        'Morfologia krwi i badanie ogólne moczu',
        'Glukoza we krwi na czczo (przy czynnikach ryzyka GDM: od razu OGTT 75 g!)',
        'TSH (badanie przesiewowe czynności tarczycy)',
        'Badania serologiczne: VDRL (kiła), HIV, HCV, HBsAg (lub wg standardu MZ: HBsAg w III trymestrze, w praktyce często już na starcie), toksoplazmoza IgG/IgM, różyczka IgG/IgM (jeśli brak udokumentowanego szczepienia/odporności)',
        'Cytologia szyjki macicy (jeśli nie była wykonana w ciągu ostatnich 6 miesięcy)'
      ],
      clinicalExam: [
        'Wywiad położniczy, rodzinny i ocena czynników ryzyka (w tym ryzyka PE, GDM i ŻChZZ)',
        'Badanie podmiotowe, przedmiotowe, ginekologiczne (we wzierniku i dwuręczne) oraz badanie gruczołów sutkowych',
        'Pomiar ciśnienia tętniczego (RR), masy ciała, wzrostu i wyliczenie wyjściowego BMI',
        'USG TV potwierdzające ciążę wewnątrzmaciczną, liczbę zarodków i czynność serca (FHR)'
      ],
      counseling: [
        'Suplementacja wg PTGiP: kwas foliowy 0.4 mg/d (4 mg przy wywiadzie WCN), witamina D3 2000 j.m./d, jod 150–200 µg/d, DHA min. 200 mg/d',
        'Zalecenie konsultacji stomatologicznej, abstynencja od alkoholu i tytoniu, omówienie szczepień (grypa, COVID-19)'
      ],
      redFlag: 'Ból jednostronny i plamienie przy pustej jamie macicy w USG → pilnie wyklucz ciążę ektopową!'
    },
    {
      id: 'usg-1t',
      trimester: 1,
      period: '11+0 – 13+6 Hbd',
      title: 'USG I trymestru (genetyczne) i test złożony FMF',
      badge: 'Okno CRL 45–84 mm',
      mandatoryTests: [
        'USG I trymestru (gdy CRL wynosi 45–84 mm): weryfikacja wieku ciążowego, przezierność karkowa (NT), kość nosowa (NB), FHR, wstępna anatomia płodu',
        'Test podwójny (PAPP-A + wolna podjednostka β-hCG) w ramach programu badań prenatalnych NFZ (obecnie dostępny dla wszystkich ciężarnych bez ograniczenia wieku)',
        'Ocena ryzyka wczesnej preeklampsji (FMF): wywiad, MAP, wskaźnik pulsacji tętnic macicznych (UtA-PI), PAPP-A/PlGF',
        'Badanie ogólne moczu'
      ],
      clinicalExam: [
        'Pomiar RR i masy ciała',
        'Ocena wydolności szyjki macicy u kobiet z wywiadem porodu przedwczesnego / strat II trymestru'
      ],
      counseling: [
        'Przy wysokim ryzyku stanu przedrzucawkowego (>1:100 wg FMF lub czynniki kliniczne): włącz kwas acetylosalicylowy (ASA) 150 mg p.o. wieczorem przed 16+0 Hbd do 36+0 Hbd!',
        'Omówienie wyniku testu złożonego i ewentualnych wskazań do cfDNA (NIPT) lub diagnostyki inwazyjnej (CVS/amniopunkcja)'
      ],
      redFlag: 'NT ≥3.5 mm lub obrzęk płodu → pilna konsultacja w ośrodku referencyjnym (wykluczenie wad chromosomowych i wad serca płodu).'
    },
    {
      id: 'wizyta-15-20',
      trimester: 2,
      period: '15 – 22 Hbd',
      title: 'Wizyta II trymestru i USG połówkowe (18–22 Hbd)',
      badge: 'Anatomia płodu i szyjka',
      mandatoryTests: [
        'Morfologia krwi i badanie ogólne moczu',
        'USG połówkowe (18+0 – 22+0 Hbd): szczegółowa ocena anatomii wszystkich narządów płodu (w tym 4 jamy serca i drogi odpływu), biometria, ocena ilości płynu owodniowego',
        'Ocena położenia łożyska (wykluczenie łożyska przodującego / nisko schodzącego) i długości kanału szyjki macicy (CL) w USG TV u grup ryzyka'
      ],
      clinicalExam: [
        'Pomiar RR i przyrostu masy ciała (wg norm IOM dla wyjściowego BMI)',
        'Ocena czynności serca płodu i odczuwania pierwszych ruchów płodu (ok. 18–20 Hbd)',
        'Ocena ryzyka i nasilenia objawów depresji (skala EPDS — obowiązkowy element standardu MZ)'
      ],
      counseling: [
        'Przy długości szyjki ≤25 mm w ciąży pojedynczej przed 24 Hbd: wdrożenie progesteronu dopochwowego (200 mg/d) i/lub rozważenie szwu okrężnego (cerclage)',
        'Edukacja dotycząca objawów zagrażającego porodu przedwczesnego i przedwczesnego odpływania płynu owodniowego'
      ]
    },
    {
      id: 'ogtt-24-26',
      trimester: 2,
      period: '24 – 26 Hbd',
      title: 'Test OGTT 75 g i badania serologiczne II/III trymestru',
      badge: 'Skrining GDM (PTGiP)',
      mandatoryTests: [
        'Doustny test obciążenia glukozą OGTT 75 g (na czczo, po 1h, po 2h) — u wszystkich ciężarnych bez wcześniej rozpoznanej cukrzycy',
        'Przeciwciała anty-RhD u kobiet z grupą krwi RhD(-)',
        'Toksoplazmoza IgM u kobiet seronegatywnych w I trymestrze',
        'Badanie ogólne moczu'
      ],
      clinicalExam: [
        'Pomiar RR, masy ciała, ocena obrzęków',
        'Ocena czynności serca płodu i ruchów płodu'
      ],
      counseling: [
        'Progi rozpoznania GDM (PTGiP/IADPSG): na czczo 92–125 mg/dl | po 1h ≥180 mg/dl | po 2h 153–199 mg/dl (wystarczy ≥1 wynik nieprawidłowy)',
        'Zaplanowanie szczepienia przeciw krztuścowi (Tdap) w oknie 27–36 Hbd'
      ],
      redFlag: 'Glikemia na czczo ≥126 mg/dl lub po 2h ≥200 mg/dl w OGTT = cukrzyca jawna w ciąży (DIP) → pilna opieka diabetologiczna!'
    },
    {
      id: 'usg-3t-antyd',
      trimester: 3,
      period: '28 – 32 Hbd',
      title: 'USG III trymestru, profilaktyka anty-D i szczepienia',
      badge: 'Anty-D (28–30 Hbd) + Tdap',
      mandatoryTests: [
        'USG III trymestru (28+0 – 32+0 Hbd): wzrastanie płodu (EFW, wykrywanie FGR/makrosomii), ilość płynu owodniowego (AFI/MVP), położenie płodu, kontrola lokalizacji łożyska',
        'Morfologia krwi (diagnostyka niedokrwistości ciążowej — Hb <11 g/dl) i badanie ogólne moczu',
        'Podanie immunoglobuliny anty-D (300 µg i.m.) w 28–30 Hbd u wszystkich ciężarnych RhD(-) bez przeciwciał anty-D'
      ],
      clinicalExam: [
        'Pomiar RR, masy ciała, wysokości dna macicy',
        'Ocena ruchów i tętna płodu'
      ],
      counseling: [
        'Szczepienie Tdap (krztusiec) w 27–36 Hbd (w każdej ciąży) oraz szczepienie przeciw RSV (Abrysvo) w 32–36 Hbd',
        'Rozpoczęcie edukacji przedporodowej (szkoła rodzenia) i przygotowania planu porodu'
      ],
      redFlag: 'Zahamowanie wzrastania płodu (EFW <10. centyla, zwłaszcza <3. centyla) → pilna ocena przepływów dopplerowskich (UA-PI, MCA-PI, CPR) wg PTGiP/ISUOG.'
    },
    {
      id: 'gbs-35-37',
      trimester: 3,
      period: '35 – 37 Hbd',
      title: 'Posiew GBS i badania przedporodowe',
      badge: 'GBS (35–37 Hbd)',
      mandatoryTests: [
        'Posiew z przedsionka pochwy i okolicy odbytu w kierunku paciorkowców grupy B (Streptococcus agalactiae — GBS)',
        'Antygen HBs (HBsAg) oraz test HIV (powtórzenie w III trymestrze wg standardu MZ)',
        'VDRL i HCV u kobiet ze zwiększonym ryzykiem zakażenia',
        'Morfologia krwi i badanie ogólne moczu'
      ],
      clinicalExam: [
        'Chwyty Leopolda — ocena położenia, ustawienia i części przodującej płodu',
        'Pomiar RR, masy ciała, badanie położnicze, ocena ruchów płodu',
        'Ponowna ocena ryzyka depresji (EPDS) wg standardu MZ'
      ],
      counseling: [
        'W razie dodatniego wyniku GBS (lub bakteriurii GBS w ciąży): omówienie konieczności śródporodowej antybiotykoterapii (penicylina G i.v. min. 4h przed porodem)',
        'Przy położeniu miednicowym w 36–37 Hbd: omówienie możliwości obrotu zewnętrznego (ECV) lub kwalifikacji do sposobu porodu'
      ],
      redFlag: 'Świąd dłoni i stóp w III trymestrze → oznacz kwasy żółciowe i próby wątrobowe (wyklucz cholestazę ciążową).'
    },
    {
      id: 'kontrola-38-39',
      trimester: 3,
      period: '38 – 39 Hbd',
      title: 'Kontrola w terminie porodu',
      badge: 'Gotowość porodowa',
      mandatoryTests: [
        'Morfologia krwi i badanie ogólne moczu',
        'W ciążach powikłanych (GDM, NT, FGR): zapis KTG oraz ocena biofizyczna / AFI wg zaleceń'
      ],
      clinicalExam: [
        'Pomiar RR (czujność w kierunku późnej preeklampsji!), ocena obrzęków i przyrostu masy ciała',
        'Chwyty Leopolda, ocena tętna płodu, badanie szyjki macicy (skala Bishopa przy wskazaniach)',
        'Ocena ruchów płodu przez ciężarną'
      ],
      counseling: [
        'Kiedy pilnie zgłosić się na Izbę Przyjęć: regularne skurcze co 5 min przez ≥1h, odpłynięcie płynu owodniowego (zwłaszcza zielonego), krwawienie z dróg rodnych, wyraźne osłabienie ruchów płodu, ból głowy/mroczki/RR ≥140/90',
        'Weryfikacja kompletności dokumentacji (oryginał grupy krwi, wynik GBS, Karta Przebiegu Ciąży, wyniki USG)'
      ]
    },
    {
      id: 'termin-40-plus',
      trimester: 3,
      period: '40+0 – 41+6 Hbd',
      title: 'Ciąża w terminie i nadzór po terminie porodu',
      badge: 'KTG + indukcja 41+0 Hbd',
      mandatoryTests: [
        'W 40+0 Hbd (termin porodu wg USG I trymestru): badanie KTG oraz USG z oceną objętości płynu owodniowego (AFI / MVP)',
        'Przy prawidłowych wynikach: powtarzanie KTG i oceny płynu owodniowego co 2–3 dni'
      ],
      clinicalExam: [
        'Ocena dojrzałości szyjki macicy w skali Bishopa (0–13 pkt)',
        'Pomiar RR i wykluczenie objawów nadciśnienia lub zmniejszenia aktywności ruchowej płodu'
      ],
      counseling: [
        'Zgodnie ze standardem MZ i PTGiP: hospitalizacja i kwalifikacja do preindukcji/indukcji porodu w 41+0 Hbd (cewnik Foleya / prostaglandyny przy Bishop ≤5 pkt; oksytocyna przy szyjce dojrzałej)',
        'Cel: zakończenie ciąży przed 42+0 Hbd w celu uniknięcia niewydolności łożyska i zespołu aspiracji smółki (MAS)'
      ],
      redFlag: 'Małowodzie (MVP <2 cm lub AFI <5 cm) lub nieprawidłowy zapis KTG → natychmiastowa hospitalizacja i indukcja/rozwiązanie ciąży bez czekania do 41+0 Hbd!'
    }
  ];

  /* 5 kluczowych szczepień w ciąży (PTGiP / PSO / ACOG) */
  const PREGNANCY_VACCINES = [
    {
      id: 'tdap',
      name: 'Krztusiec, błonica, tężec (Tdap)',
      window: '27 – 36 Hbd (w KAŻDEJ ciąży)',
      status: 'recommended',
      statusLabel: 'Zalecane w każdej ciąży (bezpłatne w Polsce)',
      mechanism: 'Przezłożyskowy transfer matczynych przeciwciał IgG chroni noworodka w pierwszych 2–3 miesiącach życia, zanim zdąży otrzymać własne szczepienia DTP.',
      note: 'Optymalnie podać między 27. a 32. tygodniem ciąży (w grupie ryzyka porodu przedwczesnego już od 20 Hbd).'
    },
    {
      id: 'grypa',
      name: 'Grypa sezonowa (inaktywowana, IIV)',
      window: 'Dowolny trymestr w sezonie jesienno-zimowym',
      status: 'recommended',
      statusLabel: 'Zalecane (bezpłatne dla ciężarnych)',
      mechanism: 'Ciężarne są w grupie najwyższego ryzyka ciężkiego zapalenia płuc i hospitalizacji na OIT z powodu grypy; szczepienie chroni też noworodka przez pierwsze 6 mies.',
      note: 'Stosować wyłącznie szczepionki inaktywowane (rozszczepiony wirion / podjednostkowe). Żywa donosowa LAIV jest przeciwwskazana w ciąży.'
    },
    {
      id: 'rsv',
      name: 'Wirus RS (RSV — szczepionka białkowa preF, Abrysvo)',
      window: '32 – 36 Hbd',
      status: 'recommended',
      statusLabel: 'Zalecane (PTGiP / ACOG)',
      mechanism: 'Bierna ochrona niemowlęcia przed ciężkim zapaleniem oskrzelików i hospitalizacją z powodu RSV w pierwszych 6 miesiącach życia.',
      note: 'Podawać w oknie 32+0 – 36+6 Hbd (pojedyncza dawka i.m.), optymalnie min. 14 dni przed porodem.'
    },
    {
      id: 'covid19',
      name: 'COVID-19 (szczepionka mRNA, zaktualizowana)',
      window: 'Dowolny trymestr ciąży',
      status: 'recommended',
      statusLabel: 'Zalecane',
      mechanism: 'Redukuje ryzyko ciężkiego przebiegu COVID-19 u ciężarnej, porodu przedwczesnego i stanu przedrzucawkowego.',
      note: 'Bezpieczna na każdym etapie ciąży oraz w okresie karmienia piersią; można podawać równocześnie ze szczepionką przeciw grypie lub Tdap.'
    },
    {
      id: 'zywe-przeciwwskazane',
      name: 'Szczepionki żywe atenuowane (MMR, ospa wietrzna VZV, BCG, LAIV)',
      window: 'ZAKAZ w ciąży (podać ≥1 mies. przed ciążą lub w połogu)',
      status: 'contraindicated',
      statusLabel: 'BEZWZGLĘDNIE PRZECIWWSKAZANE w ciąży',
      mechanism: 'Teoretyczne ryzyko transmisji atenuowanego patogenu do płodu (zwłaszcza różyczka wrodzona / zespół ospy wrodzonej).',
      note: 'U kobiet seronegatywnych wobec różyczki lub ospy wietrznej podaj MMR/VZV natychmiast po porodzie (karmienie piersią NIE jest przeciwwskazaniem!).'
    }
  ];

  /* ---------- BAZA KLUCZOWYCH LEKÓW POŁOŻNICZYCH (OB_DRUG_DATABASE) ---------- */
  const OB_DRUG_DATABASE = [
    {
      id: 'mgso4',
      name: 'Siarczan magnezu (MgSO4)',
      category: 'emergency_ob',
      categoryName: 'Stany nagłe / Neuroprotekcja',
      route: 'i.v. (pompa infuzyjna)',
      tradeNames: ['Inj. Magnesii sulfurici 20% (2 g / 10 ml)'],
      forms: [
        { id: 'amp_20', name: 'roztwór do wstrzykiwań 20% (200 mg/ml; amp. 10 ml = 2 g)' }
      ],
      indications: [
        {
          id: 'eclampsia_pe',
          name: 'Rzucawka i profilaktyka drgawek w ciężkiej preeklampsji',
          loading: '4–6 g i.v. w ciągu 15–20 minut (w 100 ml 0.9% NaCl)',
          maintenance: '1–2 g/h i.v. w ciągłym wlewie (pompa) przez min. 24 h od porodu lub ostatniego napadu drgawek',
          note: 'W razie nawrotu drgawek podczas wlewu: dodatkowy bolus 2 g i.v. w 5–10 min.'
        },
        {
          id: 'neuroprotection',
          name: 'Neuroprotekcja płodu w zagrażającym porodzie przedwczesnym (<32 Hbd)',
          loading: '4 g i.v. w ciągu 20–30 minut',
          maintenance: '1 g/h i.v. do porodu (maks. przez 24 godziny)',
          note: 'Zmniejsza ryzyko mózgowego porażenia dziecięcego u wcześniaków.'
        }
      ],
      monitoring: 'Co 1–2 h: częstość oddechów (≥12/min), obecność odruchów kolanowych, diureza godzinowa (≥30 ml/h), SpO2. Zakres terapeutyczny Mg: 4.8–8.4 mg/dl (2.0–3.5 mmol/l).',
      antidote: '10% glukonian wapnia 1 g (10 ml) powoli i.v. w ciągu 3–5 min.',
      contraindications: 'Miastenia (Myasthenia gravis), ciężki blok AV; ostrożnie i redukcja dawki w niewydolności nerek (anuria/oliguria).',
      hospitalOrder: 'MgSO4: bolus 4 g i.v. w 100 ml 0.9% NaCl w 20 min, następnie wlew ciągły 1 g/h i.v. w pompie przez 24 h. Monitoruj diurezę, RR, odruchy kolanowe i oddech co 1 h.',
      warning: 'NIGDY nie podawaj MgSO4 w szybkim bolusie bez rozcieńczenia (grozi zatrzymaniem krążenia)! Odruch kolanowy zanika jako pierwszy objaw zatrucia.',
      mods: ['2', '7']
    },
    {
      id: 'oxytocin',
      name: 'Oksytocyna (Oxytocinum)',
      category: 'uterotonic',
      categoryName: 'Uterotoniki i indukcja porodu',
      route: 'i.v. / i.m.',
      tradeNames: ['Oxytocin-Grindeks 5 IU/ml'],
      forms: [
        { id: 'amp_5iu', name: 'roztwór do wstrzykiwań 5 IU / 1 ml' }
      ],
      indications: [
        {
          id: 'pph_prophylaxis',
          name: 'Profilaktyka PPH (III okres porodu — AMTSL)',
          loading: '5 IU powoli i.v. (lub 10 IU i.m.) bezpośrednio po urodzeniu dziecka / przedniego barku',
          maintenance: 'W razie potrzeby wlew 10–20 IU w 500 ml krystaloidu',
          note: 'Lek 1. wyboru w zapobieganiu atonii macicy.'
        },
        {
          id: 'pph_treatment',
          name: 'Leczenie krwotoku poporodowego (atonia macicy)',
          loading: '5 IU powoli i.v. + wlew ciągły 20–40 IU w 500–1000 ml 0.9% NaCl (125–250 ml/h)',
          maintenance: 'Równocześnie masaż dna macicy i TXA 1 g i.v.',
          note: 'Unikać szybkiego niekontrolowanego bolusu i.v. (ryzyko ciężkiej hipotensji i tachykardii!).'
        },
        {
          id: 'labor_induction',
          name: 'Indukcja / stymulacja porodu (przy szyjce dojrzałej)',
          loading: '5 IU w 500 ml 0.9% NaCl (10 mIU/ml) — start 1–2 mIU/min (6–12 ml/h) w pompie',
          maintenance: 'Zwiększać co 20–30 min o 1–2 mIU/min do uzyskania 3–5 skurczów/10 min (maks. zwykle 20–30 mIU/min)',
          note: 'Wymaga ciągłego monitorowania KTG!'
        }
      ],
      monitoring: 'Ciągłe KTG podczas indukcji (wyklucz tachysystole >5 skurczów/10 min); RR i bilans płynów przy dużych dawkach (efekt antydiuretyczny / hiponatremia).',
      antidote: 'Przerwanie wlewu (t1/2 ~3–5 min); przy tachysystole tokoliza doraźna (np. atozyban).',
      contraindications: 'W indukcji: łożysko przodujące, położenie poprzeczne, niewspółmierność porodowa, przebyte klasyczne CC, patologiczne KTG.',
      hospitalOrder: 'PPH: Oksytocyna 5 IU powoli i.v., następnie 20 IU w 500 ml 0.9% NaCl we wlewie 125 ml/h + oburęczny masaż macicy.',
      warning: 'Szybki bolus oksytocyny i.v. (zwłaszcza w czasie CC w znieczuleniu podpajęczynówkowym) powoduje gwałtowny spadek ciśnienia i niedokrwienie mięśnia sercowego!',
      mods: ['1', '5']
    },
    {
      id: 'carbetocin',
      name: 'Karbetocyna (Carbetocinum)',
      category: 'uterotonic',
      categoryName: 'Uterotoniki i indukcja porodu',
      route: 'i.v. / i.m.',
      tradeNames: ['Pabal 100 µg/ml'],
      forms: [
        { id: 'amp_100ug', name: 'roztwór do wstrzykiwań 100 µg / 1 ml' }
      ],
      indications: [
        {
          id: 'pph_carbetocin',
          name: 'Profilaktyka atonii macicy po cięciu cesarskim lub porodzie wysokiego ryzyka PPH',
          loading: '100 µg (1 ml) jednorazowo powoli i.v. (w ciągu min. 1 minuty) lub i.m. po urodzeniu dziecka',
          maintenance: 'Pojedyncza dawka — nie powtarzać! (czas działania 1–2 h, t1/2 ~40 min)',
          note: 'Długodziałający syntetyczny analog oksytocyny; stabilny termicznie w formule RTS.'
        }
      ],
      monitoring: 'Napięcie dna macicy, utrata krwi, RR i HR po podaniu.',
      antidote: 'Brak swoistego antidotum — podawana jednorazowo.',
      contraindications: 'BEZWZGLĘDNY ZAKAZ podawania przed urodzeniem dziecka (indukcja/stymulacja porodu!), ciężkie choroby serca, niewydolność wątroby/nerek, ciężka preeklampsja/rzucawka.',
      hospitalOrder: 'Karbetocyna (Pabal) 100 µg (1 ml) powoli i.v. w ciągu 60 s jednorazowo natychmiast po wydobyciu noworodka.',
      warning: 'Karbetocynę wolno podać WYŁĄCZNIE po urodzeniu dziecka i tylko raz — nigdy do indukcji porodu!',
      mods: ['1', '5']
    },
    {
      id: 'txa',
      name: 'Kwas traneksamowy (TXA)',
      category: 'hemostatic',
      categoryName: 'Leki hemostatyczne (PPH)',
      route: 'i.v.',
      tradeNames: ['Exacyl 500 mg / 5 ml'],
      forms: [
        { id: 'amp_500mg', name: 'roztwór do wstrzykiwań 100 mg/ml (amp. 5 ml = 500 mg)' }
      ],
      indications: [
        {
          id: 'pph_txa',
          name: 'Krwotok poporodowy (PPH — niezależnie od przyczyny, badanie WOMAN)',
          loading: '1.0 g (2 amp. po 500 mg) powoli i.v. (1 ml/min, tj. w ciągu 10 min) JAK NAJSZYBCIEJ, do 3 godzin od porodu',
          maintenance: 'Druga dawka 1.0 g i.v., jeśli krwawienie utrzymuje się po 30 min lub nawraca w ciągu 24 h',
          note: 'Antyfibrynolityk redukujący śmiertelność z powodu wykrwawienia w PPH o ~30% przy podaniu <3 h.'
        }
      ],
      monitoring: 'Objętość utraty krwi, parametry krzepnięcia (fibrynogen, INR, APTT), ciśnienie tętnicze.',
      antidote: 'Brak swoistego antidotum.',
      contraindications: 'Czynna zakrzepica żylna lub tętnicza; nie podawać >3 h od porodu w rutynowym PPH (brak korzyści wg WOMAN).',
      hospitalOrder: 'Kwas traneksamowy (Exacyl) 1.0 g i.v. w 100 ml 0.9% NaCl w 10 min — natychmiast po rozpoznaniu PPH (<3 h od porodu).',
      warning: 'Podawaj TXA równolegle z uterotonikami, nie czekaj na niepowodzenie oksytocyny! Kluczowe okno czasowe to <3 godziny od porodu.',
      mods: ['1']
    },
    {
      id: 'labetalol',
      name: 'Labetalol i.v. / p.o.',
      category: 'antihypertensive',
      categoryName: 'Leki hipotensyjne w ciąży',
      route: 'i.v. (stan nagły) / p.o. (przewlekle)',
      tradeNames: ['Trandate 5 mg/ml (i.v.)', 'Labetalol tabl. 100/200 mg'],
      forms: [
        { id: 'amp_100mg', name: 'roztwór do wstrzykiwań 5 mg/ml (amp. 20 ml = 100 mg)' },
        { id: 'tab_100mg', name: 'tabletki 100 mg / 200 mg' }
      ],
      indications: [
        {
          id: 'severe_htn_iv',
          name: 'Ciężkie nadciśnienie w ciąży (RR ≥160/110 mmHg)',
          loading: '20 mg i.v. w 2 min → po 10–20 min jeśli RR nadal ≥160/110: 40 mg → 80 mg → 80 mg (maks. 220–300 mg)',
          maintenance: 'Lub wlew ciągły 1–2 mg/min; cel obniżenia RR: 140–150 / 90–100 mmHg (nie obniżać gwałtownie <130/80!)',
          note: 'Alfa- i beta-bloker; lek 1. wyboru w przełomie nadciśnieniowym u ciężarnej (PTGiP / ACOG).'
        },
        {
          id: 'chronic_htn_po',
          name: 'Przewlekłe / ciążowe nadciśnienie tętnicze (leczenie doustne)',
          loading: '100 mg p.o. 2×/d, stopniowe zwiększanie do 200–400 mg 2–3×/d',
          maintenance: 'Maks. 2400 mg/dobę',
          note: 'Bezpieczny w ciąży i w laktacji (obok metyldopy i nifedypiny XR).'
        }
      ],
      monitoring: 'RR co 5–15 min podczas podawania i.v., tętno matki, ciągłe KTG (ryzyko przejściowej hipoperfuzji łożyska przy zbyt gwałtownym spadku RR).',
      antidote: 'Atropina przy ciężkiej bradykardii; glukagon przy przedawkowaniu beta-blokerów.',
      contraindications: 'Astma oskrzelowa, bradykardia <60/min, blok AV II°/III°, niewyrównana niewydolność serca.',
      hospitalOrder: 'Labetalol 20 mg powoli i.v. (2 min) przy RR ≥160/110 mmHg; kontrola RR za 10–15 min (w razie braku efektu eskalacja 40 mg → 80 mg).',
      warning: 'U ciężarnej z ASTMĄ OSKRZELOWĄ labetalol jest przeciwwskazany — wybierz nifedypinę p.o. lub urapidyl/hydralazynę i.v.!',
      mods: ['2', '6']
    },
    {
      id: 'nifedipine',
      name: 'Nifedypina (antagonista kanału wapniowego)',
      category: 'antihypertensive',
      categoryName: 'Leki hipotensyjne w ciąży i tokoliza',
      route: 'p.o.',
      tradeNames: ['Cordafen', 'Adalat / Nifedypina XR 30–60 mg'],
      forms: [
        { id: 'tab_ir_10', name: 'tabletki o natychmiastowym uwalnianiu 10 mg (tylko p.o. — NIE podjęzykowo!)' },
        { id: 'tab_xr_30', name: 'tabletki o przedłużonym uwalnianiu (XR/OROS) 30 mg / 60 mg' }
      ],
      indications: [
        {
          id: 'severe_htn_po',
          name: 'Ciężkie nadciśnienie w ciąży (RR ≥160/110) — gdy brak dostępu i.v. lub astma',
          loading: '10 mg p.o. (połknąć, nie rozgryzać) → kontrola RR po 20 min → w razie potrzeby 20 mg p.o. (maks. 50 mg w 1. godz.)',
          maintenance: 'Przejście na formę o przedłużonym uwalnianiu 30–60 mg/d p.o.',
          note: 'Bardzo szybka i skuteczna opcja doustna 1. linii wg PTGiP/ACOG.'
        },
        {
          id: 'tocolysis',
          name: 'Tokoliza w zagrażającym porodzie przedwczesnym (24–34 Hbd)',
          loading: '20 mg p.o., następnie 10–20 mg co 6–8 h przez maks. 48 godzin',
          maintenance: 'Tylko na czas podania kursu betametazonu i transferu in utero',
          note: 'Stosowana obok atozybanu; off-label, ale szeroko rekomendowana w wytycznych międzynarodowych.'
        }
      ],
      monitoring: 'RR, HR matki, KTG; ostrożność przy jednoczesnym podawaniu MgSO4 (ryzyko nasilenia hipotensji i blokady nerwowo-mięśniowej).',
      antidote: 'Wlew krystaloidów i wapń i.v. przy ciężkiej hipotensji.',
      contraindications: 'Hipotensja, zwężenie zastawki aortalnej, podawanie PODJĘZYKOWE (grozi niekontrolowanym spadkiem RR i zamartwicą płodu!).',
      hospitalOrder: 'Nifedypina 10 mg p.o. (do połknięcia w całości) przy RR ≥160/110 mmHg; kontrola RR za 20 min i ciągłe KTG.',
      warning: 'BEZWZGLĘDNY ZAKAZ podawania nifedypiny podjęzykowo (rozgryzania kapsułki) — gwałtowny spadek RR matki powoduje nagłe niedotlenienie płodu!',
      mods: ['2', '6', '7']
    },
    {
      id: 'betamethasone',
      name: 'Betametazon prenatalny (GKS)',
      category: 'fetal_maturation',
      categoryName: 'Profilaktyka RDS i konfliktu',
      route: 'i.m.',
      tradeNames: ['Celestone 4 mg/ml', 'Diprophos (NIE stosować w zamian bez weryfikacji składu — w ciąży rozpuszczalny fosforan/octan 12 mg)'],
      forms: [
        { id: 'amp_bet', name: 'zawiesina/roztwór do wstrzykiwań i.m. — dawka 12 mg' }
      ],
      indications: [
        {
          id: 'rds_prophylaxis',
          name: 'Profilaktyka zespołu zaburzeń oddychania (RDS), IVH i NEC płodu',
          loading: '12 mg i.m. w 2 dawkach co 24 godziny (łącznie 24 mg)',
          maintenance: 'Okno: 24+0 – 33+6 Hbd (indywidualnie od 23 Hbd oraz w wybranych przypadkach 34+0 – 36+6 Hbd wg PTGiP)',
          note: 'Alternatywa: Deksametazon 6 mg i.m. co 12 h (4 dawki = 24 mg). Pełny efekt po 24–48 h od 1. dawki.'
        }
      ],
      monitoring: 'Glikemia matki (przejściowa hiperglikemia przez 3–5 dni, zwłaszcza w GDM — nie wykonywać OGTT w trakcie/tuż po sterydach!), przejściowe obniżenie zmienności KTG po 24–48 h.',
      antidote: 'Nie dotyczy.',
      contraindications: 'Czynna ciężka sepsa matki bez osłony; brak korzyści z wielokrotnego rutynowego powtarzania kursów (maks. 1 kurs ratunkowy przy nawrocie zagrożenia >14 dni i <34 Hbd).',
      hospitalOrder: 'Betametazon 12 mg głęboko i.m. teraz oraz powtórzyć 12 mg i.m. dokładnie za 24 godziny (kurs sterydoterapii prenatalnej).',
      warning: 'Betametazon przejściowo obniża zmienność krótkoterminową w KTG oraz podnosi leukocytozę i glikemię matki przez 48–72 h — nie mylić z infekcją ani pogorszeniem stanu płodu!',
      mods: ['7', '2']
    },
    {
      id: 'anti_d',
      name: 'Immunoglobulina anty-RhD (anty-D)',
      category: 'fetal_maturation',
      categoryName: 'Profilaktyka RDS i konfliktu',
      route: 'i.m. / i.v.',
      tradeNames: ['Rhophylac 300 µg (1500 IU)', 'Immunorho 300 µg'],
      forms: [
        { id: 'prefilled_300', name: 'ampułkostrzykawka 300 µg (1500 IU) i.m. lub i.v.' },
        { id: 'vial_150', name: 'fiolka 150 µg (750 IU) — do profilaktyki wczesnociążowej <12 Hbd wg niektórych protokołów' }
      ],
      indications: [
        {
          id: 'antid_28',
          name: 'Rutynowa profilaktyka śródciążowa u ciężarnych RhD(-) bez p/ciał',
          loading: '300 µg (1500 IU) i.m. jednorazowo w 28–30 Hbd',
          maintenance: 'Wcześniej obowiązkowo ujemny pośredni test antyglobulinowy (brak p/ciał anty-D)',
          note: 'Standard MZ w Polsce (refinansowane).'
        },
        {
          id: 'antid_postpartum',
          name: 'Profilaktyka poporodowa (dziecko RhD(+)) oraz po zdarzeniach uczulających',
          loading: '150–300 µg i.m. w ciągu maksymalnie 72 godzin od porodu, poronienia, ciąży ektopowej, amniopunkcji, krwawienia z łożyska lub urazu brzucha',
          maintenance: 'Przy podejrzeniu dużego przecieku matczyno-płodowego (>30 ml pełnej krwi): test Kleihauera-Betkego i dobranie dodatkowej dawki (300 µg neutralizuje 30 ml krwi płodowej)',
          note: 'Podanie do 72 h jest optymalne (w razie przeoczenia nadal korzystne do 28 dni).'
        }
      ],
      monitoring: 'Obserwacja 20–30 min pod kątem reakcji alergicznej; wpis serii i dawki do dokumentacji ciąży.',
      antidote: 'Nie dotyczy.',
      contraindications: 'Kobiety RhD(+) oraz kobiety RhD(-) z JUŻ OBECNYMI przeciwciałami odpornościowymi anty-D (immunizacja już zaszła!).',
      hospitalOrder: 'Immunoglobulina anty-D (Rhophylac) 300 µg i.m. w mięsień naramienny/pośladkowy w ciągu 72 h po potwierdzeniu braku p/ciał anty-D u matki i RhD(+) u noworodka.',
      warning: 'Pamiętaj o anty-D również po ciąży ektopowej, poronieniu i zabiegach inwazyjnych (amniopunkcja/CVS) u każdej pacjentki RhD(-)!',
      mods: ['7', '3', '4']
    }
  ];

  /* 3 kliniczne wyzwania ordynacji leków położniczych */
  const PRESCRIPTION_CHALLENGES = [
    {
      id: 'chal_eclampsia',
      title: 'Wyzwanie 1: 31-letnia ciężarna w 34+2 Hbd z ciężką preeklampsją (RR 172/114 mmHg)',
      vignette: 'Ciężarna w 34+2 Hbd przyjęta na Izbę Przyjęć z silnym bólem głowy, mroczkami przed oczami i bólem w nadbrzuszu. RR 172/114 mmHg (powtórzone po 15 min: 170/112 mmHg), białkomocz +++, PLT 92 tys./µl. Brak astmy w wywiadzie. Masa ciała 78 kg.',
      drugId: 'mgso4',
      steps: [
        {
          step: 1,
          title: 'Krok 1: Profilaktyka drgawek rzucawkowych',
          q: 'Który lek i w jakiej dawce wysycającej należy włączyć jako bezwzględny priorytet w profilaktyce rzucawki?',
          opts: [
            'Siarczan magnezu (MgSO4) 4–6 g i.v. w powolnym wlewie (15–20 min), następnie wlew ciągły 1–2 g/h i.v.',
            'Diazepam 10 mg i.v. w bolusie powtarzanym co 4 godziny',
            'Fenytoina 15 mg/kg i.v. w pojedynczym wlewie',
            'Sam doustny magnez w tabletkach 3×500 mg'
          ],
          correct: 0,
          explanation: 'MgSO4 jest bezwzględnym lekiem 1. wyboru w profilaktyce i leczeniu rzucawki (badanie Magpie). Diazepam i fenytoina są mniej skuteczne i wywołują depresję oddechową noworodka.'
        },
        {
          step: 2,
          title: 'Krok 2: Pilne obniżenie ciśnienia tętniczego (RR ≥160/110)',
          q: 'Jaki lek hipotensyjny i jaki cel ciśnienia tętniczego wybierasz u tej pacjentki (brak astmy, dostęp i.v. obecny)?',
          opts: [
            'Labetalol 20 mg i.v. w 2 min (eskalacja 40 → 80 mg co 10–20 min); cel RR 140–150 / 90–100 mmHg',
            'Enalapryl 10 mg i.v.; cel natychmiastowego obniżenia RR do 100/60 mmHg',
            'Nifedypina 20 mg podjęzykowo po rozgryzieniu kapsułki',
            'Metyldopa 250 mg p.o. z kontrolą ciśnienia jutro rano'
          ],
          correct: 0,
          explanation: 'Labetalol i.v. (lub nifedypina p.o. do połknięcia) to lek 1. linii w ciężkim NT w ciąży. ACE-I są teratogenne/fetotoksyczne, podjęzykowa nifedypina grozi zapaścią i niedotlenieniem płodu, a metyldopa działa zbyt wolno.'
        },
        {
          step: 3,
          title: 'Krok 3: Bezpieczeństwo wlewu MgSO4',
          q: 'Po 4 godzinach wlewu MgSO4 położna zgłasza zanik odruchów kolanowych, diurezę 15 ml/h i 10 oddechów/min. Co robisz NATYCHMIAST?',
          opts: [
            'Natychmiast zatrzymuję wlew MgSO4, podaję 10% glukonian wapnia 1 g (10 ml) powoli i.v., tlen i oznaczam Mg w surowicy',
            'Zwiększam wlew MgSO4 do 2 g/h, ponieważ objawy oznaczają zagrażającą rzucawkę',
            'Podaję furosemid 80 mg i.v. i kontynuuję wlew MgSO4',
            'Zlecam pilne TK głowy bez przerywania wlewu'
          ],
          correct: 0,
          explanation: 'Zanik odruchów głębokich, skąpomocz (<30 ml/h) i depresja oddechowa (<12/min) to klasyczne objawy zatrucia magnezem. Natychmiast przerwij wlew i podaj antidotum: 10% glukonian wapnia 1 g (10 ml) powoli i.v.'
        }
      ],
      pearl: 'W ciężkiej preeklampsji ≥34+0 Hbd po stabilizacji matki (MgSO4 + kontrola RR) należy zaplanować rozwiązanie ciąży — nie przedłużać ciąży na siłę!'
    },
    {
      id: 'chal_pph',
      title: 'Wyzwanie 2: Krwotok poporodowy (PPH) 20 minut po porodzie siłami natury',
      vignette: 'Wieloródka (G4P4), 20 min po porodzie noworodka 4350 g. Łożysko urodziło się w całości. Nagłe obfite krwawienie z dróg rodnych — szacowana utrata krwi 950 ml i nadal krwawi. Dno macicy wysoko powyżej pępka, miękkie, ciastowate. RR 94/58 mmHg, HR 118/min.',
      drugId: 'oxytocin',
      steps: [
        {
          step: 1,
          title: 'Krok 1: Rozpoznanie przyczyny (4T) i pierwsza interwencja',
          q: 'Która z przyczyn 4T jest najbardziej prawdopodobna i jakie leki podajesz w PIERWSZEJ kolejności obok masażu macicy i krystaloidów?',
          opts: [
            'Tone (atonia macicy) → Oksytocyna i.v. (5 IU powoli + wlew 20–40 IU) ORAZ Kwas traneksamowy (TXA) 1 g i.v. natychmiast',
            'Thrombin (hemofilia) → sam koncentrat płytek krwi bez uterotoników',
            'Tissue (resztki) → wyłącznie obserwacja przez 2 godziny',
            'Trauma → natychmiastowa histerektomia bez podawania leków'
          ],
          correct: 0,
          explanation: 'Miękka, wysoko stojąca macica po porodzie dużego dziecka u wieloródki to podręcznikowa atonia (Tone — ~70% PPH). Pierwsza linia to masaż dna macicy, oksytocyna i.v. i wczesne podanie TXA 1 g i.v. (<3 h od porodu).'
        },
        {
          step: 2,
          title: 'Krok 2: Okno czasowe i dawkowanie TXA (badanie WOMAN)',
          q: 'Po 35 minutach mimo oksytocyny, masażu i pierwszej dawki TXA 1 g i.v. krwawienie nadal się utrzymuje. Jaka jest zasada dotycząca drugiej dawki TXA?',
          opts: [
            'Można podać drugą dawkę TXA 1 g i.v. po 30 minutach od pierwszej dawki (oraz dołączyć uterotonik 2. linii, np. karboprost/mizoprostol/metyloergometrynę i tamponadę balonową)',
            'TXA podaje się wyłącznie w jednej dawce w życiu i nigdy nie powtarza',
            'Należy podać 5 g TXA w szybkim bolusie w 30 sekund',
            'TXA jest przeciwwskazany w atonii macicy'
          ],
          correct: 0,
          explanation: 'Zgodnie z protokołem badania WOMAN i wytycznymi WHO/PTGiP: pierwsza dawka 1 g i.v. jak najszybciej (<3 h), druga dawka 1 g i.v. przy utrzymującym się krwawieniu po 30 min lub nawrocie w ciągu 24 h.'
        }
      ],
      pearl: 'Zasada 4T w PPH: Tone (atonia ~70%), Trauma (urazy kanału ~20%), Tissue (resztki łożyska ~10%), Thrombin (koagulopatie ~1%). Nie zapomnij o ocenie szyjki i pochwy we wziernikach!'
    },
    {
      id: 'chal_preterm',
      title: 'Wyzwanie 3: Zagrażający poród przedwczesny w 30+3 Hbd u ciężarnej RhD(-)',
      vignette: '27-letnia pierwiastka w 30+3 Hbd z regularną czynnością skurczową (co 4 min) i skróconą szyjką (CL 14 mm, rozwarcie 2 cm), błony płodowe zachowane, KTG prawidłowe, brak cech zakażenia. Grupa krwi matki: 0 RhD(-), dotychczas nie otrzymała profilaktyki anty-D (pośredni Coombs ujemny).',
      drugId: 'betamethasone',
      steps: [
        {
          step: 1,
          title: 'Krok 1: Dojrzewanie płuc płodu (profilaktyka RDS)',
          q: 'Który schemat glikokortykosteroidów prenatalnych jest zalecany w 30+3 Hbd?',
          opts: [
            'Betametazon 12 mg i.m. w 2 dawkach co 24 h (lub Deksametazon 6 mg i.m. w 4 dawkach co 12 h)',
            'Hydrokortyzon 100 mg i.v. jednorazowo',
            'Prednizon 20 mg p.o. przez 7 dni',
            'Sterydoterapia jest wskazana dopiero po 35 Hbd'
          ],
          correct: 0,
          explanation: 'Betametazon (2×12 mg i.m. co 24 h) i deksametazon (4×6 mg i.m. co 12 h) przenikają przez łożysko i stymulują produkcję surfaktantu (zmniejszają RDS, IVH, NEC i zgon noworodka). Prednizon jest unieczynniany przez łożyskową 11β-HSD2!'
        },
        {
          step: 2,
          title: 'Krok 2: Tokoliza i neuroprotekcja płodu',
          q: 'Jaki jest główny cel krótkotrwałej tokolizy (maks. 48 h, np. atozyban/nifedypina) i jaki dodatkowy lek podasz, jeśli poród będzie nieunikniony przed 32 Hbd?',
          opts: [
            'Cel tokolizy: zyskanie 48 h na pełny kurs sterydów i transport in utero do ośrodka III°; przy nieuniknionym porodzie <32 Hbd → MgSO4 i.v. w celu neuroprotekcji OUN płodu',
            'Cel tokolizy: utrzymanie ciąży aż do 40 Hbd przez 10-tygodniowy wlew; neuroprotekcja fenobarbitalem',
            'Tokoliza jest przeciwwskazana przy zachowanych błonach płodowych',
            'Zamiast tokolizy należy podać oksytocynę'
          ],
          correct: 0,
          explanation: 'Tokoliza nie przedłuża ciąży do terminu — jej udowodnionym celem jest zyskanie 48 godzin na działanie sterydów oraz transport matki (in utero) do ośrodka III stopnia referencyjności. Przed porodem <32 Hbd podajemy MgSO4 dla neuroprotekcji.'
        },
        {
          step: 3,
          title: 'Krok 3: Profilaktyka konfliktu RhD',
          q: 'Pacjentka jest w 30+3 Hbd, ma grupę 0 RhD(-) i ujemne przeciwciała anty-D. Jakie postępowanie w zakresie profilaktyki konfliktu?',
          opts: [
            'Podać 300 µg immunoglobuliny anty-D i.m. (okno 28–30 Hbd), a jeśli urodzi dziecko RhD(+) — kolejną dawkę do 72 h po porodzie',
            'Nie podawać anty-D przed porodem, ponieważ to pierwsza ciąża',
            'Podać anty-D dopiero w kolejnej ciąży',
            'Podanie betametazonu zastępuje immunoglobulinę anty-D'
          ],
          correct: 0,
          explanation: 'Wszystkie ciężarne RhD(-) bez przeciwciał anty-D (niezależnie od rodności) powinny otrzymać 300 µg anty-D w 28–30 Hbd oraz dawkę poporodową w ciągu 72 h po urodzeniu noworodka RhD(+).'
        }
      ],
      pearl: 'Prednizon i prednizolon NIE służą do stymulacji dojrzewania płuc płodu (są metabolizowane przez łożysko) — wyłącznie fluorowane GKS: betametazon lub deksametazon!'
    }
  ];

  /* ---------- ATLAS I TRENER KTG (FIGO 2015 — 4 PRZYPADKI) ---------- */
  const CTG_CASES = [
    {
      id: 'ctg-norma',
      modality: 'ctg',
      figoCategory: 'normal',
      figoLabel: 'Zapis prawidłowy (Norma — FIGO 2015)',
      title: 'Prawidłowy zapis KTG (Norma FIGO 2015)',
      short: 'FHR 140/min, zmienność 12/min, akceleracje (+), brak deceleracji',
      mods: ['5', '4'],
      atlas: 'fizjologia',
      sec: 'ktg',
      params: {
        baseline: '140 ud./min (norma 110–160)',
        variability: '10–15 ud./min (norma 5–25)',
        accelerations: 'Obecne (≥2 w 20 min, wzrost ≥15 ud./min przez ≥15 s)',
        decelerations: 'Brak powtarzających się deceleracji',
        contractions: '3 skurcze / 10 min (prawidłowa czynność skurczowa)'
      },
      vignette: '28-letnia pierwiastka w 39+4 Hbd w aktywnej I fazie porodu (rozwarcie 5 cm), płyn owodniowy czysty. Zapis KTG z ostatnich 30 minut: linia podstawowa 140/min, prawidłowa zmienność 10–15/min, wyraźne akceleracje przy ruchach płodu, brak deceleracji.',
      svgType: 'ctg-normal',
      hotspot: {
        id: 'hotspot-ctg-acc',
        name: 'Akceleracja FHR i prawidłowa oscylacja falująca (5–25 ud./min)',
        targetX: 165,
        targetY: 75,
        radius: 42,
        hint: 'Wzrost FHR o ≥15 ud./min trwający ≥15 sekund przy prawidłowej zmienności 5–25 ud./min silnie potwierdza dobrostan i brak kwasicy u płodu.'
      },
      clinicalQuestion: {
        q: 'Jak klasyfikujesz ten zapis wg kryteriów FIGO 2015 i jakie jest właściwe postępowanie?',
        opts: [
          'Zapis prawidłowy (Norma) — wysokie prawdopodobieństwo braku niedotlenienia; brak konieczności interwencji, kontynuacja prowadzenia porodu.',
          'Zapis podejrzany — natychmiastowa tokoliza i tlenoterapia przez maskę.',
          'Zapis patologiczny — pilne cięcie cesarskie w ciągu 15 minut.',
          'Zapis sinusoidalny — podejrzenie ciężkiej niedokrwistości płodu.'
        ],
        correct: 0,
        explanation: 'Wszystkie 3 główne kryteria FIGO 2015 są spełnione: linia podstawowa 110–160 ud./min, zmienność 5–25 ud./min oraz brak powtarzających się deceleracji. Taki zapis nie wymaga żadnej interwencji ratunkowej.',
        pearl: 'W kryteriach FIGO 2015 obecność akceleracji potwierdza dobrostan, ale sam ich BRAK w trakcie aktywnego porodu (przy prawidłowej linii, zmienności i bez deceleracji) NIE czyni zapisu nieprawidłowym!'
      }
    },
    {
      id: 'ctg-podejrzany',
      modality: 'ctg',
      figoCategory: 'suspicious',
      figoLabel: 'Zapis podejrzany (Suspicious — FIGO 2015)',
      title: 'Zapis podejrzany — nawracające deceleracje zmienne',
      short: 'FHR 150/min, zmienność 10/min, ostre V-kształtne deceleracje zmienne',
      mods: ['5', '7'],
      atlas: 'fizjologia',
      sec: 'ktg',
      params: {
        baseline: '150 ud./min (norma 110–160)',
        variability: '8–12 ud./min (prawidłowa)',
        accelerations: 'Rzadkie',
        decelerations: 'Nawracające deceleracje zmienne (V-kształtne, gwałtowny spadek <30 s, zmienna relacja do skurczu)',
        contractions: '4 skurcze / 10 min'
      },
      vignette: '30-letnia rodząca w 40+1 Hbd, rozwarcie 6 cm, 20 minut po samoistnym odpłynięciu czystego płynu owodniowego. W zapisie KTG pojawiły się nagłe, ostre, V-kształtne spadki FHR o zmiennym czasie występowania względem szczytu skurczu (deceleracje zmienne), ale między skurczami linia podstawowa (150/min) i zmienność (10/min) pozostają prawidłowe.',
      svgType: 'ctg-variable',
      hotspot: {
        id: 'hotspot-ctg-var',
        name: 'Deceleracja zmienna (nagły spadek <30 s, kształt litery V — ucisk pępowiny)',
        targetX: 195,
        targetY: 120,
        radius: 42,
        hint: 'Gwałtowny spadek FHR (od początku do nadiru <30 s) i szybki powrót do linii podstawowej o zmiennym przesunięciu wobec skurczu świadczy o przemijającym ucisku pępowiny.'
      },
      clinicalQuestion: {
        q: 'Jaki jest mechanizm deceleracji zmiennych i jakie powinno być PIERWSZE działanie przy zapisie podejrzanym wg FIGO 2015?',
        opts: [
          'Ucisk pępowiny (odruch z baroreceptorów); zmiana pozycji rodzącej na lewy/prawy bok, badanie wew. (wyklucz wypadnięcie pępowiny!), ewent. zatrzymanie oksytocyny i wzmożony nadzór.',
          'Ucisk główki płodu; natychmiastowe podanie adrenaliny matce.',
          'Niewydolność łożyska; natychmiastowe kleszcze przy rozwarciu 6 cm.',
          'Artefakt ruchowy; wyłączenie monitora KTG na 2 godziny.'
        ],
        correct: 0,
        explanation: 'Deceleracje zmienne wynikają z przejściowego ucisku naczyń pępowinowych (zwłaszcza po odpłynięciu płynu owodniowego). W zapisie podejrzanym (brak 1 cechy normy, bez cech patologii) wdrażamy działania korygujące odwracalne przyczyny: zmiana pozycji, wykluczenie wypadnięcia pępowiny, redukcja oksytocyny przy tachysystole i ciągłe monitorowanie.',
        pearl: 'Po pęknięciu pęcherza płodowego i pojawieniu się nagłych deceleracji ZAWSZE wykonaj badanie wewnętrzne, aby natychmiast wykluczyć wypadnięcie pępowiny!'
      }
    },
    {
      id: 'ctg-patologiczny',
      modality: 'ctg',
      figoCategory: 'pathological',
      figoLabel: 'Zapis patologiczny (Pathological — FIGO 2015)',
      title: 'Zapis patologiczny — deceleracje późne i obniżona zmienność',
      short: 'FHR 165/min, zmienność <5/min (>50 min), powtarzające się deceleracje późne',
      mods: ['5', '2', '1'],
      atlas: 'fizjologia',
      sec: 'ktg',
      params: {
        baseline: '165 ud./min (tachykardia >160)',
        variability: '<5 ud./min przez >50 min (obniżona zmienność / oscylacja zawężona)',
        accelerations: 'Brak',
        decelerations: 'Powtarzające się deceleracje późne (U-kształtne, nadir po szczycie skurczu >30 min)',
        contractions: '4 skurcze / 10 min (stymulacja oksytocyną)'
      },
      vignette: '34-letnia ciężarna w 37+2 Hbd z ciężkim stanem przedrzucawkowym i FGR w trakcie indukcji porodu oksytocyną (rozwarcie 4 cm). Od ponad 50 minut utrzymuje się tachykardia 165/min, spłaszczona zmienność <5 ud./min oraz łagodne, U-kształtne spadki FHR rozpoczynające się po początku skurczu i osiągające najniższy punkt wyraźnie PO szczycie skurczu (deceleracje późne).',
      svgType: 'ctg-late',
      hotspot: {
        id: 'hotspot-ctg-late',
        name: 'Deceleracja późna (nadir po szczycie skurczu) + spłaszczona zmienność (<5/min)',
        targetX: 225,
        targetY: 112,
        radius: 44,
        hint: 'Powolny, U-kształtny spadek FHR przesunięty w prawo względem szczytu skurczu macicy to sygnał niewydolności maciczno-łożyskowej i odpowiedzi chemoreceptorów na hipoksemię płodu.'
      },
      clinicalQuestion: {
        q: 'Co oznacza połączenie obniżonej zmienności (<5/min >50 min) z powtarzającymi się deceleracjami późnymi i jakie jest postępowanie wg FIGO 2015?',
        opts: [
          'Zapis patologiczny z wysokim prawdopodobieństwem hipoksji/kwasicy płodu → natychmiast wyłącz oksytocynę, ułóż na lewym boku, wyrównaj RR/płyny i pilnie rozwiąż ciążę (CC), jeśli zapis nie ulega szybkiej poprawie.',
          'Zapis prawidłowy (fizjologiczny sen płodu) — kontynuuj zwiększanie dawki oksytocyny.',
          'Ucisk główki płodu w II okresie — zachęć pacjentkę do parcia przy rozwarciu 4 cm.',
          'Prawidłowa reakcja na siarczan magnezu — powtórz KTG za 6 godzin.'
        ],
        correct: 0,
        explanation: 'Według FIGO 2015 obniżona zmienność >50 min ORAZ powtarzające się deceleracje późne (>30 min) to kryteria zapisu patologicznego z wysokim ryzykiem kwasicy płodu. Należy natychmiast przerwać wlew oksytocyny, podjąć resuscytację wewnątrzmaciczną i pilnie rozwiązać ciążę (przy rozwarciu 4 cm: cięcie cesarskie).',
        pearl: 'Mnemotechnika VEAL CHOP: Variable = Cord compression (pępowina), Early = Head compression (główka), Accelerations = Okay, Late = Placental insufficiency (łożysko)!'
      }
    },
    {
      id: 'ctg-sinusoidalny',
      modality: 'ctg',
      figoCategory: 'pathological',
      figoLabel: 'Zapis patologiczny — Sinusoidalny (STAN NAGŁY)',
      title: 'Zapis sinusoidalny (ciężka niedokrwistość / hipoksja płodu)',
      short: 'Gładka fala sinusoidalna 3–5 cykli/min przez >30 min, brak zmienności',
      mods: ['5', '7', '1'],
      atlas: 'fizjologia',
      sec: 'ktg',
      params: {
        baseline: '135 ud./min (regularna oscylacja wokół linii)',
        variability: 'Brak zmienności krótkoterminowej (gładka fala o amplitudzie 10 ud./min, 4 cykle/min)',
        accelerations: 'Brak',
        decelerations: 'Wzór sinusoidalny utrzymujący się >30 minut',
        contractions: 'Pojedyncze nieregularne skurcze'
      },
      vignette: '32-letnia wieloródka (G3P2) z grupą krwi A RhD(-) i stwierdzoną alloimmunizacją anty-D zgłasza się w 35+1 Hbd z powodu wyraźnego osłabienia ruchów płodu od rana. W KTG przez ponad 35 minut rejestruje się uderzająco regularny, gładki, falujący zapis przypominający sinusoidę (3–5 cykli/min, amplituda ~10 ud./min) bez zmienności krótkoterminowej i bez akceleracji.',
      svgType: 'ctg-sinusoidal',
      hotspot: {
        id: 'hotspot-ctg-sin',
        name: 'Gładka fala sinusoidalna (3–5 cykli/min, czas >30 min, brak mikrooscylacji)',
        targetX: 180,
        targetY: 95,
        radius: 48,
        hint: 'Prawdziwy wzór sinusoidalny trwa >30 min, ma regularną częstość 3–5 cykli/min, amplitudę 5–15 ud./min i jest całkowicie pozbawiony drobnej zmienności krótkoterminowej.'
      },
      clinicalQuestion: {
        q: 'Z jakim stanem klinicznym wiąże się prawdziwy zapis sinusoidalny i jak należy postąpić?',
        opts: [
          'Ciężka niedokrwistość płodu (np. konflikt RhD, krwotok matczyno-płodowy, vasa previa) lub ciężka kwasica → kategoria patologiczna, natychmiastowe rozwiązanie ciąży (CC w trybie nagłym) i gotowość neonatologiczna do transfuzji.',
          'Fizjologiczny rytm ssania kciuka u płodu — nie wymaga interwencji.',
          'Łagodne odwodnienie matki — podaj 500 ml płynu i wypisz do domu.',
          'Objaw prawidłowego działania nifedypiny.'
        ],
        correct: 0,
        explanation: 'Prawdziwy zapis sinusoidalny (>30 min wg FIGO 2015) stanowi stan bezpośredniego zagrożenia życia płodu związany najczęściej z głęboką niedokrwistością płodu (alloimmunizacja, krwotok matczyno-płodowy, vasa previa) lub ciężką hipoksją. Wymaga natychmiastowego rozwiązania ciąży.',
        pearl: 'Różnicuj z zapisem pseudosinusoidalnym (np. po podaniu opioidów matce lub przy ssaniu kciuka przez płód), który trwa krótko (<30 min), ma ostrzejsze wierzchołki i przeplata się z normalną zmiennością!'
      }
    }
  ];

  /* ---------- TRENER USG GINEKOLOGICZNO-POŁOŻNICZEGO (4 PRZYPADKI) ---------- */
  const USG_TRAINER_CASES = [
    {
      id: 'ektopowa',
      modality: 'usg',
      title: 'Ciąża ektopowa jajowodowa (USG TV)',
      short: 'Pusta jama macicy, objaw obrączki (tubal ring) i płyn w zatoce Douglasa',
      mods: ['3', '7'],
      atlas: 'nagle-ob',
      sec: 'ektopowa',
      vignette: '29-letnia kobieta, 6+5 Hbd wg OM, zgłasza się z bólem prawego podbrzusza i brunatnym plamieniem. Stężenie β-hCG wynosi 3200 mIU/ml. W USG przezpochwowym: pogrubiałe endometrium bez pęcherzyka ciążowego w jamie macicy (pseudopęcherzyk nieobecny), obok prawego jajnika widoczna hiperechogenna struktura pierścieniowata 24 mm oraz wolny płyn z echami w zatoce Douglasa.',
      svgType: 'usg-ectopic',
      usgKeyFindings: [
        'Brak pęcherzyka ciążowego w jamie macicy mimo β-hCG >2000–3500 mIU/ml (powyżej strefy dyskryminacyjnej)',
        'Objaw obrączki jajowodowej (tubal ring / bagel sign) oddzielny od jajnika',
        'Wolny płyn z drobnymi echami (krew / haemoperitoneum) w zatoce Douglasa'
      ],
      hotspot: {
        id: 'hotspot-usg-ectopic',
        name: 'Objaw obrączki jajowodowej (tubal ring) w prawych przydatkach',
        targetX: 215,
        targetY: 110,
        radius: 38,
        hint: 'Hiperechogenny pierścień trofoblastu w jajowodzie położony odrębnie od jajnika (objaw przesuwania — sliding sign przy nacisku głowicą).'
      },
      clinicalQuestion: {
        q: 'Który zestaw warunków pozwala na leczenie zachowawcze METOTREKSATEM (MTX) zamiast laparoskopii u pacjentki z ciążą ektopową?',
        opts: [
          'Pacjentka stabilna hemodynamicznie, brak cech pęknięcia/krwawienia do otrzewnej, zmiana <3.5–4 cm, brak czynności serca zarodka (FHR-), niskie β-hCG (<5000 mIU/ml) i możliwość ścisłej kontroli.',
          'Wstrząs krwotoczny z wolną krwią pod wątrobą i β-hCG 18 000 mIU/ml.',
          'Żywy zarodek z obecną czynnością serca FHR(+) i średnicą pęcherzyka 5 cm.',
          'Każda ciąża pozamaciczna niezależnie od stanu ogólnego i karmienia piersią.'
        ],
        correct: 0,
        explanation: 'Metotreksat (antagonista kwasu foliowego, 50 mg/m² i.m.) jest bezpieczny wyłącznie u pacjentek stabilnych, bez cech pęknięcia i bez aktywnego krwawienia do jamy brzusznej (oraz bez karmienia piersią, choroby nerek/wątroby). W opisanym przypadku obecność echogennego płynu (krwi) i bólu przemawia za pilną laparoskopią!',
        pearl: 'Po podaniu metotreksatu oznaczamy β-hCG w 4. i 7. dniu: wymagany jest spadek o ≥15% między dniem 4. a 7. (między dniem 1. a 4. β-hCG może jeszcze przejściowo wzrosnąć!).'
      }
    },
    {
      id: 'lozysko-przodujace',
      modality: 'usg',
      title: 'Łożysko przodujące całkowite (Placenta praevia)',
      short: 'Tkanka łożyskowa całkowicie pokrywająca ujście wewnętrzne szyjki macicy',
      mods: ['1', '4'],
      atlas: 'nagle-ob',
      sec: 'lozysko',
      vignette: '33-letnia wieloródka (po 2 cięciach cesarskich) w 33+2 Hbd zgłasza się z powodu nagłego, całkowicie bezbolesnego krwawienia jasnoczerwoną krwią z dróg rodnych. Macica miękka, tętno płodu 144/min. W delikatnym USG uwidoczniono dolny brzeg łożyska pokrywający w całości ujście wewnętrzne kanału szyjki macicy.',
      svgType: 'usg-previa',
      usgKeyFindings: [
        'Tkanka łożyskowa bezpośrednio przekraczająca i całkowicie pokrywająca ujście wewnętrzne szyjki macicy',
        'Ocena strefy pozałożyskowej i zatok naczyniowych pod kątem spektrum łożyska przyrośniętego (PAS — pacjentka po 2 CC!)',
        'Brak krwiaka pozałożyskowego w dnie macicy'
      ],
      hotspot: {
        id: 'hotspot-usg-previa',
        name: 'Tkanka łożyskowa pokrywająca ujście wewnętrzne szyjki macicy',
        targetX: 155,
        targetY: 145,
        radius: 42,
        hint: 'Zwróć uwagę na bezpośrednią relację dolnego brzegu łożyska do kanału szyjki macicy (ujście wewnętrzne jest całkowicie przykryte).'
      },
      clinicalQuestion: {
        q: 'Jakie jest najważniejsze skojarzone powikłanie, które MUSISZ wykluczyć u tej pacjentki (łożysko przodujące na przedniej ścianie po 2 cięciach cesarskich)?',
        opts: [
          'Spektrum łożyska nieprawidłowo zagnieżdżonego / przyrośniętego (PAS: accreta, increta, percreta) — ryzyko masywnego krwotoku i histerektomii okołoporodowej.',
          'Zespół policystycznych jajników (PCOS).',
          'Niewydolność cieśniowo-szyjkowa wymagająca szwu okrężnego w 34 Hbd.',
          'Zaśniad groniasty częściowy.'
        ],
        correct: 0,
        explanation: 'Połączenie łożyska przodującego i przebytych cięć cesarskich (zwłaszcza ≥2 CC) drastycznie zwiększa ryzyko spektrum PAS (placenta accreta spectrum — nawet ~40% przy 2 CC i łożysku przodującym!). Wymaga planowego rozwiązania przez CC w ośrodku III° z zespołem wielodyscyplinarnym w 34–36 Hbd.',
        pearl: 'Złota zasada: Nigdy nie badaj palpacyjnie przez pochwę przy podejrzeniu łożyska przodującego! Natomiast delikatne USG przezpochwowe (głowica w przedsionku pochwy, bez dotykania szyjki) jest bezpieczne i stanowi złoty standard pomiaru.'
      }
    },
    {
      id: 'guz-jajnika-iota',
      modality: 'usg',
      title: 'Podejrzany guz jajnika — reguły IOTA (cechy M)',
      short: 'Guz wielokomorowy z litymi wyroślami brodawkowatymi, silny Doppler i wodobrzusze',
      mods: ['12', '3'],
      atlas: null,
      sec: 'endometrium',
      vignette: '61-letnia pacjentka po menopauzie zgłasza narastające powiększenie obwodu brzucha, wczesne uczucie sytości i ból w podbrzuszu od 3 miesięcy. CA-125 wynosi 420 U/ml. W USG TV: guz lewego jajnika 95 mm, wielokomorowo-lity z ≥4 wyroślami brodawkowatymi do wnętrza, obfitym unaczynieniem (Color Score 4) i wolnym płynem (wodobrzusze) w jamie brzusznej.',
      svgType: 'usg-iota',
      usgKeyFindings: [
        'Cechy złośliwości (M-rules IOTA): nieregularny guz lity / wielokomorowo-lity ≥100 mm, ≥4 wyrośla brodawkowate',
        'Bardzo silny przepływ w Color Doppler (Color Score 4)',
        'Obecność wodobrzusza (ascites) w jamie otrzewnej → RMI = 3 × 3 × 420 = 3780 (wysokie ryzyko ≥200!)'
      ],
      hotspot: {
        id: 'hotspot-usg-iota',
        name: 'Wyrośla brodawkowate (≥4) z obfitym unaczynieniem (IOTA M-feature)',
        targetX: 165,
        targetY: 120,
        radius: 42,
        hint: 'Liczne, nieregularne, silnie unaczynione wyrośla brodawkowate w świetle wielokomorowej torbieli oraz obecność wodobrzusza spełniają kryteria M (Malignant) systemu IOTA.'
      },
      clinicalQuestion: {
        q: 'Wskaźnik RMI wynosi 3780 (≥200), a guz spełnia liczne cechy M wg IOTA. Jakie jest właściwe postępowanie?',
        opts: [
          'Skierowanie do specjalistycznego ośrodka ginekologii onkologicznej (konsylium, TK klatki/brzucha/miednicy, pełna operacja cytoredukcyjna / staging bez pęknięcia torebki guza).',
          'Przezskórna biopsja cienkoigłowa torbieli przez powłoki brzuszne w poradni POZ.',
          'Obserwacja i kontrolne USG za 12 miesięcy.',
          'Włączenie złożonej antykoncepcji dwuskładnikowej na 3 miesiące.'
        ],
        correct: 0,
        explanation: 'Przy wysokim ryzyku złośliwości (IOTA M-rules lub RMI ≥200) rokowanie pacjentki zależy bezpośrednio od operacji wykonanej w wyspecjalizowanym ośrodku onkologii ginekologicznej (dążenie do całkowitej cytoredukcji R0). Nakłuwanie torbieli jajnika grozi rozsiewem komórek nowotworowych po otrzewnej!',
        pearl: '5 cech M (Malignant) wg IOTA: M1 nieregularny guz lity, M2 wodobrzusze, M3 ≥4 wyrośla brodawkowate, M4 nieregularny guz wielokomorowo-lity ≥100 mm, M5 bardzo silny przepływ (Color Score 4).'
      }
    },
    {
      id: 'pcos',
      modality: 'usg',
      title: 'Obraz wielopęcherzykowych jajników (PCOM w PCOS)',
      short: 'Powiększony jajnik (>10 ml) z ≥20 pęcherzykami 2–9 mm ułożonymi obwodowo („sznur pereł”)',
      mods: ['8', '6'],
      atlas: null,
      sec: 'pcos',
      vignette: '24-letnia kobieta zgłasza się z powodu rzadkich miesiączek (co 50–70 dni), trądziku i hirsutyzmu (skala Ferrimana-Gallweya 11 pkt), BMI 29 kg/m². Wykluczono ciążę, hiperprolaktynemię, choroby tarczycy i WPN (17-OHP w normie). W USG TV: obustronnie powiększone jajniki (objętość 13 ml) z licznymi (>20) drobnymi pęcherzykami 2–9 mm ułożonymi podtorebkowo wokół hiperechogennego zrębu.',
      svgType: 'usg-pcos',
      usgKeyFindings: [
        '≥20 pęcherzyków antralnych (FNPO) o średnicy 2–9 mm w przekroju jajnika (wg zaktualizowanych wytycznych ESHRE 2018/2023; historycznie w Rotterdam 2003: ≥12)',
        'Objętość jajnika ≥10 ml',
        'Obwodowe ułożenie pęcherzyków („naszyjnik / sznur pereł”) i hiperechogenny zrąb centralny'
      ],
      hotspot: {
        id: 'hotspot-usg-pcos',
        name: 'Obwodowy wianek drobnych pęcherzyków 2–9 mm („sznur pereł”) + objętość ≥10 ml',
        targetX: 155,
        targetY: 125,
        radius: 44,
        hint: 'Zwróć uwagę na liczne, jednorodne, drobne pęcherzyki ułożone na obwodzie powiększonego jajnika wokół gęstego zrębu.'
      },
      clinicalQuestion: {
        q: 'Ile kryteriów rotterdamskich (i jakich) musi być spełnionych do rozpoznania zespołu PCOS u dorosłej kobiety (po wykluczeniu innych przyczyn)?',
        opts: [
          'Co najmniej 2 z 3: 1) rzadkie owulacje/brak owulacji, 2) kliniczny lub biochemiczny hiperandrogenizm, 3) obraz PCOM w USG (lub podwyższone AMH wg ESHRE 2023).',
          'Wyłącznie sam obraz PCOM w USG wystarczy do rozpoznania PCOS nawet przy regularnych cyklach i braku hiperandrogenizmu.',
          'Obowiązkowo wszystkie 3 kryteria + otyłość BMI >30 kg/m².',
          'Wyłącznie stosunek LH/FSH >2:1 w 3. dniu cyklu.'
        ],
        correct: 0,
        explanation: 'Rozpoznanie PCOS wymaga spełnienia ≥2 z 3 kryteriów rotterdamskich ORAZ wykluczenia innych przyczyn zaburzeń (tarczyca/TSH, hiperprolaktynemia, nieklasyczny wrodzony przerost nadnerczy 17-OHP, zespół Cushinga, guzy wirylizujące). Sam obraz PCOM w USG występuje u wielu zdrowych młodych kobiet i nie jest równoznaczny z PCOS!',
        pearl: 'Pułapka aktualizacji wytycznych: w starszych pytaniach (Rotterdam 2003) próg PCOM wynosił ≥12 pęcherzyków 2–9 mm; w aktualnych wytycznych ESHRE (2018/2023) przy nowoczesnych głowicach ≥8 MHz próg podniesiono do ≥20 pęcherzyków!'
      }
    }
  ];

  /* ---------- ATLAS CYTOLOGII WG SYSTEMU BETHESDA (5 POZYCJI) + 2 ZAGADKI ---------- */
  const BETHESDA_DATABASE = [
    {
      id: 'nilm',
      code: 'NILM',
      name: 'Brak zmian śródnabłonkowych i procesu złośliwego (NILM)',
      riskLevel: 'low',
      riskBadge: 'Wynik prawidłowy',
      morphology: 'Prawidłowe komórki nabłonka wielowarstwowego płaskiego (powierzchniowe, pośrednie) oraz prawidłowe komórki gruczołowe kanału szyjki (obecność strefy transformacji potwierdza reprezentatywność rozmazu). Mogą towarzyszyć zmiany odczynowe/zapalne lub drobnoustroje (Candida, Trichomonas, BV).',
      hpvLink: 'Niskie ryzyko obecności CIN2+; przy negatywnym teście HR-HPV (co-testing) ryzyko 5-letnie jest minimalne.',
      managementPtgip: 'Rutynowe badania przesiewowe wg schematu PTGiP: cytologia co 3 lata lub preferowany test HR-HPV / co-testing co 5 lat (od 25–30 r.ż.). W przypadku objawowego zakażenia (np. rzęsistkowica) — leczenie przyczynowe.',
      colposcopyIndication: 'Brak wskazań (chyba że widoczna makroskopowo podejrzana zmiana na szyjce lub uporczywe krwawienia kontaktowe!).',
      followup: 'Co 3 lata (cytologia) lub co 5 lat (HR-HPV / co-testing).',
      pregnancyNote: 'Postępowanie rutynowe — ponowne badanie po ciąży zgodnie z kalendarzem profilaktyki.',
      pearl: 'Jeśli makroskopowo we wzierniku widzisz podejrzany, krwawiący naciek na szyjce, wynik NILM w cytologii NIE uspokaja — pobierz biopsję (wynik może być fałszywie ujemny przez martwicę i krew)!'
    },
    {
      id: 'asc-us',
      code: 'ASC-US',
      name: 'Atypowe komórki nabłonka płaskiego o nieokreślonym znaczeniu (ASC-US)',
      riskLevel: 'low-mod',
      riskBadge: 'Niskie/pośrednie — kluczowy test HR-HPV',
      morphology: 'Nieznaczne powiększenie jąder komórkowych (2.5–3× jądro komórki pośredniej), niewielka hiperchromazja i minimalna nieregularność obrysu jądra — zmiany ilościowo lub jakościowo niewystarczające do rozpoznania SIL.',
      hpvLink: 'Około 40–50% przypadków ASC-US wiąże się z zakażeniem onkogennym HR-HPV; reszta to zmiany odczynowe/atroficzne.',
      managementPtgip: 'Postępowanie z wyboru (triage): test HR-HPV (najlepiej odruchowy / reflex na podłożu płynnym LBC)! HR-HPV(+) → kolposkopia (z genotypowaniem 16/18 lub p16/Ki67). HR-HPV(-) → powrót do badań co 3 lata. Jeśli brak testu HPV: powtórzyć cytologię za 6–12 mies.',
      colposcopyIndication: 'Wskazana przy dodatnim teście HR-HPV (zwłaszcza HPV 16/18) lub utrzymywaniu się ASC-US w kolejnej cytologii.',
      followup: 'Zależne od wyniku HR-HPV (ujemny: 3 lata; dodatni: kolposkopia).',
      pregnancyNote: 'Identyczny triage HR-HPV; przy HR-HPV(+) kolposkopię można wykonać w ciąży lub bezpiecznie odroczyć do 6 tygodni po porodzie (bardzo niskie ryzyko raka).',
      pearl: 'ASC-US to najczęstszy nieprawidłowy wynik cytologii — zapamiętaj jedno słowo na egzamin: REFLEX HR-HPV (test na wirusa HPV wysokiego ryzyka decyduje o kolposkopii)!'
    },
    {
      id: 'lsil',
      code: 'LSIL',
      name: 'Zmiana śródnabłonkowa małego stopnia (LSIL / CIN 1)',
      riskLevel: 'mod',
      riskBadge: 'Zakażenie produktywne HPV — wysoka regresja',
      morphology: 'Koilocyt — patognomoniczna cecha infekcji HPV (duże, powiększone jądro z wyraźnym przejaśnieniem okołojądrowym „halo” i zagęszczoną obwodową cytoplazmą), często komórki dwujądrzaste; stosunek jądrowo-cytoplazmatyczny nadal stosunkowo niski.',
      hpvLink: 'Ponad 80% zmian LSIL jest HR-HPV(+) — to morfologiczny obraz aktywnej, produktywnej replikacji wirusa HPV. U młodych kobiet <25–30 r.ż. większość (60–80%) ulega samoistnej regresji w ciągu 2 lat!',
      managementPtgip: 'U kobiet ≥25 r.ż.: kolposkopia (wg PTGiP dopuszczalna ocena p16/Ki67 lub HR-HPV triage w wybranych schematach). Jeśli histopatologia potwierdzi CIN 1 → obserwacja (nie wycinać pochopnie szyjki u młodych kobiet!). U pacjentek 21–24 r.ż. powtórzenie cytologii za 12 miesięcy.',
      colposcopyIndication: 'Wskazana u kobiet ≥25 r.ż. (zwłaszcza przy HR-HPV(+)).',
      followup: 'Po potwierdzeniu CIN 1: kontrola cytologia/HR-HPV za 12 miesięcy (leczenie dopiero przy przetrwaniu ≥2 lata lub progresji).',
      pregnancyNote: 'Kolposkopia (lub odroczenie po porodzie w wybranych przypadkach); absolutny brak wskazań do leczenia zabiegowego w ciąży.',
      pearl: 'Koilocyty w cytologii = LSIL (efekt cytopatyczny HPV). Nie wykonuj rutynowo LEEP/konizacji w świeżo rozpoznanym CIN 1 — chronisz szyjkę macicy przed niewydolnością w przyszłej ciąży!'
    },
    {
      id: 'hsil',
      code: 'HSIL',
      name: 'Zmiana śródnabłonkowa dużego stopnia (HSIL / CIN 2, CIN 3, CIS)',
      riskLevel: 'high',
      riskBadge: 'Stan przedrakowy — pilna kolposkopia',
      morphology: 'Mniejsze, niedojrzałe komórki parabazalne/bazalne o bardzo wysokim stosunku jądrowo-cytoplazmatycznym (N/C), silnie hiperchromatycznych, nieregularnych jądrach z gruboziarnistą chromatyną i skąpą cytoplazmą. Również kategoria ASC-H wymaga analogicznej czujności.',
      hpvLink: 'Przetrwałe zakażenie onkogennym HR-HPV (najczęściej typy 16 i 18) z integracją DNA wirusa i nadekspresją onkoprotein E6/E7 (degradacja p53 i pRb → dodatni dual-stain p16/Ki67).',
      managementPtgip: 'BEZWZGLĘDNA, PILNA KOLPOSKOPIA z celowaną biopsją (nie czekać na powtórną cytologię ani nie zwlekać!). Potwierdzone CIN 2/3 wymaga leczenia wycinającego: elektrokonizacja pętlą diatermiczną (LEEP/LLETZ) lub konizacja.',
      colposcopyIndication: 'BEZWZGLĘDNA i PILNA u każdej pacjentki (także przy ASC-H).',
      followup: 'Po LEEP/konizacji ścisły nadzór („test of cure”: HR-HPV + cytologia po 6 mies., potem regularne kontrole przez min. 20–25 lat).',
      pregnancyNote: 'PILNA KOLPOSKOPIA w ciąży (wykluczenie raka inwazyjnego!), dopuszczalna celowana biopsja wycinkowa; ZAKAZ łyżeczkowania kanału szyjki (ECC)! Leczenie LEEP odracza się do 6–8 tyg. po porodzie.',
      pearl: 'Przy HSIL (i ASC-H) NIE wykonuje się „powtórki cytologii za 6 miesięcy” — od razu kieruj na kolposkopię z biopsją!'
    },
    {
      id: 'ais-rak',
      code: 'AGC / AIS / Rak',
      name: 'Komórki gruczołowe (AGC/AIS) i podejrzenie raka inwazyjnego',
      riskLevel: 'critical',
      riskBadge: 'Pilna diagnostyka onkologiczna',
      morphology: 'AGC/AIS: płaty i rozety stłoczonych komórek gruczołowych z palisadowym ułożeniem jąder (feathering / „pierzaste brzegi”). Rak płaskonabłonkowy: skrajny polimorfizm, komórki kijankowate/włókniste, martwiczo-krwotoczne tło (diateza nowotworowa).',
      hpvLink: 'Rak płaskonabłonkowy i gruczolakorak szyjki niemal w 100% związane z HR-HPV (typ 18 szczególnie częsty w gruczolakoraku / AIS). Uwaga: AGC może pochodzić z endometrium!',
      managementPtgip: 'Pilna kolposkopia z biopsją celowaną + łyżeczkowanie kanału szyjki (ECC) + u kobiet ≥35 r.ż. lub z czynnikami ryzyka/krwawieniami także BIOPSJA ENDOMETRIUM! Przy raku inwazyjnym: staging FIGO 2018 (MRI miednicy + TK/PET-CT) i konsylium onkologiczne.',
      colposcopyIndication: 'NATYCHMIASTOWA kolposkopia + ECC + ocena jamy macicy (endometrium) przy AGC/AIS.',
      followup: 'Zgodnie z protokołem onkologicznym (AIS często wymaga konizacji diagnostycznej z ujemnymi marginesami, a po zakończeniu rozrodu histerektomii ze względu na wieloogniskowość).',
      pregnancyNote: 'Pilna kolposkopia i biopsja w ośrodku referencyjnym (bez ECC); przy potwierdzonym raku inwazyjnym decyzja konsylium zależna od Hbd i stopnia FIGO.',
      pearl: 'Wynik AGC (Atypical Glandular Cells) to pułapka egzaminacyjna: wymaga diagnostyki zarówno kanału szyjki (kolposkopia + ECC), jak i endometrium u kobiet ≥35 r.ż.!'
    }
  ];

  const BETHESDA_PUZZLES = [
    {
      id: 'puz_ascus_hpv',
      title: 'Przypadek 1: 31-letnia kobieta z wynikiem ASC-US w cytologii płynnej (LBC)',
      vignette: '31-letnia pacjentka zgłasza się po odbiór wyniku przesiewowej cytologii płynnej (LBC). Rozpoznanie wg systemu Bethesda: ASC-US (atypowe komórki nabłonka płaskiego o nieokreślonym znaczeniu). W badaniu we wzierniku szyjka makroskopowo gładka, brak krwawień kontaktowych.',
      bethesdaId: 'asc-us',
      step1: {
        q: 'Jakie jest optymalne postępowanie I rzutu wg aktualnych rekomendacji PTGiP w przypadku wyniku ASC-US?',
        opts: [
          'Wykonanie testu w kierunku onkogennych typów HPV (reflex HR-HPV z tego samego materiału LBC)',
          'Natychmiastowa elektrokonizacja szyjki macicy (LEEP)',
          'Histerektomia prosta z przydatkami',
          'Brak jakichkolwiek działań i powrót do cytologii za 5 lat'
        ],
        correct: 0,
        explanation: 'W przypadku wyniku ASC-US postępowaniem z wyboru (triage) jest oznaczenie HR-HPV (optymalnie reflex test z podłoża LBC). Pozwala to odsiać pacjentki wymagające kolposkopii od zmian odczynowych.'
      },
      step2: {
        q: 'Test HR-HPV z tego samego materiału okazał się DODATNI dla genotypu HPV 16. Jaki jest kolejny obowiązkowy krok?',
        opts: [
          'Skierowanie na kolposkopię z ewentualną celowaną biopsją szyjki macicy',
          'Przepisanie globulek z metronidazolem i kontrola za 3 lata',
          'Podanie szczepionki przeciw HPV w celu wyleczenia obecnego zakażenia',
          'Wykonanie wyłącznie oznaczenia CA-125'
        ],
        correct: 0,
        explanation: 'Dodatni wynik HR-HPV (zwłaszcza HPV 16 lub 18) przy ASC-US jest bezwzględnym wskazaniem do kolposkopii. Szczepionka przeciw HPV działa profilaktycznie, ale nie leczy już trwającej infekcji.'
      },
      pearl: 'ASC-US + HR-HPV(+) = kolposkopia. ASC-US + HR-HPV(-) = bardzo niskie ryzyko CIN2+, powrót do kontroli za 3 lata!'
    },
    {
      id: 'puz_hsil_ciaza',
      title: 'Przypadek 2: 29-letnia ciężarna w 14 Hbd z wynikiem HSIL',
      vignette: '29-letnia pierwiastka w 14. tygodniu ciąży odebrała wynik cytologii pobranej na pierwszej wizycie ciążowej: HSIL (zmiana śródnabłonkowa dużego stopnia). Pacjentka jest przerażona i pyta, czy grozi jej natychmiastowy zabieg mogący wywołać poronienie.',
      bethesdaId: 'hsil',
      step1: {
        q: 'Jakie badanie należy wykonać teraz (w 14 Hbd) i jakiej procedury BEZWZGLĘDNIE NIE WOLNO wykonać w ciąży?',
        opts: [
          'Należy wykonać pilną kolposkopię (z dopuszczalną celowaną biopsją tarczy szyjki); BEZWZGLĘDNIE ZAKAZANE jest łyżeczkowanie kanału szyjki (ECC)!',
          'Należy od razu wykonać głęboką konizację nożową i łyżeczkowanie kanału szyjki (ECC)',
          'Nie wolno wykonywać nawet kolposkopii aż do zakończenia karmienia piersią',
          'Należy natychmiast zakończyć ciążę'
        ],
        correct: 0,
        explanation: 'W ciąży przy HSIL wykonujemy pilną kolposkopię, aby wykluczyć raka inwazyjnego. Celowana biopsja wycinkowa tarczy jest bezpieczna, natomiast łyżeczkowanie kanału szyjki (ECC) jest w ciąży bezwzględnie przeciwwskazane.'
      },
      step2: {
        q: 'Kolposkopia i celowana biopsja potwierdziły CIN 3 (HSIL) bez jakichkolwiek cech inwazji raka. Jaki jest plan dalszego postępowania?',
        opts: [
          'Kontrola kolposkopowa co ~12 tygodni w ciąży, poród wg wskazań położniczych (SN jest dozwolony!) i leczenie zabiegowe (LEEP) 6–8 tygodni po porodzie',
          'Bezwzględne wskazanie do cięcia cesarskiego w 32 Hbd z jednoczesną histerektomią',
          'Natychmiastowa radioterapia miednicy w II trymestrze',
          'Zaniechanie dalszych kontroli, ponieważ CIN 3 zawsze znika po porodzie'
        ],
        correct: 0,
        explanation: 'CIN 2/3 (HSIL) w ciąży bez podejrzenia inwazji nie stanowi wskazania do cięcia cesarskiego ani natychmiastowej konizacji. Ciężarną monitoruje się kolposkopowo, a definitywną ocenę i leczenie (LEEP) przeprowadza się 6–8 tygodni po porodzie.'
      },
      pearl: 'Zapamiętaj na egzamin: CIN (nawet CIN 3) w ciąży NIE jest wskazaniem do cięcia cesarskiego! Wskazaniem do CC jest natomiast inwazyjny rak szyjki macicy.'
    }
  ];

  /* ---------- STACJE EGZAMINU PRAKTYCZNEGO OSCE (3 KOMPLETNE STACJE OB/GYN) ---------- */
  const OSCE_STATIONS = [
    {
      id: 'osce-leopold',
      number: 1,
      title: 'Stacja 1: Badanie położnicze ciężarnej w 38+4 Hbd (Chwyty Leopolda)',
      shortTitle: 'Chwyty Leopolda (38 Hbd)',
      topic: 'Położnictwo fizjologiczne / Badanie zewnętrzne / Chwyty Leopolda i FHR',
      mods: ['4', '5'],
      patient: {
        name: 'Anna Kowalska',
        age: '29 lat (G1P0, 38+4 Hbd)',
        weight: '71.0 kg (BMI wyj. 22.1)',
        gender: 'f',
        avatarType: 'pregnant',
        vitalsInitial: { hr: 84, rr: 16, bp: '118/74', temp: '36.6°C', fhr: '142/min', spo2: '99%' }
      },
      briefing: {
        scenario: '29-letnia pierwiastka w 38+4 Hbd zgłasza się na planową wizytę przedporodową w poradni K. Ciąża dotychczas niepowikłana, posiew GBS ujemny, ruchy płodu odczuwa dobrze. Skarży się na sporadyczne, niebolesne twardnienia brzucha wieczorem.',
        task: 'Zbierz krótki wywiad położniczy, wykonaj wszystkie 4 chwyty Leopolda w prawidłowej kolejności, oceń wysokość dna macicy oraz czynność serca płodu (FHR), uniknij błędu krytycznego i sformułuj wzorcowy opis badania położniczego.'
      },
      scale: {
        id: 'leopold_checklist',
        name: 'Checklista OSCE — Badanie zewnętrzne (4 chwyty Leopolda + FHR)',
        maxScore: 6,
        unit: 'pkt',
        items: [
          {
            id: 'przygotowanie',
            label: 'Przygotowanie: opróżnienie pęcherza, lekkie zgięcie kolan, ciepłe dłonie',
            triggerQuestions: [0],
            triggerManeuvers: ['m_wysokosc_dna'],
            score: 1, maxItemScore: 1,
            findingVal: 'Wykonano prawidłowo (1 pkt)',
            normVal: 'Nie sprawdzono (0 pkt)'
          },
          {
            id: 'chwyt_1',
            label: 'I chwyt Leopolda (dno macicy — wysokość i część płodu w dnie)',
            triggerManeuvers: ['m_leopold_1'],
            score: 1, maxItemScore: 1,
            findingVal: 'Dno 2 palce poniżej wyrostka mieczykowatego; w dnie miękkie, nieregularne pośladki (1 pkt)',
            normVal: 'Niewykonany (0 pkt)'
          },
          {
            id: 'chwyt_2',
            label: 'II chwyt Leopolda (boki macicy — grzbiet i części drobne → ustawienie)',
            triggerManeuvers: ['m_leopold_2'],
            score: 1, maxItemScore: 1,
            findingVal: 'Po stronie lewej gładki, równy grzbiet; po prawej części drobne = ustawienie I (lewe) (1 pkt)',
            normVal: 'Niewykonany (0 pkt)'
          },
          {
            id: 'chwyt_3',
            label: 'III chwyt Leopolda (część przodująca nad spojeniem i balotowanie)',
            triggerManeuvers: ['m_leopold_3'],
            score: 1, maxItemScore: 1,
            findingVal: 'Nad spojeniem twarda, okrągła główka, słabo ruchoma (1 pkt)',
            normVal: 'Niewykonany (0 pkt)'
          },
          {
            id: 'chwyt_4',
            label: 'IV chwyt Leopolda (twarzą do nóg pacjentki — stosunek główki do wchodu)',
            triggerManeuvers: ['m_leopold_4'],
            score: 1, maxItemScore: 1,
            findingVal: 'Główka ustalona we wchodzie miednicy (palce nie schodzą się pod główką) (1 pkt)',
            normVal: 'Niewykonany (0 pkt)'
          },
          {
            id: 'fhr_osluch',
            label: 'Osłuchanie czynności serca płodu (FHR) w punkcie optimum po stronie grzbietu',
            triggerManeuvers: ['m_fhr_udt'],
            score: 1, maxItemScore: 1,
            findingVal: 'FHR 142/min miarowe, najlepiej słyszalne na lewo poniżej pępka (1 pkt)',
            normVal: 'Nie osłuchano FHR (0 pkt)'
          }
        ],
        interpretations: [
          { max: 2, label: 'Niepełne badanie (≤2 pkt)', color: 'var(--red)', tip: 'Wykonaj wszystkie 4 chwyty Leopolda i osłuchaj FHR!' },
          { max: 4, label: 'Częściowo wykonane (3–4 pkt)', color: 'var(--amber)', tip: 'Dokończ brakujące chwyty (pamiętaj o odwróceniu się w IV chwycie) oraz pomiar FHR.' },
          { max: 6, label: 'Kompletne badanie położnicze (5–6 pkt)', color: 'var(--green)', tip: 'Wzorcowe badanie zewnętrzne: położenie podłużne główkowe, ustawienie I (lewe), FHR w normie.' }
        ]
      },
      interview: [
        { q: 'Czy przed badaniem opróżniła Pani pęcherz moczowy i czy dobrze odczuwa Pani ruchy dziecka?', a: 'Tak, właśnie byłam w toalecie. Mały rusza się bardzo aktywnie, szczególnie wieczorem po kolacji.', isKey: true },
        { q: 'Czy pojawiły się regularne bolesne skurcze, krwawienie lub sączenie płynu owodniowego?', a: 'Nie, tylko czasem brzuch lekko twardnieje na kilkanaście sekund bez bólu. Żadnego krwawienia ani odpływania wód nie było.', isKey: true },
        { q: 'Czy ma Pani bóle głowy, zaburzenia widzenia lub silny świąd dłoni i stóp?', a: 'Nie, czuję się dobrze, ciśnienie w domu mam zawsze około 115/70.', isKey: true },
        { q: 'Jaki był wynik posiewu GBS z 36. tygodnia i jaka jest Pani grupa krwi?', a: 'GBS wyszedł ujemny, grupa krwi A RhD(+), bez przeciwciał.', isKey: false }
      ],
      zones: [
        {
          id: 'cisnienie_ogolne',
          name: 'Parametry ogólne i pomiar RR',
          icon: 'RR',
          x: 30, y: 36,
          maneuvers: [
            { id: 'm_rr_ciezarnej', label: 'Zmierz ciśnienie tętnicze i oceń obrzęki kończyn dolnych', isKey: true, isFatal: false, finding: 'RR 118/74 mmHg (prawidłowe), tętno matki 84/min; brak patologicznych obrzęków twarzy i rąk, minimalny fizjologiczny obrzęk wokół kostek.', reaction: 'normal' },
            {
              id: 'm_plasko_wznak',
              label: 'Ułóż ciężarną na długo płasko na plecach bez wałka mimo zgłoszenia zawrotów głowy',
              isKey: false,
              isFatal: true,
              fatalMessage: 'BŁĄD KRYTYCZNY! Zespół żyły głównej dolnej (aortocaval compression): ciężarna macica ucisnęła VCI, wywołując gwałtowny spadek powrotu żylnego, hipotensję matki (RR 78/48 mmHg), omdlenie i bradykardię płodu (FHR 95/min)!',
              complicationVitals: { hr: 118, rr: 22, bp: '78/48', fhr: '95/min', spo2: '96%' },
              finding: 'Pacjentka blednie, zgłasza mdłości i mroczki, RR spada do 78/48 mmHg, a tętno płodu zwalnia do 95/min! Natychmiast przekręć ciężarną na LEWY BOK!',
              reaction: 'crisis'
            }
          ]
        },
        {
          id: 'dno_macicy',
          name: 'Dno macicy (I chwyt Leopolda)',
          icon: 'L1',
          x: 48, y: 42,
          maneuvers: [
            { id: 'm_wysokosc_dna', label: 'Oceń wysokość dna macicy (SFH) i napięcie powłok', isKey: true, isFatal: false, finding: 'Dno macicy 2 palce poniżej wyrostka mieczykowatego (SFH = 37 cm — adekwatnie do 38 Hbd; dno lekko obniżone w 38–40 Hbd). Macica niebolesna, prawidłowe napięcie spoczynkowe.', reaction: 'normal' },
            { id: 'm_leopold_1', label: 'Wykonaj I chwyt Leopolda (obie dłonie na dnie macicy)', isKey: true, isFatal: false, finding: 'W dnie macicy wyczuwalna duża, miękka, mniej regularna, niebalotująca część płodu — pośladki płodu.', reaction: 'normal' }
          ]
        },
        {
          id: 'boki_macicy',
          name: 'Ściany boczne macicy (II chwyt Leopolda)',
          icon: 'L2',
          x: 48, y: 52,
          maneuvers: [
            { id: 'm_leopold_2', label: 'Wykonaj II chwyt Leopolda (naprzemienna palpacja boków macicy)', isKey: true, isFatal: false, finding: 'Po LEWEJ stronie macicy wyczuwalna długa, gładka, jednostajnie oporująca płaszczyzna (grzbiet płodu). Po PRAWEJ stronie wyczuwalne drobne, ruchome uwypuklenia (kończyny). Wniosek: ustawienie I (lewe)!', reaction: 'normal' }
          ]
        },
        {
          id: 'spojenie_lonowe',
          name: 'Okolica nadłonowa (III i IV chwyt Leopolda)',
          icon: 'L3/4',
          x: 48, y: 62,
          maneuvers: [
            { id: 'm_leopold_3', label: 'Wykonaj III chwyt Leopolda (chwyt Pawlika nad spojeniem łonowym)', isKey: true, isFatal: false, finding: 'Nad spojeniem łonowym wyczuwalna twarda, okrągła, gładka część przodująca (główka płodu) — wyraźnie ograniczona ruchomość (nie balotuje swobodnie).', reaction: 'normal' },
            { id: 'm_leopold_4', label: 'Odwróć się twarzą do nóg pacjentki i wykonaj IV chwyt Leopolda', isKey: true, isFatal: false, finding: 'Palce obu dłoni zsunięte wzdłuż dolnego odcinka w kierunku wchodu nie schodzą się pod częścią przodującą — główka jest już ustalona we wchodzie miednicy (u pierwiastki fizjologiczne w 38 Hbd).', reaction: 'normal' }
          ]
        },
        {
          id: 'punkt_fhr',
          name: 'Osłuchiwanie tętna płodu (FHR — UDT)',
          icon: 'FHR',
          x: 56, y: 58,
          maneuvers: [
            { id: 'm_fhr_udt', label: 'Osłuchaj tętno płodu detektorem UDT na lewo poniżej pępka', isKey: true, isFatal: false, finding: 'Czynność serca płodu (FHR) miarowa, 142 ud./min (norma 110–160/min), najwyraźniejsza w linii pępek–kolec biodrowy przedni górny lewy (poniżej pępka po stronie grzbietu).', reaction: 'normal' }
          ]
        }
      ],
      synthesis: {
        questionDiagnostic: 'Jak brzmi prawidłowy zapis położniczy na podstawie wykonanych 4 chwytów Leopolda?',
        optionsDiagnostic: [
          { id: 'd1', label: 'Ciąża 38+4 Hbd, położenie podłużne główkowe, ustawienie I (lewe), główka ustalona we wchodzie, FHR 142/min prawidłowe', isCorrect: true, explanation: 'Pośladki w dnie + główka nad spojeniem = położenie podłużne główkowe; grzbiet po lewej = ustawienie I; palce w IV chwycie rozchodzą się = główka ustalona we wchodzie.' },
          { id: 'd2', label: 'Położenie podłużne miednicowe, ustawienie II (prawe)', isCorrect: false, explanation: 'W dnie wyczuto miękkie pośladki, a nad spojeniem twardą główkę — jest to położenie główkowe, a grzbiet po lewej oznacza ustawienie I.' },
          { id: 'd3', label: 'Położenie poprzeczne z główką w prawym podżebrzu', isCorrect: false, explanation: 'W położeniu poprzecznym nad spojeniem nie wyczuwa się części przodującej, a dno macicy jest niższe i szersze poprzecznie.' }
        ],
        differentialOptions: [
          { id: 'diff1', label: 'Skurcze przepowiadające Braxtona-Hicksa (fizjologiczne)', isCorrect: true },
          { id: 'diff2', label: 'Rozpoczynający się poród (skurcze regularne + rozwieranie szyjki)', isCorrect: true },
          { id: 'diff3', label: 'Przedwczesne oddzielenie łożyska', isCorrect: false }
        ],
        actionOptions: [
          { id: 'act1', label: 'Omówienie objawów rozpoczynającego się porodu i alarmowych (odpłynięcie wód, krwawienie, spadek ruchów)', isCorrect: true },
          { id: 'act2', label: 'Zaplanowanie kolejnej kontroli za 7 dni oraz KTG + USG AFI w terminie porodu (40+0 Hbd)', isCorrect: true },
          { id: 'act3', label: 'Zalecenie odpoczynku i pozycji na lewym boku przy zawrotach głowy', isCorrect: true }
        ]
      },
      statusPraesens: {
        title: 'Status Obstetricus: Pierwiastka 38+4 Hbd — badanie położnicze prawidłowe',
        sections: [
          { num: '1', title: 'Stan ogólny i parametry życiowe', content: 'Ciężarna 29 lat (G1P0, 38+4 Hbd), stan ogólny dobry. RR 118/74 mmHg, HR 84/min, temp. 36.6°C, bez patologicznych obrzęków.' },
          { num: '2', title: 'Badanie zewnętrzne — chwyty Leopolda', content: 'Brzuch wysklepiony owalnie w osi długiej. Wysokość dna macicy 2 palce poniżej wyrostka mieczykowatego (SFH 37 cm), napięcie macicy spoczynkowe prawidłowe. I chwyt: w dnie miękkie pośladki. II chwyt: grzbiet po stronie lewej, części drobne po prawej (ustawienie I). III chwyt: twarda główka nad spojeniem, niebalotująca. IV chwyt: główka ustalona we wchodzie miednicy.' },
          { num: '3', title: 'Czynność serca i ruchy płodu', content: 'FHR 142 ud./min, miarowe, słyszalne najwyraźniej po stronie lewej poniżej pępka. Ruchy płodu dobrze odczuwane.' }
        ],
        conclusions: 'Ciąża donoszona 38+4 Hbd, przebieg fizjologiczny, położenie podłużne główkowe, ustawienie I, GBS(-). Kolejna wizyta kontrolna za 7 dni, KTG + ocena płynu owodniowego w 40+0 Hbd.'
      }
    },
    {
      id: 'osce-krwawienie-1t',
      number: 2,
      title: 'Stacja 2: 29-latka w 7. Hbd z bólem prawego podbrzusza i plamieniem',
      shortTitle: 'Krwawienie I trymestru (Ektopowa)',
      topic: 'Ciąża ektopowa / Wstrząs krwotoczny / Badanie w I trymestrze',
      mods: ['3', '7', '9'],
      patient: {
        name: 'Karolina Nowak',
        age: '29 lat (G2P0, 7+1 Hbd)',
        weight: '62.0 kg',
        gender: 'f',
        avatarType: 'adult_f',
        vitalsInitial: { hr: 112, rr: 20, bp: '96/60', temp: '36.8°C', crt: '2.5 s', spo2: '98%' }
      },
      briefing: {
        scenario: '29-letnia kobieta zgłasza się na ginekologiczną Izbę Przyjęć z powodu narastającego od 6 godzin bólu prawego podbrzusza, ciemnego plamienia z dróg rodnych oraz zawrotów głowy przy wstawaniu. Ostatnia miesiączka 7 tygodni temu, domowy test ciążowy przed 4 dniami dodatni. Przed 3 laty leczona z powodu zapalenia przydatków (Chlamydia).',
        task: 'Zbierz ukierunkowany wywiad, oceń stabilność hemodynamiczną i objawy otrzewnowe, zinterpretuj wynik USG TV i β-hCG, uniknij błędu krytycznego oraz wybierz właściwe postępowanie.'
      },
      scale: {
        id: 'ectopic_triage',
        name: 'Ocena pilności i stabilności w podejrzeniu ciąży ektopowej',
        maxScore: 5,
        unit: 'kryteria',
        items: [
          {
            id: 'czynnik_ryzyka',
            label: 'Identyfikacja czynnika ryzyka (przebyte PID / Chlamydia)',
            triggerQuestions: [1],
            score: 1, maxItemScore: 1,
            findingVal: 'Przebyte PID (Chlamydia) — wysoki czynnik ryzyka ciąży ektopowej (1 pkt)',
            normVal: 'Nie zebrano wywiadu (0 pkt)'
          },
          {
            id: 'wstrzas_ocena',
            label: 'Ocena hemodynamiczna (tachykardia 112/min, RR 96/60, objawy ortostatyczne)',
            triggerManeuvers: ['m_parametry_wstrzas'],
            score: 1, maxItemScore: 1,
            findingVal: 'Wczesny wstrząs krwotoczny (SI = HR/SBP = 1.17 > 0.9!) (1 pkt)',
            normVal: 'Nie oceniono (0 pkt)'
          },
          {
            id: 'otrzewna',
            label: 'Badanie brzucha i objawy otrzewnowe + ból promieniujący do barku (objaw Kehra)',
            triggerManeuvers: ['m_brzuch_ektopowa'],
            triggerQuestions: [0],
            score: 1, maxItemScore: 1,
            findingVal: 'Obrona w prawym podbrzuszu, dodatni Blumberg i ból prawego barku (1 pkt)',
            normVal: 'Nie zbadano (0 pkt)'
          },
          {
            id: 'usg_bhcg',
            label: 'Zlecenie pilnego USG TV + ilościowego β-hCG + grupa krwi/krzyżówka',
            triggerManeuvers: ['m_usg_tv_ektopowa'],
            score: 1, maxItemScore: 1,
            findingVal: 'β-hCG 4100 mIU/ml, pusta jama macicy, zmiana w prawym jajowodzie + wolny płyn w zatoce Douglasa (1 pkt)',
            normVal: 'Nie wykonano (0 pkt)'
          },
          {
            id: 'rh_status',
            label: 'Sprawdzenie grupy krwi RhD (profilaktyka anty-D!)',
            triggerQuestions: [2],
            score: 1, maxItemScore: 1,
            findingVal: 'Pacjentka ma grupę B RhD(-) → KONIECZNA profilaktyka anty-D! (1 pkt)',
            normVal: 'Pominięto RhD (0 pkt)'
          }
        ],
        interpretations: [
          { max: 2, label: 'Niepełna ocena pilności (≤2 pkt)', color: 'var(--red)', tip: 'Oceń wstrząs, objawy otrzewnowe, USG TV i grupę krwi RhD!' },
          { max: 3, label: 'Częściowa ocena (3 pkt)', color: 'var(--amber)', tip: 'Sprawdź wszystkie elementy bezpieczeństwa, w tym status RhD.' },
          { max: 5, label: 'Prawidłowe rozpoznanie pękającej ciąży ektopowej (4–5 pkt)', color: 'var(--green)', tip: 'Pilna resuscytacja + blok operacyjny (laparoskopia) + anty-D!' }
        ]
      },
      interview: [
        { q: 'Czy ból promieniuje do prawego barku lub nasila się przy wstawaniu?', a: 'Tak! Kiedy próbowałam wstać w domu, zakręciło mi się w głowie i poczułam dziwne kłucie pod prawym obojczykiem i w barku.', isKey: true },
        { q: 'Czy miała Pani wcześniej zapalenia przydatków, operacje w jamie brzusznej lub ciążę pozamaciczną?', a: 'Trzy lata temu miałam ostre zapalenie przydatków wywołane przez Chlamydię, byłam w szpitalu na antybiotykach.', isKey: true },
        { q: 'Czy zna Pani swoją grupę krwi i czynnik Rh?', a: 'Tak, mam w portfelu kartę grupy krwi: B RhD ujemny (RhD-).', isKey: true },
        { q: 'Kiedy zjadła Pani ostatni posiłek?', a: 'Około 5 godzin temu zjadłam tylko małą kanapkę.', isKey: false }
      ],
      zones: [
        {
          id: 'krążenie_wstrzas',
          name: 'Układ krążenia i indeks wstrząsu',
          icon: 'SI',
          x: 34, y: 36,
          maneuvers: [
            { id: 'm_parametry_wstrzas', label: 'Oceń RR, HR, skórę i indeks wstrząsu (SI = HR/SBP)', isKey: true, isFatal: false, finding: 'Skóra blada, chłodny pot na czole, HR 112/min, RR 96/60 mmHg. Indeks wstrząsu (Shock Index) = 112/96 = 1.17 (norma <0.9) — wczesny wstrząs krwotoczny!', reaction: 'pain' }
          ]
        },
        {
          id: 'brzuch_ektopowa',
          name: 'Jama brzuszna i objawy otrzewnowe',
          icon: 'BRZ',
          x: 48, y: 52,
          maneuvers: [
            { id: 'm_brzuch_ektopowa', label: 'Zbadaj brzuch (palpacja delikatna i objaw Blumberga)', isKey: true, isFatal: false, finding: 'Wyraźna tkliwość i obrona mięśniowa w prawym podbrzuszu, dodatni objaw Blumberga (podrażnienie otrzewnej przez krew). Ból barku = objaw Kehra (drażnienie przepony krwią).', reaction: 'pain' }
          ]
        },
        {
          id: 'badanie_gin_usg',
          name: 'Badanie ginekologiczne i USG TV',
          icon: 'USG',
          x: 48, y: 66,
          maneuvers: [
            { id: 'm_usg_tv_ektopowa', label: 'Wykonaj badanie we wzierniku i pilne USG przezpochwowe + β-hCG', isKey: true, isFatal: false, finding: 'We wzierniku skąpe ciemne krwawienie z ujścia szyjki. USG TV: pusta jama macicy (endometrium 13 mm), w prawych przydatkach zmiana 28 mm (tubal ring), znaczna ilość echogennego płynu (krwi) w zatoce Douglasa i zachyłku Morisona! β-hCG = 4100 mIU/ml.', reaction: 'pain' },
            {
              id: 'm_mtx_fatal',
              label: 'Podaj metotreksat (MTX) i wypisz do domu na kontrolę β-hCG za 4 dni',
              isKey: false,
              isFatal: true,
              fatalMessage: 'BŁĄD KRYTYCZNY! Podanie metotreksatu i wypisanie pacjentki z objawami pękniętej ciąży ektopowej (SI 1.17, wolna krew w otrzewnej, objaw Kehra) doprowadziło do pełnoobjawowego wstrząsu krwotocznego (RR 68/40 mmHg, HR 148/min)!',
              complicationVitals: { hr: 148, rr: 28, bp: '68/40', crt: '4.5 s', spo2: '93%' },
              finding: 'Pacjentka traci przytomność, RR spada do 68/40 mmHg, tętno 148/min — masywny krwotok do jamy otrzewnej! Natychmiast na blok operacyjny!',
              reaction: 'crisis'
            }
          ]
        }
      ],
      synthesis: {
        questionDiagnostic: 'Jakie jest rozpoznanie i postępowanie z wyboru u tej pacjentki?',
        optionsDiagnostic: [
          { id: 'd1', label: 'Pęknięta ciąża ektopowa jajowodowa z krwawieniem do jamy otrzewnej — pilna laparoskopia operacyjna po stabilizacji + anty-D', isCorrect: true, explanation: 'Tachykardia, hipotensja (SI >1.1), objaw Kehra, obrona otrzewnowa i krew w zachyłku Morisona to bezwzględne przeciwwskazanie do metotreksatu i wskazanie do pilnej operacji!' },
          { id: 'd2', label: 'Poronienie zagrażające — progesteron doustnie i odpoczynek w domu', isCorrect: false, explanation: 'Przy β-hCG 4100 mIU/ml pusta jama macicy i krew w otrzewnej wykluczają prawidłową ciążę wewnątrzmaciczną.' },
          { id: 'd3', label: 'Niepęknięta ciąża ektopowa — leczenie zachowawcze metotreksatem ambulatoryjnie', isCorrect: false, explanation: 'Pacjentka ma cechy krwawienia wewnętrznego i niestabilności hemodynamicznej — MTX jest bezwzględnie przeciwwskazany!' }
        ],
        differentialOptions: [
          { id: 'diff1', label: 'Pęknięcie krwotocznej torbieli ciałka żółtego', isCorrect: true },
          { id: 'diff2', label: 'Skręt przydatków prawych', isCorrect: true },
          { id: 'diff3', label: 'Ostre zapalenie wyrostka robaczkowego', isCorrect: true }
        ],
        actionOptions: [
          { id: 'act1', label: 'Dwa szerokie wkłucia i.v., krystaloidy, morfologia + próba krzyżowa (zabezpieczenie KKCz)', isCorrect: true },
          { id: 'act2', label: 'Pilna laparoskopia operacyjna (salpingektomia/salpingotomia i ewakuacja krwiaka)', isCorrect: true },
          { id: 'act3', label: 'Podanie immunoglobuliny anty-D (300 µg i.m.) — pacjentka jest B RhD(-)!', isCorrect: true },
          { id: 'act_fatal', label: 'Podanie metotreksatu i wypis do obserwacji domowej', isCorrect: false, isFatal: true, fatalMessage: 'Krwotok wewnętrzny ze wstrząsem hipowolemicznym!' }
        ]
      },
      statusPraesens: {
        title: 'Status Praesens: 29-latka z pękniętą ciążą ektopową prawostronną',
        sections: [
          { num: '1', title: 'Stan ogólny i krążenie', content: 'Stan ogólny średnio ciężki, skóra blada, wilgotna. HR 112/min, RR 96/60 mmHg (Indeks Wstrząsu 1.17), CRT 2.5 s.' },
          { num: '2', title: 'Jama brzuszna', content: 'Brzuch bolesny z miejscową obroną mięśniową w prawym podbrzuszu, dodatni objaw Blumberga. Zgłasza promieniowanie bólu do prawego barku (objaw Kehra).' },
          { num: '3', title: 'Badanie ginekologiczne i USG TV', content: 'Skąpe ciemne krwawienie z kanału szyjki, tkliwość sklepienia tylnego i prawych przydatków. USG TV: jama macicy pusta, endometrium 13 mm, w prawym jajowodzie struktura pierścieniowata 28 mm, znaczna ilość wolnego echogennego płynu w zatoce Douglasa i zachyłku Morisona. β-hCG 4100 mIU/ml. Grupa krwi B RhD(-).' }
        ],
        conclusions: 'Rozpoznanie: Pęknięta ciąża ektopowa jajowodowa prawostronna, haemoperitoneum, wczesny wstrząs krwotoczny. Zlecenia pilne: 2× i.v., krystaloidy, krzyżówka 2 j. KKCz, pilna laparoskopia na bloku operacyjnym, po zabiegu immunoglobulina anty-D (300 µg i.m.).'
      }
    },
    {
      id: 'osce-ktg-bishop',
      number: 3,
      title: 'Stacja 3: Ciężarna w 41+1 Hbd — kwalifikacja do indukcji (Bishop + KTG)',
      shortTitle: 'Indukcja porodu (Bishop + KTG)',
      topic: 'Ciąża po terminie / Skala Bishopa / Preindukcja vs oksytocyna / KTG',
      mods: ['5', '4', '1'],
      patient: {
        name: 'Magdalena Wiśniewska',
        age: '31 lat (G1P0, 41+1 Hbd)',
        weight: '76.0 kg',
        gender: 'f',
        avatarType: 'pregnant',
        vitalsInitial: { hr: 80, rr: 16, bp: '122/78', temp: '36.7°C', fhr: '138/min', spo2: '99%' }
      },
      briefing: {
        scenario: '31-letnia pierwiastka w 41+1 Hbd przyjęta na oddział patologii ciąży ze skierowaniem do indukcji porodu (ciąża po terminie, bez powikłań, bez przebytych operacji na macicy). Płyn owodniowy w USG prawidłowy (MVP 4.2 cm), EFW 3650 g, położenie podłużne główkowe.',
        task: 'Zbierz wywiad kwalifikacyjny (wyklucz przeciwwskazania do porodu drogami natury), oceń zapis KTG, wylicz punktację w skali Bishopa i dobierz bezpieczną metodę preindukcji/indukcji.'
      },
      scale: {
        id: 'bishop_score_osce',
        name: 'Skala Bishopa (dojrzałość szyjki macicy — max 13 pkt)',
        maxScore: 13,
        unit: 'pkt',
        items: [
          {
            id: 'rozwarcie',
            label: 'Rozwarcie ujścia (0=zamknięte, 1=1–2 cm, 2=3–4 cm, 3=≥5 cm)',
            triggerManeuvers: ['m_badanie_bishop'],
            score: 1, maxItemScore: 3,
            findingVal: 'Rozwarcie 1 cm (na opuszkę palca) — 1 pkt',
            normVal: 'Nie oceniono'
          },
          {
            id: 'skrocenie',
            label: 'Skrócenie części pochwowej (0=0–30%, 1=40–50%, 2=60–70%, 3=≥80%)',
            triggerManeuvers: ['m_badanie_bishop'],
            score: 1, maxItemScore: 3,
            findingVal: 'Skrócenie ~40% (szyjka długości ok. 2 cm) — 1 pkt',
            normVal: 'Nie oceniono'
          },
          {
            id: 'konsystencja',
            label: 'Konsystencja szyjki (0=twarda, 1=średnia, 2=miękka)',
            triggerManeuvers: ['m_badanie_bishop'],
            score: 1, maxItemScore: 2,
            findingVal: 'Konsystencja średnia — 1 pkt',
            normVal: 'Nie oceniono'
          },
          {
            id: 'polozenie_szyjki',
            label: 'Położenie szyjki (0=do tyłu, 1=w osi, 2=do przodu)',
            triggerManeuvers: ['m_badanie_bishop'],
            score: 0, maxItemScore: 2,
            findingVal: 'Skierowana ku kości krzyżowej (do tyłu) — 0 pkt',
            normVal: 'Nie oceniono'
          },
          {
            id: 'wysokosc_glowki',
            label: 'Położenie główki względem linii międzykolcowej (0=-3, 1=-2, 2=-1/0, 3=+1/+2)',
            triggerManeuvers: ['m_badanie_bishop'],
            score: 1, maxItemScore: 3,
            findingVal: 'Główka na poziomie -2 (balotuje nad wchodem) — 1 pkt',
            normVal: 'Nie oceniono'
          }
        ],
        interpretations: [
          { max: 5, label: 'Szyjka niedojrzała (≤5 pkt — tu 4 pkt!)', color: 'var(--amber)', tip: 'Wskazana PREINDUKCJA (cewnik Foleya / prostaglandyny PGE2 lub misoprostol) przed oksytocyną!' },
          { max: 7, label: 'Szyjka pośrednia (6–7 pkt)', color: 'var(--blue)', tip: 'Decyzja indywidualna (preindukcja lub oksytocyna).' },
          { max: 13, label: 'Szyjka dojrzała (≥8 pkt)', color: 'var(--green)', tip: 'Bezpośrednia indukcja oksytocyną / amniotomią.' }
        ]
      },
      interview: [
        { q: 'Czy termin porodu był zweryfikowany badaniem USG w I trymestrze (CRL 11–13+6 Hbd)?', a: 'Tak, termin wg USG z 12. tygodnia zgadza się co do dnia z ostatnią miesiączką — dziś jest dokładnie 41+1 Hbd.', isKey: true },
        { q: 'Czy przebyła Pani kiedykolwiek operacje na macicy (cięcie cesarskie, wyłuszczenie mięśniaków)?', a: 'Nie, nigdy nie miałam żadnych operacji ginekologicznych ani cięcia cesarskiego.', isKey: true },
        { q: 'Jak odczuwa Pani ruchy dziecka dzisiaj i jaki był wynik GBS?', a: 'Ruchy czuję prawidłowo, co najmniej kilkanaście razy od rana. Posiew GBS był ujemny.', isKey: true }
      ],
      zones: [
        {
          id: 'ktg_ocena',
          name: 'Zapis KTG przed kwalifikacją (30 min)',
          icon: 'KTG',
          x: 48, y: 48,
          maneuvers: [
            { id: 'm_ktg_przed', label: 'Zinterpretuj 30-minutowy zapis KTG wg FIGO 2015', isKey: true, isFatal: false, finding: 'KTG prawidłowe (Norma FIGO 2015): linia podstawowa 138/min, zmienność 10–15/min, obecne 3 akceleracje, brak deceleracji, brak regularnych skurczów.', reaction: 'normal' }
          ]
        },
        {
          id: 'badanie_wew_bishop',
          name: 'Badanie położnicze (Skala Bishopa)',
          icon: 'BSH',
          x: 48, y: 65,
          maneuvers: [
            { id: 'm_badanie_bishop', label: 'Oceń szyjkę macicy i główkę w skali Bishopa', isKey: true, isFatal: false, finding: 'Szyjka skierowana do tyłu (0), konsystencja średnia (1), skrócona w 40% (1), rozwarcie 1 cm (1), główka na -2 (1). SUMA = 4 punkty (szyjka niedojrzała!).', reaction: 'normal' },
            {
              id: 'm_amniotomia_fatal',
              label: 'Wykonaj natychmiast amniotomię (przebicie pęcherza) przy główce na -2 i szyjce 1 cm + wysoka dawka oksytocyny',
              isKey: false,
              isFatal: true,
              fatalMessage: 'BŁĄD KRYTYCZNY! Amniotomia przy wysoko stojącej, nieustalonej główce (-2) spowodowała WYPADNIĘCIE PĘPOWINY i gwałtowną bradykardię płodu (FHR 72/min)! Wymaga natychmiastowego uniesienia główki i cięcia cesarskiego w trybie ratunkowym!',
              complicationVitals: { hr: 110, rr: 22, bp: '125/80', fhr: '72/min', spo2: '98%' },
              finding: 'Po odpłynięciu płynu w pochwie wyczuwalna tętniąca pętla pępowiny, FHR spada do 72/min! Ręka w pochwie odpycha główkę ku górze i natychmiastowy transport na salę CC!',
              reaction: 'crisis'
            }
          ]
        }
      ],
      synthesis: {
        questionDiagnostic: 'Wynik w skali Bishopa wynosi 4 pkt, KTG jest prawidłowe, brak blizny na macicy. Jakie jest właściwe postępowanie wg PTGiP?',
        optionsDiagnostic: [
          { id: 'd1', label: 'Preindukcja porodu (cewnik Foleya 18–22 Fr do kanału szyjki lub prostaglandyna PGE2 / misoprostol dopochwowo/doustnie) przed włączeniem oksytocyny', isCorrect: true, explanation: 'Przy niedojrzałej szyjce (Bishop ≤5 pkt) bezpośrednie podanie oksytocyny wiąże się z wysokim odsetkiem niepowodzeń i CC. Złotym standardem jest preindukcja mechaniczna (cewnik Foleya) lub farmakologiczna (prostaglandyny).' },
          { id: 'd2', label: 'Natychmiastowe cięcie cesarskie wyłącznie z powodu 41+1 Hbd', isCorrect: false, explanation: 'Sama ciąża w 41+1 Hbd przy prawidłowym KTG, AFI i położeniu główkowym jest wskazaniem do preindukcji/indukcji, a nie elektywnego CC.' },
          { id: 'd3', label: 'Wypis do domu i ponowna wizyta za 2 tygodnie (w 43+1 Hbd)', isCorrect: false, explanation: 'Przenoszenie ciąży >42+0 Hbd skokowo podnosi ryzyko niewydolności łożyska, zespołu aspiracji smółki i zgonu wewnątrzmacicznego.' }
        ],
        differentialOptions: [
          { id: 'diff1', label: 'Cewnik Foleya (preindukcja mechaniczna — najniższe ryzyko tachysystole, bezpieczny też po CC!)', isCorrect: true },
          { id: 'diff2', label: 'Dinoproston (PGE2) żel/wkładka lub Misoprostol (PGE1) — tylko przy braku blizny po CC', isCorrect: true },
          { id: 'diff3', label: 'Amniotomia przy główce balotującej na -2', isCorrect: false }
        ],
        actionOptions: [
          { id: 'act1', label: 'Założenie cewnika Foleya (balon 30–60 ml ponad ujście wewnętrzne) lub podanie PGE2 i kontrolne KTG', isCorrect: true },
          { id: 'act2', label: 'Ponowna ocena w skali Bishopa po 12–24 h (po wypadnięciu cewnika) i dopiero wtedy ewentualna oksytocyna', isCorrect: true },
          { id: 'act3', label: 'Uzyskanie świadomej pisemnej zgody pacjentki na preindukcję i indukcję porodu', isCorrect: true }
        ]
      },
      statusPraesens: {
        title: 'Status Obstetricus: Pierwiastka 41+1 Hbd — kwalifikacja do preindukcji porodu',
        sections: [
          { num: '1', title: 'Stan ogólny i wywiad', content: 'Ciężarna 31 lat (G1P0, 41+1 Hbd potwierdzone USG I trymestru), bez operacji macicy w wywiadzie, GBS(-). RR 122/78 mmHg, HR 80/min.' },
          { num: '2', title: 'KTG i USG przed indukcją', content: 'Zapis KTG 30 min — Norma wg FIGO 2015 (FHR 138/min, zmienność 10–15/min, akceleracje obecne, brak deceleracji). USG: położenie podłużne główkowe, MVP 4.2 cm (prawidłowy), EFW 3650 g.' },
          { num: '3', title: 'Ocena szyjki (Skala Bishopa)', content: 'Rozwarcie 1 cm (1 pkt), skrócenie 40% (1 pkt), konsystencja średnia (1 pkt), położenie do tyłu (0 pkt), główka na -2 (1 pkt). Razem: 4/13 pkt — szyjka niedojrzała.' }
        ],
        conclusions: 'Kwalifikacja do preindukcji porodu (Bishop 4 pkt): cewnik Foleya lub prostaglandyna PGE2 (po uzyskaniu zgody), kontrolne KTG, ponowna ocena Bishopa po 12–24 h przed włączeniem oksytocyny.'
      }
    }
  ];

  /* Mapy pomocnicze i zwrotne powiązania (BACKLINKS) wyliczane z WIKILINKS */
  const modById = Object.fromEntries(MODS.map(m => [m.id, m]));
  const atById = Object.fromEntries(ATLASES.map(a => [a.id, a]));

  const BACKLINKS = {};
  MODS.forEach(m => { BACKLINKS[m.id] = []; });
  Object.entries(WIKILINKS).forEach(([srcId, links]) => {
    links.forEach(l => {
      if (BACKLINKS[l.target]) {
        BACKLINKS[l.target].push({
          source: srcId,
          label: l.label,
          type: l.type,
          concept: l.concept,
          atlas: l.atlas || (modById[srcId] ? modById[srcId].at : null),
          sec: l.sec || (modById[srcId] ? modById[srcId].a : null)
        });
      }
    });
  });

  return {
    GROUPS,
    MODS,
    ATLASES,
    TRAPS,
    CONF,
    BANKS,
    WIKILINKS,
    BACKLINKS,
    SEMANTIC_GAPS,
    SYMPTOM_CLUSTERS,
    PREGNANCY_CALENDAR,
    PREGNANCY_VACCINES,
    OB_DRUG_DATABASE,
    PRESCRIPTION_CHALLENGES,
    CTG_CASES,
    USG_TRAINER_CASES,
    BETHESDA_DATABASE,
    BETHESDA_PUZZLES,
    OSCE_STATIONS,
    modById,
    atById
  };
})();
