export async function displayIps(ips) {
    if (ips.length === 0) return;

    const longestIsp = Math.max(...ips.map(identifier => identifier.isp.length));
    const longestIp = Math.max(...ips.map(identifier => identifier.ip.length));
    
    let identifierElements;
    while (!identifierElements || identifierElements.length === 0) { //Wait till the Identifiers load
        identifierElements = document.getElementsByClassName("css-q39y9k");
        await new Promise(r => setTimeout(r, 25));
    }

    for (let i = 0; i < identifierElements.length; i++) {
        const element = identifierElements[i];
        const ipAddress = element.innerText;

        const ip = ips.find(identifier => identifier.ip === ipAddress);
        if (!ip) continue;

        element.innerText = `${ip.ip.padEnd(longestIp+2)}|  ISP: ${ip.isp.padEnd(longestIsp+2)}|   ASN: ${ip.asn}`        
    }
}