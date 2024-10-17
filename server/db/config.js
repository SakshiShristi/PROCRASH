import Mongoose from 'mongoose'

const localDB = `mongodb://127.0.0.1:27017/procrash`
const connectDB = async () => {
  await Mongoose.connect(localDB)
  console.log("MongoDB Connected")
}

export default connectDB

