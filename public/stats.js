import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const API_BASE =
  "https://us-central1-studio-2294305185-c0b44.cloudfunctions.net/api";

const firebaseConfig = {
  apiKey: "AIzaSyBW4jwt8hVQ7uXU1Mg06Ppj4_zUYjBezXw",
  authDomain: "studio-2294305185-c0b44.firebaseapp.com",
  projectId: "studio-2294305185-c0b44",
  appId: "1:1080412997001:web:6d84a90b1a5413d3124d58",
  storageBucket: "studio-2294305185-c0b44.firebasestorage.app",
  messagingSenderId: "1080412997001",
};

const copy = {
  en: {
    statsLoading: "Loading metrics…",
    statsErrorLoad: "Could not load metrics. Try again.",
    statsErrorAuth: "This Google account is not authorized.",
    statsErrorSignIn: "Sign-in failed. Try again.",
    statsErrorDomain: "This site is not authorized in Firebase Authentication.",
    statsErrorProvider: "Google sign-in is not enabled in Firebase.",
    statsErrorNetwork: "Network error. Check your connection and try again.",
    statsPeriodToday: "Today",
    statsPeriod7: "Last 7 days",
    statsPeriod30: "Last 30 days",
    statsKpiDownloads: "APK download clicks",
    statsKpiAttempts: "Payment attempts",
    statsKpiPurchases: "Successful purchases",
    statsKpiPremium: "Premium users",
    statsKpiRevenue: "Total revenue",
    statsKpiAov: "Avg. order value",
    statsKpiInFlight: "In progress",
    statsConvDownloadStart: "Download → attempt",
    statsConvStartSuccess: "Attempt → purchase",
    statsConvDownloadPurchase: "Download → purchase",
    statsConvSuccessRate: "Success rate (closed)",
    statsFunnelDownloads: "Download clicks",
    statsFunnelStarts: "Payment started",
    statsFunnelInFlight: "Awaiting MoMo",
    statsFunnelSuccess: "Paid",
    statsFunnelFailed: "Failed / expired",
    statsEmpty: "No data yet",
    statsPageTitle: "Stats — FGM Hymnals",
    statusSucceeded: "Succeeded",
    statusFailed: "Failed",
    statusPending: "Pending",
    statusAwaitingUser: "Awaiting confirmation",
    statusCancelled: "Cancelled",
    statusExpired: "Expired",
    statusUnknown: "Unknown",
  },
  fr: {
    statsLoading: "Chargement des métriques…",
    statsErrorLoad: "Impossible de charger les métriques. Réessayez.",
    statsErrorAuth: "Ce compte Google n’est pas autorisé.",
    statsErrorSignIn: "Échec de la connexion. Réessayez.",
    statsErrorDomain:
      "Ce site n’est pas autorisé dans Firebase Authentication.",
    statsErrorProvider: "La connexion Google n’est pas activée dans Firebase.",
    statsErrorNetwork:
      "Erreur réseau. Vérifiez votre connexion puis réessayez.",
    statsPeriodToday: "Aujourd’hui",
    statsPeriod7: "7 derniers jours",
    statsPeriod30: "30 derniers jours",
    statsKpiDownloads: "Clics de téléchargement APK",
    statsKpiAttempts: "Tentatives de paiement",
    statsKpiPurchases: "Achats réussis",
    statsKpiPremium: "Utilisateurs premium",
    statsKpiRevenue: "Revenu total",
    statsKpiAov: "Panier moyen",
    statsKpiInFlight: "En cours",
    statsConvDownloadStart: "Téléchargement → tentative",
    statsConvStartSuccess: "Tentative → achat",
    statsConvDownloadPurchase: "Téléchargement → achat",
    statsConvSuccessRate: "Taux de succès (clos)",
    statsFunnelDownloads: "Clics téléchargement",
    statsFunnelStarts: "Paiement lancé",
    statsFunnelInFlight: "En attente MoMo",
    statsFunnelSuccess: "Payé",
    statsFunnelFailed: "Échoué / expiré",
    statsEmpty: "Pas encore de données",
    statsPageTitle: "Statistiques — FGM Hymnals",
    statusSucceeded: "Réussi",
    statusFailed: "Échoué",
    statusPending: "En attente",
    statusAwaitingUser: "Confirmation en attente",
    statusCancelled: "Annulé",
    statusExpired: "Expiré",
    statusUnknown: "Inconnu",
  },
};

function lang() {
  return document.documentElement.lang === "fr" ? "fr" : "en";
}

function t(key) {
  return copy[lang()][key] || copy.en[key] || key;
}

function authErrorMessage(error) {
  const code = error?.code || "auth/unknown";
  const keys = {
    "auth/unauthorized-domain": "statsErrorDomain",
    "auth/operation-not-allowed": "statsErrorProvider",
    "auth/network-request-failed": "statsErrorNetwork",
  };
  return `${t(keys[code] || "statsErrorSignIn")} (${code})`;
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function statusLabel(status) {
  const keys = {
    succeeded: "statusSucceeded",
    failed: "statusFailed",
    pending: "statusPending",
    awaiting_user: "statusAwaitingUser",
    cancelled: "statusCancelled",
    expired: "statusExpired",
  };
  return t(keys[status] || "statusUnknown");
}

function fmtNum(n) {
  return new Intl.NumberFormat(lang() === "fr" ? "fr-FR" : "en-US").format(
    Number(n) || 0,
  );
}

function fmtXaf(n) {
  return `${fmtNum(n)} XAF`;
}

function fmtPct(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0%";
  return `${v.toFixed(1)}%`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(lang() === "fr" ? "fr-FR" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch (_) {
    return iso;
  }
}

function fmtDayLabel(isoDate) {
  try {
    const d = new Date(`${isoDate}T12:00:00Z`);
    return new Intl.DateTimeFormat(lang() === "fr" ? "fr-FR" : "en-US", {
      month: "short",
      day: "numeric",
    }).format(d);
  } catch (_) {
    return isoDate.slice(5);
  }
}

const gate = document.getElementById("stats-gate");
const dashboard = document.getElementById("stats-dashboard");
const loadingEl = document.getElementById("stats-loading");
const gateError = document.getElementById("stats-gate-error");
const signInBtn = document.getElementById("stats-signin");
const signOutBtn = document.getElementById("stats-signout");
const refreshBtn = document.getElementById("stats-refresh");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

let currentUser = null;

function showGate(message) {
  gate.hidden = false;
  dashboard.hidden = true;
  loadingEl.hidden = true;
  signOutBtn.hidden = true;
  if (message) {
    gateError.hidden = false;
    gateError.textContent = message;
  } else {
    gateError.hidden = true;
    gateError.textContent = "";
  }
}

function showDashboard() {
  gate.hidden = true;
  dashboard.hidden = false;
  signOutBtn.hidden = false;
  gateError.hidden = true;
}

function setLoading(on) {
  loadingEl.hidden = !on;
}

function statusClass(status) {
  if (status === "succeeded") return "is-success";
  if (status === "failed" || status === "cancelled" || status === "expired") {
    return "is-failed";
  }
  return "is-pending";
}

function renderKpis(data) {
  const el = document.getElementById("stats-kpis");
  const inFlight =
    (data.paymentsByStatus?.pending || 0) +
    (data.paymentsByStatus?.awaiting_user || 0);
  const cards = [
    { label: t("statsKpiDownloads"), value: fmtNum(data.totals.downloads) },
    {
      label: t("statsKpiAttempts"),
      value: fmtNum(data.totals.paymentStarts),
    },
    {
      label: t("statsKpiPurchases"),
      value: fmtNum(data.totals.paymentSuccesses),
    },
    {
      label: t("statsKpiPremium"),
      value: fmtNum(data.totals.premiumUsers),
    },
    {
      label: t("statsKpiRevenue"),
      value: fmtXaf(data.totals.revenueXaf),
    },
    {
      label: t("statsKpiAov"),
      value: fmtXaf(data.avgOrderValueXaf),
    },
    { label: t("statsKpiInFlight"), value: fmtNum(inFlight) },
  ];
  el.innerHTML = cards
    .map(
      (card) => `
      <article class="stats-kpi">
        <p class="stats-kpi-label">${card.label}</p>
        <p class="stats-kpi-value">${card.value}</p>
      </article>`,
    )
    .join("");
}

function renderFunnel(data) {
  const el = document.getElementById("stats-funnel");
  const steps = [
    { key: "downloads", label: t("statsFunnelDownloads") },
    { key: "paymentStarts", label: t("statsFunnelStarts") },
    { key: "inFlight", label: t("statsFunnelInFlight") },
    { key: "paymentSuccesses", label: t("statsFunnelSuccess") },
    { key: "paymentFailures", label: t("statsFunnelFailed") },
  ];
  const max = Math.max(
    data.funnel.downloads,
    data.funnel.paymentStarts,
    data.funnel.paymentSuccesses,
    data.funnel.paymentFailures,
    1,
  );
  el.innerHTML = steps
    .map((step) => {
      const value = data.funnel[step.key] ?? 0;
      const width = Math.max(8, Math.round((value / max) * 100));
      return `
        <div class="stats-funnel-row">
          <div class="stats-funnel-label">
            <span>${step.label}</span>
            <strong>${fmtNum(value)}</strong>
          </div>
          <div class="stats-funnel-bar" style="--w:${width}%"></div>
        </div>`;
    })
    .join("");
}

function renderConversion(data) {
  const el = document.getElementById("stats-conversion");
  const rows = [
    [t("statsConvDownloadStart"), data.conversion.downloadToPaymentStart],
    [t("statsConvStartSuccess"), data.conversion.paymentStartToSuccess],
    [t("statsConvDownloadPurchase"), data.conversion.downloadToPurchase],
    [t("statsConvSuccessRate"), data.conversion.successOfCompleted],
  ];
  el.innerHTML = rows
    .map(
      ([label, value]) => `
      <div>
        <dt>${label}</dt>
        <dd>${fmtPct(value)}</dd>
      </div>`,
    )
    .join("");
}

function renderPeriods(data) {
  const tbody = document.querySelector("#stats-periods tbody");
  const rows = [
    [t("statsPeriodToday"), data.periods.today],
    [t("statsPeriod7"), data.periods.last7Days],
    [t("statsPeriod30"), data.periods.last30Days],
  ];
  tbody.innerHTML = rows
    .map(
      ([label, p]) => `
      <tr>
        <th scope="row">${label}</th>
        <td>${fmtNum(p.downloads)}</td>
        <td>${fmtNum(p.paymentStarts)}</td>
        <td>${fmtNum(p.paymentSuccesses)}</td>
        <td>${fmtXaf(p.revenueXaf)}</td>
      </tr>`,
    )
    .join("");
}

function renderChart(daily) {
  const el = document.getElementById("stats-chart");
  if (!daily.length) {
    el.innerHTML = `<p class="stats-empty">${t("statsEmpty")}</p>`;
    return;
  }
  const max = Math.max(
    ...daily.map((d) => Math.max(d.downloads, d.paymentSuccesses)),
    1,
  );
  el.innerHTML = daily
    .map((d) => {
      const dh = Math.round((d.downloads / max) * 100);
      const ph = Math.round((d.paymentSuccesses / max) * 100);
      return `
        <div class="stats-chart-col" title="${d.date}">
          <div class="stats-chart-bars">
            <span class="stats-chart-bar stats-chart-bar-downloads" style="--h:${dh}%"></span>
            <span class="stats-chart-bar stats-chart-bar-purchases" style="--h:${ph}%"></span>
          </div>
          <span class="stats-chart-label">${fmtDayLabel(d.date)}</span>
        </div>`;
    })
    .join("");
}

function renderBreakdown(elId, map) {
  const el = document.getElementById(elId);
  const entries = Object.entries(map || {}).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    el.innerHTML = `<p class="stats-empty">${t("statsEmpty")}</p>`;
    return;
  }
  const max = entries[0][1] || 1;
  el.innerHTML = entries
    .map(([key, value]) => {
      const width = Math.max(8, Math.round((value / max) * 100));
      return `
        <div class="stats-breakdown-row">
          <div class="stats-breakdown-label">
            <span>${esc(
              elId === "stats-status" ? statusLabel(key) : key,
            )}</span>
            <strong>${fmtNum(value)}</strong>
          </div>
          <div class="stats-breakdown-bar" style="--w:${width}%"></div>
        </div>`;
    })
    .join("");
}

function renderRecent(rows) {
  const tbody = document.querySelector("#stats-recent tbody");
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="stats-empty">${t("statsEmpty")}</td></tr>`;
    return;
  }
  tbody.innerHTML = rows
    .map((row) => {
      const amount =
        row.amountMinor != null
          ? fmtXaf(row.amountMinor)
          : "—";
      return `
        <tr>
          <td>${esc(fmtDate(row.createdAt))}</td>
          <td><span class="stats-pill ${statusClass(row.status)}">${esc(statusLabel(row.status))}</span></td>
          <td>${amount}</td>
          <td>${esc(row.gateway || "—")}</td>
          <td>${esc(row.email || "—")}</td>
        </tr>`;
    })
    .join("");
}

function renderStats(data) {
  document.getElementById("stats-generated-at").textContent = fmtDate(
    data.generatedAt,
  );
  renderKpis(data);
  renderFunnel(data);
  renderConversion(data);
  renderPeriods(data);
  renderChart(data.daily || []);
  renderBreakdown("stats-status", data.paymentsByStatus);
  renderBreakdown("stats-gateways", data.paymentsByGateway);
  renderRecent(data.recentPayments || []);
}

async function fetchStats(user) {
  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 403) {
    throw new Error("forbidden");
  }
  if (!res.ok) {
    throw new Error("load_failed");
  }
  return res.json();
}

async function loadDashboard(user) {
  setLoading(true);
  document.getElementById("stats-user-email").textContent = user.email || "";
  try {
    const data = await fetchStats(user);
    renderStats(data);
    showDashboard();
  } catch (err) {
    if (err.message === "forbidden") {
      await signOut(auth);
      showGate(t("statsErrorAuth"));
    } else {
      showGate(t("statsErrorLoad"));
    }
  } finally {
    setLoading(false);
  }
}

signInBtn.addEventListener("click", async () => {
  gateError.hidden = true;
  setLoading(true);
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    const redirectFallback = new Set([
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
      "auth/cancelled-popup-request",
      "auth/operation-not-supported-in-this-environment",
      "auth/web-storage-unsupported",
    ]);
    if (redirectFallback.has(error?.code)) {
      try {
        await signInWithRedirect(auth, provider);
        return;
      } catch (redirectError) {
        setLoading(false);
        showGate(authErrorMessage(redirectError));
        return;
      }
    }
    setLoading(false);
    showGate(authErrorMessage(error));
  }
});

signOutBtn.addEventListener("click", () => signOut(auth));
refreshBtn.addEventListener("click", () => {
  if (currentUser) loadDashboard(currentUser);
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!user) {
    showGate();
    return;
  }
  loadDashboard(user);
});

getRedirectResult(auth).catch((error) => {
  setLoading(false);
  showGate(authErrorMessage(error));
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("page-stats")) {
    document.title = t("statsPageTitle");
  }
});

window.addEventListener("fgm-lang-change", () => {
  document.title = t("statsPageTitle");
  if (currentUser && !dashboard.hidden) {
    loadDashboard(currentUser);
  }
});
