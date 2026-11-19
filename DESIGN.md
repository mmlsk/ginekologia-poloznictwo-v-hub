---
name: Ginekologia & Położnictwo V · Hub nauki
description: System projektowy „Kliniczny atlas kieszonkowy” zaadaptowany dla Hubu i interaktywnych atlasów z ginekologii i położnictwa (ciepły papier kliniczny + Obsidian Carbon + akcent głębokiego burgundu klinicznego).
colors:
  burgundy-clinical: "#8A284C"
  burgundy-deep: "#641B36"
  burgundy-soft: "#F6E2EA"
  burgundy-border: "#DDB5C5"
  burgundy-dark: "#A8345E"
  burgundy-glow-dark: "#E887AA"
  slate-indigo: "#245B7A"
  slate-indigo-soft: "#E1EFF5"
  slate-indigo-border: "#BFD8E4"
  slate-indigo-dark: "#65B8E0"
  emergency-red: "#A82D1E"
  emergency-red-soft: "#FBE6E2"
  emergency-red-border: "#F0C4BC"
  emergency-red-dark: "#F07163"
  exam-amber: "#8F5808"
  exam-amber-soft: "#FCEFD6"
  exam-amber-border: "#EED09D"
  exam-amber-dark: "#F0A93B"
  diagnostic-blue: "#24579E"
  diagnostic-blue-soft: "#E1ECF9"
  diagnostic-blue-border: "#BFD4EE"
  diagnostic-blue-dark: "#68A4F2"
  verified-green: "#216B3E"
  verified-green-soft: "#E1F3E7"
  verified-green-border: "#BFE2CB"
  verified-green-dark: "#43C27A"
  search-hit: "#C84700"
  search-hit-dark: "#C2410C"
  ctg-paper-bg: "#FFFDF7"
  paper-bg: "#F5F6F2"
  surface-white: "#FFFFFF"
  surface-wash: "#EFF2F0"
  ink-slate: "#13232C"
  ink-secondary: "#44545D"
  ink-muted: "#596870"
  line-sage: "#DCE2E0"
  obsidian-bg: "#090C0E"
  obsidian-surface: "#11161A"
  obsidian-elevated: "#171E24"
  obsidian-ink: "#F1F5F7"
  obsidian-secondary: "#B3C0C8"
  obsidian-muted: "#8A9BA5"
  obsidian-line: "#222B32"
typography:
  display:
    fontFamily: "'Cabinet Grotesk', 'Satoshi', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.8vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "'Cabinet Grotesk', 'Satoshi', system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0em"
  body:
    fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
  mono:
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  badge: "6px"
  control: "10px"
  card: "14px"
  card-lg: "22px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.burgundy-clinical}"
    textColor: "{colors.surface-white}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "11.2px 18.4px"
  button-primary-hover:
    backgroundColor: "{colors.burgundy-deep}"
    textColor: "{colors.surface-white}"
  button-secondary:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.pill}"
    padding: "11.2px 18.4px"
  chip-default:
    backgroundColor: "{colors.paper-bg}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    padding: "2.2px 9.6px"
  chip-active:
    backgroundColor: "{colors.ink-slate}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.pill}"
  card-surface:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.card}"
    padding: "19.2px 20.8px"
---

# Design System: Ginekologia & Położnictwo V · Hub nauki

## Overview

**Creative North Star: „Kliniczny atlas kieszonkowy — Ginekologia i Położnictwo”**

System dziedziczy sprawdzoną architekturę i ergonomię projektu siostrzanego `pediatria-hub` (`css/hub.css`, `atlasy/atlas-base.css`, `atlasy/atlas-mobile.css`), dostosowując tożsamość kolorystyczną i komponenty diagnostyczne do realiów ginekologii i położnictwa (tryb **Operate + Read**).

Tryb jasny bazuje na ciepłym papierze o niskim olśnieniu (`#F5F6F2`), a tryb ciemny na głębokiej palecie Obsidian Carbon (`#090C0E`) wraz z 6 rozszerzonymi paletami ciemnymi (`navy`, `moss`, `espresso`, `ochre`, `purple`, `ocean`). Główny akcent kliniczny to autorytatywny **Clinical Burgundy** (`#8A284C` / `#641B36` w trybie jasnym, kontrast ≥ 8.2:1; `#A8345E` / `#E887AA` w trybie ciemnym, kontrast ≥ 6.6:1), który jednoznacznie odróżnia projekt od pediatrii bez popadania w pastelowy lub dekoracyjny róż.

## Colors

### Primary (Akcent domenowy OB/GYN)
- **Clinical Burgundy** (`--teal`: `#8A284C`, ciemny: `#A8345E`): Główne przyciski akcji (`.btn.pri`), fokusy, aktywne zakładki atlasów, wskaźniki wyników kalkulatorów i selekcja tekstu.
- **Deep Plum-Wine / Rose Glow** (`--teal-d`: `#641B36`, ciemny: `#E887AA`): Teksty linków, stan `:hover` akcji głównych oraz wyróżnienia wartości liczbowych na ciemnych powierzchniach.
- **Rose-Paper Wash** (`--teal-l`: `#F6E2EA`, ciemny: `rgba(196, 77, 120, 0.20)`): Subtelne podświetlenia aktywnych pozycji nawigacji atlasu, pól wyniku kalkulatorów (`.ob-calc-result`) oraz pierścieni fokusu.

### Semantic Clinical Coding (4 obszary + Podwójna prawda, WCAG AA ≥ 4.5:1)
- **Emergency Red** (`--red`: `#A82D1E`, ciemny: `#F07163`): Wyłącznie stany zagrożenia życia matki i płodu (krwotok PPH, rzucawka, pęknięta ciąża ektopowa, wypadnięcie pępowiny), grupa A, błędy krytyczne OSCE oraz negatywna weryfikacja odpowiedzi.
- **Exam Amber** (`--amber`: `#8F5808`, ciemny: `#F0A93B`): Obszar B (położnictwo), kolumna „Pod zaliczenie (klucz zakładu)” w boksach `.dual`, ostrzeżenia KTG „Podejrzany” oraz klucze wnioskowane.
- **Diagnostic Blue** (`--blue`: `#24579E`, ciemny: `#68A4F2`): Obszar C (ginekologia endokrynologiczna, rozród i zakażenia) oraz badania diagnostyczne.
- **Slate Indigo** (`--violet`: `#245B7A`, ciemny: `#65B8E0`): Obszar D (onkologia ginekologiczna i patologia szyjki) oraz zadania dydaktyczne.
- **Verified Green** (`--green`: `#216B3E`, ciemny: `#43C27A`): Poprawne odpowiedzi, kolumna „Aktualnie klinicznie (PTGiP / FIGO)” oraz zapisy KTG w normie.
- **Search Hit** (`--hit`: `#C84700`, ciemny: `#C2410C`, tekst `#FFFFFF` ≥ 4.8:1 we wszystkich motywach): Wyróżnienie dopasowań wyszukiwania i przycisków akcji trafień (`.btn.hit`).

### Neutral Surfaces
- **Warm Paper** (`--bg`: `#F5F6F2`, `--surface`: `#FFFFFF`, `--surface-2`: `#EFF2F0`, `--line`: `#DCE2E0`)
- **Obsidian Carbon** (`--bg`: `#090C0E`, `--surface`: `#11161A`, `--surface-2`: `#171E24`, `--line`: `#222B32`)
- **Ink Hierarchy:** `#13232C` / `#44545D` / `#596870` (light) oraz `#F1F5F7` / `#B3C0C8` / `#8A9BA5` (dark).

## Typography & Data Integrity

- **Display:** `Cabinet Grotesk` (`700`, `800`) — tytuły widoków, wskaźniki kalkulatorów, nagłówki sekcji atlasów.
- **Body:** `Satoshi` (`400`, `500`, `700`) — treść kliniczna, stems pytań, omówienia i tabele (`max-width: 72ch`).
- **Tabular & Mono:** `font-variant-numeric: tabular-nums` w klasie `.mono` dla wieku ciążowego (`24+3 Hbd`), skali Bishopa i Apgar, wartości OGTT, RMI, parametrów KTG i dawek leków (`MgSO₄`, `TXA`).

## Iconography & Browser Surfaces

- **Ikony nawigacyjne:** spójny zestaw liniowych ikon SVG (`16×16`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`) w górnej belce, rozwijanych menu `Klinika` / `Więcej`, przełączniku motywów i przycisku brudnopisu — zamiast niejednorodnych emoji systemowych.
- **Powierzchnie przeglądarki:** spójnie ostylowane `::selection`, `caret-color`, `scrollbar-color`, `:focus-visible` (`3px solid var(--teal)`), `text-underline-offset` oraz zabezpieczenie formularzy przed auto-zoomem iOS Safari (`font-size: max(16px, 1em)` dla `pointer: coarse`).

## Domain Components

- **Papier KTG (`.ctg-paper`):** dedykowana powierzchnia siatki milimetrowej (jasny kremowy papier `#FFFDF7` w trybie jasnym, przygaszony grafit `#12171D` w ciemnym) dla wektorowych zapisów FHR (110–160 bpm) i skurczów TOCO.
- **Oś czasu ciąży (`.trimester-strip`, `.timeline-pso`):** czterokolumnowy pasek kluczowych kamieni milowych (USG I trym., OGTT, anty-D, GBS) oraz pionowa oś czasu Standardu Organizacyjnego Opieki Okołoporodowej MZ.
- **Karty wyników kalkulatorów (`.ob-calc-result`):** wyodrębnione tło `--teal-xl` z wyraźną wartością tabularną (`.big-val`) i natychmiastową akcją zapisu do Notatnika Markdown.
- **Podwójna prawda (`.dual`, `.dbox.z`, `.dbox.a`):** dwukolumnowe zestawienie klucza zaliczeniowego (`--amber`) i aktualnych rekomendacji PTGiP/FIGO (`--green`).

## Named Rules

1. **The Clinical Red Discipline Rule:** Czerwień (`--red`) wyłącznie dla stanów zagrożenia życia matki/płodu, krytycznych błędów OSCE oraz błędnych odpowiedzi — nigdy dla dekoracji CTA ani zakładek.
2. **The Dual-Truth Separation Rule:** Nigdy nie zacieraj rozróżnienia między kluczem zakładowym a wytycznymi PTGiP/FIGO.
3. **The Touch & Offline Rule:** Minimalny rozmiar celu dotykowego `44px` na ekranach mobilnych, dolny pasek nawigacji poniżej `720px` oraz pełny precache offline w `sw.js`.
