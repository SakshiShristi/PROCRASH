import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import { BsGraphUpArrow } from "react-icons/bs";


function App() {
  const [userData, setUserData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch stored values from chrome.storage.local
      const storedValuesResponse = await getStoredValues();
      const { username } = storedValuesResponse;

      // Fetch user data from your backend
      const userDataResponse = await fetchUserDataFromBackend(username);
      setUserData(userDataResponse);
    } catch (error) {
      setError(error.message);
    }
  };

  const getStoredValues = async () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["username"], (data) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(data);
        }
      });
    });
  };

  const fetchUserDataFromBackend = async (username) => {
    const url = "http://localhost:5000/api/v1/userdata";
    const data = {
      username: username,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const renderPieChart = () => {
    if (!selectedDate || !userData) return null;
    const selectedDateTime = selectedDate ? new Date(selectedDate) : null;
    const formattedSelectedDate = selectedDateTime
      ? new Date(selectedDateTime.setDate(selectedDateTime.getDate() + 1))
          .toISOString()
          .split("T")[0]
      : null;
    console.log(formattedSelectedDate);

    const data = formattedSelectedDate
      ? userData.websiteHistory.find(
          (history) => history.date.split("T")[0] === formattedSelectedDate
        )
      : null;

    if (!data) return null;

    const distractingWebsitesCount = data.websites.filter(
      (site) => site.category === "distracting"
    ).length;
    const nonDistractingWebsitesCount = data.websites.filter(
      (site) => site.category === "non-distracting"
    ).length;

    const pieChartData = [
      { name: "Distracting", value: distractingWebsitesCount },
      { name: "Non-Distracting", value: nonDistractingWebsitesCount },
    ];

    return (
      <Paper elevation={3} style={{ padding: "20px", backgroundColor:"black" }}>
        <Typography variant="h6" style={{backgroundColor:"black", color: "white"}}>
          Engagement Insights: Focused vs. Non-Focused Activity
        </Typography>
        <PieChart width={400} height={400} style={{backgroundColor: "black"}}> 
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={pieChartData}
            cx="50%"
            cy="50%"
            // outerRadius={150}
            innerRadius={30}
            outerRadius={100}
            paddingAngle={5}
            cornerRadius={5}
            startAngle={-90}
            endAngle={180}
            fill="#8884d8"
            label
          >
            {pieChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name === "Non-Distracting" ? "#06D001" : "#FF0000"}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Paper>
    );
  };

  const renderWebsiteList = () => {
    if (!selectedDate || !userData) return null;
    const selectedDateTime = selectedDate ? new Date(selectedDate) : null;
    const formattedSelectedDate = selectedDateTime
      ? new Date(selectedDateTime.setDate(selectedDateTime.getDate() + 1))
          .toISOString()
          .split("T")[0]
      : null;
    console.log(formattedSelectedDate);

    const data = formattedSelectedDate
      ? userData.websiteHistory.find(
          (history) => history.date.split("T")[0] === formattedSelectedDate
        )
      : null;

    if (!data) return null;

    // Calculate total time spent by all websites in seconds
    const totalTimeSpent = data.websites.reduce(
      (total, site) => total + site.timeSpentInSeconds,
      0
    );
    const totalTimeSpentFormatted = formatTime(totalTimeSpent);

    return (
      <Paper elevation={3} style={{ padding: "20px" , backgroundColor:"black" }}>
        <Typography variant="h4" style={{backgroundColor:"black", color: "white"}}>Engagement Breakdown: Websites</Typography>
        <Typography variant="h6" style={{fontWeight:"300", fontSize:"15px",backgroundColor:"black", color: "white"}}>
         Overall Time Spent: {totalTimeSpentFormatted}
        </Typography>
        {data.websites.map((site) => (
          <div key={site._id} style={{ marginBottom: "10px", color:"white" }}>
            <Typography variant="subtitle1" color={"white"}>{site.url}</Typography>
            <div
              style={{
                position: "relative",
                width: "100%",
                backgroundColor: "#ddd",
                marginTop: "5px",
                borderRadius: "5px",
                height: "20px",
              }}
            >
              <div
                style={{
                  width: `${(site.timeSpentInSeconds / totalTimeSpent) * 100}%`,
                  backgroundColor:
                    site.category === "distracting" ? "#FF0000" : "#06D001",
                  borderRadius: "5px",
                  height: "100%",
                }}
              ></div>
              <p
                style={{
                  fontSize: "10px",
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-51%)",
                  right: "2px",
                  fontWeight: 600,
                  background: "black",
                  padding: "1px 4px 3px",
                  borderRadius: "4px",
                  color:"white"
                }}
              >
                {formatTime(site.timeSpentInSeconds)}
              </p>
            </div>
          </div>
        ))}
      </Paper>
    );
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    let formattedTime = "";
    if (hours > 0) formattedTime += `${hours} hours `;
    if (minutes > 0) formattedTime += `${minutes} minutes `;
    if (remainingSeconds > 0) formattedTime += `${remainingSeconds} seconds`;
    return formattedTime.trim();
  };

  return (
    <div
      className="relative h-fit min-h-screen flex flex-col items-center justify-center gap-14 px-2 py-12"
      style={{
        backgroundImage:
          'url("https://images.pexels.com/photos/10479426/pexels-photo-10479426.jpeg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        src="Procrash_logo.png"
        alt="logo"
        className="h-12 w-12 rounded-full absolute left-12 top-12"
      />
      <h1 className="text-7xl font-bold text-white">PROCRASH DASHBOARD</h1>
      <h1 className="flex gap-5 font-semibold items-center text-2xl text-red-100 uppercase italic">
        Select a Date to get your daily analysis
        <BsGraphUpArrow className="text-red-100 font-semibold" />
      </h1>
      <div className="mb-4 bg-gray-300">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => (
              <input
                {...params}
                className="border border-gray-300 px-2 py-1 rounded"
              />
            )}
          />
        </LocalizationProvider>
      </div>
      <div className="flex justify-center" style={{ width: "90%" }}>
        <div className="mr-4" style={{ width: "50%" }}>
          {renderPieChart()}
        </div>
        <div className="" style={{ width: "100%" }}>
          {renderWebsiteList()}
        </div>
      </div>
    </div>
  );
}

export default App;
