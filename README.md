# DeeperScribe Clinical Trials Matcher

## Overview

DeeperScribe is an AI-powered application that analyzes patient-doctor conversation transcripts and matches patients with relevant clinical trials. The app uses OpenAI's GPT models to extract structured patient data from conversational text, then searches ClinicalTrials.gov for matching studies.

**Key Features:**
- Real-time audio transcription using browser speech recognition and OpenAI Whisper
- AI-powered extraction of patient demographics, diagnosis, symptoms, and medical history
- Intelligent clinical trial matching based on patient profile
- Persistent data storage across sessions
- Responsive design with organized component architecture

## Live Demo

**[Deployed on Vercel]** - *Coming Soon*

## Local Setup

### Prerequisites
- Node.js 18+
- pnpm (preferred package manager)
- OpenAI API key

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd deepscribe-thomas
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Add your OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development Assumptions

### Technical Architecture
- **Client-Side Rendering**: Converted from SSR to CSR to eliminate hydration issues and simplify the architecture
- **OpenAI Integration**: Uses `gpt-5-nano` for text processing tasks and `whisper-1` for audio transcription
- **State Management**: Zustand with localStorage persistence for patient data across sessions
- **Component Organization**: Structured components into logical folders (patients/, transcriptions/, shared/)

### AI Model Usage
- **Text Processing**: GPT-5-nano for transcript formatting, patient data extraction, and key moments generation
- **Audio Transcription**: Whisper-1 for high-quality speech-to-text conversion
- **Fallback Strategy**: Browser speech recognition as backup when microphone access fails

### Data Persistence
- **Local Storage**: Patient data, transcripts, and clinical trials persist across browser sessions
- **Transcription-Level Storage**: Multiple clinical trial sets per patient supported
- **No Server Storage**: All data remains client-side for privacy

### Error Handling
- **Simplified API Routes**: Basic error logging with generic 500 responses
- **Graceful Degradation**: Fallback to raw transcript if AI formatting fails
- **User-Friendly Messages**: Clear feedback for recording errors and API failures

### User Experience
- **Independent Scrolling**: Transcript area and settings panel scroll independently
- **Responsive Layout**: Optimized for both desktop and mobile devices
- **Real-Time Feedback**: Live transcription with visual recording indicators
- **Data Validation**: Schema validation with nullable fields for AI model flexibility
