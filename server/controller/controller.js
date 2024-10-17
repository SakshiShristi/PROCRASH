import User from "../model/user.js";

export const updateCategory = async (req, res) => {
  const { username, websiteName, category } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const websiteIndex = user.websites.findIndex(
      (site) => site.domain === websiteName
    );

    if (websiteIndex !== -1) {
      const existingCategory = user.websites[websiteIndex].category;
      return res.status(200).json({ category: existingCategory });
    } else {
      user.websites.push({ domain: websiteName, category });
      await user.save();
      return res.status(200).json({ category });
    }
  } catch (error) {
    console.error("Error updating website category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleWebsiteCategory = async (req, res) => {
  const { username, websiteName } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const websiteIndex = user.websites.findIndex(
      (site) => site.domain === websiteName
    );

    if (websiteIndex !== -1) {
      user.websites[websiteIndex].category =
        user.websites[websiteIndex].category === "distracting"
          ? "non-distracting"
          : "distracting";

      const currentDate = new Date();
      const websiteHistoryIndex = user.websiteHistory.findIndex(
        (entry) => entry.date.toDateString() === currentDate.toDateString()
      );
      if (websiteHistoryIndex !== -1) {
        for (let i = websiteHistoryIndex; i >= 0; i--) {
          const websiteEntryIndex = user.websiteHistory[i].websites.findIndex(
            (website) => website.url === websiteName
          );
          if (websiteEntryIndex !== -1) {
            user.websiteHistory[i].websites[websiteEntryIndex].category =
              user.websites[websiteIndex].category;
          }
        }
      }

      await user.save();

      return res
        .status(200)
        .json({ category: user.websites[websiteIndex].category });
    } else {
      return res
        .status(404)
        .json({ message: "Website not found in user's list" });
    }
  } catch (error) {
    console.error("Error toggling website category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const saveTimeData = async (req, res) => {
  const { username, websiteName, timeSpentInSeconds } = req.body;
  // console.log("username", username);
  // console.log("websiteName", websiteName);
  // console.log("timeSpentInSeconds", timeSpentInSeconds);
  const date = new Date();
  try {
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let websiteHistoryEntry = user.websiteHistory.find(
      (entry) => entry.date.toDateString() === new Date(date).toDateString()
    );

    if (!websiteHistoryEntry) {
      // If there's no entry for the current date, create one
      websiteHistoryEntry = {
        date: date,
        websites: [],
      };
      user.websiteHistory.push(websiteHistoryEntry);
    }

    let websiteEntry = websiteHistoryEntry.websites.find(
      (site) => site.url === websiteName
    );

    if (!websiteEntry) {
      // If there's no entry for the current website, create one
      const website = user.websites.find((site) => site.domain === websiteName);
      const category = website ? website.category : "non-distracting";
      websiteEntry = {
        url: websiteName,
        category: category,
        timeSpentInSeconds: 0, // Initialize to 0 if new entry
      };
      websiteHistoryEntry.websites.push(websiteEntry);
    }

    // Increment time spent by 1 second
    websiteEntry.timeSpentInSeconds += 1;

    // Save changes to the user document
    await user.save();

    return res.status(200).json({ message: "Time data saved successfully" });
  } catch (error) {
    console.log("Error saving time data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchTimeSpent = async (req, res) => {
  const { username, websiteName } = req.body;
  // console.log("time spent is running : ", websiteName);
  const date = new Date();
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const websiteHistoryEntry = user.websiteHistory.find(
      (entry) => entry.date.toDateString() === new Date(date).toDateString()
    );

    if (websiteHistoryEntry) {
      const websiteEntry = websiteHistoryEntry.websites.find(
        (site) => site.url === websiteName
      );

      if (websiteEntry) {
        return res.status(200).json({ timeSpentInSeconds: websiteEntry.timeSpentInSeconds });
      }
    }

    return res.status(200).json({ timeSpentInSeconds: 0 });
  } catch (error) {
    console.log("Error fetching time spent:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWebsiteHistory = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const websiteHistory = user.websiteHistory;

    return res.status(200).json({ websiteHistory });
  } catch (error) {
    console.error("Error fetching website history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


