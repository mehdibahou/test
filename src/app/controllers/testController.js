import { NextResponse } from 'next/server';
import { Test } from '../models/test'; // Adjust the import path as needed
import { Horse } from '../models/horse'; // Assuming you have a Horse model

export async function createTestHandler(req) {
  if (req.method === 'POST') {
    try {
      const body = await req.json();

      const { horseId, type, date, anamnese, examenClinique, examensComplementaires, diagnostiques, traitements, pronostic, images, createdBy } = body;

      // Validate horse ID (must exist in the Horse collection)
      const horse = await Horse.findById(horseId);
      if (!horse) {
        return NextResponse.json({ success: false, error: 'Horse not found' }, { status: 404 });
      }

      // Create the new test record
      const newTest = new Test({
        horse: horseId,
        type,
        date,
        anamnese,
        examenClinique,
        examensComplementaires,
        diagnostiques,
        traitements,
        pronostic,
        images,
        createdBy,
      });

      // Save the new test to the database
      await newTest.save();

      return NextResponse.json({ success: true, data: newTest }, { status: 201 });
    } catch (error) {
      console.error('Error creating test:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  } else {
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }
}


export async function getTestHandler(req) {
  if (req.method === 'GET') {
    try {
      // Get query parameters
      const url = new URL(req.url);
      const horseId = url.searchParams.get('horseId');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const type = url.searchParams.get('type');

      // Build query object
      const query = {};

      // Add horse filter if provided
      if (horseId) {
        query.horse = horseId;
      }

      // Add date range filter if provided
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          query.date.$gte = new Date(startDate);
        }
        if (endDate) {
          query.date.$lte = new Date(endDate);
        }
      }

      // Add type filter if provided
      if (type) {
        query.type = type;
      }

      // Fetch tests with populated horse reference
      const tests = await Test.find(query)
        .populate('horse', 'name matricule') // Only populate name and matricule fields
        .sort({ date: -1 }) // Sort by date descending (most recent first)
        .lean(); // Convert to plain JavaScript objects

      return NextResponse.json({ 
        success: true, 
        data: tests 
      }, { 
        status: 200 
      });

    } catch (error) {
      console.error('Error fetching tests:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { 
        status: 500 
      });
    }
  } else {
    return NextResponse.json({ 
      success: false, 
      error: 'Method not allowed' 
    }, { 
      status: 405 
    });
  }
}

