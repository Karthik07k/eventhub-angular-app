# 📅 Event Management App

A modern Angular 20 application built to manage events, attendees, and user interactions with a clean and responsive UI powered by Angular Material.

---

## 🌐 Live URL

🔗 [https://karthik07k.github.io/eventhub-angular-app/](https://karthik07k.github.io/eventhub-angular-app/)

---

## 🚀 Features

- ✅ Built with **Angular 20** and **Angular Material**
- 📦 Modular architecture with **lazy-loaded routes**
- 🔐 Authentication & route guards (`AuthGuard`, `RoleGuard`)
- 🎨 Responsive design using Angular Material components
- 🧾 Integrated Prettier config for HTML formatting
- 🧪 Unit testing setup with Karma & Jasmine
- 🛠️ GitHub Pages ready deployment

---

## 📁 Folder Structure

event-management-app/
├── src/
│ ├── app/
│ │ ├── auth/ # Login/Register/Guards
│ │ ├── events/ # Event list/details
│ │ ├── profile/ # User profile
│ │ └── shared/ # Common components
│ ├
│ └── index.html
├── angular.json
├── package.json
└── tsconfig.json

---

## 🧑‍💻 Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/Karthik07k/eventhub-angular-app.git
   cd eventhub-angular-app
   ```

Install dependencies
npm install

⚙️ Development Server
npm start
Navigate to http://localhost:4200/

📦 Building for Production
Build the app with production settings:
npm run build

🌍 Deployment to GitHub Pages
Build with base-href for GH Pages:
ng build --output-path=dist/eventhub --base-href="/eventhub-angular-app/" --configuration production

Deploy using angular-cli-ghpages:
npx angular-cli-ghpages --dir=dist/eventhub/browser

🧑 Author
Karthik Kumar M
📧 karthikkumarks50@gmail.com
🌐 https://karthikkumarm.netlify.app/
🔗 https://github.com/karthik07k • https://www.linkedin.com/in/karthikkumar-m/
