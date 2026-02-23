let form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let formData = new FormData(form);
    let userPassword = formData.get("password");
    let email = formData.get("email");

    let userData = await fetchUsers();

    let singleUser = userData.find(
        (value) => value.email === email && value.password === userPassword
    );

    if (singleUser === undefined) {
        alert("User Not Found or Wrong Password");
    } else {
        // SUCCESS: Save Token and Redirect
        localStorage.setItem("id", singleUser.id);
        localStorage.setItem("email", singleUser.email); // Important for Admin check
        localStorage.setItem("name", singleUser.name);   // Store name for Booking Form

        alert(`Welcome back, ${singleUser.name}!`);

        // REDIRECT LOGIC
        if (singleUser.email.includes("admin")) { 
            // If email contains "admin", go to dashboard
            // Create this folder structure later: adminPortal/dashboard.html
            window.location.href = "../adminPortal/dashboard.html"; 
        } else {
            // Normal user goes to Home Page
            window.location.href = "../homePage/homePage.html";
        }
    }
});

let fetchUsers = async () => {
    try {
        let response = await fetch("http://localhost:3000/users");
        let users = await response.json();
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        alert("Server error. Is json-server running?");
        return [];
    }
};