import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TopicVideo() {

  const { courseId, topicId } = useParams();
  const navigate = useNavigate();

  const videos = {
    1: [
      "https://www.youtube.com/embed/grEKMHGYyns",
      "https://www.youtube.com/embed/UmnCZ7-9yDY",
      "https://www.youtube.com/embed/GoXwIVyNvX0"
    ],
    2: [
      "https://www.youtube.com/embed/_uQrJ0TkZlc",
      "https://www.youtube.com/embed/kqtD5dpn9C8",
      "https://www.youtube.com/embed/rfscVS0vtbw"
    ],
    3: [
      "https://www.youtube.com/embed/W6NZfCO5SIk",
      "https://www.youtube.com/embed/PkZNo7MFNFg",
      "https://www.youtube.com/embed/bMknfKXIFA8"
    ]
  };

  const videoUrl = videos[courseId]?.[topicId];

  if (!videoUrl) {
    return <h3 className="p-6">Video not found</h3>;
  }

  return (
    <div className="p-6">

      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-600 text-white px-3 py-2 rounded"
      >
        ← Back
      </button>

      <div className="flex justify-center">

        <iframe
          width="900"
          height="500"
          src={videoUrl}
          title="Course Video"
          allowFullScreen
          className="rounded shadow-lg"
        />

      </div>

    </div>
  );
}
