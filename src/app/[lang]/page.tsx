import { redirect } from "next/navigation";

const page = () => {
  return redirect("/dashboard/home");
};

export default page;
