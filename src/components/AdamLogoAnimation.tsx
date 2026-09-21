"use client";
import Lottie from "lottie-react";
import adamAnimation from "../../public/lottie/adam-logo-animation.json";

export default function AdamLogoAnimation({ style }: { style?: React.CSSProperties }) {
  return (
    <Lottie
      animationData={adamAnimation}
      loop
      autoplay
      rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
      className="absolute inset-0 w-full h-full"
      style={style}
    />
  );
}
