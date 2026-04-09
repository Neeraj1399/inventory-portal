const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const requestSchema = new mongoose.Schema({
  category: String,
  status: String,
  priority: String,
  title: String
});

const Request = mongoose.model('Request', requestSchema);

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const total = await Request.countDocuments();
    console.log('Total Requests:', total);

    const nullCats = await Request.find({ 
      $or: [
        { category: null }, 
        { category: '' },
        { category: { $exists: false } }
      ] 
    });
    console.log('Requests with null/empty category:', nullCats.length);

    const distribution = await Request.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('Category distribution:', JSON.stringify(distribution, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
