console.log("EXTENSION: bm-identifiers loaded!")
const cache = {};

//Extension should fire/refresh on page change
window.addEventListener("load", () => main(window.location.href))
navigation.addEventListener("navigate", (event) => {
    main(event.destination.url);
});
//Extension should fire/refresh on page change

async function main(url) {
    const urlArray = url.split("/");

    if (urlArray[4] && urlArray[4] !== "players") return; //Not player page
    if (!urlArray[5]) return; //Search page

    const bmId = urlArray[5];
    if (isNaN(Number(bmId))) return;

    const authToken = getAuthToken();
    if (!authToken) return;

    const identifiers = await getIdentifiers(bmId, authToken);
    console.log(identifiers);
    

    const { displayIps, displayStreamerModeName } = await import(chrome.runtime.getURL('./modules/display.js'));
    displayStreamerModeName(identifiers.steamId);

    if (!urlArray[6] || urlArray[6] !== "identifiers") return; //Not identifier page
    displayIps(identifiers.ips);
}

function getAuthToken() {
    const authElement = document.getElementById("oauthToken");
    if (!authElement) {
        console.error("Auth wasn't found.")
        return null;
    }
    const authToken = authElement.innerText;
    if (!authToken) {
        console.error("Auth Token is missing.")
        return null;
    }
    
    return authToken;
}
async function getIdentifiers(bmId, authToken) {
    if (cache[bmId]) return cache[bmId]; //Return from cache if already stored!

    const identifiers = await requestIdentifiers(bmId, authToken);
    cache[bmId] = identifiers;  //Save to cache for later use

    return identifiers;
}
async function requestIdentifiers(bmId, authToken, count = 0) {
    if (count > 2) return {};
    try {
        const resp = await fetch(`https://api.battlemetrics.com/players/${bmId}?version=^0.1.0&include=identifier&access_token=${authToken}`)
        if (resp.status !== 200) return;

        const data = await resp.json();
        const returnData = {}

        returnData.ips = data.included
            .filter(identifier => {                
                if (identifier.type !== "identifier") return false;
                if (identifier.attributes?.type !== "ip") return false;
                if (!identifier.attributes.identifier) return false;
                if (!identifier.attributes?.metadata?.connectionInfo) return false;
                return true;
            })
            .map(identifier => {
                return {
                    ip: identifier.attributes.identifier,
                    isp: identifier.attributes.metadata.connectionInfo.isp,
                    asn: identifier.attributes.metadata.connectionInfo.asn
                }
            })
        
        const steamId = data.included.find(identifier => {
            if (identifier.type !== "identifier") return false
            if (!identifier.attributes) return false;
            if (identifier.attributes.type !== "steamID") return false;

            return true;
        })
        
        returnData.steamId = steamId ? steamId.attributes.identifier : null;
        return returnData;
    } catch (error) {
        console.log(error);

        await new Promise(r => { setTimeout(r, 1000); })
        return getIdentifiers(authToken, count++);
    }
}