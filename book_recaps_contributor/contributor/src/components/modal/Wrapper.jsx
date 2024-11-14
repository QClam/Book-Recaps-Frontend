import { cn } from "../../utils/cn";

const Wrapper = ({ children, width, className }) => {
  return (
    <div
      className={cn("bg-white shadow-md min-w-fit min-h-[100px] rounded-md flex flex-col", className)}
      style={{ width: width ?? "600px" }}
    >
      {children}
    </div>
  );
}

export default Wrapper;