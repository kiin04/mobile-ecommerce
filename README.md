<div align="center">

# Mobile Phone E-commerce Website

[![ReactJS](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A modern e-commerce platform for a mobile phone store with full administrative and user functionalities.

[Features](#features) •
[Getting Started](#getting-started) •
[Installation](#installation) •
[Configuration](#configuration) •

</div>

## Features

### 🚀 Highlights

- Excel export functionality for inventory management
- Momo payment integration
- CI/CD pipeline implemented
- Eye-catching user interface
- Comprehensive admin dashboard
- And much more...

### 💡 Core Features

- **Admin Dashboard**: Full control over products, orders, discounts, customers, etc.
- **User Interface**: Intuitive shopping experience for users

## Getting Started

### Prerequisites

**Required:**

- Bun Runtime
- Node.js >= 20.00
- Integrated Development Environment (IDE) (Visual Studio Code, JetBrains, etc.)
- MongoDB

**Optional:**

- Automated Deployment (This is quite challenging and requires DevOps skills.  Feel free to contact me directly if you'd like to implement this.)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nupniichan/Website-Ban-Dien-Thoai.git
cd Website-Ban-Dien-Thoai
```

### 2. Install and Run the Admin Panel

```bash
cd admin
bun install
bun run dev
```

### 3. Install and Run the User Interface

```bash
cd user
bun install
bun run dev
```

### 4. Install and Run the Server

```bash
cd server
bun install
bun server.js
```

## Configuration

### MongoDB Configuration

1. Create a MongoDB database.
2. Configure the MongoDB URL:

   ```js
   // /server/module/db.js
   // Replace YOUR_CONNECTION_STRING with your MongoDB connection URL
   ```

### Automated Deployment Configuration (Optional)

For deployment, you need to modify the CORS settings in `server.js`:

```javascript
app.use(cors({
  origin: ['YOUR_SERVER_IP'] // Replace [YOUR_SERVER_IP] with your server's public IP. For localhost, use localhost:5173 and localhost:5174.
}));
```

## Project Structure

```
├── admin/              # Admin Panel (React + Vite)
├── user/               # User Interface (React + Vite)
├── server/             # Backend (Node.js)
│   ├── module/        # Server Modules
│   └── server.js      # Main Server File
└── ...
```

## Branch Management

- `develop` - Main development branch
- `main` - Production branch

## Technologies Used

### Frontend

- ⚛️ React.js
- 🛠️ Vite
- 🎨 Tailwind CSS

### Backend

- 📡 Node.js
- 🗄️ MongoDB
- 🚀 Bun Runtime

### Tools

- Docker
- GitHub Actions

## CI/CD

- 🚀 Azure (Ubuntu Server 24.04)


## Contributors

Thanks to these awesome people for contributing to this project:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/ThePinkKitten">
        <img src="https://avatars.githubusercontent.com/u/61980152?v=4" width="100px;" alt="ThePinkKitten"/><br />
        <sub><b>ThePinkKitten</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Tequinzyy">
        <img src="https://avatars.githubusercontent.com/u/116754124?v=4" width="100px;" alt="Tequinzyy"/><br />
        <sub><b>Tequinzyy</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/KevzCz">
        <img src="https://avatars.githubusercontent.com/u/130611225?v=4" width="100px;" alt="KevzCz"/><br />
        <sub><b>KevzCz</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Phatds357">
        <img src="https://avatars.githubusercontent.com/u/161195912?v=4" width="100px;" alt="Phatds357"/><br />
        <sub><b>Phatds357</b></sub>
      </a>
    </td>
  </tr>
</table>


<div align="center">

Thank you for visiting this repository ❤️

</div>
