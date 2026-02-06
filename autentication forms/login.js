let form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let formData = new FormData(form);
  let userPassword = formData.get("password");
  let email = formData.get("email");

  let userData = await fetchUsers();

  let singleUser = userData.find(
    (value) => value.email === email && value.password === userPassword,
  );
  if (singleUser === undefined) {
    alert("User Not Found");
  } else {
    alert("Login Successful");
    localStorage.setItem("id", singleUser.id);
  }
});

let fetchUsers = async () => {
  try {
    let response = await fetch("http://localhost:3000/users");
    let users = await response.json();
    return users;
  } catch (error) {
    console.log(error);
  }
};