// https://geedew.com/basic-interfaces-in-nodejs/

class IRepository {
    constructor() {
        if (this.constructor === IRepository) {
            throw new Error("Abstract classes can't be instantiated.");
        };
        if (!this.connect) {
            throw new Error("Method 'connect()' must be implemented.");
        };
        if (!this.findOne) {
            throw new Error("Method 'findOne()' must be implemented.");
        };
        if (!this.insertOne) {
            throw new Error("Method 'insertOne()' must be implemented.");
        };
    }
}

module.exports = IRepository;