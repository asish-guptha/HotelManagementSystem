// 1. FETCH DATA
let allBookings = [];

const loadHistory = async () => {
    try {
        const res = await fetch("http://localhost:3000/bookings");
        allBookings = await res.json();
        
        // Initial Render (Show newest first)
        renderTable(allBookings.reverse());
    } catch (error) {
        console.error("Error loading history:", error);
    }
};

// 2. RENDER TABLE
const renderTable = (data) => {
    const tbody = document.getElementById("historyTableBody");
    const countLabel = document.getElementById("resultCount");
    
    tbody.innerHTML = "";
    countLabel.innerText = `Showing ${data.length} records`;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No records found matching filters.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(b => {
        let badgeClass = 'bg-secondary';
        if (b.status === 'Confirmed') badgeClass = 'bg-primary';
        if (b.status === 'Active') badgeClass = 'bg-success';
        if (b.status === 'Cancelled') badgeClass = 'bg-danger';
        if (b.status === 'Completed') badgeClass = 'bg-dark';

        return `
            <tr>
                <td class="ps-4"><small class="text-muted">#${b.id}</small></td>
                <td>
                    <div class="fw-bold">${b.name}</div>
                    <small class="text-muted">User ID: ${b.userId || 'N/A'}</small>
                </td>
                <td>
                    <span class="badge bg-light text-dark border">Room ${b.roomNo}</span>
                    <span class="small text-muted ms-1">${b.roomType || 'Standard'}</span>
                </td>
                <td>
                    <small class="d-block">In: ${b.checkIn}</small>
                    <small class="d-block text-muted">Out: ${b.checkOut}</small>
                </td>
                <td class="fw-bold text-success">$${b.roomPrice}</td>
                <td><span class="badge ${badgeClass}">${b.status}</span></td>
            </tr>
        `;
    }).join("");
};

// 3. FILTER LOGIC
const applyFilters = () => {
    const query = document.getElementById("searchQuery").value.toLowerCase();
    const status = document.getElementById("filterStatus").value;
    const start = document.getElementById("filterStart").value;
    const end = document.getElementById("filterEnd").value;

    const filtered = allBookings.filter(b => {
        // A. Search Query (Name or ID)
        const matchQuery = (b.name && b.name.toLowerCase().includes(query)) || 
                           (b.id && b.id.toString().includes(query));

        // B. Status
        const matchStatus = status === "All" || b.status === status;

        // C. Date Range (Checks if Booking Date falls within range)
        // If no range selected, ignore this check
        let matchDate = true;
        if (start && end) {
            matchDate = b.checkIn >= start && b.checkIn <= end;
        }

        return matchQuery && matchStatus && matchDate;
    });

    renderTable(filtered);
};

// 4. EVENT LISTENERS
document.getElementById("searchQuery").addEventListener("input", applyFilters);
document.getElementById("filterStatus").addEventListener("change", applyFilters);
document.getElementById("filterStart").addEventListener("change", applyFilters);
document.getElementById("filterEnd").addEventListener("change", applyFilters);

// Reset
window.resetFilters = () => {
    document.getElementById("filterForm").reset();
    renderTable(allBookings); // Reset to full list
};

// Init
loadHistory();