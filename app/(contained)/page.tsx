"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { usePatientManager, type Patient } from "@/hooks/usePatientManager"

export default function HomePage() {
  const router = useRouter()
  const { patients, addPatient, removePatient } = usePatientManager()

  const startTranscription = (id: string) => {
    router.push(`/patient/${id}/transcribe`)
  }

  const handleAddPatient = () => {
    addPatient({
      id: `p${Date.now()}`,
      name: `New Patient ${patients.length + 1}`,
      appointment: "Today • 11:00 AM",
    })
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-2">Select a patient</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Choose the scheduled patient to begin a transcription session.
      </p>

      <div className="mb-6">
        <Button variant="outline" onClick={handleAddPatient}>
          Add patient
        </Button>
      </div>

      <div className="space-y-3">
        {patients.map((patient: Patient) => (
          <Card key={patient.id} className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{patient.name}</CardTitle>
                <CardDescription>{patient.appointment}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => startTranscription(patient.id)} size="sm">
                  Start Appointment
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removePatient(patient.id)}
                >
                  Remove
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
