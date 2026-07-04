
import api from './api';

const postService = {
  getPosts: (params = {}) => {
    return api.get('/posts', { params }).then(res => res.data);
  },

  getPostBySlug: (slug) => {
    return api.get(`/posts/slug/${slug}`).then(res => res.data);
  },

  getPostById: (id) => {
    return api.get(`/posts/${id}`).then(res => res.data);
  },

  getPostEngagement: (id) => {
    return api.get(`/posts/${id}/engagement`).then(res => res.data);
  },

  createPost: (formData) => {
    return api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },

  updatePost: (id, formData) => {
    return api.put(`/posts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },

  deletePost: (id) => {
    return api.delete(`/posts/${id}`).then(res => res.data);
  },

  toggleLike: (id) => {
    return api.post(`/posts/${id}/like`).then(res => res.data);
  },

  sharePost: (id) => {
    return api.post(`/posts/${id}/share`).then(res => res.data);
  },

  getDomains: () => {
    return api.get('/posts/domains').then(res => res.data);
  },

  getTags: () => {
    return api.get('/posts/tags').then(res => res.data);
  },
};

export default postService;