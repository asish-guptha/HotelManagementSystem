let roomContainer = document.querySelector(".room_container");

let rooms = async () => {
  let response = await fetch("http://localhost:3000/hotelsRooms");
  let roomsData = await response.json();

  roomsData.map((room) => {
    let container = document.createElement("article");
    container.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    let roomNo = document.createElement("p");
    let roomPrice = document.createElement("p");
    let roomImage = document.createElement("img");
    let status = document.createElement("p");
    let roomType = document.createElement("p");
    let bookRoom = document.createElement("button");

    roomNo.innerHTML = `Room No: ${room.roomNo}`;
    roomPrice = `Room Price: ${room.roomPrice}`;
    roomImage.src = room.roomImage;
    bookRoom.innerHTML = "Book The Room";
    roomType.innerHTML = `Room Type : ${room.roomType}`;
    status.innerHTML = `Status: ${room.roomStatus}`;

    if (room.roomStatus === "Available") {
      status.style.color = "green";
    } else {
      status.style.color = "red";
      bookRoom.setAttribute("disabled", "true");
    }

    container.append(roomImage, roomNo, roomPrice, roomType, status, bookRoom);
    roomContainer.append(container);
  });
};
rooms();