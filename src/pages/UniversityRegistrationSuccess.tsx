import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UniversityRegistrationSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-3xl">Registration Successful!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Thank you for registering your university
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Main Message */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
              <p className="text-blue-900 dark:text-blue-100 font-medium">
                Your verification is under review
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                Our team will verify your information within 2-3 business days. You'll receive an email notification once your status changes.
              </p>
            </div>

            {/* What Happens Next */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">What happens next:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-0.5">1.</span>
                  <span>We verify your university details and documentation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-0.5">2.</span>
                  <span>Once approved, you'll receive access to issue credentials</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-0.5">3.</span>
                  <span>You can then register with your wallet and start issuing blockchain certificates</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Questions?</p>
              <a
                href="mailto:support@verifai.edu"
                className="text-primary hover:underline font-medium"
              >
                Contact our support team
              </a>
            </div>

            {/* Return Button */}
            <Button
              onClick={() => navigate('/')}
              className="w-full"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Reference ID: <code className="bg-muted px-2 py-1 rounded">{Date.now()}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
