console.log("EXTENSION: bm-identifiers loaded!")

//Extension should fire/refresh on page change
window.addEventListener("load", () => main(window.location.href))
navigation.addEventListener("navigate", (event) => {
    main(event.destination.url);
});
//Extension should fire/refresh on page change

async function main(url) {
    const urlArray = url.split("/");

    if (urlArray[4] && urlArray[4] !== "players") return; //Not player page
    if (!urlArray[5]) return;
    if (!urlArray[6] || urlArray[6] !== "identifiers") return; //Not identifier page

    const bmId = urlArray[5];
    if (isNaN(Number(bmId))) return;

    const { setup } = await import(chrome.runtime.getURL('./modules/setup.js'));
    setup(bmId);
}