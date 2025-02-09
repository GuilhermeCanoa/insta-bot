const mongoose = require('mongoose');
const IRepository = require('../interface'); // fazer depois a interface

class mongooseClass {
  constructor(collectionName, mongoURI) {
    // super();
    this.collectionName = collectionName;
    this.mongoURI = mongoURI;
    // this.connect = connect;
    // this.findOne = findOne;
    // this.insertOne = insertOne;
  }

//   get connect () {
//     return this.connect;
//   }

  connect = async () => {
    try {
      await mongoose.connect(this.mongoURI);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
    }
  };
  
  findOne = async (query) => {
    try {
      const result = await mongoose.connection.db.collection(this.collectionName).findOne(query);
      console.log('Found document:', result);
    } catch (err) {
      console.error('Error finding document:', err);
    }
  };
  
  insertOne = async (data) => {
    try {
      const result = await mongoose.connection.db.collection(this.collectionName).insertOne(data);
      console.log('Inserted document:', result);
    } catch (err) {
      console.error('Error inserting document:', err);
    }
  };
}



module.exports = mongooseClass;