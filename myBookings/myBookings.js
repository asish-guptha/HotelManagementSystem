// ==========================================
// 1. SECURITY & INIT
// ==========================================
const userId = localStorage.getItem("id");

if (!userId) {
    alert("Please Login First");
    window.location.href = "../autentication forms/login.html";
}

// ==========================================
// 2. FETCH & DISPLAY BOOKINGS
// ==========================================
const loadMyBookings = async () => {
    try {
        const container = document.getElementById("bookingsContainer");
        if (!container) {
            console.error("ERROR: Could not find element with id 'bookingsContainer'");
            return;
        }

        const res = await fetch("http://localhost:3000/bookings");
        const allBookings = await res.json();

        // Filter for THIS logged-in user
        // We match strict String comparison just to be safe
        const myBookings = allBookings.filter(b => String(b.userId) === String(userId));

        if (myBookings.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <div class="mb-3"><i class="bi bi-calendar-x text-muted" style="font-size: 3rem;"></i></div>
                    <h3 class="text-muted">No bookings found.</h3>
                    <p>You haven't booked any rooms yet.</p>
                    <a href="../homePage/homePage.html" class="btn btn-primary mt-3">Book Your First Stay</a>
                </div>`;
            return;
        }

        // Render Cards
        container.innerHTML = myBookings.reverse().map(b => {
            // --- A. CALCULATE BILLING ---
            const rawPrice = String(b.roomPrice).replace(/[^0-9.]/g, '');
            const basePrice = Number(rawPrice) || 0;

            const charges = b.charges || []; 
            const extraTotal = charges.reduce((sum, item) => sum + Number(item.cost), 0);
            const grandTotal = basePrice + extraTotal;

            // --- B. EXTRAS LIST ---
            let extrasHTML = "";
            if (charges.length > 0) {
                const listItems = charges.map(item => `
                    <li class="d-flex justify-content-between small text-muted">
                        <span>${item.item}</span>
                        <span>+$${item.cost}</span>
                    </li>
                `).join("");

                extrasHTML = `
                    <div class="mt-2 pt-2 border-top border-secondary-subtle">
                        <small class="fw-bold text-secondary">Extra Charges:</small>
                        <ul class="list-unstyled mb-0 ps-2">
                            ${listItems}
                        </ul>
                    </div>
                `;
            }

            // --- C. STATUS COLOR ---
            let statusColor = "bg-secondary";
            if (b.status === "Confirmed") statusColor = "bg-primary";
            if (b.status === "Active") statusColor = "bg-success";
            if (b.status === "Cancelled") statusColor = "bg-danger";
            if (b.status === "Completed") statusColor = "bg-dark";

            // --- D. RENDER ---
            return `
                <div class="col-md-6 col-lg-4">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                            <span class="badge ${statusColor}">${b.status}</span>
                            <small class="text-muted">#${b.id}</small>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title fw-bold text-dark">
                                Room ${b.roomNo} 
                                <span class="text-muted small fw-normal">(${b.roomType || 'Standard'})</span>
                            </h5>
                            
                            <p class="card-text mt-3">
                                <i class="bi bi-calendar-check me-2 text-primary"></i> 
                                ${b.checkIn} <i class="bi bi-arrow-right mx-1"></i> ${b.checkOut}
                            </p>

                            <div class="bg-light p-3 rounded mt-auto">
                                <div class="d-flex justify-content-between">
                                    <span>Base Rate:</span>
                                    <span class="fw-bold">$${basePrice}</span>
                                </div>
                                ${extrasHTML}
                                <div class="d-flex justify-content-between mt-2 pt-2 border-top border-secondary">
                                    <span class="fw-bold text-dark">Total:</span>
                                    <span class="fw-bold text-success fs-5">$${grandTotal}</span>
                                </div>
                            </div>

                            <div class="mt-3 text-end">
                                ${b.status === 'Confirmed' ? `
                                    <button class="btn btn-outline-danger btn-sm w-100" onclick="cancelBooking('${b.id}')">
                                        Cancel Booking
                                    </button>` 
                                : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error loading bookings:", error);
        alert("Failed to load bookings. Check console for details.");
    }
};

// ==========================================
// 3. CANCEL FUNCTION
// ==========================================
window.cancelBooking = async (id) => {
    if (!confirm("Are you sure you want to cancel?")) return;

    try {
        await fetch(`http://localhost:3000/bookings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Cancelled" })
        });
        loadMyBookings();
    } catch (error) {
        console.error("Cancel failed:", error);
    }
};

// RUN
loadMyBookings();