const userController = require("../controller/userController");
const authController = require("../controller/authController");
const express = require("express");

const multer = require("multer");

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

const router = express.Router();

router.route("/").post(userController.createUser);

router.route("/login").post(userController.login);

router.route("/me").get(authController.auth, userController.getMe);

router.post(
  "/uploadAvatar",
  authController.auth,
  upload.single("avatar"),
  userController.uploadAvatar
);

router
  .route("/deleteMyAvatar")
  .delete(authController.auth, userController.deleteMyAvatar);

router.route("/updateMe").patch(authController.auth, userController.updateMe);

router.route("/logout").post(authController.auth, userController.logout);

router.route("/deleteMe").delete(authController.auth, userController.deleteMe);

module.exports = router;
