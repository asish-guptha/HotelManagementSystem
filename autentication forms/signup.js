let form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let formData = new FormData(form);

  let userPassword = formData.get("password");
  let userConfirmPassword = formData.get("confirmPassword");

  if (userPassword === userConfirmPassword) {
    let userDetails = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: userConfirmPassword,
      mobileNo: formData.get("mobileNo"),
      gender: formData.get("gender"),
    };
    console.log(userDetails);
    addUser(userDetails);
  } else {
    alert("Password Mismatch");
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
  } catch (error) {
    console.log(error);
  }
};