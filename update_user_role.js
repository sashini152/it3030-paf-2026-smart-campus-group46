const { MongoClient } = require('mongodb');

async function updateUserRole() {
  const uri = 'mongodb://localhost:27017/smartcampus';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('smartcampus');
    const collection = database.collection('app_users');

    // Update the user role from ADMIN to SUPER_ADMIN
    const result = await collection.updateOne(
      { email: 'sashini.unilocatelk@gmail.com' },
      { $set: { role: 'SUPER_ADMIN' } }
    );

    if (result.matchedCount > 0) {
      console.log(`Successfully updated ${result.modifiedCount} document(s)`);
      
      // Verify the update
      const updatedUser = await collection.findOne({ email: 'sashini.unilocatelk@gmail.com' });
      console.log('Updated user:', {
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name
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

updateUserRole();
