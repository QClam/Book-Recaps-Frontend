import { cn } from "../../utils/cn";

const Footer = ({ children, className }) => {
  return (
    <div
      className={cn("rounded-b-md px-5 py-3.5 border-t border-gray-300 flex items-center justify-start bg-gray-50", className)}>
      {children}
    </div>
  );
};

export default Footer;
