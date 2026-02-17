// SAVE STRATEGY
function saveStrategy() {
    const strategy = document.getElementById("strategyInput").value;
    localStorage.setItem("myStrategy", strategy);
    alert("Strategy saved!");
}

// LOAD STRATEGY WHEN PAGE OPENS
window.onload = function () {
    const savedStrategy = localStorage.getItem("myStrategy");
    if (savedStrategy) {
        document.getElementById("strategyInput").value = savedStrategy;
    }
};

// ADD CRITERIA WITH CHECKBOX
function addCriteria() {
    const input = document.getElementById("criteriaInput");
    const value = input.value;

    if (value === "") return;

    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(" " + value));

    document.getElementById("criteriaList").appendChild(li);
    input.value = "";
}

// ADD DEVIL RULE WITH CHECKBOX
function addDevil() {
    const input = document.getElementById("devilInput");
    const value = input.value;

    if (value === "") return;

    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(" " + value));

    document.getElementById("devilList").appendChild(li);
    input.value = "";
}

// EVALUATE TRADE DECISION
function evaluateTrade() {
    const criteria = document.querySelectorAll("#criteriaList input[type='checkbox']");
    const devils = document.querySelectorAll("#devilList input[type='checkbox']");

    let allCriteriaMet = true;
    let devilTriggered = false;

    criteria.forEach(box => {
        if (!box.checked) {
            allCriteriaMet = false;
        }
    });

    devils.forEach(box => {
        if (box.checked) {
            devilTriggered = true;
        }
    });

    const decisionText = document.getElementById("tradeDecision");

    if (devilTriggered) {
        decisionText.textContent = "🚫 NO TRADE — Devil’s rule triggered.";
        decisionText.style.color = "red";
    } 
    else if (!allCriteriaMet) {
        decisionText.textContent = "⚠ Not all criteria met.";
        decisionText.style.color = "orange";
    } 
    else {
        decisionText.textContent = "✅ Trade Approved. Stay disciplined.";
        decisionText.style.color = "lightgreen";
    }
}

// RISK CALCULATOR
function calculateRisk() {
    let balance = document.getElementById("balance").value;
    let riskPercent = document.getElementById("risk").value;

    balance = parseFloat(balance);
    riskPercent = parseFloat(riskPercent);

    if (isNaN(balance) || isNaN(riskPercent)) {
        document.getElementById("result").innerText = "Please enter valid numbers.";
        return;
    }

    let riskAmount = (balance * riskPercent) / 100;

    document.getElementById("result").innerText =
        "You should risk: $" + riskAmount.toFixed(2);
}