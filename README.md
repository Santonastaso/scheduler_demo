# Scheduler Demo

A modern React-based scheduling application built with Vite, featuring a comprehensive CI/CD pipeline with GitHub Actions.

## 🚀 Features

- **Modern React Architecture**: Built with React 19, Vite, and modern JavaScript
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Scheduling**: Interactive calendar and Gantt chart views
- **Form Management**: Dynamic forms with validation using React Hook Form and Yup
- **State Management**: Zustand for efficient state management
- **Database Integration**: Supabase for backend services
- **Authentication**: Secure user authentication and protected routes

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form, Yup validation
- **Charts**: Chart.js, Gantt Task React
- **Calendar**: FullCalendar
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Santonastaso/scheduler_demo.git
cd scheduler_demo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Start the development server:
```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🧪 Testing

```bash
npm run lint
```

## 🚀 Deployment

The project is automatically deployed to GitHub Pages using GitHub Actions. The deployment workflow triggers on:

- Push to `main` branch
- Manual workflow dispatch

### GitHub Pages URL
https://santonastaso.github.io/scheduler_demo

## 🔄 CI/CD Pipeline

This project includes a comprehensive GitHub Actions setup:

### 1. Continuous Integration (`ci.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Features**:
  - Multi-Node.js version testing (18.x, 20.x)
  - Dependency installation and caching
  - Linting with ESLint
  - Build verification
  - Security audit
  - Artifact upload

### 2. Deployment (`deploy.yml`)
- **Triggers**: Push to `main`, Manual dispatch
- **Features**:
  - Automated build and deployment to GitHub Pages
  - Environment protection
  - Artifact management

### 3. Release Management (`release.yml`)
- **Triggers**: Git tags (`v*`), Manual dispatch
- **Features**:
  - Automated release creation
  - Release asset upload
  - Version management

### 4. Dependency Management (`dependabot.yml`)
- **Features**:
  - Weekly dependency updates
  - Automated PR creation
  - Security vulnerability monitoring

## 📋 Project Structure

```
scheduler_demo/
├── .github/
│   ├── workflows/          # GitHub Actions workflows
│   ├── ISSUE_TEMPLATE/     # Issue templates
│   └── dependabot.yml      # Dependency management
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── store/             # State management
│   ├── utils/             # Utility functions
│   └── styles/            # CSS styles
├── .audit-ci.json         # Security audit config
└── package.json           # Dependencies and scripts
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

### Code Style

This project uses:
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Issue Templates

Use the provided issue templates for:
- Bug reports
- Feature requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: https://santonastaso.github.io/scheduler_demo
- **Repository**: https://github.com/Santonastaso/scheduler_demo
- **Issues**: https://github.com/Santonastaso/scheduler_demo/issues

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.
# Build trigger Mon Oct 27 00:11:22 EET 2025
