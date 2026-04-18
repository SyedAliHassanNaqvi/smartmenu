import { read } from "fs";
import mongoose from "mongoose";

type ConnectionObject={
  isConnected?:number

}
const connection:ConnectionObject={} // to track the connection status and its datatype is ConnectionObject which is optional 
async function dbConnect():Promise<void>{
  if(connection.isConnected){
    console.log("Already connected to database");
    return;
  }
  try{
    const db=await mongoose.connect(process.env.MONGODB_URI || '',{})
    connection.isConnected= db.connections[0].readyState
    console.log("Connected to database successfully");

  }
  catch(error){
    console.log("Error connecting to database",error);
    process.exit(1);
  }
}
export default dbConnect;