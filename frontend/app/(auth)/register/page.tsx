// app/(auth)/register/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from '@/components/forms/register-form';

export default function RegisterPage() {
 return (
   <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
     <Card className="w-full max-w-md">
       <CardHeader className="space-y-1">
         <CardTitle className="text-2xl font-bold text-center">Zenit</CardTitle>
         <CardDescription className="text-center">
           Crie sua conta
         </CardDescription>
       </CardHeader>
       <CardContent>
         <RegisterForm />
       </CardContent>
     </Card>
   </div>
 );
}