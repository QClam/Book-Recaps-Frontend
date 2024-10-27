import { splitProps } from "../../utils/splitProps";
import Show from "../Show";
import { cn } from "../../utils/cn";

const Select = (props) => {
  const [ local, rest ] = splitProps(props, [
    "id",
    "label",
    "className",
    "selectClassName",
    "placeholder",
    "options",
    "error"
  ]);

  return (
    <div className={cn("", local.className)}>
      <Show when={local.label}>
        <label htmlFor={local.id} className="block font-medium leading-6 text-gray-900">{local.label}</label>
      </Show>
      <select
        {...rest}
        id={local.id}
        className={cn({
          "ring-1 ring-orange-600 focus:outline-none": local.error,
          "w-full border border-gray-300 py-2 px-2 rounded placeholder-gray-500": true,
          [local.selectClassName]: local.selectClassName
        })}
      >
        <Show when={local.placeholder}>
          <option value="">{local.placeholder}</option>
        </Show>
        {local.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Show when={local.error}>
        <p className="text-sm text-red-500">{local.error}</p>
      </Show>
    </div>
  );
}

export default Select;