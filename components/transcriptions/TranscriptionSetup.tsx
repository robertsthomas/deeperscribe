import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { User } from 'lucide-react'

interface TranscriptionSetupProps {
  tempDoctorName: string
  setTempDoctorName: (name: string) => void
  onSetDoctorName: (name: string) => void
}

export function TranscriptionSetup({ 
  tempDoctorName, 
  setTempDoctorName, 
  onSetDoctorName 
}: TranscriptionSetupProps) {
  const handleSubmit = () => {
    if (tempDoctorName.trim()) {
      onSetDoctorName(tempDoctorName.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Setup Required
          </CardTitle>
          <CardDescription>
            Please enter the doctor&apos;s name to begin transcription sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctor-name">Doctor&apos;s Name</Label>
            <input
              id="doctor-name"
              type="text"
              placeholder="e.g., Smith"
              value={tempDoctorName}
              onChange={(e) => setTempDoctorName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!tempDoctorName.trim()}
          >
            Start Transcription
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
