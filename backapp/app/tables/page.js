
"use client";
import Tables from "./tables";
import Pop from "../caisse/popover"; 
import Tablecart from "./modal";
import { useState } from "react";
export default function Caisse() {
  const [open, setOpen] = useState(true)

  return (
   
    <>
  <Tables setIsModalOpen={setOpen}/>
  <Tablecart open={open} setopen={setOpen} />
      </>
  );
}
