// ==========================================
// 1. GLOBAL VARS & INIT
// ==========================================
const roomContainer = document.getElementById("roomsGrid"); // CHANGED ID
const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));

let allRoomsData = [];
let allBookings = [];
let activeOffers = [];
let selectedSearchDates = null;

// ==========================================
// 2. FETCH & MOCK DATA
// ==========================================
const initPage = async () => {
    try {
        const [roomRes, bookingRes, offerRes] = await Promise.all([
            fetch("http://localhost:3000/hotelsRooms"),
            fetch("http://localhost:3000/bookings"),
            fetch("http://localhost:3000/roomOffers")
        ]);

        const rawRooms = await roomRes.json();
        allBookings = await bookingRes.json();
        activeOffers = await offerRes.json();

        // --- MOCK AMENITIES (Inject them if missing) ---
        allRoomsData = rawRooms.map(room => {
            if (!room.amenities) {
                // Assign random amenities based on Room Type for realism
                if (room.roomType === 'Suite') room.amenities = ["WiFi", "Pool", "AC", "Breakfast", "TV"];
                else if (room.roomType === 'Double Room') room.amenities = ["WiFi", "AC", "TV"];
                else room.amenities = ["WiFi", "AC"];
            }
            return room;
        });

        // Initial Render
        applyFilters(); 

        // Set Date Inputs
        const today = new Date().toISOString().split('T')[0];
        document.getElementById("searchCheckIn").min = today;
        document.getElementById("searchCheckOut").min = today;

    } catch (error) { console.error("Error:", error); }
};

// ==========================================
// 3. FILTER LOGIC (The New Brain)
// ==========================================
function applyFilters() {
    // 1. Get Filter Values
    const maxPrice = Number(document.getElementById("priceRange").value);
    const checkedBoxes = document.querySelectorAll('.amenity-filter:checked');
    const requiredAmenities = Array.from(checkedBoxes).map(cb => cb.value);

    // 2. Filter the Master List
    const filteredRooms = allRoomsData.filter(room => {
        // Price Check
        if (Number(room.roomPrice) > maxPrice) return false;

        // Amenities Check (Must have ALL selected)
        const hasAll = requiredAmenities.every(req => room.amenities.includes(req));
        if (!hasAll) return false;

        // Date Availability Check (If dates are selected)
        if (selectedSearchDates) {
            const roomBookings = allBookings.filter(b => 
                b.roomNo === room.roomNo && (b.status === 'Confirmed' || b.status === 'Active')
            );
            const isTaken = roomBookings.some(b => 
                (selectedSearchDates.checkIn < b.checkOut && selectedSearchDates.checkOut > b.checkIn)
            );
            if (isTaken) return false; // Filter out taken rooms from the view? 
            // OR keep them but mark as "Sold Out". Let's filter out TAKEN specific units, 
            // but we usually render by *Type*. 
            // Simplified: We will handle "Sold Out" visually in renderRooms.
        }
        
        return true;
    });

    // 3. Update Price Label
    document.getElementById("priceValue").innerText = `$${maxPrice}`;

    renderRooms(filteredRooms);
}

// Event Listeners for Filters
document.getElementById("priceRange").addEventListener("input", applyFilters);
document.querySelectorAll('.amenity-filter').forEach(cb => cb.addEventListener("change", applyFilters));

window.resetFilters = () => {
    document.getElementById("priceRange").value = 5000;
    document.querySelectorAll('.amenity-filter').forEach(cb => cb.checked = false);
    applyFilters();
};

// ==========================================
// 4. RENDER LOGIC (With Icons)
// ==========================================
function renderRooms(roomsToRender) {
    roomContainer.innerHTML = "";
    
    // Grouping by Type logic (Kept same as before)
    // IMPORTANT: We need to see if ANY room of this type matches filters
    const uniqueTypes = [...new Set(allRoomsData.map(r => r.roomType))];

    uniqueTypes.forEach(type => {
        // Find rooms of this type that passed the filter
        const availableFiltered = roomsToRender.filter(r => r.roomType === type);
        
        // If 0 rooms of this type passed the filter (e.g. price too high), skip showing the card
        // UNLESS you want to show "Sold Out". Let's hide completely if it doesn't match filter.
        if (availableFiltered.length === 0) return;

        const displayRoom = availableFiltered[0]; // Use first one for display
        const count = availableFiltered.length;

        // --- ICONS GENERATION ---
        const iconsHTML = displayRoom.amenities.map(am => {
            let icon = 'star';
            if (am === 'WiFi') icon = 'wifi';
            if (am === 'Pool') icon = 'water';
            if (am === 'AC') icon = 'snow';
            if (am === 'Breakfast') icon = 'cup-hot';
            if (am === 'TV') icon = 'tv';
            return `<i class="bi bi-${icon} me-2 text-secondary" title="${am}"></i>`;
        }).join("");

        // --- PRICE & OFFERS ---
        const offer = activeOffers.find(o => o.roomType === type);
        let priceHTML = '';
        let finalPrice = displayRoom.roomPrice;
        
        if (offer) {
            const discount = (displayRoom.roomPrice * offer.discount) / 100;
            finalPrice = Math.floor(displayRoom.roomPrice - discount);
            priceHTML = `
                <span class="badge bg-danger mb-2">SALE: ${offer.title}</span>
                <h5 class="fw-bold text-success">$${finalPrice} 
                <small class="text-muted text-decoration-line-through fw-normal">$${displayRoom.roomPrice}</small></h5>`;
        } else {
            priceHTML = `<h5 class="fw-bold text-primary">$${displayRoom.roomPrice}</h5>`;
        }

        const cardHTML = `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="position-relative">
                        <img src="${displayRoom.roomImage}" class="card-img-top" style="height: 200px; object-fit: cover;">
                        <span class="position-absolute top-0 end-0 bg-dark text-white px-2 py-1 m-2 rounded small opacity-75">
                            ${count} Left
                        </span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-capitalize fw-bold">${type}</h5>
                        <div class="mb-3">${iconsHTML}</div>
                        ${priceHTML}
                        <button class="btn btn-dark w-100 mt-2" onclick="openBookingModal('${type}')">Book Now</button>
                    </div>
                </div>
            </div>`;
            
        roomContainer.insertAdjacentHTML("beforeend", cardHTML);
    });

    if (roomContainer.innerHTML === "") {
        roomContainer.innerHTML = `<div class="col-12 text-center text-muted py-5"><h4>No rooms match your filters.</h4></div>`;
    }
}

// ==========================================
// 5. SEARCH & BOOKING LOGIC (Kept from before)
// ==========================================
// ... (Keep your existing searchForm listener and openBookingModal function exactly as they were) ...
// Just ensure `renderRooms` is called after search to update the view.

// FOR COMPLETENESS, here is the search listener adapted to the filter system:
document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const checkIn = document.getElementById("searchCheckIn").value;
    const checkOut = document.getElementById("searchCheckOut").value;

    selectedSearchDates = { checkIn, checkOut };
    
    // Re-run the main filter function (which now includes date logic!)
    applyFilters();
});

// Run
initPage();