const url = "http://localhost:5000";

function displayCategoryMessage(category) {
  const message = category;
  document.getElementById("website_category").innerText = message;
}

function checkWebsiteCategory(username, websiteName) {
  fetch("distracting_websites.json")
    .then((response) => response.json())
    .then((data) => {
      const category = data.includes(websiteName)
        ? "distracting"
        : "non-distracting";
      sendCategoryToBackend(username, websiteName, category);
    })
    .catch((error) => {
      console.error("Error fetching website category:", error);
    });
}

function sendCategoryToBackend(username, websiteName, category) {
  const data = {
    username: username,
    websiteName: websiteName,
    category: category,
  };

  fetch(`${url}/api/v1/category`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send website category to backend");
      }
      return response.json();
    })
    .then((data) => {
      chrome.storage.local.set({ category: data.category});
      displayCategoryMessage(data.category);
    })
    .catch((error) => {
      console.error("Error sending website category to backend:", error);
    });
}

function updateLoggedInContent() {
  chrome.storage.local.get(
    ["isLoggedIn", "username", "websiteName"],
    function (data) {
      const isLoggedIn = data.isLoggedIn;
      if (!isLoggedIn) {
        return;
      }

      const username = data.username;
      const websiteName = data.websiteName;

      if (!websiteName) {
        document.getElementById("opened_website").innerText =
          "No website is opened";
        document.getElementById("time_spent").innerText = "";
        return;
      }

      document.getElementById("opened_website").innerText =
        "Website Name : " + websiteName;

      if (websiteName) {
        checkWebsiteCategory(username, websiteName);
      }

      chrome.storage.local.set({ websiteName: websiteName });
    }
  );
}

function fetchTimeSpent() {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get(["username", "websiteName"], (data) => {
          if (!data.username || !data.websiteName) {
              reject("Username or websiteName not found in storage");
              return;
          }

          fetch(`${url}/api/v1/fetchTimeSpent`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ username: data.username, websiteName: data.websiteName }),
          })
              .then((response) => {
                  if (!response.ok) {
                      throw new Error("Failed to fetch time spent from backend");
                  }
                  return response.json();
              })
              .then((data) => {
                  if (data && data.timeSpentInSeconds) {
                      const formattedTime = formatTime(data.timeSpentInSeconds);
                      document.getElementById("time_spent").innerText = "Time Spent : " + formattedTime;
                      resolve(formattedTime);
                  } else {
                      document.getElementById("time_spent").innerText = "Time Spent: 1 second";
                      resolve("1 second");
                  }
              })
              .catch((error) => {
                  reject(error);
              });
      });
  });
}


function formatTime(timeInSeconds) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  let formattedTime = "";
  if (hours > 0) {
      formattedTime += hours + " hour" + (hours !== 1 ? "s" : "") + " ";
  }
  if (minutes > 0) {
      formattedTime += minutes + " minute" + (minutes !== 1 ? "s" : "") + " ";
  }
  if (seconds > 0 || formattedTime === "") {
      formattedTime += seconds + " second" + (seconds !== 1 ? "s" : "");
  }

  return formattedTime;
}


function updateWebsiteCategory(username, websiteName, isChecked) {
  const category = isChecked ? "non-distracting" : "distracting";
  updateCategory(username, websiteName, category);
}

function updateCategory(username, websiteName, category) {
  const data = {
    username: username,
    websiteName: websiteName,
    category: category,
  };

  fetch(`${url}/api/v1/updateCategory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update website category");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data.category);
    })
    .catch((error) => {
      console.error("Error updating website category:", error);
    });
}

function updateToggle() {
  const displayedCategory =
    document.getElementById("website_category").innerText;
  const categoryToggleState =
    displayedCategory === "distracting" ? false : true;
  categoryToggle.checked = categoryToggleState;
}

document.addEventListener("DOMContentLoaded", async () => {
  updateLoggedInContent();
  setInterval(updateLoggedInContent, 1000);
  fetchTimeSpent();
  setInterval(fetchTimeSpent, 1000);
  updateToggle();
  setInterval(updateToggle, 10);

  const categoryToggle = document.getElementById("categoryToggle");
  categoryToggle.addEventListener("change", async (event) => {
    const isChecked = event.target.checked;
    const { username, websiteName } = await getStoredValues();
    updateWebsiteCategory(username, websiteName, isChecked);
  });
});

async function getStoredValues() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["username", "websiteName"], (data) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(data);
      }
    });
  });
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    updateLoggedInContent();
  }
});
