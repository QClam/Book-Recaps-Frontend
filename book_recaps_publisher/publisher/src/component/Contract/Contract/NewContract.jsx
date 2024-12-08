import { useEffect, useState } from 'react';
import { generatePath, Link } from 'react-router-dom';
import "../ContractManager/ContractManager.scss";
import { axiosInstance2 } from "../../../utils/axios";
import { useAuth } from "../../../contexts/Auth";
import { handleFetchError } from "../../../utils/handleFetchError";
import Table from "../../table";
import { routes } from "../../../routes";
import { cn } from "../../../utils/cn";
import { TbEye } from "react-icons/tb";
import { Tooltip } from 'primereact/tooltip';
import CustomBreadCrumb from "../../CustomBreadCrumb";
import Select from "../../form/Select";

const Contracts = () => {
  const { user } = useAuth();

  const [ contracts, setContracts ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);
  const [ controller, setController ] = useState(null);
  const [ statusFilter, setStatusFilter ] = useState('All');

  useEffect(() => {
    const getContracts = async () => {
      const newController = new AbortController();
      if (controller) controller.abort();

      setController(newController);

      try {
        const response = await axiosInstance2.get('/contracts/by-publisher/' + user.publisherData?.id, {
          signal: controller
        });
        setContracts(response.data);
      } catch (error) {
        const err = handleFetchError(error);
        console.log("err", err);
        setError(err.error);
      }
      setController(null);
      setLoading(false);
    };

    getContracts();
    return () => controller?.abort();
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return "Bản nháp";
      case 1:
        return "Đang xử lý";
      case 2:
        return "Chưa bắt đầu";
      case 3:
        return "Đã kích hoạt";
      case 4:
        return "Hết hạn";
      case 5:
        return "Từ chối";
      default:
        return "Unknown";
    }
  };

  // Filter contracts based on selected status
  const filteredContracts = statusFilter === 'All' ? contracts : contracts.filter(contract => getStatusLabel(contract.status) === statusFilter);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <CustomBreadCrumb items={[ { label: "Contracts" } ]}/>

      <div className="flex justify-between items-end gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Danh sách hợp đồng hiện có
        </h2>

        <Select
          id="status"
          name="status"
          options={[
            { value: "All", label: "Tất cả" },
            { value: "Bản nháp", label: "Bản nháp" },
            { value: "Đang xử lý", label: "Đang xử lý" },
            { value: "Chưa bắt đầu", label: "Chưa bắt đầu" },
            { value: "Đang kích hoạt", label: "Đang kích hoạt" },
            { value: "Hết hạn", label: "Hết hạn" },
            { value: "Từ chối", label: "Từ chối" },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      <Table.Container>
        <Table.Head columns={[
          'ID',
          'Tỷ lệ doanh thu',
          'Bắt Đầu',
          'Kết Thúc',
          'Trạng Thái',
          'Số Lượng Sách',
          'Ngày Tạo',
          ''
        ]}/>
        <Table.Body
          when={filteredContracts && filteredContracts.length > 0 && !loading}
          fallback={
            <tr>
              <td className="h-32 text-center" colSpan="100">
                <div className="flex gap-2 justify-center items-center">
                  <p>No contract found</p>
                </div>
              </td>
            </tr>
          }>
          {filteredContracts.map((contract) => (
            <Table.Row key={contract.id}>
              <Table.Cell isFirstCell={true}>
                <Link
                  to={generatePath(routes.contractDetails, { id: contract.id })}
                  className="max-w-sm line-clamp-1 hover:underline text-blue-600"
                  title={contract.id}
                >
                  {contract.id}
                </Link>
              </Table.Cell>
              <Table.Cell>
                <Tooltip target=".tooltipppp" mouseTrack mouseTrackLeft={5} position="left" className="max-w-96"/>
                <p
                  className="tooltipppp font-semibold text-blue-600 cursor-help"
                  data-pr-tooltip={"Bạn sẽ nhận được " + Number(contract.revenueSharePercentage).toFixed(1).replace(/(\.0)$/, '') + "% doanh thu mà platform có được từ mỗi lượt xem premium từ các bài viết tóm tắt cho sách này."}
                >
                  {Number(contract.revenueSharePercentage).toFixed(1).replace(/(\.0)$/, '')}%
                </p>
              </Table.Cell>
              <Table.Cell>
                {contract.startDate ? new Date(contract.startDate + "Z").toLocaleDateString() : 'N/A'}
              </Table.Cell>
              <Table.Cell>
                {contract.endDate ? new Date(contract.endDate + "Z").toLocaleDateString() : 'N/A'}
              </Table.Cell>
              <Table.Cell>
                <p className={cn("rounded-full w-max px-2 py-1 text-white text-sm font-semibold text-center", {
                  "bg-gray-400": contract.status === 0,
                  "bg-yellow-400": contract.status === 1,
                  "bg-blue-400": contract.status === 2,
                  "bg-green-400": contract.status === 3,
                  "bg-red-400": contract.status === 4,
                  "bg-red-600": contract.status === 5,
                })}>
                  {getStatusLabel(contract.status)}
                </p>
              </Table.Cell>
              <Table.Cell>
                {contract.bookCount} sách
              </Table.Cell>
              <Table.Cell>
                {new Date(contract.createdAt + "Z").toLocaleDateString()}
              </Table.Cell>
              <Table.Cell>
                <Link
                  to={generatePath(routes.contractDetails, { id: contract.id })}
                  className="block w-fit border rounded p-1 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-progress"
                  title="View details"
                >
                  <span className="text-lg"><TbEye/></span>
                </Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
    </>
  );
};

export default Contracts;
