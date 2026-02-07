const roomContainer = document.querySelector(".room_container");
// Initialize the Bootstrap Modal so we can toggle it via JS
const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));

// 1. Fetch and Display Rooms
const displayRooms = async () => {
    try {
        let response = await fetch("http://localhost:3000/hotelsRooms");
        let roomsData = await response.json();

        roomContainer.innerHTML = ""; // Clear loader

        roomsData.forEach((room) => {
            // Determine styling based on status
            const isAvailable = room.roomStatus === "Available";
            const statusColor = isAvailable ? "text-success" : "text-danger";
            const btnState = isAvailable ? "" : "disabled";
            const btnText = isAvailable ? "Book Now" : "Sold Out";

            // Generate Card HTML
            const cardHTML = `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="${room.roomImage}" class="card-img-top" alt="Room Image" style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="card-title mb-0">Room ${room.roomNo}</h5>
                                <span class="badge bg-light text-dark border">${room.roomType}</span>
                            </div>
                            <p class="card-text fw-bold text-primary">$${room.roomPrice} <span class="text-muted small fw-normal">/ night</span></p>
                            <p class="card-text small ${statusColor} fw-bold">
                                ● ${room.roomStatus}
                            </p>
                            <button class="btn btn-dark w-100 mt-2" ${btnState} 
                                onclick='openBookingModal(${JSON.stringify(room)})'>
                                ${btnText}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            roomContainer.insertAdjacentHTML("beforeend", cardHTML);
        });

    } catch (error) {
        console.error("Error fetching rooms:", error);
        roomContainer.innerHTML = `<p class="text-danger text-center">Failed to load rooms.</p>`;
    }
};

// 2. Open Modal & Fill Data (Triggered by the "Book Now" button)
window.openBookingModal = (room) => {
    // A. Fill the "Read Only" details in the modal
    const detailsContainer = document.getElementById("modalRoomDetails");
    detailsContainer.innerHTML = `
        <div class="d-flex justify-content-between">
            <span><strong>Room No:</strong> ${room.roomNo}</span>
            <span><strong>Type:</strong> ${room.roomType}</span>
        </div>
        <div class="mt-1">
            <span><strong>Price:</strong> $${room.roomPrice}</span>
        </div>
    `;

    // B. Set hidden inputs so we can send this data to the backend later
    document.getElementById("hiddenRoomNo").value = room.roomNo;
    document.getElementById("hiddenRoomType").value = room.roomType;
    document.getElementById("hiddenRoomPrice").value = room.roomPrice;

    // C. Show the Bootstrap Modal
    bookingModal.show();
};

// 3. Handle Form Submission
const bookingForm = document.getElementById("bookingForm");

bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop page refresh

    const formData = new FormData(bookingForm);
    
    // Construct the Booking Object
    const bookingDetails = {
        userId: localStorage.getItem("id") || "guest_user", // Fallback if not logged in
        roomNo: document.getElementById("hiddenRoomNo").value,
        roomType: document.getElementById("hiddenRoomType").value,
        roomPrice: document.getElementById("hiddenRoomPrice").value,
        name: formData.get("name"),
        checkIn: formData.get("checkIn"),
        checkOut: formData.get("checkOut"),
        bookingDate: new Date().toISOString().split('T')[0] // Current date
    };

    // Send to Backend
    await addBooking(bookingDetails);
});

const addBooking = async (data) => {
    try {
        await fetch("http://localhost:3000/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        // Hide Modal and Show Success
        bookingModal.hide();
        alert("Success! Your booking is confirmed.");
        bookingForm.reset(); // Clear form for next time

    } catch (error) {
        console.error("Booking failed:", error);
        alert("Something went wrong. Please try again.");
    }
};

// Start the app
displayRooms();