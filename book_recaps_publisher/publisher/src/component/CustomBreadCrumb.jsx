import { BreadCrumb } from "primereact/breadcrumb";
import { Link } from "react-router-dom";
import { routes } from "../routes";

const CustomBreadCrumb = ({ items }) => {
  const itemLinks = items.map((item) => {
    return {
      label: item.label,
      template: item.path ?
        <Link to={item.path}
              className="truncate block max-w-48 hover:underline hover:text-blue-500">{item.label}</Link> : item.label
    };
  });

  const home = { template: <Link to={routes.index} className="hover:underline hover:text-blue-500">Home</Link> };

  return (
    <div>
      <BreadCrumb model={itemLinks} home={home} className="p-0 border-0 bg-inherit text-gray-500 italic font-semibold"/>
    </div>
  )
}

export default CustomBreadCrumb;