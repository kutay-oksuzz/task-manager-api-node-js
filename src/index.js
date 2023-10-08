const express = require("express");
const userRoute = require("./routers/userRoutes");
const taskRoute = require("./routers/taskRoutes");

const app = express();

app.use(express.json());

app.use("/users", userRoute);
app.use("/tasks", taskRoute);

module.exports = app;
