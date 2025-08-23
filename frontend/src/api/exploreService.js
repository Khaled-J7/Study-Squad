import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// The function now accepts the search query and tags
export const fetchData = (type = 'studio', query = '', tags = []) => {
  // This part is for building the URL with the search parameters
  // It's not yet connected to the client-side filter, but the service is now ready.
  const params = new URLSearchParams({ type });
  if (query) params.append('q', query);
  tags.forEach(tag => params.append('tags', tag));

  return axios.get(`${API_BASE_URL}/explore/?${params.toString()}`);
};