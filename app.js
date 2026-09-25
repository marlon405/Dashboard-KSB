/* ======================================================================
   Katastrophenschutz-Dashboard Berlin
   Frontend-only (HTML/CSS/JS), gedacht für GitHub Pages.
   Datenquellen:
   - Wetter:    Open-Meteo (nutzt für Deutschland das DWD-ICON-Modell)
   - Pegel:     PegelOnline API (WSV), Station "Köpenick" an der Spree
   - Einsätze:  Berliner Feuerwehr Open Data (GitHub, aggregierte CSV-Daten)
   ====================================================================== */

/* ---------------------------- KONFIGURATION ---------------------------- */
const CONFIG = {
  weather: {
    lat: 52.4478, lon: 13.5751, // Berlin-Köpenick
    url: "https://api.open-meteo.com/v1/forecast?latitude=52.4478&longitude=13.5751&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin&models=icon_seamless"
  },
  pegel: {
    station: "KOEPENICK",
    url: "https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations/KOEPENICK/W/measurements.json?start=P30D"
  },
  einsaetze: {
    apiRoot: "https://api.github.com/repos/Berliner-Feuerwehr/BF-Open-Data/contents/",
    repoUrl: "https://github.com/Berliner-Feuerwehr/BF-Open-Data"
  },
  demoUser: "Admin",
  demoPass: "Start1234!",
  staleAfterMinutes: 90 // ab wann ein Widget als "veraltet" statt "live" markiert wird
};

/* ------------------------------ I18N ----------------------------------- */
const I18N = {
  de: {
    loginTitle:"Katastrophenschutz-Dashboard", loginSub:"Berlin · Lagebild-Zugang",
    loginUser:"Benutzername", loginPass:"Passwort", loginBtn:"Anmelden",
    loginNote:"Demo-Zugang für die Schulabgabe · kein echter Sicherheitsmechanismus.",
    loginErr:"Benutzername oder Passwort falsch.",
    title:"Katastrophenschutz-Dashboard Berlin", subtitle:"Lagebild · Wetter · Pegel · Einsätze",
    logout:"Abmelden",
    weatherTitle:"Wetter", pegelTitle:"Pegelstand Spree", einsaetzeTitle:"Einsätze der Feuerwehr",
    pegelStation:"Pegel Köpenick, Spree-Oder-Wasserstraße",
    weatherSource:"Quelle: DWD ICON-Modell (via Open-Meteo)",
    pegelSource:"Quelle: PegelOnline (WSV) · Bereich = Min/Max der letzten 30 Tage",
    einsaetzeSource:"Quelle: Berliner Feuerwehr Open Data (GitHub) · aggregierte Daten, kein Live-Feed",
    statusLoading:"wird geladen…", statusLive:"live", statusStale:"älter", statusError:"nicht verfügbar",
    legendGreen:"Unauffällig", legendAmber:"Erhöht / beobachten", legendRed:"Kritisch",
    legendIcons:"Wetter · Pegel · Einsätze",
    legendFooter:"Daten: DWD/Open-Meteo · WSV PegelOnline · Berliner Feuerwehr Open Data — nur zu Übungs-/Schulzwecken, keine Alarmierungsgrundlage.",
    pegelLow:"niedrig", pegelNormal:"normal", pegelHigh:"erhöht", pegelCrit:"kritisch",
    einsaetzeLabel:"Einsätze im letzten verfügbaren Zeitraum",
    einsaetzeError:"Daten konnten nicht geladen werden. Quelle direkt prüfen:",
    weatherError:"Wetterdaten aktuell nicht abrufbar.",
    pegelError:"Pegeldaten aktuell nicht abrufbar.",
    standVom:"Stand: "
  },
  en: {
    loginTitle:"Disaster Management Dashboard", loginSub:"Berlin · situational access",
    loginUser:"Username", loginPass:"Password", loginBtn:"Sign in",
    loginNote:"Demo login for the school submission · not a real security mechanism.",
    loginErr:"Incorrect username or password.",
    title:"Disaster Management Dashboard Berlin", subtitle:"Situation overview · weather · water level · incidents",
    logout:"Sign out",
    weatherTitle:"Weather", pegelTitle:"Spree water level", einsaetzeTitle:"Fire department incidents",
    pegelStation:"Köpenick gauge, Spree–Oder waterway",
    weatherSource:"Source: DWD ICON model (via Open-Meteo)",
    pegelSource:"Source: PegelOnline (WSV) · range = min/max of the last 30 days",
    einsaetzeSource:"Source: Berlin Fire Department Open Data (GitHub) · aggregated data, not a live feed",
    statusLoading:"loading…", statusLive:"live", statusStale:"stale", statusError:"unavailable",
    legendGreen:"Normal", legendAmber:"Elevated / monitor", legendRed:"Critical",
    legendIcons:"Weather · Water level · Incidents",
    legendFooter:"Data: DWD/Open-Meteo · WSV PegelOnline · Berlin Fire Department Open Data — for educational use only, not for actual emergency response.",
    pegelLow:"low", pegelNormal:"normal", pegelHigh:"elevated", pegelCrit:"critical",
    einsaetzeLabel:"Incidents in the latest available period",
    einsaetzeError:"Data could not be loaded. Check the source directly:",
    weatherError:"Weather data currently unavailable.",
    pegelError:"Water level data currently unavailable.",
    standVom:"As of: "
  }
};

const WMO = {
  0:{icon:"☀️",de:"Klarer Himmel",en:"Clear sky"},
  1:{icon:"🌤️",de:"Überwiegend klar",en:"Mainly clear"},
  2:{icon:"⛅",de:"Teilweise bewölkt",en:"Partly cloudy"},
  3:{icon:"☁️",de:"Bedeckt",en:"Overcast"},
  45:{icon:"🌫️",de:"Nebel",en:"Fog"}, 48:{icon:"🌫️",de:"Reifnebel",en:"Rime fog"},
  51:{icon:"🌦️",de:"Leichter Nieselregen",en:"Light drizzle"},
  53:{icon:"🌦️",de:"Nieselregen",en:"Drizzle"},
  55:{icon:"🌦️",de:"Starker Nieselregen",en:"Dense drizzle"},
  61:{icon:"🌧️",de:"Leichter Regen",en:"Light rain"},
  63:{icon:"🌧️",de:"Regen",en:"Rain"},
  65:{icon:"🌧️",de:"Starker Regen",en:"Heavy rain"},
  71:{icon:"🌨️",de:"Leichter Schneefall",en:"Light snow"},
  73:{icon:"🌨️",de:"Schneefall",en:"Snow"},
  75:{icon:"❄️",de:"Starker Schneefall",en:"Heavy snow"},
  80:{icon:"🌦️",de:"Regenschauer",en:"Rain showers"},
  81:{icon:"🌧️",de:"Kräftige Schauer",en:"Heavy showers"},
  82:{icon:"⛈️",de:"Heftige Schauer",en:"Violent showers"},
  95:{icon:"⛈️",de:"Gewitter",en:"Thunderstorm"},
  96:{icon:"⛈️",de:"Gewitter mit Hagel",en:"Thunderstorm with hail"},
  99:{icon:"⛈️",de:"Schweres Gewitter mit Hagel",en:"Severe thunderstorm with hail"}
};
function wmo(code){ return WMO[code] || {icon:"❔", de:"Unbekannt", en:"Unknown"}; }

/* ------------------------------ STATE ----------------------------------- */
const state = { lang:"de", weather:null, pegel:null, einsaetze:null };
function t(key){ return I18N[state.lang][key] || key; }

/* ------------------------------ LOGIN ------------------------------------ */
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const u = document.getElementById("login-user").value.trim();
  const p = document.getElementById("login-pass").value;
  if (u === CONFIG.demoUser && p === CONFIG.demoPass) {
    sessionStorage.setItem("kds_auth", "1");
    showDashboard();
  } else {
    document.getElementById("login-error").textContent = t("loginErr");
  }
});
document.getElementById("logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem("kds_auth");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
});
function showDashboard(){
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  loadAll();
}
if (sessionStorage.getItem("kds_auth") === "1") { showDashboard(); }

/* ------------------------------ SPRACHE ----------------------------------- */
document.getElementById("lang-toggle").addEventListener("click", () => {
  state.lang = state.lang === "de" ? "en" : "de";
  document.documentElement.lang = state.lang;
  document.getElementById("lang-toggle").textContent = state.lang === "de" ? "EN" : "DE";
  applyStaticTranslations();
  renderWeather(); renderPegel(); renderEinsaetze();
});
function applyStaticTranslations(){
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (I18N[state.lang][key] === undefined) return;
    if (el.tagName === "INPUT") el.placeholder = t(key);
    else el.textContent = t(key);
  });
}

/* ------------------------------ UHR ----------------------------------- */
function tickClock(){
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString(state.lang === "de" ? "de-DE" : "en-GB");
}
setInterval(tickClock, 1000); tickClock();

/* ------------------------------ HILFSFUNKTIONEN ----------------------------------- */
function setStatus(elId, kind, label){
  const el = document.getElementById(elId);
  el.className = "status " + kind;
  el.textContent = label;
}
function minutesAgo(dateObj){ return (Date.now() - dateObj.getTime()) / 60000; }
function fmtTime(dateObj){
  return dateObj.toLocaleString(state.lang === "de" ? "de-DE" : "en-GB", {
    day:"2-digit", month:"2-digit", year:"2-digit", hour:"2-digit", minute:"2-digit"
  });
}

/* ============================ WETTER ============================ */
async function loadWeather(){
  try{
    const res = await fetch(CONFIG.weather.url);
    if(!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    state.weather = { data, fetchedAt: new Date() };
    renderWeather();
  }catch(err){
    console.error("Wetter-Fehler:", err);
    setStatus("status-weather", "error", t("statusError"));
    document.getElementById("weather-desc").textContent = t("weatherError");
  }
}
function renderWeather(){
  if(!state.weather) return;
  const { data, fetchedAt } = state.weather;
  const cur = data.current;
  const w = wmo(cur.weather_code);
  document.getElementById("weather-icon").textContent = w.icon;
  document.getElementById("weather-temp").textContent = Math.round(cur.temperature_2m) + "°C";
  document.getElementById("weather-desc").textContent = w[state.lang];

  const row = document.getElementById("forecast-row");
  row.innerHTML = "";
  const days = data.daily.time.slice(0,7);
  days.forEach((iso, i) => {
    const d = new Date(iso + "T12:00:00");
    const dayName = d.toLocaleDateString(state.lang === "de" ? "de-DE" : "en-GB", { weekday:"short" });
    const dw = wmo(data.daily.weather_code[i]);
    const div = document.createElement("div");
    div.className = "forecast-day";
    div.innerHTML = `<div class="fd-name">${dayName}</div>
      <span class="fd-icon">${dw.icon}</span>
      <div class="fd-max">${Math.round(data.daily.temperature_2m_max[i])}°</div>
      <div class="fd-min">${Math.round(data.daily.temperature_2m_min[i])}°</div>`;
    row.appendChild(div);
  });

  const age = minutesAgo(fetchedAt);
  setStatus("status-weather", age < CONFIG.staleAfterMinutes ? "live" : "stale",
    t("standVom") + fmtTime(fetchedAt));
}

/* ============================ PEGEL ============================ */
async function loadPegel(){
  try{
    const res = await fetch(CONFIG.pegel.url);
    if(!res.ok) throw new Error("HTTP " + res.status);
    const rows = await res.json();
    if(!rows || !rows.length) throw new Error("Keine Messwerte");
    state.pegel = { rows, fetchedAt: new Date() };
    renderPegel();
  }catch(err){
    console.error("Pegel-Fehler:", err);
    setStatus("status-pegel", "error", t("statusError"));
    document.getElementById("pegel-tag").textContent = t("pegelError");
  }
}
function renderPegel(){
  if(!state.pegel) return;
  const { rows, fetchedAt } = state.pegel;
  const values = rows.map(r => r.value);
  const min = Math.min(...values), max = Math.max(...values);
  const latest = rows[rows.length - 1];
  const current = latest.value;
  const latestTime = new Date(latest.timestamp);

  document.getElementById("pegel-value").textContent = current.toFixed(0) + " cm";
  document.getElementById("gauge-min").textContent = min.toFixed(0) + " cm";
  document.getElementById("gauge-max").textContent = max.toFixed(0) + " cm";

  const range = Math.max(max - min, 1);
  const pct = Math.min(100, Math.max(0, ((current - min) / range) * 100));
  document.getElementById("gauge-fill").style.height = pct + "%";
  document.getElementById("gauge-marker").style.bottom = pct + "%";

  let tagKey, tagClass;
  if (pct < 20) { tagKey = "pegelLow"; tagClass = "low"; }
  else if (pct < 75) { tagKey = "pegelNormal"; tagClass = "normal"; }
  else if (pct < 90) { tagKey = "pegelHigh"; tagClass = "high"; }
  else { tagKey = "pegelCrit"; tagClass = "crit"; }
  const tagEl = document.getElementById("pegel-tag");
  tagEl.className = "pegel-tag " + tagClass;
  tagEl.textContent = t(tagKey) + " (" + t("standVom").toLowerCase().replace(":","") + ")";

  const age = minutesAgo(latestTime);
  setStatus("status-pegel", age < CONFIG.staleAfterMinutes ? "live" : "stale",
    t("standVom") + fmtTime(latestTime));
}

/* ============================ EINSÄTZE ============================ */
async function loadEinsaetze(){
  try{
    const rootRes = await fetch(CONFIG.einsaetze.apiRoot);
    if(!rootRes.ok) throw new Error("HTTP " + rootRes.status);
    const rootEntries = await rootRes.json();

    // CSV-Datei suchen: zuerst im Root, sonst eine Ebene in Unterordnern
    let csvFile = rootEntries.find(e => e.type === "file" && e.name.toLowerCase().endsWith(".csv"));
    if(!csvFile){
      const dirs = rootEntries.filter(e => e.type === "dir").slice(0, 4);
      for(const dir of dirs){
        const subRes = await fetch(dir.url);
        if(!subRes.ok) continue;
        const subEntries = await subRes.json();
        csvFile = subEntries.find(e => e.type === "file" && e.name.toLowerCase().endsWith(".csv"));
        if(csvFile) break;
      }
    }
    if(!csvFile) throw new Error("Keine CSV-Datei im Open-Data-Repo gefunden");

    const csvRes = await fetch(csvFile.download_url);
    if(!csvRes.ok) throw new Error("HTTP " + csvRes.status);
    const csvText = await csvRes.text();
    const parsed = parseLatestCsvRow(csvText);

    state.einsaetze = { file: csvFile.name, parsed, fetchedAt: new Date() };
    renderEinsaetze();
  }catch(err){
    console.error("Einsätze-Fehler:", err);
    setStatus("status-einsaetze", "error", t("statusError"));
    document.getElementById("einsaetze-kpi").textContent = "–";
    document.getElementById("einsaetze-label").textContent = t("einsaetzeError");
    const hint = document.getElementById("einsaetze-hint");
    hint.innerHTML = `<a href="${CONFIG.einsaetze.repoUrl}" target="_blank" rel="noopener" style="color:inherit;">${CONFIG.einsaetze.repoUrl}</a>`;
  }
}
// Sehr einfacher CSV-Parser: nimmt die letzte Datenzeile und sucht eine
// Spalte mit einer Anzahl/Menge sowie eine Spalte mit einem Datum/Zeitraum.
function parseLatestCsvRow(csvText){
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if(lines.length < 2) throw new Error("CSV leer");
  const delim = lines[0].includes(";") ? ";" : ",";
  const header = lines[0].split(delim).map(h => h.trim().toLowerCase());
  const lastLine = lines[lines.length - 1].split(delim);

  const countIdx = header.findIndex(h => /anzahl|count|einsaetze|einsätze|fälle|missions/.test(h));
  const dateIdx = header.findIndex(h => /datum|monat|jahr|date|month|year|zeitraum/.test(h));

  return {
    count: countIdx >= 0 ? lastLine[countIdx] : null,
    period: dateIdx >= 0 ? lastLine[dateIdx] : null,
    columns: header.length,
    rowCount: lines.length - 1
  };
}
function renderEinsaetze(){
  if(!state.einsaetze) return;
  const { parsed, fetchedAt } = state.einsaetze;
  document.getElementById("einsaetze-kpi").textContent = parsed.count ?? "–";
  document.getElementById("einsaetze-label").textContent = parsed.period
    ? `${t("einsaetzeLabel")}: ${parsed.period}`
    : t("einsaetzeLabel");
  document.getElementById("einsaetze-hint").textContent =
    (state.lang === "de" ? "Datei: " : "File: ") + state.einsaetze.file +
    (state.lang === "de" ? " · gesamt " : " · total ") + parsed.rowCount +
    (state.lang === "de" ? " Zeilen im Datensatz" : " rows in dataset");

  setStatus("status-einsaetze", "stale", t("standVom") + fmtTime(fetchedAt));
}

/* ------------------------------ START ----------------------------------- */
function loadAll(){
  applyStaticTranslations();
  loadWeather();
  loadPegel();
  loadEinsaetze();
  // Automatische Aktualisierung alle 10 Minuten
  setInterval(() => { loadWeather(); loadPegel(); loadEinsaetze(); }, 10 * 60 * 1000);
}
