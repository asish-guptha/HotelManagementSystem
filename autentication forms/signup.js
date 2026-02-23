let form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    let formData = new FormData(form);
    let userPassword = formData.get("password");
    let userConfirmPassword = formData.get("confirmPassword");

    if (userPassword === userConfirmPassword) {
        let userDetails = {
            id: crypto.randomUUID().slice(0, 6), // Generate a short ID automatically
            name: formData.get("name"),
            email: formData.get("email"),
            password: userConfirmPassword,
            mobileNo: formData.get("mobileNo"),
            gender: formData.get("gender"),
        };
        
        addUser(userDetails);
    } else {
        alert("Password Mismatch! Please try again.");
    }
});

let addUser = async (data) => {
    try {
        await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(data),
        });

        // SUCCESS: Show alert and REDIRECT
        alert("Registration Successful! Please Login.");
        window.location.href = "login.html"; // Go to Login Page

    } catch (error) {
        console.error("Error signing up:", error);
        alert("Signup failed. Please try again.");
    }
};