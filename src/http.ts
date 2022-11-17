import axios from 'axios';

export async function get(url, headers) {
  const options = {
    headers: headers,
  };
  const response = await axios.get(url, options);
  return response;
}

export async function post(url, body, headers) {
  const options = {
    headers: headers,
  };
  const response = await axios.post(url, body, options);
  return response;
}