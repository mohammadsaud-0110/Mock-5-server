const mongoose = require('mongoose');

const empSchema=mongoose.Schema({
    firstName : String,
    lastName : String,
    email : String,
    department : String,
    salary : Number
})

const EmployeeModel =new mongoose.model('employee',empSchema)

module.exports={
    EmployeeModel
}