import { cn } from "../../utils/cn";

const Row = ({ children, className = "" }) => (
  <tr className={cn("hover:bg-gray-100 bg-white text-[#333c48]", className)}>
    {children}
  </tr>
);

export default Row;