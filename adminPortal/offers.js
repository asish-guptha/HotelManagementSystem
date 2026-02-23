const couponUrl = "http://localhost:3000/coupons";
const offerUrl = "http://localhost:3000/roomOffers";

// ==========================================
// 1. COUPON LOGIC (TAB 1)
// ==========================================

const loadCoupons = async () => {
    try {
        const res = await fetch(couponUrl);
        const coupons = await res.json();
        const list = document.getElementById("couponsList");
        
        list.innerHTML = coupons.map(c => {
            const today = new Date().toISOString().split('T')[0];
            const isExpired = c.endDate < today;
            const notStarted = c.startDate > today;
            
            let statusBadge = '';
            if (!c.isActive) statusBadge = '<span class="badge bg-secondary">Disabled</span>';
            else if (isExpired) statusBadge = '<span class="badge bg-danger">Expired</span>';
            else if (notStarted) statusBadge = '<span class="badge bg-warning text-dark">Upcoming</span>';
            else statusBadge = '<span class="badge bg-success">Active</span>';

            return `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h4 class="fw-bold text-primary mb-0">${c.code}</h4>
                                    <small class="text-muted d-block mt-1">${c.startDate} to ${c.endDate}</small>
                                </div>
                                <h3 class="fw-bold text-success">-${c.discount}%</h3>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                ${statusBadge}
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" 
                                        ${c.isActive ? 'checked' : ''} 
                                        onchange="toggleCoupon('${c.id}', ${c.isActive})">
                                    <label class="form-check-label small text-muted">Active</label>
                                </div>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('${couponUrl}', '${c.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) { console.error(error); }
};

window.toggleCoupon = async (id, currentStatus) => {
    await fetch(`${couponUrl}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
    });
    loadCoupons();
};

document.getElementById("couponForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newCoupon = {
        id: crypto.randomUUID().slice(0, 4),
        code: document.getElementById("couponCode").value.toUpperCase(),
        discount: document.getElementById("couponDiscount").value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        isActive: true
    };
    await fetch(couponUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon)
    });
    e.target.reset();
    loadCoupons();
});


// ==========================================
// 2. ROOM OFFER LOGIC (TAB 2)
// ==========================================

const loadOffers = async () => {
    try {
        const res = await fetch(offerUrl);
        const offers = await res.json();
        const list = document.getElementById("offersList");

        // 1. RENDER LIST
        list.innerHTML = offers.map(o => `
            <div class="col-md-6 mb-3">
                <div class="card border-0 shadow-sm border-start border-success border-5">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="fw-bold mb-1">${o.title}</h5>
                            <p class="mb-0 text-muted">Applies to: <strong class="text-dark">${o.roomType}</strong></p>
                        </div>
                        <div class="text-end">
                            <h2 class="fw-bold text-danger mb-0">-${o.discount}%</h2>
                            <button class="btn btn-sm btn-link text-danger text-decoration-none" 
                                onclick="deleteItem('${offerUrl}', '${o.id}')">Remove Deal</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");

        // 2. UPDATE DROPDOWN (Disable taken rooms)
        updateDropdownState(offers);

    } catch (error) { console.error(error); }
};

// --- NEW HELPER: Disable dropdown options ---
function updateDropdownState(activeOffers) {
    const dropdown = document.getElementById("offerRoomType");
    const options = dropdown.options;
    
    // Get list of room types that currently have deals
    const takenTypes = activeOffers.map(o => o.roomType);

    for (let i = 0; i < options.length; i++) {
        const type = options[i].value;

        if (takenTypes.includes(type)) {
            // Disable it
            options[i].disabled = true;
            options[i].innerText = `${type} (Active Deal Exists)`;
        } else {
            // Enable it (in case we just deleted a deal)
            options[i].disabled = false;
            options[i].innerText = type;
        }
    }
    
    // Reset selection to the first available option if current is disabled
    if (options[dropdown.selectedIndex].disabled) {
        dropdown.value = ""; // Clear selection or pick first valid
    }
}

document.getElementById("offerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const newOffer = {
        id: crypto.randomUUID().slice(0, 4),
        roomType: document.getElementById("offerRoomType").value,
        discount: document.getElementById("offerPercent").value,
        title: document.getElementById("offerTitle").value
    };

    if (!newOffer.roomType) {
        alert("Please select a valid room type.");
        return;
    }

    await fetch(offerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOffer)
    });
    e.target.reset();
    loadOffers();
});

// ==========================================
// 3. SHARED UTILS
// ==========================================
window.deleteItem = async (url, id) => {
    if(confirm("Delete this item?")) {
        await fetch(`${url}/${id}`, { method: "DELETE" });
        loadCoupons();
        loadOffers();
    }
};

// Init
loadCoupons();
loadOffers();