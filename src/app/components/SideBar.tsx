"use client";
import { useAppSelector } from "@/redux/hooks";
import { AudioLines, LogOut } from "lucide-react";
import Link from "next/link";
import React from "react";

function SideBar() {
  const { isAuth, deviceType } = useAppSelector((state) => state.global);

  if (isAuth)
    return (
      <div
        className={`${
          deviceType === "desktop" ? "h-screen w-24" : "w-screen h-[80px]"
        } bg-[#1b1b1b]/50 backdrop-blur-md flex flex-row lg:flex-col gap-5 p-5 top-0 left-0 lg:rounded-r-3xl shadow-2xl items-center justify-between`}
      >
        <div className="flex flex-col justify-center items-center">
          <span className="text-red-600">
            <AudioLines />
          </span>
          <span className="text-white font-black text-xl">MIP</span>
        </div>
        <Link
          href={"/login"}
          className="bg-red-600/50 p-2 rounded-md cursor-pointer hover:scale-105 duration-200"
        >
          <LogOut className="text-white rotate-180" />
        </Link>
      </div>
    );
}

export default SideBar;
