export function openStreamerModeSettings() {
    const background = document.createElement("div");
    background.id = "bmi-settings";
    background.classList.add("bmi-settings-background");
    background.addEventListener("click", e => {
        const target = e.target;
        if (target.id !== "bmi-settings") return;

        target.remove();
    })

    const settings = getSettingsPage();
    background.appendChild(settings)

    document.body.appendChild(background)
}

function getSettingsPage() {
    const element = document.createElement("div");
    element.id = "bmi-settings-page";

    const title = document.createElement("h2");
    title.textContent = "Streamer Mode Settings:";
    element.appendChild(title);

    const info = document.createElement("p");
    info.textContent = "";
    element.appendChild(info);

    const url = document.createElement("code");
    url.innerText = `C:\\Program Files (x86)\\Steam\\steamapps\\common\\Rust\\RustClient_Data\\StreamingAssets\\RandomUsernames.json`;
    element.appendChild(url);

    const status = document.createElement("div");
    status.id = "bmi-status";
    const names = localStorage.getItem("BMI_NAMES");
    const lastUpdated = names ? JSON.parse(names).lastUpdated : null;
    if (lastUpdated) status.innerText = `Last updated: ${new Date(lastUpdated).toLocaleString().replace(",", "").substring(0, 16)}`;


    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.id = "bmi-file";
    input.addEventListener("change", fileChanged)

    element.appendChild(input);
    element.appendChild(status);

    return element;
}
async function fileChanged(e) {
    const file = e.target.files && e.target.files[0];
    const status = document.getElementById("bmi-status");
    
    if (!file) {
        status.textContent = "ERROR: No file selected."
        return invokeChange("red");
    };

    const content = await file.text();
    if (!content) {
        status.innerText = "ERROR: Empty file was selected.";
        return invokeChange("red");
    }

    const json = JSON.parse(content);
    const names = json?.RandomUsernames;
    if (!names || typeof (names) !== "object") {
        status.innerText = "ERROR: Invalid file format!";
        return invokeChange("red");
    }

    const obj = {};
    obj.lastUpdated = Date.now();
    obj.names = names;

    localStorage.setItem("BMI_NAMES", JSON.stringify(obj));

    invokeChange("green");
    status.innerText = "Names were stored. Reload in 3 seconds!"
    setTimeout(() => { status.innerText = "Names were stored. Reload in 2 seconds!" }, 1000);
    setTimeout(() => { status.innerText = "Names were stored. Reload in 1 seconds!" }, 2000);
    setTimeout(() => {
        status.innerText = "Names were stored. Reloading..."
        location.reload()
    }, 3000);

}
function invokeChange(type) {
    const settingsPage = document.getElementById("bmi-settings-page");
    settingsPage.classList.add(`${type}-border`);
    setTimeout(() => { settingsPage.classList.remove(`${type}-border`); }, 700);
}