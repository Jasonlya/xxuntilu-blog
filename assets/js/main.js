(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Storage can be unavailable in private browsing modes.
    }
  }

  function updateThemeButton() {
    var isDark = root.dataset.theme === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.setAttribute("aria-label", isDark ? "切换到浅色模式" : "切换到深色模式");
      button.setAttribute("aria-pressed", String(isDark));
    });
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      storageSet("theme", next);
      updateThemeButton();
    });
  });

  updateThemeButton();

  var mobileToggle = document.querySelector("[data-mobile-toggle]");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMobileMenu() {
    if (!mobileMenu || !mobileToggle) return;
    mobileMenu.classList.remove("is-open");
    mobileToggle.setAttribute("aria-expanded", "false");
  }

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", String(open));
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  var progress = document.getElementById("reading-progress");
  var backToTop = document.getElementById("back-to-top");

  function updateScrollUI() {
    var scrollTop = window.scrollY || window.pageYOffset;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) {
      var ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      progress.style.width = (ratio * 100).toFixed(2) + "%";
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", scrollTop > 600);
    }
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  window.addEventListener("resize", updateScrollUI);
  updateScrollUI();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll(".article-content pre").forEach(function (pre) {
    var code = pre.querySelector("code");
    if (!code) return;

    var button = document.createElement("button");
    button.className = "copy-code";
    button.type = "button";
    button.textContent = "复制";
    button.setAttribute("aria-label", "复制代码");

    button.addEventListener("click", function () {
      var text = code.innerText;
      var done = function () {
        button.textContent = "已复制";
        window.setTimeout(function () {
          button.textContent = "复制";
        }, 1600);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          button.textContent = "复制失败";
        });
        return;
      }

      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      done();
    });

    pre.appendChild(button);
  });

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc-card a[href^='#']"));
  var headings = tocLinks.map(function (link) {
    return document.getElementById(decodeURIComponent(link.getAttribute("href").slice(1)));
  }).filter(Boolean);

  if (headings.length && "IntersectionObserver" in window) {
    var headingMap = new Map(headings.map(function (heading) {
      return [heading.id, heading];
    }));

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (link) {
          link.classList.remove("active");
        });
        tocLinks.forEach(function (link) {
          if (decodeURIComponent(link.getAttribute("href").slice(1)) === entry.target.id) {
            link.classList.add("active");
          }
        });
      });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

    headingMap.forEach(function (heading) {
      observer.observe(heading);
    });
  }

  var searchModal = document.getElementById("search-modal");
  var searchInput = document.getElementById("search-input");
  var searchResults = document.getElementById("search-results");
  var searchOpeners = document.querySelectorAll("[data-search-open]");
  var searchClosers = document.querySelectorAll("[data-search-close]");
  var searchIndexURL = document.body.dataset.searchIndex;
  var searchIndex = null;
  var searchLoading = false;
  var activeResult = -1;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function decodeEntities(value) {
    var textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  }

  function renderSearchMessage(message) {
    if (!searchResults) return;
    searchResults.innerHTML = '<p class="search-hint">' + escapeHtml(message) + "</p>";
  }

  function renderSearchResults(query) {
    if (!searchResults) return;

    var normalized = query.trim().toLowerCase();
    if (!normalized) {
      renderSearchMessage("输入关键词，搜索标题、标签和正文。");
      activeResult = -1;
      return;
    }

    var terms = normalized.split(/\s+/).filter(Boolean);
    var matches = searchIndex.filter(function (item) {
      var haystack = [item.title, item.summary, item.content, (item.tags || []).join(" "), (item.categories || []).join(" ")]
        .join(" ")
        .toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 12);

    if (!matches.length) {
      renderSearchMessage("没有找到匹配的文章，换个关键词试试。");
      activeResult = -1;
      return;
    }

    searchResults.innerHTML = matches.map(function (item, index) {
      return '<a class="search-result" href="' + escapeHtml(item.url) + '" data-search-result="' + index + '">' +
        '<strong>' + escapeHtml(decodeEntities(item.title)) + "</strong>" +
        '<time>' + escapeHtml(item.date) + "</time>" +
        "<p>" + escapeHtml(decodeEntities(item.summary)) + "</p>" +
        "</a>";
    }).join("");

    activeResult = 0;
    updateActiveResult();
  }

  function updateActiveResult() {
    if (!searchResults) return;
    var results = Array.prototype.slice.call(searchResults.querySelectorAll(".search-result"));
    results.forEach(function (result, index) {
      result.classList.toggle("is-active", index === activeResult);
    });
    if (results[activeResult]) {
      results[activeResult].scrollIntoView({ block: "nearest" });
    }
  }

  function loadSearchIndex() {
    if (searchIndex || searchLoading || !searchIndexURL) return Promise.resolve();
    searchLoading = true;
    renderSearchMessage("正在加载搜索索引...");

    return fetch(searchIndexURL)
      .then(function (response) {
        if (!response.ok) throw new Error("Search index request failed");
        return response.json();
      })
      .then(function (data) {
        searchIndex = Array.isArray(data) ? data : [];
        renderSearchMessage("输入关键词，搜索标题、标签和正文。");
      })
      .catch(function () {
        renderSearchMessage("搜索索引加载失败，请刷新页面重试。");
      })
      .finally(function () {
        searchLoading = false;
      });
  }

  function openSearch() {
    if (!searchModal || !searchInput) return;
    searchModal.hidden = false;
    searchModal.setAttribute("aria-hidden", "false");
    body.classList.add("is-locked");
    loadSearchIndex().then(function () {
      searchInput.focus();
      searchInput.select();
    });
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.hidden = true;
    searchModal.setAttribute("aria-hidden", "true");
    body.classList.remove("is-locked");
  }

  searchOpeners.forEach(function (button) {
    button.addEventListener("click", openSearch);
  });

  searchClosers.forEach(function (button) {
    button.addEventListener("click", closeSearch);
  });

  if (searchModal) {
    searchModal.addEventListener("click", function (event) {
      if (event.target === searchModal) closeSearch();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      if (!searchIndex) return;
      renderSearchResults(searchInput.value);
    });

    searchInput.addEventListener("keydown", function (event) {
      if (!searchResults) return;
      var results = searchResults.querySelectorAll(".search-result");
      if (event.key === "ArrowDown" && results.length) {
        event.preventDefault();
        activeResult = Math.min(results.length - 1, activeResult + 1);
        updateActiveResult();
      } else if (event.key === "ArrowUp" && results.length) {
        event.preventDefault();
        activeResult = Math.max(0, activeResult - 1);
        updateActiveResult();
      } else if (event.key === "Enter" && results[activeResult]) {
        event.preventDefault();
        results[activeResult].click();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    var target = event.target;
    var typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

    if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
      event.preventDefault();
      openSearch();
    }

    if (event.key === "Escape") {
      closeSearch();
      closeMobileMenu();
    }
  });
})();
