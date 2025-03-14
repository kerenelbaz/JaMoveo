# JaMoveo Project
Jamoveo is a rehearsal room organizer for a Moveo's employess. The system allows all participants to enter a rehearsal session and wait for the manager to select a song for performance. Once the manager selects a song, all connected users are automatically redirected to the song page, where they can begin the rehearsal. Musicians see the chords and lyrics, while singers see only the lyrics. Songs are fetched from the website Tab4U using a web scraper.
When the manager ends the song, users are redirected back to the waiting page until a new song is selected.

## Running the Project
The server is deployed on Railway, but due to deployment issues, the client-side application is only available locally. You can run the client using the following command: `npm run dev`

## Technologies:
- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: React.js
- **Additional**: Web scraping with Puppeteer, Socket.io for real-time updates


