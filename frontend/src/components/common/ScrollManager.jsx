import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const positions = useRef({});

  // Continuously save scroll position for the current route key
  useEffect(() => {
    const save = () => {
      positions.current[location.key] = window.scrollY;
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [location.key]);

  // On route change: restore or reset
  useEffect(() => {
    if (navType === "POP") {
      window.scrollTo(0, positions.current[location.key] ?? 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.key, navType]);

  return null;
}
