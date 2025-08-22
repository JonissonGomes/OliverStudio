import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();

  if (isAuthenticated) {
		return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Oliver Estudios CRM",
        });
      } else {
        toast({
          title: "Erro no login",
          description: result.error || "Email ou senha incorretos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Camera className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Oliver Estudios</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gerenciamento</p>
        </div>

        <Card className="animate-slide-up shadow-soft">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-right">
                <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="text-sm text-primary underline">Esqueceu a senha?</button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Recuperar senha</DialogTitle>
											<DialogDescription>Contate o administrador para redefinição de senha.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
											<Button type="button" onClick={() => setForgotOpen(false)}>Fechar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Não tem uma conta?{' '}
            <Link to="/app/register" className="text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;