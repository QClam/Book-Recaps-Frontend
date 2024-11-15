import { cn } from "../../utils/cn";

const Row = ({ children, className = "" }) => (
  <tr className={cn("hover:bg-gray-100 odd:bg-white even:bg-gray-50 text-[#333c48]", className)}>
    {children}
  </tr>
);

export default Row;