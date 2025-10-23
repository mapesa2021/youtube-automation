# YouTube Automation Course - Payment Integration

A complete landing page with Zeno payment integration for YouTube Automation course enrollment.

## 🚀 Features

- **Beautiful Landing Page**: Mobile-optimized design with Swahili content
- **Custom Popup Modal**: Professional payment form matching site design
- **Zeno Payment Integration**: Secure mobile money payments via backend API
- **Real-time Validation**: Phone number validation and error handling
- **Success/Error Messages**: Beautiful modal notifications
- **Mobile Optimized**: Haptic feedback and responsive design

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd youtube-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server** (for local development)
   ```bash
   node server.js
   ```
   The API server will run on `http://localhost:3001`

4. **Start the frontend server** (in a new terminal)
   ```bash
   python3 -m http.server 8000
   ```
   The website will be available at `http://localhost:8000`

## 📱 How It Works

1. **User clicks "JIUNGE NA PROGRAM →"** button
2. **Custom popup appears** asking for phone number
3. **User enters phone number** (Tshs 5,000)
4. **Frontend calls backend API** (`/.netlify/functions/process-payment`)
5. **Backend processes payment** via Zeno API
6. **Success/Error message** displayed to user

## 🔧 API Endpoints

### POST `/.netlify/functions/process-payment`
Processes mobile money payment via Zeno API.

**Request Body:**
```json
{
  "phoneNumber": "0712345678"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Malipo yamepokelewa kwa mafanikio!",
  "orderId": "yt_auto_1234567890_abc123",
  "phoneNumber": "0712345678",
  "amount": 5000
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Nambari ya simu si sahihi"
}
```

### GET `/.netlify/functions/payment-status`
Check payment status via Zeno API.

**Query Parameters:**
```
orderId=yt_auto_1234567890_abc123
```

### GET `/.netlify/functions/health`
Health check endpoint.

## 🔐 Security Features

- **Backend API Key**: Zeno API key stored securely on server
- **Input Validation**: Phone number validation on both frontend and backend
- **Error Handling**: Comprehensive error handling and user feedback
- **CORS Protection**: Proper CORS configuration

## 📦 Project Structure

```
youtube-automation/
├── index.html              # Main landing page
├── styles.css              # Styling
├── server.js               # Backend API server (for local development)
├── netlify/                # Netlify Functions
│   └── functions/          # Serverless functions
│       ├── process-payment.js
│       ├── payment-status.js
│       └── health.js
├── netlify.toml            # Netlify configuration
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## 🎨 Customization

### Changing the Price
Update the amount in `netlify/functions/process-payment.js`:
```javascript
amount: 5000 // Change this value
```

### Modifying Course Details
Update the hardcoded values in `netlify/functions/process-payment.js`:
```javascript
buyer_email: "student@youtubeautomation.com",
buyer_name: "YouTube Automation Student",
```

### Styling Changes
All popup styles are inline in `index.html` for reliability.

## 🚀 Deployment

### Netlify Deployment (Recommended)
This project is configured to work with Netlify Functions:

1. Connect your GitHub repository to Netlify
2. Set the build command to: `# no build command`
3. Set the publish directory to: `.`
4. Deploy!

Netlify will automatically detect and deploy the serverless functions.

### Traditional Backend Deployment
For traditional deployment, use the Node.js server:

Deploy the Node.js server to platforms like:
- Heroku
- Railway
- DigitalOcean
- AWS

And deploy the static files to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## 📞 Support

For issues or questions, please contact the development team.

---

**Note**: When deploying to Netlify, the API endpoints are automatically mapped:
- `/api/process-payment` → `/.netlify/functions/process-payment`
- `/api/payment-status` → `/.netlify/functions/payment-status`
- `/api/health` → `/.netlify/functions/health`