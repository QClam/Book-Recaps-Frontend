import React, { useEffect, useState } from 'react';

const RecapDetails = () => {
    const [audioURL, setAudioURL] = useState('');
    const [transcriptURL, setTranscriptURL] = useState('');
    const [error, setError] = useState(null);

    const fetchRecaps = async () => {
        try {
            const response = await fetch('https://160.25.80.100:7124/api/recap/get-all-recapsbycontributorId', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NWRmM2ExZC04NWY5LTQ2MzMtYTAwZC01ZTg0MjFiZWI3ZTQiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTE2LjExMC40MS45MCIsImltYWdlX3VybCI6IkZpbGVzL0ltYWdlL2pwZy9hZC5qcGciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDb250cmlidXRvciIsImV4cCI6MTcyODIyODA3NiwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzEyNCIsImF1ZCI6ImJvb2tyZWNhcCJ9.S6zTH1h6IdHOHndAtLhY7B_rVcnSBb1-Elqii75QX4Q',
                    'Content-Type': 'application/json' // Có thể thêm header này nếu cần thiết
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Kiểm tra xem có dữ liệu không
            if (data.succeeded && data.data && data.data.$values.length > 0) {
                // Lấy audioURL và transcriptUrl từ dữ liệu
                const recap = data.data.$values[0]; // Lấy recaps đầu tiên
                setAudioURL(recap.audioURL);
                setTranscriptURL(recap.transcriptUrl);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(`Error fetching recaps: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchRecaps();
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Audio URL:</h2>
            {audioURL ? (
                <audio controls>
                    <source src={audioURL} type="audio/wav" />
                    Your browser does not support the audio tag.
                </audio>
            ) : (
                <p>Loading audio...</p>
            )}
            <h2>Transcript URL:</h2>
            {transcriptURL ? (
                <a href={transcriptURL} target="_blank" rel="noopener noreferrer">{transcriptURL}</a>
            ) : (
                <p>Loading transcript...</p>
            )}
        </div>
    );
};

export default RecapDetails;
