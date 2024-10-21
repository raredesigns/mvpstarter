import FileUpload from "@/components/FileUpload";
import Hero from "@/components/Hero";
import React from "react";

const Home = () => {
  return (
    <section className="grid">
      <Hero />
      <FileUpload/>
      <video className="w-full h-auto max-w-full rounded mt-12" controls>
        {/* <source src=""/> */}
        Your browser does not support the video tag.
      </video>
    </section>
  );
};

export default Home;
