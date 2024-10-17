document.addEventListener("DOMContentLoaded", async () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const loggedInContent = document.getElementById("loggedInContent");
  const loadRegisterFormButton = document.getElementById("loadRegisterForm");
  const backToLoginFormButton = document.getElementById("backToLoginForm");
  const errorMessage = document.getElementById("errorMessage");
  const loginErrorMessage = document.getElementById("loginErrorMessage");
  const userDiv = document.getElementById("user");

  const url = "http://127.0.0.1:5000";
async function getLocalStorageData(keys) {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, function(data) {
          resolve(data);
      });
  });
}

(async function() {
  const data = await getLocalStorageData(["isLoggedIn", "username"]);
  const isLoggedIn = data.isLoggedIn;
  const username = data.username;

  if (isLoggedIn) {
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
      loggedInContent.style.display = 'block';
      userDiv.innerText = `Logged in as : ${username}`;
  }
})();


const logoutButton = document.getElementById("logoutButton");

  logoutButton.addEventListener("click", () => {
    chrome.storage.local.remove(["isLoggedIn", "username"], function() {
      loginForm.style.display = "block";
      registerForm.style.display = "none";
      loggedInContent.style.display = "none";
      errorMessage.classList.add("hidden");
    });
  });

  loadRegisterFormButton.addEventListener("click", () => {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    loginErrorMessage.classList.add("hidden");

    backToLoginFormButton.addEventListener("click", () => {
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
      errorMessage.classList.add("hidden");
      loginErrorMessage.classList.add("hidden");
    });

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = registerForm.querySelector("#registerUsername").value;
      const password = registerForm.querySelector("#registerPassword").value;

      try {
        const response = await fetch(`${url}/api/v1/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          chrome.storage.local.set({"isLoggedIn": "true"})
          chrome.storage.local.set({"username": username})
          loginForm.style.display = "none";
          registerForm.style.display = "none";
          loggedInContent.style.display = "block";
          userDiv.innerText = `Logged in as : ${username}`;
        } else {
          const errorData = await response.json();
          if (response.status === 400) {
            errorMessage.textContent =
              "Username already exists. Please choose another one.";
            errorMessage.classList.remove("hidden");
          } else {
            alert("Error registering");
          }
        }
      } catch (error) {
        console.error("Error registering:", error);
      }
    });
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = loginForm.querySelector("#loginUsername").value;
    const password = loginForm.querySelector("#loginPassword").value;

    try {
      const response = await fetch(`${url}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        chrome.storage.local.set({"isLoggedIn": "true"})
        chrome.storage.local.set({"username": username})
        loginForm.style.display = "none";
        registerForm.style.display = "none";
        loggedInContent.style.display = "block";
        userDiv.innerText = `Logged in as : ${username}`;
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          loginErrorMessage.textContent = "Username or password is incorrect";
          loginErrorMessage.classList.remove("hidden");
        } else {
          alert("Error logging in");
      }
    } }catch (error) {
      console.error("Error logging in:", error);
    }
});
});