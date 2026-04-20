# Event Registration System

A single-page application (SPA) for managing event registrations at AUPP (Asia Pacific University of the Philippines). The system separates participant and admin workflows, allowing students to browse events and register while staff can manage participants and check-in status.

## 🎯 Features

### Participant Features
- **Browse Events**: View all upcoming events with detailed information (date, location, available seats)
- **Event Registration**: Register for events with personal information (name, email, faculty, year of study)
- **My Registrations**: View and manage personal event registrations
- **Faculty & Year**: Select from 4 faculties and 4 years of study
- **Form Validation**: Real-time validation with live error messages

### Admin Features
- **Staff Login**: Secure login with email and password (via `.env` file)
- **Participant Management**: View all registered participants in a searchable, sortable table
- **Search & Filter**: Filter participants by name, faculty, and event
- **Check-in Management**: Mark participants as checked-in or no-show
- **Participant CRUD**: Add, edit, and delete participant records
- **Sample Data**: One-click refresh to populate sample event data
- **Logout**: Secure logout to end admin session

## 📂 Project Structure

```
Event_Final/
├── index.html                 # Main HTML shell with all sections and modals
├── script.js                  # (Legacy) Main application logic
├── style.css                  # (Legacy) Global styles
├── README.md                  # This file
├── .env                       # Admin credentials (ignored by git)
├── .env.example               # Template for .env file
├── .gitignore                 # Git ignore configuration
├── css/
│   └── style.css              # Global CSS with design tokens and animations
├── js/
│   ├── main.js                # Application initialization, routing, state management
│   └── modules/
│       ├── api.js             # Data management (CRUD operations, localStorage)
│       ├── dom.js             # DOM manipulation and UI updates
│       ├── search.js          # (Placeholder) Search functionality
│       └── validation.js      # Form validation and field state management
├── pages/                     # (Placeholder) Page components
└── tests/
    └── test-cases.html        # Test cases documentation
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local development server (e.g., Live Server extension for VS Code)
- Text editor (VS Code recommended)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd Event_Final
   ```

2. **Set up admin credentials**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and set your admin credentials:
     ```
     ADMIN_EMAIL=staff@aupp.edu.kh
     ADMIN_PASSWORD=your_secure_password
     ```

3. **Start the development server**
   - Using VS Code Live Server: Right-click `index.html` → "Open with Live Server"
   - Or use any HTTP server on port 5500

4. **Access the application**
   - **Participant View**: http://localhost:5500 (auto-redirects to `#/user/events`)
   - **Admin Login**: http://localhost:5500/#/admin/login

## 📖 Usage

### Participant Workflow

1. **Browse Events**
   - Navigate to "All Events" from the sidebar
   - View all available events with descriptions and seat availability
   - Click "Register for Event" on any event card

2. **Register for an Event**
   - Fill in your personal details:
     - Full Name (required)
     - Email (required, used to track registrations)
     - Faculty: Choose from:
       - Digital Technologies
       - Business and Management
       - Law
       - Social Sciences
     - Year of Study: Choose from:
       - Freshman
       - Sophomore
       - Junior
       - Senior
   - Click "Register" to confirm

3. **View My Registrations**
   - Navigate to "My Registrations" from the sidebar
   - See all your registered events scoped by email address
   - Change your email to view registrations under a different email
   - View registration date and status

### Admin Workflow

1. **Login to Admin Panel**
   - Navigate to `#/admin/login`
   - Enter email and password from `.env`
   - Click "Login" → Redirects to Participants Management

2. **Manage Participants**
   - View all registered participants in a table
   - **Search**: Type in the search box to find participants by name
   - **Filter**: Use dropdowns to filter by Faculty or Event
   - **Result Count**: See total and filtered participant counts

3. **Check-In Management**
   - Click "Check In" to mark participant as attended
   - Click "No-Show" to mark participant as absent
   - Status colors: Green (checked-in), Red (no-show), Gray (registered)

4. **Add Participant**
   - Click "Add Participant" button
   - Fill in participant details (same fields as registration form)
   - Click "Add" to save

5. **Edit Participant**
   - Click the pencil icon next to a participant
   - Update any fields
   - Click "Save Changes"

6. **Delete Participant**
   - Click the trash icon next to a participant
   - Confirm deletion in the modal

7. **Refresh Sample Data**
   - Click the refresh button (circular icon) to reload sample data
   - Useful for testing and resetting the database

8. **Logout**
   - Click the "Logout" button in the admin toolbar
   - Redirected to `#/admin/login`

## 🛠️ Technical Stack

### Frontend
- **HTML5**: Semantic markup with section-based routing
- **CSS3**: Flexbox layouts, CSS custom properties, animations
- **Vanilla JavaScript**: ES6 modules, async/await
- **Architecture**: Single-Page Application (SPA) with hash-based routing

### Data Storage
- **localStorage**: Persists registrations and auth state across sessions
- **.env File**: Stores admin credentials (server-side in production)

### Key Libraries/Utilities
- **Lucide Icons**: SVG icons for UI elements (loader, delete, etc.)
- **Form Validation**: Custom live validation with field-level error messages

### Design Tokens
- **Primary Color**: Navy (#003070)
- **Accent Color**: Crimson (#AD0000)
- **Avatar Colors**: 4-color palette (Blue, Green, Orange, Purple)
- **Responsive Design**: Mobile-first with sidebar toggle on small screens

## 🔐 Security Notes

### Current Implementation
- **Client-Side Authentication**: Email/password validation in browser
- **Credentials Storage**: `.env` file (ignored by git via `.gitignore`)
- **Session Management**: localStorage flag (`aupp.admin.auth.v1`)

### Production Considerations
- Replace client-side auth with backend API authentication
- Use JWT tokens or session cookies
- Implement password hashing (bcrypt/PBKDF2)
- Add HTTPS for credential transmission
- Implement role-based access control (RBAC)
- Add audit logging for admin operations
- Secure the `.env` file on server (never commit to git)

## 🎨 Customization

### Faculties
Defined in [js/modules/validation.js](js/modules/validation.js):
```javascript
export const FACULTIES = [
  "Faculty of Digital Technologies",
  "Faculty of Business and Management",
  "Faculty of Law",
  "Faculty of Social Sciences",
];
```

### Years of Study
```javascript
export const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];
```

### Events
Defined in [js/main.js](js/main.js):
```javascript
const EVENTS = [
  { id: "evt-tech-summit", title: "AUPP Tech Summit 2026", ... },
  { id: "evt-career-fair", title: "Career Networking Fair", ... },
  { id: "evt-design-lab", title: "Product Design Demonstration", ... },
  { id: "evt-startup-night", title: "Startup Pitch Night", ... },
];
```

## 🔄 Routing Reference

### Participant Routes
- `#/user/events` - Browse all events
- `#/user/my-registrations` - View personal registrations

### Admin Routes
- `#/admin/login` - Login page
- `#/admin/participants` - Participant management (requires authentication)

**Note**: Unauthenticated users accessing admin routes are automatically redirected to `#/admin/login`.

## 📦 Browser Storage Keys

| Key | Purpose |
|-----|---------|
| `aupp.registrations.v2` | All event registrations (array of objects) |
| `aupp.currentUserEmail.v2` | Currently viewed participant email |
| `aupp.admin.auth.v1` | Admin authentication flag ("1" = logged in) |

## 🐛 Troubleshooting

### Issue: New password in `.env` doesn't work
**Solution**: Refresh the page after changing `.env`. The app loads credentials on page load, not on-demand.

### Issue: Form validation not working
**Solution**: Ensure JavaScript is enabled and `js/modules/validation.js` is loaded without errors.

### Issue: Registrations not saving
**Solution**: Check browser localStorage is not disabled. Some privacy browsers may block it.

### Issue: Admin button/icons missing
**Solution**: Verify all JavaScript modules are imported correctly in [js/main.js](js/main.js).

## 📝 Environment Variables

Create a `.env` file in the project root:

```
ADMIN_EMAIL=staff@aupp.edu.kh
ADMIN_PASSWORD=your_secure_password_here
```

**Important**: Never commit `.env` to git. It's in `.gitignore` by default.

## 🚢 Deployment

### Local Testing
1. Use Live Server or any HTTP server
2. Access via `http://localhost:5500` (or your server port)

### Production Deployment
1. Set up a backend API for authentication and data persistence
2. Create a `.env` on the server (not in git)
3. Implement HTTPS/TLS
4. Add database (PostgreSQL, MongoDB, etc.)
5. Implement audit logging
6. Add rate limiting and security headers
7. Use a proper session management system

## 📄 File Descriptions

| File | Purpose |
|------|---------|
| [index.html](index.html) | Main HTML shell with all page sections and modal overlays |
| [js/main.js](js/main.js) | App initialization, routing, event listeners, state management |
| [js/modules/api.js](js/modules/api.js) | CRUD operations for participants, localStorage persistence |
| [js/modules/dom.js](js/modules/dom.js) | DOM manipulation helpers, modal control, alerts |
| [js/modules/validation.js](js/modules/validation.js) | Form validation, field state, faculty/year definitions |
| [js/modules/search.js](js/modules/search.js) | Search/filter logic placeholder |
| [css/style.css](css/style.css) | Global styles, design tokens, animations, responsive layout |
| [.env](.env) | Admin credentials (create from `.env.example`) |
| [.env.example](.env.example) | Template for `.env` file |
| [.gitignore](.gitignore) | Git ignore rules (prevents `.env` from being committed) |

## 🤝 Contributing

For development:
1. Keep JavaScript modular (one concern per file)
2. Use semantic HTML elements
3. Follow existing naming conventions (camelCase for JS, kebab-case for CSS)
4. Update this README when adding features
5. Test in multiple browsers

