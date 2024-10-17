import Mongoose from "mongoose"

const UserSchema = new Mongoose.Schema({
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: true,
    },
    websites: [{
      domain: {
        type: String,
        required: true
      },
      category: {
        type: String,
        enum: ['distracting', 'non-distracting'],
        required: true
      }
    }],
    websiteHistory: [{
      date: {
        type: Date,
        required: true
      },
      websites: [{
        url: {
          type: String,
          required: true
        },
        category: {
          type: String,
          enum: ['distracting', 'non-distracting'],
          required: true
        },
        timeSpentInSeconds: {
          type: Number,
          default: 0
        }
      }]
    }]
  },);

export default Mongoose.model('User', UserSchema);
