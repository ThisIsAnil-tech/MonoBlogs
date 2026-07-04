import api from './api';

const commentService = {
  getComments: (postId, params = {}) => {
    return api.get(`/posts/${postId}/comments`, { params }).then(res => res.data);
  },

  createComment: (postId, content, parentId = null, authorName = null) => {
    return api.post(`/posts/${postId}/comments`, { content, parentId, authorName })
      .then(res => res.data);
  },

  deleteComment: (commentId) => {
    return api.delete(`/posts/${commentId}/comments`).then(res => res.data);
  },

  toggleLike: (commentId) => {
    return api.post(`/posts/${commentId}/comments/like`).then(res => res.data);
  },
};

export default commentService;