// HomeCarousel.jsx
import React from "react";
import Images1 from "../assets/images/sepatu.jpg";
import Images2 from "../assets/images/sembako.jpg";
import Images3 from "../assets/images/snack.jpg";

export default function HomeCarousel() {
  const slides = [
    {
      id: 1,
      title: "SELAMAT DATANG",
      subtitle: "Temukan produk favoritmu!",
      buttonText: "Belanja Sekarang",
      buttonLink: "#",
      image: Images1,
    },
    {
      id: 2,
      title: "PROMO SPESIAL",
      subtitle: "Diskon hingga 50%",
      buttonText: "Lihat Promo",
      buttonLink: "#",
      image: Images2,
    },
    {
      id: 3,
      title: "PRODUK BARU",
      subtitle: "Jangan sampai ketinggalan tren terbaru",
      buttonText: "Cek Sekarang",
      buttonLink: "#",
      image: Images3,
    },
  ];

  return (
    <div className="container-fluid p-0">
      <div
        id="homepageCarousel"
        className="carousel slide carousel-fade rounded shadow-lg"
        data-bs-ride="carousel"
        data-bs-interval="5000"
      >
        {/* Indicators */}
        <div className="carousel-indicators">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              data-bs-target="#homepageCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-current={index === 0 ? "true" : undefined}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slides */}
        <div className="carousel-inner">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <img
                src={slide.image}
                className="d-block w-100"
                alt={slide.title}
                style={{
                  maxHeight: "400px",
                  objectFit: "cover",
                  opacity: 0.7,
                }}
              />
              <div className="carousel-caption d-flex flex-column justify-content-center align-items-center text-center h-100 p-2">
                <h1 className="text-white fw-bold display-6 display-md-4">
                  {slide.title}
                </h1>
                <p className="text-white fs-6">{slide.subtitle}</p>
                <a href={slide.buttonLink} className="btn btn-primary mt-2 mt-md-3 px-3 px-md-4 py-2">
                  {slide.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#homepageCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#homepageCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
}
