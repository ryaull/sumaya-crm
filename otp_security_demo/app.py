from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


def calculate_risk(context):
    """Return a beginner-friendly risk summary based on simulated OTP context."""
    risk = 0
    reasons = []

    # Each suspicious signal adds to the total risk score.
    if context.get("new_device"):
        risk += 30
        reasons.append("New device")
    if context.get("unusual_location"):
        risk += 25
        reasons.append("Unusual location")
    if context.get("multiple_requests"):
        risk += 20
        reasons.append("Multiple OTP requests")
    if context.get("suspicious_message"):
        risk += 25
        reasons.append("Suspicious message")

    if risk <= 30:
        level = "LOW"
        warning = "Proceed normally. This seems safe."
        color = "green"
    elif risk <= 70:
        level = "MEDIUM"
        warning = "Be cautious. Make sure you requested this OTP."
        color = "yellow"
    else:
        level = "HIGH"
        warning = "⚠️ STOP! This may be a scam. Do NOT share this OTP."
        color = "red"

    return {
        "score": risk,
        "level": level,
        "warning": warning,
        "color": color,
        "reasons": reasons,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/risk", methods=["POST"])
def get_risk():
    payload = request.get_json(silent=True) or {}
    context = {
        "new_device": bool(payload.get("new_device")),
        "unusual_location": bool(payload.get("unusual_location")),
        "multiple_requests": bool(payload.get("multiple_requests")),
        "suspicious_message": bool(payload.get("suspicious_message")),
    }
    return jsonify(calculate_risk(context))


if __name__ == "__main__":
    app.run(debug=True)
