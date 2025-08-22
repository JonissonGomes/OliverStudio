import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CheckCircle } from 'lucide-react';

const RegisterSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Camera className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Oliver Studio</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gerenciamento</p>
        </div>

        <Card className="animate-slide-up shadow-soft">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">Conta criada!</CardTitle>
            <CardDescription className="text-base">
              Sua conta foi criada e está aguardando aprovação do administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-center">
                <h3 className="font-medium text-amber-900 mb-1">
                  Aguardando aprovação
                </h3>
                <p className="text-sm text-amber-700">
                  Assim que sua conta for aprovada, você poderá acessar o sistema normalmente.
                </p>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link to="/app/login">
                Ir para Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterSuccess;