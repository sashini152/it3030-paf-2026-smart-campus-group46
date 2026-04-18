use smartcampus;
db.app_users.updateOne(
  {email: 'sashini.unilocatelk@gmail.com'}, 
  {$set: {role: 'SUPER_ADMIN'}}
);
print("Role updated successfully");
