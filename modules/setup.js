export async function setup(bmId) {    
    const authElement = document.getElementById("oauthToken");
    if (!authElement) {
        console.error("Auth wasn't found.")
        return;
    }
    const authToken = authElement.innerText;
    if (!authToken) {
        console.error("Auth Token is missing.")
        return;
    }

    const identifiers = await getIdentifiers(authToken, bmId);
    if (identifiers.length === 0) return;

    const longestIsp = Math.max(...identifiers.map(identifier => identifier.isp.length));
    const longestIp = Math.max(...identifiers.map(identifier => identifier.ip.length));
    
    let identifierElements;
    while (!identifierElements || identifierElements.length === 0) { //Wait till the Identifiers load
        identifierElements = document.getElementsByClassName("css-q39y9k");
        await new Promise(r => setTimeout(r, 100));
    }

    for (let i = 0; i < identifierElements.length; i++) {
        const element = identifierElements[i];
        const ipAddress = element.innerText;

        const ip = identifiers.find(identifier => identifier.ip === ipAddress);
        if (!ip) continue;

        element.innerText = `${ip.ip.padEnd(longestIp+2)}|  ISP: ${ip.isp.padEnd(longestIsp+2)}|   ASN: ${ip.asn}`        
    }
}

async function getIdentifiers(authToken, bmId, count = 0) {
    if (count > 2) return [];
    try {
        const resp = await fetch(`https://api.battlemetrics.com/players/${bmId}?version=^0.1.0&include=identifier&access_token=${authToken}`)
        if (resp.status !== 200) return;

        const data = await resp.json();
        const returnData = data.included
        .filter(identifier => {
            if (identifier.type !== "identifier") return false;
            if (!identifier.attributes) return false;
            if (identifier.attributes.type !== "ip") return false;
            if (!identifier.attributes.metadata) return false;
            if (!identifier.attributes.metadata.connectionInfo) return false;
            return true;
        })
        .map(identifier => {
            return {
                ip: identifier.attributes.identifier,
                isp: identifier.attributes.metadata.connectionInfo.isp,
                asn: identifier.attributes.metadata.connectionInfo.asn
            }
        })

        return returnData;
    } catch (error) {
        console.log(error);
        
        await new Promise(r => {setTimeout(r, 1000);})
        return getIdentifiers(authToken, count++);
    }
}