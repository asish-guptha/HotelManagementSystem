let nav_container = document.querySelector(".nav_container");

// 1. Create Layout Elements
let logo_block = document.createElement("article");
logo_block.id = "logo";
// Add your logo image or text here
logo_block.innerHTML = `<h2 style="color:orange; font-style:italic; cursor:pointer;">Tulasi Grand </h1>`; 
logo_block.addEventListener("click", () => window.location.href = "../homePage/homePage.html");

let navigation_block = document.createElement("article");
navigation_block.id = "navigation";

let profile_block = document.createElement("article");
profile_block.id = "profile";

// 2. The Navbar Generator Function
let createNavbar = (data, container_name) => {
    let ul = document.createElement("ul");
    
    data.forEach((value) => {
        let li = document.createElement("li");
        li.className = value.name.toLowerCase().replace(" ", ""); // Create class like 'logout', 'mybookings'

        if (value.name.toLowerCase() === "logout") {
            // --- LOGOUT BUTTON CREATION & LOGIC ---
            let button = document.createElement("button");
            button.innerHTML = "Logout";
            button.className = "logout_button"; // Links to your CSS
            
            // The Click Event
            button.addEventListener("click", () => {
                const confirmLogout = confirm("Are you sure you want to logout?");
                if (confirmLogout) {
                    localStorage.removeItem("id");
                    localStorage.removeItem("email");
                    localStorage.removeItem("name");
                    // Force Redirect to Login Page
                    window.location.href = "../autentication forms/login.html";
                }
            });
            
            li.append(button);
        } else {
            // --- STANDARD LINKS ---
            let a = document.createElement("a");
            a.innerHTML = value.name;
            a.href = value.path;
            li.append(a);
        }
        ul.append(li);
    });
    
    container_name.append(ul);
};

// 3. Define Links
let navigation_Details = [
    { name: "Home", path: "../homePage/homePage.html" },
    { name: "Contact Us", path: "../homePage/contactUs.html" },
    { name: "About Us", path: "../homePage/aboutUs.html" }
];

// Check for Admin to show Admin Portal link
let userEmail = localStorage.getItem("email") || "";
if (userEmail.includes("admin")) {
    navigation_Details.push({ name: "Admin Portal", path: "../adminPortal/dashboard.html" });
}

let profileDetails = [
    { name: "My Bookings", path: "../myBookings/myBookings.html" },
    { name: "Sign Up", path: "../autentication forms/signup.html" },
    { name: "Login", path: "../autentication forms/login.html" },
    { name: "Logout", path: "#" } // Path doesn't matter here, button logic takes over
];

// 4. Build the Navbar
createNavbar(navigation_Details, navigation_block);
createNavbar(profileDetails, profile_block);
nav_container.append(logo_block, navigation_block, profile_block);

// 5. Visibility Logic (Toggle Login/Logout)
let token = localStorage.getItem("id");
let allListItems = document.querySelectorAll("li");

if (token) {
    // If Logged In: Hide Login & Signup
    allListItems.forEach(li => {
        let text = li.innerText.toLowerCase();
        if (text.includes("login") || text.includes("sign up")) {
            li.style.display = "none";
        }
    });
} else {
    // If Logged Out: Hide Logout & My Bookings
    allListItems.forEach(li => {
        let text = li.innerText.toLowerCase();
        if (text.includes("logout") || text.includes("my bookings")) {
            li.style.display = "none";
        }
    });
}