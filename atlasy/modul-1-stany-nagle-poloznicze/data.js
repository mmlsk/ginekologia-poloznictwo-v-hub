/* Dane merytoryczne dla Atlasu 1: Stany nagłe w położnictwie i ginekologii [1][2][3] */

const T4_DATA = {
  tone: {
    pct: '~70%',
    title: 'Tone — Atonia macicy',
    sub: 'Najczęstsza przyczyna PPH',
    badge: 'Najczęstsza (70%)',
    badgeCls: 'r',
    clues: [
      'Macica miękka, wiotka, dno wysoko nad pępkiem („ciastowata”), obfite krwawienie ze skrzepami.',
      'Czynniki ryzyka: wielowodzie, ciąża wielopłodowa, makrosomia, przedłużony/indukowany poród oksytocyną, wielorództwo, zapalenie błon płodowych, tokoliza.'
    ],
    actions: [
      'Natychmiastowy masaż dna macicy + dwuręczny ucisk macicy + opróżnienie pęcherza (cewnik Foleya).',
      'I rzut: Oksytocyna 5 j.m. i.v. powoli + wlew 20–40 j.m. w 500–1000 ml 0,9% NaCl (lub karbetocyna 100 µg i.v. profilaktycznie/terapeutycznie).',
      'Kwas traneksamowy (TXA) 1 g i.v. w 10 min w ciągu 3 h od porodu (powtórz 1 g, jeśli krwawienie trwa >30 min).',
      'II rzut: Metyloergometryna 0,2 mg i.m. (BEZWZGLĘDNIE P/W w nadciśnieniu i preeklampsji!), karboprost 250 µg i.m. (P/W w astmie) lub mizoprostol 800 µg p.r./s.l.',
      'Mechanicznie/operacyjnie: tamponada balonowa (cewnik Bakri), szwy kompresyjne (B-Lynch), podwiązanie/embolizacja tętnic macicznych, histerektomia ostatecznością.'
    ],
    pearl: 'W atonii macicy u pacjentki z preeklampsją lub nadciśnieniem NIGDY nie podawaj metyloergometryny (ryzyko przełomu nadciśnieniowego i udaru).'
  },
  trauma: {
    pct: '~20%',
    title: 'Trauma — Urazy kanału rodnego',
    sub: 'Szyjka, pochwa, krocze, pęknięcie macicy',
    badge: '20% przypadków',
    badgeCls: 'a',
    clues: [
      'Macica dobrze obkurczona i twarda, a mimo to utrzymuje się żywoczerwone krwawienie z dróg rodnych.',
      'Obejmuje: pęknięcie szyjki macicy, ścian pochwy, krocza III/IV°, krwiaki pochwy/przestrzeni zaotrzewnowej, wynicowanie macicy oraz pęknięcie macicy (zwłaszcza po cięciu cesarskim).'
    ],
    actions: [
      'Natychmiastowa kontrola kanału rodnego we wziernikach w dobrym oświetleniu — uwidocznienie całej szyjki i sklepień pochwy.',
      'Pilne zaopatrzenie chirurgiczne krwawiących pęknięć (szew ciągły od szczytu pęknięcia).',
      'Podejrzenie wynicowania macicy: natychmiastowa ręczna repozycja (manewr Johnsona) bez odklejania łożyska przed odprowadzeniem, ew. tokoliza (nitrogliceryna).',
      'Podejrzenie pęknięcia macicy (ból, wstrząs, zanik skurczów, wyczuwalne części płodu): natychmiastowa laparotomia.'
    ],
    pearl: 'Twarda, dobrze obkurczona macica przy trwającym jasnoczerwonym krwawieniu = natychmiast oglądaj szyjkę i pochwę we wziernikach!'
  },
  tissue: {
    pct: '~10%',
    title: 'Tissue — Resztki łożyskowe i PAS',
    sub: 'Zatrzymany popłód, łożysko przyrośnięte',
    badge: '10% przypadków',
    badgeCls: 'b',
    clues: [
      'Brak wydalenia łożyska >30 min od porodu lub stwierdzenie ubytku w kotyledonach / przerwanych naczyń na krawędzi błon (płat dodatkowy).',
      'Spektrum łożyska przyrośniętego (PAS: accreta, increta, percreta) — główne ryzyko: przodujące łożysko na bliźnie po poprzednim CC.'
    ],
    actions: [
      'Dokładna ocena kompletności popłodu po każdym porodzie; przy wątpliwościach USG przyłóżkowe.',
      'Ręczne wydobycie łożyska lub rewizja jamy macicy w znieczuleniu ogólnym/przewodowym + profilaktyka antybiotykowa.',
      'Delikatne wyłyżeczkowanie tępą łyżką (Bumma) — ostrożnie, bo ciężarna ściana macicy łatwo ulega perforacji.',
      'Przy rozpoznaniu PAS nie szarp za pępowinę ani nie odklejaj na siłę — planowa/pilna operacja wielospecjalistyczna (często histerektomia okołoporodowa).'
    ],
    pearl: 'Jeśli łożysko nie oddziela się przy braku płaszczyzny rozwarstwienia u pacjentki po CC z łożyskiem przodującym, myśl o PAS — siłowe odklejanie wywoła masywny krwotok.'
  },
  thrombin: {
    pct: '~1%',
    title: 'Thrombin — Zaburzenia krzepnięcia',
    sub: 'DIC, wrodzone skazy, antykoagulanty',
    badge: '1% — wysoka śmiertelność',
    badgeCls: 'v',
    clues: [
      'Krew nie tworzy skrzepów, sączenie z miejsc wkłuć i ran; rozwija się wtórnie do masywnej utraty krwi lub pierwotnie w oddzieleniu łożyska, zatorze płynem owodniowym, ciężkiej preeklampsji/HELLP, sepsie, obumarciu płodu.',
      'Fibrynogen w ciąży wynosi prawidłowo 4–6 g/l — spadek poniżej 2 g/l to już ciężka koagulopatia!'
    ],
    actions: [
      'Natychmiast oznacz: morfologię, APTT, PT/INR, fibrynogen (metodą Claussa) oraz ROTEM/TEG jeśli dostępne.',
      'Kwas traneksamowy (TXA) 1 g i.v. jak najwcześniej (<3 h od porodu).',
      'Suplementacja fibrynogenu przy stężeniu <2,0 g/l (koncentrat fibrynogenu 2–4 g lub krioprecypitat).',
      'Protokół masywnej transfuzji (KKCz : FFP : KKP = 1:1:1), utrzymuj PLT >50–75 G/l, Hb >7–8 g/dl, Ca²⁺ zjonizowany >1,0 mmol/l i normotermię (>36 °C).'
    ],
    pearl: 'Krytyczna pułapka: norma fibrynogenu u ciężarnej to 4–6 g/l (nie 2 g/l jak poza ciążą). Fibrynogen <2 g/l w PPH ma niemal 100% wartość predykcyjną dla ciężkiego krwotoku.'
  }
};

const SI_TABLE = [
  ['< 0,9', 'Norma położnicza', 'g', 'Fizjologiczna adaptacja ciąży; standardowy nadzór parametrów życiowych i ocena objętości krwawienia.'],
  ['0,9 – 1,1', 'Sygnał ostrzegawczy', 'a', 'Wczesna hipowolemia (często mimo prawidłowego RR!). Załóż 2 szerokie wkłucia (14–16G), pobierz krzyżówkę, krystaloidy, oceń 4T.'],
  ['1,2 – 1,6', 'Wstrząs krwotoczny', 'r', 'Utrata ~30% objętości krwi. Aktywuj protokół PPH, TXA 1 g i.v., zamów KKCz/FFP/fibrynogen, wezwij anestezjologa i zespół operacyjny.'],
  ['≥ 1,7', 'Krytyczny wstrząs', 'r', 'Utrata >40% krwi — bezpośrednie zagrożenie NZK. Natychmiastowa transfuzja 0 Rh(-) / 1:1:1 i pilna interwencja hemostatyczna.']
];

const PLACENTA_CMP = [
  ['Ból brzucha', 'BRAK — krwawienie bezbolesne', 'SILNY, nagły, stały ból brzucha / okolicy krzyżowej'],
  ['Charakter krwi', 'Jasnoczerwona, świeża, często nawracające krwawienia ostrzegawcze', 'Ciemnoczerwona (często ze skrzepami); uwaga: do 20% krwawień jest utajonych (krwiak pozałożyskowy)!'],
  ['Napięcie macicy', 'Macica miękka, niebolesna, bez nadmiernych skurczów', 'Macica twarda, deskowata („tetaniczny” skurcz), bolesna palpacyjnie; dno może rosnąć'],
  ['Stan płodu (KTG)', 'Początkowo zwykle prawidłowy (dopóki matka nie jest we wstrząsie)', 'Szybka, ciężka bradykardia / deceleracje późne lub obumarcie płodu'],
  ['Korelacja wstrząsu z widoczną krwią', 'Stan matki proporcjonalny do widocznej utraty krwi', 'Wstrząs często NIEPROPORCJONALNIE cięższy niż widoczne krwawienie (krew w krwiaku za łożyskiem)'],
  ['Ryzyko DIC', 'Rzadkie (wtórne dopiero przy masywnym krwotoku)', 'WYSOKIE i wczesne (uwolnienie tromboplastyny tkankowej → zużycie fibrynogenu)'],
  ['Główne czynniki ryzyka', 'Przebyte CC / zabiegi na macicy, wielorództwo, ciąża mnoga, palenie tytoniu', 'Nadciśnienie / preeklampsja, uraz brzucha, kokaina, palenie, PROM, przebyte oddzielenie'],
  ['Badanie i postępowanie', 'USG przezbrzuszne/przezpochwowe (delikatne). ZAKAZ badania dwuręcznego przed USG! Planowe lub pilne CC.', 'Rozpoznanie KLINICZNE (prawidłowe USG nie wyklucza!). Resuscytacja, ocena krzepnięcia, pilne CC przy żywym płodzie lub niestabilności.']
];

const DOSES = [
  { grp: 'Krwotok poporodowy (PPH)' },
  ['Oksytocyna', '5 j.m. i.v. + wlew 20–40 j.m./500 ml', 'I rzut w atonii macicy. Podawaj powoli (szybki bolus grozi hipotensją i tachykardią).'],
  ['Karbetocyna', '100 µg i.v. (1× w 1 min)', 'Długodziałający analog oksytocyny; głównie profilaktyka PPH przy CC i czynnikach ryzyka.'],
  ['Kwas traneksamowy (TXA)', '1 g i.v. w 10 min (<3 h)', 'Badanie WOMAN: zmniejsza śmiertelność z wykrwawienia. Powtórz 1 g po 30 min, jeśli krwawienie trwa.'],
  ['Metyloergometryna', '0,2 mg i.m. (co 2–4 h)', 'II rzut w atonii. BEZWZGLĘDNIE P/W w nadciśnieniu tętniczym i preeklampsji!'],
  ['Mizoprostol', '800 µg p.r. lub s.l.', 'Alternatywa/uzupełnienie (analog PGE1); częsta gorączka i dreszcze po podaniu.'],
  { grp: 'Preeklampsja i rzucawka' },
  ['Siarczan magnezu (MgSO₄)', '4–6 g i.v. (15–20 min), potem 1–2 g/h', 'Lek z wyboru w profilaktyce i leczeniu drgawek rzucawkowych (nie jest lekiem hipotensyjnym!).'],
  ['Glukonian wapnia 10%', '1 g (10 ml) i.v. powoli (3–5 min)', 'ANTIDOTUM w zatruciu MgSO₄ (zniesienie odruchów kolanowych, RR <12/min, zaburzenia rytmu).'],
  ['Labetalol', '20 mg i.v., potem 40 → 80 mg co 10–15 min', 'Lek I rzutu w ciężkim NT w ciąży (≥160/110 mmHg). Maks. 300 mg. P/W: astma, bradykardia.'],
  ['Nifedypina (krótkodziałająca)', '10–20 mg p.o. (powtórz po 20–30 min)', 'Alternatywa I rzutu p.o. w ciężkim NT, gdy brak dostępu i.v. (nie podawać podjęzykowo!).'],
  ['Metyldopa', '250–500 mg p.o. 2–4×/d', 'Leczenie przewlekłe łagodnego/umiarkowanego NT w ciąży; zbyt wolny początek w stanie nagłym.'],
  { grp: 'Ciąża ektopowa i profilaktyka RhD' },
  ['Metotreksat (MTX)', '50 mg/m² i.m. (schemat 1-dawkowy)', 'Tylko stabilna, niepęknięta ciąża ektopowa (bez FHR, β-hCG zwykle <5000 IU/l). Kontrola β-hCG dzień 4. i 7.'],
  ['Immunoglobulina anty-D', '50–300 µg i.m. (do 72 h)', 'U każdej pacjentki RhD(-) po krwawieniu w ciąży, ciąży ektopowej, poronieniu lub urazie brzucha.']
];

const GAP = [
  [
    'Definicja preeklampsji (wymóg białkomoczu)',
    'Starsze podręczniki i część pytań zakładowych definiowały preeklampsję jako klasyczną triadę: nadciśnienie ≥140/90 mmHg + OBOWIĄZKOWY białkomocz ≥300 mg/24 h (dawniej także obrzęki).',
    'PTGiP / ISSHP / ACOG: białkomocz NIE jest konieczny do rozpoznania. Wystarczy NT po 20. t.c. + dowolna dysfunkcja narządowa (PLT <100 G/l, kreatynina >1,1 mg/dl, AST/ALT ≥2× GGN, obrzęk płuc, objawy OUN/wzrokowe lub FGR).'
  ],
  [
    'Definicja objętościowa krwotoku poporodowego (PPH)',
    'Klasyczny podział egzaminacyjny (WHO/PTGiP): utrata krwi ≥500 ml po porodzie drogami natury i ≥1000 ml po cięciu cesarskim.',
    'ACOG (reVITALize): ≥1000 ml (lub każda utrata z objawami hipowolemii w 24 h) niezależnie od drogi porodu; WHO/FIGO/PTGiP utrzymują próg alarmowy ≥500 ml po PSN, a Shock Index ≥0,9 przyspiesza interwencję niezależnie od szacowanej objętości.'
  ],
  [
    'Czas rozwiązania ciąży w rzucawce',
    'Potoczne/uproszczone hasło testowe: „rzucawka = natychmiastowe cięcie cesarskie w trybie pilnym”.',
    'PTGiP / RCOG / ACOG: NIGDY nie operuj w trakcie napadu ani u niestabilnej matki. Najpierw stabilizacja (drożność dróg oddechowych, MgSO₄ i.v., obniżenie RR <160/110), dopiero po opanowaniu drgawek i wyrównaniu stanu matki rozwiązanie ciąży (nie zawsze CC).'
  ],
  [
    'Skręt przydatków — ocena żywotności jajnika',
    'Historyczna zasada chirurgiczna: sinoczarny, obrzęknięty jajnik po skręcie należy usunąć (adneksektomia) ze względu na rzekome ryzyko zatorowości po detorsji.',
    'Aktualne wytyczne (ACOG / PTGiP): makroskopowy wygląd nie koreluje z martwicą! U kobiet w wieku rozrodczym wykonuje się detorsję i pozostawia jajnik (odzyskuje funkcję w >90% przypadków); nie zwiększa to ryzyka zatorowości.'
  ],
  [
    'Kwas traneksamowy (TXA) w PPH',
    'W starszych algorytmach PPH wymieniano wyłącznie uterotoniki i interwencje mechaniczne bez leku antyfibrynolitycznego.',
    'Po badaniu WOMAN (WHO / FIGO / PTGiP): TXA 1 g i.v. jest obowiązkowym elementem wczesnego leczenia każdego PPH niezależnie od przyczyny — podaj w ciągu 3 godzin od porodu.'
  ]
];

const TOPICS = {
  pph: 'Krwotok poporodowy (PPH)',
  lozysko: 'Łożysko przodujące / oddzielenie',
  preeklampsja: 'Preeklampsja / rzucawka / MgSO₄',
  ektopowa: 'Ciąża ektopowa',
  skret: 'Skręt przydatków'
};

const Q = [
  {
    n: 1,
    t: 'pph',
    c: 'src',
    s: 'Moduł [1] · PTGiP / WOMAN',
    stem: 'U 29-letniej pacjentki z ciężką preeklampsją 15 minut po porodzie drogami natury wystąpiło obfite krwawienie ze skrzepami (szacowana utrata ~850 ml, HR 118/min, RR 154/96 mmHg). Dno macicy jest miękkie i sięga 2 palce powyżej pępka. Wdrożono masaż macicy, cewnikowanie pęcherza i wlew oksytocyny. Które postępowanie jest PRAWIDŁOWE w kolejnym kroku?',
    o: [
      'Podanie kwasu traneksamowego 1 g i.v. oraz mizoprostolu 800 µg p.r./s.l. (przy unikaniu metyloergometryny z uwagi na nadciśnienie)',
      'Natychmiastowe podanie metyloergometryny 0,2 mg i.v. jako leku z wyboru w atonii macicy',
      'Wstrzymanie leczenia farmakologicznego i obserwacja, ponieważ w definicji ACOG próg PPH wynosi 1000 ml',
      'Odroczenie kwasu traneksamowego do czasu uzyskania wyniku fibrynogenu i APTT z laboratorium'
    ],
    k: 0,
    why: 'Miękka, wysoko położona macica wskazuje na atonię (Tone — 70% PPH). U pacjentki z nadciśnieniem/preeklampsją metyloergometryna jest bezwzględnie przeciwwskazana (ryzyko przełomu nadciśnieniowego, krwotoku śródmózgowego i rzucawki). Kwas traneksamowy (1 g i.v. w <3 h od porodu) należy podać wcześnie bez czekania na koagulogram, a z uterotoników II rzutu bezpieczny jest mizoprostol (lub karboprost przy braku astmy).',
    tip: 'Hasło-pułapka: atonia + nadciśnienie = ZAKAZ metyloergometryny; atonia + astma = ZAKAZ karboprostu (PGF2α).',
    gap: {
      pool: 'W części pytań próg PPH po PSN to ≥500 ml, a starsze klucze pomijają TXA.',
      now: 'WHO/PTGiP: interwencja już przy ≥500 ml po PSN lub objawach hipowolemii; TXA 1 g i.v. w pierwszych 3 h jest standardem w każdym PPH.'
    }
  },
  {
    n: 2,
    t: 'lozysko',
    c: 'src',
    s: 'Moduł [1] · Stany nagłe',
    stem: 'Ciężarna w 33. t.c. (G2P1, po jednym cięciu cesarskim) zgłasza się na Izbę Przyjęć z powodu nagłego, bezbolesnego krwawienia jasnoczerwoną krwią z dróg rodnych. Macica jest miękka, niebolesna, w KTG czynność serca płodu 142/min z zachowaną zmiennością, RR 115/70 mmHg, HR 86/min. Jakie jest NAJWAŻNIEJSZE pierwsze badanie diagnostyczne przed jakąkolwiek oceną szyjki macicy?',
    o: [
      'Badanie USG (przezbrzuszne/delikatne przezpochwowe) w celu wykluczenia łożyska przodującego — bezwzględny zakaz badania dwuręcznego',
      'Badanie dwuręczne przez pochwę w celu oceny rozwarcia i skrócenia szyjki w skali Bishopa',
      'Założenie cewnika Foleya do kanału szyjki w celu zatamowania krwawienia',
      'Test Kleihauera–Betkego jako warunek podjęcia decyzji o hospitalizacji'
    ],
    k: 0,
    why: 'Bezbolesne krwawienie jasnoczerwoną krwią w III trymestrze przy miękkiej macicy i prawidłowym KTG (szczególnie po poprzednim CC) to klasyczny obraz łożyska przodującego (placenta praevia). Badanie palpacyjne/dwuręczne przez pochwę może oderwać kosmki nad ujściem wewnętrznym i wywołać śmiertelny krwotok — jest BEZWZGLĘDNIE przeciwwskazane przed wykluczeniem łożyska przodującego w USG.',
    tip: 'Zawsze najpierw USG! Dopiero po wykluczeniu łożyska przodującego (i vasa praevia) wolno wykonać badanie wewnętrzne.'
  },
  {
    n: 3,
    t: 'preeklampsja',
    c: 'src',
    s: 'Moduł [2] · Rzucawka / MgSO₄',
    stem: 'Pacjentka w 35. t.c. z ciężką preeklampsją otrzymuje ciągły wlew dożylny siarczanu magnezu (MgSO₄ 2 g/h) w profilaktyce rzucawki. Podczas kontroli położna stwierdza obustronny brak odruchów kolanowych, senność, częstość oddechów 9/min oraz diurezę 15 ml w ciągu ostatniej godziny. Co należy wykonać NATYCHMIAST?',
    o: [
      'Zatrzymać wlew MgSO₄, podać tlen i podać dożylnie glukonian wapnia 10% 1 g (10 ml) powoli w ciągu 3–5 minut',
      'Zmniejszyć wlew MgSO₄ do 1 g/h i poczekać na wynik stężenia magnezu w surowicy',
      'Podać diazepam 10 mg i.v. w obawie przed zbliżającym się napadem rzucawki',
      'Podać furosemid 40 mg i.v. i kontynuować wlew MgSO₄ ze względu na ryzyko drgawek'
    ],
    k: 0,
    why: 'Zniesienie odruchów głębokich (kolanowych) i spadek częstości oddechów <12/min przy oligurii (<25–30 ml/h, bo MgSO₄ wydalany jest nerkowo!) to jawne objawy toksyczności magnezu grożące zatrzymaniem oddechu i krążenia. Postępowanie: natychmiast przerwać wlew MgSO₄, zabezpieczyć oddech/tlen i podać antidotum — 10% glukonian wapnia 10 ml (1 g) i.v. powoli (bez czekania na wynik laboratoryjny!).',
    tip: 'Triada monitorowania MgSO₄: odruch kolanowy obecny + oddechy ≥12–16/min + diureza ≥25–30 ml/h.',
    gap: {
      pool: 'W starszych pytaniach bywa mylone stężenie terapeutyczne magnezu (4–7 mEq/l) z koniecznością rutynowego oznaczania poziomu we krwi.',
      now: 'Kliniczna obserwacja (odruchy, oddech, diureza) ma pierwszeństwo; przy objawach toksyczności podaje się glukonian wapnia natychmiast, nie czekając na laboratorium.'
    }
  },
  {
    n: 4,
    t: 'ektopowa',
    c: 'src',
    s: 'Moduł [3] · Ciąża ektopowa',
    stem: '27-letnia pacjentka (ostatnia miesiączka 7 tygodni temu, dodatni test ciążowy) została przywieziona po zasłabnięciu. Skarży się na silny ból podbrzusza promieniujący do prawego barku. RR 78/48 mmHg, HR 128/min, brzuch bolesny z obroną mięśniową. W przyłóżkowym USG jama macicy jest pusta, a w zatoce Douglasa i zachyłku Morisona obecna jest duża ilość wolnego płynu. Jakie postępowanie jest właściwe?',
    o: [
      'Resuscytacja płynowo-krwiolecznicza i natychmiastowe leczenie operacyjne (laparoskopia lub laparotomia)',
      'Podanie jednorazowej dawki metotreksatu 50 mg/m² i.m. i kontrola β-hCG za 48 godzin',
      'Postępowanie wyczekujące i powtórzenie oznaczenia β-hCG w 4. i 7. dobie',
      'Wyłyżeczkowanie jamy macicy w celu potwierdzenia braku kosmków łożyskowych'
    ],
    k: 0,
    why: 'Wstrząs hipowolemiczny (SI = 128/78 = 1,64), objaw Kehra (ból promieniujący do barku z podrażnienia przepony krwią), obrona mięśniowa i wolny płyn w jamie otrzewnej przy pustej jamie macicy to pęknięta ciąża ektopowa z krwotokiem do jamy otrzewnej. Niestabilność hemodynamiczna jest BEZWZGLĘDNYM przeciwwskazaniem do metotreksatu — wymaga pilnego zabiegu operacyjnego i resuscytacji.',
    tip: 'Metotreksat = TYLKO pacjentka stabilna hemodynamicznie, bez pęknięcia, bez FHR i z kontrolowanym β-hCG.'
  },
  {
    n: 5,
    t: 'skret',
    c: 'inf',
    s: 'Moduł [3] · Skręt przydatków',
    stem: '22-letnia nieródka zgłasza się z powodu nagłego, bardzo silnego bólu w prawym dole biodrowym z towarzyszącymi nudnościami i wymiotami, bez gorączki; β-hCG ujemne. W USG TV widoczny powiększony, obrzęknięty prawy jajnik z torbielą skórzastą 6,5 cm oraz zachowany śladowy przepływ tętniczy w badaniu kolorowym Dopplerem. Jakie jest prawidłowe postępowanie?',
    o: [
      'Pilna laparoskopia diagnostyczno-terapeutyczna z detorsją przydatków i oszczędzeniem jajnika (ew. cystektomią)',
      'Wykluczenie skrętu na podstawie zachowanego przepływu tętniczego w Dopplerze i wypis z lekami przeciwbólowymi',
      'Planowa adneksektomia po 48-godzinnej antybiotykoterapii dożylnej',
      'Przeprowadzenie przezskórnej punkcji torbieli pod kontrolą USG zamiast zabiegu operacyjnego'
    ],
    k: 0,
    why: 'Skręt przydatków (torsio adnexorum) jest rozpoznaniem klinicznym potwierdzanym operacyjnie. Ze względu na podwójne unaczynienie jajnika (tętnica jajnikowa i gałąź jajnikowa tętnicy macicznej) prawidłowy lub szczątkowy przepływ tętniczy w Dopplerze NIE wyklucza skrętu (czułość Dopplera jest ograniczona). Pilna laparoskopia z odkręceniem (detorsją) pozwala uratować jajnik nawet gdy śródoperacyjnie wygląda na sinoczarny.',
    tip: 'Dwie złote zasady skrętu: (1) zachowany Doppler NIE wyklucza skrętu; (2) u młodych kobiet wykonujemy detorsję i oszczędzamy jajnik.',
    gap: {
      pool: 'W dawnych kluczach sinoczerwony/ciemny wygląd jajnika był wskazaniem do usunięcia przydatków (adneksektomii).',
      now: 'ACOG / PTGiP: rutynowa detorsja i zachowanie jajnika u pacjentek w wieku rozrodczym — tkanka jajnikowa zachowuje żywotność w >90% przypadków.'
    }
  }
];

const SOURCES = [
  ['PTGiP — Rekomendacje postępowania w krwotoku poporodowym (PPH)', 'Wytyczne Polskiego Towarzystwa Ginekologów i Położników'],
  ['PTGiP — Postępowanie w nadciśnieniu tętniczym w ciąży, preeklampsji i rzucawce', 'PTGiP / PTNT / PTK'],
  ['WHO / WOMAN Trial Collaborators — Early administration of tranexamic acid in PPH', 'Lancet 2017; WHO PPH Roadmap'],
  ['ACOG Practice Bulletin — Postpartum Hemorrhage, Gestational Hypertension & Preeclampsia, Adnexal Torsion', 'ACOG Clinical Guidance'],
  ['RCOG Green-top Guidelines — Placenta Praevia & Accreta, Antepartum Haemorrhage, Ectopic Pregnancy', 'Royal College of Obstetricians and Gynaecologists']
];
