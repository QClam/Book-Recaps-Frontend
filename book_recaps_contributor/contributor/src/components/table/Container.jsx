import Show from "../Show";

const Container = ({ children, title, addButton }) => (
  <>
    <Show when={title}>
      <div className="mt-4 mb-6 flex justify-between gap-4 items-center">
        <h1 className="text-xl font-semibold">{title}</h1>

        <Show when={addButton}>
          {addButton}
        </Show>
      </div>
    </Show>
    <div className="flex flex-col border border-gray-200 rounded overflow-x-auto shadow-sm">
      <table className="min-w-full table-fixed">
        {children}
      </table>
    </div>
  </>
);

export default Container;