import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  
  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("rfid_token", data.token);
        localStorage.setItem("rfid_username", data.username);
        setLocation("/");
      },
      onError: (error) => {
        toast({
          title: "Authentication Failed",
          description: error.data?.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("rfid_token", data.token);
        localStorage.setItem("rfid_username", data.username);
        setLocation("/");
      },
      onError: (error) => {
        toast({
          title: "Registration Failed",
          description: error.data?.error || "Could not register user",
          variant: "destructive",
        });
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    if (activeTab === "login") {
      loginMutation.mutate({ data: values });
    } else {
      registerMutation.mutate({ data: values });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen w-full flex bg-background dark text-foreground items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <Scan className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">RFID Tracking System</h1>
          <p className="text-muted-foreground flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Authorized Personnel Only
          </p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-background">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operator ID / Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} className="bg-background" data-testid="input-username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passcode</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} className="bg-background" data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit">
                      {isPending ? "Authenticating..." : activeTab === "login" ? "Initialize Session" : "Create Operator ID"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Tabs>
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Sys_ver: 0.1.0 | Status: Online</p>
        </div>
      </div>
    </div>
  );
}
