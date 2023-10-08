const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Task = require("./task");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      minlength: 7,
      validate: function (value) {
        if (value.toUpperCase().includes("PASSWORD")) {
          throw new Error("Password cannot contain 'password'");
        }
      },
      select: false,
    },
    email: {
      unique: true,
      type: String,
      require: true,
      trim: true,
      lowercase: true,
      validate: function (value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    avatar: {
      type: Buffer,
    },
    age: {
      type: Number,
      validate: function (value) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "tasks",
    select: "-__v -id -createdAt -updateAt",
  });

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Hash the plain text password before using
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Delete user tasks when user it removed
userSchema.pre("deleteOne", { document: true }, async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
