import { CgClose } from "react-icons/cg";
import Show from "../Show";
import { cn } from "../../utils/cn";

const Header = ({ title, onClose, headerTabs = null, headerTabSelected = null }) => {
  return (
    <div className="py-3.5 px-5 rounded-t-md border-b border-gray-300 text-gray-600 bg-gray-50">
      <div className="flex justify-between items-center flex-wrap font-semibold text-lg">
        {title}
        <button
          onClick={onClose}
          className="text-xl hover:text-indigo-700"
        >
          <CgClose/>
        </button>
      </div>

      <Show when={headerTabs && headerTabSelected}>
        <div className="flex mt-1 -mb-[13px]">
          {headerTabs?.map((tab, idx) => (
            <button
              key={idx}
              onClick={tab.onClick || (() => {
              })}
              className={cn("text-gray-600 hover:text-[#00a8ff] p-0 h-8 mr-4 transition-colors flex justify-center items-center", {
                "font-semibold border-b-[3px] border-[#00a8ff] text-[#00a8ff]": tab.stateName === headerTabSelected,
              })}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Show>
    </div>
  );
}

export default Header;