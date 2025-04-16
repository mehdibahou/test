import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

function UnauthenticatedError(message) {
  return NextResponse.json({ message }, { status: StatusCodes.UNAUTHORIZED });
}

export default UnauthenticatedError;
