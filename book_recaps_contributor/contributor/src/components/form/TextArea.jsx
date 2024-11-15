import Show from "../Show";
import { cn } from "../../utils/cn";
import { splitProps } from "../../utils/splitProps";

const TextArea = (props) => {
  const [ local, rest ] = splitProps(props, [
    "id",
    "label",
    "className",
    "inputClassName",
    "error",
    "cols",
    "rows"
  ]);

  return (
    <div className={cn("", local.className)}>
      <Show when={local.label}>
        <label htmlFor={local.id} className="block font-medium leading-6 text-gray-900">{local.label}</label>
      </Show>
      <textarea
        {...rest}
        id={local.id}
        cols={local.cols}
        rows={local.rows}
        className={cn({
          "ring-1 ring-orange-600 focus:outline-none": local.error,
          "border border-gray-300 py-2 px-2 rounded placeholder-gray-500": true,
          "w-full": !local.cols,
          [local.inputClassName]: local.inputClassName
        })}
      />
      <Show when={local.error}>
        <p className="text-sm text-red-500">{local.error}</p>
      </Show>
    </div>
  );
}

export default TextArea;