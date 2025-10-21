# GamePlan Frontend

A comprehensive football management system built with React, Redux Toolkit, and Tailwind CSS.

## Features

- **Authentication System**: Login/Register with JWT tokens and role-based access (ADMIN/COACH)
- **Dashboard**: Overview statistics and quick actions
- **League Management**: Create, edit, and manage football leagues
- **Team Management**: Manage teams and their league associations
- **Player Management**: Add players to teams with positions and jersey numbers
- **Fixture Management**: Schedule matches with venues and dates
- **Results Management**: Record match results and scores
- **Referee Management**: Manage match officials
- **Venue Management**: Manage stadiums and venues
- **User Management**: Admin-only user management system

## Technology Stack

- **React 19** - Frontend framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Heroicons** - Icon library
- **Headless UI** - Accessible UI components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GamePlan API server running on `http://localhost:3000`

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── layout/             # Layout components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Leagues.jsx     # League management
│   ├── Teams.jsx       # Team management
│   ├── Players.jsx     # Player management
│   ├── Fixtures.jsx    # Fixture management
│   ├── Results.jsx     # Results management
│   ├── Referees.jsx    # Referee management
│   ├── Venues.jsx      # Venue management
│   └── Users.jsx       # User management (Admin only)
├── services/           # API service layer
├── store/              # Redux store and slices
│   ├── slices/         # Redux slices for each feature
│   └── index.js        # Store configuration
├── App.jsx             # Main app component with routing
└── main.jsx            # App entry point
```

## API Integration

The frontend integrates with the GamePlan API with the following endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users`
- **Leagues**: `/api/leagues`
- **Teams**: `/api/teams`
- **Players**: `/api/players`
- **Fixtures**: `/api/fixtures`
- **Results**: `/api/results`
- **Referees**: `/api/referees`
- **Venues**: `/api/venues`

## User Roles

- **ADMIN**: Full access to all features including user management
- **COACH**: Access to leagues, teams, players, fixtures, and results (read-only for some features)

## Features Overview

### Dashboard
- Statistics overview (leagues, teams, fixtures, results)
- Quick action buttons
- Recent fixtures and results

### League Management
- Create and manage football leagues
- Set league details (name, description, season, dates)

### Team Management
- Create teams and associate them with leagues
- Manage team information

### Player Management
- Add players to teams
- Set player positions (GK, DF, MF, FW)
- Assign jersey numbers

### Fixture Management
- Schedule matches between teams
- Set venues and dates
- Update fixture status (Scheduled, Completed, Postponed)

### Results Management
- Record match scores
- View match results
- Update existing results

### Referee Management
- Manage match officials
- Store referee contact information and experience

### Venue Management
- Manage stadiums and venues
- Store venue details (capacity, location)

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Error Handling

- Comprehensive error handling for API calls
- User-friendly error messages
- Loading states for better UX
- Form validation

## Security

- JWT token-based authentication
- Protected routes based on user roles
- Automatic token refresh
- Secure API communication

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- ESLint configuration for code quality
- Consistent component structure
- Proper error handling
- Responsive design patterns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.