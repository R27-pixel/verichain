import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversityRegistrationForm } from '@/components/UniversityRegistrationForm';
import { UniversityRegistrationFormData } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Loader2 } from 'lucide-react';

export default function UniversityRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: UniversityRegistrationFormData) => {
    setIsLoading(true);

    try {
      // Call the backend edge function
      const { data: responseData, error: functionError } = await supabase.functions.invoke(
        'register-university',
        {
          body: {
            legalName: data.legalName,
            type: data.type,
            state: data.state,
            ugcReference: data.ugcReference || undefined,
            aisheCode: data.aisheCode || undefined,
            websiteDomain: data.websiteDomain.toLowerCase(),
            registrarOfficialEmail: data.registrarOfficialEmail.toLowerCase(),
            walletAddress: data.walletAddress.toLowerCase(),
          },
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to register university');
      }

      if (responseData?.error) {
        throw new Error(
          responseData.details 
            ? Object.values(responseData.details)[0] as string
            : responseData.error
        );
      }

      toast({
        title: 'Registration Successful',
        description: 'Your university registration has been submitted for verification.',
      });

      // Redirect to success page after 1 second
      setTimeout(() => {
        navigate('/university/success');
      }, 1000);
    } catch (error: any) {
      console.error('Error submitting registration:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to submit registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground">University Registration</h1>
            <p className="text-lg text-muted-foreground">
              Register your university to verify and issue blockchain-based credentials
            </p>
          </div>

          {/* Registration Form Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                Please provide accurate information as it will be verified by our team. All fields marked with * are mandatory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UniversityRegistrationForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              For support with your registration, please contact{' '}
              <a href="mailto:support@verifai.edu" className="font-semibold hover:underline">
                support@verifai.edu
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
