import { useEffect, useRef, useState } from 'react';
import "../History/History.scss";
import { generatePath, Link } from 'react-router-dom';
import { axiosInstance } from "../../utils/axios";
import { useAuth } from "../../contexts/Auth";
import { routes } from "../../routes";
import ReactPaginate from "react-paginate";
import { Image } from "primereact/image";
import { FaClockRotateLeft } from "react-icons/fa6";
import { LuTimer } from "react-icons/lu";
import Show from "../Show";

const History = () => {
  const { user } = useAuth();

  const [ viewTrackings, setViewTrackings ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);
  const [ page, setPage ] = useState(1);
  const totalPages = useRef(0);

  useEffect(() => {
    fetchRecapData(page);
  }, [ page ]);

  const fetchRecapData = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/viewtracking/getviewtrackingbyuserid/${user.id}?pageNumber=${pageNumber}&pageSize=5`);
      const recaps = response.data.data.data.$values || [];

      totalPages.current = response.data.data?.totalPages;
      setViewTrackings(recaps);
    } catch (err) {
      console.error('Error fetching recap data:', err);
      setError('Failed to fetch recap data');
    }
    setLoading(false);
  };

  const handleChangePage = ({ selected }) => {
    setPage(selected + 1);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container mx-auto max-w-screen-xl p-5">
      <div className="history-container">
        <h1>Lịch sử xem bài viết</h1>
        <div className="history-list">
          {viewTrackings.map((view, index) => (
            <Link
              key={index}
              to={generatePath(routes.recapPlayer, { recapId: view.recapId })}
              className="history-card"
            >
              <div className="relative w-28">
                <Image
                  src={view.book.coverImage || "/empty-image.jpg"}
                  alt={view.book.title}
                  className="!block overflow-hidden rounded-md shadow-md w-full"
                  imageClassName="aspect-[3/4] object-cover w-full bg-white"
                />
              </div>

              <div className="flex-1">
                <p className="text-base mb-2 line-clamp-1 flex gap-2 items-center" title={view.recapName}>
                  <span>Bài viết: <strong>{view.recapName}</strong></span>
                  <Show when={view.isPremium}>
                    <span className="bg-yellow-400 text-xs rounded px-2 py-1">Premium</span>
                  </Show>
                </p>
                <div className="flex gap-2 items-center text-sm mb-2">
                  <div className="w-6 h-6">
                    <img
                      src={view.contributorImage?.replace("Files/Image/jpg/ad.jpg", "") || '/avatar-placeholder.png'}
                      alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
                  </div>
                  <p className="font-semibold line-clamp-1">{view.contributorName}</p>
                </div>

                <div className="flex gap-2 items-center text-sm text-gray-500 mb-2">
                  {/*<p className="flex items-center gap-2">*/}
                  {/*  <span className="bg-green-100 p-1 rounded"><RiEyeLine size={15}/></span>*/}
                  {/*  <span>{view.viewsCount || 0} Lượt xem</span>*/}
                  {/*</p>*/}
                  {/*<p>·</p>*/}
                  {/*<p className="flex items-center gap-2">*/}
                  {/*  <span className="bg-green-100 p-1 rounded"><RiThumbUpLine size={15}/></span>*/}
                  {/*  <span>{view.likesCount || 0} Lượt thích</span>*/}
                  {/*</p>*/}
                  {/*<p>·</p>*/}
                  <p className="flex items-center gap-2">
                    <span className="bg-green-100 p-1 rounded"><FaClockRotateLeft size={15}/></span>
                    <span>{new Date(view.createdAt + "Z").toLocaleString()}</span>
                  </p>
                  <p>·</p>
                  <p className="flex items-center gap-2">
                    <span className="bg-green-100 p-1 rounded"><LuTimer size={15}/></span>
                    <span>Đã xem {((view.durations || 0) / 60).toFixed(1)} phút</span>
                  </p>
                </div>

                <div className="border-t border-gray-300 my-2.5"></div>

                <div className="relative text-xs italic">
                  <p className="mb-1 line-clamp-2" title={view.book.originalTitle}>
                    Sách: <strong>{view.book.originalTitle} ({view.book.title})</strong>
                  </p>
                  <p className="line-clamp-1"
                     title={view.book.authors.$values.join(', ')}>
                    Tác giả: <strong>{view.book.authors.$values.join(', ')}</strong>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <ReactPaginate
          previousLabel="Trước"
          nextLabel="Sau"
          breakLabel="..."
          pageCount={totalPages.current}
          marginPagesDisplayed={1}
          pageRangeDisplayed={1}
          onPageChange={handleChangePage}
          containerClassName="pagination"
          activeClassName="active"
        />
      </div>
    </div>
  );
};

export default History;
