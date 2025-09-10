export const generateTestTranscript = () => {
  return `Good morning, Mr. Johnson? Yes, that's me. Hi, I'm Dr. Patel, I'll be seeing you today. Let me wash my hands real quick. Do you prefer Mr. Johnson or Daniel? Daniel's fine. Great, Daniel. Can you tell me what brought you in today? Well, I've been really short of breath lately. It started a couple weeks ago and seems to be getting worse. Okay, anything else besides the shortness of breath? Yeah, I've got this nagging cough that doesn't go away. It's worse at night. How long has the cough been going on? About a month. I thought it was allergies at first. Any history of lung problems? Asthma, COPD? No asthma. I was a smoker, quit about five years ago. I smoked for almost 20 years before that. Got it. Any other medical issues? High blood pressure, I take lisinopril for that. Okay, family history? My dad had emphysema, my mom's healthy. Thank you. I'm asking because there are some clinical trials right now for patients with chronic cough and early COPD symptoms, even if you haven't been formally diagnosed. Would you be interested in hearing about that? Possibly, yeah. What would it involve? Usually they look at new inhaled therapies. Some require a few office visits and breathing tests. Many cover travel and medication costs. That sounds like something I'd be willing to learn more about. Great, I'll have my coordinator give you the list of local trial options. Some are at our hospital here, others nearby. We'll see if you qualify.`
}

export const PATIENT_PROFILE_KEYS = {
  DOCTOR_NAME: 'deeperscribe-doctor-name',
  NAME_VISIBILITY: 'deeperscribe-name-visibility',
} as const

export const SESSION_STORAGE_KEYS = {
  PATIENT_PROFILE: 'patientProfile',
  CONFIDENCE: 'confidence',
  ORIGINAL_TRANSCRIPT: 'originalTranscript',
  TRIALS_DATA: 'trialsData',
} as const

// LocalStorage keys for patient management
export const LOCAL_STORAGE_KEYS = {
  PATIENTS: 'deeperscribe-patients',
} as const

export function patientStorageKey(
  patientId: string,
  item: 'profile' | 'confidence' | 'transcript' | 'trials' | 'formattedTranscript' | 'keyMoments'
) {
  return `deeperscribe-patient-${patientId}-${item}`
}

// Per-transcription storage
export function transcriptionStorageKey(
  patientId: string,
  transcriptionId: string,
  item: 'formattedTranscript' | 'keyMoments' | 'trials' | 'createdAt'
) {
  return `deeperscribe-patient-${patientId}-tx-${transcriptionId}-${item}`
}

export function generateTranscriptionId() {
  // Simple sortable ID YYYYMMDDHHMMSS-rand
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const id = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${Math.random().toString(36).slice(2, 6)}`
  return id
}
