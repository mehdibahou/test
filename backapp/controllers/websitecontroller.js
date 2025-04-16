import Website from "@/models/siteweb"; // Adjust the path as needed

// Controller to save website states
export default async function Savewebsite(req, res) {
  try {
    // Ensure the request method is POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
    }

    // Parse the request body
    let { header, hero, footer, product } = await req.json();
    hero = { ...hero.hero,color:hero.color  };
    // console.log(hero, "hero");

    // Check if a website document already exists, if yes, update it; if no, create a new one
    let website = await Website.findOne();

console.log(hero, "hero");
console.log(website.hero, "website.hero");
    if (website) {
      // Update existing document
      website.header = header;
      website.hero = hero;
      website.footer = footer;
      website.product = product;
    } else {
      // Create a new document
      website = new Website({ header, hero, footer, product });
    }

    // Save the website document to the database
    await website.save();

    // Send a success response
    return new Response(JSON.stringify({ message: 'Website states saved successfully!', website }), { status: 200 });
  } catch (error) {
    console.error('Error saving website states:', error);
    // Send an error response
    return new Response(JSON.stringify({ message: 'Error saving website states', error }), { status: 500 });
  }
}




export  async function getwebsite(req) {
  try {
    if (req.method === 'GET') {
      const website = await Website.find();

      // Return the products as a JSON response
      return new Response(JSON.stringify(website), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error fetching website:', error);

    // Return an error response
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
