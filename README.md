# Event Registration System

A single-page application (SPA) for managing event registrations at AUPP (American University of Phnom Penh). The system separates participant and admin workflows, allowing students to browse events and register while staff can manage participants and check-in status.

## 🎯 Features

### Participant Features
- **Browse Events**: View all upcoming events with detailed information (date, location, available seats)
- **Event Registration**: Register for events with personal information (name, email, faculty, year of study)
- **My Registrations**: View and manage personal event registrations
- **Faculty & Year**: Select from all faculties and all years of study
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
├── .gitignore                 # Git ignore configuration
├── css/
│   └── style.css              # Global CSS with design tokens and animations
├── js/
│   ├── main.js                # Application initialization, routing, state management
│   └── modules/
│       ├── api.js             # Data management (CRUD operations, localStorage)
│       ├── dom.js             # DOM manipulation and UI updates
│       ├── search.js          # (Placeholder) Search functionality
│       └── validation.js      # Form validation and field 
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local development server (e.g., Live Server extension for VS Code)
- Text editor (VS Code recommended)

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


### Key Libraries/Utilities
- **Lucide Icons**: SVG icons for UI elements (loader, delete, etc.)
- **Form Validation**: Custom live validation with field-level error messages

### Design Tokens based on aupp theme color
- **Primary Color**: Navy (#003070)
- **Accent Color**: Crimson (#AD0000)
- **Avatar Colors**: 4-color palette (Blue, Green, Orange, Purple)
- **Responsive Design**: Mobile-first with sidebar toggle on small screens


## 🔄 Routing Reference

### Participant Routes
- `#/user/events` - Browse all events
- `#/user/my-registrations` - View personal registrations

### Admin Routes
- `#/admin/login` - Login page
- `#/admin/participants` - Participant management (requires authentication)
