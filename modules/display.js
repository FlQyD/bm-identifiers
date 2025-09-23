export async function displayIps(ips) {
    if (ips.length === 0) return;

    const longestIsp = Math.max(...ips.map(identifier => identifier.isp.length));
    const longestIp = Math.max(...ips.map(identifier => identifier.ip.length));

    let identifierElements = await getIdentifiers();
    for (let i = 0; i < identifierElements.length; i++) {
        const element = identifierElements[i];

        const ipElement = element?.firstChild?.firstChild?.lastChild;
        if (!ipElement) continue;

        const ipAddress = ipElement.innerText;
        if (!ipAddress) continue;

        const ip = ips.find(identifier => identifier.ip === ipAddress);
        if (!ip) continue;

        ipElement.innerText = `${ip.ip.padEnd(longestIp + 2)}|  ISP: ${ip.isp.padEnd(longestIsp + 2)}|   ASN: ${ip.asn}`
    }
}

export async function displayStreamerModeName(steamId) {
    if (!steamId) return;

    const streamerModeName = getStreamerModeName(steamId);
    let identifierElements = await getIdentifiers();

    for (const identifier of identifierElements) {
        if (!identifier.innerText.includes("BattlEye GUID")) continue;

        const childNodes = identifier.childNodes;
        reformType(childNodes[1]);

        const smNameElement = childNodes[0].firstChild.firstChild;
        if (streamerModeName === null) return smNameElement.innerText = "Setup streamer mode names!";
        return smNameElement.innerText = streamerModeName;
    }
}
function reformType(type) {
    type.firstChild.innerText = "SM Name";

    type.lastChild.remove(); //Remove org lister
    type.lastChild.remove(); //Remove session button
    type.lastChild.remove(); //Remove copy button
    type.lastChild.remove(); //Remove empty p tag

    const refreshButton = getRefreshButton();
    type.appendChild(refreshButton);
}
function getRefreshButton() {
    const button = document.createElement("button");
    button.classList.add("bmi-settings-button");
    button.title = "Streamer Mode Settings";
    button.addEventListener("click", async () => {
        const { openStreamerModeSettings } = await import(chrome.runtime.getURL('./modules/settings.js'));
        openStreamerModeSettings();
    })

    const img = document.createElement("img");
    img.src = chrome.runtime.getURL('assets/settings.png');
    button.appendChild(img)

    return button;
}
function getStreamerModeName(steamId) {
    const names = JSON.parse(localStorage.getItem("BMI_NAMES"))?.names;
    if (!names) return null;

    let v = BigInt(steamId) % 2147483647n;
    v = v % BigInt(names.length);

    return names[Number(v)];
}
async function getIdentifiers() {
    let identifierElements;
    let count = 0;
    while (!identifierElements || identifierElements.length < 2) { //Wait till the Identifiers load
        if (count > 100) return [];
        await new Promise(r => setTimeout(r, 5 + count));
        count++;

        identifierElements = document.getElementsByTagName("tr")
    }
    return identifierElements;
}