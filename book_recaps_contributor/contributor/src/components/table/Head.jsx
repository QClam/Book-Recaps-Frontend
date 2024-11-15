import Cell from "./Cell";

const Head = ({ columns }) => (
  <thead className="bg-[#f8fafc] text-left">
  <tr>
    {columns.map((column, index) => (
      <Cell
        key={index}
        isHeader={true}
        isFirstCell={index === 0}
      >
        {column}
      </Cell>
    ))}
  </tr>
  </thead>
);

export default Head;