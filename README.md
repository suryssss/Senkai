# Senkai — Architecture Intelligence Engine
**Senkai** is an AI-powered system design and architecture analysis platform that allows engineers and students to visually design backend systems, simulate failures, and detect architectural risks before building.
It transforms system design from guesswork into measurable intelligence.


##  What This Project Does

Senkai lets users:

- Design backend architectures visually (like Figma for system design)
- Simulate real-world system behavior
- Detect bottlenecks & single points of failure
- Analyze latency risks
- Predict which service fails first under load
- Generate AI-powered architecture suggestions
- Export professional architecture risk reports

##  Key Features

###  Visual Architecture Builder
- Drag-and-drop system design canvas  
- Add services like API, database, cache, queue, auth, etc.  
- Connect services with latency configuration  
- Figma-style interactive design experience  

###  Risk Analysis Engine
- Bottleneck detection (load vs capacity)
- Single point of failure detection
- Critical path latency analysis
- Overall architecture risk score

###  Failure & Load Simulation
- Predict weakest service in system
- Simulate traffic spikes (20%, 50%, 100%)
- Cascade failure visualization
- System stability analysis


###  Professional PDF Reports
Export architecture reports including:
- System diagram  
- Risk score  
- Bottlenecks & SPOF  
- AI recommendations  
- Executive summary  

---

## 🛠️ Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- React Flow (visual architecture canvas)
- GSAP / Framer Motion
- Axios

### Backend
- Node.js
- Express.js
- Graph-based analysis engine
- Gemini/OpenAI integration for AI suggestions

### Deployment
- Frontend: Vercel
- Backend: Render

---

##  How It Works

1. User designs system visually on canvas  
2. Architecture sent to backend analysis engine  
3. Engine calculates:
   - utilization  
   - SPOF risks  
   - latency  
   - weakest service  
4. AI generates improvement suggestions  
5. Results visualized on canvas + report

## ⚙️ Installation (Local Setup)

### Clone repository
```bash
git clone https://github.com/yourusername/senkai.git
cd senkai
```
##Backend setup
```
cd backend
npm install
npm start
```

#Frontend Setup
```
cd frontend
npm install
npm run dev
```




