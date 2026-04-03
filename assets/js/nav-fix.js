(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function applyStoredTheme() {
    const saved = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const theme = saved === "dark" || saved === "light"
      ? saved
      : (prefersDark ? "dark" : "light");

    const html = document.documentElement;
    const icon = document.getElementById("theme-icon");

    if (theme === "dark") {
      html.setAttribute("data-theme", "dark");
      if (icon) {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
      }
    } else {
      html.removeAttribute("data-theme");
      if (icon) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
      }
    }
  }

  ready(function () {
    const nav = document.getElementById("site-nav");
    if (!nav) return;

    const button = nav.querySelector("button");
    const visibleLinks = nav.querySelector(".visible-links");
    const hiddenLinks = nav.querySelector(".hidden-links");
    const themeToggle = document.getElementById("theme-toggle");

    if (!button || !visibleLinks || !hiddenLinks) return;

    function tailItem() {
      return visibleLinks.querySelector(".persist.tail");
    }

    function nonPersistentVisibleItems() {
      return Array.from(visibleLinks.children).filter(function (el) {
        return !el.classList.contains("persist");
      });
    }

    function updateLayoutOffsets() {
      const masthead = document.querySelector(".masthead");
      const body = document.body;
      const sidebar = document.querySelector(".sidebar");
      const authorBtn = document.querySelector(".author__urls-wrapper button");

      if (!masthead || !body) return;

      const mastheadHeight = masthead.offsetHeight;
      body.style.paddingTop = mastheadHeight + "px";

      if (sidebar) {
        const authorBtnVisible =
          authorBtn && getComputedStyle(authorBtn).display !== "none";
        sidebar.style.paddingTop = authorBtnVisible ? "" : mastheadHeight + "px";
      }
    }

    function showButton(show) {
      if (show) {
        button.classList.remove("hidden");
      } else {
        button.classList.add("hidden");
        button.classList.remove("close");
        hiddenLinks.classList.add("hidden");
      }
    }

    function moveLastVisibleToHidden() {
      const candidates = nonPersistentVisibleItems();
      if (!candidates.length) return false;
      hiddenLinks.insertBefore(candidates[candidates.length - 1], hiddenLinks.firstChild);
      return true;
    }

    function moveFirstHiddenToVisible() {
      const firstHidden = hiddenLinks.firstElementChild;
      if (!firstHidden) return false;

      const tail = tailItem();
      if (tail) {
        visibleLinks.insertBefore(firstHidden, tail);
      } else {
        visibleLinks.appendChild(firstHidden);
      }
      return true;
    }

    function availableSpace() {
      const navWidth = nav.clientWidth;
      const buttonWidth = button.classList.contains("hidden") ? 0 : button.offsetWidth + 30;
      return navWidth - buttonWidth;
    }

    function updateNav() {
      if (!nav.offsetParent && getComputedStyle(nav).display === "none") return;

      while (hiddenLinks.firstElementChild) {
        moveFirstHiddenToVisible();
      }

      showButton(false);

      let guard = 0;
      while (visibleLinks.scrollWidth > availableSpace() && nonPersistentVisibleItems().length > 0) {
        showButton(true);
        if (!moveLastVisibleToHidden()) break;
        guard += 1;
        if (guard > 100) break;
      }

      if (!hiddenLinks.children.length) {
        showButton(false);
      } else {
        showButton(true);
      }

      button.setAttribute("count", String(hiddenLinks.children.length));
      updateLayoutOffsets();
    }

    button.addEventListener("click", function (e) {
      e.preventDefault();
      hiddenLinks.classList.toggle("hidden");
      button.classList.toggle("close");
    });

    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target)) {
        hiddenLinks.classList.add("hidden");
        button.classList.remove("close");
      }
    });

    if (themeToggle) {
      themeToggle.addEventListener("click", function (e) {
        e.preventDefault();
        const html = document.documentElement;
        const current = html.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        localStorage.setItem("theme", next);
        applyStoredTheme();
      });
    }

    applyStoredTheme();
    updateNav();

    window.addEventListener("resize", updateNav);

    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", function () {
          if (!localStorage.getItem("theme")) applyStoredTheme();
        });
      } else if (typeof mq.addListener === "function") {
        mq.addListener(function () {
          if (!localStorage.getItem("theme")) applyStoredTheme();
        });
      }
    }

    if (screen.orientation && typeof screen.orientation.addEventListener === "function") {
      screen.orientation.addEventListener("change", updateNav);
    } else {
      window.addEventListener("orientationchange", updateNav);
    }

    window.addEventListener("load", updateNav);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateNav).catch(function () {});
    }

    setTimeout(updateNav, 100);
    setTimeout(updateNav, 300);
  });
})();