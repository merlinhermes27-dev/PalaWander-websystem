(function () {
    document.documentElement.style.visibility = "hidden";
 
    window.revealPage = function () {
        document.documentElement.style.visibility = "";
    };
 
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            window.location.reload();
        }
    });
 
    // Safety: kung sakaling hindi makapag-load ang Firebase (walang internet),
    // huwag iwanang blangko ang page.
    setTimeout(window.revealPage, 6000);
})();