import React from "react";
import { useParams } from "react-router-dom";

export default function TopicVideo() {

  const { topicId } = useParams();

  const videos = {
    0: "https://www.youtube.com/embed/eIrMbAQSU34",
    1: "https://www.youtube.com/embed/Ke90Tje7VS0",
    2: "https://www.youtube.com/embed/Oe421EPjeBE"
  };

  return (
    <div className="container mt-4">

      <h3>Course Video</h3>

      <iframe
        width="700"
        height="400"
        src={videos[topicId]}
        title="video"
      ></iframe>

    </div>
  );
}