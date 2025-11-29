import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Upload,
  Sparkles,
  Hash,
  Wallet,
  Image as ImageIcon,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { hashJSON, canonicalizeJSON } from '@/lib/crypto';
import { connectWallet, simulateTransaction, isMetaMaskInstalled } from '@/lib/wallet';
import { Tables } from '@/integrations/supabase/types';

type University = Tables<'universities'>['Row'];

interface CredentialData {
  student_name: string;
  university_name: string;
  degree_type: string;
  major: string;
  gpa: string;
  graduation_date: string;
}

export default function Admin() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // University Management State
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);

  // Credential Issuance State
  const [isExtracting, setIsExtracting] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [credentialData, setCredentialData] = useState<CredentialData>({
    student_name: '',
    university_name: '',
    degree_type: '',
    major: '',
    gpa: '',
    graduation_date: '',
  });

  // Fetch universities on mount
  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    setLoadingUniversities(true);
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUniversities(data || []);
    } catch (error: any) {
      console.error('Error fetching universities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load universities',
        variant: 'destructive',
      });
    } finally {
      setLoadingUniversities(false);
    }
  };

  const handleApprove = async (university: University) => {
    try {
      const { error } = await supabase
        .from('universities')
        .update({ verification_status: 'APPROVED' })
        .eq('id', university.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${university.legal_name} has been approved`,
      });

      fetchUniversities();
      setApprovalDialogOpen(false);
      setSelectedUniversity(null);
    } catch (error: any) {
      console.error('Error approving university:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve university',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (university: University) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('universities')
        .update({
          verification_status: 'REJECTED',
        })
        .eq('id', university.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${university.legal_name} has been rejected`,
      });

      fetchUniversities();
      setRejectionDialogOpen(false);
      setRejectionReason('');
      setSelectedUniversity(null);
    } catch (error: any) {
      console.error('Error rejecting university:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject university',
        variant: 'destructive',
      });
    }
  };

  // Credential issuance handlers
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file (JPG, PNG)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsExtracting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setUploadedImage(base64);

        try {
          const { data, error } = await supabase.functions.invoke('extract-credential', {
            body: { imageBase64: base64 },
          });

          if (error) throw error;
          if (data.error) throw new Error(data.error);

          setCredentialData(data.data);
          setShowForm(true);

          toast({
            title: 'Extraction Complete',
            description: 'Credential data has been extracted. Review and edit if needed.',
          });
        } catch (err: any) {
          console.error('Extraction error:', err);
          toast({
            title: 'Extraction Failed',
            description: err.message || 'Failed to extract credential data',
            variant: 'destructive',
          });
        } finally {
          setIsExtracting(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('File read error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to read file',
        variant: 'destructive',
      });
      setIsExtracting(false);
    }
  };

  const handleSimulateExtraction = () => {
    setIsExtracting(true);

    setTimeout(() => {
      setCredentialData({
        student_name: 'Alex Chen',
        university_name: 'Stanford University',
        degree_type: 'Bachelor of Science',
        major: 'Computer Science',
        gpa: '3.9',
        graduation_date: '2023',
      });
      setShowForm(true);
      setIsExtracting(false);

      toast({
        title: 'Simulation Complete',
        description: 'Demo credential data loaded. You can now edit and issue.',
      });
    }, 1500);
  };

  const handleInputChange = (field: keyof CredentialData, value: string) => {
    setCredentialData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIssue = async () => {
    const emptyFields = Object.entries(credentialData).filter(([_, value]) => !value);
    if (emptyFields.length > 0) {
      toast({
        title: 'Incomplete Data',
        description: 'Please fill in all credential fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!isMetaMaskInstalled()) {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask to issue credentials.',
        variant: 'destructive',
      });
      return;
    }

    setIsIssuing(true);

    try {
      const walletAddress = await connectWallet();
      const canonical = canonicalizeJSON(credentialData);
      const hash = await hashJSON(credentialData);
      const transactionId = await simulateTransaction(hash);

      const { error } = await supabase.from('credentials').insert({
        student_name: credentialData.student_name,
        university_name: credentialData.university_name,
        degree_type: credentialData.degree_type,
        major: credentialData.major,
        gpa: credentialData.gpa,
        graduation_date: credentialData.graduation_date,
        credential_hash: hash,
        wallet_address: walletAddress,
        transaction_id: transactionId,
        raw_json: canonical,
      });

      if (error) throw error;

      toast({
        title: 'Credential Issued Successfully',
        description: `Hash: ${hash.slice(0, 16)}...`,
      });

      setCredentialData({
        student_name: '',
        university_name: '',
        degree_type: '',
        major: '',
        gpa: '',
        graduation_date: '',
      });
      setShowForm(false);
      setUploadedImage(null);
    } catch (error: any) {
      console.error('Error issuing credential:', error);
      toast({
        title: 'Issuance Failed',
        description: error.message || 'Failed to issue credential',
        variant: 'destructive',
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setUploadedImage(null);
    setCredentialData({
      student_name: '',
      university_name: '',
      degree_type: '',
      major: '',
      gpa: '',
      graduation_date: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge className="bg-green-50 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="bg-red-50 text-red-800">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingCount = universities.filter((u) => u.verification_status === 'PENDING').length;
  const approvedCount = universities.filter((u) => u.verification_status === 'APPROVED').length;
  const rejectedCount = universities.filter((u) => u.verification_status === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Manage university registrations and issue credentials
            </p>
          </div>

          <Tabs defaultValue="universities" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="universities" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Universities ({universities.length})
              </TabsTrigger>
              <TabsTrigger value="credentials" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Issue Credentials
              </TabsTrigger>
            </TabsList>

            {/* Universities Tab */}
            <TabsContent value="universities" className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Approved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Rejected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Universities Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>University Registrations</CardTitle>
                      <CardDescription>
                        Review and approve/reject university registrations
                      </CardDescription>
                    </div>
                    <Button onClick={fetchUniversities} variant="outline" size="sm">
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingUniversities ? (
                    <div className="flex justify-center py-8">
                      <Sparkles className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : universities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No universities registered yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>University Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {universities.map((university) => (
                            <TableRow key={university.id}>
                              <TableCell className="font-medium">
                                {university.legal_name}
                              </TableCell>
                              <TableCell>{university.type}</TableCell>
                              <TableCell>{university.state}</TableCell>
                              <TableCell className="text-sm">
                                {university.registrar_official_email}
                              </TableCell>
                              <TableCell>{getStatusBadge(university.verification_status)}</TableCell>
                              <TableCell className="space-x-2">
                                <Button
                                  onClick={() => {
                                    setSelectedUniversity(university);
                                    setApprovalDialogOpen(true);
                                  }}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Eye className="mr-1 h-4 w-4" />
                                  Details
                                </Button>

                                {university.verification_status === 'PENDING' && (
                                  <>
                                    <Button
                                      onClick={() => handleApprove(university)}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle2 className="mr-1 h-4 w-4" />
                                      Approve
                                    </Button>

                                    <Button
                                      onClick={() => {
                                        setSelectedUniversity(university);
                                        setRejectionDialogOpen(true);
                                      }}
                                      size="sm"
                                      variant="destructive"
                                    >
                                      <XCircle className="mr-1 h-4 w-4" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Credentials Tab */}
            <TabsContent value="credentials" className="space-y-6">
              {!showForm && (
                <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Certificate
                    </CardTitle>
                    <CardDescription>
                      Upload a degree certificate image for AI-powered extraction
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-muted rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/5"
                    >
                      {isExtracting ? (
                        <>
                          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                          <p className="text-sm text-foreground font-medium mb-2">
                            Extracting credential data...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            AI is analyzing the certificate
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Click to upload or drag & drop certificate image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supports: JPG, PNG (Max 5MB)
                          </p>
                        </>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or use demo mode
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleSimulateExtraction}
                      disabled={isExtracting}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Load Demo Data
                    </Button>
                  </CardContent>
                </Card>
              )}

              {showForm && (
                <div className="space-y-6">
                  {uploadedImage && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ImageIcon className="h-5 w-5" />
                          Uploaded Certificate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img
                          src={uploadedImage}
                          alt="Uploaded certificate"
                          className="w-full rounded-lg border border-border"
                        />
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5" />
                        Credential Details
                      </CardTitle>
                      <CardDescription>
                        Review and edit the extracted credential information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student_name">Student Name</Label>
                          <Input
                            id="student_name"
                            value={credentialData.student_name}
                            onChange={(e) => handleInputChange('student_name', e.target.value)}
                            placeholder="Enter student name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="university_name">University</Label>
                          <Input
                            id="university_name"
                            value={credentialData.university_name}
                            onChange={(e) =>
                              handleInputChange('university_name', e.target.value)
                            }
                            placeholder="Enter university name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="degree_type">Degree Type</Label>
                          <Input
                            id="degree_type"
                            value={credentialData.degree_type}
                            onChange={(e) => handleInputChange('degree_type', e.target.value)}
                            placeholder="e.g., Bachelor of Science"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="major">Major</Label>
                          <Input
                            id="major"
                            value={credentialData.major}
                            onChange={(e) => handleInputChange('major', e.target.value)}
                            placeholder="e.g., Computer Science"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gpa">GPA</Label>
                          <Input
                            id="gpa"
                            value={credentialData.gpa}
                            onChange={(e) => handleInputChange('gpa', e.target.value)}
                            placeholder="e.g., 3.9"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="graduation_date">Graduation Year</Label>
                          <Input
                            id="graduation_date"
                            value={credentialData.graduation_date}
                            onChange={(e) =>
                              handleInputChange('graduation_date', e.target.value)
                            }
                            placeholder="e.g., 2023"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={handleIssue}
                          disabled={isIssuing}
                          className="flex-1"
                          size="lg"
                        >
                          {isIssuing ? (
                            <>
                              <Wallet className="mr-2 h-5 w-5 animate-pulse" />
                              Issuing...
                            </>
                          ) : (
                            <>
                              <Wallet className="mr-2 h-5 w-5" />
                              Issue Credential
                            </>
                          )}
                        </Button>

                        <Button onClick={handleCancel} variant="outline" size="lg">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* University Details Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>University Details</DialogTitle>
            <DialogDescription>
              Review the registration information below
            </DialogDescription>
          </DialogHeader>

          {selectedUniversity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Legal Name</p>
                  <p className="text-base font-semibold">{selectedUniversity.legal_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-base font-semibold">{selectedUniversity.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">State</p>
                  <p className="text-base">{selectedUniversity.state}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-base">
                    {getStatusBadge(selectedUniversity.verification_status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Website Domain</p>
                  <p className="text-base break-all">{selectedUniversity.website_domain}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registrar Email</p>
                  <p className="text-base break-all">
                    {selectedUniversity.registrar_official_email}
                  </p>
                </div>
                {selectedUniversity.ugc_reference && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">UGC Reference</p>
                    <p className="text-base">{selectedUniversity.ugc_reference}</p>
                  </div>
                )}
                {selectedUniversity.aishe_code && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AISHE Code</p>
                    <p className="text-base">{selectedUniversity.aishe_code}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
                  <p className="text-base break-all font-mono text-xs">
                    {selectedUniversity.wallet_address}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setApprovalDialogOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this university registration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-20"
            />
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setRejectionDialogOpen(false);
                setRejectionReason('');
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedUniversity && handleReject(selectedUniversity)}
              variant="destructive"
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
