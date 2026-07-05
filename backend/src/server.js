import 'dotenv/config';
// this should be at the top other wize it will not work
// now create a .env file in the root dir
import app from "./app.js";




app.get('/',(req,res)=>{
res.send("server Started")
})

  
const ServerPort = process.env.SERVERPORT
  
app.listen(ServerPort,()=>{
console.log(`server started at ${ServerPort}`);
});