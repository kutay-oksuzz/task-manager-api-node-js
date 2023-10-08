const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sharp = require("sharp");
const sendEmail = require("../emails/account");

const signToken = (id) => jwt.sign({ id: id }, process.env.JWT_SECRET);

exports.createUser = async (req, res) => {
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const token = signToken(user._id);

    sendEmail.sendWelcomeEmail(user.email, user.name);

    res.status(201).json({
      status: "Success",
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send("Please prowide email or password");

    const user = await User.findOne({ email: email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password)))
      return res.status(400).json({
        status: "Error",
        message: "Incorrect password or email",
      });

    const token = signToken(user._id);

    res.status(200).json({
      status: "Success",
      token,
    });
  } catch (err) {
    res.status(400).send(error);
  }
};

exports.logout = async (req, res) => {
  try {
    res.cookie("jwt", "null", {
      expires: new Date(Date.now() - 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(400).json({ status: "Error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;

    await req.user.save();

    res.status(200).json({
      status: "Success",
    });
  } catch (error) {
    console.log("kod burada");
    res.status(400).send({ error: err.message });
  }
};

exports.deleteMyAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.avatar = undefined;

    await user.save();

    res.status(200).json({
      status: "Success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "Something is wrong",
    });
  }
};

exports.updateMe = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) => {
    if (allowedUpdates.includes(update)) return true;

    return false;
  });

  if (!isValidOperation)
    return res.status(400).send({ error: "Invalid updates!" });

  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).send();

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    res.status(200).json({
      status: "Success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.deleteMe = async (req, res) => {
  try {
    sendEmail.sendCancelationEmail(req.user.email, req.user.name);
    await req.user.deleteOne();
    res.status(200).json({
      status: "Success",
      data: null,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
