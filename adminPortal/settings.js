// 1. Load Current Settings
const loadSettings = async () => {
    try {
        const res = await fetch("http://localhost:3000/settings");
        const settings = await res.json();

        // Set UI State
        document.getElementById("cancellationEnabled").checked = settings.cancellationEnabled;
        document.getElementById("policyType").value = settings.policyType || "midnight";
        document.getElementById("customHours").value = settings.cancellationHoursLimit || 24;

        toggleHoursInput(); // Show/Hide the custom input based on value
    } catch (error) {
        console.error("Error loading settings:", error);
    }
};

// 2. Toggle Input Visibility
const policySelect = document.getElementById("policyType");
const hoursGroup = document.getElementById("hoursInputGroup");

function toggleHoursInput() {
    if (policySelect.value === "hours") {
        hoursGroup.style.display = "block";
    } else {
        hoursGroup.style.display = "none";
    }
}

policySelect.addEventListener("change", toggleHoursInput);

// 3. Save Settings
document.getElementById("settingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newSettings = {
        cancellationEnabled: document.getElementById("cancellationEnabled").checked,
        policyType: document.getElementById("policyType").value,
        cancellationHoursLimit: Number(document.getElementById("customHours").value)
    };

    try {
        await fetch("http://localhost:3000/settings", {
            method: "PUT", // PUT replaces the whole object
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSettings)
        });
        alert("Settings Updated Successfully!");
    } catch (error) {
        alert("Failed to save settings.");
    }
});

loadSettings();