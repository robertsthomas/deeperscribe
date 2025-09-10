export const EXAMPLE_TRANSCRIPT = `Doctor: Good morning, Mrs. Anderson. How are you feeling today?

Patient: Good morning, Dr. Williams. I've been having some concerning symptoms that I wanted to discuss with you. I'm 58 years old, and over the past few months, I've been experiencing some chest discomfort and shortness of breath, especially when I'm walking upstairs or doing any physical activity.

Doctor: I see. Can you describe the chest discomfort in more detail? Is it a sharp pain, pressure, or something else?

Patient: It feels more like pressure or tightness in my chest, almost like someone is squeezing it. It usually happens when I exert myself, and it goes away when I rest for a few minutes.

Doctor: How long have you been experiencing these symptoms?

Patient: About three months now. At first, I thought it was just because I was out of shape, but it's been getting progressively worse. Even walking to the mailbox sometimes triggers it now.

Doctor: Have you experienced any other symptoms along with the chest pressure and shortness of breath?

Patient: Yes, sometimes I feel a bit dizzy or lightheaded, especially when the chest pressure is really bad. And I've noticed I get tired much more easily than I used to. Oh, and a couple of times I've had some nausea.

Doctor: I understand. Let me ask about your medical history. Do you have any existing medical conditions or take any medications?

Patient: I have high blood pressure, and I've been taking lisinopril for that for about five years now. My mother had heart disease, and my father had diabetes. I also take a multivitamin daily.

Doctor: Any known allergies to medications?

Patient: Yes, I'm allergic to penicillin - it gives me a severe rash.

Doctor: Are you currently employed, and if so, what type of work do you do?

Patient: I work as an accountant here in Denver, Colorado. It's mostly desk work, but lately, even walking from the parking lot to my office building has been difficult.

Doctor: Based on what you're describing - the chest pressure with exertion, shortness of breath, and associated symptoms, along with your family history and existing hypertension - I'm concerned this could be related to coronary artery disease or angina. 

Patient: That sounds serious. What does that mean exactly?

Doctor: Coronary artery disease occurs when the blood vessels that supply your heart muscle become narrowed or blocked. This can cause the symptoms you're experiencing, particularly during physical activity when your heart needs more oxygen. The good news is that this is a very treatable condition.

Doctor: I'd like to run some tests to confirm the diagnosis. We'll start with an EKG and some blood work today, and I'd also like to schedule you for a stress test next week.

Patient: Okay, whatever you think is best. Should I be worried about having a heart attack?

Doctor: While coronary artery disease does increase the risk of heart attack, catching it early like we're doing gives us many options for treatment. In the meantime, I want you to avoid any strenuous physical activity, and if you experience severe chest pain, call 911 immediately.

Doctor: I'm also going to start you on a low-dose aspirin daily, unless you have any contraindications, and we may need to adjust your blood pressure medication. We'll also discuss lifestyle modifications like diet and exercise once we have your test results.

Patient: Thank you, Dr. Williams. I'm glad I came in. When will I know the results of the tests?

Doctor: We should have your blood work back by tomorrow, and I'll call you with those results. The stress test results we'll review together at your follow-up appointment next week. My nurse will schedule that for you before you leave today.`

export const EXPECTED_EXTRACTION = {
  age: 58,
  sex: 'female' as const,
  diagnosis: 'Suspected coronary artery disease/angina',
  conditions: ['Hypertension'],
  symptoms: ['Chest pressure', 'Shortness of breath', 'Dizziness', 'Fatigue', 'Nausea'],
  medications: ['Lisinopril', 'Multivitamin'],
  allergies: ['Penicillin'],
  location: {
    city: 'Denver',
    state: 'Colorado',
    country: 'United States'
  }
}
