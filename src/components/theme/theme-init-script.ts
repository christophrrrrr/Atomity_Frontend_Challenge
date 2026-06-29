/**
 * Runs before paint to apply the persisted (or system) theme, preventing a
 * flash of the wrong color scheme. Injected as a blocking inline script at the
 * top of <body> in the root layout. Kept tiny and dependency-free on purpose.
 */
export const themeInitScript = `(function(){try{var k="atomity-theme";var s=localStorage.getItem(k);var d=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;if(s==="dark"||(!s&&d)){document.documentElement.classList.add("dark");}}catch(e){}})();`;
