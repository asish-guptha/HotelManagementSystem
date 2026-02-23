// ==========================================
// 1. SECURITY & INIT
// ==========================================
const userEmail = localStorage.getItem("email");
if (!userEmail || !userEmail.includes("admin")) {
    alert("Access Denied");
    window.location.href = "../homePage/homePage.html";
}

let globalRooms = [];
let globalBookings = [];

// ==========================================
// 2. MAIN LOAD FUNCTION
// ==========================================
const loadDashboard = async () => {
    try {
        const [roomsRes, bookingsRes] = await Promise.all([
            fetch("http://localhost:3000/hotelsRooms"),
            fetch("http://localhost:3000/bookings")
        ]);

        globalRooms = await roomsRes.json();
        globalBookings = await bookingsRes.json();

        // --- STICKY DATE LOGIC START ---
        const dateInput = document.getElementById("dashboardDate");
        const savedDate = localStorage.getItem("adminViewDate"); // 1. Check Memory

        if (savedDate) {
            dateInput.value = savedDate; // Use Memory
        } else if (!dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0]; // Default to Today
        }
        // --- STICKY DATE LOGIC END ---

        // Initialize Stats & Table
        updateStatsForDate(dateInput.value);

    } catch (error) {
        console.error("Error loading dashboard:", error);
    }
};

// ==========================================
// 3. DATE STATS & TABLE LOGIC
// ==========================================
function updateStatsForDate(selectedDate) {
    const dateObj = new Date(selectedDate);
    const niceDate = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
    
    document.getElementById("currentDateDisplay").innerText = niceDate;
    const tableDateDisplay = document.getElementById("tableDateDisplay");
    if(tableDateDisplay) tableDateDisplay.innerText = niceDate;

    // Filter Bookings active on this date
    const dailyBookings = globalBookings.filter(b => {
        const isDateMatch = (selectedDate >= b.checkIn && selectedDate < b.checkOut);
        // Only show Valid bookings or Cancelled ones relevant to this date
        return isDateMatch && (b.status !== 'Completed' || b.checkOut === selectedDate);
    });

    // Stats
    const occupiedCount = dailyBookings.filter(b => b.status === 'Confirmed' || b.status === 'Active').length;
    const totalRooms = globalRooms.length;
    
    document.getElementById("totalRooms").innerText = totalRooms;
    document.getElementById("activeBookings").innerText = occupiedCount;
    document.getElementById("availableRooms").innerText = totalRooms - occupiedCount;

    // Badges
    const occupiedRoomNos = dailyBookings
        .filter(b => b.status === 'Confirmed' || b.status === 'Active')
        .map(b => b.roomNo);
    const freeRooms = globalRooms.filter(r => !occupiedRoomNos.includes(r.roomNo));
    
    const freeListElement = document.getElementById("freeRoomList");
    if (freeRooms.length > 0) {
        freeListElement.innerHTML = freeRooms.map(r => 
            `<span class="badge bg-success-subtle text-success border border-success-subtle" style="font-weight: 500;">
                Room ${r.roomNo}
             </span>`
        ).join("");
    } else {
        freeListElement.innerHTML = `<span class="badge bg-secondary-subtle text-muted">Full</span>`;
    }

    // Revenue
    const revenue = globalBookings.reduce((sum, b) => {
        if (b.status === 'Active' || b.status === 'Completed') {
            const price = Number(String(b.roomPrice).replace(/[^0-9.]/g, ''));
            return sum + price;
        }
        return sum;
    }, 0);
    document.getElementById("totalRevenue").innerText = "$" + revenue.toLocaleString();

    // Render Table
    renderTable(dailyBookings);
}

// ==========================================
// 4. TABLE RENDER (With Billing Button)
// ==========================================
function renderTable(bookings) {
    const tableBody = document.getElementById("recentBookingsTable");
    
    if (bookings.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No bookings for this date.</td></tr>`;
        return;
    }

    bookings.sort((a, b) => (a.status === 'Active' ? -1 : 1));

    tableBody.innerHTML = bookings.map(b => {
        const start = new Date(b.checkIn);
        const end = new Date(b.checkOut);
        const duration = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)); 

        let badgeClass = 'bg-secondary';
        let status = b.status || 'Confirmed';
        
        if (status === 'Confirmed') badgeClass = 'bg-primary';
        if (status === 'Active') badgeClass = 'bg-success';
        if (status === 'Cancelled') badgeClass = 'bg-danger';
        if (status === 'Completed') badgeClass = 'bg-dark';

        let actionBtn = "";
        
        if (status === 'Confirmed' || status === 'Reserved') {
            actionBtn = `
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn btn-sm btn-success fw-bold d-flex align-items-center" 
                        onclick="updateStatus('${b.id}', 'Active', '${b.roomNo}')">
                        <i class="bi bi-check-circle me-1"></i> Check In
                    </button>
                    <button class="btn btn-sm btn-outline-danger d-flex align-items-center" 
                        onclick="updateStatus('${b.id}', 'Cancelled', '${b.roomNo}')">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>`;
        } 
        else if (status === 'Active') {
            actionBtn = `
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-dark" 
                        onclick="openServiceModal('${b.id}', '${b.roomNo}')" 
                        title="Add Service Charge">
                        <i class="bi bi-plus-lg"></i> Bill
                    </button>
                    <button class="btn btn-sm btn-warning text-dark fw-bold w-100" 
                        onclick="checkOutGuest('${b.id}', '${b.roomNo}')">
                        <i class="bi bi-box-arrow-right me-1"></i> Out
                    </button>
                </div>`;
        } 
        else if (status === 'Completed') {
            actionBtn = `<div class="text-end"><span class="badge bg-light text-muted border">History</span></div>`;
        }
        else {
            actionBtn = `<div class="text-end"><span class="badge bg-light text-muted border">Cancelled</span></div>`;
        }

        const rType = b.roomType || "Standard"; 

        return `
            <tr>
                <td><small class="text-muted">#${b.id}</small></td>
                <td>
                    <div class="fw-bold">${b.name || "Guest"}</div>
                    <small class="text-muted" style="font-size: 0.75rem;">${b.checkIn} to ${b.checkOut}</small>
                </td>
                <td>
                    <span class="badge bg-light text-dark border">Room ${b.roomNo}</span>
                    <div class="small text-muted text-capitalize">${rType}</div>
                </td>
                <td>${duration} Nights</td>
                <td><span class="badge ${badgeClass}">${status}</span></td>
                <td class="text-end">${actionBtn}</td>
            </tr>
        `;
    }).join("");
}

// ==========================================
// 5. EVENTS & LOGIC
// ==========================================

// Date Change Listener (SAVES TO MEMORY)
document.getElementById("dashboardDate").addEventListener("change", (e) => {
    localStorage.setItem("adminViewDate", e.target.value); // <--- SAVES DATE
    updateStatsForDate(e.target.value);
});

window.resetToToday = () => {
    localStorage.removeItem("adminViewDate"); // <--- CLEARS MEMORY
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("dashboardDate").value = today;
    updateStatsForDate(today);
};

window.updateStatus = async (bookingId, newStatus, roomNo) => {
    if(!confirm(`Mark as ${newStatus}?`)) return;
    await fetch(`http://localhost:3000/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
    });
    loadDashboard();
};

window.checkOutGuest = async (bookingId, roomNo) => {
    if(!confirm(`Check Out Room ${roomNo}?`)) return;
    await fetch(`http://localhost:3000/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" })
    });
    loadDashboard();
};

// --- SERVICE MODAL LOGIC (Kept from previous step) ---
window.checkCustomService = (select) => {
    const customDiv = document.getElementById("customServiceDiv");
    if(select.value === "Custom") customDiv.classList.remove("d-none");
    else customDiv.classList.add("d-none");
};

window.openServiceModal = (bookingId, roomNo) => {
    document.getElementById("serviceBookingId").value = bookingId;
    document.getElementById("serviceRoomNo").value = roomNo;
    document.getElementById("serviceRoomDisplay").value = `Room ${roomNo}`;
    document.getElementById("serviceForm").reset();
    document.getElementById("customServiceDiv").classList.add("d-none");
    new bootstrap.Modal(document.getElementById('serviceModal')).show();
};

document.getElementById("serviceForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const bookingId = document.getElementById("serviceBookingId").value;
    const itemSelect = document.getElementById("serviceItemSelect").value;
    let itemName = itemSelect;
    let itemCost = 0;
    const prices = { "Breakfast": 15, "Lunch": 25, "Dinner": 30, "Extra Bed": 50, "Laundry": 10 };

    if (itemSelect === "Custom") {
        itemName = document.getElementById("customItemName").value;
        itemCost = Number(document.getElementById("customItemCost").value);
    } else {
        itemCost = prices[itemSelect];
    }

    if (!itemName || itemCost <= 0) { alert("Invalid amount"); return; }

    try {
        const res = await fetch(`http://localhost:3000/bookings/${bookingId}`);
        const booking = await res.json();
        const currentCharges = booking.charges || [];
        const newCharge = { item: itemName, cost: itemCost, date: new Date().toISOString().split('T')[0] };
        
        await fetch(`http://localhost:3000/bookings/${bookingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ charges: [...currentCharges, newCharge] })
        });

        bootstrap.Modal.getInstance(document.getElementById('serviceModal')).hide();
        loadDashboard(); 
    } catch (error) { console.error(error); }
});

// --- OFFLINE BOOKING LOGIC (Kept from previous step) ---
// (Ensure you keep the Smart Offline Logic block here from our previous conversations!)
// The easiest way is to NOT delete the bottom part of your existing file if it already works.
// Or copy-paste the "SMART OFFLINE LOGIC" block I gave you 2 messages ago.

document.getElementById("adminLogout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../autentication forms/login.html";
});

loadDashboard();