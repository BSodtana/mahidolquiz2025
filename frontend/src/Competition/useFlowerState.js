import { useEffect, useRef, useState } from "react";
import axios from "axios";

/*
  Fetch and poll the flower state for a team.
  - Skips fetching for falsy or "guest" team_id
  - Always returns a stable object shape
 */
export function useFlowerState(team_id, options = {}) {
  const { mock = false, pollMs = 5000 } = options;
  const [flower, setFlower] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // If no team or guest, don't fetch/poll. Provide a sane default.
    if (!team_id || team_id === "guest") {
      setFlower({
        team_id: team_id ?? null,
        units: 5,
        current_units: 5,
        multiplier: 1.0,
        state: "Healthy",
        loading: false,
        error: null,
      });
      return; // skip polling
    }

    let cancelled = false;

    async function fetchOnce() {
      try {
        // mark loading
        setFlower((s) => ({ ...(s || {}), loading: true, error: null }));

        if (mock) {
          const units = Math.floor(Math.random() * 5) + 3; // 3..7
          const multiplier = Number((units / 5).toFixed(1));
          if (!cancelled) {
            setFlower({
              team_id,
              units,
              current_units: units,
              multiplier,
              state:
                units <= 3 ? "Critical" : units <= 4 ? "Declining" : "Healthy",
              loading: false,
              error: null,
            });
          }
        } else {
          const res = await axios.get(
            `http://localhost:8080/flower/states/${team_id}` //ถ้า mock = false ยิง GET → http://localhost:8080/flower/states/${team_id} อ่านค่าจาก res.data
          );
          if (cancelled) return;
          const data = res.data;
          const units = Math.max(0, Number(data.current_units ?? data.units ?? 5));
          const mult = Number(
            data.multiplier ?? Number((units / 5).toFixed(1))
          );
          setFlower({
            team_id: data.team_id ?? team_id,
            units,
            current_units: units,
            multiplier: mult,
            state:
              units <= 3 ? "Critical" : units <= 4 ? "Declining" : "Healthy",
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;
        // If 404, mark not-found and stop polling
        if (status === 404 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setFlower((s) => ({
          ...(s || {}),
          team_id,
          units: (s && s.units) || 5,
          current_units: (s && s.current_units) || 5,
          multiplier: (s && s.multiplier) || 1.0,
          state: (s && s.state) || "Healthy",
          loading: false,
          error: status === 404 ? "not-found" : err,
        }));
        console.error("useFlowerState fetch error:", err);
      }
    }

    // initial fetch
    fetchOnce();

    // poll only when meaningful
    if (!mock && pollMs > 0 && team_id && team_id !== "guest") {
      timerRef.current = setInterval(fetchOnce, pollMs);
    }

    // cleanup
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [team_id, mock, pollMs]);

  return flower;
}

