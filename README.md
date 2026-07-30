# 📚 BookIsh — Literary Community & Book Discussion Platform

**BookIsh** is a full-stack, literary-themed web application designed for passionate readers and book clubs. Built with a vintage **"Literary Parchment"** design system, BookIsh allows users to discover books, engage in chapter-wise and book-wide discussions, share spoiler-protected reviews, participate in community forums, and manage custom reading shelves.

---

## ✨ Features & Highlights

### 📜 1. Literary Parchment Aesthetic
- **Warm Parchment Paper Surfaces**: `#FBF7EE` main background with `#F5EFE0` card surfaces.
- **Ink-Black Serif Typography**: Standardized on elegant serif fonts (`Lora`, `Newsreader`, `Inter`).
- **Crimson Accents**: `#8C2520` primary action color inspired by classic book spines and wax seals.

### 📖 2. OpenLibrary Book Integration
- **Live Search & Catalog**: Search millions of books via OpenLibrary API integration.
- **Detailed Book Pages**: View book covers, authors, descriptions, published dates, and community discussions.

### 💬 3. Chapter & Book-Wide Discussions
- **Flexible Discussion Scopes**: Post discussions tagged as either **Book Wide** or specific **Chapter Numbers**.
- **Full CRUD Capabilities**: Create, view, edit (modal interface), and delete discussions (author-restricted).
- **Nested Threaded Comments**: Indented reply trees supporting multi-level community discourse.

### ⚠️ 4. Interactive Spoiler Protection
- **Block-Level & Card Blur**: Automatically obscures spoiler-marked discussions with a parchment blur backdrop.
- **Inline Spoiler Tags**: Supports typing `||spoiler text||` or `>!spoiler text!<` in comments and post bodies.
- **Click to Reveal**: Smooth unblur effect with custom warning badges (`⚠️ Spoiler – click to reveal`).

### 🏛️ 5. Community Forums
- **Categorized Forums**: General Discussion, Book Recommendations, Author Spotlights, Writing Corner, and Genre discussions.
- **Thread Creation & Filter**: Search, filter, and participate in community-wide topics.

### 👤 6. User Profiles & Reading Shelves
- **Personalized Profiles**: View user bio, join date, discussion history, and activity.
- **Reading Shelves**: Track books under *Want to Read*, *Currently Reading*, and *Read*.

### 🔒 7. Authentication & Security
- **Dual Authentication**: Local Email/Password authentication with JWT (JSON Web Tokens) + Google OAuth2 support.
- **Role & Owner Authorization**: Strict back-end validation ensuring only content creators can edit or delete their discussions and comments.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Literary Parchment Palette
- **State & Data Fetching**: React Query (TanStack Query v5), Zustand
- **Routing & HTTP**: React Router v6, Axios (with JWT interceptors)

### Backend
- **Framework**: Java 21, Spring Boot 3.x
- **Security**: Spring Security, JWT (`jjwt`), OAuth2 Client
- **Persistence**: Spring Data JPA, Hibernate, PostgreSQL / H2 Database
- **Build Tool**: Maven

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ and `npm`
- **Java JDK**: 21+
- **Maven**: 3.8+ (or use included `./mvnw` wrapper)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Build application
./mvnw clean compile

# Run Spring Boot server (starts on http://localhost:8080)
./mvnw spring-boot:run
```

#### Test Credentials:
- **Email**: `bookish@gmail.com`
- **Password**: `bookish@123`

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (starts on http://localhost:5173)
npm run dev
```

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/user` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | ❌ |
| `GET` | `/api/books/{id}/discussions` | List discussions for a book | ❌ |
| `POST` | `/api/books/{id}/discussions` | Create a discussion | ✅ |
| `GET` | `/api/discussions/{id}` | Get discussion details & comments | ❌ |
| `PUT` | `/api/discussions/{id}` | Edit discussion (author only) | ✅ |
| `DELETE` | `/api/discussions/{id}` | Delete discussion (author only) | ✅ |
| `POST` | `/api/discussions/{id}/comments` | Add comment / reply | ✅ |
| `PUT` | `/api/comments/{id}` | Edit comment (author only) | ✅ |
| `DELETE` | `/api/comments/{id}` | Delete comment (author only) | ✅ |
| `GET` | `/api/forums` | List community forums | ❌ |

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
