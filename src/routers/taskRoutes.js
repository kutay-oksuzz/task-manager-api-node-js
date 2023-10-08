const taskController = require("../controller/taskController");
const authController = require("../controller/authController");

const express = require("express");

const router = express.Router();

router
  .route("/createTask")
  .post(authController.auth, taskController.createTask);

router.route("/").get(taskController.getAllTasks);

router.route("/getMyTasks").get(authController.auth, taskController.getMyTasks);
router
  .route("/updateTask/:id")
  .patch(authController.auth, taskController.updateMyTask);

router
  .route("/deleteMyTask/:id")
  .delete(authController.auth, taskController.deleteMyTask);

module.exports = router;
