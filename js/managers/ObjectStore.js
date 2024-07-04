export class ObjectStore {
    constructor() {
        this.map = new Map();  // For quick lookup by unique identifier
        this.array = [];       // For maintaining order
    }

    // Add an object to the store
    add(obj) {
        if (obj.uID === undefined) {
            throw new Error('Object must have a unique id property');
        }
        if (this.map.has(obj.uID)) {
            throw new Error('Object with this id already exists');
        }
        this.map.set(obj.uID, obj);
        this.array.push(obj);

        return obj.uID;
    }

    // Remove an object by its unique identifier
    remove(uID) {
        if (!this.map.has(uID)) {
            throw new Error('Object with this id does not exist');
        }
        const obj = this.map.get(uID);
        this.map.delete(uID);
        this.array = this.array.filter(item => item.uID !== uID);

        return obj;
    }

    // Get an object by its unique identifier
    get(uID) {
        return this.map.get(uID);
    }

    // Update the order of objects (example: sort by a property)
    sortBy(property) {
        this.array.sort((a, b) => (a[property] > b[property] ? 1 : -1));
    }

    // Get all objects in their current order
    getAll() {
        return this.array;
    }
}