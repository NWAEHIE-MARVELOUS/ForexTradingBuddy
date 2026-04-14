// -------------------- Android Compatibility Fixes --------------------
// Detect Android WebView
const isAndroidWebView = () => {
    return navigator.userAgent.includes('wv') || 
           navigator.userAgent.includes('WebView') ||
           window.hasOwnProperty('_cordova');
};

function persistTradeImage(tradeId, kind, dataUrl) {
    if (!dataUrl) return null;
    const storageKey = `tradeImage:${tradeId}:${kind}`;
    try {
        localStorage.setItem(storageKey, dataUrl);
        return storageKey;
    } catch (e) {
        console.error('Failed to persist trade image:', storageKey, e);
        return null;
    }
}

function getApprovedTradesAllStatuses() {
    try {
        const approved = JSON.parse(safeLocalStorage.getItem('approvedTrades') || '[]');
        return Array.isArray(approved) ? approved : [];
    } catch (e) {
        console.error('Error loading approvedTrades:', e);
        return [];
    }
}

function getApprovedCompletedTrades() {
    const all = getApprovedTradesAllStatuses();
    return Array.isArray(all) ? all.filter(t => t && t.status === 'completed') : [];
}

function getTradeDate(trade) {
    return trade?.date || trade?.completionTime || trade?.approvalTime || trade?.entryTime || null;
}

function getTradePL(trade) {
    // Option A: rely on realized P/L when available.
    // Fallbacks exist only to avoid NaNs if legacy data is present.
    if (!trade) return 0;
    if (trade.pl !== null && trade.pl !== undefined && !Number.isNaN(Number(trade.pl))) {
        return Number(trade.pl);
    }
    // Legacy fallback: if exitPrice exists, derive P/L from direction.
    const entry = Number(trade.entry);
    const exit = Number(trade.exitPrice);
    if (Number.isFinite(entry) && Number.isFinite(exit) && trade.direction) {
        const dir = String(trade.direction).toUpperCase();
        if (dir === 'BUY') return exit - entry;
        if (dir === 'SELL') return entry - exit;
    }
    return 0;
}

function resolveTradeImage(trade, kind) {
    try {
        if (!trade) return null;
        if (kind === 'before') {
            if (trade.beforePicture) return trade.beforePicture;
            if (trade.beforePictureKey) return localStorage.getItem(trade.beforePictureKey);
        }
        if (kind === 'after') {
            if (trade.afterPicture) return trade.afterPicture;
            if (trade.afterPictureKey) return localStorage.getItem(trade.afterPictureKey);
        }
        return null;
    } catch (e) {
        console.error('Failed to resolve trade image:', kind, e);
        return null;
    }
}

function stripApprovedTradeImages(trades) {
    if (!Array.isArray(trades)) return trades;
    return trades.map(t => ({
        ...t,
        beforePicture: null,
        afterPicture: null,
        beforePictureKey: t.beforePictureKey || null,
        afterPictureKey: t.afterPictureKey || null
    }));
}

// Safe localStorage with quota handling
const safeLocalStorage = {
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded, clearing old data');
                // Clear old trades if quota exceeded
                const trades = JSON.parse(localStorage.getItem('trades') || '[]');
                if (trades.length > 1000) {
                    const recentTrades = trades.slice(-500);
                    localStorage.setItem('trades', JSON.stringify(recentTrades));
                    // Retry
                    try {
                        localStorage.setItem(key, value);
                        return true;
                    } catch (e2) {
                        console.error('Still cannot save data:', e2);
                        return false;
                    }
                }
            }
        }
    },
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    }
};

// Function to view approved trade details
function viewTradeDetails(tradeId) {
    const approvedTrades = getApprovedTrades();
    const trade = approvedTrades.find(t => t.id === tradeId);
    
    if (!trade) {
        console.error('Approved trade not found:', tradeId);
        return;
    }
    
    const detailsContent = document.getElementById('tradeDetailsContent');
    if (!detailsContent) {
        console.error('tradeDetailsContent element not found');
        return;
    }
    
    const rr = trade.takeProfit && trade.stopLoss && trade.entry ? 
        Math.abs((trade.takeProfit - trade.entry) / (trade.entry - trade.stopLoss)).toFixed(2) : 'N/A';
    
    detailsContent.innerHTML = `
        <div style="display: grid; gap: 16px;">
            <div>
                <h4 style="color: #e2e8f0; margin-bottom: 8px;">Trade Information</h4>
                <div style="display: grid; gap: 8px;">
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Pair:</span>
                        <span class="trade-detail-value">${trade.pair || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Direction:</span>
                        <span class="trade-detail-value">${trade.direction || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Status:</span>
                        <span class="trade-detail-value">${trade.status || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Entry Time:</span>
                        <span class="trade-detail-value">${trade.entryTime ? new Date(trade.entryTime).toLocaleString() : 'N/A'}</span>
                    </div>
                    ${trade.status === 'completed' ? `
                        <div class="trade-detail-item">
                            <span class="trade-detail-label">Completion Time:</span>
                            <span class="trade-detail-value">${trade.completionTime ? new Date(trade.completionTime).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div class="trade-detail-item">
                            <span class="trade-detail-label">Outcome:</span>
                            <span class="trade-detail-value">${trade.outcome || 'N/A'}</span>
                        </div>
                        <div class="trade-detail-item">
                            <span class="trade-detail-label">Exit:</span>
                            <span class="trade-detail-value">${trade.exitPrice || 'N/A'}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div>
                <h4 style="color: #e2e8f0; margin-bottom: 8px;">Price Information</h4>
                <div style="display: grid; gap: 8px;">
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Entry:</span>
                        <span class="trade-detail-value">${trade.entry || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Stop Loss:</span>
                        <span class="trade-detail-value">${trade.stopLoss || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Take Profit:</span>
                        <span class="trade-detail-value">${trade.takeProfit || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Risk/Reward:</span>
                        <span class="trade-detail-value">${rr}</span>
                    </div>
                    ${trade.status === 'completed' ? `
                        <div class="trade-detail-item">
                            <span class="trade-detail-label">P/L:</span>
                            <span class="trade-detail-value">${trade.pl === null || trade.pl === undefined ? 'N/A' : (trade.pl >= 0 ? '+' : '') + trade.pl.toFixed(5)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            ${(trade.notes || trade.completionNotes) ? `
            <div>
                <h4 style="color: #e2e8f0; margin-bottom: 8px;">Notes</h4>
                ${trade.notes ? `<div style="background: rgba(51, 65, 85, 0.2); border-radius: 4px; padding: 8px; margin-bottom: 8px;">${String(trade.notes).replace(/\n/g,'<br>')}</div>` : ''}
                ${trade.completionNotes ? `<div style="background: rgba(51, 65, 85, 0.2); border-radius: 4px; padding: 8px;">${String(trade.completionNotes).replace(/\n/g,'<br>')}</div>` : ''}
            </div>
            ` : ''}
        </div>
    `;
    
    const modal = document.getElementById('tradeDetailsModal');
    if (modal) modal.style.display = 'flex';
}

// Android-safe event listeners
const addAndroidSafeListener = (element, event, handler, options = {}) => {
    if (!element) return;
    
    const androidOptions = isAndroidWebView() ? 
        { passive: true, ...options } : 
        options;
    
    // Handle touch/click conflicts on Android
    if (event === 'click' && isAndroidWebView()) {
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handler(e);
        }, { passive: false });
    } else {
        element.addEventListener(event, handler, androidOptions);
    }
};

// Android back button handling
if (isAndroidWebView()) {
    document.addEventListener('backbutton', (e) => {
        e.preventDefault();
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('collapsed')) {
            toggleSidebar();
        } else {
            // Show confirmation before closing
            if (confirm('Exit ForexBuddy?')) {
                navigator.app.exitApp();
            }
        }
    });
}

// -------------------- Approved Trades Journal System --------------------
let currentTradeForCompletion = null;
let afterImageData = null;

// Function to add approved trade to journal (only called after successful prompt completion)
function addApprovedTradeToJournal(tradeData) {
    const approvedTrade = {
        id: 'approved-' + Date.now(),
        ...tradeData,
        status: tradeData.status || 'live',
        entryTime: tradeData.entryTime || new Date().toISOString(),
        beforePicture: tradeData.beforePicture || null,
        afterPicture: null,
        completionNotes: '',
        outcome: null,
        exitPrice: null,
        pl: null,
        approvalTime: new Date().toISOString()
    };

    if (approvedTrade.beforePicture) {
        const key = persistTradeImage(approvedTrade.id, 'before', approvedTrade.beforePicture);
        if (key) {
            approvedTrade.beforePictureKey = key;
            approvedTrade.beforePicture = null;
        }
    }
    
    // Get existing approved trades
    const approvedTrades = getApprovedTrades();
    approvedTrades.push(approvedTrade);
    
    // Save to approved trades storage
    const ok = safeLocalStorage.setItem('approvedTrades', JSON.stringify(approvedTrades));
    if (!ok) {
        console.error('❌ Failed to persist approvedTrades via safeLocalStorage. Attempting direct localStorage fallback.');
        try {
            localStorage.setItem('approvedTrades', JSON.stringify(approvedTrades));
        } catch (e) {
            console.error('❌ Direct localStorage fallback also failed:', e);
            if (e && e.name === 'QuotaExceededError') {
                try {
                    const stripped = stripApprovedTradeImages(approvedTrades);
                    localStorage.setItem('approvedTrades', JSON.stringify(stripped));
                    console.warn('Retried approvedTrades save after stripping images from stored trades');
                } catch (e2) {
                    console.error('❌ ApprovedTrades save still failing after stripping images:', e2);
                }
            }
        }
    }
    
    // Update displays
    displayLiveTrades();
    displayCompletedTrades();
    
    console.log('✅ Approved trade added to journal:', approvedTrade);
    return approvedTrade;
}

// Function to get approved trades
function getApprovedTrades() {
    try {
        return JSON.parse(safeLocalStorage.getItem('approvedTrades') || '[]');
    } catch (e) {
        console.error('Error loading approved trades:', e);
        return [];
    }
}

// Function to get live trades
function getLiveTrades() {
    const approvedTrades = getApprovedTrades();
    return approvedTrades.filter(trade => trade.status === 'live');
}

// Function to get completed trades
function getCompletedTrades() {
    const approvedTrades = getApprovedTrades();
    return approvedTrades.filter(trade => trade.status === 'completed');
}

// Function to display live trades
function displayLiveTrades() {
    const container = document.getElementById('liveTradesContainer');
    if (!container) return;
    
    const liveTrades = getLiveTrades();
    
    if (liveTrades.length === 0) {
        container.innerHTML = '<div class="empty-state">No live trades currently</div>';
        return;
    }
    
    container.innerHTML = '';
    liveTrades.forEach(trade => {
        const tradeCard = createTradeCard(trade, 'live');
        container.appendChild(tradeCard);
    });
}

// Function to display completed trades
function displayCompletedTrades() {
    const container = document.getElementById('completedTradesContainer');
    if (!container) return;
    
    const filter = document.getElementById('completedFilter')?.value || 'all';
    let completedTrades = getCompletedTrades();
    
    // Apply filter
    if (filter !== 'all') {
        completedTrades = completedTrades.filter(trade => {
            if (filter === 'win') return trade.outcome === 'TP';
            if (filter === 'loss') return trade.outcome === 'SL';
            if (filter === 'be') return trade.outcome === 'BE';
            return true;
        });
    }
    
    if (completedTrades.length === 0) {
        container.innerHTML = '<div class="empty-state">No completed trades yet</div>';
        return;
    }
    
    container.innerHTML = '';
    // Sort by completion time (newest first)
    completedTrades.sort((a, b) => new Date(b.completionTime || 0) - new Date(a.completionTime || 0));
    
    completedTrades.forEach(trade => {
        const tradeCard = createTradeCard(trade, 'completed');
        container.appendChild(tradeCard);
    });
}

// Function to create trade card HTML
function createTradeCard(trade, status) {
    const card = document.createElement('div');
    card.className = `trade-card ${status} ${trade.outcome || ''}`;
    
    const rr = trade.takeProfit && trade.stopLoss && trade.entry ? 
        Math.abs((trade.takeProfit - trade.entry) / (trade.entry - trade.stopLoss)).toFixed(2) : 'N/A';
    
    const beforeSrc = resolveTradeImage(trade, 'before');
    const afterSrc = resolveTradeImage(trade, 'after');
    const imgStyle = "width: 100%; height: 120px; max-height: 28vw; object-fit: cover; border-radius: 8px;";

    card.innerHTML = `
        <div class="trade-header">
            <div class="trade-pair">${trade.pair || 'N/A'}</div>
            <div class="trade-direction ${trade.direction?.toLowerCase()}">${trade.direction || 'N/A'}</div>
            <div class="trade-status ${status}">${status === 'live' ? '🔴 LIVE' : '✅ COMPLETED'}</div>
        </div>
        <div class="trade-details">
            <div class="trade-detail-item">
                <span class="trade-detail-label">Entry:</span>
                <span class="trade-detail-value">${trade.entry || 'N/A'}</span>
            </div>
            <div class="trade-detail-item">
                <span class="trade-detail-label">SL:</span>
                <span class="trade-detail-value">${trade.stopLoss || 'N/A'}</span>
            </div>
            <div class="trade-detail-item">
                <span class="trade-detail-label">TP:</span>
                <span class="trade-detail-value">${trade.takeProfit || 'N/A'}</span>
            </div>
            <div class="trade-detail-item">
                <span class="trade-detail-label">R:R:</span>
                <span class="trade-detail-value">${rr}</span>
            </div>
            ${status === 'completed' ? `
            <div class="trade-detail-item">
                <span class="trade-detail-label">Exit:</span>
                <span class="trade-detail-value">${trade.exitPrice || 'N/A'}</span>
            </div>
            <div class="trade-detail-item">
                <span class="trade-detail-label">P/L:</span>
                <span class="trade-detail-value ${trade.pl >= 0 ? 'win' : trade.pl <= 0 ? 'loss' : 'be'}">
                    ${trade.pl ? (trade.pl >= 0 ? '+' : '') + trade.pl.toFixed(5) : 'N/A'}
                </span>
            </div>
            ` : ''}
        </div>
        <div class="trade-images">
            ${beforeSrc ? `
                <img src="${beforeSrc}" alt="Before" class="trade-image" style="${imgStyle}" onclick="viewImage('${beforeSrc}', 'Before Trade')">
            ` : '<div class="trade-image" style="background: #475569; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 10px; border-radius: 8px; height: 120px;">No Before</div>'}
            ${status === 'completed' && afterSrc ? `
                <img src="${afterSrc}" alt="After" class="trade-image" style="${imgStyle}" onclick="viewImage('${afterSrc}', 'After Trade')">
            ` : status === 'completed' ? '<div class="trade-image" style="background: #475569; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 10px; border-radius: 8px; height: 120px;">No After</div>' : '<div class="trade-image" style="background: #ef4444; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; border-radius: 8px; height: 120px;">LIVE</div>'}
        </div>
        <div class="trade-actions">
            <button class="btn-small btn-primary" onclick="viewTradeDetails('${trade.id}')">View Details</button>
            ${status === 'live' ? `<button class="btn-small btn-secondary" onclick="openTradeCompletionModal('${trade.id}')">Complete Trade</button>` : ''}
            ${status === 'completed' ? `
                <div class="trade-outcome">
                    <span class="outcome-badge ${trade.outcome?.toLowerCase()}">${trade.outcome || 'UNKNOWN'}</span>
                    ${trade.completionNotes ? `<button class="btn-small btn-info" onclick="viewCompletionNotes('${trade.id}')">View Notes</button>` : ''}
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Function to view completion notes
function viewCompletionNotes(tradeId) {
    const approvedTrades = getApprovedTrades();
    const trade = approvedTrades.find(t => t.id === tradeId);
    
    if (!trade || !trade.completionNotes) {
        alert('No completion notes found for this trade');
        return;
    }
    
    // Create modal for completion notes
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📝 Trade Completion Notes</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="trade-summary">
                    <p><strong>Pair:</strong> ${trade.pair || 'N/A'}</p>
                    <p><strong>Direction:</strong> ${trade.direction || 'N/A'}</p>
                    <p><strong>Outcome:</strong> <span class="outcome-badge ${trade.outcome?.toLowerCase()}">${trade.outcome || 'UNKNOWN'}</span></p>
                    <p><strong>P/L:</strong> <span class="${trade.pl >= 0 ? 'win' : 'loss'}">${trade.pl ? (trade.pl >= 0 ? '+' : '') + trade.pl.toFixed(5) : 'N/A'}</span></p>
                </div>
                <div class="completion-notes">
                    <h4>📖 Thoughts & Lessons Learned:</h4>
                    <div class="notes-content">${trade.completionNotes.replace(/\n/g, '<br>')}</div>
                </div>
                ${trade.afterPicture ? `
                    <div class="after-picture">
                        <h4>📸 After Trade Picture:</h4>
                        <img src="${trade.afterPicture}" alt="After Trade" style="max-width: 100%; border-radius: 8px;">
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Function to open trade completion modal
function openTradeCompletionModal(tradeId) {
    const approvedTrades = getApprovedTrades();
    const trade = approvedTrades.find(t => t.id === tradeId);
    
    if (!trade) {
        console.error('Trade not found:', tradeId);
        return;
    }
    
    currentTradeForCompletion = trade;
    
    // Reset form
    document.getElementById('completionOutcome').value = '';
    document.getElementById('exitPrice').value = '';
    document.getElementById('completionNotes').value = '';
    document.getElementById('afterPicture').value = '';
    document.getElementById('afterPicturePreview').innerHTML = '<div style="color: #94a3b8;">Click to add after picture</div>';
    afterImageData = null;
    
    // Show modal
    document.getElementById('tradeCompletionModal').style.display = 'flex';
}

// Function to complete trade
function completeTrade() {
    if (!currentTradeForCompletion) {
        console.error('No trade selected for completion');
        return;
    }
    
    const outcome = document.getElementById('completionOutcome').value;
    const exitPrice = parseFloat(document.getElementById('exitPrice').value);
    const completionNotes = document.getElementById('completionNotes').value.trim();
    
    if (!outcome || !exitPrice) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Calculate P/L
    const entryPrice = currentTradeForCompletion.entry;
    const stopLoss = currentTradeForCompletion.stopLoss;
    const takeProfit = currentTradeForCompletion.takeProfit;
    
    let pl = 0;
    if (currentTradeForCompletion.direction === 'BUY') {
        pl = exitPrice - entryPrice;
    } else {
        pl = entryPrice - exitPrice;
    }
    
    // Update trade data
    const approvedTrades = getApprovedTrades();
    const tradeIndex = approvedTrades.findIndex(t => t.id === currentTradeForCompletion.id);
    
    if (tradeIndex !== -1) {
        let updatedAfterPicture = afterImageData || null;
        let afterPictureKey = null;
        if (updatedAfterPicture) {
            afterPictureKey = persistTradeImage(currentTradeForCompletion.id, 'after', updatedAfterPicture);
            if (afterPictureKey) updatedAfterPicture = null;
        }

        approvedTrades[tradeIndex] = {
            ...approvedTrades[tradeIndex],
            status: 'completed',
            outcome: outcome,
            exitPrice: exitPrice,
            pl: pl,
            completionNotes: completionNotes,
            afterPicture: updatedAfterPicture,
            afterPictureKey: afterPictureKey || approvedTrades[tradeIndex].afterPictureKey || null,
            completionTime: new Date().toISOString()
        };
        
        // Save to approved trades storage
        safeLocalStorage.setItem('approvedTrades', JSON.stringify(approvedTrades));
        
        // Update displays
        displayLiveTrades();
        displayCompletedTrades();
        
        // Close modal
        closeTradeCompletionModal();
        
        // Show success message
        showToast(`Trade completed as ${outcome}! P/L: ${pl >= 0 ? '+' : ''}${pl.toFixed(5)}`, 3000);
        
        console.log('✅ Trade completed:', approvedTrades[tradeIndex]);
    }
}

// Function to close trade completion modal
function closeTradeCompletionModal() {
    document.getElementById('tradeCompletionModal').style.display = 'none';
    currentTradeForCompletion = null;
}

// Function to close trade details modal
function closeTradeDetailsModal() {
    document.getElementById('tradeDetailsModal').style.display = 'none';
}

// Function to view full image
function viewImage(imageSrc, title) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 90%;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body" style="text-align: center;">
                <img src="${imageSrc}" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px;">
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Function to clear completed trades
function clearCompletedTrades() {
    if (!confirm('Are you sure you want to clear all completed trades? This cannot be undone.')) {
        return;
    }
    
    const approvedTrades = getApprovedTrades();
    const liveTrades = approvedTrades.filter(trade => trade.status === 'live');
    
    // Keep only live trades
    safeLocalStorage.setItem('approvedTrades', JSON.stringify(liveTrades));
    
    // Update displays
    displayLiveTrades();
    displayCompletedTrades();
    
    showToast('All completed trades cleared', 2000);
}

// Function to add unapproved trade to journal
function addUnapprovedTradeToJournal(tradeData) {
    const unapprovedTrade = {
        id: 'unapproved-' + Date.now(),
        ...tradeData,
        status: 'unapproved',
        entryTime: new Date().toISOString(),
        beforePicture: tradeData.beforePicture || null,
        afterPicture: null,
        completionNotes: '',
        outcome: null,
        exitPrice: null,
        pl: null,
        rejectionReason: tradeData.rejectionReason || 'Trade did not meet criteria',
        unapprovedTime: new Date().toISOString()
    };
    
    // Get existing unapproved trades
    const unapprovedTrades = getUnapprovedTrades();
    unapprovedTrades.push(unapprovedTrade);
    
    // Save to unapproved trades storage
    safeLocalStorage.setItem('unapprovedTrades', JSON.stringify(unapprovedTrades));
    
    // Update displays
    displayLiveTrades();
    displayCompletedTrades();
    displayUnapprovedTrades();
    
    console.log('❌ Unapproved trade added to journal:', unapprovedTrade);
    return unapprovedTrade;
}

// Function to get unapproved trades
function getUnapprovedTrades() {
    try {
        return JSON.parse(safeLocalStorage.getItem('unapprovedTrades') || '[]');
    } catch (e) {
        console.error('Error loading unapproved trades:', e);
        return [];
    }
}

// Function to display unapproved trades
function displayUnapprovedTrades() {
    const container = document.getElementById('unapprovedTradesContainer');
    if (!container) return;
    
    const filter = document.getElementById('unapprovedFilter')?.value || 'all';
    let unapprovedTrades = getUnapprovedTrades();
    
    // Sort by unapproved time (most recent first) for deterministic rendering
    unapprovedTrades.sort((a, b) => new Date(b.unapprovedTime || 0) - new Date(a.unapprovedTime || 0));
    
    // Apply filter deterministically
    if (filter === 'recent') {
        unapprovedTrades = unapprovedTrades.slice(0, 5);
    } else if (filter === 'criteria') {
        unapprovedTrades = unapprovedTrades.filter(trade => trade.rejectionReason && trade.rejectionReason.includes('criteria'));
    } else if (filter === 'devils') {
        unapprovedTrades = unapprovedTrades.filter(trade => trade.rejectionReason && trade.rejectionReason.includes('devil'));
    }
    
    if (unapprovedTrades.length === 0) {
        container.innerHTML = '<div class="empty-state">No unapproved trades yet</div>';
        return;
    }
    
    container.innerHTML = '';
    unapprovedTrades.forEach(trade => {
        const tradeCard = createUnapprovedTradeCard(trade);
        container.appendChild(tradeCard);
    });
}

// Function to create unapproved trade card HTML
function createUnapprovedTradeCard(trade) {
    const card = document.createElement('div');
    card.className = `trade-card unapproved ${trade.rejectionReason && trade.rejectionReason.includes('criteria') ? 'failed-criteria' : ''} ${trade.rejectionReason && trade.rejectionReason.includes('devil') ? 'devils-trap' : ''}`;
    
    card.innerHTML = `
        <div class="trade-header">
            <div class="trade-pair">${trade.pair || 'N/A'}</div>
            <div class="trade-direction ${trade.direction?.toLowerCase()}">${trade.direction || 'N/A'}</div>
            <div class="trade-status unapproved">❌ UNAPPROVED</div>
        </div>
        <div class="trade-details">
            <div class="trade-detail-item">
                <span class="trade-detail-label">Entry:</span>
                <span class="trade-detail-value">${trade.entry || 'N/A'}</span>
            </div>
            <div class="trade-detail-item">
                <span class="trade-detail-label">SL:</span>
                <span class="trade-detail-value">${trade.stopLoss || 'N/A'}</span>
            </div>
            <div class="trade-detail-item">
                <span class="trade-detail-label">TP:</span>
                <span class="trade-detail-value">${trade.takeProfit || 'N/A'}</span>
            </div>
            <div class="trade-detail-item">
                <span class="trade-detail-label">R:R:</span>
                <span class="trade-detail-value">${trade.takeProfit && trade.stopLoss && trade.entry ? 
                    Math.abs((trade.takeProfit - trade.entry) / (trade.entry - trade.stopLoss)).toFixed(2) : 'N/A'}</span>
            </div>
        </div>
        <div class="trade-images">
            ${trade.beforePicture ? `
                <img src="${trade.beforePicture}" alt="Before" class="trade-image" onclick="viewImage('${trade.beforePicture}', 'Before Trade')">
            ` : '<div class="trade-image" style="background: #475569; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 10px;">No Before</div>'}
        </div>
        <div class="trade-rejection-reason">
            <strong>Rejection Reason:</strong> ${trade.rejectionReason || 'Unknown'}
        </div>
        <div class="trade-details">
            <div class="trade-detail-item">
                <span class="trade-detail-label">Unapproved Time:</span>
                <span class="trade-detail-value">${new Date(trade.unapprovedTime).toLocaleString()}</span>
            </div>
            <div class="trade-detail-item">
                <span class="trade-detail-label">Entry Time:</span>
                <span class="trade-detail-value">${new Date(trade.entryTime).toLocaleString()}</span>
            </div>
        </div>
        <div class="trade-actions">
            <button class="btn-small btn-primary" onclick="viewUnapprovedTradeDetails('${trade.id}')">View Details</button>
            <button class="btn-small btn-secondary" onclick="deleteUnapprovedTrade('${trade.id}')">Delete</button>
        </div>
    `;
    
    return card;
}

// Function to view unapproved trade details
function viewUnapprovedTradeDetails(tradeId) {
    const unapprovedTrades = getUnapprovedTrades();
    const trade = unapprovedTrades.find(t => t.id === tradeId);
    
    if (!trade) {
        console.error('Unapproved trade not found:', tradeId);
        return;
    }
    
    const detailsContent = document.getElementById('tradeDetailsContent');
    const rr = trade.takeProfit && trade.stopLoss && trade.entry ? 
        Math.abs((trade.takeProfit - trade.entry) / (trade.entry - trade.stopLoss)).toFixed(2) : 'N/A';
    
    detailsContent.innerHTML = `
        <div style="display: grid; gap: 16px;">
            <div>
                <h4 style="color: #e2e8f0; margin-bottom: 8px;">Unapproved Trade Information</h4>
                <div style="display: grid; gap: 8px;">
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Pair:</span>
                        <span class="trade-detail-value">${trade.pair || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Direction:</span>
                        <span class="trade-detail-value">${trade.direction || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Status:</span>
                        <span class="trade-detail-value" style="color: #dc2626;">${trade.status}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Entry Time:</span>
                        <span class="trade-detail-value">${new Date(trade.entryTime).toLocaleString()}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Unapproved Time:</span>
                        <span class="trade-detail-value">${new Date(trade.unapprovedTime).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div>
                <h4 style="color: #e2e8f0; margin-bottom: 8px;">Price Information</h4>
                <div style="display: grid; gap: 8px;">
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Entry:</span>
                        <span class="trade-detail-value">${trade.entry || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Stop Loss:</span>
                        <span class="trade-detail-value">${trade.stopLoss || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Take Profit:</span>
                        <span class="trade-detail-value">${trade.takeProfit || 'N/A'}</span>
                    </div>
                    <div class="trade-detail-item">
                        <span class="trade-detail-label">Risk/Reward:</span>
                        <span class="trade-detail-value">${rr}</span>
                    </div>
                </div>
            </div>
            <div>
                <h4 style="color: #e2e8f0; margin-bottom: 8px;">Rejection Details</h4>
                <div style="background: rgba(220, 38, 38, 0.2); border: 1px solid #dc2626; border-radius: 4px; padding: 8px; margin-top: 8px;">
                    <strong style="color: #dc2626; display: block; margin-bottom: 4px;">Rejection Reason:</strong> ${trade.rejectionReason || 'Unknown'}
                </div>
            </div>
            <div>
                <h4 style="color: #e2e8f0; margin-bottom: 8px;">Images</h4>
                <div class="trade-images">
                    ${trade.beforePicture ? `
                        <div>
                            <div style="color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Before Trade</div>
                            <img src="${trade.beforePicture}" alt="Before" class="trade-image" onclick="viewImage('${trade.beforePicture}', 'Before Trade')" style="width: 120px; height: 90px;">
                        </div>
                    ` : ''}
                </div>
            </div>
            ${trade.answers ? `
            <div>
                <h4 style="color: #e2e8f0; margin-bottom: 8px;">Prompt Responses</h4>
                <div style="background: rgba(51, 65, 85, 0.2); border-radius: 4px; padding: 8px;">
                    ${trade.answers.map((answer, index) => {
                        const prompt = prompts[index];
                        return `
                            <div style="margin-bottom: 8px;">
                                <strong>${prompt.text || 'N/A'}</strong>
                                <div style="color: ${answer === 'yes' ? '#22c55e' : '#ef4444'}; font-weight: bold; margin-top: 4px;">
                                    ${answer.toUpperCase()}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    // Show modal
    document.getElementById('tradeDetailsModal').style.display = 'flex';
}

// Function to delete unapproved trade
function deleteUnapprovedTrade(tradeId) {
    if (!confirm('Are you sure you want to delete this unapproved trade? This cannot be undone.')) {
        return;
    }
    
    const unapprovedTrades = getUnapprovedTrades();
    const tradeIndex = unapprovedTrades.findIndex(t => t.id === tradeId);
    
    if (tradeIndex !== -1) {
        const deleted = unapprovedTrades.splice(tradeIndex, 1)[0];
        safeLocalStorage.setItem('unapprovedTrades', JSON.stringify(unapprovedTrades));
        
        // Update displays
        displayUnapprovedTrades();
        
        showToast('Unapproved trade deleted', 2000);
        console.log('❌ Unapproved trade deleted:', deleted);
    }
}

// Function to clear all unapproved trades
function clearUnapprovedTrades() {
    if (!confirm('Are you sure you want to clear all unapproved trades? This cannot be undone.')) {
        return;
    }
    
    safeLocalStorage.setItem('unapprovedTrades', JSON.stringify([]));
    
    // Update displays
    displayUnapprovedTrades();
    displayLiveTrades();
    displayCompletedTrades();
    
    showToast('All unapproved trades cleared', 2000);
}

// Function to handle unapproved filter change
function handleUnapprovedFilterChange() {
    displayUnapprovedTrades();
}

// Function to toggle sidebar
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
        sec.classList.add('hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(section + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.remove('hidden');
        console.log('Section found and activated:', section + 'Section');

        // Ensure analytics renders when the user navigates there.
        if (section === 'analytics') {
            try {
                const completed = getApprovedCompletedTrades();
                renderEquityChart(completed);
                attachChartTooltip();
                renderPhase4Dashboard();
            } catch (e) {
                console.error('Analytics render failed on navigation:', e);
            }
        }
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
    try {
        console.log('Applying analytics filters');

        const ds = document.getElementById('analytics_dateStart')?.value || '';
        const de = document.getElementById('analytics_dateEnd')?.value || '';
        const strat = document.getElementById('analytics_strategy')?.value || '';

        // Bridge the analytics toolbar to the Phase 4 filtering system.
        // Keep IDs/names stable to avoid breaking the rest of the app.
        currentFilters.dateStart = ds;
        currentFilters.dateEnd = de;
        currentFilters.strategy = strat;

        renderPhase4Dashboard();

        // Equity curve is outside Phase 4 cards; keep it refreshed too.
        const completed = getApprovedCompletedTrades();
        renderEquityChart(completed);
        attachChartTooltip();
    } catch (e) {
        console.error('Failed to apply analytics filters:', e);
    }
}

function downloadData(format) {
    console.log('Downloading data as', format);
    try {
        if (String(format).toLowerCase() === 'csv') return exportCSV();
        if (String(format).toLowerCase() === 'json') return exportJSON();
        showToast('Unknown export format: ' + format, 2500);
    } catch (e) {
        console.error('Download failed:', e);
        showToast('Download failed', 2500);
    }
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
    const input = document.getElementById('newCriteria');
    const criteriaText = input.value.trim();
    
    if (!criteriaText) {
        alert('Please enter a trading criterion');
        return;
    }
    
    // Get existing criteria
    let criteria = [];
    try {
        criteria = JSON.parse(safeLocalStorage.getItem('tradingCriteria') || '[]');
    } catch (e) {
        console.error('Error loading criteria:', e);
        criteria = [];
    }
    
    // Add new criterion
    criteria.push(criteriaText);
    
    // Save using safe storage
    const success = safeLocalStorage.setItem('tradingCriteria', JSON.stringify(criteria));
    if (!success) {
        alert('Error saving criterion - storage may be full');
        return;
    }
    
    // Clear input
    input.value = '';
    
    // Update display
    displayCriteriaList();
    
    // Show success feedback
    const messageEl = document.getElementById('criteriaMessage') || createMessageElement('criteriaMessage');
    messageEl.textContent = '✅ Criterion added successfully!';
    messageEl.style.color = '#22c55e';
    
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.textContent = '';
        }
    }, 3000);
    
    console.log('✅ Trading criterion saved:', criteriaText);
}

function addDevilsLie() {
    console.log('Adding devils lie');
    const input = document.getElementById('newDevilsLie');
    const riskSelect = document.getElementById('devilsLieRisk');
    const lieText = input.value.trim();
    const riskLevel = riskSelect.value;
    
    if (!lieText) {
        alert('Please enter a devil\'s lie pattern');
        return;
    }
    
    // Get existing devils lies
    let devilsLies = [];
    try {
        devilsLies = JSON.parse(safeLocalStorage.getItem('devilsLies') || '[]');
    } catch (e) {
        console.error('Error loading devils lies:', e);
        devilsLies = [];
    }
    
    // Add new devils lie with risk level
    const newLie = {
        id: 'lie-' + Date.now(),
        text: lieText,
        risk: riskLevel,
        createdAt: new Date().toISOString()
    };
    
    devilsLies.push(newLie);
    
    // Save using safe storage
    const success = safeLocalStorage.setItem('devilsLies', JSON.stringify(devilsLies));
    if (!success) {
        alert('Error saving devil\'s lie - storage may be full');
        return;
    }
    
    // Clear inputs
    input.value = '';
    riskSelect.value = 'Medium';
    
    // Update display
    displayDevilsLieList();
    
    // Show success feedback
    const messageEl = document.getElementById('devilsLieMessage') || createMessageElement('devilsLieMessage');
    messageEl.textContent = '✅ Devil\'s lie pattern added successfully!';
    messageEl.style.color = '#22c55e';
    
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.textContent = '';
        }
    }, 3000);
    
    console.log('✅ Devil\'s lie saved:', newLie);
}

function displayCriteriaList() {
    const container = document.getElementById('criteriaList');
    if (!container) return;
    
    let criteria = [];
    try {
        criteria = JSON.parse(safeLocalStorage.getItem('tradingCriteria') || '[]');
    } catch (e) {
        console.error('Error loading criteria for display:', e);
        criteria = [];
    }
    
    container.innerHTML = '';
    
    if (criteria.length === 0) {
        container.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 20px;">No trading criteria added yet</div>';
        return;
    }
    
    criteria.forEach((criterion, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 4px; background: rgba(51, 65, 85, 0.3); border-radius: 4px;';
        
        item.innerHTML = `
            <span style="color: #e2e8f0;">${criterion}</span>
            <button onclick="removeCriteria(${index})" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
        `;
        
        container.appendChild(item);
    });
}

function displayDevilsLieList() {
    const container = document.getElementById('devilsLieList');
    if (!container) return;
    
    let devilsLies = [];
    try {
        devilsLies = JSON.parse(safeLocalStorage.getItem('devilsLies') || '[]');
    } catch (e) {
        console.error('Error loading devils lies for display:', e);
        devilsLies = [];
    }
    
    container.innerHTML = '';
    
    if (devilsLies.length === 0) {
        container.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 20px;">No devil\'s lie patterns added yet</div>';
        return;
    }
    
    devilsLies.forEach((lie, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 4px; background: rgba(51, 65, 85, 0.3); border-radius: 4px;';
        
        const riskColor = lie.risk === 'High' ? '#ef4444' : lie.risk === 'Medium' ? '#f59e0b' : '#22c55e';
        
        item.innerHTML = `
            <div style="flex: 1;">
                <div style="color: #e2e8f0; margin-bottom: 4px;">${lie.text}</div>
                <div style="color: ${riskColor}; font-size: 12px; font-weight: bold;">${lie.risk} Risk</div>
            </div>
            <button onclick="removeDevilsLie(${index})" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
        `;
        
        container.appendChild(item);
    });
}

function removeCriteria(index) {
    if (!confirm('Remove this trading criterion?')) return;
    
    let criteria = [];
    try {
        criteria = JSON.parse(safeLocalStorage.getItem('tradingCriteria') || '[]');
    } catch (e) {
        console.error('Error loading criteria for removal:', e);
        return;
    }
    
    const removed = criteria.splice(index, 1)[0];
    safeLocalStorage.setItem('tradingCriteria', JSON.stringify(criteria));
    
    displayCriteriaList();
    console.log('✅ Trading criterion removed:', removed);
}

function removeDevilsLie(index) {
    if (!confirm('Remove this devil\'s lie pattern?')) return;
    
    let devilsLies = [];
    try {
        devilsLies = JSON.parse(safeLocalStorage.getItem('devilsLies') || '[]');
    } catch (e) {
        console.error('Error loading devils lies for removal:', e);
        return;
    }
    
    const removed = devilsLies.splice(index, 1)[0];
    safeLocalStorage.setItem('devilsLies', JSON.stringify(devilsLies));
    
    displayDevilsLieList();
    console.log('✅ Devil\'s lie removed:', removed.text);
}

function createMessageElement(id) {
    const existing = document.getElementById(id);
    if (existing) return existing;
    
    const messageEl = document.createElement('div');
    messageEl.id = id;
    messageEl.style.cssText = 'margin-top: 8px; font-size: 14px; font-weight: 500;';
    
    // Find appropriate parent to append to
    const newCriteriaInput = document.getElementById('newCriteria');
    if (newCriteriaInput) {
        newCriteriaInput.parentNode.appendChild(messageEl);
    }
    
    return messageEl;
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

function applyAnalyticsFilters__legacy() {
    console.log('Applying analytics filters');
}

function downloadData__placeholder(format) {
    console.log('Downloading data as', format);
    // Placeholder for older builds; main implementation is defined earlier.
    return false;
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
    console.log('Handling logo upload', event);
    // Implementation needed
}

function savePromptImageForType() {
    console.log('Saving prompt image for type');
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
const criteriaList = [
    "Identified bullish and bearish structure",
    "Identified liquidity road map", 
    "Identified stop hunt liquidity on HTF",
    "Identified DOL",
    "Identified PD array",
    "Identified LTF CHOCH (if used)"
];
const devilList = [
    "Failed structure in order flow",
    "Predetermined target liquidity hunt and PD array not taken",
    "Target PD array already mitigated",
    "DOL already taken"
];

// Global variables
let prompts = [];
let answers = [];
let promptIndex = 0;
let currentDecision = null; // Store the decision globally

// Prevent slider auto-answering: require user interaction per prompt
let sliderMovedForCurrentPrompt = false;

// -------------------- Settings Storage Functions --------------------
function savePreTradeSettings() {
    const settings = {
        minConfluence: minConfluenceInput?.value || 4, // Changed from 6 to 4 - more reasonable
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
    
    // Initialize user's custom criteria and devils lies if not present
    initializeUserTradingData();
    initializeUserDevilsLies(); // Initialize devil's lie patterns
    
    // Initialize criteria and devils lie displays
    displayCriteriaList();
    displayDevilsLieList();
}

function initializeUserTradingData() {
    // Initialize trading criteria if empty
    let existingCriteria = [];
    try {
        existingCriteria = JSON.parse(safeLocalStorage.getItem('tradingCriteria') || '[]');
    } catch (e) {
        console.error('Error checking existing criteria:', e);
        existingCriteria = [];
    }
    
    if (existingCriteria.length === 0) {
        // Pre-populate with user's exact criteria
        const userCriteria = [
            "Identified bullish and bearish structure",
            "Identified liquidity road map", 
            "Identified stop hunt liquidity on HTF",
            "Identified DOL",
            "Identified PD array",
            "Identified LTF CHOCH (if used)"
        ];
        safeLocalStorage.setItem('tradingCriteria', JSON.stringify(userCriteria));
        console.log('✅ Initialized user trading criteria:', userCriteria);
    } else {
        // Remove duplicates from existing criteria
        const uniqueCriteria = [...new Set(existingCriteria)];
        if (uniqueCriteria.length !== existingCriteria.length) {
            safeLocalStorage.setItem('tradingCriteria', JSON.stringify(uniqueCriteria));
            console.log('✅ Removed duplicates from trading criteria:', uniqueCriteria);
        }
    }
    
    // Initialize devils lies if empty
    let existingDevilsLies = [];
    try {
        existingDevilsLies = JSON.parse(safeLocalStorage.getItem('devilsLies') || '[]');
    } catch (e) {
        console.error('Error checking existing devils lies:', e);
        existingDevilsLies = [];
    }
    
    if (existingDevilsLies.length === 0) {
        // Pre-populate with user's exact devil's lies
        const userDevilsLies = [
            {
                id: 'lie-1',
                text: "Failed structure in order flow",
                risk: "High",
                createdAt: new Date().toISOString()
            },
            {
                id: 'lie-2', 
                text: "Predetermined target liquidity hunt and PD array not taken",
                risk: "High",
                createdAt: new Date().toISOString()
            },
            {
                id: 'lie-3',
                text: "Target PD array already mitigated",
                risk: "Medium", 
                createdAt: new Date().toISOString()
            },
            {
                id: 'lie-4',
                text: "DOL already taken",
                risk: "High",
                createdAt: new Date().toISOString()
            }
        ];
        safeLocalStorage.setItem('devilsLies', JSON.stringify(userDevilsLies));
        console.log('✅ Initialized user devils lies:', userDevilsLies);
    } else {
        // Remove duplicates from existing devils lies
        const uniqueDevilsLies = existingDevilsLies.filter((lie, index, self) => {
            const text = typeof lie === 'string' ? lie : lie.text;
            return index === self.findIndex(l => {
                const lText = typeof l === 'string' ? l : l.text;
                return lText === text;
            });
        });
        if (uniqueDevilsLies.length !== existingDevilsLies.length) {
            safeLocalStorage.setItem('devilsLies', JSON.stringify(uniqueDevilsLies));
            console.log('✅ Removed duplicates from devils lies:', uniqueDevilsLies);
        }
    }
}

function validatePromptSequence() {
    const tradingCriteria = getTradingCriteria();
    const devilLies = getDevilsLiePatterns();
    
    // Check for duplicates within trading criteria
    const criteriaDuplicates = tradingCriteria.filter((item, index) => 
        tradingCriteria.indexOf(item) !== index
    );
    
    // Check for duplicates within devils lies
    const lieDuplicates = devilLies.filter((item, index) => {
        const text = typeof item === 'string' ? item : item.text;
        return index !== devilLies.findIndex(l => {
            const lText = typeof l === 'string' ? l : l.text;
            return lText === text;
        });
    });
    
    if (criteriaDuplicates.length > 0) {
        console.warn('⚠️ Found duplicate trading criteria:', criteriaDuplicates);
    }
    
    if (lieDuplicates.length > 0) {
        console.warn('⚠️ Found duplicate devil\'s lies:', lieDuplicates);
    }
    
    return {
        criteriaDuplicates: criteriaDuplicates.length,
        lieDuplicates: lieDuplicates.length,
        totalCriteria: tradingCriteria.length,
        totalDevilsLies: devilLies.length
    };
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
    const strategyName = String(tradeIdea.strategy || strategyInput?.value || '').trim().toLowerCase();
    const rule = rules.find(r => String(r.strategyName || '').trim().toLowerCase() === strategyName);
    if (!rule) return { ok: true };
    // check allowed sessions
    if (rule.allowedSessions && rule.allowedSessions.length) {
        const session = String(tradeIdea.session || localStorage.getItem('currentSession') || '').trim().toLowerCase();
        const allowed = rule.allowedSessions.map(s => String(s).trim().toLowerCase());
        if (session && !allowed.includes(session)) return { ok: false, reason: 'Session not allowed by strategy' };
    }
    // check min RR
    const entry = parseFloat(tradeIdea.entry);
    const sl = parseFloat(tradeIdea.sl ?? tradeIdea.stopLoss);
    const tp = parseFloat(tradeIdea.tp ?? tradeIdea.takeProfit);
    if (rule.minRR && Number.isFinite(entry) && Number.isFinite(sl) && Number.isFinite(tp)) {
        const rr = Math.abs((tp - entry) / (entry - sl));
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
    currentTradeIdea = tradeIdea || null;
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
function saveStrategy() {
    console.log('🔍 saveStrategy called, text:', strategyInput.value.trim());
    const text = strategyInput.value.trim();
    if (!text) {
        strategySavedMessage.textContent = "Please type your strategy first.";
        strategySavedMessage.style.color = "#ef4444";
        return;
    }
    
    // Save using safe localStorage
    const success = safeLocalStorage.setItem("myStrategy", text);
    if (!success) {
        strategySavedMessage.textContent = "Error saving strategy - storage full!";
        strategySavedMessage.style.color = "#ef4444";
        return;
    }
    
    console.log('🔍 Strategy saved to localStorage:', text);
    
    // Verify it was saved
    const verify = safeLocalStorage.getItem("myStrategy");
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

function loadStrategy() {
    const saved = safeLocalStorage.getItem("myStrategy") || "";
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

function startPrompts() {
    console.log('startPrompts called');
    
    // Validate prompt sequence before starting
    const validation = validatePromptSequence();
    console.log(' Prompt sequence validation:', validation);
    
    if (validation.criteriaDuplicates > 0 || validation.lieDuplicates > 0) {
        console.warn(' Duplicates found, cleaning up...');
        initializeUserTradingData(); // Re-initialize to clean duplicates
    }
    
    // Debug: Show what's saved in localStorage
    console.log('=== DEBUG: Saved Settings ===');
    console.log('Trading Criteria:', JSON.parse(localStorage.getItem('tradingCriteria') || '[]'));
    console.log('Devils Lies:', JSON.parse(localStorage.getItem('devilsLies') || '[]'));
    console.log('Strategy Rules:', JSON.parse(localStorage.getItem('strategyRules') || '{}'));
    console.log('Risk Settings:', JSON.parse(localStorage.getItem('riskSettings') || '{}'));
    console.log('Emotional Settings:', JSON.parse(localStorage.getItem('emotionalSettings') || '{}'));
    
    // Hide all other sections
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('journalSection').classList.add('hidden');
    document.getElementById('analyticsSection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    // Show prompt section
    const promptSection = document.getElementById("promptSection");
    if (promptSection) {
        promptSection.classList.remove('hidden');
        promptSection.classList.add('active');
    }
    
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
        'devil': 'Devil\'s Traps'
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
        text: " Is this trade in line with your trading strategy?",
        type: "strategy",
        image: getPromptImage('strategy')
    });
    
    // 1. Trading Criteria prompts (using saved criteria - EXACT ORDER, NO DUPLICATES)
    const tradingCriteria = getTradingCriteria();
    console.log(' DEBUG: Using trading criteria from storage:', tradingCriteria);
    console.log(' DEBUG: Total criteria count:', tradingCriteria.length);
    tradingCriteria.forEach((criterion, index) => {
        prompts.push({
            text: " Trading Criteria: " + criterion,
            type: "criteria",
            image: getPromptImage('criteria', criterion)
        });
    });
    
    // 2. Devil's trap prompts (using saved data - EXACT ORDER, NO DUPLICATES)
    const devilLies = getDevilsLiePatterns();
    console.log(' DEBUG: Using devil\'s lies from storage:', devilLies);
    console.log(' DEBUG: Total devil\'s lies count:', devilLies.length);
    console.log('🔍 DEBUG: Using devil\'s lies from storage:', devilLies);
    console.log('🔍 DEBUG: Total devil\'s lies count:', devilLies.length);
    devilLies.forEach((lie, index) => {
        const promptText = typeof lie === 'string' ? lie : (lie.text || lie.pattern || lie);
        prompts.push({
            text: "🚫 Devil's Trap: " + promptText,
            type: "devil",
            image: getPromptImage('devil', promptText)
        });
    });

    // 3. Strategy Rules prompts (Option B)
    // Pull the saved rule for the currently selected strategy and ask the user to confirm
    // the actual RR + session for THIS trade.
    try {
        const strategyName = String(strategyInput?.value || '').trim();
        const savedRules = loadRules();
        const matchedRule = Array.isArray(savedRules)
            ? savedRules.find(r => String(r.strategyName || '').trim().toLowerCase() === strategyName.toLowerCase())
            : null;

        if (matchedRule) {
            if (matchedRule.minRR) {
                prompts.push({
                    text: `⚖️ Strategy Rule - Min R:R (Required: ${matchedRule.minRR})`,
                    type: 'minRR',
                    inputType: 'number',
                    rule: { minRR: matchedRule.minRR },
                    image: getPromptImage('minRR')
                });
            }
            if (Array.isArray(matchedRule.allowedSessions) && matchedRule.allowedSessions.length) {
                prompts.push({
                    text: `⚖️ Strategy Rule - Trading Session (Allowed: ${matchedRule.allowedSessions.join(', ')})`,
                    type: 'sessions',
                    inputType: 'text',
                    rule: { allowedSessions: matchedRule.allowedSessions },
                    image: getPromptImage('sessions')
                });
            }
        }
    } catch (e) {
        console.error('Failed to build strategy rules prompts:', e);
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
    
    console.log('✅ Built prompt sequence with', prompts.length, 'prompts');
    console.log('📋 Trading Criteria:', tradingCriteria.length, 'items');
    console.log('👿 Devil\'s Lies:', devilLies.length, 'items');
    
    return prompts;
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

// Function to initialize user's custom devil's lie patterns
function initializeUserDevilsLies() {
    console.log('🔍 Initializing user devil\'s lie patterns...');
    
    // Check if devil's lies already exist
    const existingDevilsLies = JSON.parse(safeLocalStorage.getItem('devilsLies') || '[]');
    
    if (existingDevilsLies.length === 0) {
        // Initialize with user's custom devil's lie patterns
        const userDevilsLies = [
            {
                id: 'lie-1',
                text: "Failed structure in order flow",
                risk: "High",
                createdAt: new Date().toISOString()
            },
            {
                id: 'lie-2', 
                text: "Predetermined target liquidity hunt and PD array not taken",
                risk: "Medium",
                createdAt: new Date().toISOString()
            },
            {
                id: 'lie-3',
                text: "Target PD array already mitigated", 
                risk: "Medium",
                createdAt: new Date().toISOString()
            },
            {
                id: 'lie-4',
                text: "DOL already taken",
                risk: "High", 
                createdAt: new Date().toISOString()
            }
        ];
        
        safeLocalStorage.setItem('devilsLies', JSON.stringify(userDevilsLies));
        console.log('✅ Initialized user devil\'s lies:', userDevilsLies);
        
        // Update display
        displayDevilsLieList();
    } else {
        console.log('📋 Devil\'s lies already exist:', existingDevilsLies);
    }
}

function getDevilsLiePatterns() {
    let saved = [];
    try {
        saved = JSON.parse(safeLocalStorage.getItem('devilsLies') || '[]');
    } catch (e) {
        console.error('Error loading devils lies:', e);
        saved = [];
    }
    
    if (saved.length === 0) {
        // Return user's exact devil's lie patterns
        return [
            "Failed structure in order flow",
            "Predetermined target liquidity hunt and PD array not taken",
            "Target PD array already mitigated",
            "DOL already taken"
        ];
    }
    
    // Extract text from saved objects (handle both string and object formats)
    return saved.map(lie => {
        if (typeof lie === 'string') return lie;
        if (typeof lie === 'object' && lie.text) return lie.text;
        return String(lie); // Fallback
    });
}

function getTradingCriteria() {
    let saved = [];
    try {
        saved = JSON.parse(safeLocalStorage.getItem('tradingCriteria') || '[]');
    } catch (e) {
        console.error('Error loading trading criteria:', e);
        saved = [];
    }
    
    if (saved.length === 0) {
        // Return user's exact trading criteria
        return [
            "Identified bullish and bearish structure",
            "Identified liquidity road map", 
            "Identified stop hunt liquidity on HTF",
            "Identified DOL",
            "Identified PD array",
            "Identified LTF CHOCH (if used)"
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
    // Source of truth: Journal entries
    // - Approved trades are stored under 'approvedTrades'
    // - Legacy analytics used 'tradeJournals' (older system)
    // Prefer approved trades so analytics reflects what you see in the journal.
    try {
        const approved = JSON.parse(safeLocalStorage.getItem('approvedTrades') || '[]');
        if (Array.isArray(approved) && approved.length) return approved;
    } catch (e) {
        console.error('Error loading approvedTrades for analytics:', e);
    }
    try {
        return JSON.parse(localStorage.getItem('tradeJournals') || '[]');
    } catch (e) {
        console.error('Error loading tradeJournals for analytics:', e);
        return [];
    }
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
        const pl = getTradePL(t);
        totalPL += pl;
        if (pl > 0) { wins++; grossWin += pl; }
        else if (pl < 0) { losses++; grossLoss += Math.abs(pl); }
        // approx r-multiple if entry/stop/tp exist
        const stop = parseFloat(t.stop ?? t.stopLoss ?? 0);
        const entry = parseFloat(t.entry ?? 0);
        if (Number.isFinite(entry) && Number.isFinite(stop) && entry !== stop && pl !== 0) {
            const rr = Math.abs(pl / Math.abs(entry - stop));
            if (Number.isFinite(rr)) { rSum += rr; rCount++; }
        }
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
        const win = getTradePL(t) > 0 ? 1 : 0;

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
        const d = new Date(getTradeDate(t) || Date.now()).toDateString();
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
        const prevPL = getTradePL(prev);
        const curPL = getTradePL(cur);
        if (prevPL < 0) { afterLossTotal++; if (curPL > 0) afterLossWins++; }
    }
    if (afterLossTotal > 0) {
        const rate = (afterLossWins / afterLossTotal) * 100;
        if (rate < 40) alerts.push(`⚠ Performance drop after loss: win rate ${rate.toFixed(0)}%`);
    }

    // Impulse correlation: trades with impulse>3
    const impulseTrades = all.filter(t => (t.impulse || 0) > 3);
    if (impulseTrades.length) {
        const wins = impulseTrades.filter(t => getTradePL(t) > 0).length;
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
                sliderMovedForCurrentPrompt = false;
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
                    promptNumber.placeholder = `e.g., 1.5 (must be >= ${current.rule?.minRR ?? ''})`;
                    console.log('Showing number input for min R:R, required:', current.rule?.minRR);
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
                    promptTextInput.placeholder = `e.g., NY, LONDON, ASIAN (allowed: ${(current.rule?.allowedSessions || []).join(', ')})`;
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
        sliderMovedForCurrentPrompt = true;
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

        // Block auto-answer: require the user to move the slider for this prompt.
        if (!sliderMovedForCurrentPrompt) {
            console.warn('🚨 Prevented auto-answer: slider was not moved for this prompt.');
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
            const minConfluence = parseInt(settings.minConfluence) || 4; // Changed from 6 to 4
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

// Conditional Trade Input System
let currentTradeDecision = null;
let approvedTradeData = null;
let rejectedTradeData = null;
let currentTradeIdea = null;

// Function to continue after decision - redirect to appropriate input section
function continueAfterDecision() {
    console.log('=== CONTINUE BUTTON CLICKED ===');
    console.log('Current decision:', currentDecision);
    
    if (!currentDecision) {
        console.error('❌ No current decision found!');
        return;
    }
    
    // Hide decision section
    const decisionSection = document.getElementById('decisionSection');
    if (decisionSection) {
        decisionSection.classList.add('hidden');
        decisionSection.classList.remove('active');
    }
    
    if (currentDecision.valid) {
        // Navigate to approved trade input section
        console.log('🚀 Navigating to approved trade input...');
        navigateToApprovedTradeInput();
    } else {
        // Navigate to rejected trade input section
        console.log('🚫 Navigating to rejected trade input...');
        navigateToRejectedTradeInput();
    }
}

// Function to navigate to approved trade input section
function navigateToApprovedTradeInput() {
    console.log('🚀 DEBUG: Navigating to approved trade input section...');
    console.log('🚀 DEBUG: Current decision data:', currentDecision);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Show approved trade input section
    const approvedSection = document.getElementById('approvedTradeInputSection');
    if (approvedSection) {
        approvedSection.classList.remove('hidden');
        approvedSection.classList.add('active');
        console.log('✅ DEBUG: Approved trade input section activated');
        
        // Pre-populate form with prompt data
        prepopulateApprovedTradeForm();
        
        // Update navigation
        updateNavigationForSection('approvedTradeInput');
    } else {
        console.error('❌ DEBUG: Approved trade input section not found!');
    }
}

// Function to navigate to rejected trade input section
function navigateToRejectedTradeInput() {
    console.log('🚫 DEBUG: Navigating to rejected trade input section...');
    console.log('🚫 DEBUG: Current decision data:', currentDecision);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Show rejected trade input section
    const rejectedSection = document.getElementById('rejectedTradeInputSection');
    if (rejectedSection) {
        rejectedSection.classList.remove('hidden');
        rejectedSection.classList.add('active');
        console.log('✅ DEBUG: Rejected trade input section activated');
        
        // Pre-populate form with prompt data
        prepopulateRejectedTradeForm();
        
        // Update navigation
        updateNavigationForSection('rejectedTradeInput');
    } else {
        console.error('❌ DEBUG: Rejected trade input section not found!');
    }
}

// Function to update navigation for custom sections
function updateNavigationForSection(section) {
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // No nav button should be active for these special sections
    console.log(`Navigation updated for section: ${section}`);
}

// Function to pre-populate approved trade form with prompt data
function prepopulateApprovedTradeForm() {
    console.log('Pre-populating approved trade form...');
    
    // Get strategy from strategy input
    const strategy = strategyInput?.value || 'Default Strategy';
    
    // Pre-populate strategy field if it exists
    const approvedStrategyField = document.getElementById('approvedStrategy');
    if (approvedStrategyField) {
        approvedStrategyField.value = strategy;
    }
    
    // Calculate confidence based on yes/no ratio
    const confidence = currentDecision ? Math.round((currentDecision.yesCount / (currentDecision.yesCount + currentDecision.noCount)) * 10) : 5;
    const approvedConfidenceField = document.getElementById('approvedConfidence');
    if (approvedConfidenceField) {
        approvedConfidenceField.value = confidence;
    }
    
    // Set emotion based on confidence
    const approvedEmotionField = document.getElementById('approvedEmotion');
    if (approvedEmotionField) {
        if (confidence >= 8) {
            approvedEmotionField.value = 'CONFIDENT';
        } else if (confidence >= 6) {
            approvedEmotionField.value = 'NEUTRAL';
        } else {
            approvedEmotionField.value = 'CAUTIOUS';
        }
    }
    
    // Pre-populate notes with prompt summary
    const approvedNotesField = document.getElementById('approvedNotes');
    if (approvedNotesField) {
        const notes = `Trade approved with ${currentDecision?.yesCount || 0} yes and ${currentDecision?.noCount || 0} no responses. Strategy: ${strategy}`;
        approvedNotesField.value = notes;
    }
    
    console.log('Approved trade form pre-populated');
}

// Function to pre-populate rejected trade form with prompt data
function prepopulateRejectedTradeForm() {
    console.log('Pre-populating rejected trade form...');
    
    // Get strategy from strategy input
    const strategy = strategyInput?.value || 'Default Strategy';
    
    // Pre-populate rejection reason with critical issues
    const rejectedReasonField = document.getElementById('rejectedRejectionReason');
    if (rejectedReasonField) {
        const rejectionReason = currentDecision?.criticalIssues?.join(', ') || 'Trade did not meet criteria';
        rejectedReasonField.value = rejectionReason;
    }
    
    // Pre-populate notes with prompt summary
    const rejectedNotesField = document.getElementById('rejectedNotes');
    if (rejectedNotesField) {
        const notes = `Trade rejected with ${currentDecision?.yesCount || 0} yes and ${currentDecision?.noCount || 0} no responses. Strategy: ${strategy}. Issues: ${currentDecision?.criticalIssues?.join(', ') || 'Unknown'}`;
        rejectedNotesField.value = notes;
    }
    
    console.log('Rejected trade form pre-populated');
}

// Function to handle approved trade form submission
function handleApprovedTradeFormSubmit(event) {
    event.preventDefault();
    console.log('🚀 DEBUG: Submitting approved trade form...');
    
    const formData = new FormData(event.target);
    const tradeData = {
        status: 'live',
        entryTime: new Date().toISOString(),
        pair: formData.get('pair'),
        direction: formData.get('direction'),
        entry: parseFloat(formData.get('entry')),
        stopLoss: parseFloat(formData.get('stopLoss')),
        takeProfit: parseFloat(formData.get('takeProfit')),
        lotSize: parseFloat(formData.get('lotSize')),
        confidence: parseInt(formData.get('confidence')),
        emotion: formData.get('emotion'),
        strategy: strategyInput?.value || 'Default Strategy',
        notes: formData.get('notes'),
        beforePicture: approvedTradeData?.beforePicture || null,
        afterPicture: null,
        completionNotes: '',
        outcome: null,
        exitPrice: null,
        pl: null,
        approvalTime: new Date().toISOString(),
        answers: currentDecision?.answers || [],
        yesCount: currentDecision?.yesCount || 0,
        noCount: currentDecision?.noCount || 0
    };
    
    console.log('🚀 DEBUG: Approved trade data prepared:', tradeData);
    console.log('🚀 DEBUG: Saving to approved trades journal...');
    
    // Save to journal
    addApprovedTradeToJournal(tradeData);
    
    // Show success message
    const messageEl = document.getElementById('approvedTradeMessage');
    if (messageEl) {
        messageEl.textContent = '✅ Approved trade saved successfully!';
        messageEl.className = 'form-message success';
    }
    
    // Reset form after 2 seconds
    setTimeout(() => {
        event.target.reset();
        if (messageEl) {
            messageEl.textContent = '';
            messageEl.className = 'form-message';
        }
        
        // Navigate back to journal
        console.log('🚀 DEBUG: Navigating back to journal after approved trade save...');
        navigateTo('journal');
    }, 2000);
    
    console.log('🚀 DEBUG: Approved trade saved successfully:', tradeData);
}

// Function to handle rejected trade form submission
function handleRejectedTradeFormSubmit(event) {
    event.preventDefault();
    console.log('🚫 DEBUG: Submitting rejected trade form...');
    
    const formData = new FormData(event.target);
    const tradeData = {
        id: 'rejected-' + Date.now(),
        status: 'unapproved',
        entryTime: new Date().toISOString(),
        pair: formData.get('pair'),
        direction: formData.get('direction'),
        entry: parseFloat(formData.get('entry')),
        stopLoss: parseFloat(formData.get('stopLoss')),
        takeProfit: parseFloat(formData.get('takeProfit')),
        lotSize: 0, // Not applicable for rejected trades
        confidence: 0, // Not applicable for rejected trades
        emotion: 'REJECTED',
        strategy: strategyInput?.value || 'Default Strategy',
        notes: formData.get('notes'),
        beforePicture: rejectedTradeData?.beforePicture || null,
        afterPicture: null,
        completionNotes: '',
        outcome: null,
        exitPrice: null,
        pl: null,
        rejectionReason: formData.get('rejectionReason'),
        unapprovedTime: new Date().toISOString(),
        answers: currentDecision?.answers || [],
        yesCount: currentDecision?.yesCount || 0,
        noCount: currentDecision?.noCount || 0
    };
    
    console.log('🚫 DEBUG: Rejected trade data prepared:', tradeData);
    console.log('🚫 DEBUG: Saving to unapproved trades journal...');
    
    // Save to journal
    addUnapprovedTradeToJournal(tradeData);
    
    // Show success message
    const messageEl = document.getElementById('rejectedTradeMessage');
    if (messageEl) {
        messageEl.textContent = '✅ Rejected trade saved successfully!';
        messageEl.className = 'form-message success';
    }
    
    // Reset form after 2 seconds
    setTimeout(() => {
        event.target.reset();
        if (messageEl) {
            messageEl.textContent = '';
            messageEl.className = 'form-message';
        }
        
        // Navigate back to journal
        console.log('🚫 DEBUG: Navigating back to journal after rejected trade save...');
        navigateTo('journal');
    }, 2000);
    
    console.log('🚫 DEBUG: Rejected trade saved successfully:', tradeData);
}

// Function to handle after picture upload
function handleAfterPictureUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            afterImageData = e.target.result;
            
            // Show preview
            const preview = document.getElementById('afterPicturePreview');
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" alt="After Trade Preview">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Function to handle approved trade image upload
function handleApprovedTradeImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            approvedTradeData = {
                ...approvedTradeData,
                beforePicture: e.target.result
            };
            
            // Show preview
            const preview = document.getElementById('approvedBeforePicturePreview');
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Before Trade Preview">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Function to handle rejected trade image upload
function handleRejectedTradeImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            rejectedTradeData = {
                ...rejectedTradeData,
                beforePicture: e.target.result
            };
            
            // Show preview
            const preview = document.getElementById('rejectedBeforePicturePreview');
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Before Trade Preview">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Function to cancel approved trade
function cancelApprovedTrade() {
    if (confirm('Are you sure you want to cancel? This approved trade will not be saved.')) {
        navigateTo('journal');
    }
}

// Function to cancel rejected trade
function cancelRejectedTrade() {
    if (confirm('Are you sure you want to cancel? This rejected trade will not be saved.')) {
        navigateTo('journal');
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

    // 2. Strategy rules (Option B): validate user-entered RR + session against saved rule
    try {
        const strategyName = String(strategyInput?.value || '').trim().toLowerCase();
        const savedRules = loadRules();
        const matchedRule = Array.isArray(savedRules)
            ? savedRules.find(r => String(r.strategyName || '').trim().toLowerCase() === strategyName)
            : null;

        if (matchedRule) {
            const minRRAnswer = answers.find(a => a.type === 'minRR');
            if (matchedRule.minRR && minRRAnswer) {
                const userRR = parseFloat(minRRAnswer.answer);
                if (!Number.isFinite(userRR) || userRR < matchedRule.minRR) {
                    console.log('❌ REJECTED: Min R:R too low:', userRR, '<', matchedRule.minRR);
                    return { valid: false, reason: `Min R:R too low (${userRR} < ${matchedRule.minRR})` };
                }
                console.log('✅ Min R:R: PASSED', userRR);
            }

            const sessionsAnswer = answers.find(a => a.type === 'sessions');
            if (Array.isArray(matchedRule.allowedSessions) && matchedRule.allowedSessions.length && sessionsAnswer) {
                const userSession = String(sessionsAnswer.answer || '').trim().toLowerCase();
                const allowed = matchedRule.allowedSessions.map(s => String(s).trim().toLowerCase());
                if (!userSession || !allowed.includes(userSession)) {
                    console.log('❌ REJECTED: Session not allowed:', userSession, 'allowed:', allowed);
                    return { valid: false, reason: `Trading session not allowed (${userSession || 'blank'})` };
                }
                console.log('✅ Sessions: PASSED', userSession);
            }
        }
    } catch (e) {
        console.error('Strategy rules evaluation failed:', e);
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
    // Example: If minConfluence = 4, you need at least 4 out of your total criteria to pass
    // Each criterion "passes" if you answered ≥70% on the slider
    const minConfluence = parseInt(settings.minConfluence) || 4; // Changed from 6 to 4 - more reasonable
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
        const pl = getTradePL(t);
        cum += pl;
        const d = getTradeDate(t);
        return { date: new Date(d || Date.now()), cumPL: Number(cum.toFixed(2)) };
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
// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.__appInitialized) return;
    window.__appInitialized = true;

    console.log('DOM loaded, initializing app...');
    loadAllSettings();
    loadStrategy();
    updateDashboard();
    
    // Initialize journal displays
    displayLiveTrades();
    displayCompletedTrades();
    displayUnapprovedTrades();
    
    // Add event listeners for journal functionality
    const afterPictureInput = document.getElementById('afterPicture');
    if (afterPictureInput) {
        afterPictureInput.addEventListener('change', handleAfterPictureUpload);
    }
    
    const completedFilter = document.getElementById('completedFilter');
    if (completedFilter) {
        completedFilter.addEventListener('change', handleCompletedFilterChange);
    }
    
    const unapprovedFilter = document.getElementById('unapprovedFilter');
    if (unapprovedFilter) {
        unapprovedFilter.addEventListener('change', handleUnapprovedFilterChange);
    }
    
    // Add event listeners for trade input forms
    const approvedTradeForm = document.getElementById('approvedTradeForm');
    if (approvedTradeForm) {
        approvedTradeForm.addEventListener('submit', handleApprovedTradeFormSubmit);
    }
    
    const rejectedTradeForm = document.getElementById('rejectedTradeForm');
    if (rejectedTradeForm) {
        rejectedTradeForm.addEventListener('submit', handleRejectedTradeFormSubmit);
    }
    
    // Add event listeners for image uploads
    const approvedBeforePicture = document.getElementById('approvedBeforePicture');
    if (approvedBeforePicture) {
        approvedBeforePicture.addEventListener('change', handleApprovedTradeImageUpload);
    }
    
    const rejectedBeforePicture = document.getElementById('rejectedBeforePicture');
    if (rejectedBeforePicture) {
        rejectedBeforePicture.addEventListener('change', handleRejectedTradeImageUpload);
    }
    
    const promptImageUpload = document.getElementById('promptImageUpload');
    if (promptImageUpload) {
        promptImageUpload.addEventListener('change', handlePromptImageUploadFIXED);
    }
});

// Function to handle completed filter change
function handleCompletedFilterChange() {
    displayCompletedTrades();
}

if (startTradeBtn) startTradeBtn.addEventListener('click', function() {
    // build trade idea from UI
    const tradeIdea = {
        id: 'idea-' + Date.now(),
        pair: (document.getElementById('idea_pair')||{}).value || '',
        direction: (document.getElementById('idea_direction')||{}).value || '',
        strategy: strategyInput.value || '',
        session: (document.getElementById('idea_session')||{}).value || '',
        time: (document.getElementById('idea_time')||{}).value || new Date().toISOString(),
        entry: parseFloat((document.getElementById('idea_entry')||{}).value),
        sl: parseFloat((document.getElementById('idea_sl')||{}).value),
        tp: parseFloat((document.getElementById('idea_tp')||{}).value),
        lotSize: parseFloat(positionSizeInput.value) || null,
        emotion: null,
        confidence: null
    };
    if (tradeIdea.session) localStorage.setItem('currentSession', tradeIdea.session);
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
    const all = getApprovedTradesAllStatuses();
    if (!all.length) return showToast('No trades to export', 2500);
    const headers = [
        'id',
        'status',
        'pair',
        'direction',
        'strategy',
        'entry',
        'stopLoss',
        'takeProfit',
        'exitPrice',
        'pl',
        'outcome',
        'lotSize',
        'confidence',
        'emotions',
        'notes',
        'entryTime',
        'completionTime',
        'approvalTime'
    ];
    const rows = all.map(t => headers.map(h => {
        let v = t?.[h];
        if (v === undefined || v === null) v = '';
        if (typeof v === 'object') v = JSON.stringify(v);
        return '"' + String(v).replace(/"/g, '""') + '"';
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
    const all = getApprovedTradesAllStatuses();
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
    try {
        const completed = getApprovedCompletedTrades();
        renderEquityChart(completed);
        attachChartTooltip();
        renderPhase4Dashboard();
    } catch(e){}
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
    let all = getApprovedCompletedTrades();
    if (currentFilters.dateStart) {
        const ds = new Date(currentFilters.dateStart);
        all = all.filter(t => new Date(getTradeDate(t) || 0) >= ds);
    }
    if (currentFilters.dateEnd) {
        const de = new Date(currentFilters.dateEnd);
        de.setHours(23, 59, 59);
        all = all.filter(t => new Date(getTradeDate(t) || 0) <= de);
    }
    if (currentFilters.strategy) all = all.filter(t => t.strategy === currentFilters.strategy);
    if (currentFilters.pair) all = all.filter(t => t.pair === currentFilters.pair);
    if (currentFilters.emotion) all = all.filter(t => (t.emotions || t.emotion) === currentFilters.emotion);
    if (currentFilters.outcome) {
        all = all.filter(t => {
            const pl = getTradePL(t);
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
    const all = getApprovedCompletedTrades();
    const strategies = [...new Set(all.map(t => t.strategy).filter(Boolean))];

    const stratSel = document.getElementById('analytics_strategy');
    if (stratSel) {
        // Preserve the "All" option and repopulate deterministically.
        const keepFirst = stratSel.querySelector('option[value=""]');
        stratSel.innerHTML = '';
        if (keepFirst) stratSel.appendChild(keepFirst);
        else {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'All Strategies';
            stratSel.appendChild(opt);
        }
        strategies.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            stratSel.appendChild(opt);
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
        equityCurve: [],
        drawdownHistory: [],
        alerts: []
    };

    let grossWin = 0, grossLoss = 0, rrSum = 0, rrCount = 0;
    let cumulativePL = 0;
    let peak = 0;

    trades.forEach((t, idx) => {
        const pl = getTradePL(t);
        cumulativePL += pl;
        metrics.totalPL += pl;

        if (pl > 0) metrics.wins++;
        else if (pl < 0) metrics.losses++;
        else metrics.breaks++;

        if (pl > 0) grossWin += pl;
        if (pl < 0) grossLoss += Math.abs(pl);

        // RR for this trade
        const entry = parseFloat(t.entry ?? 0);
        const stop = parseFloat(t.stop ?? t.stopLoss ?? 0);
        if (Number.isFinite(entry) && Number.isFinite(stop) && entry !== stop && pl !== 0) {
            const rr = Math.abs(pl / Math.abs(entry - stop));
            metrics.riskRewardByTrade.push(rr);
            rrSum += rr;
            rrCount++;
        }

        // Emotion tracking
        const emo = t.emotions || t.emotion || 'Unknown';
        if (!metrics.pnlByEmotion[emo]) metrics.pnlByEmotion[emo] = 0;
        metrics.pnlByEmotion[emo] += pl;

        // Equity / drawdown
        metrics.equityCurve.push(cumulativePL);
        peak = Math.max(peak, cumulativePL);
        metrics.drawdownHistory.push(cumulativePL - peak);
    });

    metrics.winRate = metrics.totalTrades ? Math.round((metrics.wins / metrics.totalTrades) * 100) : 0;
    metrics.profitFactor = grossLoss === 0 ? (grossWin || 0) : Number((grossWin / grossLoss).toFixed(2));
    metrics.avgRR = rrCount ? Number((rrSum / rrCount).toFixed(2)) : 0;

    return metrics;
}

function renderSimpleLineChart(canvasId, series, color, fillColor) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!Array.isArray(series) || series.length === 0) return;

        const padding = 20;
        const w = canvas.width - padding * 2;
        const h = canvas.height - padding * 2;
        const min = Math.min(...series);
        const max = Math.max(...series);
        const range = (max - min) || 1;
        const xs = series.map((_, i) => padding + (i / (series.length - 1 || 1)) * w);
        const ys = series.map(v => padding + h - ((v - min) / range) * h);

        // axes
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + h);
        ctx.lineTo(padding + w, padding + h);
        ctx.stroke();

        // line
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let i = 1; i < xs.length; i++) ctx.lineTo(xs[i], ys[i]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // fill
        if (fillColor) {
            ctx.lineTo(padding + w, padding + h);
            ctx.lineTo(padding, padding + h);
            ctx.closePath();
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        // points
        ctx.fillStyle = '#fff';
        for (let i = 0; i < xs.length; i++) {
            ctx.beginPath();
            ctx.arc(xs[i], ys[i], 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } catch (e) {
        console.warn('Line chart render error:', canvasId, e);
    }
}

function renderSimpleBarChart(canvasId, labels, values, colors) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!Array.isArray(values) || values.length === 0) return;

        const padding = 24;
        const w = canvas.width - padding * 2;
        const h = canvas.height - padding * 2;
        const maxVal = Math.max(...values, 1);
        const barW = w / values.length;

        // axes
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + h);
        ctx.lineTo(padding + w, padding + h);
        ctx.stroke();

        values.forEach((v, i) => {
            const x = padding + i * barW + barW * 0.15;
            const bw = barW * 0.7;
            const bh = (v / maxVal) * h;
            const y = padding + h - bh;
            ctx.fillStyle = colors?.[i] || '#94a3b8';
            ctx.fillRect(x, y, bw, bh);

            // label
            if (labels && labels[i]) {
                ctx.fillStyle = 'rgba(226,232,240,0.9)';
                ctx.font = '10px system-ui, -apple-system, Segoe UI, Roboto, Arial';
                ctx.textAlign = 'center';
                ctx.fillText(labels[i], x + bw / 2, padding + h + 14);
            }
        });
    } catch (e) {
        console.warn('Bar chart render error:', canvasId, e);
    }
}

function renderSimpleDonutChart(canvasId, labelToValue) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const labels = Object.keys(labelToValue || {});
        if (!labels.length) return;
        const raw = labels.map(l => Number(labelToValue[l]) || 0);
        // Use absolute contribution for sizing; sign will be indicated by color.
        const sizes = raw.map(v => Math.abs(v));
        const total = sizes.reduce((a, b) => a + b, 0) || 1;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const rOuter = Math.min(cx, cy) - 8;
        const rInner = rOuter * 0.6;

        let start = -Math.PI / 2;
        labels.forEach((label, idx) => {
            const value = raw[idx];
            const slice = (sizes[idx] / total) * Math.PI * 2;
            const end = start + slice;

            let color = '#94a3b8';
            const low = String(label).toLowerCase();
            if (value >= 0 && (low.includes('calm') || low.includes('patient') || low.includes('confident'))) color = '#22c55e';
            else if (value < 0 && (low.includes('angry') || low.includes('fomo') || low.includes('frustrated') || low.includes('greedy') || low.includes('anxious'))) color = '#ef4444';
            else if (value < 0) color = '#f97316';

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, rOuter, start, end);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            start = end;
        });

        // hole
        ctx.beginPath();
        ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
    } catch (e) {
        console.warn('Donut chart render error:', canvasId, e);
    }
}

function inferSessionFromDate(dateLike) {
    const d = dateLike ? new Date(dateLike) : new Date();
    const h = d.getHours();
    if (h >= 0 && h < 7) return 'Asia';
    if (h >= 7 && h < 16) return 'London';
    return 'New York';
}

function computeStreaks(trades) {
    let bestWinStreak = 0;
    let worstLossStreak = 0;
    let curWin = 0;
    let curLoss = 0;

    trades.forEach(t => {
        const pl = getTradePL(t);
        if (pl > 0) {
            curWin++;
            curLoss = 0;
        } else if (pl < 0) {
            curLoss++;
            curWin = 0;
        } else {
            // break-even ends both streaks
            curWin = 0;
            curLoss = 0;
        }
        bestWinStreak = Math.max(bestWinStreak, curWin);
        worstLossStreak = Math.max(worstLossStreak, curLoss);
    });

    return { bestWinStreak, worstLossStreak };
}

function computeMaxDrawdownFromEquity(equityCurve) {
    let peak = 0;
    let maxDD = 0;
    for (const v of equityCurve) {
        peak = Math.max(peak, v);
        maxDD = Math.min(maxDD, v - peak);
    }
    return maxDD; // negative or 0
}

function computeSQN(pls) {
    // SQN = (mean / stddev) * sqrt(n)
    const n = pls.length;
    if (n < 2) return 0;
    const mean = pls.reduce((a, b) => a + b, 0) / n;
    const variance = pls.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    if (!sd) return 0;
    return (mean / sd) * Math.sqrt(n);
}

function computeTiltRisk(trades) {
    // Compares performance of trades entered soon after a loss.
    // This is a psychology metric: "revenge/tilt" proxy.
    // Window: 60 minutes after a losing trade completion.
    if (!Array.isArray(trades) || trades.length < 3) return { label: '--', value: null };

    const sorted = trades
        .slice()
        .sort((a, b) => new Date(getTradeDate(a) || 0) - new Date(getTradeDate(b) || 0));

    const tilt = [];
    const normal = [];
    for (let i = 0; i < sorted.length; i++) {
        const t = sorted[i];
        const pl = getTradePL(t);
        const d = new Date(getTradeDate(t) || 0).getTime();
        // Find the most recent previous loss
        let lastLossTime = null;
        for (let j = i - 1; j >= 0; j--) {
            if (getTradePL(sorted[j]) < 0) {
                lastLossTime = new Date(getTradeDate(sorted[j]) || 0).getTime();
                break;
            }
        }
        if (lastLossTime && (d - lastLossTime) >= 0 && (d - lastLossTime) <= 60 * 60 * 1000) tilt.push(pl);
        else normal.push(pl);
    }

    const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const tiltAvg = avg(tilt);
    const normalAvg = avg(normal);

    if (!tilt.length) return { label: 'No post-loss trades detected', value: 0 };

    const diff = tiltAvg - normalAvg;
    let label = 'Neutral';
    if (diff < 0) label = 'High';
    if (diff > 0) label = 'Low';
    return { label: `${label} (post-loss avg ${tiltAvg.toFixed(2)} vs normal ${normalAvg.toFixed(2)})`, value: diff };
}

function computeAdvancedMetrics(trades, phase4Metrics) {
    const pls = trades.map(t => getTradePL(t));
    const wins = pls.filter(x => x > 0);
    const losses = pls.filter(x => x < 0);

    const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const avgWin = avg(wins);
    const avgLoss = avg(losses); // negative
    const expectancy = avg(pls);
    const payoff = avgLoss ? Math.abs(avgWin / avgLoss) : (avgWin ? Infinity : 0);

    const streaks = computeStreaks(trades);
    const equity = Array.isArray(phase4Metrics?.equityCurve) ? phase4Metrics.equityCurve : [];
    const maxDD = equity.length ? computeMaxDrawdownFromEquity(equity) : 0;
    const net = phase4Metrics?.totalPL ?? pls.reduce((a, b) => a + b, 0);
    const recovery = maxDD ? (net / Math.abs(maxDD)) : 0;
    const sqn = computeSQN(pls);
    const tilt = computeTiltRisk(trades);

    return {
        expectancy,
        payoff,
        avgWin,
        avgLoss,
        bestWinStreak: streaks.bestWinStreak,
        worstLossStreak: streaks.worstLossStreak,
        maxDrawdown: maxDD,
        recovery,
        sqn,
        tilt
    };
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
}

function bucketConfidence(value) {
    const v = Number(value);
    if (!Number.isFinite(v)) return 'Unknown';
    if (v <= 4) return 'Low (1-4)';
    if (v <= 7) return 'Mid (5-7)';
    return 'High (8-10)';
}

function computeTradeRR(trade) {
    const entry = Number(trade?.entry);
    const stop = Number(trade?.stopLoss ?? trade?.stop);
    const pl = getTradePL(trade);
    if (!Number.isFinite(entry) || !Number.isFinite(stop) || entry === stop || pl === 0) return null;
    return Math.abs(pl / Math.abs(entry - stop));
}

function bucketRR(rr) {
    if (!Number.isFinite(rr)) return 'Unknown';
    if (rr < 1.5) return 'RR < 1.5';
    if (rr < 2.5) return 'RR 1.5-2.5';
    return 'RR > 2.5';
}

function getConditionKey(trade, dimension) {
    const d = new Date(getTradeDate(trade) || Date.now());
    if (dimension === 'emotion') return String(trade.emotions || trade.emotion || 'Unknown');
    if (dimension === 'session') return inferSessionFromDate(getTradeDate(trade));
    if (dimension === 'weekday') return d.toLocaleDateString(undefined, { weekday: 'long' });
    if (dimension === 'hour') return String(d.getHours());
    if (dimension === 'confidence') return bucketConfidence(trade.confidence);
    if (dimension === 'rr') return bucketRR(computeTradeRR(trade));
    if (dimension === 'pair') return String(trade.pair || 'Unknown');
    if (dimension === 'direction') return String(trade.direction || 'Unknown');
    return 'Unknown';
}

function getConditionDimensionLabel(dimension) {
    if (dimension === 'emotion') return 'Emotion';
    if (dimension === 'session') return 'Session';
    if (dimension === 'weekday') return 'Weekday';
    if (dimension === 'hour') return 'Hour';
    if (dimension === 'confidence') return 'Confidence';
    if (dimension === 'rr') return 'R:R';
    if (dimension === 'pair') return 'Pair';
    if (dimension === 'direction') return 'Direction';
    return 'Condition';
}

function getSelectedConditionDimensions() {
    const sel = document.getElementById('condition_dimension');
    if (!sel) return ['emotion'];

    if (sel.multiple) {
        const dims = Array.from(sel.selectedOptions || []).map(o => o.value).filter(Boolean);
        return dims.length ? dims : ['emotion'];
    }

    return [sel.value || 'emotion'];
}

let conditionRules = [];

function getConditionOperatorsForField(field) {
    if (field === 'emotion' || field === 'session' || field === 'weekday' || field === 'confidence' || field === 'rr' || field === 'pair' || field === 'direction') {
        return [
            { value: 'eq', label: '=' },
            { value: 'neq', label: '!=' },
            { value: 'contains', label: 'contains' },
            { value: 'ncontains', label: 'not contains' }
        ];
    }
    if (field === 'hour') {
        return [
            { value: 'eq', label: '=' },
            { value: 'neq', label: '!=' },
            { value: 'gt', label: '>' },
            { value: 'gte', label: '>=' },
            { value: 'lt', label: '<' },
            { value: 'lte', label: '<=' }
        ];
    }
    return [
        { value: 'eq', label: '=' },
        { value: 'neq', label: '!=' }
    ];
}

function getConditionFieldOptions() {
    return [
        { value: 'emotion', label: 'Emotion' },
        { value: 'session', label: 'Session' },
        { value: 'weekday', label: 'Day of Week' },
        { value: 'hour', label: 'Hour (0-23)' },
        { value: 'confidence', label: 'Confidence Bucket' },
        { value: 'rr', label: 'R:R Bucket' },
        { value: 'pair', label: 'Pair' },
        { value: 'direction', label: 'Direction' }
    ];
}

function normalizeForCompare(value) {
    return String(value ?? '').trim().toLowerCase();
}

function evaluateConditionRule(trade, rule) {
    const field = rule?.field;
    const op = rule?.op;
    const raw = rule?.value;
    if (!field || !op) return true;

    const tradeValue = getConditionKey(trade, field);

    if (field === 'hour') {
        const left = Number(new Date(getTradeDate(trade) || Date.now()).getHours());
        const right = Number(raw);
        if (!Number.isFinite(right)) return false;
        if (op === 'eq') return left === right;
        if (op === 'neq') return left !== right;
        if (op === 'gt') return left > right;
        if (op === 'gte') return left >= right;
        if (op === 'lt') return left < right;
        if (op === 'lte') return left <= right;
        return true;
    }

    const left = normalizeForCompare(tradeValue);
    const right = normalizeForCompare(raw);

    if (op === 'eq') return left === right;
    if (op === 'neq') return left !== right;
    if (op === 'contains') return right ? left.includes(right) : true;
    if (op === 'ncontains') return right ? !left.includes(right) : true;
    return true;
}

function applyConditionRules(trades, rules) {
    const active = Array.isArray(rules) ? rules.filter(r => r && r.field && r.op) : [];
    if (!active.length) return trades;
    return trades.filter(t => active.every(r => evaluateConditionRule(t, r)));
}

function getRuleLabel(rule) {
    const fieldOpt = getConditionFieldOptions().find(o => o.value === rule?.field);
    const fieldLabel = fieldOpt ? fieldOpt.label : (rule?.field || 'Field');
    const opLabel = (getConditionOperatorsForField(rule?.field).find(o => o.value === rule?.op)?.label) || (rule?.op || '=');
    const val = (rule?.value ?? '').toString().trim();
    return `${fieldLabel} ${opLabel} ${val || '…'}`;
}

function getSuggestedValuesForField(field, trades) {
    if (field === 'session') return ['Asia', 'London', 'New York'];
    if (field === 'weekday') return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (field === 'confidence') return ['Low (1-4)', 'Mid (5-7)', 'High (8-10)', 'Unknown'];
    if (field === 'rr') return ['RR < 1.5', 'RR 1.5-2.5', 'RR > 2.5', 'Unknown'];
    if (field === 'direction') return ['Buy', 'Sell', 'Long', 'Short'];
    if (field === 'hour') return Array.from({ length: 24 }, (_, i) => String(i));

    const uniq = new Set();
    (Array.isArray(trades) ? trades : []).forEach(t => {
        const key = normalizeForCompare(getConditionKey(t, field));
        if (!key || key === 'unknown') return;
        uniq.add(key);
    });

    const list = Array.from(uniq);
    list.sort((a, b) => a.localeCompare(b));
    return list;
}

function renderConditionRulesUI(baseTrades) {
    const wrap = document.getElementById('conditionRules');
    if (!wrap) return;
    wrap.innerHTML = '';

    if (!Array.isArray(conditionRules) || conditionRules.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No rules set (showing all trades).';
        wrap.appendChild(empty);
        return;
    }

    const fieldOptions = getConditionFieldOptions();

    conditionRules.forEach((rule, idx) => {
        const row = document.createElement('div');
        row.className = 'condition-rule';

        const fieldSel = document.createElement('select');
        fieldSel.className = 'toolbar-input rule-field';
        fieldOptions.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            if (opt.value === (rule?.field || 'emotion')) o.selected = true;
            fieldSel.appendChild(o);
        });

        const opSel = document.createElement('select');
        opSel.className = 'toolbar-input rule-operator';
        const ops = getConditionOperatorsForField(rule?.field || 'emotion');
        ops.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            if (opt.value === (rule?.op || 'eq')) o.selected = true;
            opSel.appendChild(o);
        });

        const valueInput = document.createElement('input');
        valueInput.className = 'toolbar-input rule-value';
        valueInput.type = 'text';
        valueInput.placeholder = 'Value…';
        valueInput.value = rule?.value ?? '';

        const datalistId = `condition_rule_suggestions_${idx}`;
        valueInput.setAttribute('list', datalistId);

        const dataList = document.createElement('datalist');
        dataList.id = datalistId;
        const suggestions = getSuggestedValuesForField(rule?.field || 'emotion', baseTrades);
        suggestions.slice(0, 60).forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            dataList.appendChild(opt);
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-secondary btn-small';
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';

        const syncRule = () => {
            const nextField = fieldSel.value;
            const nextOps = getConditionOperatorsForField(nextField);
            const currentOp = opSel.value;

            // If operator is not valid for the new field, reset.
            if (!nextOps.some(o => o.value === currentOp)) {
                opSel.innerHTML = '';
                nextOps.forEach(opt => {
                    const o = document.createElement('option');
                    o.value = opt.value;
                    o.textContent = opt.label;
                    opSel.appendChild(o);
                });
            }

            conditionRules[idx] = {
                field: fieldSel.value,
                op: opSel.value,
                value: valueInput.value
            };
        };

        fieldSel.addEventListener('change', () => {
            // rebuild operators
            const nextOps = getConditionOperatorsForField(fieldSel.value);
            opSel.innerHTML = '';
            nextOps.forEach(opt => {
                const o = document.createElement('option');
                o.value = opt.value;
                o.textContent = opt.label;
                opSel.appendChild(o);
            });

            // refresh suggestions
            dataList.innerHTML = '';
            getSuggestedValuesForField(fieldSel.value, baseTrades).slice(0, 60).forEach(v => {
                const opt = document.createElement('option');
                opt.value = v;
                dataList.appendChild(opt);
            });

            syncRule();
            refreshConditionExplorer();
        });

        opSel.addEventListener('change', () => {
            syncRule();
            refreshConditionExplorer();
        });

        valueInput.addEventListener('input', () => {
            syncRule();
        });
        valueInput.addEventListener('change', () => {
            syncRule();
            refreshConditionExplorer();
        });

        removeBtn.addEventListener('click', () => {
            conditionRules.splice(idx, 1);
            renderConditionRulesUI(getFilteredTrades());
            refreshConditionExplorer();
        });

        row.appendChild(fieldSel);
        row.appendChild(opSel);
        row.appendChild(valueInput);
        row.appendChild(dataList);
        row.appendChild(removeBtn);
        wrap.appendChild(row);
    });
}

function renderConditionSummary(allTrades, filteredTrades) {
    const el = document.getElementById('conditionSummary');
    if (!el) return;

    const allCount = Array.isArray(allTrades) ? allTrades.length : 0;
    const filtCount = Array.isArray(filteredTrades) ? filteredTrades.length : 0;

    const activeRules = Array.isArray(conditionRules) ? conditionRules.filter(r => r && r.field && r.op && String(r.value ?? '').trim().length) : [];
    if (!activeRules.length) {
        el.textContent = `Showing all ${allCount} trades (no rules).`;
        return;
    }

    const label = activeRules.map(getRuleLabel).join(' AND ');
    el.textContent = `Rules: ${label} — Matching ${filtCount} / ${allCount} trades.`;
}

function addConditionRule() {
    if (!Array.isArray(conditionRules)) conditionRules = [];
    conditionRules.push({ field: 'emotion', op: 'eq', value: '' });
    renderConditionRulesUI(getFilteredTrades());
}

function clearConditionRules() {
    conditionRules = [];
    renderConditionRulesUI(getFilteredTrades());
    refreshConditionExplorer();
}

function computeGroupStats(trades) {
    const pls = trades.map(t => getTradePL(t));
    const total = pls.reduce((a, b) => a + b, 0);
    const wins = pls.filter(x => x > 0);
    const losses = pls.filter(x => x < 0);
    const winRate = trades.length ? Math.round((wins.length / trades.length) * 100) : 0;
    const grossWin = wins.reduce((a, b) => a + b, 0);
    const grossLoss = losses.reduce((a, b) => a + Math.abs(b), 0);
    const pf = grossLoss === 0 ? (grossWin || 0) : Number((grossWin / grossLoss).toFixed(2));

    // avg RR for this group
    let rrSum = 0;
    let rrCount = 0;
    trades.forEach(t => {
        const rr = computeTradeRR(t);
        if (Number.isFinite(rr)) {
            rrSum += rr;
            rrCount++;
        }
    });
    const avgRR = rrCount ? Number((rrSum / rrCount).toFixed(2)) : 0;

    return {
        trades: trades.length,
        winRate,
        totalPL: Number(total.toFixed(2)),
        avgPL: Number((trades.length ? total / trades.length : 0).toFixed(2)),
        profitFactor: pf,
        avgRR
    };
}

function renderConditionExplorerTable(trades) {
    const dims = getSelectedConditionDimensions();
    const groups = new Map();
    trades.forEach(t => {
        const key = dims
            .map(d => `${getConditionDimensionLabel(d)}: ${getConditionKey(t, d)}`)
            .join(' | ');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(t);
    });

    const rows = [];
    for (const [key, list] of groups.entries()) {
        const stats = computeGroupStats(list);
        rows.push({ key, ...stats });
    }

    rows.sort((a, b) => b.totalPL - a.totalPL);

    const tbody = document.getElementById('conditionTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!rows.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" class="empty-state">No trades match the selected filters</td>';
        tbody.appendChild(tr);
        return;
    }

    rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.key}</td>
            <td>${r.trades}</td>
            <td>${r.winRate}%</td>
            <td>${r.totalPL.toFixed(2)}</td>
            <td>${r.avgPL.toFixed(2)}</td>
            <td>${r.profitFactor}</td>
            <td>${r.avgRR}</td>
        `;
        tbody.appendChild(tr);
    });
}

function refreshConditionExplorer() {
    try {
        const base = getFilteredTrades();
        renderConditionRulesUI(base);
        const afterRules = applyConditionRules(base, conditionRules);
        renderConditionSummary(base, afterRules);
        renderConditionExplorerTable(afterRules);
    } catch (e) {
        console.error('Failed to refresh condition explorer:', e);
    }
}

function renderSessionChart(trades) {
    const buckets = { Asia: 0, London: 0, 'New York': 0 };
    trades.forEach(t => {
        const key = inferSessionFromDate(getTradeDate(t));
        buckets[key] += getTradePL(t);
    });
    const labels = Object.keys(buckets);
    const values = labels.map(l => Number(buckets[l].toFixed(2)));
    const colors = values.map(v => (v >= 0 ? '#22c55e' : '#ef4444'));
    renderSimpleBarChart('sessionChart', labels, values.map(v => Math.abs(v)), colors);
}

// Generate alerts
function generateAlerts(metrics, trades) {
    const alerts = [];
    if (metrics.totalTrades === 0) return alerts;

    // Overtrading
    const today = new Date().toDateString();
    const todayTrades = trades.filter(t => new Date(getTradeDate(t) || 0).toDateString() === today);
    if (todayTrades.length > 5) alerts.push(`⚠ Overtrading: ${todayTrades.length} trades today`);

    // Consecutive losses
    let consecLosses = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
        const pl = getTradePL(trades[i]);
        if (pl < 0) consecLosses++;
        else break;
    }
    if (consecLosses >= 3) alerts.push(`⚠ Consecutive losses: ${consecLosses} in a row`);

    // Emotional trades
    const emotionalTrades = trades.filter(t => {
        const emo = String(t.emotions || t.emotion || '').toLowerCase();
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
    if (!metrics.riskRewardByTrade.length) return;
    const bins = { low: 0, mid: 0, high: 0 };
    metrics.riskRewardByTrade.forEach(rr => {
        if (rr < 1.5) bins.low++;
        else if (rr < 2.5) bins.mid++;
        else bins.high++;
    });
    renderSimpleBarChart(
        'rrChart',
        ['<1.5', '1.5-2.5', '>2.5'],
        [bins.low, bins.mid, bins.high],
        ['#ef4444', '#eab308', '#22c55e']
    );
}

// Chart: Emotion P&L
function renderEmotionChart(metrics) {
    if (!Object.keys(metrics.pnlByEmotion).length) return;
    renderSimpleDonutChart('emotionChart', metrics.pnlByEmotion);
}

// Chart: Drawdown
function renderDrawdownChart(metrics) {
    if (!metrics.drawdownHistory.length) return;
    renderSimpleLineChart('drawdownChart', metrics.drawdownHistory, '#ef4444', 'rgba(239,68,68,0.12)');
}

// Render Phase 4 dashboard
function renderPhase4Dashboard() {
    populateFilterDropdowns();
    const filtered = getFilteredTrades();
    const metrics = computePhase4Analytics(filtered);

    // Update summary cards (with guards)
    const el1 = document.getElementById('metric_totalTrades') || document.getElementById('totalTrades');
    if (el1) el1.textContent = metrics.totalTrades;
    const elWins = document.getElementById('metric_wins');
    if (elWins) elWins.textContent = metrics.wins;
    const el2 = document.getElementById('metric_winRate') || document.getElementById('winRate');
    if (el2) el2.textContent = metrics.winRate + '%';
    const el3 = document.getElementById('metric_totalPL') || document.getElementById('totalPL');
    if (el3) el3.textContent = metrics.totalPL.toFixed(2);
    const el4 = document.getElementById('metric_profitFactor') || document.getElementById('profitFactor');
    if (el4) el4.textContent = metrics.profitFactor;
    const el5 = document.getElementById('metric_avgRR') || document.getElementById('avgRR');
    if (el5) el5.textContent = metrics.avgRR;

    // Render charts
    renderRRChart(metrics);
    renderEmotionChart(metrics);
    renderDrawdownChart(metrics);
    renderSessionChart(filtered);

    // Advanced metrics
    const adv = computeAdvancedMetrics(filtered, metrics);
    setText('adv_expectancy', adv.expectancy.toFixed(2));
    setText('adv_payoff', (adv.payoff === Infinity ? '∞' : adv.payoff.toFixed(2)));
    setText('adv_avgWin', adv.avgWin.toFixed(2));
    setText('adv_avgLoss', adv.avgLoss.toFixed(2));
    setText('adv_bestWinStreak', String(adv.bestWinStreak));
    setText('adv_worstLossStreak', String(adv.worstLossStreak));
    setText('adv_maxDrawdown', adv.maxDrawdown.toFixed(2));
    setText('adv_recovery', adv.recovery.toFixed(2));
    setText('adv_sqn', adv.sqn.toFixed(2));
    setText('adv_tiltRisk', adv.tilt.label);

    // Condition explorer
    refreshConditionExplorer();

    // Display alerts
    const alerts = generateAlerts(metrics, filtered);
    const insightsList = document.getElementById('analyticsInsights');
    if (insightsList) {
        insightsList.innerHTML = '';
        alerts.forEach(a => {
            const div = document.createElement('div');
            div.textContent = a;
            insightsList.appendChild(div);
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
        const entry = parseFloat(t.entry ?? 0);
        const pl = getTradePL(t);
        const stop = parseFloat(t.stop ?? t.stopLoss ?? 0);
        const rr = (entry && stop && pl !== 0) ? Math.abs(pl / Math.abs(entry - stop)).toFixed(2) : 'N/A';
        const outcome = pl > 0 ? 'Win' : pl < 0 ? 'Loss' : 'BE';
        const outcomeClass = pl > 0 ? 'outcome-win' : pl < 0 ? 'outcome-loss' : 'outcome-be';
        const emo = t.emotions || t.emotion || '-';
        const emoClass = 'emotion-' + (emo||'').toLowerCase().replace(/\s+/g, '-').split('-')[0];
        const date = new Date(getTradeDate(t) || Date.now()).toLocaleDateString();
        
        // Find actual index in allTrades
        const tradeIdx = allTrades.findIndex(tr => tr.id && tr.id === t.id);

        const row = document.createElement('tr');
        row.className = emoClass || '';
        row.innerHTML = `
            <td>${date}</td>
            <td>${t.pair}</td>
            <td>${t.direction || '-'}</td>
            <td>${t.entry}</td>
            <td>${t.stop || t.stopLoss || '-'}</td>
            <td>${t.tp ?? t.takeProfit ?? '-'}</td>
            <td>${rr}</td>
            <td class="${outcomeClass}">${outcome}</td>
            <td>${Number(pl).toFixed(2)}</td>
            <td>${emo}</td>
            <td>${t.confidence || '-'}</td>
            <td>${tradeIdx >= 0 ? `<button class=\"btn-action\" onclick=\"openTradeDetailsModal('${t.id}')\">View</button>` : ''}</td>
        `;
        tableBody.appendChild(row);
    });
}

