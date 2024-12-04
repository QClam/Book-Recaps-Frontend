import { cn } from "../../utils/cn";

const Wrapper = ({ children, className }) => {
  return (
    <div
      className={cn("bg-white shadow-md min-w-fit min-h-[100px] rounded-md flex flex-col w-full max-w-96 mx-auto", className)}
    >
      {children}
    </div>
  );
}

export default Wrapper;