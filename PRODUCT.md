# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Statyczna aplikacja PWA (czysty HTML, CSS i vanilla JS bez kroku build), gotowa do hostowania na GitHub Pages (`.github/workflows/deploy.yml`) oraz pracy offline (`sw.js`, `manifest.webmanifest`) z testami jednostkowymi logiki domenowej w `node --test`.

## Users

- **Obecni użytkownicy:** prywatne narzędzie edukacyjne autora oraz zamknięte grono testerów.
- **Docelowi użytkownicy:** studenci V roku medycyny przygotowujący się do kolokwiów, OSCE i egzaminu z ginekologii i położnictwa (Polska, standardy PTGiP/FIGO/ACOG) na komputerze, iPadzie i iPhonie, również bez dostępu do sieci (offline PWA).
- **Zadanie użytkownika:** sprawne opanowanie materiału modułowego, rozwiązywanie puli pytań zaliczeniowych i klinicznych, rozróżnianie klucza zakładowego od aktualnych wytycznych PTGiP/FIGO oraz szybkie ćwiczenie kalkulatorów, zapisów KTG/USG, przypadków Izby Przyjęć i stacji OSCE przed zaliczeniem.

## Product Purpose

„Ginekologia & Położnictwo V · Hub nauki” łączy interaktywne atlasy modułowe (w tym dwa kompletne atlasy pokazowe w makiecie wstępnej) z bazą pytań testowych i otwartych, trybami treningu, egzaminem próbnym, modułami klinicznymi (Izba Przyjęć Położniczo-Ginekologiczna, stacje OSCE, kalkulatory położnicze Naegele/Bishop/Apgar/MgSO₄/PPH/IOM/RMI, atlas KTG i USG, kalendarz badań w ciąży wg MZ/PTGiP), mapą pułapek, grafem powiązań oraz notatkami Markdown w jednej aplikacji webowej działającej offline. Sukces oznacza szybkie przejście od lektury atlasu do pytań i narzędzi klinicznych przy zachowaniu ciągłości postępu między sesjami.

## Positioning

- **Podwójna prawda kliniczno-egzaminacyjna:** jawne rozdzielenie odpowiedzi „Do zaliczenia (wg klucza zakładu)” od „Aktualna wiedza kliniczna (PTGiP / FIGO / ACOG)” w pytaniach z rozbieżnościami, wraz z poziomem pewności klucza.
- **Jedno środowisko nauki bez przełączania narzędzi:** spójne powiązanie modułów położniczych i ginekologicznych, atlasów, kalkulatorów, kalendarza ciąży, symulacji klinicznych, mapy pułapek i notatnika w lekkiej aplikacji PWA działającej offline.

## Operating Context

- **Scenariusze nauki:** dłuższe sesje przy biurku (lektura atlasów, egzamin próbny, interpretacja KTG/USG, graf wiedzy) oraz szybkie powtórki jedną ręką na iPhonie/iPadzie (trening błędów, kalkulator wieku ciążowego i skali Bishopa/Apgar, kalendarz badań w ciąży, szybki brudnopis).
- **Warunki otoczenia:** różne warunki oświetleniowe wymagające pełnego wsparcia trybu jasnego, ciemnego (`Obsidian Carbon`) oraz rozszerzonych palet ciemnych, a także stabilnej pracy offline (precache przez `sw.js`).
- **Język i bezpieczeństwo merytoryczne:** wyłącznie język polski i polska terminologia położniczo-ginekologiczna z wyraźnym zastrzeżeniem edukacyjnym (decyzje kliniczne należy weryfikować z ChPL, aktualnymi rekomendacjami PTGiP/FIGO oraz standardem organizacyjnym opieki okołoporodowej MZ).

## Capabilities and Constraints

- **Architektura bez backendu:** statyczny zestaw HTML/CSS/vanilla JS (`index.html`, `css/hub.css`, `js/meta.js`, `js/logic.js`, `js/questions.js`, `js/questions_zaklad.js`, `js/clinical-*.js`, `js/app.js`, `atlasy/*`, `sw.js`), bez serwera i kont użytkowników.
- **Trwałość danych użytkownika w `localStorage`:** dedykowana przestrzeń kluczy `ginpol_hub_*` (niezależna od `pediatria_hub_*`), z eksportem/importem kopii zapasowej Base64 oraz importem własnych pytań w JSON i tekście.
- **Zakres makiety wstępnej:** kompletna, działająca architektura Hubu z 12 modułami w 4 grupach (A–D), 2 pełnymi interaktywnymi atlasami pokazowymi, reprezentatywną bazą przykładowych pytań z podwójną prawdą, w pełni działającymi kalkulatorami położniczymi, symulatorem Izby Przyjęć/OSCE, atlasem KTG/USG i kalendarzem badań w ciąży.
- **Sprawdzenia automatyczne:** testy jednostkowe dla czystej logiki domenowej (`js/logic.js`) uruchamiane przez `node --test tests/hub.test.mjs`.

## Brand Commitments

- **Nazwa:** `Ginekologia & Położnictwo V · Hub nauki` (skrótowo: `GinPol V`).
- **Dziedziczenie systemu wizualnego:** zachowanie sprawdzonego systemu „Kliniczny atlas kieszonkowy” z `pediatria-hub` (ciepły papier kliniczny + Obsidian Carbon + 6 palet ciemnych, Cabinet Grotesk / Satoshi / JetBrains Mono, kapsułowa kontrola, dyscyplina semantyczna czerwieni) z dedykowanym głównym akcentem kolorystycznym dla Ginekologii i Położnictwa.
- **Zobowiązanie merytoryczne:** rzetelna polska terminologia medyczna i wyraźne oznaczenie charakteru edukacyjnego makiety; brak zmyślonych metryk klinicznych, statystyk zdawalności czy fikcyjnych opinii.

## Evidence on Hand

- Projekt referencyjny: `https://github.com/mmlsk/pediatria-hub.git` (architektura, system projektowy, wzorce offline PWA i testów).
- Wstępna makieta zawiera autorskie, dydaktyczne przykłady pytań, przypadków, stacji OSCE i 2 atlasów pokazowych oparte o standardowy program V roku medycyny (PTGiP, FIGO, MZ).
- **Braki, których nie wolno fabrykować:** brak prawdziwej uczelnianej puli zakładowej z konkretnej katedry (przykładowe pytania z puli zakładowej w makiecie są oznaczone jako przykładowe/dydaktyczne), brak zewnętrznych recenzji i statystyk produkcji.

## Product Principles

1. **Chroń podwójną prawdę:** zawsze jawnie oddzielaj historyczny klucz zaliczeniowy od aktualnych rekomendacji PTGiP/FIGO/MZ.
2. **Dyscyplina stanów nagłych:** stany zagrożenia życia matki i płodu (krwotok poporodowy, rzucawka, oddzielenie łożyska, zagrażająca zamartwica płodu) zachowują najwyższą czytelność i odrębną sygnalizację alarmową.
3. **Ergonomia nauki jedną ręką:** wszystkie kluczowe akcje (rozwiązywanie pytań, kalkulatory, nawigacja dolna) muszą spełniać minimum `44px` celów dotykowych na telefonie bez utraty gęstości na desktopie.
4. **Gotowość offline i zero utraty postępu:** pełne działanie bez internetu oraz bezpieczny zapis i eksport stanu w `localStorage`.
5. **Uczciwość edukacyjna:** materiały wspierają przygotowanie do kolokwiów i egzaminów — nie zastępują ChPL ani aktualnych wytycznych klinicznych przy łóżku pacjentki.

## Accessibility & Inclusion

- Dostępność dotykowa (min. `44px` cele na ekranach dotykowych, `font-size: max(16px, 1em)` w polach formularzy przeciw powiększaniu iOS Safari), pełna obsługa klawiatury (`:focus-visible`, skróty `Ctrl+K`, nawigacja dialogów) oraz kontrast tekstu ≥ 4.5:1 w trybie jasnym, ciemnym i wszystkich 6 paletach rozszerzonych.
- Respektowanie `prefers-reduced-motion: reduce` przy zachowaniu natychmiastowej informacji zwrotnej o stanie i wyniku.
