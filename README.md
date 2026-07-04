# MonoBlog 🚀

MonoBlog is a modern, full-stack, highly interactive personal blogging platform built with the MERN stack (MongoDB, Express, React, Node.js). Designed with an Instagram-inspired aesthetic, it features advanced multimedia capabilities, frictionless user engagement, and a powerful admin dashboard.

## ✨ Key Features

### 🎧 Advanced Multimedia
- **Multi-Image Carousels**: Upload and swipe through multiple images in a single post, complete with Instagram-style pagination dots.
- **Integrated Music Search (Jamendo API)**: Search and attach royalty-free music to your posts.
- **Custom Audio Durations**: Specify exact start and end timestamps for the attached music. The music plays automatically as users scroll past your posts.

### 👥 Frictionless Engagement (No Login Required)
- **IP-Based Analytics**: True, accurate tracking for Views, Likes, and Shares based on the visitor's IP address. Prevents spamming and guarantees 1 View/Like/Share per unique user.
- **Guest Commenting**: Anyone can leave a comment with an optional "Your Name" field.
- **Social Sharing**: A beautiful, centered popup modal allows users to instantly share posts to WhatsApp, Twitter, Facebook, or copy the direct link.

### 📬 Subscriptions & Email Notifications
- **Newsletter Opt-in**: Centered subscription modals for users to sign up for updates.
- **Admin Email Blasts**: With the click of a button in the Admin Dashboard, securely send email notifications to all active subscribers using the **Resend API**.
- **Notification Tracking**: The backend tracks exactly how many users were notified per post, allowing you to filter your dashboard by "Notification Sent".

### 📊 Powerful Admin Dashboard
- **Real-Time Analytics**: View overall views, likes, and individual post performance.
- **Advanced Filtering**: Filter your posts by Domain, Sort by Views/Likes/Shares/Comments, or filter by Notification status.
- **Subscriber Management**: View a complete list of your subscribers directly from the dashboard.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router, Vanilla CSS (Custom Light/Dark mode variables), Lucide-React for crisp iconography.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose ODM.
- **Storage**: Cloudinary (for fast, optimized image hosting).
- **Email Delivery**: Resend API.
- **External Data**: Jamendo API (for music).

---