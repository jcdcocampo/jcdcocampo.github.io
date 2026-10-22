import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Click the profile picture 7 times (within 1.4s of each other) to open the 404 game. */
export function useProfileEasterEgg() {
  const navigate = useNavigate();
  useEffect(() => {
    const pic = document.getElementById('profilePic');
    if (!pic) return;
    pic.style.cursor = 'pointer';
    let count = 0;
    let last = 0;
    const RESET_MS = 1400;
    const onClick = () => {
      const now = Date.now();
      if (now - last > RESET_MS) count = 0;
      last = now;
      count++;
      if (count >= 7) {
        count = 0;
        navigate('/404');
      }
    };
    pic.addEventListener('click', onClick);
    return () => pic.removeEventListener('click', onClick);
  }, [navigate]);
}
