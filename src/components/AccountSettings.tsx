
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, User, Shield, Mail, Key } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

const AccountSettings = () => {
  const { user, updateUserEmail } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Fetch user profile
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGSQL_ERROR_NO_ROWS') {
          console.error("Error fetching user profile:", error);
          toast({
            title: "Error fetching profile",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        
        // If no profile exists, create one
        if (!data) {
          const newProfile = {
            user_id: user.id,
            full_name: user.user_metadata?.full_name || '',
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert(newProfile)
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating user profile:", createError);
            toast({
              title: "Error creating profile",
              description: createError.message,
              variant: "destructive",
            });
            throw createError;
          }
          
          return createdProfile as UserProfile;
        }
        
        return data as UserProfile;
      } catch (err) {
        console.error("Profile fetch error:", err);
        throw err;
      }
    },
    enabled: !!user?.id,
    retry: 1,
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
  
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    
    if (userProfile?.full_name) {
      setFullName(userProfile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user, userProfile]);

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate password strength
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    
    return "";
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const { data, error } = await supabase.auth.updateUser({ 
        email: email 
      });
      
      if (error) throw error;
      
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your email to confirm the change",
      });
      
      if (updateUserEmail) {
        updateUserEmail(email);
      }
      
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordError('');
    
    try {
      const { data, error } = await supabase.auth.updateUser({ 
        password: password 
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed",
      });
      
      setPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    if (!fullName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      setIsUpdatingProfile(false);
      return;
    }
    
    try {
      await updateProfileMutation.mutateAsync({
        full_name: fullName,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0 bg-white">
        <CardHeader className="bg-scanmatch-50 rounded-t-lg">
          <CardTitle className="flex items-center text-scanmatch-800">
            <User className="h-5 w-5 mr-2 text-scanmatch-600" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="border-gray-300 focus:border-scanmatch-500 focus:ring-scanmatch-500"
                aria-label="Full name"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isUpdatingProfile || !fullName.trim() || (fullName === userProfile?.full_name)}
              className="bg-scanmatch-600 hover:bg-scanmatch-700"
              aria-label="Update profile information"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="shadow-md border-0 bg-white">
        <CardHeader className="bg-scanmatch-50 rounded-t-lg">
          <CardTitle className="flex items-center text-scanmatch-800">
            <Mail className="h-5 w-5 mr-2 text-scanmatch-600" />
            Account Information
          </CardTitle>
          <CardDescription>
            Update your account email address
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="border-gray-300 focus:border-scanmatch-500 focus:ring-scanmatch-500"
                aria-label="Email address"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isUpdating || !user || !isValidEmail(email) || email === user.email}
              className="bg-scanmatch-600 hover:bg-scanmatch-700"
              aria-label="Update email"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Email'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="shadow-md border-0 bg-white">
        <CardHeader className="bg-scanmatch-50 rounded-t-lg">
          <CardTitle className="flex items-center text-scanmatch-800">
            <Shield className="h-5 w-5 mr-2 text-scanmatch-600" />
            Account Security
          </CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {passwordError && (
              <Alert variant="destructive" className="text-sm py-2">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter new password"
                className="border-gray-300 focus:border-scanmatch-500 focus:ring-scanmatch-500"
                aria-label="New password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Confirm new password"
                className="border-gray-300 focus:border-scanmatch-500 focus:ring-scanmatch-500"
                aria-label="Confirm new password"
              />
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Password must:</p>
              <ul className="list-disc pl-5">
                <li>Be at least 8 characters long</li>
                <li>Include at least one uppercase letter</li>
                <li>Include at least one lowercase letter</li>
                <li>Include at least one number</li>
              </ul>
            </div>
            <Button 
              type="submit" 
              disabled={isChangingPassword || !password || password !== confirmPassword}
              className="bg-scanmatch-600 hover:bg-scanmatch-700"
              aria-label="Change password"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
