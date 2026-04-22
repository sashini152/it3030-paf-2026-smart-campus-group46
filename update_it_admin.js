const { MongoClient } = require('mongodb');

async function updateITUserToAdmin() {
  const uri = 'mongodb://localhost:27017/smartcampus';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('smartcampus');
    const collection = database.collection('app_users');

    // Update the user role from USER to ADMIN
    const result = await collection.updateOne(
      { email: 'it23220492@my.sliit.lk' },
      { $set: { role: 'ADMIN' } }
    );

    if (result.matchedCount > 0) {
      console.log(`Successfully updated ${result.modifiedCount} document(s)`);
      
      // Verify the update
      const updatedUser = await collection.findOne({ email: 'it23220492@my.sliit.lk' });
      console.log('Updated user:', {
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        studentId: updatedUser.studentId
      });
    } else {
      console.log('No user found with that email');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateITUserToAdmin();
