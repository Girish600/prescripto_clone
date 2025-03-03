import mongoose  from "mongoose";

const connectToDb= async()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/Docscribe`);
        console.log('DB connected successfully');
    } catch (error) {
        console.log(error,'error while connecting DB');
    }
}

export default connectToDb