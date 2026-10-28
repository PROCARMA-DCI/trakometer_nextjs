"use client";
import { useNguage } from "./useNguage";

const Page = () => {
  const { chatData } = useNguage();
  console.log({ chatData });
  return <div></div>;
};

export default Page;
