const apiUrl = "http://localhost:3000/hotelsRooms";
const roomModal = new bootstrap.Modal(document.getElementById('roomModal'));
const tableBody = document.getElementById("inventoryTableBody");

// --- 1. CONFIGURATION: Default Prices ---
const defaultPrices = {
    "Deluxe Room": 150,
    "Suite": 250,
    "Double Room": 100,
    "Single Room": 80
};

// --- 2. AUTO-FILL PRICE LOGIC ---
const roomTypeSelect = document.getElementById("roomType");
const roomPriceInput = document.getElementById("roomPrice");

roomTypeSelect.addEventListener("change", function() {
    const selectedType = this.value;
    // Only update if a mapping exists
    if (defaultPrices[selectedType]) {
        roomPriceInput.value = defaultPrices[selectedType];
    }
});

// --- 3. HANDLE IMAGE UPLOAD (Base64) ---
document.getElementById('roomImageFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('roomImageBase64').value = e.target.result;
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// --- 4. FETCH & DISPLAY ---
const loadInventory = async () => {
    try {
        const response = await fetch(apiUrl);
        const rooms = await response.json();
        
        tableBody.innerHTML = ""; 

        rooms.forEach(room => {
            const statusBadge = room.roomStatus === 'Available' ? 'bg-success' 
                              : room.roomStatus === 'Maintenance' ? 'bg-warning text-dark' 
                              : 'bg-secondary';

            const row = `
                <tr>
                    <td class="ps-4">
                        <img src="${room.roomImage}" alt="Room" class="rounded border" style="width: 60px; height: 40px; object-fit: cover;">
                    </td>
                    <td class="fw-bold">${room.roomNo}</td>
                    <td>${room.roomType}</td>
                    <td>$${room.roomPrice}</td>
                    <td><span class="badge ${statusBadge}">${room.roomStatus}</span></td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary me-2" 
                            onclick='openRoomModal(${JSON.stringify(room)})'>
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                            onclick="deleteRoom('${room.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

    } catch (error) {
        console.error("Error loading inventory:", error);
    }
};

// --- 5. OPEN MODAL (Add/Edit) ---
window.openRoomModal = (roomData = null) => {
    const title = document.getElementById("modalTitle");
    const saveBtn = document.getElementById("saveBtn");
    const form = document.getElementById("roomForm");
    const preview = document.getElementById("imagePreview");

    // Clear previous state
    document.getElementById("roomImageFile").value = "";
    preview.style.display = 'none';
    preview.src = "";

    if (roomData) {
        // --- EDIT MODE ---
        title.innerText = "Edit Room Details";
        saveBtn.innerText = "Update Room";
        
        document.getElementById("editRoomId").value = roomData.id;
        document.getElementById("roomNo").value = roomData.roomNo;
        
        // This sets the type, but we DON'T auto-trigger price change 
        // because we want to keep the existing custom price if they edited it before.
        document.getElementById("roomType").value = roomData.roomType;
        document.getElementById("roomPrice").value = roomData.roomPrice;
        
        document.getElementById("roomStatus").value = roomData.roomStatus;
        document.getElementById("roomImageBase64").value = roomData.roomImage;
        
        if(roomData.roomImage) {
            preview.src = roomData.roomImage;
            preview.style.display = 'block';
        }

    } else {
        // --- ADD MODE ---
        title.innerText = "Add New Room";
        saveBtn.innerText = "Add to Inventory";
        form.reset();
        document.getElementById("editRoomId").value = ""; 
        document.getElementById("roomImageBase64").value = "";
        
        // TRIGGER AUTO-PRICE FOR DEFAULT SELECTION
        // (Usually 'Deluxe Room' is selected by default, so we set price to 150)
        const initialType = roomTypeSelect.value;
        if (defaultPrices[initialType]) {
            roomPriceInput.value = defaultPrices[initialType];
        }
    }

    roomModal.show();
};

// --- 6. SAVE DATA ---
document.getElementById("roomForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editRoomId").value;
    const imageBase64 = document.getElementById("roomImageBase64").value;

    if (!imageBase64) {
        alert("Please upload an image first.");
        return;
    }

    const roomData = {
        roomNo: document.getElementById("roomNo").value,
        roomType: document.getElementById("roomType").value,
        roomPrice: document.getElementById("roomPrice").value,
        roomImage: imageBase64,
        roomStatus: document.getElementById("roomStatus").value
    };

    try {
        if (id) {
            await fetch(`${apiUrl}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(roomData)
            });
        } else {
            roomData.id = crypto.randomUUID().slice(0, 4); 
            await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(roomData)
            });
        }

        roomModal.hide();
        loadInventory();
        alert("Success!");

    } catch (error) {
        console.error("Error saving:", error);
    }
});

// --- 7. DELETE ---
window.deleteRoom = async (id) => {
    if (confirm("Delete this room?")) {
        await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        loadInventory();
    }
};

loadInventory();