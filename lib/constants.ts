export const generateTestTranscript = () => {
  return `Good morning, Mrs. Alvarez? Yes, that’s me. Hi, I’m Dr. Chen, I’ll be meeting with you today. Let me just sanitize my hands real quick. Do you prefer Mrs. Alvarez or Maria? Maria’s fine. Perfect, Maria. Can you tell me what brought you in today? Well, I’ve had this lump in my breast for a couple of months now. At first, I thought it was just hormonal, but it hasn’t gone away. Okay, I see. Have you noticed any changes in the size of the lump, or any pain? It feels like it’s gotten a little bigger, and sometimes I get tenderness in that area. Any discharge, skin changes, or swelling under your arm? No discharge, but I’ve noticed the skin looks a little dimpled around it. Alright. Have you ever had anything like this before? No, this is the first time. Any history of breast cancer in your family? My aunt on my mother’s side had it, she was diagnosed in her 50s. Thank you for sharing that. Are you currently on any medications or treatments? Just for my cholesterol—atorvastatin. Okay. I want to be thorough here. We’ll need to schedule imaging—like a mammogram and possibly an ultrasound—and depending on the results, a biopsy to better understand what’s going on. If it does turn out to be cancer, there are some clinical trials right now for patients with early-stage breast cancer. Would you like me to share more about those? Yes, I’d like to know what options are out there. Some involve newer targeted therapies or immunotherapy, and many cover treatment costs and additional support. They usually take place at our hospital or a nearby center. If you’re open to it, I’ll connect you with our clinical trial coordinator so you can review which ones might fit your situation. That would be great, thank you.`
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

// Medical diagnosis keywords for clinical trials search simplification
export const DIAGNOSIS_KEYWORDS = {
  // Cancer types
  'breast cancer': ['breast cancer', 'breast neoplasm', 'mammary carcinoma', 'ductal carcinoma', 'lobular carcinoma'],
  'lung cancer': ['lung cancer', 'lung neoplasm', 'pulmonary carcinoma', 'non-small cell lung cancer', 'nsclc', 'small cell lung cancer', 'sclc'],
  'prostate cancer': ['prostate cancer', 'prostate neoplasm', 'prostatic carcinoma', 'adenocarcinoma of prostate'],
  'colorectal cancer': ['colorectal cancer', 'colon cancer', 'rectal cancer', 'bowel cancer', 'intestinal cancer'],
  'pancreatic cancer': ['pancreatic cancer', 'pancreatic neoplasm', 'pancreatic adenocarcinoma'],
  'ovarian cancer': ['ovarian cancer', 'ovarian neoplasm', 'ovarian carcinoma'],
  'melanoma': ['melanoma', 'malignant melanoma', 'skin cancer', 'cutaneous melanoma'],
  'leukemia': ['leukemia', 'leukaemia', 'blood cancer', 'acute lymphoblastic leukemia', 'chronic lymphocytic leukemia'],
  'lymphoma': ['lymphoma', 'hodgkin lymphoma', 'non-hodgkin lymphoma', 'burkitt lymphoma'],
  'brain cancer': ['brain cancer', 'brain tumor', 'glioblastoma', 'meningioma', 'astrocytoma'],
  'liver cancer': ['liver cancer', 'hepatocellular carcinoma', 'hepatoma', 'liver neoplasm'],
  'kidney cancer': ['kidney cancer', 'renal cancer', 'renal cell carcinoma', 'nephroma'],
  'bladder cancer': ['bladder cancer', 'bladder neoplasm', 'urothelial carcinoma'],
  'cervical cancer': ['cervical cancer', 'cervical neoplasm', 'cervical carcinoma'],
  'endometrial cancer': ['endometrial cancer', 'uterine cancer', 'endometrial carcinoma'],
  'thyroid cancer': ['thyroid cancer', 'thyroid neoplasm', 'papillary thyroid carcinoma'],
  'cancer': ['cancer', 'carcinoma', 'neoplasm', 'tumor', 'malignancy', 'oncology'],

  // Cardiovascular
  'hypertension': ['hypertension', 'high blood pressure', 'elevated blood pressure', 'arterial hypertension'],
  'heart disease': ['heart disease', 'cardiac disease', 'cardiovascular disease', 'coronary artery disease', 'cad'],
  'heart failure': ['heart failure', 'congestive heart failure', 'chf', 'cardiac failure'],
  'arrhythmia': ['arrhythmia', 'irregular heartbeat', 'atrial fibrillation', 'afib', 'ventricular tachycardia'],
  'myocardial infarction': ['myocardial infarction', 'heart attack', 'mi', 'acute coronary syndrome'],
  'stroke': ['stroke', 'cerebrovascular accident', 'cva', 'brain attack', 'ischemic stroke', 'hemorrhagic stroke'],
  'peripheral artery disease': ['peripheral artery disease', 'pad', 'peripheral vascular disease', 'pvd'],

  // Respiratory
  'copd': ['copd', 'chronic obstructive pulmonary disease', 'obstructive pulmonary', 'emphysema', 'chronic bronchitis'],
  'asthma': ['asthma', 'bronchial asthma', 'allergic asthma', 'exercise-induced asthma'],
  'pneumonia': ['pneumonia', 'lung infection', 'bacterial pneumonia', 'viral pneumonia'],
  'pulmonary fibrosis': ['pulmonary fibrosis', 'lung fibrosis', 'idiopathic pulmonary fibrosis', 'ipf'],
  'sleep apnea': ['sleep apnea', 'obstructive sleep apnea', 'osa', 'sleep disorder'],

  // Endocrine/Metabolic
  'diabetes': ['diabetes', 'diabetes mellitus', 'diabetic', 'type 1 diabetes', 'type 2 diabetes', 'glucose intolerance'],
  'thyroid disorder': ['thyroid disorder', 'hypothyroidism', 'hyperthyroidism', 'thyroid dysfunction'],
  'obesity': ['obesity', 'overweight', 'morbid obesity', 'weight management'],
  'metabolic syndrome': ['metabolic syndrome', 'insulin resistance', 'prediabetes'],

  // Neurological
  'alzheimer': ['alzheimer', 'alzheimer disease', 'dementia', 'cognitive decline', 'memory loss'],
  'parkinson': ['parkinson', 'parkinson disease', 'parkinsons', 'movement disorder'],
  'multiple sclerosis': ['multiple sclerosis', 'ms', 'demyelinating disease'],
  'epilepsy': ['epilepsy', 'seizure disorder', 'seizures', 'convulsions'],
  'migraine': ['migraine', 'headache', 'severe headache', 'chronic headache'],
  'depression': ['depression', 'major depression', 'clinical depression', 'depressive disorder'],
  'anxiety': ['anxiety', 'anxiety disorder', 'generalized anxiety', 'panic disorder'],
  'bipolar disorder': ['bipolar disorder', 'manic depression', 'bipolar'],
  'schizophrenia': ['schizophrenia', 'psychosis', 'schizoaffective disorder'],

  // Autoimmune/Inflammatory
  'rheumatoid arthritis': ['rheumatoid arthritis', 'ra', 'inflammatory arthritis'],
  'lupus': ['lupus', 'systemic lupus erythematosus', 'sle', 'autoimmune disease'],
  'crohn disease': ['crohn disease', 'crohns disease', 'inflammatory bowel disease', 'ibd'],
  'ulcerative colitis': ['ulcerative colitis', 'uc', 'inflammatory bowel disease', 'ibd'],
  'psoriasis': ['psoriasis', 'psoriatic arthritis', 'skin disorder'],
  'fibromyalgia': ['fibromyalgia', 'chronic pain', 'widespread pain'],

  // Infectious diseases
  'hiv': ['hiv', 'human immunodeficiency virus', 'aids', 'acquired immunodeficiency syndrome'],
  'hepatitis': ['hepatitis', 'hepatitis b', 'hepatitis c', 'liver inflammation'],
  'tuberculosis': ['tuberculosis', 'tb', 'mycobacterium tuberculosis'],

  // Kidney/Urinary
  'chronic kidney disease': ['chronic kidney disease', 'ckd', 'kidney failure', 'renal disease', 'end stage renal disease'],
  'kidney stones': ['kidney stones', 'renal calculi', 'nephrolithiasis', 'urinary stones'],

  // Gastrointestinal
  'gastroesophageal reflux': ['gastroesophageal reflux', 'gerd', 'acid reflux', 'heartburn'],
  'irritable bowel syndrome': ['irritable bowel syndrome', 'ibs', 'spastic colon'],
  'peptic ulcer': ['peptic ulcer', 'stomach ulcer', 'gastric ulcer', 'duodenal ulcer'],

  // Bone/Joint
  'osteoporosis': ['osteoporosis', 'bone loss', 'bone density loss'],
  'osteoarthritis': ['osteoarthritis', 'degenerative arthritis', 'joint disease'],

  // Blood disorders
  'anemia': ['anemia', 'iron deficiency', 'low hemoglobin', 'blood disorder'],
  'thrombosis': ['thrombosis', 'blood clot', 'deep vein thrombosis', 'dvt', 'pulmonary embolism'],

  // Other common conditions
  'chronic fatigue syndrome': ['chronic fatigue syndrome', 'cfs', 'myalgic encephalomyelitis'],
  'macular degeneration': ['macular degeneration', 'age-related macular degeneration', 'amd', 'vision loss'],
  'glaucoma': ['glaucoma', 'increased eye pressure', 'optic nerve damage'],
} as const

export function simplifyDiagnosis(diagnosis: string): string {
  const lower = diagnosis.toLowerCase()
  
  for (const [key, keywords] of Object.entries(DIAGNOSIS_KEYWORDS)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return key
    }
  }
  
  return diagnosis
}
