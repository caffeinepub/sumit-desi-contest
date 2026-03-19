import { useQuery } from "@tanstack/react-query";
import type { GameResult } from "../backend";
import { useActor } from "./useActor";

export function useAllResults() {
  const { actor, isFetching } = useActor();
  return useQuery<GameResult[]>({
    queryKey: ["allResults"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllResults();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}
