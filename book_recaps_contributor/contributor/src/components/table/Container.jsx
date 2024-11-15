import Show from "../Show";

const Container = ({ children, title }) => (
  <>
    <Show when={title}>
      <h1 className="mt-4 mb-6 text-xl font-semibold">{title}</h1>
    </Show>
    <div className="flex flex-col border border-gray-200 rounded overflow-x-auto shadow-sm">
      <table className="min-w-full table-fixed">
        {children}
      </table>
    </div>
  </>
);

export default Container;