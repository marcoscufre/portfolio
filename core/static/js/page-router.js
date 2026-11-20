/**
 * Marcos Cufré Portfolio - Seamless SPA Page Router
 * Enables uninterrupted music playback and smooth transitions
 * Inspired by modern Next.js/Radnaabazar app navigation without screen flicker.
 */

(function () {
    let progressBar = null;
    let pageContent = null;
    let isNavigating = false;

    function initProgressBar() {
        if (!document.getElementById("page-progress-bar")) {
            progressBar = document.createElement("div");
            progressBar.id = "page-progress-bar";
            document.body.prepend(progressBar);
        } else {
            progressBar = document.getElementById("page-progress-bar");
        }
    }

    function setProgress(percent) {
        if (!progressBar) initProgressBar();
        progressBar.style.opacity = "1";
        progressBar.style.width = `${percent}%`;
        if (percent >= 100) {
            setTimeout(() => {
                progressBar.style.opacity = "0";
                setTimeout(() => {
                    progressBar.style.width = "0%";
                }, 300);
            }, 200);
        }
    }

    async function navigateTo(url, push = true) {
        if (isNavigating) return;
        pageContent = document.getElementById("page-content");
        if (!pageContent) {
            window.location.href = url;
            return;
        }

        isNavigating = true;
        setProgress(30);

        // Smooth fade out
        pageContent.classList.remove("page-fade-in");
        pageContent.classList.add("page-fade-out");

        try {
            setProgress(60);
            const response = await fetch(url, {
                headers: { 'X-Requested-With': 'SeamlessRouter' }
            });

            if (!response.ok) {
                window.location.href = url;
                return;
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Update Page Title
            if (doc.title) {
                document.title = doc.title;
            }

            const newContent = doc.getElementById("page-content");
            if (!newContent) {
                window.location.href = url;
                return;
            }

            // Small delay for smooth visual transition
            await new Promise(r => setTimeout(r, 120));

            // Replace content while audio keeps playing
            pageContent.innerHTML = newContent.innerHTML;

            if (push) {
                window.history.pushState(null, "", url);
            }

            // Scroll to top or target hash
            const hash = url.includes("#") ? url.substring(url.indexOf("#")) : null;
            if (hash && document.querySelector(hash)) {
                document.querySelector(hash).scrollIntoView({ behavior: "smooth" });
            } else {
                window.scrollTo({ top: 0, behavior: "instant" });
            }

            // Complete progress bar
            setProgress(100);

            // Re-bind interactive features
            reinitializePage();

            // Smooth fade in
            pageContent.classList.remove("page-fade-out");
            pageContent.classList.add("page-fade-in");

        } catch (err) {
            console.warn("Seamless navigation failed, falling back to standard load:", err);
            window.location.href = url;
        } finally {
            isNavigating = false;
        }
    }

    function reinitializePage() {
        // 1. Re-bind portfolio features (Spotlight, Terminal, Local Time, Email Copy)
        if (typeof window.initPortfolioInteractions === "function") {
            window.initPortfolioInteractions();
        }

        // 2. Re-bind music player if bento player exists on the new page
        if (window.portfolioMusicPlayer && typeof window.portfolioMusicPlayer.rebindElements === "function") {
            window.portfolioMusicPlayer.rebindElements();
        }

        // 3. Close mobile navbar if open
        const navbarCollapse = document.getElementById("navbarMain");
        if (navbarCollapse && navbarCollapse.classList.contains("show")) {
            navbarCollapse.classList.remove("show");
        }
    }

    function interceptLinks() {
        document.addEventListener("click", (e) => {
            const anchor = e.target.closest("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href) return;

            // Ignore external links, mailto, tel, target="_blank", downloads
            if (
                anchor.target === "_blank" ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:") ||
                href.startsWith("javascript:") ||
                anchor.hasAttribute("download")
            ) {
                return;
            }

            // Handle internal anchors on the SAME page (e.g. #proyectos)
            const isSamePageAnchor = href.startsWith("#");
            if (isSamePageAnchor) {
                const targetEl = document.querySelector(href);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: "smooth" });
                    return;
                }
            }

            // Check if link is on the same host
            try {
                const url = new URL(href, window.location.origin);
                if (url.origin === window.location.origin) {
                    e.preventDefault();
                    navigateTo(url.pathname + url.search + url.hash);
                }
            } catch (err) {
                // Not a valid URL, let browser handle
            }
        });
    }

    // Handle browser forward/back buttons
    window.addEventListener("popstate", () => {
        navigateTo(window.location.pathname + window.location.search + window.location.hash, false);
    });

    document.addEventListener("DOMContentLoaded", () => {
        initProgressBar();
        interceptLinks();
        pageContent = document.getElementById("page-content");
        if (pageContent) {
            pageContent.classList.add("page-fade-in");
        }
    });

    window.seamlessRouter = { navigateTo };
})();
