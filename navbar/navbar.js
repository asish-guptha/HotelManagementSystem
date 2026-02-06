let nav_container = document.querySelector(".nav_container");

let logo_block = document.createElement("article");
logo_block.id = "logo";
let navigation_block = document.createElement("article");
navigation_block.id = "navigation";
let profile_block = document.createElement("article");
profile_block.id = "profile";

logo_block.innerHTML = "Logo";

let createNavbar = (data, container_name) => {
  let ul = document.createElement("ul");
  data.map((value) => {
    if (value.name === "logout") {
      let li = document.createElement("li");
      let button = document.createElement("button");
      button.innerHTML = value.name;
      li.classList = value.name;
      button.className = "logout_button";
      li.append(button);
      ul.append(li);
    } else {
      let li = document.createElement("li");
      let a = document.createElement("a");
      a.innerHTML = value.name;
      a.href = value.path;
      li.classList = value.name;

      li.append(a);
      ul.append(li);
    }
  });
  container_name.append(ul);
};

let navigation_Details = [
  {
    name: "home",
    path: "../homePage/homePage.html",
  },
  {
    name: "booking",
    path: "#",
  },
  {
    name: "contact Us",
    path: "#",
  },
  {
    name: "about Us",
    path: "#",
  },
  {
    name: "Add Hotel Room",
    path: "../addHotelRoom/addRoom.html",
  },
];
createNavbar(navigation_Details, navigation_block);

let profileDetails = [
  {
    name: "my Bookings",
    path: "#",
  },
  {
    name: "sign Up",
    path: "../autentication forms/signup.html",
  },
  {
    name: "login",
    path: "../autentication forms/login.html",
  },
  {
    name: "logout",
  },
];

createNavbar(profileDetails, profile_block);
nav_container.append(logo_block, navigation_block, profile_block);

// ---------------------------------Logout Logic------------------------------------------------

let token = localStorage.getItem("id");

let login = document.querySelector(".login");
let signUp = document.querySelector(".sign");
let logout_button = document.querySelector(".logout");

logout_button.addEventListener("click", () => {
  localStorage.removeItem("id");
  location.reload();
});
if (token) {
  login.style.display = "none";
  signUp.style.display = "none";
  logout_button.style.display = "flex";
} else {
  login.style.display = "flex";
  signUp.style.display = "flex";
  logout_button.style.display = "none";
}