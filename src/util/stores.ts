import { writable } from "svelte/store";
import type GradeStatus from "./types";

export const results = writable<GradeStatus[]>([]);
export const error = writable(false);
export const loading = writable(true);