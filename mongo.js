const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const dbName = process.env.MONGO_DATABASE;
const dbCollect = process.env.MONGO_COLLECTION;
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

module.exports.saveData = async (obj) => {
  try {
    await client.connect();
    const data = await client.db(dbName).collection(dbCollect).insertOne(obj);
    // client.close();
    return data;
  } catch (err) {
    console.log(err.stack);
  }
}

module.exports.updateData = async (filter = {}, obj = {}) => {
  try {
    await client.connect();
    const data = await client.db(dbName).collection(dbCollect).updateOne(filter, obj);
    // client.close();
    return data;
  } catch (err) {
    console.log(err.stack);
  }
}

module.exports.getData = async (filter = {}, only = {}) => {
  try {
    await client.connect();
    const data = await client.db(dbName).collection(dbCollect).find(filter).project(only).toArray();
    // client.close();
    return data
  } catch (err) {
    console.log(err.stack);
  }
}

module.exports.findData = async (filter = {}, only = {}) => {
  try {
    await client.connect();
    const data = await client.db(dbName).collection(dbCollect).find(filter).project(only).limit(1).toArray();
    // client.close();
    return data.length ? data[0] : null;
  } catch (err) {
    console.log(err.stack);
  }
}

module.exports.toObjectId = (s) => {
  if (!ObjectId.isValid(s)) {
    return null;
  }

  return new ObjectId(s);
}
