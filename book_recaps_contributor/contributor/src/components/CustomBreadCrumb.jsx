import { BreadCrumb } from "primereact/breadcrumb";
import { Link } from "react-router-dom";
import { routes } from "../routes";

const CustomBreadCrumb = ({ items }) => {
  const itemLinks = items.map((item) => {
    return {
      label: item.label,
      template: item.path ?
        <Link to={item.path} className="hover:underline hover:text-blue-500">{item.label}</Link> : item.label
    };
  });

  const home = { template: <Link to={routes.dashboard} className="hover:underline hover:text-blue-500">Home</Link> };

  return (
    <div className="py-4">
      <BreadCrumb model={itemLinks} home={home} className="p-0 border-0 bg-inherit text-gray-500 italic"/>
    </div>
  )
}

export default CustomBreadCrumb;