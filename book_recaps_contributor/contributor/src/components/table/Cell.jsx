import { cn } from "../../utils/cn";

const Cell = ({ children, isFirstCell = false, isHeader = false, className = "", colSpan = 1 }) => {
  const baseClass = "px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]";
  const dataClass = "px-2.5 py-3 border-[#e2e7ee] border-b";
  const firstCellClass = "pl-[18px]";
  const borderLeftClass = "[border-left:1px_dashed_#d5dce6]";

  return isHeader ? (
    <th scope='col' className={cn(baseClass, isFirstCell ? firstCellClass : borderLeftClass, className)}
        colSpan={colSpan}>
      {children}
    </th>
  ) : (
    <td className={cn(dataClass, isFirstCell ? firstCellClass : borderLeftClass, className)} colSpan={colSpan}>
      {children}
    </td>
  );
};

export default Cell;