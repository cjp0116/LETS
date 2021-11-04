import axios from "axios";

const BASE_URL = "http://localhost:3001";
// const BASE_URL="https://workout-buddy-backend.herokuapp.com";
/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class Api {
  static token = localStorage.getItem("token");

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${Api.token}` };
    const params = method === "get" ? data : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (e) {
      console.error("API Error:", e.response);
      const message = e.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  static async register(data) {
    const res = await this.request(`auth/register`, data, "post");
    return res.token;
  }

  static async login(data) {
    const res = await this.request(`auth/token`, data, "post");
    return res.token;
  }

  static async getCurrentUser(username) {
    const res = await this.request(`users/${username}`);
    return res.user;
  }

  static async updateUser(username, data) {
    const res = await this.request(`users/${username}`, data, "PATCH");
    return res.user;
  }

  /// Calendar stuff
  static async createCalendarEvent(currentUsername, data) {
    const res = await this.request(
      `calendar-events/${currentUsername}`,
      data,
      "post"
    );
    return res.event;
  }

  static async getUserCalendarEvents(currentUsername) {
    const res = await this.request(`calendar-events/${currentUsername}`);
    return res.events;
  }

  static async deleteCalendarEvent(currentUsername, eventId) {
    const res = await this.request(
      `calendar-events/${currentUsername}/${eventId}`,
      {},
      "DELETE"
    );
  }
  static async updateCalendarEvent(currentUsername, eventId, data) {
    const res = await this.request(`calendar-events/${currentUsername}/${eventId}`, data, "PUT");
    return res.event;
  }
  // post stuff
  static async createPost(currentUsername, content) {
    const res = await this.request(`posts/${currentUsername}`, content, "POST");
    return res.post;
  }

  static async updatePost(currentUsername, content) {
    const res = await this.request(`posts/${currentUsername}`, content, "put");
    return res.post;
  }

  static async getPostsDetailsByUsername(username) {
    const res = await this.request(`posts/user/${username}`);
    return res.posts;
  }

  static async deletePost(username, postId) {
    const res = await this.request(`posts/${username}/${postId}`, {}, "DELETE");
    return res.deleted;
  }

  static async likePost(postId, username) {
    const res = await this.request(
      `posts/${username}/${postId}/like`,
      {},
      "PUT"
    );
    return res.like;
  }

  static async getPostTimeline(username) {
    const res = await this.request(`posts/user/${username}/timeline`);
    return res;
  }
  // post comment stuff
  static async createComment(postId, username, data) {
    const res = await this.request(
      `comments/${postId}/${username}`,
      data,
      "POST"
    );
    return res.comment;
  }
  static async getPostDetailsByPostId(postId) {
    const res = await this.request(`posts/${postId}`);
    return res.post;
  }

  // POSTS & COMMENTS ENDPOINTS
  static async getCommentsForPostId(postId) {
    const res = await this.request(`comments/${postId}`);
    return res.comments;
  }

  static async toggleCommentLikes(commentId, username) {
    const res = await this.request(
      `comments/${commentId}/${username}/like`,
      {},
      "PUT"
    );
    return res;
  }

  // Friends Endpoints
  static async sendFriendRequest(currentUsername, targetUsername) {
    const res = await this.request(
      `friends/${currentUsername}/to/${targetUsername}`,
      {},
      "POST"
    );
    return res.friendRequest;
  }

  static async getMyRequests(currentUsername) {
    const res = await this.request(`friends/${currentUsername}/sent`);
    return res.myRequests;
  }

  static async getPendingFriendRequests(currentUsername) {
    const res = await this.request(`friends/${currentUsername}/pending`);
    return res.requests;
  }

  static async confirmFriendRequest(currentUsername, theRequestorUsername) {
    const res = await this.request(
      `friends/${currentUsername}/from/${theRequestorUsername}`,
      {},
      "PUT"
    );
    return res.friendRequest;
  }

  static async cancelFriendRequest(currentUsername, username) {
    const res = await this.request(
      `friends/${currentUsername}/to/${username}`,
      {},
      "DELETE"
    );
    return res.request;
  }
  // MESSAGES
  static async findConversationWithUser(currentUsername, secondUsername) {
    const res = await this.request(
      `room/find/${currentUsername}/${secondUsername}`
    );
    return res.conversation;
  }

  static async getConversations(currentUsername) {
    const res = await this.request(`room/${currentUsername}`);
    return res.conversations;
  }

  static async getMessages(roomId) {
    const res = await this.request("messages/" + roomId);
    return res.messages;
  }

  static async sendMessage(data, currentUsername) {
    const res = await this.request(`messages/${currentUsername}`, data, "POST");
    return res.message;
  }

  static async createRoom(currentUsername, data) {
    const res = await this.request(`room/${currentUsername}`, data, "POST");
    return res.conversation;
  }

  static async findRoom(currentUsername, secondUsername) {
    const res = await this.request(
      `room/find/${currentUsername}/${secondUsername}`
    );
    return res.conversation;
  }

  static async addParticipantToRoom(username, roomId) {
    const res = await this.request(`room/${username}/${roomId}`, {}, "POST");
    return res;
  }

  static async leaveRoom(username, roomId) {
    const res = await this.request(`room/${username}/${roomId}`, {}, "DELETE");
    return res;
  }
  // NOTIFICATIONS
  static async getUserNotifications(username) {
    const res = await this.request(`notifications/${username}`);
    return res.notifications;
  }

  static async postNotifications(username, data) {
    if (data.sentTo === username) return;
    const res = await this.request(`notifications/${username}`, data, "POST");
    return res.notification;
  }

  static async markAsRead(
    username,
    id,
    data = { seenDate: Date.now, isSeen: true }
  ) {
    const res = await this.request(
      `notifications/${username}/${id}`,
      data,
      "PUT"
    );
  }
}

export default Api;
