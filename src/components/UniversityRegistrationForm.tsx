import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  universityRegistrationSchema,
  UniversityRegistrationFormData,
  INDIAN_STATES_AND_UTS,
  UNIVERSITY_TYPES,
} from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';
import { Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UniversityRegistrationFormProps {
  onSubmit: (data: UniversityRegistrationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function UniversityRegistrationForm({
  onSubmit,
  isLoading = false,
}: UniversityRegistrationFormProps) {
  const { toast } = useToast();
  const form = useForm<UniversityRegistrationFormData>({
    resolver: zodResolver(universityRegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      legalName: '',
      type: undefined,
      state: undefined,
      ugcReference: '',
      aisheCode: '',
      websiteDomain: '',
      registrarOfficialEmail: '',
      walletAddress: '',
    },
  });

  const handleFormSubmit = async (data: UniversityRegistrationFormData) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit registration',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Legal Name */}
        <FormField
          control={form.control}
          name="legalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>University Legal Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter official university name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                The official legal name of the university as registered
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* University Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>University Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select university type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UNIVERSITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Category of the university
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* State */}
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State / Union Territory *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state or union territory" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDIAN_STATES_AND_UTS.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* UGC Reference */}
        <FormField
          control={form.control}
          name="ugcReference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UGC Reference ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., UGC-REF-2024-001"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Optional: UGC reference number if available
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* AISHE Code */}
        <FormField
          control={form.control}
          name="aisheCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AISHE Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., A-123456"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Optional: All India Survey on Higher Education code (format: A-123456)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website Domain */}
        <FormField
          control={form.control}
          name="websiteDomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Domain *</FormLabel>
              <FormControl>
                <Input
                  placeholder="example.edu.in"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Domain only (without http/https protocol)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Registrar Official Email */}
        <FormField
          control={form.control}
          name="registrarOfficialEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registrar Official Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="registrar@university.edu.in"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Must match university domain or end with .edu.in/.ac.in
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Wallet Address */}
        <FormField
          control={form.control}
          name="walletAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wallet Public Address *</FormLabel>
              <FormControl>
                <Input
                  placeholder="0x..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Ethereum wallet address for receiving credential issuance rights
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            All fields marked with * are mandatory. Please ensure all information is accurate as it will be verified by our team.
          </AlertDescription>
        </Alert>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Submitting...' : 'Submit Registration'}
        </Button>
      </form>
    </Form>
  );
}
