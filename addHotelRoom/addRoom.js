let form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let formData = new FormData(form);
  console.log(formData.get("roomNumber"));
  console.log(formData.get("roomType"));
  console.log(formData.get("price"));
  console.log(formData.get("roomStatus"));
  let image = formData.get("file");

  let fileReader = new FileReader();
  fileReader.onload = (e) => {
    let imageUrl = e.target.result;
    let hotelRoomDetails = {
      roomNo: formData.get("roomNumber"),
      roomPrice: formData.get("price"),
      roomType: formData.get("roomType"),
      roomImage: imageUrl,
      roomStatus: formData.get("roomStatus"),
    };
    addRooms(hotelRoomDetails);
    location.href = "../homePage/homePage.html";
  };
  fileReader.readAsDataURL(image);
});

let addRooms = async (data) => {
  try {
    await fetch("http://localhost:3000/hotelsRooms", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.log(error);
  }
};