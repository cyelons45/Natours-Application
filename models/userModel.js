const crypto = require('crypto');
var mongoose = require('mongoose');
var validator = require('validator');
var slugify = require('slugify');
var bcrypt = require('bcryptjs');
// CREATE MONGOOSE SCHEMA AND MODEL
var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    active: {
      type: Boolean,
      default: true,
    },
    bookedTours: [String],
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please provide a password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same',
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  }
  //   {
  //     toJSON: {virtuals: true},
  //     toObject: {virtuals: true},
  //   }
);

//DOCUMENT MIDDLEWARE:runs before the .save() and .create()
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // If the pw has been modified, then encrypt it again
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({active: {$ne: false}});
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimestamp > JWTTimestamp;
  }
  return false;
};

userSchema.methods.getBookedTours = function (tourID) {
  this.bookedTours.push(tourID);
};
userSchema.methods.cancelBookedTours = function (tourID) {
  let res = this.bookedTours.findIndex((el) => {
    if (el === tourID) return el;
  });
  this.bookedTours.splice(res, 1);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

////////////////////////////////////////////////////////////////////////////////////////////////

// tourSchema.post('save', function (doc, next) {
//   console.log(docthis.);
//   next();
// });
// :{
//   type:String
// },
// passwordResetExpires:{
//   type:Date
// }
// //QUERY MIDDLEWARE
// tourSchema.pre (/^find/, function (next) {
//   this.find ({secretTour: {$ne: true}});
//   next ();
// });

// //AGGREGATE MIDDLEWARE
// tourSchema.pre ('aggregate', function (next) {
//   this.pipeline ().unshift ({$match: {secretTour: {$ne: true}}});
//   next ();
// });

// const testTour = new Tour({
//   name: 'The Park Camper',
//   rating: 3.2,
//   price: 300,
// });
// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log(err));
