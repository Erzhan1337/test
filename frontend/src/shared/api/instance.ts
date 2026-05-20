import axios from "axios";

export const $api = axios.create({
  baseURL: process.env.SERVER_URL || "http://localhost:4000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
