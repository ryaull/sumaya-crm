const otpSection = document.getElementById("otp-section");
const requestOtpButton = document.getElementById("request-otp-btn");
const otpForm = document.getElementById("otp-form");
const warningBox = document.getElementById("warning-box");
const riskLevel = document.getElementById("risk-level");
const riskScore = document.getElementById("risk-score");
const warningMessage = document.getElementById("warning-message");
const reasonList = document.getElementById("reason-list");

const scenarioSettings = {
    normal: {
        new_device: "false",
        unusual_location: "false",
        multiple_requests: "false",
        suspicious_message: "false",
    },
    suspicious: {
        new_device: "true",
        unusual_location: "false",
        multiple_requests: "true",
        suspicious_message: "false",
    },
    "high-risk": {
        new_device: "true",
        unusual_location: "true",
        multiple_requests: "true",
        suspicious_message: "true",
    },
};

function getContextPayload() {
    // Convert dropdown values into booleans before sending them to Flask.
    return {
        new_device: document.getElementById("new_device").value === "true",
        unusual_location: document.getElementById("unusual_location").value === "true",
        multiple_requests: document.getElementById("multiple_requests").value === "true",
        suspicious_message: document.getElementById("suspicious_message").value === "true",
    };
}

function renderReasons(reasons) {
    reasonList.innerHTML = "";

    if (!reasons.length) {
        const item = document.createElement("li");
        item.textContent = "No suspicious signals were detected.";
        reasonList.appendChild(item);
        return;
    }

    reasons.forEach((reason) => {
        const item = document.createElement("li");
        item.textContent = reason;
        reasonList.appendChild(item);
    });
}

function applyWarningStyle(color) {
    warningBox.classList.remove("warning-green", "warning-yellow", "warning-red");

    if (color === "yellow") {
        warningBox.classList.add("warning-yellow");
    } else if (color === "red") {
        warningBox.classList.add("warning-red");
    } else {
        warningBox.classList.add("warning-green");
    }
}

async function updateRiskDisplay() {
    const response = await fetch("/api/risk", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(getContextPayload()),
    });

    const data = await response.json();

    // Reveal the OTP area only after the user requests a code.
    otpSection.classList.remove("hidden");
    riskLevel.textContent = data.level;
    riskScore.textContent = data.score;
    warningMessage.textContent = data.warning;
    renderReasons(data.reasons);
    applyWarningStyle(data.color);
}

requestOtpButton.addEventListener("click", async () => {
    await updateRiskDisplay();
    document.getElementById("otp").focus();
});

otpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.alert("Demo complete. OTP verification is simulated for this prototype.");
});

document.querySelectorAll(".scenario-btn").forEach((button) => {
    button.addEventListener("click", async () => {
        const scenario = scenarioSettings[button.dataset.scenario];

        Object.entries(scenario).forEach(([key, value]) => {
            document.getElementById(key).value = value;
        });

        await updateRiskDisplay();
    });
});

document.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", async () => {
        if (!otpSection.classList.contains("hidden")) {
            await updateRiskDisplay();
        }
    });
});
