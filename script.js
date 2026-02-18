// -------------------- Missing Button Functions --------------------
function toggleSidebar() {
    console.log('Toggling sidebar');
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        console.log('Sidebar toggled, collapsed class:', sidebar.classList.contains('collapsed'));
    } else {
        console.error('Sidebar not found');
    }
}

function toggleMobileMenu() {
    console.log('Toggling mobile menu');
    const navbarCenter = document.querySelector('.navbar-center');
    if (navbarCenter) {
        if (navbarCenter.style.display === 'flex') {
            navbarCenter.style.display = 'none';
        } else {
            navbarCenter.style.display = 'flex';
            navbarCenter.style.position = 'absolute';
            navbarCenter.style.top = '60px';
            navbarCenter.style.left = '0';
            navbarCenter.style.right = '0';
            navbarCenter.style.background = '#1e293b';
            navbarCenter.style.flexDirection = 'column';
            navbarCenter.style.padding = '10px';
            navbarCenter.style.borderBottom = '1px solid #334155';
        }
    }
}

function navigateTo(section) {
    console.log('Navigating to:', section);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(section + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('Section found and activated:', section + 'Section');
    } else {
        console.error('Section not found:', section + 'Section');
    }
    
    // Update nav buttons - handle both click event and direct calls
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        // Check if this button matches the target section
        if (btn.textContent.toLowerCase().includes(section.toLowerCase()) || 
            (section === 'home' && btn.textContent === 'Home') ||
            (section === 'journal' && btn.textContent === 'Journal') ||
            (section === 'analytics' && btn.textContent === 'Analytics') ||
            (section === 'settings' && btn.textContent === 'Settings')) {
            btn.classList.add('active');
        }
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function applySidebarFilters() {
    console.log('Applying sidebar filters');
    // Implementation needed
}

function clearSidebarFilters() {
    console.log('Clearing sidebar filters');
    // Implementation needed
}

function applyJournalFilters() {
    console.log('Applying journal filters');
    // Implementation needed
}

function clearJournalFilters() {
    console.log('Clearing journal filters');
    // Implementation needed
}

function applyAnalyticsFilters() {
    console.log('Applying analytics filters');
    // Implementation needed
}

function downloadData(format) {
    console.log('Downloading data as', format);
    // Implementation needed
}

function quickStartTrade() {
    console.log('Quick start trade');
    // Implementation needed
}

function saveLogoSettings() {
    console.log('Saving logo settings');
    // Implementation needed
}

function handleLogoUpload(event) {
    console.log('Handling logo upload');
    // Implementation needed
}

function savePromptImageForType() {
    console.log('Saving prompt image for type');
    // Implementation needed
}

function addCriteria() {
    console.log('Adding criteria');
    // Implementation needed
}

function addDevilsLie() {
    console.log('Adding devils lie');
    // Implementation needed
}

function saveAllSettings() {
    savePreTradeSettings();
    saveAccountSettings();
    saveEmotionalSettings();
}

// -------------------- Phase 4 Data --------------------
const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23334155'/%3E%3Ctext x='200' y='100' font-family='Arial' font-size='20' text-anchor='middle' fill='%23e2e8f0'%3EPrompt Image%3C/text%3E%3C/svg%3E";

// Criteria and Devil's Lies
const criteriaList = ["RSI below 30", "Price above 200 MA", "Trend is up"];
const devilList = ["Do not trade during news", "Low liquidity pair", "High spread"];

// Global variables
let prompts = [];
let answers = [];
let promptIndex = 0;
let currentDecision = null; // Store the decision globally

// -------------------- Settings Storage Functions --------------------
function savePreTradeSettings() {
    const settings = {
        minConfluence: minConfluenceInput?.value || 6,
        maxTradesPerDay: maxTradesPerDayInput?.value || 6,
        lossCooldown: lossCooldownInput?.value || 30
    };
    localStorage.setItem('preTradeSettings', JSON.stringify(settings));
}

function loadPreTradeSettings() {
    const settings = JSON.parse(localStorage.getItem('preTradeSettings') || '{}');
    if (minConfluenceInput && settings.minConfluence) minConfluenceInput.value = settings.minConfluence;
    if (maxTradesPerDayInput && settings.maxTradesPerDay) maxTradesPerDayInput.value = settings.maxTradesPerDay;
    if (lossCooldownInput && settings.lossCooldown) lossCooldownInput.value = settings.lossCooldown;
}

function saveAccountSettings() {
    const settings = {
        accountBalance: accountBalanceInput?.value || 10000,
        riskPct: defaultRiskPctInput?.value || 1,
        positionSize: positionSizeInput?.value || 1000,
        dailyMaxLoss: dailyMaxLossInput?.value || 5000
    };
    localStorage.setItem('accountSettings', JSON.stringify(settings));
}

function loadAccountSettings() {
    const settings = JSON.parse(localStorage.getItem('accountSettings') || '{}');
    if (accountBalanceInput && settings.accountBalance) accountBalanceInput.value = settings.accountBalance;
    if (defaultRiskPctInput && settings.riskPct) defaultRiskPctInput.value = settings.riskPct;
    if (positionSizeInput && settings.positionSize) positionSizeInput.value = settings.positionSize;
    if (dailyMaxLossInput && settings.dailyMaxLoss) dailyMaxLossInput.value = settings.dailyMaxLoss;
}

function saveEmotionalSettings() {
    const settings = {
        stability: emotionStabilityInput?.value || 4,
        confidence: emotionConfidenceInput?.value || 3,
        impulse: emotionImpulseInput?.value || 1,
        clarity: emotionClarityInput?.value || 3
    };
    localStorage.setItem('emotionalSettings', JSON.stringify(settings));
}

function loadEmotionalSettings() {
    const settings = JSON.parse(localStorage.getItem('emotionalSettings') || '{}');
    if (emotionStabilityInput && settings.stability) emotionStabilityInput.value = settings.stability;
    if (emotionConfidenceInput && settings.confidence) emotionConfidenceInput.value = settings.confidence;
    if (emotionImpulseInput && settings.impulse) emotionImpulseInput.value = settings.impulse;
    if (emotionClarityInput && settings.clarity) emotionClarityInput.value = settings.clarity;
}

function loadAllSettings() {
    loadPreTradeSettings();
    loadAccountSettings();
    loadEmotionalSettings();
}

// -------------------- Elements --------------------
const strategyInput = document.getElementById("strategyInput");
const strategySavedMessage = document.getElementById("strategySavedMessage");
const startTradeBtn = document.getElementById("startTradeBtn");
const setupType = document.getElementById("setupType");
const minConfluenceInput = document.getElementById("minConfluence");
const maxTradesPerDayInput = document.getElementById("maxTradesPerDay");
const lossCooldownInput = document.getElementById("lossCooldown");
const emotionStabilityInput = document.getElementById("emotion_stability");
const emotionConfidenceInput = document.getElementById("emotion_confidence");
const emotionImpulseInput = document.getElementById("emotion_impulse");
const emotionClarityInput = document.getElementById("emotion_clarity");
const accountBalanceInput = document.getElementById("accountBalance");
const defaultRiskPctInput = document.getElementById("defaultRiskPct");
const positionSizeInput = document.getElementById("positionSize");
const dailyMaxLossInput = document.getElementById("dailyMaxLoss");

// Get all input elements
const promptSection = document.getElementById("promptSection");
const promptText = document.getElementById("promptText");
const promptImage = document.getElementById("promptImage");
const promptSlider = document.getElementById("promptSlider");
const sliderValue = document.getElementById("sliderValue");
const submitSliderBtn = document.getElementById("submitSliderBtn");
const sliderContainer = document.getElementById("sliderContainer");
const numberContainer = document.getElementById("numberContainer");
const textContainer = document.getElementById("textContainer");
const lettersContainer = document.getElementById("lettersContainer");
const promptNumber = document.getElementById("promptNumber");
const promptTextInput = document.getElementById("promptTextInput");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

const decisionSection = document.getElementById("decisionSection");
const finalDecision = document.getElementById("finalDecision");
const restartBtn = document.getElementById("restartBtn");

const journalSection = document.getElementById("journalSection");
const saveJournalBtn = document.getElementById("saveJournalBtn");
const journalMessage = document.getElementById("journalMessage");

const dashboardSection = document.getElementById("dashboardSection");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const viewStrategiesBtn = document.getElementById("viewStrategiesBtn");
const alertsContainer = document.getElementById('alertsContainer');
const weeklyReportBtn = document.getElementById('weeklyReportBtn');
const monthlyReportBtn = document.getElementById('monthlyReportBtn');
const reportContainer = document.getElementById('reportContainer');

// -------------------- UI Helpers --------------------
function showToast(message, duration = 2500) {
    let t = document.getElementById('globalToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'globalToast';
        t.style.position = 'fixed';
        t.style.left = '50%';
        t.style.transform = 'translateX(-50%)';
        t.style.bottom = '24px';
        t.style.background = 'rgba(0,0,0,0.85)';
        t.style.color = '#fff';
        t.style.padding = '8px 12px';
        t.style.borderRadius = '8px';
        t.style.zIndex = 99999;
        t.style.fontSize = '13px';
        t.style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)';
        document.body.appendChild(t);
    }
    t.textContent = message;
    t.style.display = 'block';
    clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(() => { t.style.display = 'none'; }, duration);
}

// -------------------- Phase 3: Hard Discipline Engine Helpers --------------------
// Storage helpers for Phase 3
function loadRules() {
    return JSON.parse(localStorage.getItem('rules') || '[]');
}
function saveRules(rules) {
    localStorage.setItem('rules', JSON.stringify(rules));
}
function loadRiskSettings() {
    return JSON.parse(localStorage.getItem('riskSettings') || '{}');
}
function saveRiskSettings(s) {
    localStorage.setItem('riskSettings', JSON.stringify(s));
}
function getTradeHistory() { return JSON.parse(localStorage.getItem('tradeHistory') || '[]'); }
function addTradeHistoryEntry(entry) { const h = getTradeHistory(); h.push(entry); localStorage.setItem('tradeHistory', JSON.stringify(h)); }

// Rules & Risk UI handlers
function openRulesModal() {
    const el = document.getElementById('rulesModal'); if (!el) return; el.style.display = 'flex'; renderRulesList();
}
function closeRulesModal() { const el = document.getElementById('rulesModal'); if (!el) return; el.style.display = 'none'; }
function saveRuleFromModal() {
    const name = (document.getElementById('rule_strategyName')||{}).value || '';
    const minRR = parseFloat((document.getElementById('rule_minRR')||{}).value) || 0;
    const allowed = ((document.getElementById('rule_allowedSessions')||{}).value || '').split(',').map(s=>s.trim()).filter(Boolean);
    if (!name) { showToast('Please enter a strategy name',2000); return; }
    const rules = loadRules();
    rules.push({ strategyName: name, minRR, allowedSessions: allowed });
    saveRules(rules); renderRulesList(); showToast('Rule saved',1500);
}
function renderRulesList() {
    const listEl = document.getElementById('rulesList'); if (!listEl) return; const rules = loadRules(); listEl.innerHTML = '';
    rules.forEach((r,i)=>{
        const row = document.createElement('div'); row.className='rule-row';
        row.innerHTML = `<strong>${r.strategyName}</strong> — minRR: ${r.minRR || 0} | sessions: ${ (r.allowedSessions||[]).join(',') } <button onclick="deleteRule(${i})" style="float:right">Delete</button>`;
        listEl.appendChild(row);
    });
}
function deleteRule(i) { const rules = loadRules(); rules.splice(i,1); saveRules(rules); renderRulesList(); }

function openRiskModal() { const el = document.getElementById('riskModal'); if (!el) return; el.style.display='flex';
    const s = loadRiskSettings(); document.getElementById('risk_maxRiskPerTrade').value = s.maxRiskPerTrade || defaultRiskPctInput.value || '';
    document.getElementById('risk_maxDailyLoss').value = s.maxDailyLoss || dailyMaxLossInput.value || '';
    document.getElementById('risk_maxDrawdown').value = s.maxDrawdown || '';
}
function closeRiskModal() { const el = document.getElementById('riskModal'); if (!el) return; el.style.display='none'; }
function saveRiskModal() { const s = { maxRiskPerTrade: parseFloat(document.getElementById('risk_maxRiskPerTrade').value) || 0, maxDailyLoss: parseFloat(document.getElementById('risk_maxDailyLoss').value) || 0, maxDrawdown: parseFloat(document.getElementById('risk_maxDrawdown').value) || 0 }; saveRiskSettings(s); closeRiskModal(); showToast('Risk settings saved',1500); }

// Reflection modal handlers
function openReflectionModal(reason, tradeIdea) {
    const el = document.getElementById('reflectionModal');
    if (!el) return;
    document.getElementById('reflectionReason').textContent = reason;
    el.style.display = 'flex';
    // store temporarily the tradeIdea on the modal element
    el._tradeIdea = tradeIdea || null;
}
function closeReflectionModal() {
    const el = document.getElementById('reflectionModal'); if (!el) return; el.style.display = 'none'; el._tradeIdea = null;
}
function submitReflection() {
    const why = document.getElementById('reflectionWhy').value || '';
    const rule = document.getElementById('reflectionRule').value || '';
    const el = document.getElementById('reflectionModal'); if (!el) return;
    const tradeIdea = el._tradeIdea || {};
    const entry = { id: 'ref-' + Date.now(), time: new Date().toISOString(), tradeIdea, reason: document.getElementById('reflectionReason').textContent || '', why, ruleBroken: rule };
    addTradeHistoryEntry(entry);
    closeReflectionModal();
    showToast('Reflection saved. Trading locked until next session.', 3200);
    lockTrading('Reflection required');
}

// -------------------- Phase 3: Validators and Scoring --------------------
// Safe input getter for environments without the full DOM (test runner)
function getInputNumber(id, fallback = 0) {
    try {
        const el = document.getElementById(id);
        if (!el) return fallback;
        const v = parseFloat(el.value);
        return isNaN(v) ? fallback : v;
    } catch (e) { return fallback; }
}

function checkStrategyRules(tradeIdea, rules) {
    // rules: array of rule objects; here find a rule matching strategy name
    if (!rules || !rules.length) return { ok: true };
    const rule = rules.find(r => r.strategyName === (tradeIdea.strategy || strategyInput.value));
    if (!rule) return { ok: true };
    // check allowed sessions
    if (rule.allowedSessions && rule.allowedSessions.length) {
        if (!rule.allowedSessions.includes(tradeIdea.session)) return { ok: false, reason: 'Session not allowed by strategy' };
    }
    // check min RR
    if (rule.minRR && tradeIdea.sl && tradeIdea.tp && tradeIdea.entry) {
        const rr = Math.abs((tradeIdea.tp - tradeIdea.entry) / (tradeIdea.entry - tradeIdea.sl));
        if (rr < rule.minRR) return { ok: false, reason: 'Risk/Reward below minimum' };
    }
    // required confluences (basic check against computeConfluenceScore)
    if (rule.requiredConfluences && rule.requiredConfluences.length) {
        const { score, selected } = computeConfluenceScore();
        const present = rule.requiredConfluences.every(rc => selected.some(s => s.key && s.key.toLowerCase().includes(rc.toLowerCase())));
        if (!present) return { ok: false, reason: 'Required confluence missing' };
    }
    return { ok: true };
}

function checkRiskLimits(tradeIdea, riskSettings) {
    const account = getInputNumber('accountBalance', 0);
    const maxRiskPct = (riskSettings && riskSettings.maxRiskPerTrade) ? riskSettings.maxRiskPerTrade : getInputNumber('defaultRiskPct', 1);
    if (!tradeIdea.sl || !tradeIdea.entry) return { ok: true };
    // approximate pip risk in currency units: positionSize * (entry - sl)
    const pos = parseFloat(tradeIdea.lotSize || getInputNumber('positionSize', 0)) || 0;
    const riskPerUnit = Math.abs(tradeIdea.entry - tradeIdea.sl) || 0;
    const riskCurrency = pos * riskPerUnit;
    const riskPct = account ? (riskCurrency / account) * 100 : 0;
    if (riskPct > maxRiskPct) return { ok: false, reason: `Risk per trade ${riskPct.toFixed(2)}% exceeds max ${maxRiskPct}%` };

    // daily loss check against dailyMaxLossInput
    const todayTrades = getTodayTrades();
    let dailyPL = 0; todayTrades.forEach(t => dailyPL += (parseFloat(t.tp||0) - parseFloat(t.entry||0)));
    const projected = dailyPL - riskCurrency;
    const dailyMax = getInputNumber('dailyMaxLoss', 0);
    if (dailyMax > 0 && projected <= -Math.abs(dailyMax)) return { ok: false, reason: 'Daily max loss would be exceeded' };

    return { ok: true };
}

function checkBehavior(tradeIdea, history) {
    // emotional state block
    const emo = (tradeIdea.emotion || '').toLowerCase();
    const blockedEmotions = ['angry','frustrated','revenge','fomo'];
    if (blockedEmotions.includes(emo)) return { ok: false, reason: 'Emotional state not suitable' };

    // overtrading
    const todayCount = getTodayTrades().length;
    const maxTrades = parseInt((document.getElementById('maxTradesPerDay')||{}).value||'999',10) || 999;
    if (todayCount >= maxTrades) return { ok: false, reason: 'Max trades per day reached' };

    // revenge trading: last trade was a loss and lot size increased
    const last = getLastTrade();
    if (last) {
        const lastPL = parseFloat(last.tp||0) - parseFloat(last.entry||0);
        if (lastPL < 0 && tradeIdea.lotSize && last.positionSize && parseFloat(tradeIdea.lotSize) > parseFloat(last.positionSize||0)) {
            return { ok: false, reason: 'Possible revenge trading detected' };
        }
    }

    // consecutive same-direction trades
    const all = getAllTrades();
    if (all.length >= 2) {
        const lastDir = all[all.length-1].direction || null;
        const prevDir = all[all.length-2].direction || null;
        if (lastDir && prevDir && lastDir === prevDir && lastDir === tradeIdea.direction) {
            // optional: allow, but flag
            return { ok: false, reason: 'Multiple consecutive trades in same direction' };
        }
    }

    return { ok: true };
}

function applyDisciplineScore(history) {
    // simple heuristic: start 100, subtract for incidents
    let score = 100;
    history.forEach(h => {
        if (h.reason && h.reason.toLowerCase().includes('overtrade')) score -= 8;
        if (h.reason && h.reason.toLowerCase().includes('revenge')) score -= 10;
        if (h.ruleBroken) score -= 6;
        if (h.emotion && ['angry','frustrated','fomo','revenge'].includes((h.emotion||'').toLowerCase())) score -= 7;
    });
    score = Math.max(0, Math.min(100, score));
    localStorage.setItem('disciplineScore', JSON.stringify({score, updated: new Date().toISOString()}));
    return score;
}

// Main orchestrator: approve or block a trade idea
function approveOrBlockTrade(tradeIdea) {
    if (tradingLocked) { showToast('Trading is locked', 2200); return false; }
    const rules = loadRules();
    const riskSettings = loadRiskSettings();
    const history = getTradeHistory();

    const sres = checkStrategyRules(tradeIdea, rules);
    if (!sres.ok) { openReflectionModal(sres.reason, tradeIdea); addTradeHistoryEntry({ id: 'blk-' + Date.now(), time: new Date().toISOString(), tradeIdea, reason: sres.reason }); return false; }

    const rres = checkRiskLimits(tradeIdea, riskSettings);
    if (!rres.ok) { openReflectionModal(rres.reason, tradeIdea); addTradeHistoryEntry({ id: 'blk-' + Date.now(), time: new Date().toISOString(), tradeIdea, reason: rres.reason }); return false; }

    const bres = checkBehavior(tradeIdea, history);
    if (!bres.ok) { openReflectionModal(bres.reason, tradeIdea); addTradeHistoryEntry({ id: 'blk-' + Date.now(), time: new Date().toISOString(), tradeIdea, reason: bres.reason }); return false; }

    // update discipline score conservatively
    applyDisciplineScore(history.slice(-30));
    // Go directly to prompts without showing toast
    return true;
}

// -------------------- Strategy --------------------
function loadStrategy() {
    const saved = localStorage.getItem("myStrategy") || "";
    console.log('🔍 Loading strategy from localStorage:', saved);
    strategyInput.value = saved;
    startTradeBtn.disabled = saved ? false : true;
    
    // Show current strategy status
    if (saved) {
        console.log('✅ Strategy found and loaded');
    } else {
        console.log('❌ No strategy found in localStorage');
    }
}

function saveStrategy() {
    console.log('🔍 saveStrategy called, text:', strategyInput.value.trim());
    const text = strategyInput.value.trim();
    if (!text) {
        strategySavedMessage.textContent = "Please type your strategy first.";
        strategySavedMessage.style.color = "#ef4444";
        return;
    }
    
    // Save to localStorage
    localStorage.setItem("myStrategy", text);
    console.log('🔍 Strategy saved to localStorage:', text);
    
    // Verify it was saved
    const verify = localStorage.getItem("myStrategy");
    console.log('🔍 Verification - saved strategy:', verify);
    
    // Update UI
    strategySavedMessage.textContent = "Strategy saved!";
    strategySavedMessage.style.color = "#22c55e";
    
    // Enable start trade button
    if (startTradeBtn) {
        startTradeBtn.disabled = false;
    }
    
    // Show success feedback
    setTimeout(() => {
        strategySavedMessage.textContent = "";
    }, 3000);
    
    // Log success
    console.log('✅ Strategy save completed successfully!');
}

function startPrompts() {
    console.log('startPrompts called');
    
    // Debug: Show what's saved in localStorage
    console.log('=== DEBUG: Saved Settings ===');
    console.log('Trading Criteria:', JSON.parse(localStorage.getItem('tradingCriteria') || '[]'));
    console.log('Devils Lies:', JSON.parse(localStorage.getItem('devilsLies') || '[]'));
    console.log('Strategy Rules:', JSON.parse(localStorage.getItem('strategyRules') || '{}'));
    console.log('Risk Settings:', JSON.parse(localStorage.getItem('riskSettings') || '{}'));
    console.log('Emotional Settings:', JSON.parse(localStorage.getItem('emotionalSettings') || '{}'));
    console.log('==========================');
    
    // Run strict pre-trade validation before starting prompts
    if (!preTradeValidation()) {
        console.log('❌ Pre-trade validation failed');
        return;
    }
    
    console.log('✅ Pre-trade validation passed, showing prompts...');
    
    // DO NOT block navigation - remove any blocking mechanisms
    // window.preventAutoNav = true; // REMOVED - This was blocking navigation
    
    // Use consistent navigation system - hide all sections first and show prompt section
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    try { document.getElementById("strategySection").classList.add("hidden"); } catch(e){};
    try { journalSection.classList.add("hidden"); } catch(e){};
    try { decisionSection.classList.add("hidden"); } catch(e){};
    try { dashboardSection.classList.add("hidden"); } catch(e){};
    // Show prompt section both by removing legacy 'hidden' and adding phase5 'active'
    promptSection.classList.remove("hidden");
    promptSection.classList.add('active');

    // Build comprehensive prompt sequence
    buildPromptSequence();
    console.log('Built prompt sequence, prompts.length:', prompts.length);
    
    answers = [];
    promptIndex = 0;
    showPrompt();
}

// Navigation functions for prompt flow
function goToPreviousPrompt() {
    console.log('Going to previous prompt, current index:', promptIndex);
    if (promptIndex > 0) {
        promptIndex--;
        showPrompt();
    }
}

function goToNextPrompt() {
    console.log('Going to next prompt, current index:', promptIndex);
    if (promptIndex < prompts.length - 1) {
        promptIndex++;
        showPrompt();
    }
}

// -------------------- Simplified Prompt Image System --------------------
let currentPromptImageData = null;

// Simple test function to bypass any issues
function testImageUpload() {
    console.log('=== SIMPLE TEST FUNCTION ===');
    const fileInput = document.getElementById('promptImageUpload');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        console.log('🔍 Simple test - File found:', file.name);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('🔍 Simple test - FileReader completed');
            currentPromptImageData = e.target.result;
            document.getElementById('promptImageFileName').textContent = `Selected: ${file.name}`;
            console.log('🔍 Simple test - Image data SET!');
        };
        reader.readAsDataURL(file);
    }
}

// Global test for function accessibility
window.testHandlePromptImageUpload = function() {
    console.log('🔍 Global test - handlePromptImageUpload exists:', typeof handlePromptImageUpload);
    console.log('🔍 Global test - function location:', handlePromptImageUpload.toString().substring(0, 100));
};

function handlePromptImageUploadFIXED(event) {
    try {
        const fileInput = document.getElementById('promptImageUpload');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            const reader = new FileReader();
            reader.onload = function(e) {
                currentPromptImageData = e.target.result;
                document.getElementById('promptImageFileName').textContent = `Selected: ${file.name}`;
            };
            reader.readAsDataURL(file);
        }
    } catch(error) {
        console.error('Error in image upload:', error);
    }
}

// Keep original for compatibility but redirect to fixed version
function handlePromptImageUpload(event) {
    console.log('🔍 Original function called, redirecting...');
    handlePromptImageUploadFIXED(event);
}

function savePromptImageForType() {
    const promptType = document.getElementById('promptTypeSelect').value;
    
    if (!promptType) {
        alert('Please select a prompt type first.');
        return;
    }
    
    if (!currentPromptImageData) {
        alert('Please select an image first.');
        return;
    }
    
    // Get existing prompt images
    const promptImages = JSON.parse(localStorage.getItem('promptImages') || '{}');
    
    // Save image for the selected prompt type
    promptImages[promptType] = {
        type: promptType,
        data: currentPromptImageData,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('promptImages', JSON.stringify(promptImages));
    
    // Clear the form
    currentPromptImageData = null;
    document.getElementById('promptImageFileName').textContent = '';
    document.getElementById('promptImageUpload').value = '';
    document.getElementById('promptTypeSelect').value = '';
    
    // Update the display
    displayPromptImages();
    
    alert('Image saved successfully for ' + getPromptTypeName(promptType));
}

function getPromptTypeName(type) {
    const names = {
        'strategy': 'Strategy Alignment',
        'criteria': 'Trading Criteria',
        'devil': 'Devil\'s Traps',
        'bullishStructure': 'Identified bullish or bearish HTF structure',
        'bearishStructure': 'Identified bullish or bearish HTF structure',
        'liquidity': 'Identified liquidity roadmap',
        'dol': 'Identified DOL',
        'pdArray': 'Identified PD array',
        'ltfChoice': 'Identified LTF CHOCH',
        'opposingLiquidity': 'Identified opposing liquidity on HTF',
        'failureStructure': 'failure structure in orderflow',
        'predeterminedLiquidity': 'predetermined liquidity and PD array not taken',
        'mitigatedPD': 'PD array already mitigated',
        'dolMitigated': 'DOL mitigated'
    };
    return names[type] || type;
}

function getPromptImage(promptType, subType = null) {
    const promptImages = JSON.parse(localStorage.getItem('promptImages') || '{}');
    if (subType && promptImages[promptType] && promptImages[promptType][subType]) {
        return promptImages[promptType][subType].data;
    }
    return promptImages[promptType] ? promptImages[promptType].data : null;
}

function displayPromptImages() {
    const container = document.getElementById('promptImagesList');
    if (!container) return;
    
    const promptImages = JSON.parse(localStorage.getItem('promptImages') || '{}');
    const imageTypes = Object.keys(promptImages);
    
    if (imageTypes.length === 0) {
        container.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 20px;">No images uploaded yet</div>';
        return;
    }
    
    let html = '';
    imageTypes.forEach(type => {
        const image = promptImages[type];
        const date = new Date(image.timestamp).toLocaleDateString();
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #334155;">
                <div>
                    <strong>${getPromptTypeName(type)}</strong>
                    <div style="font-size: 11px; color: #94a3b8;">Added: ${date}</div>
                </div>
                <button class="btn-secondary btn-small" onclick="deletePromptImage('${type}')">Remove</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Update dropdown to show which prompts have images
    updatePromptImageDropdown();
}

function updatePromptImageDropdown() {
    const promptImages = JSON.parse(localStorage.getItem('promptImages') || '{}');
    const select = document.getElementById('promptTypeSelect');
    if (!select) return;
    
    // Update each option to show image status
    const options = select.querySelectorAll('option');
    options.forEach(option => {
        const type = option.value;
        if (type && promptImages[type]) {
            // Add visual indicator for saved images
            option.textContent = option.textContent.replace('📋', '📋✅').replace('🚫', '🚫✅');
            option.style.color = '#22c55e';
            option.style.fontWeight = 'bold';
        } else if (type) {
            // Reset to normal state
            option.textContent = option.textContent.replace('✅', '').replace('📋', '📋').replace('🚫', '🚫');
            option.style.color = '';
            option.style.fontWeight = '';
        }
    });
}

function deletePromptImage(promptType) {
    if (!confirm('Remove this image?')) return;
    
    const promptImages = JSON.parse(localStorage.getItem('promptImages') || '{}');
    delete promptImages[promptType];
    localStorage.setItem('promptImages', JSON.stringify(promptImages));
    
    displayPromptImages();
}

// Update getStrategyImage to use new system
function getStrategyImage() {
    return getPromptImage('strategy') || placeholderImage;
}

// -------------------- Build Prompt Sequence --------------------
function buildPromptSequence() {
    prompts = [];
    
    // 0. Strategy Alignment Prompt - ALWAYS FIRST
    prompts.push({
        text: "📋 Is this trade in line with your trading strategy?",
        type: "strategy",
        image: getPromptImage('strategy')
    });
    
    // 1. Trading Criteria prompts (using saved criteria - EXACT ORDER)
    const tradingCriteria = getTradingCriteria();
    tradingCriteria.forEach((criterion, index) => {
        prompts.push({
            text: "📋 Trading Criteria: " + criterion,
            type: "criteria",
            image: getPromptImage('criteria', criterion)
        });
    });
    
    // 2. Devil's trap prompts (using saved data - EXACT ORDER)
    const devilLies = getDevilsLiePatterns();
    devilLies.forEach((lie, index) => {
        const riskLevel = lie.riskLevel || lie.risk || 'Unknown';
        const promptText = lie.pattern + " (" + riskLevel + " risk)";
        prompts.push({
            text: "🚫 Devil's Trap: " + promptText,
            type: "devil",
            image: getPromptImage('devil', lie.pattern)
        });
    });
    
    // 3. Strategy Rules prompts (using saved rules - EXACT ORDER)
    const strategyRules = getStrategyRules();
    if (Array.isArray(strategyRules)) {
        strategyRules.forEach((rule, index) => {
            // Min R:R prompt
            prompts.push({
                text: "⚖️ Strategy Rule - Min R:R for " + rule.strategyName + "? (Current: " + (rule.minRR || 'Not Set') + ")",
                type: "minRR",
                rule: rule,
                inputType: "number",
                image: getPromptImage('minRR')
            });
            // Allowed sessions prompt
            prompts.push({
                text: "⚖️ Strategy Rule - Allowed trading sessions for " + rule.strategyName + "?",
                type: "sessions",
                rule: rule,
                inputType: "text",
                image: getPromptImage('sessions')
            });
        });
    } else if (strategyRules && strategyRules.strategyName) {
        // Handle single rule object
        // Min R:R prompt
        prompts.push({
            text: "⚖️ Strategy Rule - Min R:R for " + strategyRules.strategyName + "? (Current: " + (strategyRules.minRR || 'Not Set') + ")",
            type: "minRR",
            rule: strategyRules,
            inputType: "number",
            image: getPromptImage('minRR')
        });
        // Allowed sessions prompt
        prompts.push({
            text: "⚖️ Strategy Rule - Allowed trading sessions for " + strategyRules.strategyName + "?",
            type: "sessions",
            rule: strategyRules,
            inputType: "text",
            image: getPromptImage('sessions')
        });
    }
    
    // 4. Risk Management prompts (using saved risk settings - EXACT ORDER)
    const riskSettings = getRiskSettings();
    if (riskSettings.maxRiskPerTrade) {
        const promptText = "Is position size within " + riskSettings.maxRiskPerTrade + "% max risk per trade?";
        prompts.push({
            text: "💰 Risk Management: " + promptText,
            type: "risk",
            image: getPromptImage('risk')
        });
    }
    if (riskSettings.maxDailyLoss) {
        const promptText = "Is potential loss within daily limit of $" + riskSettings.maxDailyLoss + "?";
        prompts.push({
            text: "💰 Risk Management: " + promptText,
            type: "risk",
            image: getPromptImage('risk')
        });
    }
    if (riskSettings.maxDrawdown) {
        const promptText = "Is drawdown within " + riskSettings.maxDrawdown + "% limit?";
        prompts.push({
            text: "💰 Risk Management: " + promptText,
            type: "risk",
            image: getPromptImage('risk')
        });
    }
    
    // 5. Emotion check prompts (using saved emotional settings - EXACT ORDER)
    const emotionalSettings = getEmotionalSettings();
    // Stability number input
    prompts.push({
        text: "😊 Psychological State - Stability (1-5, where 5 is most stable)",
        type: "stability",
        inputType: "number",
        min: 1,
        max: 5,
        step: 1,
        defaultValue: emotionalSettings.stability,
        image: getPromptImage('stability')
    });
    // Confidence number input
    prompts.push({
        text: "😊 Psychological State - Confidence (1-5, where 5 is most confident)",
        type: "confidence",
        inputType: "number", 
        min: 1,
        max: 5,
        step: 1,
        defaultValue: emotionalSettings.confidence,
        image: getPromptImage('confidence')
    });
    // Clarity number input
    prompts.push({
        text: "😊 Psychological State - Clarity (1-5, where 5 is clearest thinking)",
        type: "clarity",
        inputType: "number",
        min: 1,
        max: 5,
        step: 1,
        defaultValue: emotionalSettings.clarity || 3,
        image: getPromptImage('clarity')
    });
    
    // 6. Psychological Trade Grade prompt
    prompts.push({
        text: "🎓 Overall Psychological Trade Grade (A=Best, B=Good, C=Average, D=Poor, F=Fail)",
        type: "psychologicalGrade",
        inputType: "letters",
        image: getPromptImage('psychologicalGrade')
    });
}

function getStrategyRules() {
    const saved = JSON.parse(localStorage.getItem('rules') || '{}');
    // Handle both single object and array of objects
    if (Array.isArray(saved)) {
        return saved;
    } else if (saved && saved.strategyName) {
        return saved; // Single object
    }
    return []; // Empty if nothing saved
}

function getRiskSettings() {
    return JSON.parse(localStorage.getItem('riskSettings') || '{}');
}

function getEmotionalSettings() {
    return JSON.parse(localStorage.getItem('emotionalSettings') || '{"stability": 4, "confidence": 3, "impulse": 1, "clarity": 3}');
}

function getStrategyImage() {
    // Get custom strategy image or return default
    const savedImages = JSON.parse(localStorage.getItem('promptImages') || '[]');
    const strategyImage = savedImages.find(img => img.title.toLowerCase().includes('strategy'));
    return strategyImage ? strategyImage.data : placeholderImage;
}

function getDevilsLiePatterns() {
    // Check for the correct key used in settings
    const saved = JSON.parse(localStorage.getItem('devilsLies') || '[]');
    if (saved.length === 0) {
        // Return default patterns if none saved
        return [
            { id: 1, pattern: "Trading during high impact news", risk: "High" },
            { id: 2, pattern: "Chasing price after strong move", risk: "High" },
            { id: 3, pattern: "Trading against dominant trend", risk: "Medium" },
            { id: 4, pattern: "Over-leveraging position size", risk: "High" },
            { id: 5, pattern: "Revenge trading after loss", risk: "High" }
        ];
    }
    return saved;
}

function getTradingCriteria() {
    const saved = JSON.parse(localStorage.getItem('tradingCriteria') || '[]');
    if (saved.length === 0) {
        // Return default criteria if none saved
        return [
            "Market structure supports setup",
            "Key level identified and respected",
            "Risk/reward ratio at least 1:2",
            "Multiple timeframe alignment",
            "Volume confirms price action",
            "No conflicting economic news"
        ];
    }
    return saved;
}

// -------------------- Pre-Trade Discipline Engine (Strict) --------------------
function computeConfluenceScore() {
    const rows = document.querySelectorAll('.confluence-row');
    let score = 0;
    let selected = [];
    rows.forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        const key = checkbox.dataset.key || checkbox.id;
        const weightSelect = row.querySelector('.conf-weight');
        const weight = weightSelect ? parseInt(weightSelect.value, 10) : 0;
        if (checkbox.checked) {
            score += weight;
            selected.push({ key, weight });
        }
    });
    return { score, selected };
}
function checkDevilTraps() {
    // any checked devil trap blocks trade in strict mode
    const newsEl = document.getElementById('dev_news');
    const liqEl = document.getElementById('dev_liquidity');
    const news = newsEl ? !!newsEl.checked : false;
    const liq = liqEl ? !!liqEl.checked : false;
    return { news, liq, blocked: news || liq };
}

function getTodayTrades() {
    const all = JSON.parse(localStorage.getItem('tradeJournals') || '[]');
    const today = new Date().toDateString();
    return all.filter(t => new Date(t.date).toDateString() === today);
}

function getLastTrade() {
    const all = JSON.parse(localStorage.getItem('tradeJournals') || '[]');
    if (!all.length) return null;
    return all[all.length - 1];
}

function preTradeValidation() {
    // compute confluence
    const confRows = document.querySelectorAll('.confluence-row');
    if (confRows.length > 0) {
        const { score, selected } = computeConfluenceScore();
        const minScore = parseInt(minConfluenceInput.value, 10) || 0;
        if (score < minScore) {
            alert('Blocked: Confluence score ' + score + ' is below minimum ' + minScore + '.');
            startTradeBtn.disabled = true;
            return false;
        }
    }
    
    // devil traps
    const dev = checkDevilTraps();
    if (dev.blocked) {
        alert('Blocked: Devil trap detected (news or low liquidity).');
        startTradeBtn.disabled = true;
        return false;
    }
    
    // max trades per day
    const maxTrades = parseInt(maxTradesPerDayInput.value, 10) || 999;
    const todayCount = getTodayTrades().length;
    if (todayCount >= maxTrades) {
        alert('Blocked: Max trades per day reached (' + todayCount + ').');
        startTradeBtn.disabled = true;
        return false;
    }
    
    // loss cooldown
    const cooldown = parseInt(lossCooldownInput.value, 10) || 0;
    const last = getLastTrade();
    if (last && last.result === 'Loss' && cooldown > 0) {
        const lastTime = new Date(last.date).getTime();
        const now = Date.now();
        const minutesSince = (now - lastTime) / 60000;
        if (minutesSince < cooldown) {
            alert('Blocked: Loss cooldown in effect (' + Math.round(minutesSince) + ' min since last loss).');
            startTradeBtn.disabled = true;
            return false;
        }
    }
    
    // emotional gate basic check
    const emoImp = parseInt(emotionImpulseInput.value, 10) || 0;
    if (emoImp >= 4) {
        alert('Blocked: Impulse urge is high (' + emoImp + '). Wait and reassess.');
        startTradeBtn.disabled = true;
        return false;
    }
    
    // passed all strict checks
    startTradeBtn.disabled = false;
    return true;
}

// -------------------- Storage & Data Model Helpers --------------------
function getAllTrades() {
    return JSON.parse(localStorage.getItem('tradeJournals') || '[]');
}

function saveTradeEntry(trade) {
    const all = getAllTrades();
    all.push(trade);
    localStorage.setItem('tradeJournals', JSON.stringify(all));
}

// -------------------- Analytics & Behavior Detection --------------------
function computeCoreMetrics(all) {
    const totalTrades = all.length;
    let wins = 0, losses = 0, totalPL = 0, grossWin = 0, grossLoss = 0;
    let rSum = 0, rCount = 0;

    all.forEach(t => {
        const pl = parseFloat(t.tp) - parseFloat(t.entry);
        totalPL += pl;
        if (pl > 0) { wins++; grossWin += pl; }
        else if (pl < 0) { losses++; grossLoss += Math.abs(pl); }
        if (t.rr) { rSum += t.rr; rCount++; }
    });

    const winRate = totalTrades ? (wins / totalTrades) * 100 : 0;
    const profitFactor = grossLoss === 0 ? (grossWin || 0) : (grossWin / grossLoss);
    const avgR = rCount ? (rSum / rCount) : 0;

    return { totalTrades, wins, losses, totalPL, profitFactor: Number(profitFactor.toFixed(2)), winRate: Number(winRate.toFixed(1)), avgR: Number(avgR.toFixed(2)) };
}

function computeBehaviorMetrics(all) {
    // Win rate by confidence and emotion stability (1-5)
    const byConfidence = {};
    const byEmotion = {};
    all.forEach(t => {
        const conf = t.confidence || 0;
        const emo = t.emotionStability || 0;
        const win = (parseFloat(t.tp) - parseFloat(t.entry)) > 0 ? 1 : 0;

        if (!byConfidence[conf]) byConfidence[conf] = { wins: 0, total: 0 };
        byConfidence[conf].wins += win; byConfidence[conf].total++;

        if (!byEmotion[emo]) byEmotion[emo] = { wins: 0, total: 0 };
        byEmotion[emo].wins += win; byEmotion[emo].total++;
    });

    const confStats = {};
    Object.keys(byConfidence).forEach(k => { confStats[k] = Math.round((byConfidence[k].wins / byConfidence[k].total) * 100); });
    const emoStats = {};
    Object.keys(byEmotion).forEach(k => { emoStats[k] = Math.round((byEmotion[k].wins / byEmotion[k].total) * 100); });

    return { byConfidence: confStats, byEmotion: emoStats };
}

function detectBehaviorIssues(all) {
    const alerts = [];
    if (!all.length) return alerts;

    // Overtrading: check average trades per day
    const byDay = {};
    all.forEach(t => {
        const d = new Date(t.date).toDateString();
        byDay[d] = (byDay[d] || 0) + 1;
    });
    const days = Object.keys(byDay).length;
    const avgPerDay = days ? (all.length / days) : 0;
    if (avgPerDay > 5) alerts.push(`⚠ Overtrading detected: avg ${avgPerDay.toFixed(1)} trades/day`);

    // Performance after loss
    let afterLossTotal = 0, afterLossWins = 0;
    for (let i = 1; i < all.length; i++) {
        const prev = all[i-1];
        const cur = all[i];
        const prevPL = parseFloat(prev.tp) - parseFloat(prev.entry);
        const curPL = parseFloat(cur.tp) - parseFloat(cur.entry);
        if (prevPL < 0) { afterLossTotal++; if (curPL > 0) afterLossWins++; }
    }
    if (afterLossTotal > 0) {
        const rate = (afterLossWins / afterLossTotal) * 100;
        if (rate < 40) alerts.push(`⚠ Performance drop after loss: win rate ${rate.toFixed(0)}%`);
    }

    // Impulse correlation: trades with impulse>3
    const impulseTrades = all.filter(t => (t.impulse || 0) > 3);
    if (impulseTrades.length) {
        const wins = impulseTrades.filter(t => (parseFloat(t.tp) - parseFloat(t.entry)) > 0).length;
        const rate = (wins / impulseTrades.length) * 100;
        if (rate < 30) alerts.push(`⚠ Impulse trades poor performance: ${rate.toFixed(0)}% win rate`);
    }

    return alerts;
}

function showPrompt() {
    console.log('showPrompt called, promptIndex:', promptIndex, 'prompts.length:', prompts.length);
    if (promptIndex >= prompts.length) {
        console.log('All prompts done, evaluating trade decision');
        evaluateTradeDecision();
        return;
    }
    const current = prompts[promptIndex];
    console.log('Showing prompt:', current);
    
    // Make sure prompt section is visible
    promptSection.classList.remove("hidden");
    promptSection.classList.add('active');
    
    // Set prompt text with debugging
    if (promptText) {
        promptText.textContent = current.text;
        console.log('Set promptText to:', current.text);
        console.log('promptText element actual content:', promptText.textContent);
        console.log('promptText element visible:', promptText.style.display !== 'none');
    } else {
        console.error('promptText element not found!');
    }
    
    // Show custom image if available, otherwise placeholder
    if (current.image) {
        promptImage.src = current.image;
        promptImage.style.display = 'block';
        console.log('Showing custom image');
    } else {
        promptImage.src = placeholderImage;
        promptImage.style.display = current.type === 'strategy' ? 'block' : 'none';
        console.log('Using placeholder image, display:', current.type === 'strategy' ? 'block' : 'none');
    }
    
    // Hide all input containers first
    if (sliderContainer) sliderContainer.style.display = 'none';
    if (numberContainer) numberContainer.style.display = 'none';
    if (textContainer) textContainer.style.display = 'none';
    if (lettersContainer) lettersContainer.style.display = 'none';
    
    // Show appropriate input container based on inputType
    if (current.inputType === 'slider' || !current.inputType) {
        // Default to slider for criteria, devil's traps, risk management
        if (sliderContainer) {
            sliderContainer.style.display = 'block';
            if (promptSlider) {
                promptSlider.value = 50;
                sliderValue.textContent = '50%';
                console.log('Reset slider to 50%');
            }
        }
    } else if (current.inputType === 'number') {
        // For min R:R and psychological state inputs
        if (numberContainer) {
            numberContainer.style.display = 'block';
            if (promptNumber) {
                promptNumber.value = '';
                if (current.type === 'minRR') {
                    promptNumber.min = 0.1;
                    promptNumber.step = 0.1;
                    promptNumber.placeholder = 'e.g., 1.5';
                    // Pre-fill with current value if available
                    if (current.rule && current.rule.minRR) {
                        promptNumber.value = current.rule.minRR;
                    }
                    console.log('Showing number input for min R:R, current value:', current.rule?.minRR);
                } else if (current.type === 'stability' || current.type === 'confidence' || current.type === 'clarity') {
                    promptNumber.min = current.min || 1;
                    promptNumber.max = current.max || 5;
                    promptNumber.step = current.step || 1;
                    promptNumber.placeholder = `Enter ${current.min}-${current.max}`;
                    // Pre-fill with current value if available
                    if (current.defaultValue) {
                        promptNumber.value = current.defaultValue;
                    }
                    console.log('Showing number input for', current.type, '(1-5), current value:', current.defaultValue);
                }
            }
        }
    } else if (current.inputType === 'text') {
        // For sessions and confluences input
        if (textContainer) {
            textContainer.style.display = 'block';
            if (promptTextInput) {
                promptTextInput.value = '';
                if (current.type === 'sessions') {
                    promptTextInput.placeholder = 'e.g., NY, LONDON, ASIAN';
                } else if (current.type === 'confluences') {
                    promptTextInput.placeholder = 'e.g., > 5 Criteria';
                }
                console.log('Showing text input for:', current.type);
            }
        }
    } else if (current.inputType === 'letters') {
        // For psychological grade input
        if (lettersContainer) {
            lettersContainer.style.display = 'block';
            console.log('Showing grade buttons for psychological grade');
        }
    }
    
    // Add navigation controls - ensure they're visible
    addPromptNavigationControls();
    
    // Force a repaint to ensure UI updates
    promptSection.offsetHeight;
}

// Add navigation controls to prompt interface
function addPromptNavigationControls() {
    console.log('Adding prompt navigation controls...');
    
    // Remove existing navigation controls if any
    const existingControls = document.querySelector('.prompt-navigation');
    if (existingControls) {
        existingControls.remove();
    }
    
    // Find the prompt container to add navigation to
    const promptContainer = document.querySelector('.prompt-container') || promptSection;
    
    // Create navigation controls
    const navDiv = document.createElement('div');
    navDiv.className = 'prompt-navigation';
    navDiv.style.cssText = `
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-top: 20px !important;
        padding: 15px !important;
        border-top: 1px solid #334155 !important;
        background: #1e293b !important;
        border-radius: 8px !important;
        position: relative !important;
        z-index: 1000 !important;
    `;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.className = 'btn-secondary';
    prevBtn.style.cssText = `
        padding: 10px 20px !important;
        background: #475569 !important;
        color: white !important;
        border: none !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        transition: all 0.2s !important;
    `;
    prevBtn.disabled = promptIndex === 0;
    if (promptIndex === 0) {
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    }
    prevBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        goToPreviousPrompt();
    };
    
    // Prompt counter
    const counter = document.createElement('span');
    counter.textContent = `Prompt ${promptIndex + 1} of ${prompts.length}`;
    counter.style.cssText = `
        color: #94a3b8 !important;
        font-weight: 600 !important;
        font-size: 16px !important;
        padding: 0 20px !important;
    `;
    
    // Next button (only show if not last prompt)
    const nextBtn = document.createElement('button');
    if (promptIndex < prompts.length - 1) {
        nextBtn.textContent = 'Next →';
        nextBtn.className = 'btn-secondary';
        nextBtn.style.cssText = `
            padding: 10px 20px !important;
            background: #22c55e !important;
            color: white !important;
            border: none !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            font-size: 14px !important;
            transition: all 0.2s !important;
        `;
        nextBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            goToNextPrompt();
        };
    }
    
    navDiv.appendChild(prevBtn);
    navDiv.appendChild(counter);
    if (nextBtn) navDiv.appendChild(nextBtn);
    
    // Add to prompt section
    promptContainer.appendChild(navDiv);
    
    console.log('Navigation controls added to DOM');
}

// Global click debugging to catch auto-submissions
document.addEventListener('click', function(e) {
    if (e.target === submitSliderBtn) {
        console.log('=== CLICK DETECTED ON SUBMIT BUTTON ===');
        console.log('Target:', e.target);
        console.log('Prompt index at click:', promptIndex);
    }
    if (e.target === submitNumberBtn) {
        console.log('=== CLICK DETECTED ON NUMBER SUBMIT BUTTON ===');
        console.log('Target:', e.target);
        console.log('Prompt index at click:', promptIndex);
    }
    if (e.target === submitTextBtn) {
        console.log('=== CLICK DETECTED ON TEXT SUBMIT BUTTON ===');
        console.log('Target:', e.target);
        console.log('Prompt index at click:', promptIndex);
    }
}, true);

// Add event listeners for number and text inputs
if (promptNumber) {
    promptNumber.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            console.log('Enter key pressed on number input - submitting');
            e.preventDefault();
            e.stopPropagation();
            submitNumberAnswer();
        }
    });
}

if (promptTextInput) {
    promptTextInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            console.log('Enter key pressed on text input - submitting');
            e.preventDefault();
            e.stopPropagation();
            submitTextAnswer();
        }
    });
}

// Slider event listener
if (promptSlider) {
    promptSlider.addEventListener('input', function(e) {
        console.log('Slider input event triggered, value:', this.value);
        sliderValue.textContent = this.value + '%';
        e.stopPropagation();
    });
    
    // Prevent Enter key from submitting
    promptSlider.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            console.log('Enter key pressed on slider - preventing submission');
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
}

function submitSliderAnswer() {
    console.log('=== SUBMIT TRIGGERED ===');
    console.log('Call stack:', new Error().stack);
    console.log('Current prompt index:', promptIndex);
    console.log('Current prompt type:', prompts[promptIndex]?.type);
    
    const current = prompts[promptIndex];
    
    // Check if this is a slider input type
    if (current.inputType === 'slider' || !current.inputType) {
        console.log('Slider value:', promptSlider ? promptSlider.value : 'NO SLIDER');
        
        // Check if this is an automatic submission (slider still at 50%)
        if (promptSlider && promptSlider.value === '50') {
            console.warn('🚨 AUTO-SUBMISSION DETECTED! Slider is still at 50%');
            console.warn('This suggests submitSliderAnswer() was called automatically');
            // Don't proceed with auto-submission
            return;
        }
        
        const value = parseInt(promptSlider.value);
        console.log('Slider answer submitted:', value, 'for prompt index:', promptIndex);
        // Convert percentage to boolean for evaluation (>= 70% = true)
        const booleanValue = value >= 70;
        console.log('Converted to boolean:', booleanValue);
        answerPrompt(booleanValue, value);
    } else {
        console.log('Non-slider input type detected, this should not call submitSliderAnswer()');
        console.warn('🚨 WRONG SUBMIT FUNCTION CALLED!');
        return;
    }
}

function submitNumberAnswer() {
    const current = prompts[promptIndex];
    console.log('Number input for type:', current?.type);
    
    // Check if this is an automatic submission (empty value)
    if (!promptNumber.value || promptNumber.value === '') {
        console.warn('🚨 AUTO-SUBMISSION DETECTED! Number input is empty');
        console.warn('This suggests submitNumberAnswer() was called automatically');
        return;
    }
    
    const value = parseFloat(promptNumber.value);
    console.log('Number answer submitted:', value, 'for prompt index:', promptIndex);
    answerPrompt(value, value);
}

function submitTextAnswer() {
    const value = promptTextInput.value.trim();
    console.log('Text answer submitted:', value);
    answerPrompt(value, value);
}

function submitGradeAnswer(grade) {
    console.log('Grade answer submitted:', grade);
    answerPrompt(grade, grade);
}

function answerPrompt(answer, percentage = null) {
    const current = prompts[promptIndex];
    console.log('Answer recorded:', answer, percentage, 'for:', current.text);
    answers.push({
        text: current.text, 
        type: current.type, 
        answer: answer,
        percentage: percentage
    });
    console.log('Total answers so far:', answers.length);
    promptIndex++;
    console.log('Moving to next prompt, index:', promptIndex);
    showPrompt();
}

// -------------------- Evaluate --------------------
function evaluateTradeDecision() {
    promptSection.classList.add("hidden");
    
    // Evaluate based on predefined rules
    const decision = evaluateTradeRules();
    
    // Store decision globally for navigation functions
    currentDecision = decision;
    
    // Show decision screen
    decisionSection.classList.remove("hidden");
    decisionSection.classList.add("active");
    
    // Get the detailed reasoning element
    const detailedReasoning = document.getElementById("detailedReasoning");
    console.log('Detailed reasoning element found:', !!detailedReasoning);
    
    if (decision.valid) {
        // Trade is valid - show approval with detailed reasoning
        finalDecision.textContent = "✅ Trade Approved";
        finalDecision.style.color = "lightgreen";
        
        // Generate detailed reasoning for approved trade
        let reasoningHTML = '<h3>✅ Trade Approval Details</h3>';
        console.log('Generating approval reasoning...');
        
        // Devil's traps
        const devilAnswers = answers.filter(a => a.type === 'devil');
        reasoningHTML += '<div class="reason-item"><span class="pass">🔥 Devil\'s Traps: All clear</span></div>';
        
        // Strategy rules
        const minRRAnswer = answers.find(a => a.type === 'minRR');
        const sessionsAnswer = answers.find(a => a.type === 'sessions');
        if (minRRAnswer) {
            const rrValue = minRRAnswer.percentage || minRRAnswer.answer;
            reasoningHTML += `<div class="reason-item"><span class="pass">⚖️ Min R:R: ${rrValue} (meets requirement)</span></div>`;
        }
        if (sessionsAnswer) {
            reasoningHTML += `<div class="reason-item"><span class="pass">⚖️ Sessions: ${sessionsAnswer.answer}</span></div>`;
        }
        
        // Risk management
        const riskAnswers = answers.filter(a => a.type === 'risk');
        reasoningHTML += '<div class="reason-item"><span class="pass">💰 Risk Management: All checks passed</span></div>';
        
        // Criteria confluence
        const criteriaAnswers = answers.filter(a => a.type === 'criteria');
        const criteriaMet = criteriaAnswers.filter(a => a.percentage >= 70).length;
        reasoningHTML += `<div class="reason-item"><span class="pass">📋 Confluence: ${criteriaMet}/${criteriaAnswers.length} criteria met</span></div>`;
        
        // Psychological state
        const stabilityAnswer = answers.find(a => a.type === 'stability');
        const confidenceAnswer = answers.find(a => a.type === 'confidence');
        const clarityAnswer = answers.find(a => a.type === 'clarity');
        if (stabilityAnswer) {
            const stabilityValue = stabilityAnswer.percentage || stabilityAnswer.answer;
            reasoningHTML += `<div class="reason-item"><span class="pass">😊 Stability: ${stabilityValue}/5</span></div>`;
        }
        if (confidenceAnswer) {
            const confidenceValue = confidenceAnswer.percentage || confidenceAnswer.answer;
            reasoningHTML += `<div class="reason-item"><span class="pass">😊 Confidence: ${confidenceValue}/5</span></div>`;
        }
        if (clarityAnswer) {
            const clarityValue = clarityAnswer.percentage || clarityAnswer.answer;
            reasoningHTML += `<div class="reason-item"><span class="pass">😊 Clarity: ${clarityValue}/5</span></div>`;
        }
        
        // Grade
        const gradeAnswer = answers.find(a => a.type === 'psychologicalGrade');
        if (gradeAnswer) {
            reasoningHTML += `<div class="reason-item"><span class="pass">🎓 Grade: ${gradeAnswer.answer}</span></div>`;
        }
        
        reasoningHTML += '<div class="reason-item"><strong>🎉 Ready to proceed to journal!</strong></div>';
        
        console.log('Setting detailed reasoning HTML:', reasoningHTML);
        if (detailedReasoning) {
            detailedReasoning.innerHTML = reasoningHTML;
            console.log('Detailed reasoning set successfully');
        } else {
            console.error('detailedReasoning element not found!');
        }
        
    } else {
        // Trade is invalid - show rejection with detailed reasoning
        finalDecision.textContent = "🚫 Trade Rejected";
        finalDecision.style.color = "red";
        
        // Generate detailed reasoning for rejected trade
        let reasoningHTML = '<h3 class="rejected">🚫 Trade Rejection Details</h3>';
        
        // Get answers for reference
        const devilAnswers = answers.filter(a => a.type === 'devil');
        const minRRAnswer = answers.find(a => a.type === 'minRR');
        const sessionsAnswer = answers.find(a => a.type === 'sessions');
        const riskAnswers = answers.filter(a => a.type === 'risk');
        const criteriaAnswers = answers.filter(a => a.type === 'criteria');
        
        // Get psychological answers for reference
        const stabilityAnswer = answers.find(a => a.type === 'stability');
        const confidenceAnswer = answers.find(a => a.type === 'confidence');
        const clarityAnswer = answers.find(a => a.type === 'clarity');
        const gradeAnswer = answers.find(a => a.type === 'psychologicalGrade');
        
        // Get rules for reference
        const rules = JSON.parse(localStorage.getItem('rules') || '{}');
        const settings = JSON.parse(localStorage.getItem('preTradeSettings') || '{}');
        console.log('🔍 Rules Object:', rules);
        console.log('🔍 Settings Object:', settings);
        
        // Show ALL failed items - not just the first one
        let hasFailures = false;
        
        // Check Devil's Traps
        const triggeredDevilTraps = devilAnswers.filter(a => a.percentage >= 70);
        if (triggeredDevilTraps.length > 0) {
            hasFailures = true;
            reasoningHTML += '<div class="reason-item"><strong>🔥 Devil\'s Traps Failed:</strong></div>';
            triggeredDevilTraps.forEach(trap => {
                const trapName = trap.text.replace("🚫 Devil's Trap: ", "").split(" (")[0];
                reasoningHTML += `<div class="reason-item"><span class="fail">  • ${trapName} (${trap.percentage}% agreement)</span></div>`;
            });
        }
        
        // Check Min R:R
        if (minRRAnswer) {
            const savedMinRR = rules.minRR || 1;
            const userRR = parseFloat(minRRAnswer.answer);
            if (userRR < savedMinRR) {
                hasFailures = true;
                reasoningHTML += `<div class="reason-item"><span class="fail">⚖️ Min R:R Too Low: ${userRR} < ${savedMinRR}</span></div>`;
            }
        }
        
        // Check Sessions
        if (sessionsAnswer) {
            const savedSessions = (rules.allowedSessions || '').toLowerCase();
            const userSessions = sessionsAnswer.answer.toLowerCase();
            if (savedSessions && !userSessions.includes(savedSessions.replace(/%/g, '').trim())) {
                hasFailures = true;
                reasoningHTML += `<div class="reason-item"><span class="fail">⚖️ Invalid Sessions: ${sessionsAnswer.answer}</span></div>`;
            }
        }
        
        // Check Risk Management
        const failedRiskChecks = riskAnswers.filter(a => a.percentage < 70);
        if (failedRiskChecks.length > 0) {
            hasFailures = true;
            reasoningHTML += '<div class="reason-item"><strong>💰 Risk Management Failed:</strong></div>';
            failedRiskChecks.forEach(risk => {
                const riskName = risk.text.replace("💰 Risk Management: ", "").split(" (")[0];
                reasoningHTML += `<div class="reason-item"><span class="fail">  • ${riskName} (${risk.percentage}% agreement)</span></div>`;
            });
        }
        
        // Check Criteria Confluence
        const failedCriteria = criteriaAnswers.filter(a => a.percentage < 70);
        if (failedCriteria.length > 0) {
            hasFailures = true;
            reasoningHTML += '<div class="reason-item"><strong>📋 Criteria Failed:</strong></div>';
            failedCriteria.forEach(criteria => {
                const criteriaName = criteria.text.replace("📋 Trade Criteria: ", "");
                reasoningHTML += `<div class="reason-item"><span class="fail">  • ${criteriaName} (${criteria.percentage}% agreement)</span></div>`;
            });
        }
        
        // Check Psychological State
        const failedPsychological = [];
        if (stabilityAnswer && parseInt(stabilityAnswer.answer) < 3) {
            failedPsychological.push(`Stability: ${stabilityAnswer.answer}/5`);
        }
        if (confidenceAnswer && parseInt(confidenceAnswer.answer) < 3) {
            failedPsychological.push(`Confidence: ${confidenceAnswer.answer}/5`);
        }
        if (clarityAnswer && parseInt(clarityAnswer.answer) < 3) {
            failedPsychological.push(`Clarity: ${clarityAnswer.answer}/5`);
        }
        if (failedPsychological.length > 0) {
            hasFailures = true;
            reasoningHTML += '<div class="reason-item"><strong>😊 Psychological State Failed:</strong></div>';
            failedPsychological.forEach(psych => {
                reasoningHTML += `<div class="reason-item"><span class="fail">  • ${psych}</span></div>`;
            });
        }
        
        // Check Grade
        if (gradeAnswer) {
            const grade = gradeAnswer.answer.toUpperCase();
            if (!['A', 'B', 'C'].includes(grade)) {
                hasFailures = true;
                reasoningHTML += `<div class="reason-item"><span class="fail">🎓 Grade Too Low: ${grade}</span></div>`;
            }
        }
        
        // If no specific failures found, show general reason
        if (!hasFailures) {
            reasoningHTML += `<div class="reason-item"><span class="fail">❌ ${decision.reason}</span></div>`;
        }
        
        // Show what passed - only show items that actually passed
        reasoningHTML += '<div class="reason-item"><strong>What passed:</strong></div>';
        
        // Devil's Traps - only show as passed if NONE were triggered
        const clearedDevilTraps = devilAnswers.filter(a => a.percentage < 70);
        if (clearedDevilTraps.length === devilAnswers.length && devilAnswers.length > 0) {
            reasoningHTML += '<div class="reason-item"><span class="pass">🔥 Devil\'s Traps: All clear</span></div>';
        }
        
        // Min R:R - check if it actually meets requirement
        if (minRRAnswer) {
            const savedMinRR = rules.minRR || 1;
            const userRR = parseFloat(minRRAnswer.answer);
            console.log('🔍 Min R:R Debug:', { savedMinRR, userRR, passes: userRR >= savedMinRR });
            if (userRR >= savedMinRR) {
                reasoningHTML += `<div class="reason-item"><span class="pass">⚖️ Min R:R: ${userRR} (meets requirement)</span></div>`;
            }
        }
        
        // Sessions - check if it matches allowed sessions
        if (sessionsAnswer) {
            const savedSessions = (rules.allowedSessions || '').toLowerCase();
            const userSessions = sessionsAnswer.answer.toLowerCase();
            console.log('🔍 Sessions Debug:', { savedSessions, userSessions, passes: !savedSessions || userSessions.includes(savedSessions.replace(/%/g, '').trim()) });
            if (!savedSessions || userSessions.includes(savedSessions.replace(/%/g, '').trim())) {
                reasoningHTML += `<div class="reason-item"><span class="pass">⚖️ Sessions: ${sessionsAnswer.answer}</span></div>`;
            }
        }
        
        // Risk Management - only show as passed if ALL checks passed
        const passedRiskChecks = riskAnswers.filter(a => a.percentage >= 70);
        if (passedRiskChecks.length === riskAnswers.length && riskAnswers.length > 0) {
            reasoningHTML += '<div class="reason-item"><span class="pass">💰 Risk Management: All checks passed</span></div>';
        }
        
        // Criteria Confluence - check if minimum confluence is met
        if (criteriaAnswers.length > 0) {
            const minConfluence = parseInt(settings.minConfluence) || 6;
            const passedCriteria = criteriaAnswers.filter(a => a.percentage >= 70);
            if (passedCriteria.length >= minConfluence) {
                reasoningHTML += `<div class="reason-item"><span class="pass">📋 Confluence: ${passedCriteria.length}/${criteriaAnswers.length} criteria met (minimum ${minConfluence} required)</span></div>`;
            }
        }
        
        // Psychological State - show only passed factors
        const passedPsychological = [];
        if (stabilityAnswer && parseInt(stabilityAnswer.answer) >= 3) {
            passedPsychological.push(`Stability: ${stabilityAnswer.answer}/5`);
        }
        if (confidenceAnswer && parseInt(confidenceAnswer.answer) >= 3) {
            passedPsychological.push(`Confidence: ${confidenceAnswer.answer}/5`);
        }
        if (clarityAnswer && parseInt(clarityAnswer.answer) >= 3) {
            passedPsychological.push(`Clarity: ${clarityAnswer.answer}/5`);
        }
        if (passedPsychological.length > 0) {
            reasoningHTML += '<div class="reason-item"><strong>😊 Psychological State Passed:</strong></div>';
            passedPsychological.forEach(psych => {
                reasoningHTML += `<div class="reason-item"><span class="pass">  • ${psych}</span></div>`;
            });
        }
        
        // Grade - check if it's acceptable
        if (gradeAnswer) {
            const grade = gradeAnswer.answer.toUpperCase();
            if (['A', 'B', 'C'].includes(grade)) {
                reasoningHTML += `<div class="reason-item"><span class="pass">🎓 Grade: ${grade}</span></div>`;
            }
        }
        
        reasoningHTML += '<div class="reason-item"><strong>📚 Review your rules and try again!</strong></div>';
        
        console.log('Setting rejection reasoning HTML:', reasoningHTML);
        if (detailedReasoning) {
            detailedReasoning.innerHTML = reasoningHTML;
            console.log('Rejection reasoning set successfully');
        } else {
            console.error('detailedReasoning element not found!');
        }
    }
    
    // Save prompt responses for analysis
    savePromptResponses(decision.valid);
    
    // NO AUTO-NAVIGATION - Wait for user to click "Continue"
    console.log('Decision displayed, waiting for user to click Continue...');
}

function continueAfterDecision() {
    console.log('=== CONTINUE BUTTON CLICKED ===');
    console.log('Current decision:', currentDecision);
    
    // Use the stored decision instead of recalculating
    const decision = currentDecision;
    
    if (!decision) {
        console.error('❌ No decision found! This is the problem.');
        return;
    }
    
    console.log('Decision valid:', decision.valid);
    
    if (decision.valid) {
        console.log('🚀 Navigating to journal...');
        // Navigate to journal - use the same pattern as other navigation
        decisionSection.classList.add("hidden");
        decisionSection.classList.remove("active");
        
        // Hide other sections and show journal
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        try { document.getElementById("strategySection").classList.add("hidden"); } catch(e){}
        try { promptSection.classList.add("hidden"); } catch(e){}
        try { dashboardSection.classList.add("hidden"); } catch(e){}
        
        // Show journal section
        journalSection.classList.remove("hidden");
        journalSection.classList.add('active');
        
        // Focus on first input field
        setTimeout(() => {
            const pairInput = document.getElementById('pair');
            if (pairInput) pairInput.focus();
        }, 300);
    } else {
        console.log('🚫 Navigating to invalid journal...');
        // Navigate to invalid trade journal section
        decisionSection.classList.add("hidden");
        navigateToInvalidTradeJournal();
    }
}

function evaluateTradeRules() {
    const rules = JSON.parse(localStorage.getItem('strategyRules') || '{}');
    const settings = JSON.parse(localStorage.getItem('preTradeSettings') || '{}');
    
    console.log('=== EVALUATION ENGINE START ===');
    console.log('Total answers:', answers.length);
    
    // 1. Check devil's traps (>= 70% agreement means trigger detected)
    const devilAnswers = answers.filter(a => a.type === 'devil');
    console.log('Devil trap answers:', devilAnswers);
    const hasDevilTrigger = devilAnswers.some(a => a.percentage >= 70);
    if (hasDevilTrigger) {
        const triggeredTrap = devilAnswers.find(a => a.percentage >= 70);
        console.log('❌ REJECTED: Devil trap triggered:', triggeredTrap.text);
        return { valid: false, reason: "Devil's trap triggered: " + triggeredTrap.text };
    }
    console.log('✅ Devil traps: PASSED');
    
    // 2. Check strategy rules (new split prompts - NO CONFLUENCES)
    const minRRAnswer = answers.find(a => a.type === 'minRR');
    const sessionsAnswer = answers.find(a => a.type === 'sessions');
    
    console.log('Strategy rule answers:', { minRRAnswer, sessionsAnswer });
    
    // Validate Min R:R (must be >= saved value)
    if (minRRAnswer) {
        const savedMinRR = rules.minRR || 1;
        const userRR = parseFloat(minRRAnswer.answer);
        if (userRR < savedMinRR) {
            console.log('❌ REJECTED: Min R:R too low:', userRR, '<', savedMinRR);
            return { valid: false, reason: `Min R:R too low (${userRR} < ${savedMinRR})` };
        }
        console.log('✅ Min R:R: PASSED');
    }
    
    // Validate Sessions (must match saved sessions)
    if (sessionsAnswer) {
        const savedSessions = (rules.allowedSessions || '').toLowerCase();
        const userSessions = sessionsAnswer.answer.toLowerCase();
        if (savedSessions && !userSessions.includes(savedSessions.replace(/%/g, '').trim())) {
            console.log('❌ REJECTED: Sessions not matching:', userSessions, 'expected:', savedSessions);
            return { valid: false, reason: `Trading sessions not allowed: ${sessionsAnswer.answer}` };
        }
        console.log('✅ Sessions: PASSED');
    }
    
    // 3. Check risk management (>= 70% agreement means risk check passed)
    const riskAnswers = answers.filter(a => a.type === 'risk');
    console.log('Risk answers:', riskAnswers);
    const failedRiskCheck = riskAnswers.find(a => a.percentage < 70);
    if (failedRiskCheck) {
        console.log('❌ REJECTED: Risk management failed:', failedRiskCheck.text);
        return { valid: false, reason: "Risk management rule violated: " + failedRiskCheck.text };
    }
    console.log('✅ Risk management: PASSED');
    
    // 4. Check criteria (MINIMUM CONFLUENCE COUNT EXPLAINED)
    const criteriaAnswers = answers.filter(a => a.type === 'criteria');
    console.log('Criteria answers:', criteriaAnswers);
    
    // 🎯 MINIMUM CONFLUENCE COUNT EXPLANATION:
    // This is the MINIMUM number of trading criteria that must pass (≥70% agreement)
    // Example: If minConfluence = 6, you need at least 6 out of your total criteria to pass
    // Each criterion "passes" if you answered ≥70% on the slider
    const minConfluence = parseInt(settings.minConfluence) || 6; // Default 6 criteria
    const criteriaMet = criteriaAnswers.filter(a => a.percentage >= 70).length;
    const totalCriteria = criteriaAnswers.length;
    
    console.log(`🎯 CONFLUENCE CHECK: ${criteriaMet}/${totalCriteria} criteria passed (need ${minConfluence})`);
    
    if (criteriaMet < minConfluence) {
        console.log('❌ REJECTED: Insufficient confluence');
        return { valid: false, reason: `Insufficient confluence (${criteriaMet}/${totalCriteria} criteria passed, need ${minConfluence})` };
    }
    console.log('✅ Criteria confluence: PASSED');
    
    // 5. Check psychological state (NEW: 1-5 number inputs)
    const stabilityAnswer = answers.find(a => a.type === 'stability');
    const confidenceAnswer = answers.find(a => a.type === 'confidence');
    const clarityAnswer = answers.find(a => a.type === 'clarity');
    
    console.log('Psychological answers:', { stabilityAnswer, confidenceAnswer, clarityAnswer });
    
    // Each psychological factor must be ≥ 3 (out of 5)
    const minPsychScore = 3;
    
    if (stabilityAnswer && parseInt(stabilityAnswer.answer) < minPsychScore) {
        console.log('❌ REJECTED: Stability too low:', stabilityAnswer.answer);
        return { valid: false, reason: `Stability too low (${stabilityAnswer.answer}/5, need ${minPsychScore}+)` };
    }
    
    if (confidenceAnswer && parseInt(confidenceAnswer.answer) < minPsychScore) {
        console.log('❌ REJECTED: Confidence too low:', confidenceAnswer.answer);
        return { valid: false, reason: `Confidence too low (${confidenceAnswer.answer}/5, need ${minPsychScore}+)` };
    }
    
    if (clarityAnswer && parseInt(clarityAnswer.answer) < minPsychScore) {
        console.log('❌ REJECTED: Clarity too low:', clarityAnswer.answer);
        return { valid: false, reason: `Clarity too low (${clarityAnswer.answer}/5, need ${minPsychScore}+)` };
    }
    
    console.log('✅ Psychological state: PASSED');
    
    // 6. Check psychological trade grade (NEW: A-F letters)
    const gradeAnswer = answers.find(a => a.type === 'psychologicalGrade');
    console.log('Grade answer:', gradeAnswer);
    
    if (gradeAnswer) {
        const grade = gradeAnswer.answer.toUpperCase();
        const acceptableGrades = ['A', 'B', 'C']; // Minimum acceptable grade is C
        if (!acceptableGrades.includes(grade)) {
            console.log('❌ REJECTED: Grade too low:', grade);
            return { valid: false, reason: `Psychological grade too low (${grade}, need A-C)` };
        }
        console.log('✅ Psychological grade: PASSED');
    }
    
    console.log('🎉 ALL CHECKS PASSED - TRADE APPROVED!');
    return { valid: true, reason: "All checks passed" };
}

function savePromptResponses(isValid) {
    const responseRecord = {
        timestamp: new Date().toISOString(),
        isValid: isValid,
        responses: answers,
        evaluation: currentDecision || evaluateTradeRules() // Use stored decision or fallback
    };
    
    // Save to appropriate storage
    const key = isValid ? 'validTradeResponses' : 'invalidTradeResponses';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(responseRecord);
    localStorage.setItem(key, JSON.stringify(existing));
}

function navigateToInvalidTradeJournal() {
    // Navigate to invalid trade journal section - use the same pattern as other navigation
    const invalidJournalSection = document.getElementById('invalidJournalSection');
    
    // Hide other sections and show invalid journal
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    try { document.getElementById("strategySection").classList.add("hidden"); } catch(e){}
    try { promptSection.classList.add("hidden"); } catch(e){}
    try { decisionSection.classList.add("hidden"); } catch(e){}
    try { dashboardSection.classList.add("hidden"); } catch(e){}
    try { journalSection.classList.add("hidden"); } catch(e){}
    
    // Show invalid journal section
    if (invalidJournalSection) {
        invalidJournalSection.classList.remove("hidden");
        invalidJournalSection.classList.add('active');
    }
    
    // Use the stored decision
    const decision = currentDecision;
    const rejectionReasonField = document.getElementById('invalidRejectionReason');
    if (rejectionReasonField && decision) {
        rejectionReasonField.value = decision.reason;
    }
    
    // Update recent invalid trades list
    updateRecentInvalidTrades();
    
    // Focus on first input field
    setTimeout(() => {
        const pairInput = document.getElementById('invalidPair');
        if (pairInput) pairInput.focus();
    }, 300);
}

function updateRecentInvalidTrades() {
    const invalidTrades = JSON.parse(localStorage.getItem('invalidTradeJournals') || '[]');
    const recentContainer = document.getElementById('recentInvalidTrades');
    
    if (invalidTrades.length === 0) {
        recentContainer.innerHTML = '<p class="text-muted">No rejected trades yet</p>';
        return;
    }
    
    const recentTrades = invalidTrades.slice(-5).reverse(); // Show last 5, newest first
    let html = '';
    recentTrades.forEach(trade => {
        html += `
            <div class="recent-trade-item">
                <div class="trade-pair">${trade.pair}</div>
                <div class="trade-direction ${trade.direction.toLowerCase()}">${trade.direction}</div>
                <div class="trade-reason">${trade.rejectionReason}</div>
                <div class="trade-date">${new Date(trade.date).toLocaleDateString()}</div>
            </div>
        `;
    });
    recentContainer.innerHTML = html;
}

function showInvalidTradeDetails() {
    const invalidResponses = JSON.parse(localStorage.getItem('invalidTradeResponses') || '[]');
    const latest = invalidResponses[invalidResponses.length - 1];
    
    if (latest) {
        alert(`Invalid Trade Details:\n\nTimestamp: ${new Date(latest.timestamp).toLocaleString()}\nReason: ${latest.evaluation.reason}\n\nResponses:\n${latest.responses.map(r => `${r.text}: ${r.answer}`).join('\n')}`);
    }
}

// -------------------- Restart --------------------
function restartSession() {
    decisionSection.classList.add("hidden");
    journalSection.classList.add("hidden");
    dashboardSection.classList.add("hidden");
    document.getElementById("strategySection").classList.remove("hidden");
    loadStrategy();
    // Allow normal navigation again
    window.preventAutoNav = false;
}

// -------------------- Journal --------------------
function saveJournal() {
    const pair = document.getElementById("pair").value;
    const entry = document.getElementById("entry").value;
    const stop = document.getElementById("stopLoss").value;
    const tp = document.getElementById("takeProfit").value;
    const emotions = document.getElementById("emotions").value;
    const confidence = document.getElementById("confidence").value;

    if (!pair || !entry || !stop || !tp) {
        journalMessage.textContent = "Please fill all required fields.";
        return;
    }

    // Validate required
    if (!pair || !entry || !stop || !tp) {
        journalMessage.textContent = "Please fill all required fields.";
        return;
    }

    // Build enhanced trade object
    const { score: conScore, selected: conSelected } = computeConfluenceScore();
    const devChecks = checkDevilTraps();
    const emoStability = parseInt(emotionStabilityInput.value, 10) || 0;
    const emoConfidence = parseInt(emotionConfidenceInput.value, 10) || 0;
    const emoImpulse = parseInt(emotionImpulseInput.value, 10) || 0;
    const emoClarity = parseInt(emotionClarityInput.value, 10) || 0;

    // compute rr (basic)
    const entryN = parseFloat(entry);
    const stopN = parseFloat(stop);
    const tpN = parseFloat(tp);
    const rr = (entryN && stopN) ? ((tpN - entryN) / Math.abs(entryN - stopN)) : null;

    const trade = {
        strategy: strategyInput.value || '',
        setupType: setupType.value || '',
        confluenceScore: conScore,
        confluences: conSelected,
        devilChecks: devChecks,
        emotionStability: emoStability,
        confidence: parseInt(confidence,10) || emoConfidence || 0,
        impulse: emoImpulse,
        clarity: emoClarity,
        pair, entry: entryN, stop: stopN, tp: tpN,
        positionSize: parseFloat(positionSizeInput.value) || null,
        riskPct: parseFloat(defaultRiskPctInput.value) || null,
        rr: rr,
        session: '',
        market: '',
        date: new Date(),
        exitDate: null,
        result: null,
        rMultiple: null,
        notes: emotions || '',
        mistake: false,
        ruleBroken: ''
    };

    saveTradeEntry(trade);

    journalMessage.textContent = "Journal saved!";
    document.querySelectorAll("#journalSection input").forEach(input => input.value = "");
    loadDashboard();
}

// -------------------- Dashboard --------------------
function loadDashboard() {
    const allJournals = JSON.parse(localStorage.getItem("tradeJournals") || "[]");
    // If dashboard DOM isn't present (tests or minimal runner), avoid DOM updates
    if (!document.getElementById("totalTrades")) {
        // ensure discipline score is present
        try { applyDisciplineScore(getTradeHistory()); } catch(e){}
        return;
    }
    
    // Calculate stats
    const totalTrades = allJournals.length;
    let profitableTrades = 0;
    let lossTrades = 0;

    allJournals.forEach(trade => {
        const pl = parseFloat(trade.tp) - parseFloat(trade.entry);
        if (pl > 0) profitableTrades++;
        else if (pl < 0) lossTrades++;
    });

    const winRate = totalTrades === 0 ? 0 : Math.round((profitableTrades / totalTrades) * 100);

    // Update stats
    document.getElementById("totalTrades").textContent = totalTrades;
    document.getElementById("profitableTrades").textContent = profitableTrades;
    document.getElementById("lossTrades").textContent = lossTrades;
    document.getElementById("winRate").textContent = winRate + "%";

    // Populate table
    const tableBody = document.getElementById("tradeTableBody");
    const noTradesMsg = document.getElementById("noTradesMessage");
    
    tableBody.innerHTML = "";
    
    if (allJournals.length === 0) {
        noTradesMsg.style.display = "block";
        return;
    }
    
    noTradesMsg.style.display = "none";

    allJournals.forEach((trade, index) => {
        const date = new Date(trade.date).toLocaleDateString();
        const pl = parseFloat(trade.tp) - parseFloat(trade.entry);
        const plClass = pl > 0 ? "profit" : pl < 0 ? "loss" : "";
        const plText = pl > 0 ? `+${pl.toFixed(2)}` : pl.toFixed(2);
        const emotionsText = trade.notes || '';
        const actionButtons = `
            <button class="btn-action" onclick="openEditModal(${index})">Edit</button>
            <button class="btn-action btn-win" onclick="markTradeResult(${index}, 'Win')">Win</button>
            <button class="btn-action btn-loss" onclick="markTradeResult(${index}, 'Loss')">Loss</button>
            <button class="btn-action btn-be" onclick="markTradeResult(${index}, 'BE')">BE</button>
        `;

        const row = `
            <tr>
                <td>${date}</td>
                <td>${trade.pair}</td>
                <td>${trade.entry}</td>
                <td>${trade.stop}</td>
                <td>${trade.tp}</td>
                <td class="${plClass}">${plText}</td>
                <td>${emotionsText}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    // Compute and display analytics
    const core = computeCoreMetrics(allJournals);
    // show small summary in alerts container
    let alerts = detectBehaviorIssues(allJournals);
    alertsContainer.innerHTML = '';
    if (alerts.length) {
        alerts.forEach(a => {
            const div = document.createElement('div');
            div.textContent = a;
            alertsContainer.appendChild(div);
        });
    }

    // Append summary stat line
    const summary = `Total: ${core.totalTrades} | Win%: ${core.winRate}% | P/L: ${core.totalPL.toFixed(2)} | PF: ${core.profitFactor}`;
    const summaryNode = document.createElement('div');
    summaryNode.style.color = '#cfe9d8';
    summaryNode.style.marginTop = '8px';
    summaryNode.textContent = summary;
    alertsContainer.appendChild(summaryNode);

    // Discipline score: read or compute
    try {
        let dsObj = null;
        try { dsObj = JSON.parse(localStorage.getItem('disciplineScore') || 'null'); } catch(e) { dsObj = null; }
        let dsVal = dsObj && dsObj.score !== undefined ? dsObj.score : applyDisciplineScore(getTradeHistory());
        const dsEl = document.getElementById('disciplineScore');
        if (dsEl) dsEl.textContent = (typeof dsVal === 'number') ? (dsVal + '%') : String(dsVal);
    } catch (e) { console.warn('Discipline score compute error', e); }

    // behavioral metrics not fully visualized yet; could be added here
    // After dashboard update, also run risk control and behavior correction checks
    const behaviorAlerts = detectBehaviorIssues(allJournals);
    if (behaviorAlerts.length) {
        // In strict mode, lock trading when critical issues found
        if (behaviorAlerts.some(a => a.includes('Overtrading') || a.includes('Performance drop') || a.includes('Impulse'))) {
            lockTrading('Behavior issues detected');
        }
    }
    checkRiskControl();
}

// -------------------- Risk Control & Behavior Correction --------------------
let tradingLocked = false;
function lockTrading(reason) {
    tradingLocked = true;
    startTradeBtn.disabled = true;
    const node = document.createElement('div');
    node.style.color = '#ffdede';
    node.textContent = 'LOCKED: ' + reason;
    alertsContainer.insertBefore(node, alertsContainer.firstChild);
}

function unlockTrading() {
    tradingLocked = false;
    startTradeBtn.disabled = false;
}

function checkRiskControl() {
    const all = getAllTrades();
    const today = new Date().toDateString();
    const todayTrades = all.filter(t => new Date(t.date).toDateString() === today);
    const dailyMax = parseFloat(dailyMaxLossInput.value) || 0;
    let dailyPL = 0;
    todayTrades.forEach(t => { dailyPL += (parseFloat(t.tp) - parseFloat(t.entry)); });
    if (dailyPL <= -Math.abs(dailyMax) && dailyMax > 0) {
        lockTrading('Daily max loss reached');
        return true;
    }
    return false;
}

// -------------------- Trade Result Marking --------------------
function markTradeResult(index, result) {
    const all = getAllTrades();
    if (!all[index]) return;
    const trade = all[index];
    const entry = parseFloat(trade.entry);
    const stop = parseFloat(trade.stop);
    const tp = parseFloat(trade.tp);
    let rMultiple = null;
    if (result === 'Win') {
        rMultiple = trade.rr || ((tp - entry) / Math.abs(entry - stop));
    } else if (result === 'Loss') {
        rMultiple = -1 * (Math.abs((stop - entry) / Math.abs(entry - stop)) || 1);
    } else if (result === 'BE') {
        rMultiple = 0;
    }
    trade.result = result === 'Win' ? 'Win' : result === 'Loss' ? 'Loss' : 'BE';
    trade.rMultiple = rMultiple;
    trade.exitDate = new Date();
    // write back
    localStorage.setItem('tradeJournals', JSON.stringify(all));
    loadDashboard();
    // run risk control and behavior detection
    const alerts = detectBehaviorIssues(all);
    if (alerts.length) {
        if (alerts.some(a => a.includes('Overtrading') || a.includes('Performance drop') || a.includes('Impulse'))) {
            lockTrading('Behavior issues detected');
        }
    }
    checkRiskControl();
}

// -------------------- Equity Curve & Reports --------------------
function computeEquityCurve(all) {
    let cum = 0;
    const points = all.map(t => {
        const pl = parseFloat(t.tp) - parseFloat(t.entry);
        cum += pl;
        return { date: new Date(t.date), cumPL: Number(cum.toFixed(2)) };
    });
    return points;
}

function disciplineScoreForTrade(t, minConfluence) {
    let score = 0;
    if ((t.confluenceScore || 0) >= minConfluence && !t.devilChecks.blocked && (t.impulse || 0) <= 2) score += 3;
    if (t.mistake) score -= 3;
    if ((t.impulse || 0) > 3) score -= 2;
    if ((t.confluenceScore || 0) >= minConfluence && (t.impulse || 0) <= 2 && t.result === 'Win') score += 2;
    return score;
}

function weeklyReport() {
    const all = getAllTrades();
    if (!all.length) { reportContainer.textContent = 'No trades yet.'; return; }
    const now = new Date();
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const slice = all.filter(t => new Date(t.date) >= weekAgo);
    const core = computeCoreMetrics(slice);
    let discipline = 0;
    slice.forEach(t => discipline += disciplineScoreForTrade(t, parseInt(minConfluenceInput.value,10) || 0));
    const equity = computeEquityCurve(slice);
    const report = [];
    report.push('WEEKLY REPORT');
    report.push(`Trades: ${core.totalTrades} | Wins: ${core.wins} | Losses: ${core.losses} | Win%: ${core.winRate}%`);
    report.push(`Profit Factor: ${core.profitFactor} | Total P/L: ${core.totalPL.toFixed(2)} | Avg R: ${core.avgR}`);
    report.push(`Discipline score (sum): ${discipline}`);
    report.push('Equity Curve:');
    equity.forEach(p => report.push(`${p.date.toLocaleDateString()} -> ${p.cumPL}`));
    reportContainer.textContent = report.join('\n');
}

function monthlyReport() {
    const all = getAllTrades();
    if (!all.length) { reportContainer.textContent = 'No trades yet.'; return; }
    const now = new Date();
    const monthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const slice = all.filter(t => new Date(t.date) >= monthAgo);
    const core = computeCoreMetrics(slice);
    let discipline = 0;
    slice.forEach(t => discipline += disciplineScoreForTrade(t, parseInt(minConfluenceInput.value,10) || 0));
    const equity = computeEquityCurve(slice);
    const report = [];
    report.push('MONTHLY REPORT');
    report.push(`Trades: ${core.totalTrades} | Wins: ${core.wins} | Losses: ${core.losses} | Win%: ${core.winRate}%`);
    report.push(`Profit Factor: ${core.profitFactor} | Total P/L: ${core.totalPL.toFixed(2)} | Avg R: ${core.avgR}`);
    report.push(`Discipline score (sum): ${discipline}`);
    report.push('Equity Curve:');
    equity.forEach(p => report.push(`${p.date.toLocaleDateString()} -> ${p.cumPL}`));
    reportContainer.textContent = report.join('\n');
}

function clearHistory() {
    if (confirm("⚠️ Are you sure? This will delete ALL trade history. You cannot undo this.")) {
        localStorage.removeItem("tradeJournals");
        loadDashboard();
        journalMessage.textContent = "✅ Trade history cleared!";
    }
}

function viewStrategy() {
    const strategy = localStorage.getItem("myStrategy") || "No strategy saved.";
    alert("📋 Your Strategy:\n\n" + strategy);
}

// -------------------- Event Listeners --------------------
window.onload = function() {
    loadAllSettings();
    loadStrategy();
    loadDashboard();
    displayPromptImages(); // Initialize prompt images display
    
    // Add event listener for prompt image upload
    const promptImageUpload = document.getElementById('promptImageUpload');
    if (promptImageUpload) {
        promptImageUpload.addEventListener('change', function(event) {
            handlePromptImageUploadFIXED(event);
        });
    }
};

const saveStrategyBtnEl = document.getElementById("saveStrategyBtn");
if (saveStrategyBtnEl) saveStrategyBtnEl.addEventListener('click', saveStrategy);
if (startTradeBtn) startTradeBtn.addEventListener('click', function() {
    // build trade idea from UI
    const tradeIdea = {
        id: 'idea-' + Date.now(),
        pair: (document.getElementById('idea_pair')||{}).value || '',
        direction: (document.getElementById('idea_direction')||{}).value || '',
        strategy: strategyInput.value || '',
        session: (document.getElementById('idea_session')||{}).value || '',
        time: (document.getElementById('idea_time')||{}).value || new Date().toISOString(),
        entry: null, sl: null, tp: null,
        lotSize: parseFloat(positionSizeInput.value) || null,
        emotion: null,
        confidence: null
    };
    const ok = approveOrBlockTrade(tradeIdea);
    if (ok) startPrompts();
});
if (submitSliderBtn) submitSliderBtn.addEventListener('click', submitSliderAnswer);
if (restartBtn) restartBtn.addEventListener('click', restartSession);
// Wire invalid trade journal form
const invalidTradeForm = document.getElementById('invalidTradeForm');
const saveInvalidJournalBtn = document.getElementById('saveInvalidJournalBtn');

if (invalidTradeForm) {
    invalidTradeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveInvalidTradeEntry();
    });
}

function saveInvalidTradeEntry() {
    const pair = document.getElementById('invalidPair').value;
    const direction = document.getElementById('invalidDirection').value;
    const strategy = document.getElementById('invalidStrategy').value;
    const entry = document.getElementById('invalidEntry').value;
    const stopLoss = document.getElementById('invalidStopLoss').value;
    const takeProfit = document.getElementById('invalidTakeProfit').value;
    const rejectionReason = document.getElementById('invalidRejectionReason').value;
    const notes = document.getElementById('invalidNotes').value;
    
    const invalidTrade = {
        id: 'inv-' + Date.now(),
        date: new Date().toISOString(),
        pair: pair,
        direction: direction,
        strategy: strategy,
        entry: entry,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
        rejectionReason: rejectionReason,
        notes: notes,
        promptResponses: answers // Store the prompt responses for analysis
    };
    
    // Save to invalid trades storage
    const invalidTrades = JSON.parse(localStorage.getItem('invalidTradeJournals') || '[]');
    invalidTrades.push(invalidTrade);
    localStorage.setItem('invalidTradeJournals', JSON.stringify(invalidTrades));
    
    // Show success message
    const messageEl = document.getElementById('invalidJournalMessage');
    messageEl.textContent = '✅ Rejected trade saved successfully!';
    messageEl.style.color = '#22c55e';
    
    // Update recent trades list
    updateRecentInvalidTrades();
    
    // Clear form after 2 seconds
    setTimeout(() => {
        invalidTradeForm.reset();
        messageEl.textContent = '';
        // Focus back to pair input
        document.getElementById('invalidPair').focus();
    }, 2000);
    
    console.log('Invalid trade saved:', invalidTrade);
}
if (viewStrategiesBtn) viewStrategiesBtn.addEventListener('click', viewStrategy);
if (weeklyReportBtn) weeklyReportBtn.addEventListener('click', weeklyReport);
if (monthlyReportBtn) monthlyReportBtn.addEventListener('click', monthlyReport);

// Attach change listeners to pre-trade inputs to re-run validation
document.querySelectorAll('#confluenceList input[type="checkbox"]').forEach(el => el.addEventListener('change', preTradeValidation));
document.querySelectorAll('.conf-weight').forEach(el => el.addEventListener('change', preTradeValidation));
document.querySelectorAll('#dev_news, #dev_liquidity').forEach(el => el.addEventListener('change', preTradeValidation));
document.getElementById('minConfluence').addEventListener('input', e => { preTradeValidation(); savePreTradeSettings(); });
document.getElementById('maxTradesPerDay').addEventListener('input', e => { preTradeValidation(); savePreTradeSettings(); });
document.getElementById('lossCooldown').addEventListener('input', e => { preTradeValidation(); savePreTradeSettings(); });

// Account settings auto-save
if (accountBalanceInput) accountBalanceInput.addEventListener('change', saveAccountSettings);
if (defaultRiskPctInput) defaultRiskPctInput.addEventListener('change', saveAccountSettings);
if (positionSizeInput) positionSizeInput.addEventListener('change', saveAccountSettings);
if (dailyMaxLossInput) dailyMaxLossInput.addEventListener('change', saveAccountSettings);

// Emotional settings auto-save
if (emotionStabilityInput) emotionStabilityInput.addEventListener('change', saveEmotionalSettings);
if (emotionConfidenceInput) emotionConfidenceInput.addEventListener('change', saveEmotionalSettings);
if (emotionImpulseInput) emotionImpulseInput.addEventListener('change', saveEmotionalSettings);
if (emotionClarityInput) emotionClarityInput.addEventListener('change', saveEmotionalSettings);
if (emotionImpulseInput) emotionImpulseInput.addEventListener('input', preTradeValidation);

// Wire export/import UI - Check if elements exist first
const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportCSV);
const importCsv = document.getElementById('importCsv');
if (importCsv) importCsv.addEventListener('change', importCsvFile);
const exportJsonBtn = document.getElementById('exportJsonBtn');
if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportJSON);
const importJson = document.getElementById('importJson');
if (importJson) importJson.addEventListener('change', importJsonFile);
const manageRulesBtn = document.getElementById('manageRulesBtn');
if (manageRulesBtn) manageRulesBtn.addEventListener('click', openRulesModal);
const manageRiskBtn = document.getElementById('manageRiskBtn');
if (manageRiskBtn) manageRiskBtn.addEventListener('click', openRiskModal);

function saveTradeEntry() {
    console.log('Saving trade entry...');
    
    const trade = {
        date: new Date().toISOString(),
        pair: document.getElementById('pair')?.value || '',
        direction: document.getElementById('idea_direction')?.value || '',
        entry: document.getElementById('entry')?.value || '',
        stopLoss: document.getElementById('stopLoss')?.value || '',
        takeProfit: document.getElementById('takeProfit')?.value || '',
        confidence: document.getElementById('confidence')?.value || '',
        emotions: document.getElementById('emotions')?.value || '',
        notes: document.getElementById('form_notes')?.value || '',
        strategy: document.getElementById('form_strategy')?.value || ''
    };
    
    // Get existing trades
    const trades = JSON.parse(localStorage.getItem('trades') || '[]');
    trades.push(trade);
    localStorage.setItem('trades', JSON.stringify(trades));
    
    // Show success message
    const messageEl = document.getElementById('journalMessage');
    if (messageEl) {
        messageEl.textContent = 'Trade saved successfully!';
        messageEl.style.color = '#22c55e';
    }
    
    // Reset form
    const form = document.getElementById('tradeForm');
    if (form) form.reset();
    
    // Update displays
    updateDashboard();
    updateTradeTable();
    
    console.log('Trade entry saved:', trade);
}

function updateDashboard() {
    console.log('Updating dashboard...');
    
    const trades = JSON.parse(localStorage.getItem('trades') || '[]');
    
    // Update navbar stats
    const navTrades = document.getElementById('navTrades');
    if (navTrades) navTrades.textContent = trades.length;
    
    // Calculate win rate
    let wins = 0;
    trades.forEach(trade => {
        if (trade.outcome === 'Win') wins++;
    });
    const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;
    
    const navWinRate = document.getElementById('navWinRate');
    if (navWinRate) navWinRate.textContent = winRate + '%';
    
    // Update dashboard cards
    const dashTotalTrades = document.getElementById('dashTotalTrades');
    if (dashTotalTrades) dashTotalTrades.textContent = trades.length;
    
    const dashWinRate = document.getElementById('dashWinRate');
    if (dashWinRate) dashWinRate.textContent = winRate + '%';
    
    console.log('Dashboard updated');
}

function updateTradeTable() {
    console.log('Updating trade table...');
    
    const trades = JSON.parse(localStorage.getItem('trades') || '[]');
    const tableBody = document.getElementById('tradeTableBody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (trades.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="12" class="empty-state">No trades recorded yet</td></tr>';
        return;
    }
    
    trades.forEach((trade, index) => {
        const row = document.createElement('tr');
        const date = new Date(trade.date).toLocaleDateString();
        
        row.innerHTML = `
            <td>${date}</td>
            <td>${trade.pair}</td>
            <td>${trade.direction}</td>
            <td>${trade.entry}</td>
            <td>${trade.stopLoss}</td>
            <td>${trade.takeProfit}</td>
            <td>${trade.confidence || '-'}</td>
            <td>${trade.emotions || '-'}</td>
            <td><button class="btn-action" onclick="editTrade(${index})">Edit</button></td>
        `;
        
        tableBody.appendChild(row);
    });
    
    console.log('Trade table updated');
}

function editTrade(index) {
    console.log('Editing trade:', index);
    // Implementation needed
}

// -------------------- Critical Form Event Listeners --------------------
// Trade form submission
const tradeForm = document.getElementById('tradeForm');
if (tradeForm) {
    tradeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveTradeEntry();
    });
}

// Strategy save button
const saveStrategyBtn = document.getElementById('saveStrategyBtn');
if (saveStrategyBtn) {
    saveStrategyBtn.addEventListener('click', saveStrategy);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    loadAllSettings();
    loadStrategy();
    updateDashboard();
    
    // Initialize sidebar - start collapsed
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.add('collapsed');
    }
    
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Initialize home section as active
    navigateTo('home');
});

// -------------------- Chart Rendering --------------------
function renderEquityChart(all) {
    try {
        const canvas = document.getElementById('equityChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const points = computeEquityCurve(all);
        // clear
        ctx.clearRect(0,0,canvas.width,canvas.height);
        if (!points.length) return;
        // normalize
        const padding = 20;
        const w = canvas.width - padding*2;
        const h = canvas.height - padding*2;
        const xs = points.map((p,i) => padding + (i/(points.length-1 || 1))*w);
        const vals = points.map(p => p.cumPL);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const range = (max - min) || 1;
        const ys = vals.map(v => padding + h - ((v - min)/range)*h);
        // prepare point coordinates for tooltip interaction
        const pointsForTooltip = points.map((p,i) => ({ x: xs[i], y: ys[i], cumPL: p.cumPL, date: p.date, index: i }));
        // draw axes
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(padding, padding); ctx.lineTo(padding, padding+h); ctx.lineTo(padding+w, padding+h); ctx.stroke();

        // draw line
        ctx.beginPath(); ctx.moveTo(xs[0], ys[0]);
        for (let i=1;i<xs.length;i++) ctx.lineTo(xs[i], ys[i]);
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.stroke();

        // fill area
        ctx.lineTo(padding+w, padding+h); ctx.lineTo(padding, padding+h); ctx.closePath();
        const grad = ctx.createLinearGradient(0,padding,0,padding+h); grad.addColorStop(0,'rgba(34,197,94,0.15)'); grad.addColorStop(1,'rgba(34,197,94,0.02)');
        ctx.fillStyle = grad; ctx.fill();
        // draw points
        ctx.fillStyle = '#fff';
        for (let i=0;i<xs.length;i++) { ctx.beginPath(); ctx.arc(xs[i], ys[i], 2, 0, Math.PI*2); ctx.fill(); }
        // attach points for tooltip
        try { canvas._chartPoints = pointsForTooltip; } catch(e) { canvas._chartPoints = null; }
    } catch (e) { console.warn('Chart render error', e); }
}

// -------------------- Edit Modal --------------------
let editingIndex = null;
function openEditModal(index) {
    const all = getAllTrades();
    const t = all[index];
    if (!t) return;
    editingIndex = index;
    document.getElementById('edit_pair').value = t.pair || '';
    document.getElementById('edit_entry').value = t.entry || '';
    document.getElementById('edit_stop').value = t.stop || '';
    document.getElementById('edit_tp').value = t.tp || '';
    document.getElementById('edit_notes').value = t.notes || '';
    document.getElementById('edit_result').value = t.result || '';
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingIndex = null;
}

function saveEditModal() {
    if (editingIndex === null) return closeEditModal();
    const all = getAllTrades();
    const t = all[editingIndex];
    if (!t) return closeEditModal();
    t.pair = document.getElementById('edit_pair').value;
    t.entry = parseFloat(document.getElementById('edit_entry').value) || t.entry;
    t.stop = parseFloat(document.getElementById('edit_stop').value) || t.stop;
    t.tp = parseFloat(document.getElementById('edit_tp').value) || t.tp;
    t.notes = document.getElementById('edit_notes').value || t.notes;
    t.result = document.getElementById('edit_result').value || t.result;
    t.exitDate = t.result ? new Date() : t.exitDate;
    localStorage.setItem('tradeJournals', JSON.stringify(all));
    closeEditModal();
    loadDashboard();
}

// -------------------- Export / Import CSV --------------------
function exportCSV() {
    const all = getAllTrades();
    if (!all.length) return showToast('No trades to export', 2500);
    const headers = ['date','strategy','setupType','pair','entry','stop','tp','confluenceScore','confidence','impulse','result','rMultiple','notes'];
    const rows = all.map(t => headers.map(h => {
        let v = t[h]===undefined ? '' : t[h];
        if (v && v instanceof Date) v = new Date(v).toISOString();
        if (typeof v === 'object') v = JSON.stringify(v);
        return '"' + String(v).replace(/"/g,'""') + '"';
    }).join(','));
    const csv = [headers.join(',')].concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'trade_history.csv'; a.click(); URL.revokeObjectURL(url);
    showToast('CSV export started', 1400);
}

function importCsvFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        const text = ev.target.result;
        parseAndImportCsv(text);
    };
    reader.readAsText(file);
}

function parseAndImportCsv(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length);
    if (!lines.length) { showToast('Empty CSV file', 2200); return; }
    const headers = splitCsvLine(lines.shift()).map(h => h.replace(/"/g,'').trim());
    const all = getAllTrades();
    let imported = 0;
    lines.forEach(line => {
        const cols = splitCsvLine(line).map(c => c.replace(/^"|"$/g,'').replace(/""/g,'"'));
        if (!cols.length) return;
        const obj = {};
        headers.forEach((h,i)=> { obj[h]=cols[i]!==undefined ? cols[i] : ''; });
        // coerce obvious numeric fields
        ['entry','stop','tp','rMultiple','confluenceScore','confidence','impulse'].forEach(k=>{
            if (obj[k]!==undefined && obj[k]!=='' && !isNaN(obj[k])) obj[k]=parseFloat(obj[k]);
        });
        // normalize date
        obj.date = obj.date ? new Date(obj.date).toISOString() : new Date().toISOString();
        all.push(obj);
        imported++;
    });
    localStorage.setItem('tradeJournals', JSON.stringify(all));
    loadDashboard();
    showToast('Imported ' + imported + ' trades from CSV', 3000);
}

// robust CSV line splitter that handles quoted fields with commas
function splitCsvLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i=0;i<line.length;i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i+1] === '"') { cur += '"'; i++; continue; }
            inQuotes = !inQuotes; continue;
        }
        if (ch === ',' && !inQuotes) { result.push(cur); cur = ''; continue; }
        cur += ch;
    }
    result.push(cur);
    return result;
}

// -------------------- JSON Export / Import --------------------
function exportJSON() {
    const all = getAllTrades();
    if (!all.length) return showToast('No trades to export', 2500);
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'trade_history.json'; a.click(); URL.revokeObjectURL(url);
    showToast('JSON export started', 1400);
}

function importJsonFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        try {
            const parsed = JSON.parse(ev.target.result);
            if (!Array.isArray(parsed)) { showToast('JSON must contain an array of trades', 2600); return; }
            const all = getAllTrades();
            parsed.forEach(obj => {
                if (obj.date) obj.date = new Date(obj.date).toISOString();
                all.push(obj);
            });
            localStorage.setItem('tradeJournals', JSON.stringify(all));
            loadDashboard();
            showToast('Imported ' + parsed.length + ' trades from JSON', 3000);
        } catch (err) { showToast('Invalid JSON file', 2200); }
    };
    reader.readAsText(file);
}

// -------------------- Chart Tooltip --------------------
function attachChartTooltip() {
    const canvas = document.getElementById('equityChart');
    if (!canvas) return;
    if (!canvas._chartPoints || !canvas._chartPoints.length) return;
    let tooltip = document.getElementById('chartTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div'); tooltip.id = 'chartTooltip';
        tooltip.style.position = 'absolute'; tooltip.style.pointerEvents = 'none';
        tooltip.style.background = 'rgba(0,0,0,0.8)'; tooltip.style.color = '#fff'; tooltip.style.padding = '6px 8px';
        tooltip.style.borderRadius = '4px'; tooltip.style.fontSize = '12px'; tooltip.style.zIndex = 9999;
        document.body.appendChild(tooltip);
    }
    function hide() { tooltip.style.display='none'; }
    function showAt(x,y,html) { tooltip.innerHTML = html; tooltip.style.left = (x+12) + 'px'; tooltip.style.top = (y+12) + 'px'; tooltip.style.display = 'block'; }
    canvas.addEventListener('mousemove', function(ev){
        const rect = canvas.getBoundingClientRect(); const mx = ev.clientX - rect.left; const my = ev.clientY - rect.top;
        let nearest = null; let bestDist = Infinity;
        for (const p of canvas._chartPoints) {
            const dx = p.x - mx, dy = p.y - my; const d = Math.sqrt(dx*dx+dy*dy);
            if (d < bestDist) { bestDist = d; nearest = p; }
        }
        if (nearest && bestDist < 18) {
            const html = '<strong>' + (nearest.date ? new Date(nearest.date).toLocaleString() : '') + '</strong><br/>Equity: ' + (nearest.cumPL||0).toFixed(2);
            showAt(ev.clientX, ev.clientY, html);
        } else hide();
    });
    canvas.addEventListener('mouseleave', hide);
}

// Ensure the chart updates after dashboard updates
const origLoadDashboard = loadDashboard;
loadDashboard = function() {
    origLoadDashboard();
    try { const all = getAllTrades(); renderEquityChart(all); attachChartTooltip(); renderPhase4Dashboard(); } catch(e){}
};

// -------------------- Phase 4: Advanced Analytics & Dashboard --------------------
// Current filters
let currentFilters = { dateStart: null, dateEnd: null, strategy: '', pair: '', emotion: '', outcome: '' };

function applyFilters() {
    const el1 = document.getElementById('filter_dateStart');
    currentFilters.dateStart = el1 ? el1.value || null : null;
    const el2 = document.getElementById('filter_dateEnd');
    currentFilters.dateEnd = el2 ? el2.value || null : null;
    const el3 = document.getElementById('filter_strategy');
    currentFilters.strategy = el3 ? el3.value || '' : '';
    const el4 = document.getElementById('filter_pair');
    currentFilters.pair = el4 ? el4.value || '' : '';
    const el5 = document.getElementById('filter_emotion');
    currentFilters.emotion = el5 ? el5.value || '' : '';
    const el6 = document.getElementById('filter_outcome');
    currentFilters.outcome = el6 ? el6.value || '' : '';
    renderPhase4Dashboard();
    showToast('Filters applied', 1500);
}

function clearFilters() {
    currentFilters = { dateStart: null, dateEnd: null, strategy: '', pair: '', emotion: '', outcome: '' };
    const el1 = document.getElementById('filter_dateStart');
    if (el1) el1.value = '';
    const el2 = document.getElementById('filter_dateEnd');
    if (el2) el2.value = '';
    const el3 = document.getElementById('filter_strategy');
    if (el3) el3.value = '';
    const el4 = document.getElementById('filter_pair');
    if (el4) el4.value = '';
    const el5 = document.getElementById('filter_emotion');
    if (el5) el5.value = '';
    const el6 = document.getElementById('filter_outcome');
    if (el6) el6.value = '';
    renderPhase4Dashboard();
    showToast('Filters cleared', 1500);
}

// Get filtered trades
function getFilteredTrades() {
    let all = getAllTrades();
    if (currentFilters.dateStart) {
        const ds = new Date(currentFilters.dateStart);
        all = all.filter(t => new Date(t.date) >= ds);
    }
    if (currentFilters.dateEnd) {
        const de = new Date(currentFilters.dateEnd);
        de.setHours(23, 59, 59);
        all = all.filter(t => new Date(t.date) <= de);
    }
    if (currentFilters.strategy) all = all.filter(t => t.strategy === currentFilters.strategy);
    if (currentFilters.pair) all = all.filter(t => t.pair === currentFilters.pair);
    if (currentFilters.emotion) all = all.filter(t => t.emotions === currentFilters.emotion);
    if (currentFilters.outcome) {
        all = all.filter(t => {
            const pl = parseFloat(t.tp||0) - parseFloat(t.entry||0);
            if (currentFilters.outcome === 'Win') return pl > 0;
            if (currentFilters.outcome === 'Loss') return pl < 0;
            if (currentFilters.outcome === 'BE') return pl === 0;
            return true;
        });
    }
    return all;
}

// Populate filter dropdowns
function populateFilterDropdowns() {
    const all = getAllTrades();
    const strategies = [...new Set(all.map(t => t.strategy).filter(Boolean))];
    const pairs = [...new Set(all.map(t => t.pair).filter(Boolean))];
    
    const stratSel = document.getElementById('filter_strategy');
    const pairSel = document.getElementById('filter_pair');
    
    if (stratSel) {
        strategies.forEach(s => {
            if (!stratSel.querySelector(`option[value="${s}"]`)) {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                stratSel.appendChild(opt);
            }
        });
    }
    if (pairSel) {
        pairs.forEach(p => {
            if (!pairSel.querySelector(`option[value="${p}"]`)) {
                const opt = document.createElement('option');
                opt.value = p;
                opt.textContent = p;
                pairSel.appendChild(opt);
            }
        });
    }
}

// Compute analytics for Phase 4
function computePhase4Analytics(trades) {
    const metrics = {
        totalTrades: trades.length,
        wins: 0, losses: 0, breaks: 0,
        winRate: 0,
        totalPL: 0,
        profitFactor: 0,
        avgRR: 0,
        pnlByEmotion: {},
        riskRewardByTrade: [],
        drawdownHistory: [],
        alerts: []
    };

    let grossWin = 0, grossLoss = 0, rrSum = 0, rrCount = 0;
    let cumulativePL = 0;

    trades.forEach((t, idx) => {
        const pl = parseFloat(t.tp || 0) - parseFloat(t.entry || 0);
        cumulativePL += pl;
        metrics.totalPL += pl;

        if (pl > 0) metrics.wins++;
        else if (pl < 0) metrics.losses++;
        else metrics.breaks++;

        if (pl > 0) grossWin += pl;
        if (pl < 0) grossLoss += Math.abs(pl);

        // RR for this trade
        const stop = parseFloat(t.stop || t.stopLoss || 0);
        if (t.entry && stop && pl !== 0) {
            const rr = Math.abs(pl / Math.abs(t.entry - stop));
            metrics.riskRewardByTrade.push(rr);
            rrSum += rr;
            rrCount++;
        }

        // Emotion tracking
        const emo = t.emotions || 'Unknown';
        if (!metrics.pnlByEmotion[emo]) metrics.pnlByEmotion[emo] = 0;
        metrics.pnlByEmotion[emo] += pl;

        // Drawdown
        metrics.drawdownHistory.push(cumulativePL);
    });

    metrics.winRate = metrics.totalTrades ? Math.round((metrics.wins / metrics.totalTrades) * 100) : 0;
    metrics.profitFactor = grossLoss === 0 ? (grossWin || 0) : Number((grossWin / grossLoss).toFixed(2));
    metrics.avgRR = rrCount ? Number((rrSum / rrCount).toFixed(2)) : 0;

    return metrics;
}

// Generate alerts
function generateAlerts(metrics, trades) {
    const alerts = [];
    if (metrics.totalTrades === 0) return alerts;

    // Overtrading
    const today = new Date().toDateString();
    const todayTrades = trades.filter(t => new Date(t.date).toDateString() === today);
    if (todayTrades.length > 5) alerts.push(`⚠ Overtrading: ${todayTrades.length} trades today`);

    // Consecutive losses
    let consecLosses = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
        const pl = parseFloat(trades[i].tp||0) - parseFloat(trades[i].entry||0);
        if (pl < 0) consecLosses++;
        else break;
    }
    if (consecLosses >= 3) alerts.push(`⚠ Consecutive losses: ${consecLosses} in a row`);

    // Emotional trades
    const emotionalTrades = trades.filter(t => {
        const emo = (t.emotions || '').toLowerCase();
        return emo.includes('angry') || emo.includes('fomo') || emo.includes('frustrated');
    });
    if (emotionalTrades.length > Math.ceil(trades.length * 0.3)) alerts.push(`⚠ High emotional trading: ${emotionalTrades.length} emotional trades`);

    // Win rate warning
    if (metrics.winRate < 40) alerts.push(`⚠ Low win rate: ${metrics.winRate}%`);

    if (!alerts.length) alerts.push('✓ All metrics within normal range');
    return alerts;
}

// Chart: Risk/Reward Distribution
function renderRRChart(metrics) {
    const ctx = document.getElementById('rrChart');
    if (!ctx || !metrics.riskRewardByTrade.length) return;
    
    const bins = { low: 0, mid: 0, high: 0 };
    metrics.riskRewardByTrade.forEach(rr => {
        if (rr < 1.5) bins.low++;
        else if (rr < 2.5) bins.mid++;
        else bins.high++;
    });

    if (window.rrChartInstance) window.rrChartInstance.destroy();
    window.rrChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['RR < 1.5', 'RR 1.5-2.5', 'RR > 2.5'],
            datasets: [{
                label: 'Trade Count',
                data: [bins.low, bins.mid, bins.high],
                backgroundColor: ['#ef4444', '#eab308', '#22c55e'],
                borderRadius: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }
    });
}

// Chart: Emotion P&L
function renderEmotionChart(metrics) {
    const ctx = document.getElementById('emotionChart');
    if (!ctx || !Object.keys(metrics.pnlByEmotion).length) return;
    
    const labels = Object.keys(metrics.pnlByEmotion);
    const data = labels.map(k => metrics.pnlByEmotion[k]);
    const colors = labels.map(k => {
        if (k.toLowerCase().includes('calm')) return '#22c55e';
        if (k.toLowerCase().includes('angry')) return '#ef4444';
        if (k.toLowerCase().includes('fomo')) return '#f97316';
        return '#94a3b8';
    });

    if (window.emotionChartInstance) window.emotionChartInstance.destroy();
    window.emotionChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: data, backgroundColor: colors }]
        },
        options: { responsive: true, maintainAspectRatio: true }
    });
}

// Chart: Drawdown
function renderDrawdownChart(metrics) {
    const ctx = document.getElementById('drawdownChart');
    if (!ctx || !metrics.drawdownHistory.length) return;

    if (window.drawdownChartInstance) window.drawdownChartInstance.destroy();
    window.drawdownChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: metrics.drawdownHistory.map((_, i) => `Trade ${i + 1}`),
            datasets: [{
                label: 'Cumulative P&L',
                data: metrics.drawdownHistory,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34,197,94,0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: true } } }
    });
}

// Render Phase 4 dashboard
function renderPhase4Dashboard() {
    populateFilterDropdowns();
    const filtered = getFilteredTrades();
    const metrics = computePhase4Analytics(filtered);

    // Update summary cards (with guards)
    const el1 = document.getElementById('totalTrades');
    if (el1) el1.textContent = metrics.totalTrades;
    const el2 = document.getElementById('winRate');
    if (el2) el2.textContent = metrics.winRate + '%';
    const el3 = document.getElementById('totalPL');
    if (el3) el3.textContent = metrics.totalPL.toFixed(2);
    const el4 = document.getElementById('profitFactor');
    if (el4) el4.textContent = metrics.profitFactor;
    const el5 = document.getElementById('avgRR');
    if (el5) el5.textContent = metrics.avgRR;

    // Render charts
    renderRRChart(metrics);
    renderEmotionChart(metrics);
    renderDrawdownChart(metrics);

    // Display alerts
    const alerts = generateAlerts(metrics, filtered);
    const alertsList = document.getElementById('alertsList');
    if (alertsList) {
        alertsList.innerHTML = '';
        alerts.forEach(a => {
            const div = document.createElement('div');
            div.textContent = a;
            alertsList.appendChild(div);
        });
    }

    // Render enhanced trade table
    renderPhase4TradeTable(filtered);
}

// Render Phase 4 Trade Table with all columns
function renderPhase4TradeTable(trades) {
    const tableBody = document.getElementById('tradeTableBody');
    if (!tableBody) return; // Guard for missing element
    const noTradesMsg = document.getElementById('noTradesMessage');
    tableBody.innerHTML = '';

    if (!trades.length) {
        if (noTradesMsg) noTradesMsg.style.display = 'block';
        return;
    }
    if (noTradesMsg) noTradesMsg.style.display = 'none';

    const allTrades = getAllTrades();
    trades.forEach((t, idx) => {
        const pl = parseFloat(t.tp||0) - parseFloat(t.entry||0);
        const stop = parseFloat(t.stop||t.stopLoss||0);
        const rr = (t.entry && stop && pl !== 0) ? Math.abs(pl / Math.abs(t.entry - stop)).toFixed(2) : 'N/A';
        const outcome = pl > 0 ? 'Win' : pl < 0 ? 'Loss' : 'BE';
        const outcomeClass = pl > 0 ? 'outcome-win' : pl < 0 ? 'outcome-loss' : 'outcome-be';
        const emo = t.emotions || '-';
        const emoClass = 'emotion-' + (emo||'').toLowerCase().replace(/\s+/g, '-').split('-')[0];
        const date = new Date(t.date).toLocaleDateString();
        
        // Find actual index in allTrades
        const tradeIdx = allTrades.findIndex(tr => tr.date === t.date && tr.pair === t.pair && tr.entry === t.entry);

        const row = document.createElement('tr');
        row.className = emoClass || '';
        row.innerHTML = `
            <td>${date}</td>
            <td>${t.pair}</td>
            <td>${t.direction || '-'}</td>
            <td>${t.entry}</td>
            <td>${t.stop || t.stopLoss || '-'}</td>
            <td>${t.tp}</td>
            <td>${rr}</td>
            <td class="${outcomeClass}">${outcome}</td>
            <td>${pl.toFixed(2)}</td>
            <td>${emo}</td>
            <td>${t.confidence || '-'}</td>
            <td><button class="btn-action" onclick="openEditModal(${tradeIdx})">Edit</button></td>
        `;
        tableBody.appendChild(row);
    });
}

