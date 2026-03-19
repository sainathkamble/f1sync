# 🏎️ F1 SYNC

> A modern Formula 1 companion app — live streams, race schedules, driver standings, constructor championships, and more. All in one place.

**🔗 Live:** [https://f1sync.vercel.app](https://f1sync.vercel.app)

---

## 📸 Preview

> F1 Sync brings together everything an F1 fan needs — real-time race data, driver profiles, constructor standings, and live stream access — wrapped in a sleek dark UI.

---

## ✨ Features

- 🔴 **Watch Live** — Access live F1 race streams directly from the app
- 📅 **Race Schedule** — Full season calendar with upcoming race details
- 🧑‍🏎️ **Drivers** — Browse all current F1 drivers with stats and team info
- 🏗️ **Constructors** — Explore constructor/team data and performance
- 🏆 **Championship** — Live driver and constructor championship standings
- 👤 **User Profile** — Personalized profile with avatar support
- 🌐 **Responsive Design** — Fully optimized for mobile, tablet, and desktop

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |

### Deployment
| Service | Purpose |
|---|---|
| [Vercel](https://vercel.com/) | Frontend hosting |

---

## 📁 Project Structure

```
f1-sync/
├── public/
│   └── F1-logo.png
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Responsive top navigation
│   │   └── Footer.tsx          # Site footer with links
│   ├── context/
│   │   └── UserContext.tsx     # Global user state (auth + avatar)
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Stream.tsx          # Live watch page
│   │   ├── Schedule.tsx        # Race calendar
│   │   ├── Drivers.tsx         # Driver listings
│   │   ├── Constructors.tsx    # Constructor listings
│   │   ├── Championship.tsx    # Standings
│   │   └── Profile.tsx         # User profile
│   ├── App.tsx
│   └── main.tsx
├── .env                        # Environment variables
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/sainathkamble/f1-project.git
cd f1-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root of the project:

```env
VITE_API_URL=http://localhost:8000
```

> ⚠️ If testing on a **phone or another device** on the same network, replace `localhost` with your machine's local IP address (e.g. `http://192.168.1.x:8000`). See [Testing on Mobile](#-testing-on-mobile) below.

### 4. Start the development server

```bash
npm run dev
```

App will be available at `http://localhost:5173`

### 5. Build for production

```bash
npm run build
```

### 6. Preview production build

```bash
npm run preview
```

---

## 🌍 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL for the backend API | `http://localhost:8000` |

---

## 📱 Testing on Mobile

To preview the app on your phone during development:

**1. Start Vite with network access:**
```bash
npm run dev -- --host
```

You'll see:
```
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/
```

**2. Update your `.env` to use your machine's local IP:**
```env
VITE_API_URL=http://192.168.x.x:8000
```

**3. Make sure your backend listens on all interfaces:**
```js
// In your Express server
app.listen(8000, '0.0.0.0')
```

**4. Open the `Network` URL on your phone's browser.**

> Your phone and laptop must be connected to the **same Wi-Fi network**.

---

## 🔌 API Endpoints (Backend)

The frontend communicates with a REST API running on port `8000`. Key endpoints used:

| Endpoint | Description |
|---|---|
| `GET /drivers` | Fetch all current F1 drivers |
| `GET /constructors` | Fetch all constructors/teams |
| `GET /schedule` | Fetch the full race season schedule |
| `GET /championship` | Fetch driver and constructor standings |
| `GET /stream` | Fetch live stream data |

> Backend setup instructions are in the backend repository (if separate).

---

## 🎨 Design Highlights

- **Dark theme** — Deep black background (`rgba(10,10,10)`) with subtle blur effects
- **F1 Red accent** — `#dc2626` used for active states, borders, and highlights
- **Glassmorphism navbar** — Frosted glass effect with `backdrop-filter: blur`
- **Responsive navbar** — Hamburger menu with animated slide-in drawer on mobile/tablet
- **Smooth transitions** — 200–300ms transitions on all interactive elements

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 👨‍💻 Author

**Sainath Kamble**

- 🌐 Portfolio: [sainathkamble.vercel.app](https://sainathkamble.vercel.app)
- 🐙 GitHub: [@sainathkamble](https://github.com/sainathkamble)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for F1 fans</p>