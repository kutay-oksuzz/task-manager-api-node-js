const express = require("express");
const User = require("../models/user");
const auth = require("../controller/authController");
const Task = require("../models/task");

const router = express.Router();

exports.getAllTasks = async (req, res) => {
  const match = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  try {
    const tasks = await Task.find();

    res.send(tasks);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      owner: req.user.id,
    });

    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    console.log(req.user.id);
    const task = await Task.find({ owner: req.user.id });

    if (!task)
      return res.status(400).json({
        status: "Error",
        message: "No Task",
      });

    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
};
exports.updateMyTask = async (req, res) => {
  const object = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = object.every((allow) => {
    if (allowedUpdates.includes(allow)) return true;

    return false;
  });

  if (!isValidOperation)
    return res.status(400).send({ error: "Invalid updates!" });

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });

    object.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    if (!task) return res.status(404).send();

    res.status(200).json({
      status: "Success",
      data: {
        task,
      },
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.deleteMyTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!task) return res.status(404).send();

    res.status(200).json({
      status: "Success",
      data: null,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};
