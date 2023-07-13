const express = require("express");
const { connection } = require('./config/db');
const { userRouter } = require("./routes/user.route");
require('dotenv').config();
const cors = require('cors');
const { empRoute } = require("./routes/employee.route");
const { authenticate } = require("./middleware/auth.middleware");
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req,res) => {
    res.send("home page");
})

app.use("/user", userRouter);

app.use(authenticate);
app.use("/employee", empRoute);

app.listen(process.env.PORT, async ()=>{
    try {
        await connection.then(() => {
            console.log(`successfully connected`);
          }).catch((e) => {
            console.log(`not connected`);
          });
        console.log("Server :",process.env.PORT);   
    } catch (error) {
        console.log("Error:",error.message);
    }
})