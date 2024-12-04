import { cn } from "../../utils/cn";

const Body = ({ children, className }) => {
  return (
    <div className={cn("flex-1 p-5", className)}>
      {children}
    </div>
  );
};

export default Body;
