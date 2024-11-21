import React, { useEffect, useState } from 'react';
import "../Dashboard/PublisherDashboard.scss";

const PublisherDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [publisherData, setPublisherData] = useState(null);
    const [payoutData, setPayoutData] = useState(null);
    const [bookDetails, setBookDetails] = useState([]);
    const [detailedBooks, setDetailedBooks] = useState([]);
    const [latestPayout, setLatestPayout] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const accessToken = localStorage.getItem('authToken');
            try {
                // Fetch profile data
                const profileResponse = await fetch('https://160.25.80.100:7124/api/personal/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!profileResponse.ok) throw new Error("Failed to fetch profile data");

                const profileData = await profileResponse.json();
                const profileId = profileData?.id;
                if (!profileId) throw new Error("Profile ID not found");

                // Fetch publisher data
                const publisherResponse = await fetch(
                    `https://160.25.80.100:7124/api/publisher/getbypublisheruser/${profileId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (!publisherResponse.ok) throw new Error("Failed to fetch publisher data");

                const publisherData = await publisherResponse.json();
                const publisherId = publisherData?.id;
                if (!publisherId) throw new Error("Publisher ID not found");

                // Fetch payout list
                const payoutResponse = await fetch(
                    `https://160.25.80.100:7124/api/PublisherPayout/getlistpayoutinfobypublisherid/${publisherId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (!payoutResponse.ok) throw new Error("Failed to fetch payout data");

                const payoutData = await payoutResponse.json();
                const payouts = payoutData?.data?.$values || [];

                // Sort payouts and get the latest one
                const sortedPayouts = payouts.sort((a, b) =>
                    new Date(b.toDate) - new Date(a.toDate)
                );
                const latestPayout = sortedPayouts[0];

                // Fetch detailed payout info for books
                const bookDetailsPromises = payouts.map(async (payout) => {
                    const payoutDetailResponse = await fetch(
                        `https://160.25.80.100:7124/api/PublisherPayout/getpayoutinfobyid/${payout.id}`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    if (!payoutDetailResponse.ok) throw new Error("Failed to fetch payout detail data");

                    const payoutDetail = await payoutDetailResponse.json();
                    return payoutDetail?.data?.bookEarnings?.$values || [];
                });

                const allBooks = (await Promise.all(bookDetailsPromises)).flat();
                setBookDetails(allBooks);

                // Fetch detailed book info for each bookId
                const detailedBooksPromises = allBooks.map(async (book) => {
                    const bookResponse = await fetch(
                        `https://160.25.80.100:7124/api/book/getbookbyid/${book.bookId}`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    if (!bookResponse.ok) throw new Error(`Failed to fetch book details for ID: ${book.bookId}`);

                    const bookData = await bookResponse.json();
                    return { ...book, ...bookData.data };
                });

                const detailedBooks = await Promise.all(detailedBooksPromises);

                setProfile(profileData);
                setPublisherData(publisherData);
                setPayoutData(sortedPayouts);
                setLatestPayout(latestPayout);
                setDetailedBooks(detailedBooks);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="publisher-dashboard">
            <h2>Publisher Dashboard</h2>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            {latestPayout && (
                <div className="latest-payout">
                    <h3>Latest Payout</h3>
                    <p><strong>Amount:</strong> {latestPayout.amount}</p>
                    <p><strong>Status:</strong> {latestPayout.status === 1 ? 'Paid' : 'Pending'}</p>
                    <p><strong>To Date:</strong> {new Date(latestPayout.toDate).toLocaleDateString()}</p>
                </div>
            )}

            {detailedBooks.length > 0 && (
                <div className="book-details">
                    <h3>Books Associated with Payouts</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Book ID</th>
                                <th>Title</th>
                                <th>Cover Image</th>
                                <th>Earning Amount</th>
                                <th>From Date</th>
                                <th>To Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedBooks.map((book, index) => (
                                <tr key={index}>
                                    <td>{book.bookId}</td>
                                    <td>{book.title}</td>
                                    <td>
                                        <img
                                            src={book.coverImage}
                                            alt={book.title}
                                            style={{ width: '50px', height: 'auto' }}
                                        />
                                    </td>
                                    <td>{book.earningAmount}</td>
                                    <td>{new Date(book.fromDate).toLocaleDateString()}</td>
                                    <td>{new Date(book.toDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PublisherDashboard;
