# Neptun Tweaks

**Jelenleg ez a bővítmény csak a BME Neptunon működik és ott is lett tesztelve.**

Egy egyszerű Chrome bővítmény, aminek a célja, hogy kényelmesebbé tegye a Neptun új felületének és kezdőlapjának használatát.

## ✨ Funkciók
* **Egyedi háttér a kezdőlapon:** Lecseréli az alapértelmezett kék/lila felső sávot egy általad megadott képre, vagy egy letisztult, általad választott egyszínű háttérre. Az üdvözlő szöveget automatikusan fehérre színezi és kap egy kis árnyékot is, így bármilyen háttéren tökéletesen olvasható marad. Kép esetén az extension menüjében még finomhangolni is tudod a kép fókuszpontját!
* **Gyors Naptár gomb:** A felső sávba, a keresőmező mellé automatikusan bekerül egy "Naptár" gomb, mellyel egyetlen kattintással elérheted a hallgatói órarendet, anélkül, hogy a menüben kéne keresgélned.
* **Panelek automatikus kinyitása:** Unod már, hogy mindig kattintgatni kell a jegyeidhez vagy az üzeneteidhez? Ez a funkció a betöltés pillanatában rögtön lenyitja az összes összecsukott menüt a kezdőlapon (pl. *Vizsgák*, *Hírek*, *Eredmények*).
* **Turbó listabetöltő:** Amikor egy hosszú listát nézel (pl. hallgatók a kurzuson, felvett tárgyak, vizsgák), a Neptun elrejti őket egy „Továbbiak betöltése” gomb mögé. A script a háttérben gyorsan és láthatatlanul rákattint erre a gombra. Az automatikusan betöltendő elemek maximum számát te magad tudod szabályozni a kiegészítő beállításaiban (50, 100, 250 vagy 500 elem). Ha ennél is több kell, csak kattints rá te magad az oldal alján, és újra betöltődik az adott mennyiség!
* **Verziószám és gyorslink:** Egy apró, letisztult verziószámot tesz a neved mellé a kezdőlapon. Ha rákattintasz, egyből erre a GitHub oldalra hoz.

## 🚀 Telepítés

Mivel a bővítmény egyelőre nincs fent a hivatalos kiegészítő boltokban, manuálisan tudod telepíteni a böngésződ fejlesztői eszközeinek használatával:

**Első lépés:** **Töltsd le a kódot!** Klónozd a repót Git-tel, vagy kattints a zöld **"Code"** gombra az oldal tetején, és válaszd a **"Download ZIP"** opciót. Ha a ZIP-et választottad, csomagold ki egy mappába a gépeden (a `Neptun_tweaks` mappára lesz szükséged).

### 🌐 Chrome / Edge / Brave / Chromium

1. **Nyisd meg a Bővítményeket:** Írd be a böngésző címsorába, hogy `chrome://extensions/` (Edge esetén `edge://extensions/`), majd nyomj Entert.
2. **Fejlesztői mód bekapcsolása:** A jobb felső sarokban kapcsold be a **"Fejlesztői mód"** (Developer mode) kapcsolót.
3. **Bővítmény betöltése:** Kattints a bal felső sarokban megjelenő **"Kicsomagolt bővítmény betöltése"** (Load unpacked) gombra.
4. **Válaszd ki a mappát:** Válaszd ki azt a `Neptun_tweaks` mappát, ahova kicsomagoltad a letöltött fájlokat (ahol a `manifest.json` is található).

### 🦊 Firefox

1. **Nyisd meg a Hibakeresőt:** Írd be a címsorba, hogy `about:debugging#/runtime/this-firefox`, majd nyomj Entert.
2. **Kiegészítő betöltése:** Kattints az **"Ideiglenes kiegészítő betöltése..."** (Load Temporary Add-on...) gombra.
3. **Válaszd ki a fájlt:** Keresd meg a kicsomagolt `Neptun_tweaks` mappát, és válaszd ki benne a `manifest.json` fájlt. 
*(Megjegyzés: Firefoxon az így betöltött bővítmények a böngésző újraindításakor eltűnnek, így bezárás után újra be kell őket tölteni.)*

---
**Kész is vagy!** A bővítmény most már aktív. Csak lépj be a Neptunba, vagy frissítsd az oldalt!