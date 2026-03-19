import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GameResult {
    playerNumbers: Array<bigint>;
    player: Principal;
    matches: bigint;
    computerNumbers: Array<bigint>;
    isWin: boolean;
}
export interface backendInterface {
    getAllResults(): Promise<Array<GameResult>>;
    getPlayerResults(player: Principal): Promise<Array<GameResult>>;
}
