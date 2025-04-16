// /scripts/seed.js
async function seedDatabase() {
    try {
      const response = await fetch('http://localhost:3000/api/seed', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed database');
      }
      
      console.log('Seeding successful:', data);
    } catch (error) {
      console.error('Seeding failed:', error);
    }
  }
  
  // Run the seeder
  seedDatabase();