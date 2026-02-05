# Balungpisah Admin Dashboard

A modern, responsive admin dashboard built with Next.js 15, TypeScript, and Tailwind CSS for monitoring and managing the Balungpisah citizen reporting system.

## Features

### Dashboard Overview

- Real-time statistics and metrics
- Interactive charts using Recharts
  - Status distribution (Pie chart)
  - Category reports (Bar chart)
  - Report type distribution (Horizontal bar chart)
- Recent reports feed
- Weekly and monthly trends

### Reports Management

- Comprehensive report listing with pagination
- Advanced search and filtering
- Detailed report view with all metadata
- Status update functionality
- Category and severity indicators
- Location information display
- Timeline and impact tracking

### Tickets Tracking

- View all citizen report tickets
- Reference number tracking
- Status monitoring
- Confidence score visualization
- Platform identification

### Categories & Locations

- Category-wise report distribution
- Province-level location analysis
- Visual representation with icons and colors

### Settings

- Rate limit configuration management
- Real-time updates
- Admin-only access control

### Modern UI/UX

- Responsive design for all screen sizes
- Smooth animations and transitions
- Clean, professional interface
- Mobile-friendly sidebar navigation
- Loading states and error handling

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Formatting**: date-fns

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Access to Balungpisah API

## Installation

1. **Clone or extract the project**:

   ```bash
   cd balungpisah-dashboard
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   Replace `http://localhost:8000` with actual balungpisah-core API URL.

4. **Start the development server**:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
balungpisah-dashboard/
├── app/
│   ├── dashboard/
│   │   ├── categories/          # Categories page
│   │   ├── contributors/        # Contributors page (placeholder)
│   │   ├── expectations/        # Expectations page (placeholder)
│   │   ├── locations/           # Locations page
│   │   ├── reports/             # Reports listing and detail
│   │   │   └── [id]/           # Individual report page
│   │   ├── settings/            # Settings page
│   │   ├── tickets/             # Tickets page
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   └── page.tsx            # Dashboard overview
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Login page
├── lib/
│   ├── api-client.ts           # API client with all endpoints
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Utility functions
├── public/                     # Static assets
├── .env.local.example          # Environment variables template
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## API Integration

The dashboard integrates with the following API endpoints:

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Dashboard

- `GET /api/dashboard/summary` - Dashboard statistics
- `GET /api/dashboard/recent` - Recent reports
- `GET /api/dashboard/by-category` - Reports by category
- `GET /api/dashboard/by-location` - Reports by location
- `GET /api/dashboard/by-tag` - Reports by tag
- `GET /api/dashboard/map` - Map data

### Reports

- `GET /api/dashboard/reports` - List all reports
- `GET /api/dashboard/reports/{id}` - Get report details
- `PATCH /api/reports/{id}/status` - Update report status

### Tickets

- `GET /api/tickets` - List all tickets

### Settings

- `GET /api/admin/rate-limits` - Get rate limit configs
- `PUT /api/admin/rate-limits/{key}` - Update rate limit

## Default Login

The application uses balungpisah-core authentication system.

## Features to Implement

The following features have placeholder pages and can be implemented:

1. **Expectations Management**: Connect to `/api/expectations` endpoint
2. **Contributors Management**: Connect to `/api/contributors/*` endpoints
3. **Advanced Filtering**: Add filter dropdowns for status, category, location
4. **Export Functionality**: Implement CSV/Excel export for reports and tickets
5. **Real-time Updates**: Add WebSocket support for live dashboard updates
6. **User Management**: Add user administration features
7. **Analytics**: Enhanced charts and statistics

## Customization

### Changing Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: { ... },  // Main brand color
      accent: { ... },   // Accent color
    },
  },
}
```

### Adding New Pages

1. Create a new folder in `app/dashboard/`
2. Add a `page.tsx` file
3. Add the route to sidebar in `app/dashboard/layout.tsx`

### Modifying Charts

Charts are configured in `app/dashboard/page.tsx` using Recharts. Refer to [Recharts documentation](https://recharts.org/) for customization options.

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure balungpisah-core API allows requests from `http://localhost:3000` during development.

### Authentication Errors

- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Verify balungpisah-core API is running and accessible
- Check browser console for detailed error messages

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Performance Optimization

- All pages use client-side data fetching for real-time updates
- Images are optimized using Next.js Image component
- Code splitting is automatic with Next.js App Router
- Tailwind CSS purges unused styles in production

## Security Considerations

- JWT tokens are stored in localStorage
- All API requests include authentication headers
- 401 responses automatically redirect to login
- Admin-only routes require proper authorization

## License

This dashboard is part of the Balungpisah project.

## Support

For issues or questions, please contact the development team or create an issue in the project repository.

---

**Built with ❤️ for Balungpisah**
