import { CgClose } from "react-icons/cg";

const Header = ({ title, onClose }) => {
  return (
    <div className="py-3.5 px-5 rounded-t-md border-b border-gray-300 text-gray-600 bg-gray-50">
      <div className="flex justify-between items-center flex-wrap font-semibold">
        {title}
        <button
          onClick={onClose}
          className="text-xl hover:text-indigo-700"
        >
          <CgClose/>
        </button>
      </div>
    </div>
  );
}

export default Header;