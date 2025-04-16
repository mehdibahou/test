import { NextResponse } from 'next/server';
import { Performance } from '../models/performance'; // Adjust the import path as necessary
import { Horse } from '../models/horse'; // Assuming the Horse model exists
import mongoose from 'mongoose';


export async function performanceHandler(req) {
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const {
        horseId, // Horse's ObjectId or name (for lookup)
        date,
        competition,
        height,
        result,
        rider,
      } = body;
      console.log(body);

      // If horseId is a name, look it up by name first
      let horse = null;
      if (!horseId.match(/^[0-9a-fA-F]{24}$/)) {
        horse = await Horse.findOne({ name: horseId });
        if (!horse) {
          return NextResponse.json({ success: false, error: 'Horse not found' }, { status: 404 });
        }
      } else {
        horse = await Horse.findById(horseId);
        if (!horse) {
          return NextResponse.json({ success: false, error: 'Horse not found' }, { status: 404 });
        }
      }

      // Create the performance entry
      const newPerformance = new Performance({
        horse: horse._id, // Use the horse's ObjectId
        date,
        competition,
        height,
        result,
        rider,
      });

      await newPerformance.save();

      return NextResponse.json({ success: true, data: newPerformance }, { status: 201 });
    } catch (error) {
      console.error('Error creating performance:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  } else {
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }
}
export async function getPerformances(req) {
  try {
    console.log('=== Starting getPerformances ===');
    console.log('Request URL:', req.url);
    
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const horseId = searchParams.get('horseId');
    const horseQuery = searchParams.get('horseQuery');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Query Parameters:', {
      horseId,
      horseQuery,
      startDate,
      endDate
    });

    // Initialize query object
    let query = {};
    console.log('Initial Query:', query);

    // Handle horse filtering
    if (horseId || horseQuery) {
      console.log('Processing horse filter');
      
      if (horseId) {
        console.log('Using horseId:', horseId);
        // If horseId is provided, use direct matching
        // if (!mongoose.Types.ObjectId.isValid(horseId)) {
        //   console.log('Invalid horseId format');
        //   return NextResponse.json(
        //     { success: false, error: 'Invalid horse ID format' },
        //     { status: 400 }
        //   );
        // }
        query.horse = new mongoose.Types.ObjectId(horseId);
        console.log('Query after adding horseId:', query);
      } else if (horseQuery) {
        console.log('Using horseQuery:', horseQuery);
        // If horseQuery is provided, search by name or matricule
        try {
          const searchRegex = new RegExp(horseQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
          console.log('Search regex:', searchRegex);

          // First find matching horses
          console.log('Finding matching horses...');
          const matchingHorses = await Horse.find({
            $or: [
              { name: searchRegex },
              { matricule: searchRegex }
            ]
          }).select('_id');

          console.log('Matching horses found:', matchingHorses);

          if (matchingHorses.length === 0) {
            console.log('No matching horses found');
            return NextResponse.json({
              success: true,
              data: [],
              message: 'No performances found for the specified horse'
            });
          }

          // Add horse ids to query
          query.horse = {
            $in: matchingHorses.map(h => h._id)
          };
          console.log('Query after adding matching horses:', query);
        } catch (regexError) {
          console.error('Error in horse search:', regexError);
          throw new Error('Invalid search pattern');
        }
      }
    }

    // Add date range filters if provided
    if (startDate || endDate) {
      console.log('Processing date filters');
      query.date = {};
      
      if (startDate) {
        console.log('Processing start date:', startDate);
        const startDateObj = new Date(startDate);
        if (isNaN(startDateObj.getTime())) {
          console.log('Invalid start date format');
          return NextResponse.json(
            { success: false, error: 'Invalid start date format' },
            { status: 400 }
          );
        }
        query.date.$gte = startDateObj;
        console.log('Query after adding start date:', query);
      }

      if (endDate) {
        console.log('Processing end date:', endDate);
        const endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) {
          console.log('Invalid end date format');
          return NextResponse.json(
            { success: false, error: 'Invalid end date format' },
            { status: 400 }
          );
        }
        query.date.$lte = endDateObj;
        console.log('Query after adding end date:', query);
      }
    }

    console.log('Final query before execution:', JSON.stringify(query, null, 2));

    // Execute query with population and sorting
    console.log('Executing main query...');
    const performances = await Performance.find(query)
      .populate('horse', 'name matricule')
      .sort({ date: -1 })
      .lean()
      .exec();

    console.log(`Found ${performances.length} performances`);
    console.log('Sample performance (first result):', 
      performances.length > 0 ? JSON.stringify(performances[0], null, 2) : 'No results');

    // Handle no results case
    if (performances.length === 0) {
      console.log('No performances found');
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No performances found for the specified criteria',
        filters: {
          horse: horseId || horseQuery || null,
          dateRange: {
            start: startDate || null,
            end: endDate || null
          }
        }
      });
    }

    console.log('Preparing successful response');
    return NextResponse.json({
      success: true,
      data: performances,
      count: performances.length,
      filters: {
        horse: horseId || horseQuery || null,
        dateRange: {
          start: startDate || null,
          end: endDate || null
        }
      }
    });

  } catch (error) {
    console.error('=== Error in getPerformances ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Determine if it's a MongoDB connection error
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      console.error('MongoDB connection error detected');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection error',
          details: error.message 
        },
        { status: 503 }
      );
    }

    // Return generic error response
    console.error('Generic error detected');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch performances',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    console.log('=== Finished getPerformances ===');
  }
}