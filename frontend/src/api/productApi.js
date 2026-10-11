
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export async function getProducts() {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
}

export async function getProductById(id) {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
}
