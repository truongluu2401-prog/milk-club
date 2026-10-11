
import axios from "axios";
import { API_URL } from "./config";

export async function getProducts() {
  const response = await axios.get(`${API_URL}/api/products`);
  return response.data;
}

export async function getProductById(id) {
  const response = await axios.get(`${API_URL}/api/products/${id}`);
  return response.data;
}
