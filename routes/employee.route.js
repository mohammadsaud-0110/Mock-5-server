const express = require('express');

const {EmployeeModel} = require('../models/emplyoee.model');

const empRoute = express.Router();
empRoute.use(express.json());

// add new Employee Details
empRoute.post('/addEmployee', async(req,res)=>{
    const {firstName, lastName, email, department, salary} = req.body;
    try {
        const emp = await EmployeeModel.findOne({email})
        if(emp){
            res.status(200).send({"msg":"Employee details already present!"})
        }
        else{
            const newEmp = new EmployeeModel({firstName, lastName, email, department, salary});
            await newEmp.save();
            res.status(201).send({"msg":"Employee Details Added Successfully!"})
        }
    } 
    catch (error) {
        res.status(500).send({"msg":"Something went wrong!","Error":error})
    }
})

// GET all Employee Details + pagination
empRoute.get('/', async (req,res)=>{
    try {
        const limit = 5;
        const page = parseInt(req.query.page) || 1;
        const skipData = (page - 1) * limit;

        //filter + sort
        if(req.query.sortBy && req.query.filter){
            const {Order,filter} = req.query;
            if(Order == "asc"){
                const data = await EmployeeModel.aggregate([{ $match: {department : filter}},
                                                            { $sort: {salary:1}},
                                                            { $skip: skipData},
                                                            { $limit: limit}
                                                        ]);

                const pageData = await EmployeeModel.aggregate([{ $match: {department : filter}},
                    { $sort: {salary:1}}
                ]);


                const pages = Math.ceil(pageData.length/limit);
                res.send({"error" : false, "message" : data, pages})
            }
            else if(Order == "desc"){
                const data = await EmployeeModel.aggregate([{ $match: {department : filter}}, { $sort: {salary:-1}},
                                                            { $skip: skipData},{ $limit: limit} ]);
                
                const pageData = await EmployeeModel.aggregate([{ $match: {department : filter}}, { $sort: {salary:-1}}]);
                const pages = Math.ceil(pageData.length/limit);
                res.send({"error" : false, "message" : data, pages})
            }
        }

        //filter
        else if(!req.query.sortBy && req.query.filter){
            const option = req.query.filter;
            const data = await EmployeeModel.aggregate([{ $match: {department : option}},
                                                        { $skip: skipData},
                                                        { $limit: limit}
                                                    ]);
            
            const pageData = await EmployeeModel.aggregate([{ $match: {department : option}}]);
            const pages = Math.ceil(pageData.length/limit);
            res.send({"error" : false, "message" : data, pages});
        }

        //sort
        else if(req.query.sortBy && !req.query.filter){
            const order = req.query.Order;
            if(order == "asc"){
                const data = await EmployeeModel.aggregate( [ { $sort: { salary : 1 } },
                                                              { $skip: skipData},
                                                              { $limit: limit} 
                                                            ] );
                

                const pageData = await EmployeeModel.aggregate([{ $sort: { salary : 1 } }]);
                const pages = Math.ceil(pageData.length/limit);
                res.send({"error" : false, "message" : data, pages});
            }
            else if(order == "desc"){
                const data = await EmployeeModel.aggregate( [ { $sort: { salary : -1 } },
                                                              { $skip: skipData},
                                                              { $limit: limit} 
                                                            ] );
                const pageData = await EmployeeModel.aggregate([{ $sort: { salary : -1 } }]);
                const pages = Math.ceil(pageData.length/limit);
                res.send({"error" : false, "message" : data, pages});
            }
        }

        //search by name
        else if(req.query.firstName){
            const data = await EmployeeModel.find({firstName: { $regex: req.query.firstName, $options: 'i'}});
            const pages = Math.ceil(data.length / limit)
            res.send({"error" : false, "message" : data, pages});
        }
        
        else{
            const data = await EmployeeModel.aggregate([{ $skip: skipData},
                                                        { $limit: limit}
                                                       ]);
            const pageData = await EmployeeModel.countDocuments();
            const pages = Math.ceil(pageData / limit)
            res.send({"error" : false, "message" : data, pages});
        }
    } 
    catch (error) {
        res.status(500).send({"msg":"Something went wrong!","error":error.message});
    }
})

//UPDATE Employee details by ID
empRoute.patch('/:id', async(req,res) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        await EmployeeModel.findByIdAndUpdate(id, payload);
        res.status(200).send({"msg":"Employee details updated"});
    } 
    catch (error) {
        res.status(500).send({"msg":"Something went wrong!","error":error.message});
    }
})

// DELETE Employee details by ID
empRoute.delete("/:id", async (req,res) => {
    try {
        const id = req.params.id;
        await EmployeeModel.findByIdAndDelete(id)
        res.status(200).send({"msg":"Employee details deleted"});
    } 
    catch (error) {
        res.status(500).send({"msg":"Something went wrong!","error":error.message});
    }
})

module.exports={
    empRoute
}