import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

function BadRequestError(message) {
  return NextResponse.json(
    { error: message },
    { status: StatusCodes.BAD_REQUEST }
  );
}

export default BadRequestError;
