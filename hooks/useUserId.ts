import { useState, useEffect } from "react";
import { parseCookies } from "nookies";

const useUserId = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let timeoutId;

    const fetchUserId = () => {
      const cookies = parseCookies();
      const userSub = cookies?.userSub || null;
      setUserId(userSub);

      // Retry after a short delay if userId is still null
      if (!userSub) {
        timeoutId = setTimeout(fetchUserId, 1000);
      }
    };

    fetchUserId();

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
  }, []);

  return userId;
};

export default useUserId;
