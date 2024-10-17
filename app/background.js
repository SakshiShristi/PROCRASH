const url = "http://localhost:5000";
function injectScript(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['inject.js'],
    });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && !tab.url.startsWith("chrome://") && !tab.url.includes("search.brave.com")) {
        if (tab.active && changeInfo.status === "complete") {
            injectScript(tabId);
        }
    }else {
        chrome.storage.local.remove('websiteName', () => {
            console.log('Website data removed from local storage');
        });
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && !tab.url.startsWith("chrome://") && !tab.url.includes("search.brave.com")) {
            injectScript(activeInfo.tabId);
        }else {
            chrome.storage.local.remove('websiteName', () => {
                console.log('Website data removed from local storage');
            });
        }
    });
});
function sendTimeDataToBackend(username, websiteName) {
    const data = {
      username: username,
      websiteName: websiteName,
      timeSpentInSeconds: 1,
    };
  
    fetch(`${url}/api/v1/updateData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send time data to backend");
        }
      })
      .catch((error) => {
        console.error("Error sending time data to backend:", error);
      });
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
      })
      .catch((error) => {
        console.error("Error sending website category to backend:", error);
      });
  }

function updateLoggedInContent() {
    chrome.storage.local.get(
        ["isLoggedIn", "username", "websiteName", "startTime", "category"],
        function (data) {
            const isLoggedIn = data.isLoggedIn;
            if (!isLoggedIn) {
                return;
            }

            const username = data.username;
            const websiteName = data.websiteName;
            const startTime = data.startTime;

            if (!websiteName) {
                return;
            }
            checkWebsiteCategory(username, websiteName);

            const currentTime = Math.round(Date.now() / 1000);
            const timeSpentInSeconds = currentTime - startTime;
            if (timeSpentInSeconds === 4 && data.category === "distracting") {
                showNotification(websiteName, data.category);
              }
            sendTimeDataToBackend(username, websiteName, timeSpentInSeconds);
        });
};
function showNotification(websiteName, category) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'Procrash_logo.png',
      title: 'Warning: Distraction Alert!',
      message: `You are currently on ${websiteName} which is found to be ${category}.`,
    });
  }

setInterval(updateLoggedInContent, 1000);

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.local.remove('websiteName', () => {
        console.log('Website data removed from local storage');
    });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.local.remove('warningsShown', () => {
      console.log('Warning data removed from local storage');
    });
  });
