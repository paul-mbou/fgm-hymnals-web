(function () {
  const PLAY_HREF =
    "https://play.google.com/store/apps/details?id=com.apps_industry.fgm_lyrics";
  const APK_HREF = "/download";

  function currentLang() {
    const lang = document.documentElement.lang;
    return lang === "fr" ? "fr" : "en";
  }

  function reapplyLang() {
    if (typeof window.applyFgmLang === "function") {
      window.applyFgmLang(currentLang());
    }
  }

  function ensureApkLabel(anchor) {
    let label = anchor.querySelector(".apk-download-btn");
    if (!label) {
      label = document.createElement("span");
      label.className = "apk-download-btn";
      label.setAttribute("data-i18n", "apkDownloadLabel");
      label.hidden = true;
      anchor.appendChild(label);
    }
    return label;
  }

  function applyChannel(channel) {
    const resolved = channel === "apk" ? "apk" : "play";
    document.documentElement.dataset.downloadChannel = resolved;

    document.querySelectorAll(".play-badge").forEach((anchor) => {
      if (!anchor.dataset.playHref) {
        anchor.dataset.playHref = anchor.getAttribute("href") || PLAY_HREF;
      }

      const apkLabel = ensureApkLabel(anchor);
      const imgs = anchor.querySelectorAll(".play-badge-img");

      if (resolved === "apk") {
        anchor.setAttribute("href", APK_HREF);
        imgs.forEach((img) => {
          img.hidden = true;
        });
        apkLabel.hidden = false;
      } else {
        anchor.setAttribute("href", anchor.dataset.playHref || PLAY_HREF);
        apkLabel.hidden = true;
      }
    });

    reapplyLang();
  }

  function init() {
    applyChannel("play");

    fetch("/api/geo")
      .then((res) => {
        if (!res.ok) throw new Error("geo failed");
        return res.json();
      })
      .then((data) => {
        applyChannel(data && data.channel === "apk" ? "apk" : "play");
      })
      .catch(() => {
        applyChannel("play");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
