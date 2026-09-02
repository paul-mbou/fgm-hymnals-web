const copy = {
  fr: {
    navCta: "Sur Google Play",
    eyebrow: "Officiel · MM",
    lede: "Le cantique de la Full Gospel Mission sur votre téléphone — paroles, audio, partitions et projection, en français et en anglais.",
    ledeLite:
      "Le cantique de la Full Gospel Mission — paroles, audio, partitions et projection, en français et en anglais.",
    ctaSmall: "Disponible sur",
    featuresTitle: "Pensé pour le culte",
    featuresLede:
      "Tout ce dont l’assemblée a besoin, entre le tableau des cantiques et l’écran.",
    f1Title: "Français & anglais",
    f1Body:
      "Changez de langue sur chaque cantique. Cherchez par numéro, titre ou paroles.",
    f2Title: "Écouter & apprendre",
    f2Body:
      "Audio en streaming ou hors ligne, avec un lecteur compact pour la répétition.",
    f3Title: "Partitions",
    f3Body:
      "Ouvrez les partitions dans l’app — zoom et navigation page par page.",
    f4Title: "Projection",
    f4Body:
      "Diapositives couplet par couplet, prêtes pour l’écran du sanctuaire.",
    downloadTitle: "Emportez le cantique avec vous",
    downloadBody: "Gratuit sur Google Play pour téléphones et tablettes Android.",
    downloadBodyApk:
      "Édition Mobile Money — téléchargez l’APK pour Android.",
    apkDownloadLabel: "Télécharger l'app",
    footerBrand: "FGM Hymnals · Officiel · MM",
    privacy: "Politique de confidentialité",
    backHome: "Retour à l’accueil",
    seeMore: "Voir les fonctionnalités",
    pageTitlePrivacy: "Politique de confidentialité — FGM Hymnals",
    pageTitleFull: "FGM Hymnals — Fonctionnalités",
    pageTitleHome: "FGM Hymnals — Officiel",
    pageTitleDownload: "Télécharger — FGM Hymnals",
    pageTitleAuth: "Retour à l’app — FGM Hymnals",
    playBadgeAlt: "Disponible sur Google Play",
    authCompleteTitle: "Retournez dans l’app",
    authCompleteBody:
      "Votre lien de connexion a été ouvert. Revenez dans FGM Hymnals pour continuer.",
  },
  en: {
    navCta: "Get on Google Play",
    eyebrow: "Official · MM",
    lede: "The Full Gospel Mission hymnbook on your phone — lyrics, audio, sheet music and projection, in French and English.",
    ledeLite:
      "The Full Gospel Mission hymnbook — lyrics, audio, sheet music and projection, in French and English.",
    ctaSmall: "Get it on",
    featuresTitle: "Built for worship",
    featuresLede:
      "Everything a congregation needs between the hymnboard and the projector.",
    f1Title: "French & English",
    f1Body:
      "Switch language on any hymn. Search by number, title, or lyrics.",
    f2Title: "Listen & learn",
    f2Body:
      "Stream or download audio with a compact player built for rehearsal.",
    f3Title: "Sheet music",
    f3Body: "Open partitions in-app — pinch to zoom, page by page.",
    f4Title: "Projection",
    f4Body: "Verse-by-verse slides ready for the sanctuary screen.",
    downloadTitle: "Carry the hymnbook with you",
    downloadBody: "Free on Google Play for Android phones and tablets.",
    downloadBodyApk:
      "Mobile Money edition — download the APK for Android.",
    apkDownloadLabel: "Download the app",
    footerBrand: "FGM Hymnals · Official · MM",
    privacy: "Privacy Policy",
    backHome: "Back to home",
    seeMore: "See features",
    pageTitlePrivacy: "Privacy Policy — FGM Hymnals",
    pageTitleFull: "FGM Hymnals — Features",
    pageTitleHome: "FGM Hymnals — Official",
    pageTitleDownload: "Download — FGM Hymnals",
    pageTitleAuth: "Return to the app — FGM Hymnals",
    playBadgeAlt: "Get it on Google Play",
    authCompleteTitle: "Return to the app",
    authCompleteBody:
      "Your sign-in link was opened. Switch back to FGM Hymnals to continue.",
  },
};

function isApkChannel() {
  return document.documentElement.dataset.downloadChannel === "apk";
}

function applyLang(lang) {
  const resolved = lang === "fr" ? "fr" : "en";
  const dict = copy[resolved];
  document.documentElement.lang = resolved;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    let key = el.getAttribute("data-i18n");
    if (key === "downloadBody" && isApkChannel()) {
      key = "downloadBodyApk";
    }
    if (dict[key]) el.textContent = dict[key];
  });

  // Privacy (and any bilingual blocks): show only the active language.
  document.querySelectorAll("[data-lang-block]").forEach((el) => {
    const show = el.getAttribute("data-lang-block") === resolved;
    el.classList.toggle("is-lang-active", show);
    if (show) {
      el.removeAttribute("hidden");
    } else {
      el.setAttribute("hidden", "");
    }
  });

  document.querySelectorAll("[data-play-badge]").forEach((img) => {
    const show = img.getAttribute("data-play-badge") === resolved;
    img.hidden = isApkChannel() || !show;
    if (show && dict.playBadgeAlt) img.alt = dict.playBadgeAlt;
  });

  document.querySelectorAll(".play-badge").forEach((a) => {
    const label = isApkChannel() ? dict.apkDownloadLabel : dict.playBadgeAlt;
    if (label) a.setAttribute("aria-label", label);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === resolved);
  });

  if (document.body.classList.contains("page-privacy") && dict.pageTitlePrivacy) {
    document.title = dict.pageTitlePrivacy;
  } else if (document.body.classList.contains("page-full") && dict.pageTitleFull) {
    document.title = dict.pageTitleFull;
  } else if (document.body.classList.contains("page-lite") && dict.pageTitleHome) {
    document.title = dict.pageTitleHome;
  } else if (document.body.classList.contains("page-download") && dict.pageTitleDownload) {
    document.title = dict.pageTitleDownload;
  } else if (document.body.classList.contains("page-auth") && dict.pageTitleAuth) {
    document.title = dict.pageTitleAuth;
  }

  try {
    localStorage.setItem("fgm-lang", resolved);
  } catch (_) {
    /* ignore */
  }
}

window.applyFgmLang = applyLang;

// Default language is English. Keep a prior explicit choice if present.
const saved = (() => {
  try {
    return localStorage.getItem("fgm-lang");
  } catch (_) {
    return null;
  }
})();

const initial = saved === "fr" || saved === "en" ? saved : "en";

applyLang(initial);

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    applyLang(btn.dataset.lang);
    if (document.body.classList.contains("page-privacy")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});
