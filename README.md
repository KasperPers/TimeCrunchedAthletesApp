# TimeCrunchedAthletesApp
TimeCrunchedAthletes App is a app, that suggest workout based on the time you have available. Workouts are suggested based on your recent Strava activities and then suggested workout from Zwift workout library.

## Setup

### Prerequisites
- Strava API credentials (Client ID and Client Secret)
- Zwift account (if using Zwift integration)

### Configuration

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Strava API credentials to the `.env` file:
   - Get your credentials from https://www.strava.com/settings/api
   - Update `STRAVA_CLIENT_ID` with your Client ID
   - Update `STRAVA_CLIENT_SECRET` with your Client Secret

3. (Optional) Add Zwift credentials if needed

### Environment Variables

The application uses the following environment variables:

- `STRAVA_CLIENT_ID`: Your Strava application Client ID
- `STRAVA_CLIENT_SECRET`: Your Strava application Client Secret

**Note:** Never commit the `.env` file to version control. It contains sensitive credentials.
